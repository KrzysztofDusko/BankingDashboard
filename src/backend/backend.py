from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta, timezone
import jwt
import random

app = FastAPI()
security = HTTPBearer()
SECRET_KEY = "your-secret-key-here"  # In production, use environment variable
ALGORITHM = "HS256"

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def create_jwt_token(data: dict):
    expiration = datetime.now(timezone.utc) + timedelta(hours=24)
    data.update({"exp": expiration})
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

def verify_jwt_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def generate_dashboard_data():
    current_date = datetime.now()
    
    return {
        "mortgage": {
            "balance": 350000,
            "paidPercentage": 35,
            "recentPayments": [
                {
                    "number": 123 - i,
                    "amount": 2456.78,
                    "date": (current_date - timedelta(days=i)).strftime("%d.%m.%Y")
                } for i in range(3)
            ]
        },
        "currentBalance": {
            "amount": round(random.uniform(14000, 16000), 2),
            "change": round(random.uniform(1, 3), 1),
            "pieChart": {
                "labels": ["Fixed Expenses", "Savings", "Current Expenses"],
                "data": [4000, 6000, 5420]
            }
        },
        "investments": {
            "amount": 45000,
            "profit": round(random.uniform(4, 6), 1),
            "lineChart": {
                "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                "data": [38000, 39500, 41000, 42500, 44000, 45000]
            }
        },
        "creditCards": {
            "active": 2,
            "limit": 20000,
            "used": round(random.uniform(7000, 9000), 2)
        },
        "savings": {
            "current": round(random.uniform(28000, 29000), 2),
            "goal": 50000
        },
        "transactions": {
            "count": random.randint(10, 15),
            "period": "This month",
            "history": [
                {
                    "title": "Grocery Shopping",
                    "amount": -156.78,
                    "date": (current_date - timedelta(days=0)).strftime("%Y-%m-%d"),
                    "category": "shopping"
                },
                {
                    "title": "Transfer from John K.",
                    "amount": 1500.00,
                    "date": (current_date - timedelta(days=1)).strftime("%Y-%m-%d"),
                    "category": "transfer"
                },
                {
                    "title": "Netflix",
                    "amount": -54.99,
                    "date": (current_date - timedelta(days=1)).strftime("%Y-%m-%d"),
                    "category": "entertainment"
                },
                {
                    "title": "Train Ticket",
                    "amount": -158.00,
                    "date": (current_date - timedelta(days=2)).strftime("%Y-%m-%d"),
                    "category": "transport"
                },
                {
                    "title": "Salary",
                    "amount": 7500.00,
                    "date": (current_date - timedelta(days=5)).strftime("%Y-%m-%d"),
                    "category": "salary"
                }
            ]
        },
        "insurance": {
            "active": 3,
            "nextPayment": "15.05"
        },
        "notifications": {
            "count": random.randint(2, 5),
            "lastUpdate": "2h ago",
            "messages": [
                {
                    "title": "Incoming Transfer",
                    "message": "Received transfer: 1500 PLN from John Smith",
                    "time": "2 hours ago",
                    "type": "success"
                },
                {
                    "title": "Upcoming Payment",
                    "message": "Mortgage payment for May: 2456.78 PLN",
                    "time": "4 hours ago",
                    "type": "warning"
                },
                {
                    "title": "Login Alert",
                    "message": "New login from unknown device",
                    "time": "yesterday",
                    "type": "danger"
                },
                {
                    "title": "Promotion",
                    "message": "New deposit offer: 8% for 6 months",
                    "time": "2 days ago",
                    "type": "info"
                }
            ]
        },
        "tasks": {
            "pending": random.randint(1, 4),
            "status": "To do"
        }
    }

@app.post("/api/login")
async def login(credentials: dict):
    if credentials.get("username") == "user" and credentials.get("password") == "password":
        token_data = {
            "sub": credentials["username"],
            "name": "John Smith",
            "iat": datetime.now(timezone.utc)
        }
        token = create_jwt_token(token_data)
        return {
            "status": "success",
            "access_token": token,
            "token_type": "bearer",
            "username": "John Smith"
        }
    return {"status": "error", "message": "Invalid credentials"}

@app.get("/api/dashboard")
async def get_dashboard(payload = Depends(verify_jwt_token)):
    return generate_dashboard_data()
