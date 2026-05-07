-- Bytecode enterprise relational schema for MySQL 8.0+
-- Architecture target equivalent to postgresql_enterprise_schema.sql.
-- This is a greenfield target schema, not a destructive migration for current data.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =========================================================
-- Security and access control
-- =========================================================

CREATE TABLE roles (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  code VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  deleted_at TIMESTAMP(6) NULL,
  created_by CHAR(36) NULL,
  updated_by CHAR(36) NULL,
  CONSTRAINT ck_roles_code CHECK (REGEXP_LIKE(code, '^[a-z0-9_:.+-]+$'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE permissions (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  module_code VARCHAR(80) NOT NULL,
  action_code VARCHAR(80) NOT NULL,
  code VARCHAR(180) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  description TEXT,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  deleted_at TIMESTAMP(6) NULL,
  created_by CHAR(36) NULL,
  updated_by CHAR(36) NULL,
  CONSTRAINT uq_permissions_module_action UNIQUE (module_code, action_code),
  CONSTRAINT ck_permissions_code CHECK (REGEXP_LIKE(code, '^[a-z0-9_:.+-]+$'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE admin_users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(180) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(80) NOT NULL DEFAULT 'admin',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at TIMESTAMP(6) NULL,
  failed_login_count INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMP(6) NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  deleted_at TIMESTAMP(6) NULL,
  created_by CHAR(36) NULL,
  updated_by CHAR(36) NULL,
  CONSTRAINT fk_admin_users_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_admin_users_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT ck_admin_users_email_lower CHECK (email = LOWER(email)),
  CONSTRAINT ck_admin_users_failed_logins CHECK (failed_login_count >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE roles
  ADD CONSTRAINT fk_roles_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_roles_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL;

ALTER TABLE permissions
  ADD CONSTRAINT fk_permissions_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_permissions_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL;

CREATE TABLE admin_user_roles (
  admin_user_id CHAR(36) NOT NULL,
  role_id CHAR(36) NOT NULL,
  assigned_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  assigned_by CHAR(36) NULL,
  expires_at TIMESTAMP(6) NULL,
  PRIMARY KEY (admin_user_id, role_id),
  CONSTRAINT fk_admin_user_roles_user FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
  CONSTRAINT fk_admin_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
  CONSTRAINT fk_admin_user_roles_assigned_by FOREIGN KEY (assigned_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT ck_admin_user_roles_dates CHECK (expires_at IS NULL OR expires_at > assigned_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE role_permissions (
  role_id CHAR(36) NOT NULL,
  permission_id CHAR(36) NOT NULL,
  granted_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  granted_by CHAR(36) NULL,
  PRIMARY KEY (role_id, permission_id),
  CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
  CONSTRAINT fk_role_permissions_granted_by FOREIGN KEY (granted_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE admin_sessions (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  admin_user_id CHAR(36) NOT NULL,
  token_hash VARCHAR(128) NOT NULL UNIQUE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  expires_at TIMESTAMP(6) NOT NULL,
  revoked_at TIMESTAMP(6) NULL,
  CONSTRAINT fk_admin_sessions_user FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
  CONSTRAINT ck_admin_sessions_dates CHECK (expires_at > created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- Reusable catalogs
-- =========================================================

CREATE TABLE countries (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  iso2 CHAR(2) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  dial_code VARCHAR(10) NOT NULL,
  phone_max_length SMALLINT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  deleted_at TIMESTAMP(6) NULL,
  created_by CHAR(36) NULL,
  updated_by CHAR(36) NULL,
  CONSTRAINT fk_countries_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_countries_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT ck_countries_iso2 CHECK (iso2 = UPPER(iso2)),
  CONSTRAINT ck_countries_phone_length CHECK (phone_max_length IS NULL OR phone_max_length BETWEEN 4 AND 20)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE document_types (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  country_id CHAR(36),
  validation_regex VARCHAR(255),
  min_length SMALLINT,
  max_length SMALLINT,
  is_company_document BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  deleted_at TIMESTAMP(6) NULL,
  created_by CHAR(36) NULL,
  updated_by CHAR(36) NULL,
  CONSTRAINT fk_document_types_country FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE SET NULL,
  CONSTRAINT fk_document_types_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_document_types_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT ck_document_types_length CHECK (min_length IS NULL OR max_length IS NULL OR min_length <= max_length)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE status_catalog (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  domain VARCHAR(60) NOT NULL,
  code VARCHAR(60) NOT NULL,
  name VARCHAR(120) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_terminal BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  deleted_at TIMESTAMP(6) NULL,
  created_by CHAR(36) NULL,
  updated_by CHAR(36) NULL,
  CONSTRAINT uq_status_catalog_domain_code UNIQUE (domain, code),
  CONSTRAINT fk_status_catalog_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_status_catalog_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT ck_status_catalog_code CHECK (REGEXP_LIKE(code, '^[a-z0-9_:-]+$'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE priority_catalog (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  code VARCHAR(40) NOT NULL UNIQUE,
  name VARCHAR(80) NOT NULL,
  weight SMALLINT NOT NULL,
  sla_hours INT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  deleted_at TIMESTAMP(6) NULL,
  created_by CHAR(36) NULL,
  updated_by CHAR(36) NULL,
  CONSTRAINT fk_priority_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_priority_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT ck_priority_weight CHECK (weight BETWEEN 1 AND 100),
  CONSTRAINT ck_priority_sla CHECK (sla_hours IS NULL OR sla_hours > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE service_catalog (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  code VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  deleted_at TIMESTAMP(6) NULL,
  created_by CHAR(36) NULL,
  updated_by CHAR(36) NULL,
  CONSTRAINT fk_service_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_service_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE channel_catalog (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  code VARCHAR(40) NOT NULL UNIQUE,
  name VARCHAR(80) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  deleted_at TIMESTAMP(6) NULL,
  created_by CHAR(36) NULL,
  updated_by CHAR(36) NULL,
  CONSTRAINT fk_channel_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_channel_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- Customers, organizations and contact methods
-- =========================================================

CREATE TABLE organizations (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  legal_name VARCHAR(200) NOT NULL,
  trade_name VARCHAR(200),
  ruc VARCHAR(30),
  ruc_active_key VARCHAR(30) GENERATED ALWAYS AS (IF(deleted_at IS NULL, ruc, NULL)) STORED,
  website VARCHAR(255),
  industry VARCHAR(120),
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  deleted_at TIMESTAMP(6) NULL,
  created_by CHAR(36) NULL,
  updated_by CHAR(36) NULL,
  UNIQUE KEY uq_organizations_ruc_active (ruc_active_key),
  CONSTRAINT fk_org_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_org_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE customers (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  customer_code VARCHAR(40) NOT NULL UNIQUE,
  first_name VARCHAR(120) NOT NULL,
  last_name VARCHAR(120),
  display_name VARCHAR(240) GENERATED ALWAYS AS (TRIM(CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, '')))) STORED,
  person_type VARCHAR(30) NOT NULL DEFAULT 'natural',
  primary_email VARCHAR(180),
  primary_phone VARCHAR(40),
  country_id CHAR(36),
  source_channel_id CHAR(36),
  consent_marketing BOOLEAN NOT NULL DEFAULT FALSE,
  consent_terms BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  deleted_at TIMESTAMP(6) NULL,
  created_by CHAR(36) NULL,
  updated_by CHAR(36) NULL,
  FULLTEXT KEY ft_customers_display_name (display_name),
  CONSTRAINT fk_customers_country FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE SET NULL,
  CONSTRAINT fk_customers_channel FOREIGN KEY (source_channel_id) REFERENCES channel_catalog(id) ON DELETE SET NULL,
  CONSTRAINT fk_customers_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_customers_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT ck_customers_person_type CHECK (person_type IN ('natural', 'company_contact')),
  CONSTRAINT ck_customers_email_lower CHECK (primary_email IS NULL OR primary_email = LOWER(primary_email))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE customer_documents (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  customer_id CHAR(36) NOT NULL,
  document_type_id CHAR(36) NOT NULL,
  document_number VARCHAR(40) NOT NULL,
  document_active_key VARCHAR(128) GENERATED ALWAYS AS (
    IF(deleted_at IS NULL, CONCAT(document_type_id, ':', document_number), NULL)
  ) STORED,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at TIMESTAMP(6) NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  deleted_at TIMESTAMP(6) NULL,
  created_by CHAR(36) NULL,
  updated_by CHAR(36) NULL,
  UNIQUE KEY uq_customer_documents_active (document_active_key),
  CONSTRAINT fk_customer_documents_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
  CONSTRAINT fk_customer_documents_type FOREIGN KEY (document_type_id) REFERENCES document_types(id) ON DELETE RESTRICT,
  CONSTRAINT fk_customer_documents_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_customer_documents_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE customer_organizations (
  customer_id CHAR(36) NOT NULL,
  organization_id CHAR(36) NOT NULL,
  position_title VARCHAR(160),
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  deleted_at TIMESTAMP(6) NULL,
  created_by CHAR(36) NULL,
  updated_by CHAR(36) NULL,
  PRIMARY KEY (customer_id, organization_id),
  CONSTRAINT fk_customer_org_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
  CONSTRAINT fk_customer_org_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE RESTRICT,
  CONSTRAINT fk_customer_org_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_customer_org_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE customer_addresses (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  customer_id CHAR(36) NOT NULL,
  country_id CHAR(36),
  address_line TEXT NOT NULL,
  city VARCHAR(120),
  region VARCHAR(120),
  postal_code VARCHAR(30),
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  deleted_at TIMESTAMP(6) NULL,
  created_by CHAR(36) NULL,
  updated_by CHAR(36) NULL,
  CONSTRAINT fk_customer_addresses_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
  CONSTRAINT fk_customer_addresses_country FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE SET NULL,
  CONSTRAINT fk_customer_addresses_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_customer_addresses_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- Core agency project delivery module
-- =========================================================

CREATE TABLE projects (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  project_code VARCHAR(40) NOT NULL UNIQUE,
  customer_id CHAR(36) NOT NULL,
  organization_id CHAR(36),
  service_id CHAR(36) NOT NULL,
  name VARCHAR(180) NOT NULL,
  description TEXT,
  status VARCHAR(40) NOT NULL DEFAULT 'planning',
  repository_url VARCHAR(255),
  production_url VARCHAR(255),
  start_date DATE NOT NULL,
  estimated_end_date DATE NOT NULL,
  actual_end_date DATE NULL,
  total_budget DECIMAL(14,2) NOT NULL,
  currency_code CHAR(3) NOT NULL DEFAULT 'PEN',
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  deleted_at TIMESTAMP(6) NULL,
  CONSTRAINT fk_projects_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
  CONSTRAINT fk_projects_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL,
  CONSTRAINT fk_projects_service FOREIGN KEY (service_id) REFERENCES service_catalog(id) ON DELETE RESTRICT,
  CONSTRAINT ck_projects_status CHECK (status IN ('planning', 'in_development', 'qa', 'deployed', 'maintenance')),
  CONSTRAINT ck_projects_dates CHECK (
    estimated_end_date >= start_date AND
    (actual_end_date IS NULL OR actual_end_date >= start_date)
  ),
  CONSTRAINT ck_projects_budget CHECK (total_budget >= 0),
  CONSTRAINT ck_projects_currency CHECK (currency_code = UPPER(currency_code))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE project_milestones (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  project_id CHAR(36) NOT NULL,
  title VARCHAR(180) NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'pending',
  payment_percentage DECIMAL(5,2) NOT NULL,
  completed_at TIMESTAMP(6) NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT fk_project_milestones_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT ck_project_milestones_status CHECK (status IN ('pending', 'completed', 'delayed')),
  CONSTRAINT ck_project_milestones_payment CHECK (payment_percentage BETWEEN 0 AND 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- Files, contact and complaints
-- =========================================================

CREATE TABLE file_assets (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  original_name VARCHAR(255) NOT NULL,
  storage_provider VARCHAR(40) NOT NULL DEFAULT 'local',
  storage_key TEXT NOT NULL,
  public_url TEXT,
  mime_type VARCHAR(120) NOT NULL,
  byte_size BIGINT NOT NULL,
  checksum_sha256 CHAR(64),
  uploaded_by CHAR(36),
  uploaded_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  deleted_at TIMESTAMP(6) NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  created_by CHAR(36) NULL,
  updated_by CHAR(36) NULL,
  CONSTRAINT fk_file_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_file_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_file_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT ck_file_assets_size CHECK (byte_size > 0),
  CONSTRAINT ck_file_assets_storage CHECK (storage_provider IN ('local', 's3', 'cloudinary', 'gcs', 'azure'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE contact_categories (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  code VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  description TEXT,
  default_priority_id CHAR(36),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  deleted_at TIMESTAMP(6) NULL,
  created_by CHAR(36) NULL,
  updated_by CHAR(36) NULL,
  CONSTRAINT fk_contact_categories_priority FOREIGN KEY (default_priority_id) REFERENCES priority_catalog(id) ON DELETE SET NULL,
  CONSTRAINT fk_contact_categories_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_contact_categories_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE contact_cases (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  case_code VARCHAR(40) NOT NULL UNIQUE,
  customer_id CHAR(36) NOT NULL,
  organization_id CHAR(36),
  category_id CHAR(36),
  service_id CHAR(36),
  status_id CHAR(36) NOT NULL,
  priority_id CHAR(36),
  source_channel_id CHAR(36),
  subject VARCHAR(220),
  message TEXT,
  assigned_to CHAR(36),
  first_response_due_at TIMESTAMP(6) NULL,
  resolved_at TIMESTAMP(6) NULL,
  closed_at TIMESTAMP(6) NULL,
  internal_notes TEXT NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  deleted_at TIMESTAMP(6) NULL,
  created_by CHAR(36) NULL,
  updated_by CHAR(36) NULL,
  CONSTRAINT fk_contact_cases_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
  CONSTRAINT fk_contact_cases_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL,
  CONSTRAINT fk_contact_cases_category FOREIGN KEY (category_id) REFERENCES contact_categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_contact_cases_service FOREIGN KEY (service_id) REFERENCES service_catalog(id) ON DELETE SET NULL,
  CONSTRAINT fk_contact_cases_status FOREIGN KEY (status_id) REFERENCES status_catalog(id) ON DELETE RESTRICT,
  CONSTRAINT fk_contact_cases_priority FOREIGN KEY (priority_id) REFERENCES priority_catalog(id) ON DELETE SET NULL,
  CONSTRAINT fk_contact_cases_channel FOREIGN KEY (source_channel_id) REFERENCES channel_catalog(id) ON DELETE SET NULL,
  CONSTRAINT fk_contact_cases_assignee FOREIGN KEY (assigned_to) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_contact_cases_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_contact_cases_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT ck_contact_cases_dates CHECK (
    (resolved_at IS NULL OR resolved_at >= created_at) AND
    (closed_at IS NULL OR closed_at >= created_at)
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE contact_case_messages (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  contact_case_id CHAR(36) NOT NULL,
  sender_type VARCHAR(30) NOT NULL,
  admin_user_id CHAR(36),
  customer_id CHAR(36),
  body TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT FALSE,
  sent_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  deleted_at TIMESTAMP(6) NULL,
  created_by CHAR(36) NULL,
  updated_by CHAR(36) NULL,
  CONSTRAINT fk_contact_messages_case FOREIGN KEY (contact_case_id) REFERENCES contact_cases(id) ON DELETE RESTRICT,
  CONSTRAINT fk_contact_messages_admin FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_contact_messages_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  CONSTRAINT fk_contact_messages_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_contact_messages_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT ck_contact_messages_sender CHECK (sender_type IN ('customer', 'admin', 'system')),
  CONSTRAINT ck_contact_messages_sender_consistency CHECK (
    (sender_type = 'customer' AND customer_id IS NOT NULL AND admin_user_id IS NULL) OR
    (sender_type = 'admin' AND admin_user_id IS NOT NULL AND customer_id IS NULL) OR
    (sender_type = 'system' AND customer_id IS NULL AND admin_user_id IS NULL)
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE contact_case_attachments (
  contact_case_id CHAR(36) NOT NULL,
  file_asset_id CHAR(36) NOT NULL,
  message_id CHAR(36),
  evidence_type VARCHAR(80),
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  created_by CHAR(36) NULL,
  PRIMARY KEY (contact_case_id, file_asset_id),
  CONSTRAINT fk_contact_attachments_case FOREIGN KEY (contact_case_id) REFERENCES contact_cases(id) ON DELETE RESTRICT,
  CONSTRAINT fk_contact_attachments_file FOREIGN KEY (file_asset_id) REFERENCES file_assets(id) ON DELETE RESTRICT,
  CONSTRAINT fk_contact_attachments_message FOREIGN KEY (message_id) REFERENCES contact_case_messages(id) ON DELETE SET NULL,
  CONSTRAINT fk_contact_attachments_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE contact_case_status_history (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  contact_case_id CHAR(36) NOT NULL,
  old_status_id CHAR(36),
  new_status_id CHAR(36) NOT NULL,
  changed_by CHAR(36),
  reason TEXT,
  changed_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT fk_contact_history_case FOREIGN KEY (contact_case_id) REFERENCES contact_cases(id) ON DELETE RESTRICT,
  CONSTRAINT fk_contact_history_old_status FOREIGN KEY (old_status_id) REFERENCES status_catalog(id) ON DELETE SET NULL,
  CONSTRAINT fk_contact_history_new_status FOREIGN KEY (new_status_id) REFERENCES status_catalog(id) ON DELETE RESTRICT,
  CONSTRAINT fk_contact_history_changed_by FOREIGN KEY (changed_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE contact_case_assignments (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  contact_case_id CHAR(36) NOT NULL,
  assigned_to CHAR(36) NOT NULL,
  assigned_by CHAR(36),
  assigned_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  unassigned_at TIMESTAMP(6) NULL,
  notes TEXT,
  CONSTRAINT fk_contact_assignments_case FOREIGN KEY (contact_case_id) REFERENCES contact_cases(id) ON DELETE RESTRICT,
  CONSTRAINT fk_contact_assignments_to FOREIGN KEY (assigned_to) REFERENCES admin_users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_contact_assignments_by FOREIGN KEY (assigned_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT ck_contact_assignments_dates CHECK (unassigned_at IS NULL OR unassigned_at >= assigned_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE complaint_types (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  code VARCHAR(40) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  legal_description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  deleted_at TIMESTAMP(6) NULL,
  created_by CHAR(36) NULL,
  updated_by CHAR(36) NULL,
  CONSTRAINT fk_complaint_types_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_complaint_types_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE complaint_reasons (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  code VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  deleted_at TIMESTAMP(6) NULL,
  created_by CHAR(36) NULL,
  updated_by CHAR(36) NULL,
  CONSTRAINT fk_complaint_reasons_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_complaint_reasons_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE complaints (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  complaint_code VARCHAR(40) NOT NULL UNIQUE,
  customer_id CHAR(36) NOT NULL,
  organization_id CHAR(36),
  complaint_type_id CHAR(36) NOT NULL,
  complaint_reason_id CHAR(36),
  status_id CHAR(36) NOT NULL,
  priority_id CHAR(36),
  source_channel_id CHAR(36),
  legal_acceptance BOOLEAN NOT NULL DEFAULT FALSE,
  legal_acceptance_at TIMESTAMP(6) NULL,
  legal_response_due_at TIMESTAMP(6) NOT NULL,
  extension_requested_at TIMESTAMP(6) NULL,
  extension_reason TEXT,
  extended_response_due_at TIMESTAMP(6) NULL,
  assigned_to CHAR(36),
  submitted_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  acknowledged_at TIMESTAMP(6) NULL,
  responded_at TIMESTAMP(6) NULL,
  closed_at TIMESTAMP(6) NULL,
  internal_notes TEXT NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  deleted_at TIMESTAMP(6) NULL,
  created_by CHAR(36) NULL,
  updated_by CHAR(36) NULL,
  CONSTRAINT fk_complaints_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
  CONSTRAINT fk_complaints_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL,
  CONSTRAINT fk_complaints_type FOREIGN KEY (complaint_type_id) REFERENCES complaint_types(id) ON DELETE RESTRICT,
  CONSTRAINT fk_complaints_reason FOREIGN KEY (complaint_reason_id) REFERENCES complaint_reasons(id) ON DELETE SET NULL,
  CONSTRAINT fk_complaints_status FOREIGN KEY (status_id) REFERENCES status_catalog(id) ON DELETE RESTRICT,
  CONSTRAINT fk_complaints_priority FOREIGN KEY (priority_id) REFERENCES priority_catalog(id) ON DELETE SET NULL,
  CONSTRAINT fk_complaints_channel FOREIGN KEY (source_channel_id) REFERENCES channel_catalog(id) ON DELETE SET NULL,
  CONSTRAINT fk_complaints_assignee FOREIGN KEY (assigned_to) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_complaints_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_complaints_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT ck_complaints_legal_acceptance CHECK (legal_acceptance = FALSE OR legal_acceptance_at IS NOT NULL),
  CONSTRAINT ck_complaints_dates CHECK (
    legal_response_due_at >= submitted_at AND
    (extended_response_due_at IS NULL OR extended_response_due_at >= legal_response_due_at) AND
    (closed_at IS NULL OR closed_at >= submitted_at)
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE complaint_goods (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  complaint_id CHAR(36) NOT NULL,
  good_type VARCHAR(30) NOT NULL,
  description VARCHAR(240) NOT NULL,
  project_or_unit_name VARCHAR(160),
  category VARCHAR(120),
  claimed_amount DECIMAL(14,2),
  currency_code CHAR(3) NOT NULL DEFAULT 'PEN',
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  deleted_at TIMESTAMP(6) NULL,
  created_by CHAR(36) NULL,
  updated_by CHAR(36) NULL,
  CONSTRAINT fk_complaint_goods_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE RESTRICT,
  CONSTRAINT fk_complaint_goods_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_complaint_goods_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT ck_complaint_goods_type CHECK (good_type IN ('product', 'service')),
  CONSTRAINT ck_complaint_goods_amount CHECK (claimed_amount IS NULL OR claimed_amount >= 0),
  CONSTRAINT ck_complaint_goods_currency CHECK (currency_code = UPPER(currency_code))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE complaint_details (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  complaint_id CHAR(36) NOT NULL,
  incident_detail TEXT NOT NULL,
  requested_solution TEXT NOT NULL,
  incident_occurred_at TIMESTAMP(6) NULL,
  customer_ip VARCHAR(45),
  customer_user_agent TEXT,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  deleted_at TIMESTAMP(6) NULL,
  created_by CHAR(36) NULL,
  updated_by CHAR(36) NULL,
  CONSTRAINT fk_complaint_details_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE RESTRICT,
  CONSTRAINT fk_complaint_details_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_complaint_details_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT uq_complaint_details_complaint UNIQUE (complaint_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE complaint_evidences (
  complaint_id CHAR(36) NOT NULL,
  file_asset_id CHAR(36) NOT NULL,
  evidence_type VARCHAR(80) NOT NULL DEFAULT 'customer_attachment',
  description TEXT,
  submitted_by_customer BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  created_by CHAR(36) NULL,
  PRIMARY KEY (complaint_id, file_asset_id),
  CONSTRAINT fk_complaint_evidences_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE RESTRICT,
  CONSTRAINT fk_complaint_evidences_file FOREIGN KEY (file_asset_id) REFERENCES file_assets(id) ON DELETE RESTRICT,
  CONSTRAINT fk_complaint_evidences_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE complaint_responses (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  complaint_id CHAR(36) NOT NULL,
  response_type VARCHAR(40) NOT NULL,
  body TEXT NOT NULL,
  resolution_summary TEXT,
  sent_to_email VARCHAR(180),
  sent_by CHAR(36),
  sent_at TIMESTAMP(6) NULL,
  is_final BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  deleted_at TIMESTAMP(6) NULL,
  created_by CHAR(36) NULL,
  updated_by CHAR(36) NULL,
  CONSTRAINT fk_complaint_responses_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE RESTRICT,
  CONSTRAINT fk_complaint_responses_sent_by FOREIGN KEY (sent_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_complaint_responses_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_complaint_responses_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT ck_complaint_responses_type CHECK (response_type IN ('acknowledgement', 'extension_notice', 'final_response', 'internal_note'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE complaint_status_history (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  complaint_id CHAR(36) NOT NULL,
  old_status_id CHAR(36),
  new_status_id CHAR(36) NOT NULL,
  changed_by CHAR(36),
  reason TEXT,
  legal_impact BOOLEAN NOT NULL DEFAULT FALSE,
  changed_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT fk_complaint_history_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE RESTRICT,
  CONSTRAINT fk_complaint_history_old_status FOREIGN KEY (old_status_id) REFERENCES status_catalog(id) ON DELETE SET NULL,
  CONSTRAINT fk_complaint_history_new_status FOREIGN KEY (new_status_id) REFERENCES status_catalog(id) ON DELETE RESTRICT,
  CONSTRAINT fk_complaint_history_changed_by FOREIGN KEY (changed_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE complaint_time_events (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  complaint_id CHAR(36) NOT NULL,
  event_type VARCHAR(80) NOT NULL,
  event_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  deadline_at TIMESTAMP(6) NULL,
  business_days_elapsed INT,
  notes TEXT,
  created_by CHAR(36) NULL,
  CONSTRAINT fk_complaint_time_events_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE RESTRICT,
  CONSTRAINT fk_complaint_time_events_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT ck_complaint_time_elapsed CHECK (business_days_elapsed IS NULL OR business_days_elapsed >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE complaint_assignments (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  complaint_id CHAR(36) NOT NULL,
  assigned_to CHAR(36) NOT NULL,
  assigned_by CHAR(36),
  assigned_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  unassigned_at TIMESTAMP(6) NULL,
  notes TEXT,
  CONSTRAINT fk_complaint_assignments_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE RESTRICT,
  CONSTRAINT fk_complaint_assignments_to FOREIGN KEY (assigned_to) REFERENCES admin_users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_complaint_assignments_by FOREIGN KEY (assigned_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT ck_complaint_assignments_dates CHECK (unassigned_at IS NULL OR unassigned_at >= assigned_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- Notifications, audit, logs, reporting and CMS
-- =========================================================

CREATE TABLE notification_templates (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  code VARCHAR(100) NOT NULL UNIQUE,
  channel VARCHAR(40) NOT NULL,
  subject VARCHAR(220),
  body_template TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  deleted_at TIMESTAMP(6) NULL,
  created_by CHAR(36) NULL,
  updated_by CHAR(36) NULL,
  CONSTRAINT fk_notification_templates_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_notification_templates_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT ck_notification_templates_channel CHECK (channel IN ('email', 'sms', 'whatsapp', 'in_app', 'webhook'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE notification_events (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  template_id CHAR(36),
  recipient_email VARCHAR(180),
  recipient_phone VARCHAR(40),
  channel VARCHAR(40) NOT NULL,
  entity_type VARCHAR(80),
  entity_id CHAR(36),
  status VARCHAR(40) NOT NULL DEFAULT 'pending',
  provider_message_id VARCHAR(160),
  error_message TEXT,
  scheduled_at TIMESTAMP(6) NULL,
  sent_at TIMESTAMP(6) NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  created_by CHAR(36) NULL,
  updated_by CHAR(36) NULL,
  CONSTRAINT fk_notification_events_template FOREIGN KEY (template_id) REFERENCES notification_templates(id) ON DELETE SET NULL,
  CONSTRAINT fk_notification_events_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_notification_events_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT ck_notification_events_status CHECK (status IN ('pending', 'sent', 'failed', 'cancelled'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE admin_notifications (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  admin_user_id CHAR(36) NOT NULL,
  title VARCHAR(180) NOT NULL,
  body TEXT,
  entity_type VARCHAR(80),
  entity_id CHAR(36),
  read_at TIMESTAMP(6) NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT fk_admin_notifications_user FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE admin_audit_logs (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  admin_id CHAR(36),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id CHAR(36),
  ip_address VARCHAR(45),
  user_agent TEXT,
  before_data JSON,
  after_data JSON,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT fk_admin_audit_admin FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE data_change_history (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  entity_type VARCHAR(80) NOT NULL,
  entity_id CHAR(36) NOT NULL,
  changed_by CHAR(36),
  change_type VARCHAR(40) NOT NULL,
  field_name VARCHAR(120),
  old_value TEXT,
  new_value TEXT,
  reason TEXT,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT fk_data_change_changed_by FOREIGN KEY (changed_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT ck_data_change_history_type CHECK (change_type IN ('insert', 'update', 'delete', 'restore'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE system_logs (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  level VARCHAR(20) NOT NULL,
  source VARCHAR(120) NOT NULL,
  message TEXT NOT NULL,
  context JSON,
  trace_id VARCHAR(120),
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT ck_system_logs_level CHECK (level IN ('debug', 'info', 'warning', 'error', 'critical'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE saved_reports (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  code VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(180) NOT NULL,
  description TEXT,
  report_domain VARCHAR(80) NOT NULL,
  query_config JSON NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  deleted_at TIMESTAMP(6) NULL,
  created_by CHAR(36) NULL,
  updated_by CHAR(36) NULL,
  CONSTRAINT fk_saved_reports_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_saved_reports_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE dashboard_widgets (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  report_id CHAR(36),
  code VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(180) NOT NULL,
  widget_type VARCHAR(40) NOT NULL,
  position_config JSON NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  deleted_at TIMESTAMP(6) NULL,
  created_by CHAR(36) NULL,
  updated_by CHAR(36) NULL,
  CONSTRAINT fk_dashboard_widgets_report FOREIGN KEY (report_id) REFERENCES saved_reports(id) ON DELETE SET NULL,
  CONSTRAINT fk_dashboard_widgets_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_dashboard_widgets_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE system_settings (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  setting_key VARCHAR(120) NOT NULL UNIQUE,
  setting_value JSON NOT NULL,
  description TEXT,
  is_sensitive BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  deleted_at TIMESTAMP(6) NULL,
  created_by CHAR(36) NULL,
  updated_by CHAR(36) NULL,
  CONSTRAINT fk_system_settings_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_system_settings_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE cms_pages (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  slug VARCHAR(160) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  meta_title VARCHAR(220),
  meta_description VARCHAR(320),
  status_id CHAR(36),
  published_at TIMESTAMP(6) NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  deleted_at TIMESTAMP(6) NULL,
  created_by CHAR(36) NULL,
  updated_by CHAR(36) NULL,
  CONSTRAINT fk_cms_pages_status FOREIGN KEY (status_id) REFERENCES status_catalog(id) ON DELETE SET NULL,
  CONSTRAINT fk_cms_pages_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_cms_pages_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE cms_blocks (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  page_id CHAR(36) NOT NULL,
  block_key VARCHAR(120) NOT NULL,
  block_type VARCHAR(60) NOT NULL,
  content JSON NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  deleted_at TIMESTAMP(6) NULL,
  created_by CHAR(36) NULL,
  updated_by CHAR(36) NULL,
  CONSTRAINT uq_cms_blocks_page_key UNIQUE (page_id, block_key),
  CONSTRAINT fk_cms_blocks_page FOREIGN KEY (page_id) REFERENCES cms_pages(id) ON DELETE CASCADE,
  CONSTRAINT fk_cms_blocks_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_cms_blocks_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE banners (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  page_id CHAR(36),
  file_asset_id CHAR(36),
  title VARCHAR(180),
  body TEXT,
  link_url VARCHAR(255),
  placement VARCHAR(80) NOT NULL,
  starts_at TIMESTAMP(6) NULL,
  ends_at TIMESTAMP(6) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  deleted_at TIMESTAMP(6) NULL,
  created_by CHAR(36) NULL,
  updated_by CHAR(36) NULL,
  CONSTRAINT fk_banners_page FOREIGN KEY (page_id) REFERENCES cms_pages(id) ON DELETE SET NULL,
  CONSTRAINT fk_banners_file FOREIGN KEY (file_asset_id) REFERENCES file_assets(id) ON DELETE SET NULL,
  CONSTRAINT fk_banners_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_banners_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT ck_banners_dates CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at > starts_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE menu_items (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  parent_id CHAR(36),
  label VARCHAR(120) NOT NULL,
  url VARCHAR(255),
  route_name VARCHAR(120),
  icon_name VARCHAR(80),
  permission_id CHAR(36),
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  deleted_at TIMESTAMP(6) NULL,
  created_by CHAR(36) NULL,
  updated_by CHAR(36) NULL,
  CONSTRAINT fk_menu_parent FOREIGN KEY (parent_id) REFERENCES menu_items(id) ON DELETE CASCADE,
  CONSTRAINT fk_menu_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE SET NULL,
  CONSTRAINT fk_menu_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_menu_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- Strict JSON object integrity constraints
-- =========================================================

ALTER TABLE cms_blocks
  ADD CONSTRAINT ck_cms_blocks_content_json_object CHECK (JSON_TYPE(content) = 'OBJECT');

ALTER TABLE admin_audit_logs
  ADD CONSTRAINT ck_admin_audit_logs_before_data_json_object CHECK (JSON_TYPE(before_data) = 'OBJECT'),
  ADD CONSTRAINT ck_admin_audit_logs_after_data_json_object CHECK (JSON_TYPE(after_data) = 'OBJECT');

ALTER TABLE system_settings
  ADD CONSTRAINT ck_system_settings_setting_value_json_object CHECK (JSON_TYPE(setting_value) = 'OBJECT');

ALTER TABLE saved_reports
  ADD CONSTRAINT ck_saved_reports_query_config_json_object CHECK (JSON_TYPE(query_config) = 'OBJECT');

-- =========================================================
-- Strategic indexes
-- =========================================================

CREATE INDEX idx_admin_users_active_email ON admin_users (is_active, email);
CREATE INDEX idx_admin_sessions_user_expires ON admin_sessions (admin_user_id, expires_at DESC);
CREATE INDEX idx_customers_email ON customers (primary_email);
CREATE INDEX idx_customer_documents_number ON customer_documents (document_number);
CREATE INDEX idx_customer_documents_customer ON customer_documents (customer_id);
CREATE INDEX idx_organizations_ruc ON organizations (ruc);
CREATE INDEX idx_customer_addresses_customer ON customer_addresses (customer_id, is_primary DESC);
CREATE INDEX idx_customer_organizations_organization ON customer_organizations (organization_id);
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
CREATE INDEX idx_cms_pages_slug_active ON cms_pages (slug, deleted_at);

-- =========================================================
-- Legal delete protection triggers
-- =========================================================

DELIMITER $$

CREATE TRIGGER trg_contact_attachments_validate_message
BEFORE INSERT ON contact_case_attachments
FOR EACH ROW
BEGIN
  IF NEW.message_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM contact_case_messages WHERE id = NEW.message_id AND contact_case_id = NEW.contact_case_id) THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Message must belong to the same case';
    END IF;
  END IF;
END$$

CREATE TRIGGER trg_complaints_prevent_delete
BEFORE DELETE ON complaints
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Legal records must be soft-deleted or closed, not physically deleted';
END$$

CREATE TRIGGER trg_complaint_details_prevent_delete
BEFORE DELETE ON complaint_details
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Legal records must be soft-deleted or closed, not physically deleted';
END$$

CREATE TRIGGER trg_complaint_responses_prevent_delete
BEFORE DELETE ON complaint_responses
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Legal records must be soft-deleted or closed, not physically deleted';
END$$

CREATE TRIGGER trg_complaint_evidences_prevent_delete
BEFORE DELETE ON complaint_evidences
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Legal records must be soft-deleted or closed, not physically deleted';
END$$

DELIMITER ;

-- =========================================================
-- Minimal seed data
-- =========================================================

INSERT IGNORE INTO admin_users (id, email, name, password_hash, role, created_by, updated_by, created_at, updated_at)
VALUES (UUID(), 'system@internal', 'System', 'SYSTEM_HASH', 'super_admin', NULL, NULL, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6));

INSERT IGNORE INTO roles (code, name, is_system) VALUES
  ('super_admin', 'Super administrador', TRUE),
  ('admin', 'Administrador', TRUE),
  ('support_agent', 'Agente de soporte', TRUE),
  ('legal_reviewer', 'Revisor legal', TRUE);

INSERT IGNORE INTO channel_catalog (code, name) VALUES
  ('web', 'Web'),
  ('email', 'Email'),
  ('phone', 'Telefono'),
  ('admin', 'Panel admin');

INSERT IGNORE INTO priority_catalog (code, name, weight, sla_hours) VALUES
  ('low', 'Baja', 10, 72),
  ('normal', 'Normal', 30, 48),
  ('high', 'Alta', 70, 24),
  ('urgent', 'Urgente', 100, 8);

INSERT IGNORE INTO status_catalog (domain, code, name, sort_order, is_terminal) VALUES
  ('case', 'new', 'Nuevo', 10, FALSE),
  ('case', 'read', 'Leido', 20, FALSE),
  ('case', 'in_progress', 'En proceso', 30, FALSE),
  ('case', 'responded', 'Respondido', 40, FALSE),
  ('case', 'closed', 'Cerrado', 50, TRUE),
  ('cms', 'draft', 'Borrador', 10, FALSE),
  ('cms', 'published', 'Publicado', 20, FALSE),
  ('cms', 'archived', 'Archivado', 30, TRUE);

INSERT IGNORE INTO countries (iso2, name, dial_code, phone_max_length) VALUES
  ('PE', 'Peru', '+51', 9),
  ('MX', 'Mexico', '+52', 10),
  ('CO', 'Colombia', '+57', 10),
  ('CL', 'Chile', '+56', 9),
  ('US', 'Estados Unidos', '+1', 10),
  ('ES', 'Espana', '+34', 9);

INSERT IGNORE INTO document_types (code, name, min_length, max_length, is_company_document) VALUES
  ('DNI', 'Documento nacional de identidad', 8, 8, FALSE),
  ('CE', 'Carnet de extranjeria', 6, 12, FALSE),
  ('RUC', 'Registro unico de contribuyentes', 11, 11, TRUE);

INSERT IGNORE INTO service_catalog (code, name) VALUES
  ('web', 'Pagina web'),
  ('app', 'App movil'),
  ('desktop', 'App de escritorio'),
  ('custom_software', 'Software a medida');

INSERT IGNORE INTO complaint_types (code, name, legal_description) VALUES
  ('queja', 'Queja', 'Malestar o descontento no relacionado directamente con el bien contratado.'),
  ('reclamo', 'Reclamo', 'Disconformidad relacionada con productos o servicios contratados.');

SET FOREIGN_KEY_CHECKS = 1;
