alter table service_items add column unit_price numeric(12,2);
alter table service_items add constraint ck_service_item_price check (unit_price >= 0);
alter table service_cases add column started_by_user_id bigint references users(id);
alter table service_cases add column billing_total numeric(16,2);
alter table service_cases add column billing_currency varchar(3);
alter table service_cases add column billed_at timestamp with time zone;
alter table service_cases add column paid_at timestamp with time zone;
