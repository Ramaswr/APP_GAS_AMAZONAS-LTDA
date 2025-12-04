from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .database import Base, engine, get_db

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Gas Amazonas Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/users", response_model=schemas.UserRead, status_code=status.HTTP_201_CREATED)
def register_user(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, payload.email):
        raise HTTPException(status_code=400, detail="Usuário já cadastrado")
    return crud.create_user(db, payload)


@app.get("/users", response_model=list[schemas.UserRead])
def list_users(db: Session = Depends(get_db)):
    return crud.list_users(db)


@app.post("/orders", response_model=schemas.PurchaseResponse, status_code=status.HTTP_201_CREATED)
def create_order(payload: schemas.OrderCreate, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, payload.user_email)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    if not payload.items:
        raise HTTPException(status_code=400, detail="Pedido precisa de itens")

    order = crud.create_order(db, payload, user)
    return schemas.PurchaseResponse(
        order_id=order.id,
        total_value=order.total_value,
        status=order.status,
        payment_method=order.payment_method,
    )


@app.get("/orders", response_model=list[schemas.OrderRead])
def list_orders(db: Session = Depends(get_db)):
    orders = crud.list_orders(db)
    return orders


@app.post("/deliverers", response_model=schemas.DelivererRead, status_code=status.HTTP_201_CREATED)
def register_deliverer(payload: schemas.DelivererCreate, db: Session = Depends(get_db)):
    if crud.get_deliverer_by_email(db, payload.email):
        raise HTTPException(status_code=400, detail="Entregador já cadastrado")
    return crud.create_deliverer(db, payload)


@app.get("/deliverers", response_model=list[schemas.DelivererRead])
def list_deliverers(db: Session = Depends(get_db)):
    return crud.list_deliverers(db)


def _require_order(order: models.Order | None) -> models.Order:
    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    return order


@app.patch("/orders/{order_id}/assign", response_model=schemas.OrderRead)
def assign_order(order_id: int, payload: schemas.OrderAssignment, db: Session = Depends(get_db)):
    order = _require_order(crud.get_order_by_id(db, order_id))
    deliverer = crud.get_deliverer_by_id(db, payload.deliverer_id)
    if not deliverer:
        raise HTTPException(status_code=404, detail="Entregador não encontrado")
    return crud.assign_order(db, order, payload, deliverer)


@app.post("/orders/{order_id}/track", response_model=schemas.OrderRead)
def track_order(order_id: int, payload: schemas.TrackingPoint, db: Session = Depends(get_db)):
    order = _require_order(crud.get_order_by_id(db, order_id))
    return crud.append_tracking_point(db, order, payload)


@app.post("/orders/{order_id}/status", response_model=schemas.OrderRead)
def update_order_status(order_id: int, payload: schemas.OrderStatusUpdate, db: Session = Depends(get_db)):
    order = _require_order(crud.get_order_by_id(db, order_id))
    return crud.update_order_status(db, order, payload)


@app.post("/orders/{order_id}/proof", response_model=schemas.OrderRead)
def register_proof(order_id: int, payload: schemas.ProofCreate, db: Session = Depends(get_db)):
    order = _require_order(crud.get_order_by_id(db, order_id))
    return crud.record_proof(db, order, payload)


@app.get("/orders/dashboard", response_model=schemas.DashboardSummary)
def orders_dashboard(db: Session = Depends(get_db)):
    return crud.orders_dashboard(db)
