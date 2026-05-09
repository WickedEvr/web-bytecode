-- Bytecode enterprise relational schema for PostgreSQL 15+
-- Architecture target: normalized, auditable, scalable and legally traceable.
-- This is a greenfield target schema, not a destructive migration for current data.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION prevent_legal_delete()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Legal records must be soft-deleted or closed, not physically deleted';
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- Security and access control
-- =========================================================

CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(80) NOT NULL UNIQUE,
  name varchar(120) NOT NULL,
  description text,
  is_system boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid,
  updated_by uuid,
  CONSTRAINT ck_roles_code CHECK (code ~ '^[a-z0-9_:.+-]+$')
);

CREATE TABLE permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_code varchar(80) NOT NULL,
  action_code varchar(80) NOT NULL,
  code varchar(180) NOT NULL UNIQUE,
  name varchar(160) NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid,
  updated_by uuid,
  CONSTRAINT uq_permissions_module_action UNIQUE (module_code, action_code),
  CONSTRAINT ck_permissions_code CHECK (code ~ '^[a-z0-9_:.+-]+$')
);

CREATE TABLE admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(180) NOT NULL UNIQUE,
  name varchar(160) NOT NULL,
  password_hash text NOT NULL,
  role varchar(80) NOT NULL DEFAULT 'admin',
  is_active boolean NOT NULL DEFAULT true,
  mfa_enabled boolean NOT NULL DEFAULT false,
  last_login_at timestamptz,
  failed_login_count integer NOT NULL DEFAULT 0,
  locked_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT ck_admin_users_email_lower CHECK (email = lower(email)),
  CONSTRAINT ck_admin_users_failed_logins CHECK (failed_login_count >= 0)
);

ALTER TABLE roles
  ADD CONSTRAINT fk_roles_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_roles_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL;

ALTER TABLE permissions
  ADD CONSTRAINT fk_permissions_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_permissions_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL;

CREATE TABLE admin_user_roles (
  admin_user_id uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  assigned_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  expires_at timestamptz,
  PRIMARY KEY (admin_user_id, role_id),
  CONSTRAINT ck_admin_user_roles_dates CHECK (expires_at IS NULL OR expires_at > assigned_at)
);

CREATE TABLE role_permissions (
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at timestamptz NOT NULL DEFAULT now(),
  granted_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token_hash varchar(128) NOT NULL UNIQUE,
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  CONSTRAINT ck_admin_sessions_dates CHECK (expires_at > created_at)
);

-- =========================================================
-- Reusable catalogs
-- =========================================================

CREATE TABLE countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  iso2 char(2) NOT NULL UNIQUE,
  name varchar(120) NOT NULL,
  dial_code varchar(10) NOT NULL,
  phone_max_length smallint,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT ck_countries_iso2 CHECK (iso2 = upper(iso2)),
  CONSTRAINT ck_countries_phone_length CHECK (phone_max_length IS NULL OR phone_max_length BETWEEN 4 AND 20)
);

CREATE TABLE document_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(30) NOT NULL UNIQUE,
  name varchar(120) NOT NULL,
  country_id uuid REFERENCES countries(id) ON DELETE SET NULL,
  validation_regex varchar(255),
  min_length smallint,
  max_length smallint,
  is_company_document boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT ck_document_types_length CHECK (
    min_length IS NULL OR max_length IS NULL OR min_length <= max_length
  )
);

CREATE TABLE status_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain varchar(60) NOT NULL,
  code varchar(60) NOT NULL,
  name varchar(120) NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_terminal boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT uq_status_catalog_domain_code UNIQUE (domain, code),
  CONSTRAINT ck_status_catalog_code CHECK (code ~ '^[a-z0-9_:-]+$')
);

CREATE TABLE priority_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(40) NOT NULL UNIQUE,
  name varchar(80) NOT NULL,
  weight smallint NOT NULL,
  sla_hours integer,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT ck_priority_weight CHECK (weight BETWEEN 1 AND 100),
  CONSTRAINT ck_priority_sla CHECK (sla_hours IS NULL OR sla_hours > 0)
);

CREATE TABLE service_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(80) NOT NULL UNIQUE,
  name varchar(160) NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE TABLE channel_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(40) NOT NULL UNIQUE,
  name varchar(80) NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL
);

-- =========================================================
-- Customers, organizations and contact methods
-- =========================================================

CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name varchar(200) NOT NULL,
  trade_name varchar(200),
  ruc varchar(30),
  website varchar(255),
  industry varchar(120),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_code varchar(40) NOT NULL UNIQUE,
  first_name varchar(120) NOT NULL,
  last_name varchar(120),
  display_name varchar(240) GENERATED ALWAYS AS (
    trim(coalesce(first_name, '') || ' ' || coalesce(last_name, ''))
  ) STORED,
  person_type varchar(30) NOT NULL DEFAULT 'natural',
  primary_email varchar(180),
  primary_phone varchar(40),
  country_id uuid REFERENCES countries(id) ON DELETE SET NULL,
  source_channel_id uuid REFERENCES channel_catalog(id) ON DELETE SET NULL,
  consent_marketing boolean NOT NULL DEFAULT false,
  consent_terms boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT ck_customers_person_type CHECK (person_type IN ('natural', 'company_contact')),
  CONSTRAINT ck_customers_email_lower CHECK (primary_email IS NULL OR primary_email = lower(primary_email))
);

CREATE TABLE customer_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  document_type_id uuid NOT NULL REFERENCES document_types(id) ON DELETE RESTRICT,
  document_number varchar(40) NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE TABLE customer_organizations (
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  position_title varchar(160),
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  PRIMARY KEY (customer_id, organization_id)
);

CREATE TABLE customer_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  country_id uuid REFERENCES countries(id) ON DELETE SET NULL,
  address_line text NOT NULL,
  city varchar(120),
  region varchar(120),
  postal_code varchar(30),
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL
);

-- =========================================================
-- Core agency project delivery module
-- =========================================================

CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_code varchar(40) NOT NULL UNIQUE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  service_id uuid NOT NULL REFERENCES service_catalog(id) ON DELETE RESTRICT,
  name varchar(180) NOT NULL,
  description text,
  status varchar(40) NOT NULL DEFAULT 'planning',
  repository_url varchar(255),
  production_url varchar(255),
  start_date date NOT NULL,
  estimated_end_date date NOT NULL,
  actual_end_date date,
  total_budget numeric(14,2) NOT NULL,
  currency_code char(3) NOT NULL DEFAULT 'PEN',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT ck_projects_status CHECK (status IN ('planning', 'in_development', 'qa', 'deployed', 'maintenance')),
  CONSTRAINT ck_projects_dates CHECK (
    estimated_end_date >= start_date AND
    (actual_end_date IS NULL OR actual_end_date >= start_date)
  ),
  CONSTRAINT ck_projects_budget CHECK (total_budget >= 0),
  CONSTRAINT ck_projects_currency CHECK (currency_code = upper(currency_code))
);

CREATE TABLE project_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title varchar(180) NOT NULL,
  due_date date NOT NULL,
  status varchar(40) NOT NULL DEFAULT 'pending',
  payment_percentage numeric(5,2) NOT NULL,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ck_project_milestones_status CHECK (status IN ('pending', 'completed', 'delayed')),
  CONSTRAINT ck_project_milestones_payment CHECK (payment_percentage BETWEEN 0 AND 100)
);

-- =========================================================
-- Files, documents and attachments
-- =========================================================

CREATE TABLE file_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_name varchar(255) NOT NULL,
  storage_provider varchar(40) NOT NULL DEFAULT 'local',
  storage_key text NOT NULL,
  public_url text,
  mime_type varchar(120) NOT NULL,
  byte_size bigint NOT NULL,
  checksum_sha256 char(64),
  uploaded_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT ck_file_assets_size CHECK (byte_size > 0),
  CONSTRAINT ck_file_assets_storage CHECK (storage_provider IN ('local', 's3', 'cloudinary', 'gcs', 'azure'))
);

CREATE TABLE milestone_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id uuid NOT NULL REFERENCES project_milestones(id) ON DELETE CASCADE,
  amount_paid numeric(14,2) NOT NULL,
  currency_code char(3) NOT NULL DEFAULT 'PEN',
  payment_method varchar(80) NOT NULL,
  reference_number varchar(120),
  receipt_file_id uuid REFERENCES file_assets(id) ON DELETE SET NULL,
  paid_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ck_milestone_payments_amount CHECK (amount_paid > 0),
  CONSTRAINT ck_milestone_payments_currency CHECK (currency_code = upper(currency_code))
);

-- =========================================================
-- Contact module
-- =========================================================

CREATE TABLE contact_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(80) NOT NULL UNIQUE,
  name varchar(160) NOT NULL,
  description text,
  default_priority_id uuid REFERENCES priority_catalog(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE TABLE contact_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_code varchar(40) NOT NULL UNIQUE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  category_id uuid REFERENCES contact_categories(id) ON DELETE SET NULL,
  service_id uuid REFERENCES service_catalog(id) ON DELETE SET NULL,
  status_id uuid NOT NULL REFERENCES status_catalog(id) ON DELETE RESTRICT,
  priority_id uuid REFERENCES priority_catalog(id) ON DELETE SET NULL,
  source_channel_id uuid REFERENCES channel_catalog(id) ON DELETE SET NULL,
  subject varchar(220),
  message text,
  assigned_to uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  first_response_due_at timestamptz,
  resolved_at timestamptz,
  closed_at timestamptz,
  internal_notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT ck_contact_cases_dates CHECK (
    (resolved_at IS NULL OR resolved_at >= created_at) AND
    (closed_at IS NULL OR closed_at >= created_at)
  )
);

CREATE TABLE contact_case_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_case_id uuid NOT NULL REFERENCES contact_cases(id) ON DELETE RESTRICT,
  sender_type varchar(30) NOT NULL,
  admin_user_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  body text NOT NULL,
  is_internal boolean NOT NULL DEFAULT false,
  sent_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT ck_contact_messages_sender CHECK (sender_type IN ('customer', 'admin', 'system')),
  CONSTRAINT ck_contact_messages_sender_consistency CHECK (
    (sender_type = 'customer' AND customer_id IS NOT NULL AND admin_user_id IS NULL) OR
    (sender_type = 'admin' AND admin_user_id IS NOT NULL AND customer_id IS NULL) OR
    (sender_type = 'system' AND customer_id IS NULL AND admin_user_id IS NULL)
  )
);

CREATE TABLE contact_case_attachments (
  contact_case_id uuid NOT NULL REFERENCES contact_cases(id) ON DELETE RESTRICT,
  file_asset_id uuid NOT NULL REFERENCES file_assets(id) ON DELETE RESTRICT,
  message_id uuid REFERENCES contact_case_messages(id) ON DELETE SET NULL,
  evidence_type varchar(80),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  PRIMARY KEY (contact_case_id, file_asset_id)
);

CREATE TABLE contact_case_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_case_id uuid NOT NULL REFERENCES contact_cases(id) ON DELETE RESTRICT,
  old_status_id uuid REFERENCES status_catalog(id) ON DELETE SET NULL,
  new_status_id uuid NOT NULL REFERENCES status_catalog(id) ON DELETE RESTRICT,
  changed_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  reason text,
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE contact_case_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_case_id uuid NOT NULL REFERENCES contact_cases(id) ON DELETE RESTRICT,
  assigned_to uuid NOT NULL REFERENCES admin_users(id) ON DELETE RESTRICT,
  assigned_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  unassigned_at timestamptz,
  notes text,
  CONSTRAINT ck_contact_assignments_dates CHECK (unassigned_at IS NULL OR unassigned_at >= assigned_at)
);

-- =========================================================
-- Complaints / legal claims module
-- =========================================================

CREATE TABLE complaint_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(40) NOT NULL UNIQUE,
  name varchar(120) NOT NULL,
  legal_description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE TABLE complaint_reasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(80) NOT NULL UNIQUE,
  name varchar(160) NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE TABLE complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_code varchar(40) NOT NULL UNIQUE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  complaint_type_id uuid NOT NULL REFERENCES complaint_types(id) ON DELETE RESTRICT,
  complaint_reason_id uuid REFERENCES complaint_reasons(id) ON DELETE SET NULL,
  status_id uuid NOT NULL REFERENCES status_catalog(id) ON DELETE RESTRICT,
  priority_id uuid REFERENCES priority_catalog(id) ON DELETE SET NULL,
  source_channel_id uuid REFERENCES channel_catalog(id) ON DELETE SET NULL,
  legal_acceptance boolean NOT NULL DEFAULT false,
  legal_acceptance_at timestamptz,
  legal_response_due_at timestamptz NOT NULL,
  extension_requested_at timestamptz,
  extension_reason text,
  extended_response_due_at timestamptz,
  assigned_to uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  acknowledged_at timestamptz,
  responded_at timestamptz,
  closed_at timestamptz,
  internal_notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT ck_complaints_legal_acceptance CHECK (
    legal_acceptance = false OR legal_acceptance_at IS NOT NULL
  ),
  CONSTRAINT ck_complaints_dates CHECK (
    legal_response_due_at >= submitted_at AND
    (extended_response_due_at IS NULL OR extended_response_due_at >= legal_response_due_at) AND
    (closed_at IS NULL OR closed_at >= submitted_at)
  )
);

CREATE TABLE complaint_goods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid NOT NULL REFERENCES complaints(id) ON DELETE RESTRICT,
  good_type varchar(30) NOT NULL,
  description varchar(240) NOT NULL,
  project_or_unit_name varchar(160),
  category varchar(120),
  claimed_amount numeric(14,2),
  currency_code char(3) NOT NULL DEFAULT 'PEN',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT ck_complaint_goods_type CHECK (good_type IN ('product', 'service')),
  CONSTRAINT ck_complaint_goods_amount CHECK (claimed_amount IS NULL OR claimed_amount >= 0),
  CONSTRAINT ck_complaint_goods_currency CHECK (currency_code = upper(currency_code))
);

CREATE TABLE complaint_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid NOT NULL REFERENCES complaints(id) ON DELETE RESTRICT,
  incident_detail text NOT NULL,
  requested_solution text NOT NULL,
  incident_occurred_at timestamptz,
  customer_ip inet,
  customer_user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT uq_complaint_details_complaint UNIQUE (complaint_id)
);

CREATE TABLE complaint_evidences (
  complaint_id uuid NOT NULL REFERENCES complaints(id) ON DELETE RESTRICT,
  file_asset_id uuid NOT NULL REFERENCES file_assets(id) ON DELETE RESTRICT,
  evidence_type varchar(80) NOT NULL DEFAULT 'customer_attachment',
  description text,
  submitted_by_customer boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  PRIMARY KEY (complaint_id, file_asset_id)
);

CREATE TABLE complaint_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid NOT NULL REFERENCES complaints(id) ON DELETE RESTRICT,
  response_type varchar(40) NOT NULL,
  body text NOT NULL,
  resolution_summary text,
  sent_to_email varchar(180),
  sent_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  sent_at timestamptz,
  is_final boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT ck_complaint_responses_type CHECK (response_type IN ('acknowledgement', 'extension_notice', 'final_response', 'internal_note'))
);

CREATE TABLE complaint_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid NOT NULL REFERENCES complaints(id) ON DELETE RESTRICT,
  old_status_id uuid REFERENCES status_catalog(id) ON DELETE SET NULL,
  new_status_id uuid NOT NULL REFERENCES status_catalog(id) ON DELETE RESTRICT,
  changed_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  reason text,
  legal_impact boolean NOT NULL DEFAULT false,
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE complaint_time_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid NOT NULL REFERENCES complaints(id) ON DELETE RESTRICT,
  event_type varchar(80) NOT NULL,
  event_at timestamptz NOT NULL DEFAULT now(),
  deadline_at timestamptz,
  business_days_elapsed integer,
  notes text,
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT ck_complaint_time_elapsed CHECK (business_days_elapsed IS NULL OR business_days_elapsed >= 0)
);

CREATE TABLE complaint_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid NOT NULL REFERENCES complaints(id) ON DELETE RESTRICT,
  assigned_to uuid NOT NULL REFERENCES admin_users(id) ON DELETE RESTRICT,
  assigned_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  unassigned_at timestamptz,
  notes text,
  CONSTRAINT ck_complaint_assignments_dates CHECK (unassigned_at IS NULL OR unassigned_at >= assigned_at)
);

-- =========================================================
-- Notifications, audit, logs and reporting
-- =========================================================

CREATE TABLE notification_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(100) NOT NULL UNIQUE,
  channel varchar(40) NOT NULL,
  subject varchar(220),
  body_template text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT ck_notification_templates_channel CHECK (channel IN ('email', 'sms', 'whatsapp', 'in_app', 'webhook'))
);

CREATE TABLE notification_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES notification_templates(id) ON DELETE SET NULL,
  recipient_email varchar(180),
  recipient_phone varchar(40),
  channel varchar(40) NOT NULL,
  entity_type varchar(80),
  entity_id uuid,
  status varchar(40) NOT NULL DEFAULT 'pending',
  provider_message_id varchar(160),
  error_message text,
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT ck_notification_events_status CHECK (status IN ('pending', 'sent', 'failed', 'cancelled'))
);

CREATE TABLE admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  title varchar(180) NOT NULL,
  body text,
  entity_type varchar(80),
  entity_id uuid,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  action varchar(100) NOT NULL,
  entity_type varchar(80) NOT NULL,
  entity_id uuid,
  ip_address inet,
  user_agent text,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE data_change_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type varchar(80) NOT NULL,
  entity_id uuid NOT NULL,
  changed_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  change_type varchar(40) NOT NULL,
  field_name varchar(120),
  old_value text,
  new_value text,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ck_data_change_history_type CHECK (change_type IN ('insert', 'update', 'delete', 'restore'))
);

CREATE TABLE system_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level varchar(20) NOT NULL,
  source varchar(120) NOT NULL,
  message text NOT NULL,
  context jsonb,
  trace_id varchar(120),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ck_system_logs_level CHECK (level IN ('debug', 'info', 'warning', 'error', 'critical'))
);

CREATE TABLE saved_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(100) NOT NULL UNIQUE,
  name varchar(180) NOT NULL,
  description text,
  report_domain varchar(80) NOT NULL,
  query_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE TABLE dashboard_widgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES saved_reports(id) ON DELETE SET NULL,
  code varchar(100) NOT NULL UNIQUE,
  title varchar(180) NOT NULL,
  widget_type varchar(40) NOT NULL,
  position_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL
);

-- =========================================================
-- CMS, menus and system parameters
-- =========================================================

CREATE TABLE system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key varchar(120) NOT NULL UNIQUE,
  setting_value jsonb NOT NULL,
  description text,
  is_sensitive boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE TABLE cms_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug varchar(160) NOT NULL UNIQUE,
  title varchar(200) NOT NULL,
  meta_title varchar(220),
  meta_description varchar(320),
  status_id uuid REFERENCES status_catalog(id) ON DELETE SET NULL,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE TABLE cms_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES cms_pages(id) ON DELETE CASCADE,
  block_key varchar(120) NOT NULL,
  block_type varchar(60) NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT uq_cms_blocks_page_key UNIQUE (page_id, block_key)
);

CREATE TABLE banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES cms_pages(id) ON DELETE SET NULL,
  file_asset_id uuid REFERENCES file_assets(id) ON DELETE SET NULL,
  title varchar(180),
  body text,
  link_url varchar(255),
  placement varchar(80) NOT NULL,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT ck_banners_dates CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at > starts_at)
);

CREATE TABLE menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
  label varchar(120) NOT NULL,
  url varchar(255),
  route_name varchar(120),
  icon_name varchar(80),
  permission_id uuid REFERENCES permissions(id) ON DELETE SET NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL
);

-- =========================================================
-- Strict JSON object integrity constraints
-- =========================================================

ALTER TABLE cms_blocks
  ADD CONSTRAINT ck_cms_blocks_content_json_object CHECK (jsonb_typeof(content) = 'object');

ALTER TABLE admin_audit_logs
  ADD CONSTRAINT ck_admin_audit_logs_before_data_json_object CHECK (jsonb_typeof(before_data) = 'object'),
  ADD CONSTRAINT ck_admin_audit_logs_after_data_json_object CHECK (jsonb_typeof(after_data) = 'object');

ALTER TABLE system_settings
  ADD CONSTRAINT ck_system_settings_setting_value_json_object CHECK (jsonb_typeof(setting_value) = 'object');

ALTER TABLE saved_reports
  ADD CONSTRAINT ck_saved_reports_query_config_json_object CHECK (jsonb_typeof(query_config) = 'object');

-- =========================================================
-- Strategic indexes
-- =========================================================

CREATE INDEX idx_admin_users_active_email ON admin_users (is_active, email);
CREATE INDEX idx_admin_sessions_user_expires ON admin_sessions (admin_user_id, expires_at DESC);
CREATE INDEX idx_customers_name_search ON customers USING gin (to_tsvector('simple', coalesce(display_name, '')));
CREATE INDEX idx_customers_email ON customers (primary_email) WHERE primary_email IS NOT NULL;
CREATE INDEX idx_customer_documents_number ON customer_documents (document_number);
CREATE INDEX idx_customer_documents_customer ON customer_documents (customer_id);
CREATE INDEX idx_organizations_ruc ON organizations (ruc) WHERE ruc IS NOT NULL;
CREATE UNIQUE INDEX uq_organizations_ruc_active ON organizations (ruc) WHERE ruc IS NOT NULL AND deleted_at IS NULL;
CREATE UNIQUE INDEX uq_customer_documents_active ON customer_documents (document_type_id, document_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_customer_addresses_customer ON customer_addresses (customer_id, is_primary DESC);
CREATE INDEX idx_customer_organizations_organization ON customer_organizations (organization_id);
CREATE INDEX idx_projects_customer ON projects (customer_id);
CREATE INDEX idx_projects_status ON projects (status);
CREATE INDEX idx_projects_service ON projects (service_id);
CREATE INDEX idx_project_milestones_project ON project_milestones (project_id);
CREATE INDEX idx_project_milestones_status ON project_milestones (status);
CREATE INDEX idx_contact_cases_status_created ON contact_cases (status_id, created_at DESC);
CREATE INDEX idx_contact_cases_assignee_status ON contact_cases (assigned_to, status_id, created_at DESC);
CREATE INDEX idx_contact_cases_customer_created ON contact_cases (customer_id, created_at DESC);
CREATE INDEX idx_contact_messages_case_sent ON contact_case_messages (contact_case_id, sent_at DESC);
CREATE INDEX idx_contact_case_messages_customer ON contact_case_messages (customer_id, sent_at DESC);
CREATE INDEX idx_complaints_status_due ON complaints (status_id, legal_response_due_at);
CREATE INDEX idx_complaints_customer_created ON complaints (customer_id, submitted_at DESC);
CREATE INDEX idx_complaints_assignee_status ON complaints (assigned_to, status_id, submitted_at DESC);
CREATE INDEX idx_complaints_code ON complaints (complaint_code);
CREATE INDEX idx_complaint_goods_complaint ON complaint_goods (complaint_id);
CREATE INDEX idx_complaint_responses_complaint_type ON complaint_responses (complaint_id, response_type);
CREATE INDEX idx_complaint_history_case_changed ON complaint_status_history (complaint_id, changed_at DESC);
CREATE INDEX idx_complaint_time_events_complaint ON complaint_time_events (complaint_id, event_type);
CREATE INDEX idx_notification_events_status_schedule ON notification_events (status, scheduled_at);
CREATE INDEX idx_notification_events_entity ON notification_events (entity_type, entity_id, status);
CREATE INDEX idx_admin_audit_entity ON admin_audit_logs (entity_type, entity_id, created_at DESC);
CREATE INDEX idx_admin_audit_admin_created ON admin_audit_logs (admin_id, created_at DESC);
CREATE INDEX idx_data_change_entity ON data_change_history (entity_type, entity_id, created_at DESC);
CREATE INDEX idx_system_logs_level_created ON system_logs (level, created_at DESC);
CREATE INDEX idx_cms_pages_slug_active ON cms_pages (slug) WHERE deleted_at IS NULL;

-- =========================================================
-- Triggers
-- =========================================================

CREATE TRIGGER trg_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_permissions_updated_at BEFORE UPDATE ON permissions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_countries_updated_at BEFORE UPDATE ON countries FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_document_types_updated_at BEFORE UPDATE ON document_types FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_status_catalog_updated_at BEFORE UPDATE ON status_catalog FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_priority_catalog_updated_at BEFORE UPDATE ON priority_catalog FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_service_catalog_updated_at BEFORE UPDATE ON service_catalog FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_channel_catalog_updated_at BEFORE UPDATE ON channel_catalog FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_customer_documents_updated_at BEFORE UPDATE ON customer_documents FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_customer_organizations_updated_at BEFORE UPDATE ON customer_organizations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_customer_addresses_updated_at BEFORE UPDATE ON customer_addresses FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_project_milestones_updated_at BEFORE UPDATE ON project_milestones FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_file_assets_updated_at BEFORE UPDATE ON file_assets FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_milestone_payments_updated_at BEFORE UPDATE ON milestone_payments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_contact_categories_updated_at BEFORE UPDATE ON contact_categories FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_contact_cases_updated_at BEFORE UPDATE ON contact_cases FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_contact_case_messages_updated_at BEFORE UPDATE ON contact_case_messages FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_complaint_types_updated_at BEFORE UPDATE ON complaint_types FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_complaint_reasons_updated_at BEFORE UPDATE ON complaint_reasons FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_complaints_updated_at BEFORE UPDATE ON complaints FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_complaint_goods_updated_at BEFORE UPDATE ON complaint_goods FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_complaint_details_updated_at BEFORE UPDATE ON complaint_details FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_complaint_responses_updated_at BEFORE UPDATE ON complaint_responses FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_notification_templates_updated_at BEFORE UPDATE ON notification_templates FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_notification_events_updated_at BEFORE UPDATE ON notification_events FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_saved_reports_updated_at BEFORE UPDATE ON saved_reports FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_dashboard_widgets_updated_at BEFORE UPDATE ON dashboard_widgets FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_cms_pages_updated_at BEFORE UPDATE ON cms_pages FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_cms_blocks_updated_at BEFORE UPDATE ON cms_blocks FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_banners_updated_at BEFORE UPDATE ON banners FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION trg_contact_attachments_validate_message()
RETURNS trigger AS $$
BEGIN
  IF NEW.message_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM contact_case_messages WHERE id = NEW.message_id AND contact_case_id = NEW.contact_case_id) THEN
      RAISE EXCEPTION 'Message must belong to the same case';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_contact_attachments_validate_message
BEFORE INSERT ON contact_case_attachments
FOR EACH ROW
EXECUTE FUNCTION trg_contact_attachments_validate_message();

CREATE TRIGGER trg_complaints_prevent_delete BEFORE DELETE ON complaints FOR EACH ROW EXECUTE FUNCTION prevent_legal_delete();
CREATE TRIGGER trg_complaint_details_prevent_delete BEFORE DELETE ON complaint_details FOR EACH ROW EXECUTE FUNCTION prevent_legal_delete();
CREATE TRIGGER trg_complaint_responses_prevent_delete BEFORE DELETE ON complaint_responses FOR EACH ROW EXECUTE FUNCTION prevent_legal_delete();
CREATE TRIGGER trg_complaint_evidences_prevent_delete BEFORE DELETE ON complaint_evidences FOR EACH ROW EXECUTE FUNCTION prevent_legal_delete();

-- =========================================================
-- Minimal seed data
-- =========================================================

INSERT INTO admin_users (id, email, name, password_hash, role, created_by, updated_by, created_at, updated_at)
VALUES (gen_random_uuid(), 'system@internal', 'System', 'SYSTEM_HASH', 'super_admin', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

INSERT INTO roles (code, name, is_system) VALUES
  ('super_admin', 'Super administrador', true),
  ('admin', 'Administrador', true),
  ('support_agent', 'Agente de soporte', true),
  ('legal_reviewer', 'Revisor legal', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO channel_catalog (code, name) VALUES
  ('web', 'Web'),
  ('email', 'Email'),
  ('phone', 'Telefono'),
  ('admin', 'Panel admin')
ON CONFLICT (code) DO NOTHING;

INSERT INTO priority_catalog (code, name, weight, sla_hours) VALUES
  ('low', 'Baja', 10, 72),
  ('normal', 'Normal', 30, 48),
  ('high', 'Alta', 70, 24),
  ('urgent', 'Urgente', 100, 8)
ON CONFLICT (code) DO NOTHING;

INSERT INTO status_catalog (domain, code, name, sort_order, is_terminal) VALUES
  ('case', 'new', 'Nuevo', 10, false),
  ('case', 'read', 'Leido', 20, false),
  ('case', 'in_progress', 'En proceso', 30, false),
  ('case', 'responded', 'Respondido', 40, false),
  ('case', 'closed', 'Cerrado', 50, true),
  ('cms', 'draft', 'Borrador', 10, false),
  ('cms', 'published', 'Publicado', 20, false),
  ('cms', 'archived', 'Archivado', 30, true)
ON CONFLICT (domain, code) DO NOTHING;

INSERT INTO countries (iso2, name, dial_code, phone_max_length) VALUES
  ('PE', 'Peru', '+51', 9),
  ('MX', 'Mexico', '+52', 10),
  ('CO', 'Colombia', '+57', 10),
  ('CL', 'Chile', '+56', 9),
  ('US', 'Estados Unidos', '+1', 10),
  ('ES', 'Espana', '+34', 9)
ON CONFLICT (iso2) DO NOTHING;

INSERT INTO document_types (code, name, min_length, max_length, is_company_document) VALUES
  ('DNI', 'Documento nacional de identidad', 8, 8, false),
  ('CE', 'Carnet de extranjeria', 6, 12, false),
  ('RUC', 'Registro unico de contribuyentes', 11, 11, true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO service_catalog (code, name) VALUES
  ('web', 'Pagina web'),
  ('app', 'App movil'),
  ('desktop', 'App de escritorio'),
  ('custom_software', 'Software a medida')
ON CONFLICT (code) DO NOTHING;

INSERT INTO complaint_types (code, name, legal_description) VALUES
  ('queja', 'Queja', 'Malestar o descontento no relacionado directamente con el bien contratado.'),
  ('reclamo', 'Reclamo', 'Disconformidad relacionada con productos o servicios contratados.')
ON CONFLICT (code) DO NOTHING;

COMMIT;
