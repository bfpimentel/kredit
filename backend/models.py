from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    password = Column(String(255), nullable=False)

    def __repr__(self):
        return f"<User {self.username!r}>"


class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User", backref="categories")

    def to_dict(self):
        return {"id": self.id, "name": self.name, "user_id": self.user_id}


class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(Integer, primary_key=True)
    filename = Column(String(255), nullable=False)
    upload_date = Column(DateTime, default=datetime.datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User", backref="invoices")

    def to_dict(self):
        return {
            "id": self.id,
            "filename": self.filename,
            "upload_date": self.upload_date.isoformat(),
            "user_id": self.user_id,
        }
