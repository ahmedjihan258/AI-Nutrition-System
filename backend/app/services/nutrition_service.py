import pandas as pd
import os
from app.config import DATASET_PATH

_df = None

# Portion mapping layer (weight in grams for 1 unit of a given food name)
PORTION_WEIGHTS = {
    "rice": {"g": 1.0, "kg": 1000.0, "plate": 300.0, "bowl": 150.0, "cup": 150.0, "serving": 100.0},
    "chicken curry": {"g": 1.0, "kg": 1000.0, "bowl": 200.0, "plate": 200.0, "serving": 100.0},
    "beef curry": {"g": 1.0, "kg": 1000.0, "bowl": 200.0, "plate": 200.0, "serving": 100.0},
    "dal": {"g": 1.0, "kg": 1000.0, "bowl": 200.0, "cup": 150.0, "serving": 100.0},
    "roti": {"piece": 40.0, "serving": 40.0},
    "chapati": {"piece": 40.0, "serving": 40.0},
    "fish curry": {"g": 1.0, "kg": 1000.0, "piece": 100.0, "serving": 100.0},
    "egg": {"piece": 50.0, "serving": 50.0},
    "apple": {"piece": 180.0, "serving": 180.0},
    "banana": {"piece": 120.0, "serving": 120.0},
    "milk": {"g": 1.0, "kg": 1000.0, "cup": 244.0, "serving": 100.0},
    "biryani": {"g": 1.0, "kg": 1000.0, "plate": 350.0, "bowl": 200.0, "serving": 100.0},
    "chicken biryani": {"g": 1.0, "kg": 1000.0, "plate": 350.0, "bowl": 200.0, "serving": 100.0},
    "mutton biryani": {"g": 1.0, "kg": 1000.0, "plate": 350.0, "bowl": 200.0, "serving": 100.0},
    "khichuri": {"g": 1.0, "kg": 1000.0, "plate": 350.0, "bowl": 200.0, "serving": 100.0},
    "fried rice": {"g": 1.0, "kg": 1000.0, "plate": 350.0, "bowl": 200.0, "serving": 100.0},
    "pizza": {"slice": 100.0, "piece": 100.0, "serving": 100.0},
    "burger": {"piece": 150.0, "serving": 150.0},
    "hamburger": {"piece": 150.0, "serving": 150.0},
    "french fries": {"g": 1.0, "kg": 1000.0, "serving": 100.0},
    "omelette": {"piece": 100.0, "serving": 100.0},
    "chicken breast": {"piece": 150.0, "serving": 150.0, "g": 1.0},
    "steak": {"piece": 200.0, "serving": 200.0, "g": 1.0},
    "beef steak": {"piece": 200.0, "serving": 200.0, "g": 1.0},
    "salmon": {"piece": 150.0, "serving": 150.0, "g": 1.0},
    "grilled salmon": {"piece": 150.0, "serving": 150.0, "g": 1.0},
    "samosa": {"piece": 50.0, "serving": 50.0},
    "singara": {"piece": 50.0, "serving": 50.0},
    "sweet": {"piece": 40.0, "serving": 40.0},
    "rasgulla": {"piece": 40.0, "serving": 40.0},
    "yogurt": {"g": 1.0, "kg": 1000.0, "cup": 200.0, "serving": 100.0},
    "oats": {"g": 1.0, "kg": 1000.0, "serving": 100.0},
    "potato": {"g": 1.0, "kg": 1000.0, "serving": 100.0},
    "orange": {"piece": 130.0, "serving": 130.0},
    "mango": {"piece": 200.0, "serving": 200.0},
    "salad": {"g": 1.0, "kg": 1000.0, "bowl": 150.0, "serving": 100.0},
}

def load_nutrition_dataset():
    """
    Loads the nutrition dataset CSV into a Pandas DataFrame.
    Caches the DataFrame in memory for subsequent calls.
    """
    global _df
    if _df is None:
        if not os.path.exists(DATASET_PATH):
            raise FileNotFoundError(f"Nutrition dataset not found at path: {DATASET_PATH}")
        _df = pd.read_csv(DATASET_PATH)
        # Normalize column names and string fields
        _df.columns = _df.columns.str.strip().str.lower()
        _df['food_name'] = _df['food_name'].astype(str).str.strip().str.lower()
    return _df

def find_food(food_name: str):
    """
    Finds foods in the dataset that match the food_name query (exact or substring).
    Returns a list of dictionaries with food details.
    """
    df = load_nutrition_dataset()
    query = food_name.strip().lower()
    
    # Exact match first
    exact_matches = df[df['food_name'] == query]
    if not exact_matches.empty:
        return exact_matches.to_dict(orient='records')
        
    # Alias match second
    if 'aliases' in df.columns:
        alias_matches = df[df['aliases'].apply(lambda x: query in [a.strip().lower() for a in str(x).split(',')] if pd.notna(x) else False)]
        if not alias_matches.empty:
            return alias_matches.to_dict(orient='records')
            
    # Substring match third
    substring_matches = df[df['food_name'].str.contains(query, case=False, na=False)]
    return substring_matches.to_dict(orient='records')

def get_nutrition(food_name: str):
    """
    Retrieves the nutrition values (calories, protein, carbs, fat) of the best matching food.
    If no match is found, returns None.
    """
    matches = find_food(food_name)
    if matches:
        best_match = matches[0]
        return {
            "food_name": best_match["food_name"],
            "calories": float(best_match["calories"]),
            "protein": float(best_match["protein"]),
            "carbs": float(best_match["carbs"]),
            "fat": float(best_match["fat"])
        }
    return None

def calculate_proportional_nutrition(food_name: str, quantity: float, unit: str, base_nutrition: dict) -> dict:
    """
    Given a food name, user quantity, user unit and the base nutrition profile (defined per 100g),
    calculates and returns the proportionally scaled nutritional values.
    """
    food_key = food_name.strip().lower()
    unit_key = unit.strip().lower()
    
    # Default unit weight is 100g (assumed 1 serving = 100g if unknown)
    unit_weight = 100.0
    
    if food_key in PORTION_WEIGHTS:
        if unit_key in PORTION_WEIGHTS[food_key]:
            unit_weight = PORTION_WEIGHTS[food_key][unit_key]
        else:
            # Fallback check for standard unit keywords if custom one isn't mapped
            if unit_key == "g":
                unit_weight = 1.0
            elif unit_key == "kg":
                unit_weight = 1000.0
            elif unit_key in ["piece", "pieces"]:
                unit_weight = PORTION_WEIGHTS[food_key].get("piece", PORTION_WEIGHTS[food_key].get("serving", 100.0))
    else:
        # Generic fallback based on unit type
        if unit_key == "g":
            unit_weight = 1.0
        elif unit_key == "kg":
            unit_weight = 1000.0
        elif unit_key in ["plate", "plates"]:
            unit_weight = 300.0
        elif unit_key in ["bowl", "bowls"]:
            unit_weight = 200.0
        elif unit_key in ["cup", "cups"]:
            unit_weight = 150.0
            
    total_weight_grams = quantity * unit_weight
    ratio = total_weight_grams / 100.0
    
    return {
        "calories": round(base_nutrition["calories"] * ratio, 2),
        "protein": round(base_nutrition["protein"] * ratio, 2),
        "carbs": round(base_nutrition["carbs"] * ratio, 2),
        "fat": round(base_nutrition["fat"] * ratio, 2),
        "weight_grams": total_weight_grams
    }
