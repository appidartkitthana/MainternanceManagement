/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  User, Department, MachineType, Machine, SparePart, 
  RepairRequest, WorkOrder, PreventiveMaintenance, 
  MaintenanceSchedule, SpareTransaction, SystemNotification, AuditLog
} from '../types';

export const INITIAL_USERS: User[] = [
  { id: 'U001', username: 'admin', name: 'ประธาน สุทธิวารี', department: 'ฝ่ายบริหารระบบ', position: 'IT Administrator', role: 'Admin', isActive: true },
  { id: 'U002', username: 'sup_somchai', name: 'สมชาย รักดี', department: 'ฝ่ายวิศวกรรมบำรุงรักษา', position: 'Maintenance Supervisor', role: 'Supervisor', isActive: true },
  { id: 'U003', username: 'tech_wichai', name: 'วิชัย มั่งมี', department: 'ฝ่ายไฟฟ้ากำลัง', position: 'Electrical Technician', role: 'Technician', isActive: true },
  { id: 'U004', username: 'tech_anuson', name: 'อนุสรณ์ ชูวิทย์', department: 'ฝ่ายเครื่องจักรกล', position: 'Mechanical Technician', role: 'Technician', isActive: true },
  { id: 'U005', username: 'user_narong', name: 'ณรงค์ เดชะ', department: 'ฝ่ายผลิตไลน์ A', position: 'Production Operator', role: 'User', isActive: true },
  { id: 'U006', username: 'user_pilai', name: 'วิไลวรรณ บุญตา', department: 'ฝ่ายบรรจุภัณฑ์', position: 'Packaging Supervisor', role: 'User', isActive: true },
  { id: 'U007', username: 'tech_poramin', name: 'ปรมินทร์ แก้วใส', department: 'ฝ่ายเครื่องจักรกล', position: 'Hydraulic Technician', role: 'Technician', isActive: true },
  { id: 'U008', username: 'user_sompot', name: 'สมพจน์ อินตา', department: 'ฝ่ายผลิตไลน์ B', position: 'Production Operator', role: 'User', isActive: true }
];

export const DEPARTMENTS: Department[] = [
  { id: 'DEP-PRO-A', name: 'ฝ่ายแกะแบบและขึ้นรูป (Line A)', code: 'PROD_A' },
  { id: 'DEP-PRO-B', name: 'ฝ่ายแปรรูปและหลอม (Line B)', code: 'PROD_B' },
  { id: 'DEP-PACK', name: 'ฝ่ายบรรจุภัณฑ์และห่อ', code: 'PACK' },
  { id: 'DEP-UTIL', name: 'ฝ่ายระบบสาธารณูปโภค (Utility)', code: 'UTIL' },
  { id: 'DEP-ENG', name: 'ฝ่ายวิศวกรรมซ่อมบำรุง', code: 'ENG' }
];

export const MACHINE_TYPES: MachineType[] = [
  { id: 'MT-01', name: 'เครื่องขึ้นรูปพลาสติก (Injection Molding)', code: 'INJ' },
  { id: 'MT-02', name: 'เตาหลอมอุตสาหกรรม (Melting Furnace)', code: 'FRN' },
  { id: 'MT-03', name: 'เครื่องบรรจุอัตโนมัติ (Packaging Machine)', code: 'PKG' },
  { id: 'MT-04', name: 'ปั๊มลมและลมแยก (Air Compressor)', code: 'CMP' },
  { id: 'MT-05', name: 'แขนกลประกอบชิ้นงาน (Robotic Arm)', code: 'ROB' },
  { id: 'MT-06', name: 'เครื่องทำความเย็นอุตสาหกรรม (Chiller)', code: 'CHL' }
];

export const INITIAL_MACHINES: Machine[] = [
  { id: 'MC-INJ-001', name: 'เครื่องฉีดพลาสติกไฮดรอลิก 250 ตัน', typeId: 'MT-01', departmentId: 'DEP-PRO-A', location: 'ตึกฉีดพลาสติก ฝั่งซ้าย', brand: 'Sumitomo', model: 'SE250EV', serialNumber: 'SM-98234-A', startDate: '2021-03-12', imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=60', status: 'Operational', currentCustomer: 'บริษัท ไทยโพลีเมอร์ จำกัด', currentSite: 'โรงงานอยุธยา นิคมโรจนะ', rentalHistory: [
    { id: 'RT001', customerName: 'ซีพีแอล พลาสติกส์', siteName: 'ไซด์งานบางปู คลังสินค้า B', startDate: '2022-01-10', endDate: '2023-01-15' },
    { id: 'RT002', customerName: 'อินเตอร์โมลด์ กรุ๊ป', siteName: 'โรงงานกิ่งแก้ว สมุทรปราการ', startDate: '2023-04-10', endDate: '2025-02-28' }
  ] },
  { id: 'MC-INJ-002', name: 'เครื่องฉีดพลาสติกไฟฟ้ารั้วความเร็วสูง', typeId: 'MT-01', departmentId: 'DEP-PRO-A', location: 'ตึกฉีดพลาสติก ฝั่งขวา', brand: 'Nissei', model: 'NEX280T', serialNumber: 'NS-22109-B', startDate: '2023-01-15', imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60', status: 'Operational', currentCustomer: 'เอสซีจี แพคเกจจิ้ง (SCGP)', currentSite: 'นิคมอุตสาหกรรมปิ่นทอง ชลบุรี', rentalHistory: [
    { id: 'RT003', customerName: 'ปทุมธานี ไฟเบอร์', siteName: 'โกดังคลองหลวง', startDate: '2023-02-01', endDate: '2024-03-30' }
  ] },
  { id: 'MC-FRN-01', name: 'เตาอบเหนี่ยวนำความร้อนสูง 1200C', typeId: 'MT-02', departmentId: 'DEP-PRO-B', location: 'พื้นที่โรงหลอมโลหะ บูธ 2', brand: 'Inductotherm', model: 'Melt-Manager-10', serialNumber: 'ID-00192-K', startDate: '2020-06-20', imageUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=500&auto=format&fit=crop&q=60', status: 'Operational', currentCustomer: 'สยาม สตีล คอร์ปอเรชั่น', currentSite: 'โรงงานหลอม พระประแดง', rentalHistory: [
    { id: 'RT004', customerName: 'บริษัท ทีเจ เมทัล เวิร์คส์ จำกัด', siteName: 'ลานหลอมนวนคร', startDate: '2021-08-01', endDate: '2022-12-25' }
  ] },
  { id: 'MC-FRN-02', name: 'เตาชุบแข็งคาร์บอนไนไตรดิ้ง', typeId: 'MT-02', departmentId: 'DEP-PRO-B', location: 'พื้นที่บำบัดทางความร้อน', brand: 'Ipsen', model: 'RT-4-EM', serialNumber: 'IP-88712-X', startDate: '2019-11-05', imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60', status: 'Repairing', currentCustomer: 'สหการโลหะภัณฑ์', currentSite: 'ไซต์งานนิคมอมตะนคร ซอย 4', rentalHistory: [] },
  { id: 'MC-PKG-01', name: 'เครื่องบรรจุของเหลวลงกล่องอัตโนมัติ', typeId: 'MT-03', departmentId: 'DEP-PACK', location: 'อาคารแพคเกจจิ้ง ไลน์ 1', brand: 'Tetra Pak', model: 'A3/Flex', serialNumber: 'TP-56612-L', startDate: '2022-09-01', imageUrl: 'https://images.unsplash.com/photo-1537462715879-360eeb61a0bc?w=500&auto=format&fit=crop&q=60', status: 'Operational', currentCustomer: 'กรีนสปอต (Green Spot)', currentSite: 'นิคมอุตสาหกรรมหนองแค สระบุรี', rentalHistory: [
    { id: 'RT005', customerName: 'นมไทย-เดนมาร์ค', siteName: 'โรงงาน มวกเหล็ก สระบุรี', startDate: '2022-10-10', endDate: '2023-11-15' }
  ] },
  { id: 'MC-PKG-02', name: 'เครื่องคัดแยกและปิดฉลากความเร็วสูง', typeId: 'MT-03', departmentId: 'DEP-PACK', location: 'อาคารแพคเกจจิ้ง ไลน์ 2', brand: 'Krones', model: 'Ergomatic', serialNumber: 'KR-77611-X', startDate: '2024-04-18', imageUrl: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=500&auto=format&fit=crop&q=60', status: 'Breakdown', currentCustomer: 'คริสตัล เบฟเวอเรจ', currentSite: 'คลังสินค้าลาดกระบัง', rentalHistory: [] },
  { id: 'MC-CMP-01', name: 'ปั๊มลมอัพเดทแบบสกรูออยล์ฟรี 110kW', typeId: 'MT-04', departmentId: 'DEP-UTIL', location: 'โรงห้องเครื่องปรับอากาศ Utility', brand: 'Atlas Copco', model: 'ZR110', serialNumber: 'AC-10023-F', startDate: '2018-02-15', imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&auto=format&fit=crop&q=60', status: 'Operational', rentalHistory: [
    { id: 'RT006', customerName: 'แหลมฉบัง เทอร์มินัล', siteName: 'ไซต์งานท่าเรือแหลมฉบัง บี 5', startDate: '2019-05-12', endDate: '2022-04-30' }
  ] },
  { id: 'MC-CMP-02', name: 'ปั๊มลมสำรองแบบสกรูส่งแรงดันกลาง', typeId: 'MT-04', departmentId: 'DEP-UTIL', location: 'โรงห้องเครื่องปรับอากาศ Utility', brand: 'Hitachi', model: 'OSP-75', serialNumber: 'HT-45911-S', startDate: '2022-02-28', imageUrl: 'https://images.unsplash.com/photo-1485083269755-a7b559a4fe5e?w=500&auto=format&fit=crop&q=60', status: 'Operational', rentalHistory: [] },
  { id: 'MC-ROB-01', name: 'แขนกลยกสแต็กแผ่นเหล็ก 6 แกน', typeId: 'MT-05', departmentId: 'DEP-PRO-A', location: 'ไลน์ประกอบชิ้นงาน โซนเหนี่ยวนำ', brand: 'Fanuc', model: 'R-2000iC', serialNumber: 'FN-12771-M', startDate: '2023-11-10', imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500&auto=format&fit=crop&q=60', status: 'Operational', currentCustomer: 'บริษัท มิตซูบิชิ มอเตอร์ส จำกัด', currentSite: 'โรงงานนิคมแหลมฉบัง เขต 3', rentalHistory: [
    { id: 'RT007', customerName: 'ไทยซัมมิท โอโตพาร์ท', siteName: 'โรงงานบางพลี ปลอกลูกสูบ', startDate: '2024-01-10', endDate: '2024-12-15' }
  ] },
  { id: 'MC-CHL-01', name: 'เครื่องทำน้ำเย็นอุตสาหกรรมขนาด 400 ตัน', typeId: 'MT-06', departmentId: 'DEP-UTIL', location: 'ลานกว้างอเนกประสงค์ด้านหลังโรงงาน', brand: 'York', model: 'YK-Centrifugal', serialNumber: 'YK-00623-H', startDate: '2021-08-30', imageUrl: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&auto=format&fit=crop&q=60', status: 'Operational', currentCustomer: 'เบียร์สิงห์ เชียงราย', currentSite: 'โรงเบียร์เชียงราย แม่จัน', rentalHistory: [
    { id: 'RT008', customerName: 'เสริมสุข จำกัด (มหาชน)', siteName: 'ไซต์งานปทุมธานี น้ำดื่มซาสี่', startDate: '2022-02-15', endDate: '2023-10-30' }
  ] }
];

export const INITIAL_SPARE_PARTS: SparePart[] = [
  { id: 'SP-BEA-01', name: 'ตลับลูกปืนเม็ดกลมร่องลึก SKF 6308-2RS1', category: 'Bearing', quantity: 45, minQuantity: 10, unit: 'ชิ้น', unitPrice: 420 },
  { id: 'SP-BEA-02', name: 'ลูกปืนเม็ดเรียวสอบ NSK HR30206J', category: 'Bearing', quantity: 28, minQuantity: 8, unit: 'ชิ้น', unitPrice: 380 },
  { id: 'SP-VBE-12', name: 'สายพานร่อง V-Belt Gates Super HC 3V670', category: 'Belt', quantity: 9, minQuantity: 12, unit: 'เส้น', unitPrice: 200 }, // Low Stock
  { id: 'SP-VBE-15', name: 'สายพานขับส่งมอเตอร์ Mitsuboshi B54', category: 'Belt', quantity: 15, minQuantity: 10, unit: 'เส้น', unitPrice: 180 },
  { id: 'SP-SEN-01', name: 'เซนเซอร์ตรวจจับชนิดเหนี่ยวนำ Keyence PR-M51N', category: 'Sensor & Electronics', quantity: 3, minQuantity: 5, unit: 'ตัว', unitPrice: 2450 }, // Low Stock
  { id: 'SP-SEN-02', name: 'สวิตช์ตรวจจับวัตถุ Photoelectric Sensor Omron E3Z-T61', category: 'Sensor & Electronics', quantity: 18, minQuantity: 6, unit: 'ตัว', unitPrice: 1890 },
  { id: 'SP-HYD-04', name: 'ซีลน้ำมันลูกสูบไฮดรอลิก NOK IDI-110', category: 'Hydraulics', quantity: 35, minQuantity: 15, unit: 'ชิ้น', unitPrice: 110 },
  { id: 'SP-OIL-AW46', name: 'น้ำมันไฮดรอลิกเกรดอุตสาหกรรม Shell Tellus S2 V46', category: 'Lubrications', quantity: 4, minQuantity: 3, unit: 'ถัง (20L)', unitPrice: 3200 },
  { id: 'SP-OIL-GEAR', name: 'จาระบีอุณหภูมิสูงเตาหลอม Mobilith SHC 220', category: 'Lubrications', quantity: 12, minQuantity: 4, unit: 'กระป๋อง', unitPrice: 850 },
  { id: 'SP-FLT-CMP', name: 'แผ่นกรองอากาศ Air Filter Separator Atlas Copco', category: 'Filters', quantity: 1, minQuantity: 2, unit: 'ชุด', unitPrice: 4500 } // Low Stock
];

export const INITIAL_REPAIR_REQUESTS: RepairRequest[] = [
  {
    id: 'REQ-2026-0001',
    requestDate: '2026-05-10',
    requestTime: '08:30',
    requesterName: 'ณรงค์ เดชะ',
    departmentId: 'DEP-PRO-A',
    machineId: 'MC-INJ-001',
    symptom: 'ระบบควบคุมอุณหภูมิมนหัวฉีดทำงานผิดปกติ ความร้อนไม่คงที่ระหว่างเรารันงานฉีดพลาสติก ทำให้หัวฉีดอุดตัน',
    priority: 'High',
    status: 'เสร็จสิ้น',
    attachmentUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500',
    attachmentType: 'image'
  },
  {
    id: 'REQ-2026-0002',
    requestDate: '2026-05-15',
    requestTime: '14:20',
    requesterName: 'วิไลวรรณ บุญตา',
    departmentId: 'DEP-PACK',
    machineId: 'MC-PKG-01',
    symptom: 'สายเวรเลเบลล์ที่ตัวป้อนกระดาษหีบห่อ ตึงเกินไปมีเสียงดังของฟันเฟืองและโซ่เสียดสีอย่างรุนแรง',
    priority: 'Medium',
    status: 'เสร็จสิ้น'
  },
  {
    id: 'REQ-2026-0003',
    requestDate: '2026-05-24',
    requestTime: '10:15',
    requesterName: 'ณรงค์ เดชะ',
    departmentId: 'DEP-PRO-A',
    machineId: 'MC-ROB-01',
    symptom: 'แขนกล Fanuc ขยับช้าผิดปกติและมีการสะดุดในจุดเลี้ยว Joint คาดว่าซีลข้อต่อสึกหรือน้ำมันแห้ง',
    priority: 'High',
    status: 'เสร็จสิ้น'
  },
  {
    id: 'REQ-2026-0004',
    requestDate: '2026-06-01',
    requestTime: '09:05',
    requesterName: 'สมพจน์ อินตา',
    departmentId: 'DEP-PRO-B',
    machineId: 'MC-FRN-02',
    symptom: 'เตาอบชุบแข็งไม่สามารถรักษาความดันสุญญากาศได้ เกจวัดแรงดันแจ้งเตือนรั่วไหล ปรับแต่งไม่ได้เลย',
    priority: 'Critical',
    status: 'กำลังดำเนินการ',
    attachmentUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500',
    attachmentType: 'image'
  },
  {
    id: 'REQ-2026-0005',
    requestDate: '2026-06-03',
    requestTime: '16:40',
    requesterName: 'วิไลวรรณ บุญตา',
    departmentId: 'DEP-PACK',
    machineId: 'MC-PKG-02',
    symptom: 'เครื่องปิดฉลากสะดุด แผ่นกาวพับม้วนเข้าไปติดในสปริงเกลียว ตัวดึงส่งสลิปชำรุดเสียหาย เครื่องหยุดนิ่ง',
    priority: 'Critical',
    status: 'รอรับงาน'
  },
  {
    id: 'REQ-2026-0006',
    requestDate: '2026-06-08',
    requestTime: '11:12',
    requesterName: 'สมพจน์ อินตา',
    departmentId: 'DEP-PRO-B',
    machineId: 'MC-FRN-01',
    symptom: 'หน้าจอควบคุมระบบไฟฟ้ากระพริบผิดปกติและบอร์ดเตือน High Thermal Fault ในช่วงบ่ายที่ไลน์รันเต็มที่',
    priority: 'Medium',
    status: 'รอรับงาน'
  },
  {
    id: 'REQ-2026-0007',
    requestDate: '2026-06-09',
    requestTime: '07:30',
    requesterName: 'ณรงค์ เดชะ',
    departmentId: 'DEP-PRO-A',
    machineId: 'MC-INJ-002',
    symptom: 'พบน้ำมันไฮดรอลิกรั่วซึมบริเวณด้านล่างของตัวปั๊มเป็นนอง คาดว่าท่อน้ำมันแรงดันสูงเกิดรอยแตกร้าวซึม',
    priority: 'High',
    status: 'กำลังดำเนินการ'
  }
];

export const INITIAL_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'WO-2026-0001',
    requestId: 'REQ-2026-0001',
    startDate: '2026-05-10',
    startTime: '09:00',
    endDate: '2026-05-10',
    endTime: '12:30',
    responsibleTechId: 'U003',
    technicianTeam: ['วิชัย มั่งมี', 'อนุสรณ์ ชูวิทย์'],
    symptomDiagnosed: 'เทอร์โมคัปเปิลส่งสัญญาณอุณหภูมิคลาดเคลื่อนจากการสะสมความร้อนสะท้อน และบอร์ดรีเลย์ควบคุมฮีตเตอร์มีรอยไหม้เขม่า',
    causeAnalysis: 'อายุการใช้งานของบอร์ดรีเลย์ครบกำหนด และมีฝุ่นเหล็กจากกระบวนการผลิตปลิวผ่านพัดลมระบายความร้อนเข้าไปอาร์ค',
    solutionDetails: 'เปลี่ยนเซนเซอร์วัดอุณหภูมิเทอร์โมคัปเปิลชุดใหม่ ชิ้นส่วนอะไหล่แท้จากลานเก็บ พร้อมทำความสะอาดแกะบอร์ดควบคุมเปลี่ยนรีเลย์สวิตชิ่ง 2 จุด ย้ายตำแหน่งพัดลมระบายความร้อนพร้อมเพิ่มผ้ากรองฝุ่น',
    repairResult: 'กลับมาใช้งานได้ปกติ',
    usedSpareParts: [
      { partId: 'SP-SEN-01', quantity: 1, unitPrice: 2450 }
    ],
    manHours: 3.5,
    totalSpareCost: 2450,
    otherCost: 500
  },
  {
    id: 'WO-2026-0002',
    requestId: 'REQ-2026-0002',
    startDate: '2026-05-15',
    startTime: '15:00',
    endDate: '2026-05-15',
    endTime: '16:45',
    responsibleTechId: 'U004',
    technicianTeam: ['อนุสรณ์ ชูวิทย์'],
    symptomDiagnosed: 'ลูกหมุนดึงสายพาน V-Belt เสื่อมสภาพ หลวม และทำให้มีเสียงโซ่ครูดกระแทกเฟืองสวม',
    causeAnalysis: 'การตั้งตำแหน่งความตึงไม่ได้มาตรฐานดึงมากเกินไปในรอบก่อน และสารหล่อลื่นจาระบีของตลับลูกปืนภายในแห้งกรอบ',
    solutionDetails: 'ถอดประกอบหัวขับปรับความตึง เปลี่ยนตลับลูกปืน SKF เม็ดกลม และปรับตั้ง V-belt ด้วยเกจวัดความตึงให้อยู่ในระดับมาตรฐาน 45Hz',
    repairResult: 'กลับมาใช้งานได้ปกติ',
    usedSpareParts: [
      { partId: 'SP-BEA-01', quantity: 1, unitPrice: 420 },
      { partId: 'SP-VBE-12', quantity: 2, unitPrice: 200 }
    ],
    manHours: 1.75,
    totalSpareCost: 820,
    otherCost: 0
  },
  {
    id: 'WO-2026-0003',
    requestId: 'REQ-2026-0003',
    startDate: '2026-05-24',
    startTime: '11:00',
    endDate: '2026-05-24',
    endTime: '15:00',
    responsibleTechId: 'U007',
    technicianTeam: ['ปรมินทร์ แก้วใส', 'อนุสรณ์ ชูวิทย์'],
    symptomDiagnosed: 'ตรวจพบคราบจาระบีแห้งกรังบริเวณข้อพับ Joint แกนที่ 3 และมีเสียงครวญจากมอเตอร์เกียร์ทดส่ง',
    causeAnalysis: 'สารหล่อลื่นความหนืดทนอุณหภูมิสูงขาดแคลน ส่งผลให้ตลับลูกปืนรับภาระแรงแกว่งสูงและเสียดสีหนักเกินคาดหมาย',
    solutionDetails: 'ทำความสะอาดปาดคราบสะสมเกล็ดเก่า อัดจาระบีความร้อนสูง Mobilith SHC สองกระป๋องเข้าช่องหล่อลื่นลูกปืนแกนหลัก ตรวจสอบองศาการสะดุดและรันโปรแกรมทดสอบแบบ Slow speed 60 นาทีไร้ปัญหา',
    repairResult: 'กลับมาใช้งานได้ปกติ',
    usedSpareParts: [
      { partId: 'SP-OIL-GEAR', quantity: 2, unitPrice: 850 }
    ],
    manHours: 4.0,
    totalSpareCost: 1700,
    otherCost: 200
  },
  {
    id: 'WO-2026-0004',
    requestId: 'REQ-2026-0004',
    startDate: '2026-06-02',
    startTime: '08:30',
    responsibleTechId: 'U007',
    technicianTeam: ['ปรมินทร์ แก้วใส', 'วิชัย มั่งมี'],
    symptomDiagnosed: 'พบการบิดตัวและสึกหรอของยางซีลไดอะแฟรมที่ควบคุมเกจปรับแรงดันสุญญากาศ',
    causeAnalysis: 'เกิดจากการทำงานภายใต้ความร้อนสูงต่อเนื่องในรอบ 180 วันที่สายการผลิตเพิ่มยอดส่งของ',
    solutionDetails: 'กำลังดำเนินการถัดไป ถอดสั่งซื้ออะไหล่เปลี่ยน ยางปะเก็นแบบซิลิคอนทนความร้อนสูงมาประดับทดแทน',
    repairResult: 'ต้องรอสั่งอะไหล่',
    usedSpareParts: [
      { partId: 'SP-HYD-04', quantity: 2, unitPrice: 110 }
    ],
    manHours: 6.0,
    totalSpareCost: 220,
    otherCost: 1500
  },
  {
    id: 'WO-2026-0007',
    requestId: 'REQ-2026-0007',
    startDate: '2026-06-09',
    startTime: '09:00',
    responsibleTechId: 'U007',
    technicianTeam: ['ปรมินทร์ แก้วใส'],
    symptomDiagnosed: 'ซีลน้ำมันลูกสูบไฮดรอลิกเสื่อมสภาพและมีรอยฉีกขาดของขอบยางกันซึมปั๊มสูบ',
    causeAnalysis: 'มีฝุ่นผงซิลิกาปนเปื้อนหลุดเข้าไปบาดขอบยางตามจังหวะรับกำลังดันลูกสูบ',
    solutionDetails: 'ถอดกระบอกสูบไฮดรอลิก เปลี่ยนซีล NOK IDI ตัวใหม่ ล้างคราบสกปรกอุดตัน เติมปรับระดับน้ำมันไฮดรอลิก Shell เกรด 46 เข้าไป 1 ถังเต็มเพื่อล้างตะกอนเหลี่ยม',
    repairResult: 'ใช้งานได้ชั่วคราว',
    usedSpareParts: [
      { partId: 'SP-HYD-04', quantity: 3, unitPrice: 110 },
      { partId: 'SP-OIL-AW46', quantity: 1, unitPrice: 3200 }
    ],
    manHours: 5.0,
    totalSpareCost: 3530,
    otherCost: 0
  }
];

export const INITIAL_PREVENTIVE_MAINTENANCE: PreventiveMaintenance[] = [
  {
    id: 'PM-001',
    machineId: 'MC-INJ-001',
    planName: 'ตรวจเช็คระบบไฮดรอลิกและซีลยางกันซึม',
    frequency: 'Every Month',
    frequencyDays: 30,
    lastDoneDate: '2026-05-15',
    nextDueDate: '2026-06-14', // Within 7 days!
    assignedTeam: 'ทีมเครื่องจักรกล',
    checklist: [
      'ตรวจระดับแรงดันน้ำมันไฮดรอลิกในขณะเครื่องจักรทำงาน',
      'ตรวจสภาพรอยแตกชำรุดของซีลยางที่กระบอกสูบแกนหลัก',
      'เก็บข้อมูลอุณหภูมิห้องเกียร์และปั๊มน้ำมันไฮดรอลิก',
      'ขันแน่นขั้วล็อคท่อและวาล์วทางผ่านน้ำมันทุกจุด'
    ]
  },
  {
    id: 'PM-002',
    machineId: 'MC-ROB-01',
    planName: 'ทำความสะอาดฝุ่นและตรวจวัดค่าความต้านทานไฟฟ้าตู้คอนโทรลเลอร์ แขนกล',
    frequency: 'Every Quarter',
    frequencyDays: 90,
    lastDoneDate: '2026-03-20',
    nextDueDate: '2026-06-18', // Within 15 days!
    assignedTeam: 'ทีมไฟฟ้ากำลัง',
    checklist: [
      'ใช้ลมเป่าทำความสะอาดฝุ่นผงโลหะที่สะสมภายในตู้คอนโทรล Fanuc',
      'ตรวจค่าแรงดันไฟฟ้ากระแสตรง 24V จากแหล่งจ่ายไฟเลี้ยงบอร์ด',
      'ตรวจสอบพัดลมอัจฉริยะระบายความร้อนที่ฝาครอบตู้หลังและหน้าบอร์ด',
      'ทดสอบสัญญาณปุ่มหยุดฉุกเฉิน (E-Stop) ทั้งที่ตู้และแท่นสอนทำงาน'
    ]
  },
  {
    id: 'PM-003',
    machineId: 'MC-CMP-01',
    planName: 'เปลี่ยนชุดซีลกรองดักละอองน้ำมันและไส้กรองปั๊มลม',
    frequency: 'Every Year',
    frequencyDays: 365,
    lastDoneDate: '2025-06-15',
    nextDueDate: '2026-06-15', // Within 7 days!
    assignedTeam: 'ทีมสาธารณูปโภค',
    checklist: [
      'ถอดเปลี่ยนแผ่นกรองอากาศไส้กระดาษของกรดกล่องปั๊มระงับเสียง',
      'ตรวจสภาพวาล์วปลดถ่ายน้ำทิ้งอัตโนมัติ (Drainger Valve)',
      'วัดค่าความสั่นสะเทือนของขดลูกปืนเตามอเตอร์พัดลมระเบิด',
      'จดสถิติความต่างศักย์อิมพีแดนซ์และการกินกระแสไฟฟ้าของขดเกลียวหลัก'
    ]
  },
  {
    id: 'PM-004',
    machineId: 'MC-PKG-01',
    planName: 'ทาจาระบีหล่อลื่นโซ่ขับเคลื่อนระบบส่งสินค้าและเฟืองโซ่ฟันเฟือง',
    frequency: 'Every Week',
    frequencyDays: 7,
    lastDoneDate: '2026-06-08',
    nextDueDate: '2026-06-15', // Within 7 days!
    assignedTeam: 'ทีมเครื่องจักรกล',
    checklist: [
      'ล้างทำความสะอาดโซ่ขับเคลื่อนด้วยน้ำยาล้างคราบน้ำมันอุตสาหกรรม',
      'ตรวจหาจุดยืดหรือข้อโซ่ติดขัดที่ทำงานไม่ราบเรียบ',
      'ทาจาระบี Mobilith บำรุงเนื้อฟันเฟืองทุกฟิเนี่ยนและร่องนำสาย',
      'ปรับตั้งความหย่อนลูกกลิ้งรับน้ำหนักให้อยู่ในมาตรฐาน 10 มม.'
    ]
  },
  {
    id: 'PM-005',
    machineId: 'MC-CHL-01',
    planName: 'ล้างทำความสะอาดแผงคอยล์ชิลเลอร์และวัดค่าน้ำยาทำความเย็น',
    frequency: 'Every Quarter',
    frequencyDays: 90,
    lastDoneDate: '2026-04-10',
    nextDueDate: '2026-07-10', // Within 30 days!
    assignedTeam: 'ทีมสาธารณูปโภค',
    checklist: [
      'ตรวจสอบระดับแรงดันน้ำยาสารทำความเย็นฝั่งไฮ/โล',
      'ทำความสะอาดแร็คคอนเดนเซอร์ระบายความร้อนด้วยไฮโดรเพรส',
      'ตรวจสภาพการสึกกร่อนรอบสายท่อน้ำเย็นเชื่อมต่ออาคาร',
      'เช็กสภาพลูกปืนใบพัดพัดลมระบายอากาศ 4 ตัวหลัก'
    ]
  }
];

export const INITIAL_MAINTENANCE_SCHEDULE: MaintenanceSchedule[] = [
  { id: 'SCH-001', pmId: 'PM-001', scheduledDate: '2026-06-14', status: 'Pending' },
  { id: 'SCH-002', pmId: 'PM-002', scheduledDate: '2026-06-18', status: 'Pending' },
  { id: 'SCH-003', pmId: 'PM-003', scheduledDate: '2026-06-15', status: 'Pending' },
  { id: 'SCH-004', pmId: 'PM-004', scheduledDate: '2026-06-15', status: 'Pending' },
  { id: 'SCH-005', pmId: 'PM-005', scheduledDate: '2026-07-10', status: 'Pending' },
  // Historical
  { id: 'SCH-101', pmId: 'PM-001', scheduledDate: '2026-05-15', status: 'Completed', doneDate: '2026-05-15', doneBy: 'อนุสรณ์ ชูวิทย์', notes: 'เติมน้ำมันไฮดรอลิกเพิ่ม 2 ลิตร ระบบแรงดันอยู่ในเกณฑ์ปกติเรียบร้อย' },
  { id: 'SCH-102', pmId: 'PM-004', scheduledDate: '2026-06-08', status: 'Completed', doneDate: '2026-06-08', doneBy: 'วิชัย มั่งมี', notes: 'ทาจาระบีครบ 4 แขนสายพานเครื่องบรรจุ และรันระบบเงียบสงบดี' }
];

export const INITIAL_SPARE_TRANSACTIONS: SpareTransaction[] = [
  { id: 'TX-0001', partId: 'SP-SEN-01', transactionType: 'OUT', quantity: 1, date: '2026-05-10', referenceNo: 'WO-2026-0001', recordedBy: 'วิชัย มั่งมี', remarks: 'เบิกใช้ตรวจจับความร้อนหัวฉีดฉลากชำรุด' },
  { id: 'TX-0002', partId: 'SP-BEA-01', transactionType: 'OUT', quantity: 1, date: '2026-05-15', referenceNo: 'WO-2026-0002', recordedBy: 'อนุสรณ์ ชูวิทย์', remarks: 'เปลี่ยนรอบตลับลูกปืนมอเตอร์สายพาน' },
  { id: 'TX-0003', partId: 'SP-VBE-12', transactionType: 'OUT', quantity: 2, date: '2026-05-15', referenceNo: 'WO-2026-0002', recordedBy: 'อนุสรณ์ ชูวิทย์', remarks: 'เปลี่ยนคู่สายพานพ่วงดันรอบ' },
  { id: 'TX-0004', partId: 'SP-OIL-GEAR', transactionType: 'OUT', quantity: 2, date: '2026-05-24', referenceNo: 'WO-2026-0003', recordedBy: 'ปรมินทร์ แก้วใส', remarks: 'อัดจาระบีแขนกล Fanuc ขยับสะดุดบ่อย' },
  { id: 'TX-0005', partId: 'SP-BEA-01', transactionType: 'IN', quantity: 20, date: '2026-06-01', referenceNo: 'INV-77122', recordedBy: 'สมชาย รักดี', remarks: 'รับสินค้าสต็อกตามแผนซ่อมบำรุงประจำปี' },
  { id: 'TX-0006', partId: 'SP-OIL-AW46', transactionType: 'IN', quantity: 5, date: '2026-06-02', referenceNo: 'INV-88120', recordedBy: 'สมชาย รักดี', remarks: 'สต็อกน้ำมันหล่อลื่นเพิ่มเติมสำรอง Chiller และปั๊มสูบ' },
  { id: 'TX-0007', partId: 'SP-HYD-04', transactionType: 'OUT', quantity: 2, date: '2026-06-02', referenceNo: 'WO-2026-0004', recordedBy: 'วิชัย มั่งมี', remarks: 'เปลี่ยนยางซีลตัวรั่วเกจชุบสุญญากาศ' },
  { id: 'TX-0008', partId: 'SP-HYD-04', transactionType: 'OUT', quantity: 3, date: '2026-06-09', referenceNo: 'WO-2026-0007', recordedBy: 'ปรมินทร์ แก้วใส', remarks: 'รื้อกระบอกเปลี่ยนซีลรอบปั้มรั่ว' },
  { id: 'TX-0009', partId: 'SP-OIL-AW46', transactionType: 'OUT', quantity: 1, date: '2026-06-09', referenceNo: 'WO-2026-0007', recordedBy: 'ปรมินทร์ แก้วใส', remarks: 'เติมน้ำมันไฮดรอลิกฟลัชกระบอกสูบใหม่' }
];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  { id: 'NTF-001', title: 'งานแจ้งซ่อมเร่งด่วนใหม่', message: 'เครื่องคัดแยกปิดฉลากสำรอง (MC-PKG-02) อาการสะดุดกาวขาด แดงระดับ Critical คีย์โดยฝ่ายคัดแยก', type: 'danger', timestamp: '2026-06-10T03:40:00Z', isRead: false, linkTo: 'repair' },
  { id: 'NTF-002', title: 'แจ้งเตือนอะไหล่ใกล้หมดคลัง', message: 'เซนเซอร์จับชิ้นงานเหนี่ยวนำ Keyence (SP-SEN-01) และ สายพานร่อง V-Belt (SP-VBE-12) ต่ำกว่าระดับเกณฑ์วิกฤต', type: 'warning', timestamp: '2026-06-10T02:15:00Z', isRead: false, linkTo: 'spare' },
  { id: 'NTF-003', title: 'ครบกำหนดตรวจบำรุงรักษา PM ล่วงหน้า', message: 'แผน PM-001 (รอบตรวจระดับไฮดรอลิก MC-INJ-001) และแผน PM-003 จะหมดเกณฑ์ความสงวนใน 7 วัน', type: 'info', timestamp: '2026-06-09T08:00:00Z', isRead: true, linkTo: 'pm' },
  { id: 'NTF-004', title: 'งานซ่อมเสร็จสมบูรณ์เรียบร้อย', message: 'งานซ่อม WO-2026-0001 (MC-INJ-001 ฮีตเตอร์ฉีดพลาสติกสะดุด) ตรวจสอบและลงนามเสร็จโดย Supervisor สมชาย', type: 'success', timestamp: '2026-06-09T12:35:00Z', isRead: true, linkTo: 'workorder' }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: 'LOG-0001', userId: 'U002', userName: 'สมชาย รักดี', userRole: 'Supervisor', action: 'Create Work Order', timestamp: '2026-06-09T09:00:00Z', details: 'สร้างใบงานซ่อม WO-2026-0007 อ้างอิงกรณีน้ำมันไฮดรอลิกรั่ว MC-INJ-002' },
  { id: 'LOG-0002', userId: 'U004', userName: 'อนุสรณ์ ชูวิทย์', userRole: 'Technician', action: 'Complete Work Order', timestamp: '2026-05-15T16:45:00Z', details: 'บันทึกปิดใบงานซ่อมโซ่ขับเคลื่อนสายเวรเครื่องจักรเลเบลล์ WO-2026-0002' },
  { id: 'LOG-0003', userId: 'U001', userName: 'ประธาน สุทธิวารี', userRole: 'Admin', action: 'Modify User Role', timestamp: '2026-06-01T10:11:00Z', details: 'อนุมัติเปิดใช้งานบัญชีผู้ใช้ ณรงค์ เดชะ พร้อมกำหนดเป็นปฏิบัติงานปกติ' },
  { id: 'LOG-0004', userId: 'U003', userName: 'วิชัย มั่งมี', userRole: 'Technician', action: 'Withdraw Spare Part', timestamp: '2026-05-10T09:12:00Z', details: 'เบิกจ่ายอะไหล่ เซนเซอร์จับวัตถุเหนี่ยวนำ Keyence 1 ชิ้น สต็อกลดลงอัตโนมัติ' }
];
