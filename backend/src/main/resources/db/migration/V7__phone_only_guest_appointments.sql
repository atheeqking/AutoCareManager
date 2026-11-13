-- Guest bookings can be requested before the workshop records a vehicle.
alter table appointments alter column vehicle_id drop not null;
alter table appointments add column guest_booking boolean not null default false;
alter table appointments add constraint ck_appointment_vehicle_or_guest check (vehicle_id is not null or guest_booking = true);
