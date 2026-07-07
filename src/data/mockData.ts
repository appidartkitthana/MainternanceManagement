/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  User, 
  Department, 
  Machine, 
  RepairRequest, 
  WorkOrder, 
  SparePart, 
  PreventiveMaintenance, 
  MaintenanceSchedule, 
  SpareTransaction, 
  SystemNotification, 
  AuditLog 
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: "US-001",
    username: "admin",
    name: "สมชาย แสนสุข",
    department: "แผนกซ่อมบำรุงและวิศวกรรม",
    position: "ผู้จัดการแผนกซ่อมบำรุง",
    role: "Admin",
    isActive: true
  },
  {
    id: "US-002",
    username: "supervisor",
    name: "ธวัชชัย นิติกุล",
    department: "ส่วนการผลิตโรงงาน",
    position: "หัวหน้าฝ่ายผลิต",
    role: "Supervisor",
    isActive: true
  },
  {
    id: "US-003",
    username: "tech1",
    name: "วิชัย ใจดี",
    department: "วิศวกรรมการผลิต",
    position: "ช่างซ่อมบำรุงอาวุโส",
    role: "Technician",
    isActive: true
  },
  {
    id: "US-004",
    username: "user1",
    name: "มานะ กล้าหาญ",
    department: "ฝ่ายผลิต Line A",
    position: "พนักงานควบคุมเครื่องจักรอิสระ",
    role: "User",
    isActive: true
  }
];

export const DEPARTMENTS: Department[] = [
  { id: "DEP-01", name: "แผนกผลิตปั๊มและวิศวกรรม", code: "ENG" },
  { id: "DEP-02", name: "แผนกควบคุมคุณภาพและทดสอบ", code: "QC" },
  { id: "DEP-03", name: "แผนกประกอบชิ้นส่วนอัตโนมัติ", code: "ASSY" },
  { id: "DEP-04", name: "ฝ่ายซ่อมบำรุงเทคนิคอาคาร", code: "MAINT" }
];

export const INITIAL_MACHINES: Machine[] = [
  {
    id: "MC-001",
    name: "เครื่องกลึง CNC Lathe A3",
    typeId: "MT-01",
    departmentId: "DEP-01",
    location: "Factory Zone C, Line 4",
    brand: "Mazak",
    model: "Quick Turn 250",
    serialNumber: "QT-88129-2025",
    startDate: "2025-01-10",
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=60",
    status: "Operational",
    currentCustomer: "Toyota Motor Thailand",
    currentSite: "Samrong Plant",
    rentalHistory: [
      {
        id: "REN-001",
        customerName: "Toyota Motor Thailand",
        siteName: "Samrong Plant",
        startDate: "2025-02-01"
      }
    ]
  },
  {
    id: "MC-002",
    name: "เครื่องปั๊มขึ้นรูปไฮดรอลิก 500 ตัน",
    typeId: "MT-02",
    departmentId: "DEP-01",
    location: "Factory Zone A, Line 1",
    brand: "AIDA",
    model: "DSF-N2-5000",
    serialNumber: "AD-9102-2024",
    startDate: "2024-03-15",
    imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&auto=format&fit=crop&q=60",
    status: "Operational"
  },
  {
    id: "MC-003",
    name: "หุ่นยนต์เชื่อมประกอบอาร์กอัตโนมัติ ABB",
    typeId: "MT-03",
    departmentId: "DEP-03",
    location: "Robot Cell 12",
    brand: "ABB",
    model: "IRB 2600",
    serialNumber: "ABB-RB-5561",
    startDate: "2024-11-20",
    imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60",
    status: "Operational"
  }
];

export const INITIAL_SPARE_PARTS: SparePart[] = [
  {
    id: "SP-001",
    name: "แบริ่งลูกปืน NSK 6204-ZZ",
    category: "Bearings",
    quantity: 45,
    minQuantity: 10,
    unit: "ชิ้น",
    unitPrice: 350
  },
  {
    id: "SP-002",
    name: "สายพานร่องวี Mitsuboshi V-Belt B45",
    category: "Belts",
    quantity: 20,
    minQuantity: 5,
    unit: "เส้น",
    unitPrice: 280
  },
  {
    id: "SP-003",
    name: "น้ำมันไฮดรอลิก Shell Tellus S2 M 46",
    category: "Lubricants",
    quantity: 15,
    minQuantity: 3,
    unit: "ถัง (20L)",
    unitPrice: 2450
  },
  {
    id: "SP-004",
    name: "เซนเซอร์วัดอุณหภูมิความร้อน Omron E52-CA15A",
    category: "Electrical",
    quantity: 8,
    minQuantity: 2,
    unit: "ชิ้น",
    unitPrice: 1850
  }
];

export const INITIAL_REPAIR_REQUESTS: RepairRequest[] = [
  {
    id: "REQ-2026-0001",
    requestDate: "2026-06-01",
    requestTime: "09:30",
    requesterName: "มานะ กล้าหาญ",
    departmentId: "DEP-01",
    machineId: "MC-001",
    symptom: "แกนหมุนหลักมีเสียงดังสั่นสะเทือนขณะทำความเร็วรอบเกิน 1500 RPM และพบความร้อนสะสมบริเวณมอเตอร์",
    priority: "High",
    status: "เสร็จสิ้น",
    attachmentUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=60",
    attachmentType: "image"
  },
  {
    id: "REQ-2026-0002",
    requestDate: "2026-07-01",
    requestTime: "08:15",
    requesterName: "ธวัชชัย นิติกุล",
    departmentId: "DEP-01",
    machineId: "MC-002",
    symptom: "พบคราบน้ำมันไฮดรอลิกรั่วซึมบริเวณจุดเชื่อมต่อสายแรงดันหลักใต้กระบอกสูบปั๊มพาวเวอร์",
    priority: "Medium",
    status: "รอรับงาน"
  }
];

export const INITIAL_WORK_ORDERS: WorkOrder[] = [
  {
    id: "WO-2026-0001",
    requestId: "REQ-2026-0001",
    startDate: "2026-06-01",
    startTime: "10:00",
    endDate: "2026-06-01",
    endTime: "12:00",
    responsibleTechId: "US-003",
    technicianTeam: ["วิชัย ใจดี"],
    symptomDiagnosed: "ตลับลูกปืนแบริ่งแกนหลักเสื่อมสภาพจากการสะสมแรงบิดและจาระบีภายในแห้งหมดสภาพ",
    causeAnalysis: "ไม่มีการอัดจาระบีหล่อลื่นตามแผนที่กำหนดไว้และมีฝุ่นละอองเหล็กเข้าไปปนเปื้อนภายในตลับลูกปืน",
    solutionDetails: "ดำเนินการถอดหน้าแปลนขับแกนหลัก ทำความสะอาดคราบฝุ่นเหล็ก ทำการติดตั้งแบริ่งลูกปืน NSK 6204-ZZ ใหม่จำนวน 1 ชิ้น พร้อมอัดจาระบีหล่อลื่นชนิดทนความร้อนสูง",
    repairResult: "กลับมาใช้งานได้ปกติ",
    usedSpareParts: [
      {
        partId: "SP-001",
        quantity: 1,
        unitPrice: 350
      }
    ],
    manHours: 2,
    totalSpareCost: 350,
    otherCost: 0
  }
];

export const INITIAL_PREVENTIVE_MAINTENANCE: PreventiveMaintenance[] = [
  {
    id: "PM-001",
    machineId: "MC-001",
    planName: "ตรวจเช็คสภาพความร้อนตู้คอนโทรลและพัดลมระบายอากาศ",
    frequency: "Every Month",
    frequencyDays: 30,
    lastDoneDate: "2026-05-10",
    nextDueDate: "2026-06-10",
    assignedTeam: "วิชัย ใจดี",
    checklist: [
      "วัดและตรวจสอบแรงดันไฟฟ้าบอร์ดคอนโทรลหลัก",
      "เป่าทำความสะอาดฝุ่นและตรวจความแน่นพัดลมระบายความร้อนแกนหมุน",
      "ตรวจสอบความตึงขั้วต่อขั้วสายไฟสะสมความร้อน"
    ]
  },
  {
    id: "PM-002",
    machineId: "MC-002",
    planName: "บำรุงรักษาเปลี่ยนถ่ายน้ำมันไฮดรอลิกและทดสอบซีลกรองความดัน",
    frequency: "Every Quarter",
    frequencyDays: 90,
    lastDoneDate: "2026-04-15",
    nextDueDate: "2026-07-15",
    assignedTeam: "วิชัย ใจดี",
    checklist: [
      "เปลี่ยนตลับไส้กรองน้ำมันไฮดรอลิกหลัก",
      "ตรวจสอบความเหนียวรั่วซึมจุดเชื่อมซีลข้อต่อท่อกระบอกสูบไฮดรอลิก",
      "ทดสอบแรงดันระบบขณะปิดและเปิดระบบปั๊ม"
    ]
  }
];

export const INITIAL_MAINTENANCE_SCHEDULE: MaintenanceSchedule[] = [
  {
    id: "SCH-001",
    pmId: "PM-001",
    scheduledDate: "2026-06-10",
    status: "Completed",
    doneDate: "2026-06-10",
    doneBy: "วิชัย ใจดี",
    notes: "ทำความสะอาดบอร์ดตู้คอนโทรล วัดแรงดันไฟฟ้าได้ 220V ปกติ พัดลมระบายอากาศเดินได้ราบรื่นดี"
  },
  {
    id: "SCH-002",
    pmId: "PM-002",
    scheduledDate: "2026-07-15",
    status: "Pending"
  }
];

export const INITIAL_SPARE_TRANSACTIONS: SpareTransaction[] = [
  {
    id: "TX-001",
    partId: "SP-001",
    transactionType: "OUT",
    quantity: 1,
    date: "2026-06-01",
    referenceNo: "WO-2026-0001",
    recordedBy: "วิชัย ใจดี",
    remarks: "เบิกใช้เปลี่ยนซ่อมแกนขับลูกปืนเครื่อง CNC Lathe ในใบสั่งงาน WO-2026-0001"
  },
  {
    id: "TX-002",
    partId: "SP-001",
    transactionType: "IN",
    quantity: 10,
    date: "2026-06-05",
    referenceNo: "PO-2026-0012",
    recordedBy: "สมชาย แสนสุข",
    remarks: "รับสินค้าอะไหล่เข้าคลังสั่งซื้อเพิ่มเติมตามรอบบัญชี"
  }
];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: "NT-001",
    title: "แจ้งเตือนระดับอะไหล่ต่ำกว่า Reorder Point",
    message: "เซนเซอร์วัดอุณหภูมิความร้อน Omron เหลือต่ำกว่าเกณฑ์ความปลอดภัยในสต็อกกรุณาสั่งซื้อเพิ่มเติม",
    type: "warning",
    timestamp: "2026-06-01 12:05:00",
    isRead: false
  },
  {
    id: "NT-002",
    title: "เปิดใบแจ้งซ่อมเครื่องปั๊มใหม่",
    message: "มีรายการส่งแจ้งอาการขัดข้องเครื่องปั๊มขึ้นรูปไฮดรอลิก 500 ตัน ทะเบียนบอร์ด MC-002",
    type: "info",
    timestamp: "2026-07-01 08:15:00",
    isRead: false
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "LOG-001",
    userId: "US-001",
    userName: "สมชาย แสนสุข",
    userRole: "Admin",
    action: "System Launch",
    timestamp: "2026-06-01 08:00:00",
    details: "ระบบบริหารจัดการและบำรุงรักษาอุตสาหกรรมอัจฉริยะ IDEVA-OS-CMMS เริ่มทำงานสำเร็จสมบูรณ์"
  },
  {
    id: "LOG-002",
    userId: "US-003",
    userName: "วิชัย ใจดี",
    userRole: "Technician",
    action: "Update Work Order",
    timestamp: "2026-06-01 12:00:00",
    details: "แก้ไขใบสั่งงานซ่อมบำรุงสำเร็จรหัสงาน WO-2026-0001 และทำการตัดสต็อกอะไหล่ 1 รายการ"
  }
];
