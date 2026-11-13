import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import { GuestVehicleDetails } from './GuestVehicleDetails'
import { customerService } from '../services/customerService'
import { appointmentService, type Appointment } from '../services/appointmentService'
vi.mock('../services/customerService', () => ({ customerService: { vehicles: vi.fn(), createVehicle: vi.fn() } }))
vi.mock('../services/appointmentService', () => ({ appointmentService: { assignVehicle: vi.fn() } }))
beforeEach(() => vi.clearAllMocks())
it('adds the guest vehicle and associates it with the appointment before check-in', async () => {
 vi.mocked(customerService.vehicles).mockResolvedValue({ data: [] } as any)
 vi.mocked(customerService.createVehicle).mockResolvedValue({ data: { vehicleId: 'VEH-1', make: 'Toyota', model: 'Camry', color: 'Blue', licensePlate: 'TEST123' } } as any)
 vi.mocked(appointmentService.assignVehicle).mockResolvedValue({ data: {} } as any)
 const saved = vi.fn().mockResolvedValue(undefined)
 render(<GuestVehicleDetails appointment={{ appointmentId: 'APT-1', customerId: 'CUS-1' } as Appointment} onSaved={saved}/>)
 fireEvent.click(screen.getByText('Add vehicle details before check-in'))
 for (const [label, value] of [['Make', 'Toyota'], ['Model', 'Camry'], ['Color', 'Blue'], ['License plate', 'TEST123']]) fireEvent.change(screen.getByLabelText(label), { target: { value } })
 fireEvent.click(screen.getByRole('button', { name: 'Save appointment vehicle' }))
 await waitFor(() => expect(saved).toHaveBeenCalledOnce())
 expect(customerService.createVehicle).toHaveBeenCalledWith('CUS-1', { make: 'Toyota', model: 'Camry', color: 'Blue', licensePlate: 'TEST123' })
 expect(appointmentService.assignVehicle).toHaveBeenCalledWith('APT-1', 'VEH-1')
})
