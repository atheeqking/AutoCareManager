-- Development-only accounts documented in README use the password: password
update users
set password_hash = '$2a$10$wkqiVqISzh5d7DmtsHD9zueLQz3eREkj4UlInT4W4hUQPY02puiJ.',
    updated_at = current_timestamp
where username in ('owner@autocare.com', 'manager@autocare.com', 'employee@autocare.com')
  and authentication_type = 'LOCAL';
