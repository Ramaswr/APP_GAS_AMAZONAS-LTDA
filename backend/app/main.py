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
    return schemas.PurchaseResponse(order_id=order.id, total_value=order.total_value, status=order.status)


@app.get("/orders", response_model=list[schemas.OrderRead])
def list_orders(db: Session = Depends(get_db)):
    orders = crud.list_orders(db)
    return orders
