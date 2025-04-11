from sqlmodel import SQLModel, Field
from typing import Optional

class AdminUser(SQLModel, table=True):
    __tablename__ = "admin_users"

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True, nullable=False)
    password_hash: str = Field(nullable=False)

class AdminCreate(SQLModel):
    username: str
    password: str

class AdminLogin(AdminCreate):
    pass