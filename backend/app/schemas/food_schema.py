from pydantic import BaseModel
from datetime import datetime
from typing import List, Dict

class FoodLogCreate(BaseModel):
    user_id: int
    food_name: str

class FoodLogResponse(BaseModel):
    id: int
    user_id: int
    food_name: str
    calories: float
    protein: float
    carbs: float
    fat: float
    timestamp: datetime

    class Config:
        from_attributes = True

class FoodNutrition(BaseModel):
    calories: float
    protein: float
    carbs: float
    fat: float

class FoodImageResponse(BaseModel):
    food: str
    calories: float
    protein: float
    carbs: float
    fat: float
    raw_prediction: str
    mapped_food: str
    confidence: float
    nutrition: FoodNutrition

class FoodTextRequest(BaseModel):
    user_id: int
    text: str

class NutritionSummaryText(BaseModel):
    calories: float
    protein: float
    carbs: float
    fat: float

class FoodTextItem(BaseModel):
    food_name: str
    food: str # for frontend compatibility
    quantity: str
    calories: float
    protein: float
    carbs: float
    fat: float

class FoodTextResponse(BaseModel):
    foods: List[FoodTextItem]
    nutrition_summary: NutritionSummaryText

class AnalyticsResponse(BaseModel):
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fat: float

class RecommendationResponse(BaseModel):
    recommendations: List[Dict]

class GoalRemaining(BaseModel):
    calories: float
    protein: float
    carbs: float
    fat: float

class DashboardResponse(BaseModel):
    nutrition_summary: AnalyticsResponse
    recent_foods: List[FoodLogResponse]
    recommendations: List[Dict]
    remaining_goals: GoalRemaining

class ProfileResponse(BaseModel):
    name: str
    email: str
    joined_date: str
    meals_logged: int
    average_calories: float
    favorite_food: str
    nutrition_trends: List[Dict]

