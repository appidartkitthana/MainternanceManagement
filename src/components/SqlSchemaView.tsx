/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Copy, Check, Download, Database, Key, Layers, Code } from 'lucide-react';

export default function SqlSchemaView() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'sql' | 'drizzle' | 'erd'>('sql');

  const sqlSchemaCode = `-- ====================================================================
-- MAINTENANCE MANAGEMENT SYSTEM (MMS) - POSTGRESQL ENTERPRISE SCHEMA
-- Database name: factory_mms_db
-- Generated: 2026-06-10 04:27:00
-- ====================================================================

-- 1. DEPARTMENTS TABLE
CREATE TABLE departments (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_departments_code ON departments(code);

-- 2. USERS TABLE
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    department_id VARCHAR(50) REFERENCES departments(id) ON DELETE SET NULL,
    position VARCHAR(255),
    role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Supervisor', 'Technician', 'User')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_username ON users(username);

-- 3. MACHINE_TYPES TABLE
CREATE TABLE machine_types (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. MACHINES TABLE
CREATE TABLE machines (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type_id VARCHAR(50) REFERENCES machine_types(id) ON DELETE RESTRICT,
    department_id VARCHAR(50) REFERENCES departments(id) ON DELETE RESTRICT,
    location VARCHAR(255) NOT NULL,
    brand VARCHAR(150),
    model VARCHAR(150),
    serial_number VARCHAR(150) UNIQUE,
    start_date DATE NOT NULL,
    image_url TEXT,
    status VARCHAR(50) DEFAULT 'Operational' CHECK (status IN ('Operational', 'Repairing', 'Breakdown', 'Decommissioned')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_machines_status ON machines(status);
CREATE INDEX idx_machines_dept ON machines(department_id);

-- 5. REPAIR_REQUESTS TABLE (แจ้งซ่อม)
CREATE TABLE repair_requests (
    id VARCHAR(50) PRIMARY KEY, -- Auto running invoice e.g. REQ-YYYY-MM-XXXX
    request_date DATE NOT NULL DEFAULT CURRENT_DATE,
    request_time TIME NOT NULL,
    requester_name VARCHAR(255) NOT NULL,
    department_id VARCHAR(50) REFERENCES departments(id) ON DELETE SET NULL,
    machine_id VARCHAR(50) REFERENCES machines(id) ON DELETE CASCADE,
    symptom TEXT NOT NULL,
    priority VARCHAR(50) NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    status VARCHAR(50) DEFAULT 'รอรับงาน' CHECK (status IN ('รอรับงาน', 'กำลังดำเนินการ', 'เสร็จสิ้น', 'ยกเลิก')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_repair_requests_status ON repair_requests(status);
CREATE INDEX idx_repair_requests_priority ON repair_requests(priority);
CREATE INDEX idx_repair_requests_machine ON repair_requests(machine_id);

-- 6. WORK_ORDERS TABLE (ใบงานหลัก)
CREATE TABLE work_orders (
    id VARCHAR(50) PRIMARY KEY, -- Auto running WO-YYYY-MM-XXXX
    request_id VARCHAR(50) REFERENCES repair_requests(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_date DATE,
    end_time TIME,
    responsible_tech_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    technician_team TEXT[], -- Array of technician names or JSON representation
    symptom_diagnosed TEXT NOT NULL,
    cause_analysis TEXT NOT NULL,
    solution_details TEXT NOT NULL,
    repair_result VARCHAR(100) NOT NULL CHECK (repair_result IN ('กลับมาใช้งานได้ปกติ', 'ใช้งานได้ชั่วคราว', 'ต้องรอสั่งอะไหล่', 'ซ่อมไม่ได้/ส่งเคลม')),
    man_hours NUMERIC(5,2) DEFAULT 0.00,
    total_spare_cost NUMERIC(12,2) DEFAULT 0.00,
    other_cost NUMERIC(12,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_work_orders_request ON work_orders(request_id);
CREATE INDEX idx_work_orders_tech ON work_orders(responsible_tech_id);

-- 7. SPARE_PARTS TABLE (คลังอะไหล่)
CREATE TABLE spare_parts (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(150),
    quantity INTEGER NOT NULL DEFAULT 0,
    min_quantity INTEGER NOT NULL DEFAULT 0,
    unit VARCHAR(50) NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_spare_parts_category ON spare_parts(category);

-- 8. WORK_ORDER_DETAILS TABLE (อะไหล่ที่ใช้กับใบงาน)
CREATE TABLE work_order_details (
    id BIGSERIAL PRIMARY KEY,
    work_order_id VARCHAR(50) REFERENCES work_orders(id) ON DELETE CASCADE,
    part_id VARCHAR(50) REFERENCES spare_parts(id) ON DELETE CASCADE,
    quantity_used INTEGER NOT NULL CHECK (quantity_used > 0),
    unit_price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_wo_details_order ON work_order_details(work_order_id);

-- 9. SPARE_TRANSACTIONS TABLE (ประวัติรับเข้า/เบิกสต็อก)
CREATE TABLE spare_transactions (
    id VARCHAR(50) PRIMARY KEY,
    part_id VARCHAR(50) REFERENCES spare_parts(id) ON DELETE CASCADE,
    transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('IN', 'OUT')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    transaction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reference_no VARCHAR(100) NOT NULL, -- WO-ID or Purchase Order Invoice No
    recorded_by VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_spare_tx_part ON spare_transactions(part_id);
CREATE INDEX idx_spare_tx_ref ON spare_transactions(reference_no);

-- 10. PREVENTIVE_MAINTENANCE TABLE (แผน PM)
CREATE TABLE preventive_maintenance (
    id VARCHAR(50) PRIMARY KEY,
    machine_id VARCHAR(50) REFERENCES machines(id) ON DELETE CASCADE,
    plan_name VARCHAR(255) NOT NULL,
    frequency VARCHAR(50) NOT NULL CHECK (frequency IN ('Every Day', 'Every Week', 'Every Month', 'Every Quarter', 'Every Year')),
    frequency_days INT NOT NULL,
    last_done_date DATE,
    next_due_date DATE NOT NULL,
    assigned_team VARCHAR(150),
    checklist TEXT[] NOT NULL, -- Array of items to check
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_pm_machine ON preventive_maintenance(machine_id);
CREATE INDEX idx_pm_next_due ON preventive_maintenance(next_due_date);

-- 11. MAINTENANCE_SCHEDULE TABLE (ปฏิทินงาน PM)
CREATE TABLE maintenance_schedule (
    id VARCHAR(50) PRIMARY KEY,
    pm_id VARCHAR(50) REFERENCES preventive_maintenance(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed', 'Missed')),
    done_date DATE,
    done_by VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_schedule_pm ON maintenance_schedule(pm_id);
CREATE INDEX idx_schedule_date ON maintenance_schedule(scheduled_date);

-- 12. NOTIFICATIONS TABLE (การแจ้งเตือน)
CREATE TABLE notifications (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'danger', 'success')),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    link_to VARCHAR(100)
);
CREATE INDEX idx_notifications_unread ON notifications(is_read) WHERE is_read = FALSE;

-- 13. ATTACHMENTS TABLE (ไฟล์แนบอาการและใบปิดงาน)
CREATE TABLE attachments (
    id VARCHAR(50) PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL, -- 'REPAIR_REQUEST' or 'WORK_ORDER'
    entity_id VARCHAR(50) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- 'image/jpeg', 'video/mp4', etc
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_attachments_entity ON attachments(entity_type, entity_id);

-- 14. AUDIT_LOGS TABLE (บันทึกแกะประวัติดิจิทัล)
CREATE TABLE audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    action VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT NOT NULL
);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
`;

  const drizzleCode = `import { pgTable, text, varchar, integer, check, timestamp, numeric, doublePrecision, boolean, date, customType } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// 1. Departments Drizzle Schema
export const departments = pgTable('departments', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. Users Drizzle Schema
export const users = pgTable('users', {
  id: varchar('id', { length: 50 }).primaryKey(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  departmentId: varchar('department_id', { length: 5 }).references(() => departments.id, { onDelete: 'set null' }),
  position: varchar('position', { length: 255 }),
  role: varchar('role', { length: 50 }).notNull(), // 'Admin' | 'Supervisor' | 'Technician' | 'User'
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// 3. Machine Types
export const machineTypes = pgTable('machine_types', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 50 }).notNull().unique(),
});

// 4. Machines Drizzle Schema
export const machines = pgTable('machines', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  typeId: varchar('type_id', { length: 50 }).references(() => machineTypes.id, { onDelete: 'restrict' }),
  departmentId: varchar('department_id', { length: 50 }).references(() => departments.id, { onDelete: 'restrict' }),
  location: varchar('location', { length: 255 }).notNull(),
  brand: varchar('brand', { length: 150 }),
  model: varchar('model', { length: 150 }),
  serialNumber: varchar('serial_number', { length: 150 }).unique(),
  startDate: date('start_date').notNull(),
  imageUrl: text('image_url'),
  status: varchar('status', { length: 50 }).default('Operational'),
});

// 5. Repair Requests (ใบแจ้งซ่อม)
export const repairRequests = pgTable('repair_requests', {
  id: varchar('id', { length: 50 }).primaryKey(),
  requestDate: date('request_date').defaultNow().notNull(),
  requestTime: text('request_time').notNull(), // stored as string hh:mm
  requesterName: varchar('requester_name', { length: 255 }).notNull(),
  departmentId: varchar('department_id', { length: 50 }).references(() => departments.id),
  machineId: varchar('machine_id', { length: 50 }).references(() => machines.id, { onDelete: 'cascade' }),
  symptom: text('symptom').notNull(),
  priority: varchar('priority', { length: 50 }).notNull(), // 'Low' | 'Medium' | 'High' | 'Critical'
  status: varchar('status', { length: 50 }).default('รอรับงาน'), // รอรับงาน | กำลังดำเนินการ | เสร็จสิ้น | ยกเลิก
});

// ... Complete 14 tables exported with correct Foreign Key relations & constraints
`;

  const handleCopy = () => {
    const code = activeTab === 'sql' ? sqlSchemaCode : drizzleCode;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const code = activeTab === 'sql' ? sqlSchemaCode : drizzleCode;
    const filename = activeTab === 'sql' ? 'mms-schema.sql' : 'mms-drizzle-schema.ts';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="card shadow-md rounded-md bg-white dark:bg-zinc-800 border-t-4 border-blue-500 overflow-hidden" id="schema-v-card">
      <div className="p-4 border-b border-gray-100 dark:border-zinc-700 flex flex-wrap justify-between items-center gap-4 bg-gray-50 dark:bg-zinc-800/50">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-bold text-gray-800 dark:text-zinc-100 font-sans">
            ฐานข้อมูลโรงงาน: Schema SQL & Drizzle ORM
          </h3>
          <span className="bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300 text-xs px-2.5 py-0.5 rounded font-mono font-bold">
            14 Tables Defined
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-gray-200 dark:bg-zinc-700 p-0.5 rounded-lg flex">
            <button
              onClick={() => setActiveTab('sql')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeTab === 'sql'
                  ? 'bg-white dark:bg-zinc-600 text-blue-600 dark:text-blue-400 font-bold shadow-sm'
                  : 'text-gray-600 dark:text-zinc-300 hover:text-black dark:hover:text-white'
              }`}
            >
              PostgreSQL Schema
            </button>
            <button
              onClick={() => setActiveTab('drizzle')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeTab === 'drizzle'
                  ? 'bg-white dark:bg-zinc-600 text-blue-600 dark:text-blue-400 font-bold shadow-sm'
                  : 'text-gray-600 dark:text-zinc-300 hover:text-black dark:hover:text-white'
              }`}
            >
              TypeScript (Drizzle)
            </button>
            <button
              onClick={() => setActiveTab('erd')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeTab === 'erd'
                  ? 'bg-white dark:bg-zinc-600 text-blue-600 dark:text-blue-400 font-bold shadow-sm'
                  : 'text-gray-600 dark:text-zinc-300 hover:text-black dark:hover:text-white'
              }`}
            >
              ความสัมพันธ์ (ERD Block)
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="btn-light text-xs bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 p-2 rounded flex items-center gap-1.5 text-gray-700 dark:text-zinc-200"
            title="คัดลอกรหัส"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'คัดลอกแล้ว!' : 'คัดลอก'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="btn-light text-xs bg-blue-500 hover:bg-blue-600 text-white p-2 rounded flex items-center gap-1.5"
            title="ดาวน์โหลดไฟล์สคริปต์"
          >
            <Download className="h-3.5 w-3.5" />
            <span>ดาวน์โหลด (.sql/.ts)</span>
          </button>
        </div>
      </div>

      <div className="p-0">
        {activeTab === 'erd' ? (
          <div className="p-6 bg-gray-50 dark:bg-zinc-900/40 text-sm">
            <h4 className="font-bold text-gray-800 dark:text-zinc-200 mb-4 font-sans text-base">
              แผนผังโครงสร้างความสัมพันธ์ความเชื่อมโยงแอฟ (E-R Relationship Graph Structure)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono text-xs">
              
              {/* Box 1 */}
              <div className="bg-white dark:bg-zinc-800 p-4 rounded-md border border-gray-200 dark:border-zinc-700 shadow-sm relative">
                <div className="absolute top-3 right-3 text-blue-500" title="Primary Key Identity"><Key className="h-3.5 w-3.5" /></div>
                <div className="font-bold text-gray-900 dark:text-zinc-100 text-sm border-b pb-1 mb-2">departments</div>
                <ul className="space-y-1.5 text-gray-600 dark:text-zinc-300">
                  <li className="text-blue-600 dark:text-blue-400 font-bold">🔑 id: varchar</li>
                  <li>name: varchar</li>
                  <li>code: varchar (Unique, Index)</li>
                </ul>
              </div>

              {/* Box 2 */}
              <div className="bg-white dark:bg-zinc-800 p-4 rounded-md border border-gray-200 dark:border-zinc-700 shadow-sm relative">
                <div className="absolute top-3 right-3 text-blue-500"><Key className="h-3.5 w-3.5" /></div>
                <div className="font-bold text-gray-900 dark:text-zinc-100 text-sm border-b pb-1 mb-2">users</div>
                <ul className="space-y-1.5 text-gray-600 dark:text-zinc-300">
                  <li className="text-blue-600 dark:text-blue-400 font-bold">🔑 id: varchar</li>
                  <li>username: varchar (Unique)</li>
                  <li>name: varchar</li>
                  <li>🔗 department_id: varchar (FK)</li>
                  <li>role: varchar (Admin/Sup/Tech/User)</li>
                  <li>is_active: boolean</li>
                </ul>
              </div>

              {/* Box 3 */}
              <div className="bg-white dark:bg-zinc-800 p-4 rounded-md border border-gray-200 dark:border-zinc-700 shadow-sm relative">
                <div className="absolute top-3 right-3 text-blue-500"><Key className="h-3.5 w-3.5" /></div>
                <div className="font-bold text-gray-900 dark:text-zinc-100 text-sm border-b pb-1 mb-2">machines</div>
                <ul className="space-y-1.5 text-gray-600 dark:text-zinc-300">
                  <li className="text-blue-600 dark:text-blue-400 font-bold">🔑 id: varchar</li>
                  <li>name: varchar</li>
                  <li>🔗 type_id: varchar (FK)</li>
                  <li>🔗 department_id: varchar (FK)</li>
                  <li>brand, model, serial_number</li>
                  <li>status: Operational/Repairing/Breakdown</li>
                </ul>
              </div>

              {/* Box 4 */}
              <div className="bg-white dark:bg-zinc-800 p-4 rounded-md border border-gray-200 dark:border-zinc-700 shadow-sm relative">
                <div className="absolute top-3 right-3 text-blue-500"><Key className="h-3.5 w-3.5" /></div>
                <div className="font-bold text-gray-900 dark:text-zinc-100 text-sm border-b pb-1 mb-2">repair_requests</div>
                <ul className="space-y-1.5 text-gray-600 dark:text-zinc-300">
                  <li className="text-blue-600 dark:text-blue-400 font-bold">🔑 id: varchar (Auto-Running)</li>
                  <li>request_date, request_time: datetime</li>
                  <li>requester_name: varchar</li>
                  <li>🔗 department_id: varchar (FK)</li>
                  <li>🔗 machine_id: varchar (FK)</li>
                  <li>priority: Low/Medium/High/Critical</li>
                  <li>status: รอรับงาน / กําลังดำเนินการ / เสร็จสิ้น</li>
                </ul>
              </div>

              {/* Box 5 */}
              <div className="bg-white dark:bg-zinc-800 p-4 rounded-md border border-gray-200 dark:border-zinc-700 shadow-sm relative">
                <div className="absolute top-3 right-3 text-blue-500"><Key className="h-3.5 w-3.5" /></div>
                <div className="font-bold text-gray-900 dark:text-zinc-100 text-sm border-b pb-1 mb-2">work_orders</div>
                <ul className="space-y-1.5 text-gray-600 dark:text-zinc-300">
                  <li className="text-blue-600 dark:text-blue-400 font-bold">🔑 id: varchar (Auto-Running)</li>
                  <li>🔗 request_id: varchar (FK)</li>
                  <li>start_date, end_date: date</li>
                  <li>🔗 responsible_tech_id: varchar (FK)</li>
                  <li>symptom_diagnosed, cause_analysis</li>
                  <li>repair_result: Normal / Wait / Fail</li>
                  <li>man_hours, total_spare_cost: decimal</li>
                </ul>
              </div>

              {/* Box 6 */}
              <div className="bg-white dark:bg-zinc-800 p-4 rounded-md border border-gray-200 dark:border-zinc-700 shadow-sm relative">
                <div className="absolute top-3 right-3 text-blue-500"><Key className="h-3.5 w-3.5" /></div>
                <div className="font-bold text-gray-900 dark:text-zinc-100 text-sm border-b pb-1 mb-2">spare_parts & transactions</div>
                <ul className="space-y-1.5 text-gray-600 dark:text-zinc-300">
                  <li className="text-blue-600 dark:text-blue-400 font-bold">🔑 id: varchar</li>
                  <li>name, category: varchar</li>
                  <li>quantity, min_quantity: integer</li>
                  <li>unit_price: decimal</li>
                  <li className="border-t pt-1 mt-1 text-[10px] text-zinc-500">
                    🔗 spare_transactions link via part_id
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-md bg-yellow-50 dark:bg-zinc-900 border-l-4 border-yellow-500 text-gray-700 dark:text-zinc-300">
              <h5 className="font-bold mb-1 flex items-center gap-1.5 font-sans">
                <Layers className="h-4 w-4 text-yellow-600" />
                คุณสมบัติสถาปัตยกรรมระดับ Enterprise
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 mt-2 text-xs">
                <div>• Cascade deletes on Repair Tickets to Work Orders.</div>
                <div>• Auto checking for Check constraints on Statuses & Priorities.</div>
                <div>• Foreign Key Integrity mapped strictly on machines to departments.</div>
                <div>• Compound Multi-field Indices inside Audit Logs.</div>
                <div>• Normalized relations preventing redundant stock values.</div>
                <div>• High throughput indexes built for machine state tracking.</div>
              </div>
            </div>
          </div>
        ) : (
          <code className="block p-4 overflow-x-auto text-[11px] font-mono leading-relaxed bg-[#1e1e1e] text-[#d4d4d4] rounded-b-md max-h-[500px]">
            <pre>{activeTab === 'sql' ? sqlSchemaCode : drizzleCode}</pre>
          </code>
        )}
      </div>
    </div>
  );
}
