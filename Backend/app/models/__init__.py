from app.models.operations import (
	AppSetting,
	Driver,
	FuelRecord,
	MaintenanceRecord,
	Shipment,
	Trip,
	Vehicle,
)

__all__ = [
	"AppSetting",
	"Driver",
	"FuelRecord",
	"MaintenanceRecord",
	"Shipment",
	"Trip",
	"Vehicle",
]
from app.models.users import User

__all__ = ["User"]
