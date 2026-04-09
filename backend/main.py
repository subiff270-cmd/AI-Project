from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import auth, expenses, insights

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Expense Tracker",
    description="Smart expense tracking with AI-powered insights",
    version="1.0.0",
)

from fastapi.responses import JSONResponse
import traceback
from fastapi import Request

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}\n{traceback.format_exc()}"}
    )

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(expenses.router)
app.include_router(insights.router)


@app.get("/")
def root():
    return {"message": "AI Expense Tracker API", "version": "1.0.0"}
