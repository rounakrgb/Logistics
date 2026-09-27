from datetime import datetime
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id: Mapped[int] = mapped_column(primary_key=True)
    vehicle_number: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    type: Mapped[str] = mapped_column(String(50))
    status: Mapped[str] = mapped_column(String(30), default="Active")


class Driver(Base):
    __tablename__ = "drivers"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    phone: Mapped[str] = mapped_column(String(30))
    license_number: Mapped[str] = mapped_column(String(50), unique=True)
    status: Mapped[str] = mapped_column(String(30), default="Available")


class Shipment(Base):
    __tablename__ = "shipments"

    id: Mapped[int] = mapped_column(primary_key=True)
    customer: Mapped[str] = mapped_column(String(120))
    origin: Mapped[str] = mapped_column(String(120))
    destination: Mapped[str] = mapped_column(String(120))
    driver: Mapped[str] = mapped_column(String(100))
    status: Mapped[str] = mapped_column(String(30), default="In Transit")


class Trip(Base):
    __tablename__ = "trips"

    id: Mapped[int] = mapped_column(primary_key=True)
    shipment: Mapped[str] = mapped_column(String(50))
    vehicle: Mapped[str] = mapped_column(String(50))
    driver: Mapped[str] = mapped_column(String(100))
    route: Mapped[str] = mapped_column(String(200))
    status: Mapped[str] = mapped_column(String(30), default="In Progress")


class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    id: Mapped[int] = mapped_column(primary_key=True)
    vehicle_number: Mapped[str] = mapped_column(String(50))
    description: Mapped[str] = mapped_column(Text)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    status: Mapped[str] = mapped_column(String(30), default="Scheduled")


class FuelRecord(Base):
    __tablename__ = "fuel_records"

    id: Mapped[int] = mapped_column(primary_key=True)
    vehicle_number: Mapped[str] = mapped_column(String(50))
    description: Mapped[str] = mapped_column(Text)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    status: Mapped[str] = mapped_column(String(30), default="Recorded")


class AppSetting(Base):
    __tablename__ = "app_settings"

    id: Mapped[int] = mapped_column(primary_key=True, default=1)
    company_name: Mapped[str] = mapped_column(String(120), default="SwiftLog")
    timezone: Mapped[str] = mapped_column(String(80), default="Asia/Kolkata")
    email_notifications: Mapped[bool] = mapped_column(Boolean, default=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
