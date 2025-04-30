from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import models
from app import schemas
from app.routes.user import get_db  # reuse get_db
from app.auth.jwt_handler import decode_access_token
from fastapi.security import OAuth2PasswordBearer
from typing import List
from datetime import datetime
from sqlalchemy import func
from fastapi import Query

router = APIRouter(prefix="/expenses", tags=["Expenses"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        print("Received token:", token)
        username = decode_access_token(token)
        print("Username:", username)

        user = db.query(models.User).filter(models.User.username == username).first()
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except Exception as e:
        print("Auth error:", str(e))
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/", response_model=schemas.ExpenseResponse)
def create_expense(expense: schemas.ExpenseCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    new_expense = models.Expense(**expense.model_dump(), user_id=current_user.id)
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense

@router.get("/", response_model=List[schemas.ExpenseResponse])
def get_expenses(
    category: str = None,
    month: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.Expense).filter(models.Expense.user_id == current_user.id)

    if category:
        query = query.filter(models.Expense.category.ilike(f"%{category}%"))

    if month:
        try:
            year, month_num = map(int, month.split("-"))
            start_date = datetime(year, month_num, 1)
            if month_num == 12:
                end_date = datetime(year + 1, 1, 1)
            else:
                end_date = datetime(year, month_num + 1, 1)
            query = query.filter(models.Expense.date >= start_date, models.Expense.date < end_date)
        except ValueError:
            raise HTTPException(status_code=400, detail="Month must be in YYYY-MM format")

    return query.order_by(models.Expense.date.desc()).all()

@router.put("/{expense_id}", response_model=schemas.ExpenseResponse)
def update_expense(
    expense_id: int,
    updated_data: schemas.ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id,
        models.Expense.user_id == current_user.id
    ).first()

    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    for key, value in updated_data.model_dump().items():
        setattr(expense, key, value)

    db.commit()
    db.refresh(expense)
    return expense

@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id,
        models.Expense.user_id == current_user.id
    ).first()

    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    db.delete(expense)
    db.commit()
    return

@router.get("/summary")
def get_expense_summary(
    group_by: str = Query("category", enum=["category", "month"]),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if group_by == "month":
        group_column = func.to_char(models.Expense.date, 'YYYY-MM')
    elif group_by == "category":
        group_column = models.Expense.category
    else:
        raise HTTPException(status_code=400, detail="Invalid group_by value")

    query = db.query(
        func.sum(models.Expense.amount).label("total"),
        group_column.label(group_by)
    ).filter(models.Expense.user_id == current_user.id).group_by(group_column)

    result = query.all()
    return [{group_by: row[1], "total": row[0]} for row in result]
