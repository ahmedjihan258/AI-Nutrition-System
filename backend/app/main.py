from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models.user_model import User
from app.models.food_model import FoodLog
from app.routes.auth import router as auth_router
from app.routes.food import router as food_router
from app.routes.recommendation import router as recommendation_router

# Automatically create database tables if they do not exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Nutrition & Meal Intelligence System API")

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(food_router)
app.include_router(recommendation_router)

@app.get("/")
def home():
    return {"message": "AI Nutrition Backend Running"}