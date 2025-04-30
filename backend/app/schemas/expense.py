from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ExpenseBase(BaseModel):
    amount: float
    category: str
    description: Optional[str]

    model_config = {
        "from_attributes": True
    }

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseResponse(ExpenseBase):
    id: int
    date: datetime
    user_id: int
