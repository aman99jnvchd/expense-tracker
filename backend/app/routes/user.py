from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import database
from app import models
from app import schemas
from app.auth.password_handler import hash_password, verify_password
from app.auth.jwt_handler import create_access_token

router = APIRouter(prefix="/users", tags=["Users"])

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter((models.User.username == user.username) | (models.User.email == user.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already exists")
    new_user = models.User(
        username=user.username,
        email=user.email,
        password=hash_password(user.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    token = create_access_token(data={"sub": db_user.username})
    return {"access_token": token, "token_type": "bearer"}

@router.post("/logout")
def logout():
    return {"message": "Logout endpoint (handled on client side by deleting token)"}
