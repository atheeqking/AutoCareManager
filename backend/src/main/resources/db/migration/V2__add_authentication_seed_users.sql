-- Development-only workshop accounts. Password hashes are BCrypt hashes for the documented demo password.
insert into users (username, password_hash, email, role, authentication_type, enabled, created_at, updated_at)
values
  ('owner@autocare.com', '$2a$10$DNZ3uE8dDUVc92ljneOaQuUE7Ge.NplgeNaNTOCzafdoGOJrM3GFO', 'owner@autocare.com', 'OWNER', 'LOCAL', true, current_timestamp, current_timestamp),
  ('manager@autocare.com', '$2a$10$DNZ3uE8dDUVc92ljneOaQuUE7Ge.NplgeNaNTOCzafdoGOJrM3GFO', 'manager@autocare.com', 'MANAGER', 'LOCAL', true, current_timestamp, current_timestamp),
  ('employee@autocare.com', '$2a$10$DNZ3uE8dDUVc92ljneOaQuUE7Ge.NplgeNaNTOCzafdoGOJrM3GFO', 'employee@autocare.com', 'EMPLOYEE', 'LOCAL', true, current_timestamp, current_timestamp);
