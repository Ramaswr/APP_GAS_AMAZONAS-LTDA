from datetime import datetime
from typing import List

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserRead(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class OrderItemBase(BaseModel):
    product_id: str
    product_name: str
    unit_price: float = Field(..., gt=0)
    quantity: int = Field(..., gt=0)


class OrderItemRead(OrderItemBase):
    id: int

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    user_email: EmailStr
    items: List[OrderItemBase]


class OrderRead(BaseModel):
    id: int
    user_id: int
    total_value: float
    status: str
    created_at: datetime
    items: List[OrderItemRead]
    user: UserRead | None = None

    class Config:
        from_attributes = True


class PurchaseResponse(BaseModel):
    order_id: int
    total_value: float
    status: str
