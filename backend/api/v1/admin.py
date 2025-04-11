from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from passlib.context import CryptContext
from backend.db.models import AdminUser, AdminCreate, AdminLogin
from backend.db import get_db
from backend.core.security import create_access_token, decode_access_token
from backend.core.config import ACCESS_TOKEN_EXPIRE_MINUTES
from fastapi.security import OAuth2PasswordBearer
from datetime import timedelta

router = APIRouter(prefix="/admin", tags=["ADMIN"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/admin/login")


def get_password_hash(password):
    return pwd_context.hash(password)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_admin(admin: AdminCreate, db: Session = Depends(get_db)):
    statement = select(AdminUser).where(AdminUser.username == admin.username)
    db_user = db.execute(statement).scalars().first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    hashed_password = get_password_hash(admin.password)
    new_admin = AdminUser(username=admin.username, password_hash=hashed_password)
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    return {"message": "Admin created successfully"}


@router.post("/login")
def login_admin(admin: AdminLogin, db: Session = Depends(get_db)):
    statement = select(AdminUser).where(AdminUser.username == admin.username)
    db_user = db.execute(statement).scalars().first()
    if not db_user or not verify_password(admin.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": db_user.username}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}


def get_current_user(
        token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    username = payload.get("sub")
    if not username:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    statement = select(AdminUser).where(AdminUser.username == username)
    user = db.execute(statement).scalars().first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user


@router.get("/protected")
def protected_route(current_user: AdminUser = Depends(get_current_user)):
    return {"message": f"Hello, {current_user.username}! This is a protected route."}


# Маршрут выхода
@router.post("/logout")
def logout_admin():
    # В JWT нет прямого механизма для отзыва токена, поэтому мы просто возвращаем сообщение.
    # Реализация может быть расширена для использования черного списка токенов.
    return {"message": "Logout successful"}