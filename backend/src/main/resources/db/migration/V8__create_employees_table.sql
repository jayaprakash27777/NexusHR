-- =============================================
-- V8: Create employees table + employee ID sequence
-- =============================================
CREATE SEQUENCE employee_id_seq START WITH 1001 INCREMENT BY 1;

CREATE TABLE employees (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id     VARCHAR(20) NOT NULL UNIQUE,
    user_id         UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    phone           VARCHAR(20),
    date_of_birth   DATE,
    gender          VARCHAR(20),
    address         TEXT,
    department_id   UUID REFERENCES departments(id) ON DELETE SET NULL,
    designation     VARCHAR(100),
    salary          DECIMAL(15, 2) DEFAULT 0 NOT NULL,
    joining_date    DATE NOT NULL,
    manager_id      UUID REFERENCES employees(id) ON DELETE SET NULL,
    status          VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    CONSTRAINT chk_employee_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'ON_NOTICE', 'TERMINATED'))
);

-- Now add the FK from departments.manager_id -> employees.id
ALTER TABLE departments
    ADD CONSTRAINT fk_dept_manager
    FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX idx_employees_employee_id ON employees(employee_id);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_department_id ON employees(department_id);
CREATE INDEX idx_employees_manager_id ON employees(manager_id);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_employees_joining_date ON employees(joining_date);
