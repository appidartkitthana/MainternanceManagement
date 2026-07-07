/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RepairRequest, Machine, PriorityLevel, RepairRequestStatus, UserRole } from '../types';
import { AlertCircle, Search, Plus, Eye, Wrench, ShieldAlert } from 'lucide-react';

interface RepairRequestsViewProps {
  requests: RepairRequest[];
  setRequests: React.Dispatch<React.SetStateAction<RepairRequest[]>>;
  machines: Machine[];
  currentUserRole: UserRole;
  currentUserName: string;
  addAuditLog: (action: string, details: string) => void;
  triggerNotification: (title: string, message: string, type: 'info' | 'warning' | 'danger' | 'success') => void;
  triggerLineAlert?: (eventType: 'breakdown' | 'work_order_assign' | 'work_order_complete' | 'pm_done' | 'general', data: any) => void;
  onNavigateToWorkOrderWithReq: (reqId: string) => void;
}

export default function RepairRequestsView({
  requests,
  setRequests,
  machines,
  currentUserRole,
  currentUserName,
  addAuditLog,
  triggerNotification,
  triggerLineAlert,
  onNavigateToWorkOrderWithReq
}: RepairRequestsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewRequest, setViewRequest] = useState<RepairRequest | null>(null);

  // Form states
  const [machineId, setMachineId] = useState('');
  const [symptom, setSymptom] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('Medium');
  const [attachmentUrl, setAttachmentUrl] = useState('https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500');

  const filteredRequests = requests.filter(r => {
    const machine = machines.find(m => m.id === r.machineId);
    const machineName = machine ? machine.name : '';
    const matchSearch = r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        r.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        r.symptom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        machineName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPriority = selectedPriority ? r.priority === selectedPriority : true;
    const matchStatus = selectedStatus ? r.status === selectedStatus : true;

    return matchSearch && matchPriority && matchStatus;
  });

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!machineId || !symptom) {
      alert('กรุณากรอกข้อมูลระบุอาการและความขัดข้องของเครื่อง!');
      return;
    }

    const nextSerial = String(requests.length + 1).padStart(4, '0');
    const nextId = `REQ-2026-${nextSerial}`;

    const newRequest: RepairRequest = {
      id: nextId,
      requestDate: new Date('2026-06-10').toISOString().split('T')[0],
      requestTime: '11:27',
      requesterName: currentUserName,
      departmentId: 'DEP-PRO-A', // Autodetected in real database
      machineId,
      symptom,
      priority,
      status: 'รอรับงาน',
      attachmentUrl: attachmentUrl || undefined,
      attachmentType: attachmentUrl ? 'image' : undefined
    };

    setRequests(prev => [newRequest, ...prev]);

    const machine = machines.find(m => m.id === machineId);
    const machineName = machine ? machine.name : machineId;
    const machineCode = machine ? machine.id : undefined;
    const location = machine ? machine.location : undefined;

    // Trigger LINE Alert
    if (triggerLineAlert) {
      triggerLineAlert('breakdown', {
        title: `มีงานแจ้งซ่อมเครื่องจักรชำรุด [${nextId}]`,
        machineName,
        machineCode,
        location,
        priority,
        symptom,
        requester: currentUserName,
        imageUrl: attachmentUrl || undefined,
        dateTime: `${newRequest.requestDate} ${newRequest.requestTime}`
      });
    }

    // Push Notification
    triggerNotification(
      'มีงานแจ้งซ่อมใหม่จากโรงผลิต', 
      `เครื่องจักร "${machineId}" อาการเสีย "${symptom.slice(0, 30)}..." ระดับความรุนแรง ${priority}`, 
      priority === 'Critical' ? 'danger' : 'info'
    );

    addAuditLog('Create Repair Request', `Dispatched repair ticket: ${nextId} for machine ${machineId}. Severity: ${priority}`);
    
    // Close and Reset Form
    setMachineId('');
    setSymptom('');
    setPriority('Medium');
    setShowAddModal(false);
  };

  const handleCancelRequest = (id: string) => {
    if (window.confirm(`คุณแน่ใจว่าต้องการ "ยกเลิก" ใบแจ้งซ่อมเลขที่ ${id} หรือไม่?`)) {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'ยกเลิก' } : r));
      addAuditLog('Cancel Repair Request', `Cancelled repair request invoice: ${id}`);
      triggerNotification('ยกเลิกใบงานสำเร็จ', `ยกเลิกสลิป ${id} เรียบร้อย`, 'warning');
    }
  };

  return (
    <div className="space-y-6" id="repair-requests-main">
      {/* Search and Filters Header */}
      <div className="flex flex-wrap justify-between items-center bg-white dark:bg-zinc-800 p-4 rounded-md shadow-sm border border-gray-100 dark:border-zinc-700 gap-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-indigo-500" />
          <h3 className="text-base font-bold text-gray-800 dark:text-zinc-100 font-sans">
            ทะเบียนคำร้องแจ้งซ่อม (Maintenance Repair Requests Log)
          </h3>
          <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 text-xs px-2.5 py-0.5 rounded font-mono font-bold">
            {requests.length} ใบแจ้งซ่อม
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-44">
            <input
              type="text"
              placeholder="ค้นหาใบแจ้ง ผู้แจ้ง หรืออาการ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs rounded border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 p-2 pl-8 text-gray-900 dark:text-zinc-100"
            />
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-3 text-gray-400" />
          </div>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="rounded border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 p-2 text-xs text-gray-900 dark:text-zinc-100 w-full sm:w-auto font-bold"
          >
            <option value="">ระดับความสำคัญทั้งหมด</option>
            <option value="Low" className="text-blue-500">Low (ต่ำ)</option>
            <option value="Medium" className="text-green-500">Medium (ปานกลาง)</option>
            <option value="High" className="text-orange-500">High (เร่งด่วน)</option>
            <option value="Critical" className="text-red-500 font-bold">Critical (วิกฤตความเสี่ยงสูง)</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 p-2 text-xs text-gray-900 dark:text-zinc-100 w-full sm:w-auto"
          >
            <option value="">สถานะใบงานทั้งหมด</option>
            <option value="รอรับงาน">รอรับงาน (Pending)</option>
            <option value="กำลังดำเนินการ">กำลังดำเนินการ (In Progress)</option>
            <option value="เสร็จสิ้น">เสร็จสิ้น (Completed)</option>
            <option value="ยกเลิก">ยกเลิก (Cancelled)</option>
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer h-8.5 w-full sm:w-auto justify-center"
          >
            <Plus className="h-4 w-4" />
            <span>สร้างใบแจ้งซ่อม</span>
          </button>
        </div>
      </div>

      {/* Main tickets lists table card */}
      <div className="card shadow-md bg-white dark:bg-zinc-800 rounded-md border border-gray-150 dark:border-zinc-700 overflow-hidden font-sans">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
            <thead className="bg-[#fbfcff] dark:bg-zinc-800/50">
              <tr>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">รหัสสลิป</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">วันที่แจ้ง</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">ชื่อผู้แจ้งเหตุ</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">รหัสเครื่อง</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">รายละเอียดอาการชำรุดเสีย</th>
                <th className="px-5 py-3 text-center text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">ความเร่งด่วน</th>
                <th className="px-5 py-3 text-center text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">สถานะ</th>
                <th className="px-5 py-3 text-right text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">การตอบสนอง</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-zinc-800 divide-y divide-gray-100 dark:divide-zinc-700/60 text-xs text-gray-700 dark:text-zinc-300">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-400">
                    🚨 ไม่พบใบรายการแจ้งซ่อมตรงความต้องการขณะนี้
                  </td>
                </tr>
              ) : (
                filteredRequests.map(req => {
                  const machine = machines.find(m => m.id === req.machineId);
                  return (
                    <tr key={req.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-700/20">
                      <td className="px-5 py-3.5 whitespace-nowrap font-mono font-bold text-gray-900 dark:text-white bg-blue-50/10">{req.id}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-gray-500 dark:text-zinc-400">
                        {req.requestDate} <span className="font-mono text-zinc-400 text-[10px]">{req.requestTime}</span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap font-bold">
                        {req.requesterName}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap font-mono font-bold text-blue-500" title={machine?.name}>
                        {req.machineId}
                      </td>
                      <td className="px-5 py-3.5 max-w-sm truncate text-gray-600 dark:text-zinc-350" title={req.symptom}>
                        {req.symptom}
                      </td>
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold shadow-xs ${
                          req.priority === 'Critical' ? 'bg-red-500 text-white animate-pulse' :
                          req.priority === 'High' ? 'bg-orange-100 text-orange-850 dark:bg-orange-950/40 dark:text-orange-300' :
                          req.priority === 'Medium' ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                        }`}>
                          {req.priority}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          req.status === 'เสร็จสิ้น' ? 'bg-green-100 text-green-800 dark:bg-green-950/30' :
                          req.status === 'กำลังดำเนินการ' ? 'bg-yellow-100 text-yellow-850 dark:bg-yellow-950/30' :
                          req.status === 'รอรับงาน' ? 'bg-red-50 text-red-850 dark:bg-red-950/20 text-red-500' :
                          'bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-zinc-300'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-right space-x-1 flex justify-end">
                        <button
                          onClick={() => setViewRequest(req)}
                          className="p-1 px-2.5 hover:bg-gray-100 dark:hover:bg-zinc-700 text-indigo-500 dark:text-indigo-400 rounded text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>ดูรายละเอียด</span>
                        </button>

                        {(currentUserRole === 'Admin' || currentUserRole === 'Supervisor' || currentUserRole === 'Technician') && req.status === 'รอรับงาน' && (
                          <button
                            onClick={() => onNavigateToWorkOrderWithReq(req.id)}
                            className="p-1 px-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-[11px] font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <Wrench className="h-3.5 w-3.5" />
                            <span>รับงานซ่อม (WO)</span>
                          </button>
                        )}

                        {req.status === 'รอรับงาน' && req.requesterName === currentUserName && (
                          <button
                            onClick={() => handleCancelRequest(req.id)}
                            className="p-1 px-1.5 text-red-500 hover:bg-red-50 rounded text-[11px] cursor-pointer"
                          >
                            ยกเลิก
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Create Form Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/65 flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-md w-full border-t-4 border-indigo-500 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-zinc-700 flex justify-between items-center bg-gray-50 dark:bg-zinc-800/40 font-sans">
              <h4 className="font-bold text-gray-800 dark:text-zinc-100 text-sm">สร้างใบแจ้งซ่อมเครื่องจักรกลอุตสาหกรรม</h4>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-black dark:hover:text-white font-bold text-lg cursor-pointer">×</button>
            </div>

            <form onSubmit={handleCreateRequest} className="p-5 space-y-4 text-xs text-gray-700 dark:text-zinc-300">
              <div className="space-y-1">
                <label className="block font-bold">เลือกเครื่องจักรที่เสียชำรุด *</label>
                <select
                  required
                  value={machineId}
                  onChange={(e) => setMachineId(e.target.value)}
                  className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 font-semibold"
                >
                  <option value="">-- เลือกเครื่องซ่อม --</option>
                  {machines.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.id})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold">อาการชำรุด / ปัญหาความขัดข้องหน้างาน *</label>
                <textarea
                  required
                  rows={4}
                  value={symptom}
                  onChange={(e) => setSymptom(e.target.value)}
                  placeholder="กรุณาอธิบายอาการเสียหายโดยละเอียด เช่น พบอุณหภูมิมอเตอร์พัดลมแสนร้อนสว่าน 85C และมีเสียงกระตุกบ่อยครั้ง..."
                  className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold">ความเร่งด่วนแรงดันกระทำ</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                    className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 font-bold"
                  >
                    <option value="Low">Low (ต่ำ - รอได้)</option>
                    <option value="Medium">Medium (ปกติ - ซ่อมใน 24 ชม.)</option>
                    <option value="High">High (เร่งด่วน - กระทบตัวไลน์ผลิต)</option>
                    <option value="Critical">Critical (วิกฤต - ไลน์ดับทันที)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold">จำลอง แนบรูปภาพตัวอย่างปัญหา</label>
                  <input
                    type="text"
                    value={attachmentUrl}
                    onChange={(e) => setAttachmentUrl(e.target.value)}
                    placeholder="URL รูปภาพจำลอง"
                    className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-zinc-700 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-650 rounded font-bold cursor-pointer"
                >
                  ยกเลิก/ปิด
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold shadow-sm cursor-pointer"
                >
                  ดิสแพตช์ใบแจ้งซ่อม
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Specs Detail Modal Viewer */}
      {viewRequest && (
        <div className="fixed inset-0 bg-black/65 flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-sm w-full overflow-hidden border">
            <div className="p-4 border-b border-gray-100 dark:border-zinc-700 flex justify-between items-center bg-gray-50 dark:bg-zinc-800/50">
              <h4 className="font-bold text-gray-850 dark:text-zinc-150 text-sm">รายละเอียดใบแจ้ง: {viewRequest.id}</h4>
              <button onClick={() => setViewRequest(null)} className="text-gray-400 hover:text-black dark:hover:text-white font-bold text-lg cursor-pointer">×</button>
            </div>

            <div className="p-5 text-xs text-gray-700 dark:text-zinc-300 space-y-4">
              {viewRequest.attachmentUrl && (
                <div className="h-36 w-full rounded overflow-hidden">
                  <img src={viewRequest.attachmentUrl} alt="symptom attached" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3.5 bg-gray-50 dark:bg-zinc-900/40 p-3.5 rounded border">
                <div>
                  <span className="text-gray-400 block pb-0.5">ผู้แจังซ่อมบำรุง:</span>
                  <strong className="text-gray-900 dark:text-zinc-100">{viewRequest.requesterName}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block pb-0.5">รหัสเครื่องชำรุด:</span>
                  <strong className="text-blue-500 font-mono">{viewRequest.machineId}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block pb-0.5">วันที่และเวลา:</span>
                  <strong className="text-gray-800 dark:text-zinc-200">{viewRequest.requestDate} / {viewRequest.requestTime} น.</strong>
                </div>
                <div>
                  <span className="text-gray-400 block pb-0.5">ความสลักสำคัญ:</span>
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    viewRequest.priority === 'Critical' ? 'bg-red-500 text-white' : 'bg-orange-100 text-orange-850 dark:bg-zinc-700'
                  }`}>{viewRequest.priority}</span>
                </div>
              </div>

              <div className="space-y-1 leading-relaxed">
                <span className="text-gray-400 block font-bold">อาการที่แจ้ง:</span>
                <p className="p-3 rounded bg-zinc-50 dark:bg-zinc-800 border text-gray-800 dark:text-zinc-250 font-sans">
                  {viewRequest.symptom}
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50/50 dark:bg-zinc-800/40 border-t flex justify-between">
              <span className="text-[10px] text-gray-400 mt-2 font-sans py-0.5">อ้างอิงมาตรฐาน ISO 14001</span>
              <button
                onClick={() => setViewRequest(null)}
                className="px-5 py-2 bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-650 rounded text-xs font-bold font-sans cursor-pointer"
              >
                ปิดดูหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
