# AI Nutrition & Meal Intelligence System (NutriMind AI)

An AI-powered meal analysis and dietary tracking system built using FastAPI, MySQL, React, spaCy, and Hugging Face Vision Transformers. The application enables users to track their daily nutrition through computer vision image recognition, natural language text processing, and manual logging, providing real-time rule-based healthcare recommendations.

---

## 🚀 Features
- **Computer Vision Meal Classifier:** Classify uploaded food photos using a fine-tuned Hugging Face ViT model (`nateraw/food`), returning calories, macronutrients, and prediction confidence.
- **NLP Text Parser:** Extract multiple food entities from raw sentence logs (e.g. *"I ate rice, egg and chicken curry"*) using spaCy's `PhraseMatcher` with regex boundaries fallback.
- **Nutrition Analytics Dashboard:** Responsive UI displaying daily calorie counts, macronutrient ratios (Recharts Pie), weekly intake history (Recharts Bar), and recent logs.
- **Intelligent Recommendations:** Personalized rule-based healthcare advice derived from daily nutritional ratios (calorie limits, fat limits, protein baselines).
- **Manual Data Log:** Fallback manual form to check and commit food logs directly into the database.

---

## 🛠️ Technology Stack
- **Backend Framework:** FastAPI (Python 3.10+)
- **Database Layer:** MySQL (via SQLAlchemy & PyMySQL) with automatic SQLite fallback
- **Natural Language Processing:** spaCy (`en_core_web_sm` model)
- **Computer Vision Pipeline:** Hugging Face `transformers` & `Pillow`
- **Frontend Framework:** React 19 + Vite 8
- **UI Components:** Vanilla CSS + Tailwind CSS v3 (glassmorphic theme, dark mode grid)
- **Visual Analytics:** Recharts & Lucide React Icons

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=ai_nutrition
SECRET_KEY=mysecretkey
```

---

## 🔧 Installation & Setup

### 1. Database Setup
1. Start your local MySQL instance (e.g. XAMPP, WampServer, or native MySQL service). (Optional: If MySQL is not running, the system will automatically fallback to an embedded SQLite database).
2. Create the target database:
   ```sql
   CREATE DATABASE IF NOT EXISTS ai_nutrition;
   ```
   *Note: FastAPI automatically synchronizes and creates all required tables (`users` and `food_logs`) on startup.*

### 2. Backend Server Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # On Linux/macOS:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Download the required spaCy model pipeline:
   ```bash
   python -m spacy download en_core_web_sm
   ```

### 3. Frontend Client Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```

---

## 🏃 Running the Application

### Launch FastAPI Backend
From the `backend/` directory (with virtual environment active):
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- API root: `http://localhost:8000/`
- Interactive Swagger documentation: `http://localhost:8000/docs`

### Launch React Frontend
From the `frontend/` directory:
```bash
npm run dev
```
- Client interface local url: `http://localhost:5173/`

---

## 🧪 Integration Testing
Verify the backend services, database operations, and AI classifiers by running the integration tests:
```bash
cd backend
.\venv\Scripts\python test_backend.py
```

---

## 📡 API Endpoints

### 🔐 Authentication
- `POST /register` - Register a new user profile. Validates email uniqueness (`409 Conflict`).
- `POST /login` - Log the user in. Rejects bad credentials (`401 Unauthorized`).

### 🥗 Food Logging & History
- `POST /food` - Log a manual food item. Looks up nutrients in the CSV dataset.
- `GET /food/history/{user_id}` - Fetch all food logs for a specific user ID.
- `GET /food/profile/{user_id}` - Fetch detailed profile analytics and aggregated nutritional stats.
- `POST /food/text` - Parse food entities from unstructured text and log them.
- `POST /food/image` - Analyze a multipart image file, classify the food type, and log it.

### 📊 Recommendations & Dashboard
- `GET /analytics/{user_id}` - Get daily caloric and macronutrient totals.
- `GET /recommendation/{user_id}` - Fetch personalized healthcare recommendations.
- `GET /dashboard/{user_id}` - Combined response containing analytics, recent logs, and recommendations.

---

## 🧠 AI Pipeline Architectures
1. **spaCy Entity Parser:** Uses a compiled `PhraseMatcher` matching lowercase lemmatized tokens against the cleaned food names database. Fallback regex checks for substring and word boundary matches.
2. **Vision Model:** Uses the Hugging Face Pipeline API to load the `nateraw/food` Vision Transformer. Fits image bytes, yields labels, normalizes labels, and joins with the nutrition database. Unknown results default safely to zero-values while retaining the predicted label.
3. **Recommendation Engine:** Rule-based algorithm checking cumulative daily totals against thresholds (Calories: 2500 kcal, Protein: 50g, Lipids: 80g).

---

## 🏫 Affiliation
- **University:** United International University
- **Team Name:** AI-LIEN