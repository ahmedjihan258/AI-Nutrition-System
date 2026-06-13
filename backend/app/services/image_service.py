from sqlalchemy.orm import Session
import re
from app.ai_models.food_classifier import classify_image
from app.services.nutrition_service import get_nutrition, calculate_proportional_nutrition
from app.services.nlp_service import parse_number, normalize_unit
from app.models.food_model import FoodLog

# Pretrained Food-101 label mapping layer for Bangladeshi/standard food equivalence
IMAGE_MAP = {
    "fried_rice": "biryani",
    "omelette": "egg",
    "hamburger": "burger",
    "soup": "dal",
    "fish_and_chips": "fish curry",
    "grilled_salmon": "fish curry",
    "steak": "beef steak"
}

def parse_quantity_str(qty_str: str):
    """
    Parses a quantity string (e.g. '2 slices', '300g', 'one piece')
    into quantity (float) and unit (str).
    """
    if not qty_str:
        return 1.0, "serving"
        
    qty_str_lower = qty_str.lower().strip()
    num_pattern = r"(\d+(?:\.\d+)?|\bone\b|\btwo\b|\bthree\b|\bfour\b|\bfive\b)"
    unit_pattern = r"(g|gram|grams|kg|piece|pieces|egg|eggs|plate|plates|bowl|bowls|cup|cups|serving|servings|slice|slices)"
    
    match_num = re.search(num_pattern, qty_str_lower)
    num = parse_number(match_num.group(1)) if match_num else 1.0
    
    match_unit = re.search(unit_pattern, qty_str_lower)
    unit = normalize_unit(match_unit.group(1)) if match_unit else "serving"
    
    return num, unit

def process_food_image(db: Session, user_id: int, image_bytes: bytes, quantity_str: str = None):
    """
    Classifies a food image, maps it to local foods, calculates portion nutrition,
    saves the log entry, and returns detailed reports.
    """
    predictions = classify_image(image_bytes)
    if not predictions:
        raise ValueError("Could not classify the image.")
        
    top_pred = predictions[0]
    raw_label = top_pred["label"]
    confidence = float(top_pred["score"])
    
    # Apply Food-101 image mapping layer
    if raw_label in IMAGE_MAP:
        mapped_name = IMAGE_MAP[raw_label]
    else:
        mapped_name = raw_label.replace("_", " ").strip().lower()
        
    # Get base nutrition per 100g
    base_nutrition = get_nutrition(mapped_name)
    if not base_nutrition:
        # Fallback to zero values if not in database
        base_nutrition = {
            "food_name": mapped_name,
            "calories": 0.0,
            "protein": 0.0,
            "carbs": 0.0,
            "fat": 0.0
        }
        
    # Parse optional quantity parameter
    qty, unit = parse_quantity_str(quantity_str)
    
    # Calculate scaled macro nutrients based on portion
    prop_nutrition = calculate_proportional_nutrition(mapped_name, qty, unit, base_nutrition)
    
    # Save food log entry to database
    food_log = FoodLog(
        user_id=user_id,
        food_name=mapped_name,
        calories=prop_nutrition["calories"],
        protein=prop_nutrition["protein"],
        carbs=prop_nutrition["carbs"],
        fat=prop_nutrition["fat"]
    )
    db.add(food_log)
    db.commit()
    db.refresh(food_log)
    
    return {
        "food": mapped_name,
        "calories": prop_nutrition["calories"],
        "protein": prop_nutrition["protein"],
        "carbs": prop_nutrition["carbs"],
        "fat": prop_nutrition["fat"],
        "raw_prediction": raw_label,
        "mapped_food": mapped_name,
        "confidence": confidence,
        "nutrition": {
            "calories": prop_nutrition["calories"],
            "protein": prop_nutrition["protein"],
            "carbs": prop_nutrition["carbs"],
            "fat": prop_nutrition["fat"]
        }
    }
