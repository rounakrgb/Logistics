from contextlib import asynccontextmanager
from decimal import Decimal
from typing import Type

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import Base, SessionLocal, engine, get_db
from app.models import AppSetting, Driver, FuelRecord, MaintenanceRecord, Shipment, Trip, Vehicle


class ShipmentCreate(BaseModel):
    customer: str
    origin: str
    destination: str
    driver: str


class VehicleCreate(BaseModel):
    vehicle_number: str
    type: str


class DriverCreate(BaseModel):
    name: str
    phone: str
    license_number: str


class RecordCreate(BaseModel):
    vehicle_number: str
    description: str
    amount: float = 0


class SettingsUpdate(BaseModel):
    company_name: str
    timezone: str
    email_notifications: bool


def seed_database(db: Session) -> None:
    if not db.scalar(select(Vehicle.id).limit(1)):
        db.add_all([
            Vehicle(vehicle_number="TRK-001", type="Truck", status="Active"),
            Vehicle(vehicle_number="TRK-002", type="Truck", status="Maintenance"),
            Vehicle(vehicle_number="VAN-001", type="Van", status="Active"),
        ])
    if not db.scalar(select(Driver.id).limit(1)):
        db.add_all([
            Driver(name="Rahul Sharma", phone="+91 98765 43210", license_number="DL-IND-001", status="Available"),
            Driver(name="Aman Verma", phone="+91 98765 43211", license_number="DL-PUN-002", status="On Trip"),
            Driver(name="Neha Singh", phone="+91 98765 43212", license_number="DL-DEL-003", status="Available"),
        ])
    if not db.scalar(select(Shipment.id).limit(1)):
        db.add_all([
            Shipment(customer="ABC Logistics", origin="Indore", destination="Delhi", driver="Rahul Sharma", status="In Transit"),
            Shipment(customer="XYZ Industries", origin="Pune", destination="Mumbai", driver="Aman Verma", status="Delivered"),
            Shipment(customer="TechWorld Ltd", origin="Delhi", destination="Jaipur", driver="Neha Singh", status="Delayed"),
        ])
    if not db.scalar(select(Trip.id).limit(1)):
        db.add_all([
            Trip(shipment="SH-1024", vehicle="TRK-001", driver="Rahul Sharma", route="Indore to Delhi", status="In Progress"),
            Trip(shipment="SH-1023", vehicle="TRK-002", driver="Aman Verma", route="Pune to Mumbai", status="Completed"),
        ])
    if not db.scalar(select(MaintenanceRecord.id).limit(1)):
        db.add(MaintenanceRecord(vehicle_number="TRK-002", description="Brake inspection", amount=Decimal("18500"), status="Scheduled"))
    if not db.scalar(select(FuelRecord.id).limit(1)):
        db.add(FuelRecord(vehicle_number="TRK-001", description="Diesel refill", amount=Decimal("7200"), status="Recorded"))
    if not db.scalar(select(AppSetting.id).limit(1)):
        db.add(AppSetting(id=1, company_name="SwiftLog", timezone="Asia/Kolkata", email_notifications=True))
    db.commit()


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_database(db)
    yield


app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[f"http://localhost:{port}" for port in range(5173, 5181)],
    allow_origin_regex=r"https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def serialize(record):
    data = {column.name: getattr(record, column.name) for column in record.__table__.columns}
    if isinstance(data.get("amount"), Decimal):
        data["amount"] = float(data["amount"])
    return data


def list_records(db: Session, model: Type):
    return [serialize(record) for record in db.scalars(select(model)).all()]


@app.get("/vehicles")
def get_vehicles(db: Session = Depends(get_db)):
    return list_records(db, Vehicle)


@app.post("/vehicles", status_code=201)
def create_vehicle(vehicle: VehicleCreate, db: Session = Depends(get_db)):
    record = Vehicle(**vehicle.model_dump(), status="Active")
    db.add(record)
    db.commit()
    db.refresh(record)
    return serialize(record)


@app.get("/drivers")
def get_drivers(db: Session = Depends(get_db)):
    return list_records(db, Driver)


@app.post("/drivers", status_code=201)
def create_driver(driver: DriverCreate, db: Session = Depends(get_db)):
    record = Driver(**driver.model_dump(), status="Available")
    db.add(record)
    db.commit()
    db.refresh(record)
    return serialize(record)


@app.get("/shipments")
def get_shipments(db: Session = Depends(get_db)):
    return list_records(db, Shipment)


@app.post("/shipments", status_code=201)
def create_shipment(shipment: ShipmentCreate, db: Session = Depends(get_db)):
    record = Shipment(**shipment.model_dump(), status="In Transit")
    db.add(record)
    db.commit()
    db.refresh(record)
    return serialize(record)


@app.get("/trips")
def get_trips(db: Session = Depends(get_db)):
    return list_records(db, Trip)


@app.get("/maintenance")
def get_maintenance(db: Session = Depends(get_db)):
    return list_records(db, MaintenanceRecord)


@app.post("/maintenance", status_code=201)
def create_maintenance(record: RecordCreate, db: Session = Depends(get_db)):
    saved = MaintenanceRecord(**record.model_dump(), status="Scheduled")
    db.add(saved)
    db.commit()
    db.refresh(saved)
    return serialize(saved)


@app.get("/fuel")
def get_fuel(db: Session = Depends(get_db)):
    return list_records(db, FuelRecord)


@app.post("/fuel", status_code=201)
def create_fuel(record: RecordCreate, db: Session = Depends(get_db)):
    saved = FuelRecord(**record.model_dump(), status="Recorded")
    db.add(saved)
    db.commit()
    db.refresh(saved)
    return serialize(saved)


@app.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    active_trips = db.scalar(select(func.count()).select_from(Trip).where(Trip.status == "In Progress")) or 0
    fuel_spend = db.scalar(select(func.coalesce(func.sum(FuelRecord.amount), 0))) or 0
    maintenance_spend = db.scalar(select(func.coalesce(func.sum(MaintenanceRecord.amount), 0))) or 0
    return {
        "total_vehicles": db.scalar(select(func.count()).select_from(Vehicle)) or 0,
        "total_drivers": db.scalar(select(func.count()).select_from(Driver)) or 0,
        "total_shipments": db.scalar(select(func.count()).select_from(Shipment)) or 0,
        "active_trips": active_trips,
        "fuel_spend": float(fuel_spend),
        "maintenance_spend": float(maintenance_spend),
    }


@app.get("/settings")
def get_settings(db: Session = Depends(get_db)):
    return serialize(db.get(AppSetting, 1))


@app.put("/settings")
def update_settings(updated_settings: SettingsUpdate, db: Session = Depends(get_db)):
    record = db.get(AppSetting, 1)
    for key, value in updated_settings.model_dump().items():
        setattr(record, key, value)
    db.commit()
    db.refresh(record)
    return serialize(record)
