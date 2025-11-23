from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select

from . import models
from .schemas import OrderCreate, UserCreate
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
        )
        .order_by(models.Order.created_at.desc())
    )
    return list(db.scalars(stmt))
