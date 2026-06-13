from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.food_model import FoodLog
from app.schemas.food_schema import (
    FoodLogCreate, FoodLogResponse,
    FoodTextRequest, FoodTextResponse, NutritionSummaryText, FoodTextItem,
    FoodImageResponse, ProfileResponse
)
from app.services.nutrition_service import get_nutrition, calculate_proportional_nutrition
from app.services.nlp_service import extract_foods_with_quantities
from app.services.image_service import process_food_image

router = APIRouter(prefix="/food", tags=["Food"])

@router.post("", response_model=FoodLogResponse)
def create_food_log(food_in: FoodLogCreate, db: Session = Depends(get_db)):
    """
    Look up nutrition information for a food name, support portion strings
    (e.g., '200g rice' or just 'rice'), scale values proportionally, and save.
    """
    # Try parsing portion strings from manual input if they contain numbers
    parsed = extract_foods_with_quantities(food_in.food_name)
    if parsed:
        item = parsed[0]
        food_name = item["food_name"]
        qty = item["quantity"]
        unit = item["unit"]
    else:
        food_name = food_in.food_name
        qty = 1.0
        unit = "serving"
        
    nutrition = get_nutrition(food_name)
    if not nutrition:
        raise HTTPException(
            status_code=404,
            detail=f"Food '{food_name}' not found in the nutrition dataset."
        )
        
    prop_nutrition = calculate_proportional_nutrition(food_name, qty, unit, nutrition)
    
    db_log = FoodLog(
        user_id=food_in.user_id,
        food_name=food_name,
        calories=prop_nutrition["calories"],
        protein=prop_nutrition["protein"],
        carbs=prop_nutrition["carbs"],
        fat=prop_nutrition["fat"]
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

@router.get("/history/{user_id}", response_model=List[FoodLogResponse])
def get_food_history(user_id: int, db: Session = Depends(get_db)):
    """
    Get all food logs for a user, sorted by the latest timestamp.
    """
    logs = db.query(FoodLog).filter(FoodLog.user_id == user_id).order_by(FoodLog.timestamp.desc()).all()
    return logs

@router.post("/text", response_model=FoodTextResponse)
def log_food_from_text(payload: FoodTextRequest, db: Session = Depends(get_db)):
    """
    Extract foods and quantities from text, scale their macros proportionally,
    save logs, and return structured portions and aggregate metrics.
    """
    extracted_items = extract_foods_with_quantities(payload.text)
    
    logged_foods = []
    foods_details = []
    total_calories = 0.0
    total_protein = 0.0
    total_carbs = 0.0
    total_fat = 0.0
    
    for item in extracted_items:
        food_name = item["food_name"]
        qty = item["quantity"]
        unit = item["unit"]
        
        nutrition = get_nutrition(food_name)
        if nutrition:
            prop = calculate_proportional_nutrition(food_name, qty, unit, nutrition)
            
            db_log = FoodLog(
                user_id=payload.user_id,
                food_name=food_name,
                calories=prop["calories"],
                protein=prop["protein"],
                carbs=prop["carbs"],
                fat=prop["fat"]
            )
            db.add(db_log)
            logged_foods.append(db_log)
            
            total_calories += prop["calories"]
            total_protein += prop["protein"]
            total_carbs += prop["carbs"]
            total_fat += prop["fat"]
            
            if unit == "piece":
                qty_str = str(int(qty)) if qty.is_integer() else str(qty)
            elif unit == "serving":
                qty_val = int(qty) if qty.is_integer() else qty
                qty_str = f"{qty_val} serving"
            elif unit == "g":
                qty_val = int(qty) if qty.is_integer() else qty
                qty_str = f"{qty_val}g"
            else:
                qty_val = int(qty) if qty.is_integer() else qty
                qty_str = f"{qty_val} {unit}"
                
            foods_details.append(FoodTextItem(
                food_name=food_name,
                food=food_name,
                quantity=qty_str,
                calories=prop["calories"],
                protein=prop["protein"],
                carbs=prop["carbs"],
                fat=prop["fat"]
            ))
            
    if logged_foods:
        db.commit()
        for log in logged_foods:
            db.refresh(log)
            
    summary = NutritionSummaryText(
        calories=round(total_calories, 2),
        protein=round(total_protein, 2),
        carbs=round(total_carbs, 2),
        fat=round(total_fat, 2)
    )
    
    return FoodTextResponse(
        foods=foods_details,
        nutrition_summary=summary
    )

@router.post("/image", response_model=FoodImageResponse)
async def log_food_from_image(
    user_id: int = Form(...),
    quantity: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Classify an uploaded image, apply mapping layer, parse optional quantity,
    save portion-scaled log, and return classification confidence and nutrition values.
    """
    try:
        contents = await file.read()
        result = process_food_image(db, user_id, contents, quantity)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profile/{user_id}", response_model=ProfileResponse)
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    """
    Get user profile summary including name, email, joined date, meals logged count,
    average daily calorie intake, favorite food, and weekly trends.
    """
    from app.models.user_model import User
    from sqlalchemy import func
    import datetime

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Count total meals logged
    meals_count = db.query(FoodLog).filter(FoodLog.user_id == user_id).count()

    # Get earliest log timestamp or default to today
    first_log = db.query(FoodLog).filter(FoodLog.user_id == user_id).order_by(FoodLog.timestamp.asc()).first()
    if first_log:
        joined_date = first_log.timestamp.strftime("%B %Y")
    else:
        joined_date = datetime.datetime.now().strftime("%B %Y")

    # Get favorite food
    fav_query = db.query(FoodLog.food_name, func.count(FoodLog.food_name))\
                  .filter(FoodLog.user_id == user_id)\
                  .group_by(FoodLog.food_name)\
                  .order_by(func.count(FoodLog.food_name).desc())\
                  .first()
    favorite_food = fav_query[0] if fav_query else "None"

    # Get all logs to compute average daily calories and trends
    logs = db.query(FoodLog).filter(FoodLog.user_id == user_id).all()
    
    # Group by date
    daily_calories = {}
    for log in logs:
        log_date = log.timestamp.date()
        daily_calories[log_date] = daily_calories.get(log_date, 0.0) + log.calories

    if daily_calories:
        avg_calories = sum(daily_calories.values()) / len(daily_calories)
    else:
        avg_calories = 0.0

    # Weekly trends for Recharts (past 7 days)
    trends = []
    today = datetime.date.today()
    for i in range(6, -1, -1):
        day = today - datetime.timedelta(days=i)
        day_str = day.strftime("%a")
        day_logs = [log for log in logs if log.timestamp.date() == day]
        trends.append({
            "day": day_str,
            "Calories": round(sum(log.calories for log in day_logs), 2),
            "Protein": round(sum(log.protein for log in day_logs), 2),
            "Carbs": round(sum(log.carbs for log in day_logs), 2),
            "Fat": round(sum(log.fat for log in day_logs), 2)
        })

    return {
        "name": user.name,
        "email": user.email,
        "joined_date": joined_date,
        "meals_logged": meals_count,
        "average_calories": round(avg_calories, 2),
        "favorite_food": favorite_food,
        "nutrition_trends": trends
    }
