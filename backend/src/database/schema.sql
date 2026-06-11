CREATE DATABASE IF NOT EXISTS alandick_ops_db;
USE alandick_ops_db;

CREATE TABLE IF NOT EXISTS sites (
    no VARCHAR(50) PRIMARY KEY,
    site_name VARCHAR(255),
    power_source VARCHAR(100),
    router_status VARCHAR(100),
    ip_address VARCHAR(45),
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    on_air_date DATE,
    region VARCHAR(100),
    rectifier_type VARCHAR(100),
    tenants VARCHAR(255),
    reon_integration VARCHAR(50),
    rectifier_capacity VARCHAR(50),
    rectifier_max_capacity VARCHAR(50),
    security_company VARCHAR(100),
    site_type VARCHAR(100),
    electronic_lock_id VARCHAR(100),
    field_engineer VARCHAR(100),
    field_engineer_email VARCHAR(100),
    field_engineer_phone VARCHAR(50),
    second_field_engineer VARCHAR(100),
    second_field_engineer_email VARCHAR(100),
    second_field_engineer_phone VARCHAR(50),
    aps_amf_board VARCHAR(100),
    generator_type VARCHAR(100),
    generator_tank_capacity VARCHAR(50),
    external_fuel_probe VARCHAR(100),
    dc_meter_installation_date DATE,
    dc_meter VARCHAR(100),
    battery_type VARCHAR(100),
    battery_capacity VARCHAR(50),
    priority TINYINT,
    solar_panels VARCHAR(50),
    solar_capacity VARCHAR(50),
    solar_panel_brand VARCHAR(100),
    solar_charge_controller_tracer VARCHAR(100),
    solar_charge_controller_flatpack VARCHAR(100),
    megmeet_mppt VARCHAR(100),
    sanctioned_load VARCHAR(50),
    sla VARCHAR(100),
    data_integrity VARCHAR(255),
    software_cleanup VARCHAR(255),
    comments TEXT
);

CREATE TABLE IF NOT EXISTS users (
    no VARCHAR(50) PRIMARY KEY,
    user_name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(50),
    reon_onboarding VARCHAR(100),
    department VARCHAR(255),
    access_group VARCHAR(255),
    access_level VARCHAR(100),
    region VARCHAR(100),
    sites TEXT,
    roles VARCHAR(255),
    rbac_role ENUM('Read-Only', 'CRUD', 'Admin') DEFAULT 'Read-Only',
    password_hash VARCHAR(255) NULL,
    reset_token VARCHAR(255) NULL,
    reset_token_expires BIGINT NULL
);

CREATE TABLE IF NOT EXISTS escalations (
    no VARCHAR(255) PRIMARY KEY,
    alarm VARCHAR(255),
    event VARCHAR(255),
    issue_type VARCHAR(255),
    level1 VARCHAR(255),
    level2 VARCHAR(255),
    level3 VARCHAR(255),
    method VARCHAR(255),
    notification_time VARCHAR(255),
    designator VARCHAR(255),
    approval_l1 VARCHAR(255),
    approval_l2 VARCHAR(255),
    approval_l3 VARCHAR(255),
    scope_designee VARCHAR(255),
    reviewer_l1 VARCHAR(255),
    reviewer_l2 VARCHAR(255),
    reviewer_l3 VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS pm_checklists (
    no VARCHAR(255) PRIMARY KEY,
    section VARCHAR(255),
    field VARCHAR(255),
    input_type VARCHAR(255),
    options TEXT,
    format VARCHAR(255),
    restrictions VARCHAR(255),
    picture_required VARCHAR(255),
    snag_category VARCHAR(255),
    priority VARCHAR(255),
    response VARCHAR(255),
    comments TEXT
);

CREATE TABLE IF NOT EXISTS revision_summaries (
    no VARCHAR(255) PRIMARY KEY,
    scope VARCHAR(255),
    description TEXT,
    revision_category VARCHAR(255),
    revision_date DATE
);

CREATE TABLE IF NOT EXISTS fueling_checklists (
    no VARCHAR(255) PRIMARY KEY,
    section VARCHAR(255),
    field VARCHAR(255),
    input_type VARCHAR(255),
    options TEXT,
    format VARCHAR(255),
    restrictions VARCHAR(255),
    picture_required VARCHAR(255),
    snag_category VARCHAR(255),
    priority VARCHAR(255),
    response VARCHAR(255),
    comments TEXT
);

CREATE TABLE IF NOT EXISTS cm_checklists (
    no VARCHAR(255) PRIMARY KEY,
    section VARCHAR(255),
    field VARCHAR(255),
    input_type VARCHAR(255),
    options TEXT,
    format VARCHAR(255),
    restrictions VARCHAR(255),
    picture_required VARCHAR(255),
    snag_category VARCHAR(255),
    priority VARCHAR(255),
    response VARCHAR(255),
    comments TEXT
);

CREATE TABLE IF NOT EXISTS work_order_checklists (
    no VARCHAR(255) PRIMARY KEY,
    parameters VARCHAR(255),
    status VARCHAR(255),
    options TEXT
);

CREATE TABLE IF NOT EXISTS wo_approval_workflows (
    no VARCHAR(255) PRIMARY KEY,
    alarm VARCHAR(255),
    event VARCHAR(255),
    issue_type VARCHAR(255),
    level1 VARCHAR(255),
    level2 VARCHAR(255),
    level3 VARCHAR(255),
    method VARCHAR(255),
    notification_time VARCHAR(255),
    designator VARCHAR(255),
    approval_l1 VARCHAR(255),
    scope_designee VARCHAR(255),
    reviewer_l1 VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS excel_sheet_rows (
    id VARCHAR(255) PRIMARY KEY,
    sheet_name VARCHAR(255) NOT NULL,
    excel_row_number INT NOT NULL,
    row_data JSON NOT NULL,
    UNIQUE KEY unique_sheet_row (sheet_name, excel_row_number)
);
