from sqlalchemy.orm import Session, selectinload
from sqlalchemy import func, select

from . import models
from .schemas import (
    DelivererCreate,
    OrderAssignment,
    OrderCreate,
    OrderStatusUpdate,
    ProofCreate,
    TrackingPoint,
    UserCreate,
)
from .security import hash_password


def create_user(db: Session, payload: UserCreate) -> models.User:
    user = models.User(
        name=payload.name,
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user_by_email(db: Session, email: str) -> models.User | None:
    stmt = select(models.User).where(models.User.email == email.lower())
    return db.scalar(stmt)


def list_users(db: Session) -> list[models.User]:
    stmt = select(models.User).order_by(models.User.created_at.desc())
    return list(db.scalars(stmt))


def create_order(db: Session, payload: OrderCreate, user: models.User) -> models.Order:
    order = models.Order(
        user_id=user.id,
        total_value=sum(item.unit_price * item.quantity for item in payload.items),
        payment_method=payload.payment_method,
    )
    db.add(order)
    db.flush()

    order_items = [
        models.OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            product_name=item.product_name,
            unit_price=item.unit_price,
            quantity=item.quantity,
        )
        for item in payload.items
    ]
    db.add_all(order_items)
    db.commit()
    db.refresh(order)
    return order


def list_orders(db: Session) -> list[models.Order]:
    stmt = (
        select(models.Order)
        .options(
            selectinload(models.Order.items),
            selectinload(models.Order.user),
            selectinload(models.Order.assigned_deliverer),
            selectinload(models.Order.proofs),
        )
        .order_by(models.Order.created_at.desc())
    )
    return list(db.scalars(stmt))


def get_order_by_id(db: Session, order_id: int) -> models.Order | None:
    stmt = (
        select(models.Order)
        .options(
            selectinload(models.Order.items),
            selectinload(models.Order.user),
            selectinload(models.Order.assigned_deliverer),
            selectinload(models.Order.proofs),
        )
        .where(models.Order.id == order_id)
    )
    return db.scalar(stmt)


def create_deliverer(db: Session, payload: DelivererCreate) -> models.Deliverer:
    deliverer = models.Deliverer(
        name=payload.name,
        email=payload.email.lower(),
        phone=payload.phone,
        document=payload.document,
    )
    db.add(deliverer)
    db.commit()
    db.refresh(deliverer)
    return deliverer


def list_deliverers(db: Session) -> list[models.Deliverer]:
    stmt = select(models.Deliverer).order_by(models.Deliverer.created_at.desc())
    return list(db.scalars(stmt))


def get_deliverer_by_id(db: Session, deliverer_id: int) -> models.Deliverer | None:
    stmt = select(models.Deliverer).where(models.Deliverer.id == deliverer_id)
    return db.scalar(stmt)


def get_deliverer_by_email(db: Session, email: str) -> models.Deliverer | None:
    stmt = select(models.Deliverer).where(models.Deliverer.email == email.lower())
    return db.scalar(stmt)


def assign_order(db: Session, order: models.Order, payload: OrderAssignment, deliverer: models.Deliverer) -> models.Order:
    order.assigned_deliverer = deliverer
    order.status = "ASSIGNED"
    deliverer.status = "IN_ROUTE"
    db.commit()
    db.refresh(order)
    return order


def append_tracking_point(db: Session, order: models.Order, payload: TrackingPoint) -> models.Order:
    points = list(order.tracking_points or [])
    points.append(payload.dict())
    order.tracking_points = points
    if order.status == "ASSIGNED":
        order.status = "IN_ROUTE"
    db.commit()
    db.refresh(order)
    return order


def update_order_status(db: Session, order: models.Order, payload: OrderStatusUpdate) -> models.Order:
    order.status = payload.status
    if payload.invoice_number:
        order.invoice_number = payload.invoice_number
    if payload.invoice_url:
        order.invoice_url = payload.invoice_url
    if payload.status == "DELIVERED" and order.assigned_deliverer:
        order.assigned_deliverer.status = "AVAILABLE"
    db.commit()
    db.refresh(order)
    return order


def record_proof(db: Session, order: models.Order, payload: ProofCreate) -> models.Order:
    proof = models.ProofOfDelivery(
        order_id=order.id,
        kind=payload.kind,
        payload_url=payload.payload_url,
        note=payload.note,
    )
    db.add(proof)
    db.commit()
    db.refresh(order)
    return order


def orders_dashboard(db: Session) -> dict[str, int]:
    total_orders = db.scalar(select(func.count()).select_from(models.Order)) or 0
    delivered = db.scalar(
        select(func.count()).select_from(models.Order).where(models.Order.status == "DELIVERED")
    ) or 0
    pending = db.scalar(
        select(func.count()).select_from(models.Order).where(models.Order.status == "PENDING")
    ) or 0
    active = db.scalar(
        select(func.count()).select_from(models.Order).where(models.Order.status.in_(["ASSIGNED", "IN_ROUTE"]))
    ) or 0
    active_deliverers = db.scalar(
        select(func.count()).select_from(models.Deliverer).where(models.Deliverer.status == "IN_ROUTE")
    ) or 0
    return {
        "total_orders": total_orders,
        "delivered_orders": delivered,
        "pending_orders": pending,
        "active_orders": active,
        "active_deliverers": active_deliverers,
    }
