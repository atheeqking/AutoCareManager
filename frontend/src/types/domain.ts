export interface Customer { customerId: string; name: string; phone: string; email: string | null; createdAt: string; updatedAt: string }
export interface Vehicle { vehicleId: string; customerId: string; make: string; model: string; year: number | null; color: string; licensePlate: string; vin: string | null; currentMileage: number | null; createdAt: string; updatedAt: string }
export interface CustomerInput { name: string; phone: string; email?: string }
export interface VehicleInput { make: string; model: string; year?: number; color: string; licensePlate: string; vin?: string; currentMileage?: number }
