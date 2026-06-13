from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import datetime
from typing import List

from app.database import get_db
from app.models.food_model import FoodLog
from app.models.user_model import User
from app.schemas.food_schema import (
    AnalyticsResponse,
    RecommendationResponse,
    DashboardResponse,
    GoalRemaining
)
router = APIRouter(tags=["Recommendation"])

def calculate_daily_totals(db: Session, user_id: int):
    """
    Helper function to calculate daily totals of nutrients for a user.
    """
    today_start = datetime.datetime.combine(datetime.date.today(), datetime.time.min)
    
    logs = db.query(FoodLog).filter(
        FoodLog.user_id == user_id,
        FoodLog.timestamp >= today_start
    ).all()
    
    total_calories = sum(log.calories for log in logs)
    total_protein = sum(log.protein for log in logs)
    total_carbs = sum(log.carbs for log in logs)
    total_fat = sum(log.fat for log in logs)
    
    return {
        "total_calories": round(total_calories, 2),
        "total_protein": round(total_protein, 2),
        "total_carbs": round(total_carbs, 2),
        "total_fat": round(total_fat, 2)
    }

def get_recommendations_list(totals: dict):
    """
    Helper function to generate list of actionable structured recommendations dynamically
    by querying values from the nutrition dataset.
    """
    from app.services.nutrition_service import PORTION_WEIGHTS, get_nutrition

    recommendations = []
    
    # Target guidelines
    target_cal = 2000.0
    target_protein = 140.0
    target_carbs = 230.0
    target_fat = 65.0
    
    # 1. Protein Deficit
    if totals["total_protein"] < target_protein:
        deficit = target_protein - totals["total_protein"]
        
        # Chicken Breast
        cb_nut = get_nutrition("chicken breast") or {"protein": 31.0, "calories": 165.0}
        cb_protein_pct = cb_nut["protein"] / 100.0
        qty_g = max(50, round((deficit / cb_protein_pct) / 50) * 50)
        protein_gain = round(qty_g * cb_protein_pct, 2)
        recommendations.append({
            "food": "chicken breast",
            "quantity": f"{qty_g}g",
            "protein_gain": protein_gain,
            "type": "increase",
            "description": f"Chicken Breast ({qty_g}g) | +{round(protein_gain)}g protein"
        })
        
        # Eggs
        egg_nut = get_nutrition("egg") or {"protein": 13.0, "calories": 155.0}
        egg_protein_pct = egg_nut["protein"] / 100.0
        egg_weight = PORTION_WEIGHTS.get("egg", {}).get("piece", 50.0)
        egg_protein = egg_protein_pct * egg_weight
        qty_eggs = max(1, round(deficit / egg_protein))
        protein_gain_eggs = round(qty_eggs * egg_protein, 2)
        recommendations.append({
            "food": "egg",
            "quantity": str(qty_eggs),
            "protein_gain": protein_gain_eggs,
            "type": "increase",
            "description": f"Eggs ({qty_eggs}) | +{round(protein_gain_eggs)}g protein"
        })
        
        # Fish Curry
        fc_nut = get_nutrition("fish curry") or {"protein": 14.0, "calories": 130.0}
        fc_protein_pct = fc_nut["protein"] / 100.0
        qty_fish = max(50, round((deficit / fc_protein_pct) / 50) * 50)
        protein_gain_fish = round(qty_fish * fc_protein_pct, 2)
        recommendations.append({
            "food": "fish curry",
            "quantity": f"{qty_fish}g",
            "protein_gain": protein_gain_fish,
            "type": "increase",
            "description": f"Fish Curry ({qty_fish}g) | +{round(protein_gain_fish)}g protein"
        })
        
    # 2. Calorie Surplus
    if totals["total_calories"] > target_cal:
        recommendations.append({
            "food": "Biryani, Burger, Pizza",
            "type": "reduce",
            "alternatives": ["Salad", "Fish Curry", "Chicken Breast"],
            "description": "Reduce: Biryani, Burger, Pizza | Alternatives: Salad, Fish Curry, Chicken Breast"
        })
        
    # 3. High Fat Intake
    if totals["total_fat"] > target_fat:
        recommendations.append({
            "food": "Pizza, Burger, French fries",
            "type": "reduce",
            "alternatives": ["Roti", "Chapati", "Salad", "Chicken Breast"],
            "description": "Reduce: Pizza, Burger, French fries | Alternatives: Salad, Fish Curry, Chicken Breast"
        })
        
    # 4. Calorie Deficit
    if totals["total_calories"] < target_cal:
        deficit = target_cal - totals["total_calories"]
        
        # Oats
        oats_nut = get_nutrition("oatmeal") or get_nutrition("oats") or {"calories": 389.0}
        oats_cal_pct = oats_nut["calories"] / 100.0
        qty_oats = max(50, round((deficit / oats_cal_pct) / 50) * 50)
        calorie_gain_oats = round(qty_oats * oats_cal_pct, 2)
        recommendations.append({
            "food": "oats",
            "quantity": f"{qty_oats}g",
            "calorie_gain": calorie_gain_oats,
            "type": "increase",
            "description": f"Oats ({qty_oats}g) | +{round(calorie_gain_oats)} kcal"
        })
        
        # Banana
        banana_nut = get_nutrition("banana") or {"calories": 89.0}
        banana_cal_pct = banana_nut["calories"] / 100.0
        banana_weight = PORTION_WEIGHTS.get("banana", {}).get("piece", 120.0)
        banana_calories = banana_cal_pct * banana_weight
        qty_bananas = max(1, round(deficit / banana_calories))
        calorie_gain_bananas = round(qty_bananas * banana_calories, 2)
        recommendations.append({
            "food": "banana",
            "quantity": str(qty_bananas),
            "calorie_gain": calorie_gain_bananas,
            "type": "increase",
            "description": f"Banana ({qty_bananas} pieces) | +{round(calorie_gain_bananas)} kcal"
        })
        
    # 5. Low Carb Intake
    if totals["total_carbs"] < target_carbs:
        deficit = target_carbs - totals["total_carbs"]
        
        # Roti
        roti_nut = get_nutrition("roti") or {"carbs": 24.0}
        roti_carbs_pct = roti_nut["carbs"] / 100.0
        roti_weight = PORTION_WEIGHTS.get("roti", {}).get("piece", 40.0)
        roti_carbs = roti_carbs_pct * roti_weight
        qty_roti = max(1, round(deficit / roti_carbs))
        carb_gain_roti = round(qty_roti * roti_carbs, 2)
        recommendations.append({
            "food": "roti",
            "quantity": str(qty_roti),
            "carb_gain": carb_gain_roti,
            "type": "increase",
            "description": f"Roti ({qty_roti} pieces) | +{round(carb_gain_roti)}g carbs"
        })
        
    # 6. Balanced / Fallback
    if not recommendations:
        recommendations.append({
            "food": "",
            "quantity": "",
            "type": "balanced",
            "description": "Maintain current nutrition plan"
        })
        
    return recommendations


@router.get("/analytics/{user_id}", response_model=AnalyticsResponse)
def get_daily_analytics(user_id: int, db: Session = Depends(get_db)):
    """
    Gets daily calories, protein, carbs, and fat totals for a user.
    """
    user_exists = db.query(User).filter(User.id == user_id).first()
    if not user_exists:
        raise HTTPException(status_code=404, detail="User not found in system databases.")
        
    totals = calculate_daily_totals(db, user_id)
    return AnalyticsResponse(
        total_calories=totals["total_calories"],
        total_protein=totals["total_protein"],
        total_carbs=totals["total_carbs"],
        total_fat=totals["total_fat"]
    )

@router.get("/recommendation/{user_id}", response_model=RecommendationResponse)
def get_recommendations(user_id: int, db: Session = Depends(get_db)):
    """
    Generates personalized daily nutrition recommendations for a user.
    """
    user_exists = db.query(User).filter(User.id == user_id).first()
    if not user_exists:
        raise HTTPException(status_code=404, detail="User session not found in databases.")
        
    totals = calculate_daily_totals(db, user_id)
    recs = get_recommendations_list(totals)
    return RecommendationResponse(recommendations=recs)

@router.get("/dashboard/{user_id}", response_model=DashboardResponse)
def get_dashboard_data(user_id: int, db: Session = Depends(get_db)):
    """
    Aggregates daily analytics, recent logged foods (up to 5 items),
    personalized recommendations, and remaining goals.
    """
    user_exists = db.query(User).filter(User.id == user_id).first()
    if not user_exists:
        raise HTTPException(status_code=404, detail="User account not found in system registers.")
        
    totals = calculate_daily_totals(db, user_id)
    recs = get_recommendations_list(totals)
    
    recent_logs = db.query(FoodLog).filter(
        FoodLog.user_id == user_id
    ).order_by(FoodLog.timestamp.desc()).limit(5).all()
    
    summary = AnalyticsResponse(
        total_calories=totals["total_calories"],
        total_protein=totals["total_protein"],
        total_carbs=totals["total_carbs"],
        total_fat=totals["total_fat"]
    )
    
    # Compute remaining goals (deficit calculation)
    target_cal = 2000.0
    target_protein = 140.0
    target_carbs = 230.0
    target_fat = 65.0
    
    remaining = GoalRemaining(
        calories=max(round(target_cal - totals["total_calories"], 2), 0.0),
        protein=max(round(target_protein - totals["total_protein"], 2), 0.0),
        carbs=max(round(target_carbs - totals["total_carbs"], 2), 0.0),
        fat=max(round(target_fat - totals["total_fat"], 2), 0.0)
    )
    
    return DashboardResponse(
        nutrition_summary=summary,
        recent_foods=recent_logs,
        recommendations=recs,
        remaining_goals=remaining
    )

