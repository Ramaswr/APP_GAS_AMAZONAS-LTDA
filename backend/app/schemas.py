from datetime import datetime
from typing import List, Literal

from pydantic import BaseModel, EmailStr, Field, validator


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
    payment_method: str | None = Field(default=None, max_length=50)


class OrderRead(BaseModel):
    id: int
    user_id: int
    total_value: float
    payment_method: str | None = None
    status: str
    created_at: datetime
    items: List[OrderItemRead]
    user: UserRead | None = None
    assigned_deliverer: "DelivererRead" | None = None
    tracking_points: List["TrackingPoint"] | None = None
    invoice_number: str | None = None
    invoice_url: str | None = None
    proofs: List["ProofRead"] = []

    class Config:
        from_attributes = True


class PurchaseResponse(BaseModel):
    order_id: int
    total_value: float
    status: str
    payment_method: str | None = None


class DelivererBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    phone: str | None = None
    document: str | None = None


class DelivererCreate(DelivererBase):
    pass


class DelivererRead(DelivererBase):
    id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class OrderAssignment(BaseModel):
    deliverer_id: int


class TrackingPoint(BaseModel):
    latitude: float
    longitude: float
    accuracy: float | None = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class OrderStatusUpdate(BaseModel):
    status: Literal["PENDING", "CONFIRMED", "ASSIGNED", "IN_ROUTE", "DELIVERED", "CANCELLED"]
    invoice_number: str | None = None
    invoice_url: str | None = None


class ProofCreate(BaseModel):
    kind: Literal["PHOTO", "SIGNATURE", "NOTE"]
    payload_url: str | None = None
    note: str | None = None

    @validator("payload_url", always=True)
    def validate_payload(cls, value, values):
        kind = values.get("kind")
        if kind in {"PHOTO", "SIGNATURE"} and not value:
            raise ValueError("payload_url é obrigatório para fotos ou assinaturas")
        return value


class ProofRead(ProofCreate):
    id: int
    signed_at: datetime

    class Config:
        from_attributes = True


class DashboardSummary(BaseModel):
    total_orders: int
    delivered_orders: int
    active_orders: int
    pending_orders: int
    active_deliverers: int
