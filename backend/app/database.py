from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import DB_HOST, DB_USER, DB_PASSWORD, DB_NAME

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"

# Try to connect to MySQL database, fallback to SQLite if connection fails
engine = None
try:
    if DB_HOST and DB_USER and DB_NAME:
        engine = create_engine(DATABASE_URL, connect_args={"connect_timeout": 3})
        # Force a test connection to verify DB is up and credentials are correct
        with engine.connect() as conn:
            pass
        print(f"[Database] Connected to MySQL database at {DB_HOST}")
except Exception as e:
    print(f"[Database] MySQL connection failed: {e}")
    engine = None

if engine is None:
    print("[Database] Falling back to local SQLite database: ai_nutrition.db")
    DATABASE_URL = "sqlite:///./ai_nutrition.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()