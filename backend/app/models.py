from datetime import datetime
from sqlalchemy import Column, DateTime, Enum, Float, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    orders = relationship("Order", back_populates="user")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total_value = Column(Float, nullable=False)
    payment_method = Column(String(50), nullable=True)
    status = Column(
        Enum(
            "PENDING",
            "CONFIRMED",
            "ASSIGNED",
            "IN_ROUTE",
            "DELIVERED",
            "CANCELLED",
            name="order_status",
        ),
        default="PENDING",
    )
    created_at = Column(DateTime, default=datetime.utcnow)
    assigned_deliverer_id = Column(Integer, ForeignKey("deliverers.id"), nullable=True)
    tracking_points = Column(JSON, default=list)
    invoice_number = Column(String(80), nullable=True)
    invoice_url = Column(String(255), nullable=True)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    assigned_deliverer = relationship("Deliverer", back_populates="orders")
    proofs = relationship("ProofOfDelivery", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(String(50), nullable=False)
    product_name = Column(String(120), nullable=False)
    unit_price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False)

    order = relationship("Order", back_populates="items")


class Deliverer(Base):
    __tablename__ = "deliverers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    phone = Column(String(30), nullable=True)
    document = Column(String(30), nullable=True)
    status = Column(Enum("AVAILABLE", "IN_ROUTE", "OFFLINE", name="deliverer_status"), default="AVAILABLE")
    created_at = Column(DateTime, default=datetime.utcnow)

    orders = relationship("Order", back_populates="assigned_deliverer")


class ProofOfDelivery(Base):
    __tablename__ = "proofs_of_delivery"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    kind = Column(Enum("PHOTO", "SIGNATURE", "NOTE", name="proof_type"), nullable=False)
    payload_url = Column(String(255), nullable=True)
    note = Column(String(255), nullable=True)
    signed_at = Column(DateTime, default=datetime.utcnow)

    order = relationship("Order", back_populates="proofs")
