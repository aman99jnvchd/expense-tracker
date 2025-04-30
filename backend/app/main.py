from fastapi import FastAPI
from app.routes import user, expense
from app.init_db import init_db

init_db()  # Initialize DB tables at startup
app = FastAPI(title="Expense Tracker")

app.include_router(user.router)
app.include_router(expense.router)

@app.get("/")
def root():
    return {"message": "Welcome to Expense Tracker"}



# --- Custom OpenAPI schema to support manual JWT entry and to fix Swagger UI ---
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware

# Optional CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Expense Tracker API",
        version="1.0.0",
        description="Track your expenses securely with FastAPI and JWT.",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }
    for path in openapi_schema["paths"].values():
        for method in path.values():
            method["security"] = [{"BearerAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi
