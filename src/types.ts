/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Admin' | 'Supervisor' | 'Technician' | 'User';

export interface User {
  id: string;
  username: string;
  name: string;
  department: string;
  position: string;
  role: UserRole;
  isActive: boolean;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface MachineType {
  id: string;
  name: string;
  code: string;
}

export interface RentalHistory {
  id: string;
  customerName: string;
  siteName: string;
  startDate: string;
  endDate?: string;
}

export interface Machine {
  id: string; // Machine ID e.g. MC-001
  name: string;
  typeId: string;
  departmentId: string;
  location: string;
  brand: string;
  model: string;
  serialNumber: string;
  startDate: string;
  imageUrl: string;
  status: 'Operational' | 'Repairing' | 'Breakdown' | 'Decommissioned';
  currentCustomer?: string;
  currentSite?: string;
  rentalHistory?: RentalHistory[];
}

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type RepairRequestStatus = 'รอรับงาน' | 'กำลังดำเนินการ' | 'เสร็จสิ้น' | 'ยกเลิก';

export interface RepairRequest {
  id: string; // Ticket No e.g. REQ-2026-0001
  requestDate: string;
  requestTime: string;
  requesterName: string;
  departmentId: string;
  machineId: string;
  symptom: string;
  priority: PriorityLevel;
  status: RepairRequestStatus;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'video';
}

export interface WorkOrder {
  id: string; // e.g. WO-2026-0001
  requestId: string; // Link to RepairRequest
  startDate: string;
  startTime: string;
  endDate?: string;
  endTime?: string;
  responsibleTechId: string;
  technicianTeam: string[]; // names or IDs
  symptomDiagnosed: string;
  causeAnalysis: string;
  solutionDetails: string;
  repairResult: 'กลับมาใช้งานได้ปกติ' | 'ใช้งานได้ชั่วคราว' | 'ต้องรอสั่งอะไหล่' | 'ซ่อมไม่ได้/ส่งเคลม';
  usedSpareParts: {
    partId: string;
    quantity: number;
    unitPrice: number;
  }[];
  manHours: number; // calculated or inputted
  totalSpareCost: number; // auto sum
  otherCost: number;
}

export interface SparePart {
  id: string; // Part ID e.g. SP-001
  name: string;
  category: string;
  quantity: number;
  minQuantity: number; // reorder point
  unit: string;
  unitPrice: number;
}

export interface SpareTransaction {
  id: string;
  partId: string;
  transactionType: 'IN' | 'OUT';
  quantity: number;
  date: string;
  referenceNo: string; // e.g. WO-XXXX or INV-XXXX
  recordedBy: string;
  remarks?: string;
}

export interface PreventiveMaintenance {
  id: string; // PM-001
  machineId: string;
  planName: string;
  frequency: 'Every Day' | 'Every Week' | 'Every Month' | 'Every Quarter' | 'Every Year';
  frequencyDays: number;
  lastDoneDate: string;
  nextDueDate: string;
  assignedTeam: string;
  checklist: string[];
}

export interface MaintenanceSchedule {
  id: string;
  pmId: string;
  scheduledDate: string;
  status: 'Pending' | 'Completed' | 'Missed';
  doneDate?: string;
  doneBy?: string;
  notes?: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  timestamp: string;
  isRead: boolean;
  linkTo?: string;
}

export interface LINEConfig {
  isEnabled: boolean;
  token: string;
  recipientGroup: string;
}

export interface EmailConfig {
  isEnabled: boolean;
  smtpServer: string;
  smtpPort: number;
  senderEmail: string;
  recipientEmails: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  timestamp: string;
  details: string;
}
