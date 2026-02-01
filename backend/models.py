from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, Date
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime, timezone


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
    upload_date = Column(DateTime, default=datetime.now(timezone.utc))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User", backref="invoices")

    def to_dict(self):
        return {
            "id": self.id,
            "filename": self.filename,
            "upload_date": self.upload_date.isoformat(),
            "user_id": self.user_id,
        }


class Spending(Base):
    __tablename__ = "spendings"
    id = Column(String(50), primary_key=True)
    name = Column(String(255), nullable=False)
    date = Column(Date, nullable=False)
    amount = Column(Float, nullable=False)
    category_id = Column(
        Integer, ForeignKey("categories.id"), nullable=True
    )
    import_date = Column(DateTime, default=datetime.now(timezone.utc))
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    invoice = relationship("Invoice", backref="spendings")
    category = relationship("Category", backref="spendings")
    user = relationship("User", backref="spendings")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "date": self.date.isoformat(),
            "amount": self.amount,
            "category_name": self.category.name if self.category else "Other",
            "import_date": self.import_date.isoformat(),
            "invoice_id": self.invoice_id,
        }
