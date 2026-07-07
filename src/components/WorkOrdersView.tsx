/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WorkOrder, RepairRequest, Machine, SparePart, SpareTransaction, UserRole } from '../types';
import { Wrench, Plus, CheckCircle2, Search, ArrowRightLeft, ShieldAlert, Laptop, Trash2 } from 'lucide-react';

interface WorkOrdersViewProps {
  workOrders: WorkOrder[];
  setWorkOrders: React.Dispatch<React.SetStateAction<WorkOrder[]>>;
  requests: RepairRequest[];
  setRequests: React.Dispatch<React.SetStateAction<RepairRequest[]>>;
  machines: Machine[];
  setMachines: React.Dispatch<React.SetStateAction<Machine[]>>;
  spareParts: SparePart[];
  setSpareParts: React.Dispatch<React.SetStateAction<SparePart[]>>;
  addAuditLog: (action: string, details: string) => void;
  triggerNotification: (title: string, message: string, type: 'info' | 'warning' | 'danger' | 'success') => void;
  currentUserRole: UserRole;
  currentUserName: string;
  autoSelectRequestId?: string;
  clearAutoSelectRequest?: () => void;
  setTransactions: React.Dispatch<React.SetStateAction<SpareTransaction[]>>;
  transactions: SpareTransaction[];
}

export default function WorkOrdersView({
  workOrders,
  setWorkOrders,
  requests,
  setRequests,
  machines,
  setMachines,
  spareParts,
  setSpareParts,
  addAuditLog,
  triggerNotification,
  currentUserRole,
  currentUserName,
  autoSelectRequestId,
  clearAutoSelectRequest,
  setTransactions,
  transactions
}: WorkOrdersViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResultFilter, setSelectedResultFilter] = useState('');
  
  // Create Form State
  const [showAddModal, setShowAddModal] = useState(!!autoSelectRequestId);
  const [targetReqId, setTargetReqId] = useState(autoSelectRequestId || 'REQ-2026-0005');
  const [startDate, setStartDate] = useState('2026-06-10');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('2026-06-10');
  const [endTime, setEndTime] = useState('11:00');
  
  const [symptomDiagnosed, setSymptomDiagnosed] = useState('');
  const [causeAnalysis, setCauseAnalysis] = useState('');
  const [solutionDetails, setSolutionDetails] = useState('');
  const [repairResult, setRepairResult] = useState<'กลับมาใช้งานได้ปกติ' | 'ใช้งานได้ชั่วคราว' | 'ต้องรอสั่งอะไหล่' | 'ซ่อมไม่ได้/ส่งเคลม'>('กลับมาใช้งานได้ปกติ');
  const [otherCost, setOtherCost] = useState(0);

  // Spares allocation state inside modal
  const [allocatedParts, setAllocatedParts] = useState<{ partId: string; quantity: number; unitPrice: number }[]>([]);
  const [tempPartId, setTempPartId] = useState('');
  const [tempPartQty, setTempPartQty] = useState(1);

  const filteredOrders = workOrders.filter(wo =>
    wo.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wo.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wo.symptomDiagnosed.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wo.repairResult.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPartTemp = () => {
    if (!tempPartId || tempPartQty <= 0) return;
    const partObj = spareParts.find(p => p.id === tempPartId);
    if (!partObj) return;

    // Check inventory ceiling
    if (partObj.quantity < tempPartQty) {
      alert(`พัสดุในคลังมีจำกัด! มีเพียง ${partObj.quantity} ${partObj.unit} เท่านั้น`);
      return;
    }

    setAllocatedParts(prev => {
      const exists = prev.find(p => p.partId === tempPartId);
      if (exists) {
        return prev.map(p => p.partId === tempPartId ? { ...p, quantity: p.quantity + tempPartQty } : p);
      }
      return [...prev, { partId: tempPartId, quantity: tempPartQty, unitPrice: partObj.unitPrice }];
    });
    setTempPartQty(1);
  };

  const handleRemovePartTemp = (pid: string) => {
    setAllocatedParts(prev => prev.filter(p => p.partId !== pid));
  };

  const handleCreateWorkOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetReqId) return;

    if (currentUserRole === 'User') {
      alert('เฉพาะช่างเทคนิค ซูเปอร์ไวเซอร์ และแอดมินเท่านั้นที่จะได้รับอนุญาตให้ส่งมอบใบปิดงานซ่อม!');
      return;
    }

    // 1. Calculate repair time (difference in decimal hours)
    const st = new Date(`${startDate}T${startTime}`);
    const en = new Date(`${endDate}T${endTime}`);
    const timeDiffMs = en.getTime() - st.getTime();
    const manHours = Math.max(0.5, Math.round((timeDiffMs / (1000 * 60 * 60)) * 100) / 100);

    // 2. Sum up spare cost
    const totalSpareCost = allocatedParts.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0);

    const nextId = `WO-2026-${String(workOrders.length + 1).padStart(4, '0')}`;

    const newWO: WorkOrder = {
      id: nextId,
      requestId: targetReqId,
      startDate,
      startTime,
      endDate,
      endTime,
      responsibleTechId: 'U003', // default to technician wichai मन्मी
      technicianTeam: [currentUserName],
      symptomDiagnosed,
      causeAnalysis,
      solutionDetails,
      repairResult,
      usedSpareParts: allocatedParts,
      manHours,
      totalSpareCost,
      otherCost
    };

    // 3. Subtract stock and log transactions for each allocated part
    setSpareParts(prev => prev.map(p => {
      const matchAllocated = allocatedParts.find(ap => ap.partId === p.id);
      if (matchAllocated) {
        const nextStockQty = p.quantity - matchAllocated.quantity;
        
        // Push transactions
        const txId = `TX-${String(transactions.length + 1).padStart(4, '0')}`;
        const newTx: SpareTransaction = {
          id: txId,
          partId: p.id,
          transactionType: 'OUT',
          quantity: matchAllocated.quantity,
          date: startDate,
          referenceNo: nextId,
          recordedBy: currentUserName,
          remarks: `บำรุงรักษาหน้างานใบสั่ง ${nextId}`
        };
        // side-effect state update of transactions
        setTransactions(prevTx => [newTx, ...prevTx]);

        return { ...p, quantity: nextStockQty };
      }
      return p;
    }));

    // 4. Update the parent repair request's status based on repairResult
    let mappedReqStatus: any = 'กำลังดำเนินการ';
    let machineStatus: any = 'Operational';

    if (repairResult === 'กลับมาใช้งานได้ปกติ') {
      mappedReqStatus = 'เสร็จสิ้น';
      machineStatus = 'Operational';
    } else if (repairResult === 'ใช้งานได้ชั่วคราว') {
      mappedReqStatus = 'เสร็จสิ้น';
      machineStatus = 'Operational';
    } else if (repairResult === 'ต้องรอสั่งอะไหล่') {
      mappedReqStatus = 'กำลังดำเนินการ';
      machineStatus = 'Repairing';
    } else if (repairResult === 'ซ่อมไม่ได้/ส่งเคลม') {
      mappedReqStatus = 'เสร็จสิ้น';
      machineStatus = 'Decommissioned';
    }

    setRequests(prev => prev.map(r => r.id === targetReqId ? { ...r, status: mappedReqStatus } : r));

    // Update the associated machine state
    const matchedReq = requests.find(r => r.id === targetReqId);
    if (matchedReq) {
      setMachines(prevMac => prevMac.map(m => m.id === matchedReq.machineId ? { ...m, status: machineStatus } : m));
    }

    setWorkOrders(prev => [newWO, ...prev]);

    addAuditLog('Create Work Order', `Completed Work Order Sheet ${nextId} linking ${targetReqId}. Spent: ฿${totalSpareCost + otherCost}`);
    triggerNotification('ปิดใบงานซ่อมบำรุงแล้ว', `เสร็จสมบูรณ์รหัสงาน ${nextId} รันไทม์ดำเนินการเก็บสเป็คเรียบร้อย`, 'success');
    
    // Reset Form
    setSymptomDiagnosed('');
    setCauseAnalysis('');
    setSolutionDetails('');
    setAllocatedParts([]);
    setOtherCost(0);
    setShowAddModal(false);

    if (clearAutoSelectRequest) {
      clearAutoSelectRequest();
    }
  };

  return (
    <div className="space-y-6" id="work-orders-main">
      {/* Action Header bar */}
      <div className="flex flex-wrap justify-between items-center bg-white dark:bg-zinc-800 p-4 rounded-md shadow-sm border border-gray-100 dark:border-zinc-700 gap-4">
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-blue-500" />
          <h3 className="text-base font-bold text-gray-800 dark:text-zinc-100 font-sans">
            ใบงานซ่อมปิดจุดเสีย (Technical Work Orders Portal)
          </h3>
          <span className="bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 text-xs px-2.5 py-0.5 rounded font-mono font-bold">
            {workOrders.length} Completed WOs
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <input
              type="text"
              placeholder="ค้นหารหัสใบงาน หรือสัญลักษณ์วินิจฉัย..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs rounded border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 p-2 pl-8 text-gray-900 dark:text-zinc-100"
            />
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-3 text-gray-400" />
          </div>

          {currentUserRole !== 'User' && (
            <button
              onClick={() => {
                setTargetReqId(autoSelectRequestId || 'REQ-2026-0005');
                setShowAddModal(true);
              }}
              className="px-3.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer h-8.5 w-full sm:w-auto justify-center"
            >
              <Plus className="h-4 w-4" />
              <span>สร้างใบรับงานซ่อม</span>
            </button>
          )}
        </div>
      </div>

      {autoSelectRequestId && (
        <div className="p-3 bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 text-xs rounded flex justify-between items-center font-sans animate-pulse">
          <span>🔔 คุณนำสิทธิ์กดรับงานเชื่อมโยงมาจากใบแจ้งซ่อม: <strong>{autoSelectRequestId}</strong></span>
          <button 
            onClick={() => {
              if (clearAutoSelectRequest) clearAutoSelectRequest();
            }}
            className="font-bold underline text-xs cursor-pointer"
          >
            ล้างการเชื่อมโยง
          </button>
        </div>
      )}

      {/* Main WO List Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredOrders.map(wo => {
          const reqObj = requests.find(r => r.id === wo.requestId);
          const macObj = reqObj ? machines.find(m => m.id === reqObj.machineId) : null;
          const sumCost = (wo.totalSpareCost || 0) + (wo.otherCost || 0);

          return (
            <div
              key={wo.id}
              className="card shadow-md bg-white dark:bg-zinc-800 rounded-md border border-gray-200 dark:border-zinc-700/80 overflow-hidden flex flex-col justify-between"
            >
              <div className="p-4 border-b border-gray-100 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/40 flex justify-between items-center">
                <div>
                  <span className="font-mono text-xs font-bold text-gray-400">WO SHEET: <strong>{wo.id}</strong></span>
                  <p className="text-[11px] text-gray-400">เชื่อมโยงอ้างอิง: <span className="font-bold text-blue-500 font-mono">{wo.requestId}</span></p>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  wo.repairResult === 'กลับมาใช้งานได้ปกติ' ? 'bg-green-150 text-green-800 bg-green-50' :
                  wo.repairResult === 'ใช้งานได้ชั่วคราว' ? 'bg-yellow-150 text-yellow-800 bg-yellow-50' :
                  'bg-red-50 text-red-800'
                }`}>
                  {wo.repairResult}
                </span>
              </div>

              <div className="p-4.5 space-y-4 text-xs text-gray-600 dark:text-zinc-300">
                {/* Diagnostics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 bg-gray-50 dark:bg-zinc-900/60 p-3.5 rounded border">
                    <span className="text-gray-400 block font-sans text-[10px]">ชิ้นงานเครื่องชำรุด:</span>
                    <strong className="text-gray-900 dark:text-zinc-100 font-sans block truncate">
                      {macObj ? `${macObj.name} (${macObj.id})` : `พาร์ต ${reqObj?.machineId}`}
                    </strong>
                    <span className="text-[10px] text-gray-400 block pt-1">สถานติดตั้ง: {macObj?.location || 'ตึกประกอบ'}</span>
                  </div>

                  <div className="space-y-1 bg-zinc-50 dark:bg-zinc-900/60 p-3.5 rounded border">
                    <span className="text-gray-400 block text-[10px]">ทีมช่างซ่อมบำรุง:</span>
                    <strong className="text-gray-900 dark:text-zinc-100 block">
                      {wo.technicianTeam.join(', ')}
                    </strong>
                    <span className="text-[10px] text-gray-400 block pt-1">ระยะเวลาทำงาน: <span className="font-bold font-mono text-gray-700 dark:text-zinc-200">{wo.manHours} ชั่วโมง</span></span>
                  </div>
                </div>

                {/* Specifics descriptive details */}
                <div className="space-y-2 border-t pt-2.5">
                  <p>🔎 <strong>วิเคราะห์หาสาเหตุ:</strong> <span className="text-gray-500 dark:text-zinc-400">{wo.causeAnalysis}</span></p>
                  <p>🔧 <strong>ขั้นตอนวิธีปัดแก้ไข:</strong> <span className="text-gray-500 dark:text-zinc-400">{wo.solutionDetails}</span></p>
                </div>

                {/* Spares matching usage breakdown */}
                {wo.usedSpareParts && wo.usedSpareParts.length > 0 && (
                  <div className="border-t pt-2.5">
                    <span className="text-gray-400 block pb-1">อะไหล่ที่เบิกพ่วงตารางความเสถียร:</span>
                    <div className="grid grid-cols-3 gap-2 bg-yellow-50/20 rounded p-2.5 font-sans border text-[10px]">
                      {wo.usedSpareParts.map((sp, idx) => {
                        const partObj = spareParts.find(p => p.id === sp.partId);
                        return (
                          <div key={idx} className="border-r last:border-r-0 pr-1.5">
                            <span className="font-bold block truncate text-zinc-700 dark:text-zinc-200">{partObj ? partObj.name : sp.partId}</span>
                            <span className="text-gray-400 block">เบิก {sp.quantity} * ฿{sp.unitPrice}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Cost blocks footer */}
              <div className="p-3 border-t border-gray-150 bg-gray-50 dark:bg-zinc-800/60 flex justify-between items-center text-xs">
                <span className="text-[10.5px] text-zinc-400">รอบปฏิบัติจาก: {wo.startDate} ถึง {wo.endDate || '-'}</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  มูลค่าอะไหล่/แรงรวม: <span className="text-emerald-500 text-sm font-mono font-black">฿{sumCost.toLocaleString('th-TH')}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add WO Modal Sheet Form */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/65 flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border-t-4 border-blue-500">
            <div className="p-4 border-b border-gray-100 dark:border-zinc-700 flex justify-between items-center bg-gray-50 dark:bg-zinc-800/40">
              <h4 className="font-bold text-gray-800 dark:text-zinc-100 text-sm">ลงสลักใบวิเคราะห์และปิดงานซ่อม (MMS Order Sheet)</h4>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  if (clearAutoSelectRequest) clearAutoSelectRequest();
                }} 
                className="text-gray-400 hover:text-black dark:hover:text-white font-bold text-lg cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateWorkOrder} className="p-5 space-y-3.5 text-xs text-gray-700 dark:text-zinc-300">
              
              <div className="grid grid-cols-2 gap-3 font-sans">
                <div className="col-span-2 space-y-1">
                  <label className="block font-bold">เลือกอ้างอิงใบแจ้งซ่อมรอลอยลำ (Reference Request * )</label>
                  <select
                    required
                    value={targetReqId}
                    onChange={(e) => setTargetReqId(e.target.value)}
                    className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 text-xs font-bold"
                  >
                    <option value="">-- กรุณาเลือก --</option>
                    {requests
                      .filter(r => r.status === 'รอรับงาน' || r.status === 'กำลังดำเนินการ' || r.id === autoSelectRequestId)
                      .map(r => (
                        <option key={r.id} value={r.id}>{r.id} - {r.symptom.slice(0, 45)}... ({r.machineId})</option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2.5 font-sans">
                <div className="space-y-1">
                  <label className="block font-bold">วันเริ่มต้น</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded border border-gray-300 p-1.5"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold">เวลาที่เริ่ม</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded border border-gray-300 p-1.5"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold">วันเสร็จงาน</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded border border-gray-300 p-1.5"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold">เวลาเสร็จสิ้น</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded border border-gray-300 p-1.5"
                  />
                </div>
              </div>

              <div className="space-y-1 font-sans">
                <label className="block font-bold">อาการเสียที่แท้จริงหลังจากช่างรื้อตรวจ (Symptom Diagnosed * )</label>
                <input
                  type="text"
                  required
                  value={symptomDiagnosed}
                  onChange={(e) => setSymptomDiagnosed(e.target.value)}
                  placeholder="เช่น มอเตอร์ไหม้เกรียมรอบพันขดลวดเนื่องจากขาดสารเย็นระเบิด"
                  className="w-full rounded border border-gray-300 p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 font-sans">
                <div className="space-y-1">
                  <label className="block font-bold">วิเคราะห์หาสาเหตุที่เกิดชำรุด *</label>
                  <textarea
                    required
                    rows={2}
                    value={causeAnalysis}
                    onChange={(e) => setCauseAnalysis(e.target.value)}
                    placeholder="เช่น ขอบพัดลมระเหยมฝุ่นเกร็ดผงเหล็กอัดบล็อคค้างช่องลม"
                    className="w-full rounded border border-gray-300 p-2"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold">ขั้นตอนวิธีซ่อมแก้ไขโดยช่าง *</label>
                  <textarea
                    required
                    rows={2}
                    value={solutionDetails}
                    onChange={(e) => setSolutionDetails(e.target.value)}
                    placeholder="เช่น ดำเนินรื้อพัดลมขัดเงาเป่ากรองและปรับสปริงดึงตลับ"
                    className="w-full rounded border border-gray-300 p-2"
                  />
                </div>
              </div>

              {/* Dynamic Spare parts drawer */}
              <div className="p-3 bg-gray-50 dark:bg-zinc-900 rounded border border-gray-200 space-y-2">
                <span className="font-bold text-[10.5px] text-gray-500 block">📥 บันทึกการเปลี่ยนพัสดุและอะไหล่ (คลังสต็อกจะตัดยอดอัตโนมัติ) :</span>
                
                <div className="flex gap-2 items-center">
                  <select
                    value={tempPartId}
                    onChange={(e) => setTempPartId(e.target.value)}
                    className="flex-1 rounded border border-gray-300 p-2 bg-white dark:bg-zinc-800"
                  >
                    <option value="">-- เลือกเบิกอะไหล่ --</option>
                    {spareParts.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (ในคลังคงเหลือ: {p.quantity} {p.unit})</option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min={1}
                    value={tempPartQty}
                    onChange={(e) => setTempPartQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 rounded border border-gray-300 p-2 text-center"
                  />

                  <button
                    type="button"
                    onClick={handleAddPartTemp}
                    className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded cursor-pointer"
                  >
                    + เพิ่ม
                  </button>
                </div>

                {/* Sublist mapping */}
                {allocatedParts.length > 0 && (
                  <div className="pt-2 border-t font-sans">
                    <span className="text-[10px] text-zinc-400 block mb-1">อะไหล่ที่รออนุมัติเบิกพ่วงใบสั่ง:</span>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {allocatedParts.map(p => {
                        const original = spareParts.find(o => o.id === p.partId);
                        return (
                          <div key={p.partId} className="flex justify-between items-center text-[10px] bg-white dark:bg-zinc-800 p-1.5 px-2.5 rounded border">
                            <span>{original?.name} ({p.partId}) × <strong>{p.quantity} {original?.unit}</strong></span>
                            <div className="flex items-center gap-2">
                              <span>฿{(p.quantity * p.unitPrice).toLocaleString()}</span>
                              <button 
                                type="button" 
                                onClick={() => handleRemovePartTemp(p.partId)}
                                className="text-red-500 hover:text-red-700 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 font-sans">
                <div className="space-y-1">
                  <label className="block font-bold">ผลลัพธ์ซ่อมและสถานะเครื่องจักร</label>
                  <select
                    value={repairResult}
                    onChange={(e) => setRepairResult(e.target.value as any)}
                    className="w-full rounded border border-gray-300 p-2 font-bold bg-white dark:bg-zinc-800"
                  >
                    <option value="กลับมาใช้งานได้ปกติ">🟢 กลับมาใช้งานได้ปกติ (Downtime หยุด)</option>
                    <option value="ใช้งานได้ชั่วคราว">🟡 ใช้งานได้ชั่วคราว (รอ PM ย้ำเสริม)</option>
                    <option value="ต้องรอสั่งอะไหล่">🟠 ต้องรอสั่งอะไหล่ (ยังใช้งานไม่ได้)</option>
                    <option value="ซ่อมไม่ได้/ส่งเคลม">🔴 ซ่อมไม่ได้/ส่งเคลมจำหน่ายสะสม</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold">ค่าแรงและใช้จ่ายอื่นภายนอก (฿)</label>
                  <input
                    type="number"
                    min={0}
                    value={otherCost}
                    onChange={(e) => setOtherCost(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full rounded border border-gray-300 p-2"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2.5 font-sans">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    if (clearAutoSelectRequest) clearAutoSelectRequest();
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded font-bold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-bold shadow-sm cursor-pointer"
                >
                  บันทึกปิดใบงานซ่อม
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
