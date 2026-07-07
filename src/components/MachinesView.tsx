/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Machine, UserRole } from '../types';
import { PlusCircle, Search, Edit2, Trash2, Download, Eye, ExternalLink, ShieldCheck } from 'lucide-react';

interface MachinesViewProps {
  machines: Machine[];
  setMachines: React.Dispatch<React.SetStateAction<Machine[]>>;
  currentUserRole: UserRole;
  addAuditLog: (action: string, details: string) => void;
  triggerNotification: (title: string, message: string, type: 'info' | 'warning' | 'danger' | 'success') => void;
}

export default function MachinesView({
  machines,
  setMachines,
  currentUserRole,
  addAuditLog,
  triggerNotification
}: MachinesViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewDetailMachine, setViewDetailMachine] = useState<Machine | null>(null);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);

  // Form states
  const [machineId, setMachineId] = useState('');
  const [name, setName] = useState('');
  const [typeId, setTypeId] = useState('MT-01');
  const [departmentId, setDepartmentId] = useState('DEP-PRO-A');
  const [location, setLocation] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<'Operational' | 'Repairing' | 'Breakdown' | 'Decommissioned'>('Operational');
  const [currentCustomer, setCurrentCustomer] = useState('');
  const [currentSite, setCurrentSite] = useState('');
  const [rentalHistory, setRentalHistory] = useState<any[]>([]);

  const filteredMachines = machines.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        m.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (m.currentCustomer && m.currentCustomer.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (m.currentSite && m.currentSite.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchDept = selectedDept ? m.departmentId === selectedDept : true;
    const matchStatus = selectedStatus ? m.status === selectedStatus : true;

    return matchSearch && matchDept && matchStatus;
  });

  const handleOpenAdd = () => {
    setEditingMachine(null);
    setMachineId(`MC-INJ-${String(machines.length + 1).padStart(3, '0')}`);
    setName('');
    setTypeId('MT-01');
    setDepartmentId('DEP-PRO-A');
    setLocation('');
    setBrand('');
    setModel('');
    setSerialNumber('');
    setStartDate('2026-06-10');
    setImageUrl('https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500');
    setStatus('Operational');
    setCurrentCustomer('');
    setCurrentSite('');
    setRentalHistory([]);
    setShowModal(true);
  };

  const handleOpenEdit = (m: Machine, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingMachine(m);
    setMachineId(m.id);
    setName(m.name);
    setTypeId(m.typeId);
    setDepartmentId(m.departmentId);
    setLocation(m.location);
    setBrand(m.brand);
    setModel(m.model);
    setSerialNumber(m.serialNumber);
    setStartDate(m.startDate);
    setImageUrl(m.imageUrl);
    setStatus(m.status);
    setCurrentCustomer(m.currentCustomer || '');
    setCurrentSite(m.currentSite || '');
    setRentalHistory(m.rentalHistory || []);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUserRole !== 'Admin' && currentUserRole !== 'Supervisor') {
      alert('เฉพาะแผนก Admin หรือ Supervisor เท่านั้นที่ได้รับอนุญาตให้เพิ่มหรือแก้ไขข้อมูลเครื่องจักรระวางเครื่องได้!');
      return;
    }

    if (editingMachine) {
      // Edit
      setMachines(prev => prev.map(m => m.id === machineId ? {
        ...m,
        id: machineId,
        name,
        typeId,
        departmentId,
        location,
        brand,
        model,
        serialNumber,
        startDate,
        imageUrl,
        status,
        currentCustomer: currentCustomer || undefined,
        currentSite: currentSite || undefined,
        rentalHistory: rentalHistory.length > 0 ? rentalHistory : undefined
      } : m));
      addAuditLog('Edit Machine', `Updated machine specifications and lease info for: ${name} (${machineId})`);
      triggerNotification('บันทึกสำเร็จ', 'อัปเดตสเป็คและประวัติการปล่อยเช่าเสร็จสมบูรณ์', 'success');
    } else {
      // Add
      if (machines.some(m => m.id === machineId)) {
        alert('ชื่อรหัสเครื่องจักรซ้ำกับประวัติเดิม! กรุณากำหนดไอดีรหัสความปลอดภัยอีกครั้ง');
        return;
      }
      const newMac: Machine = {
        id: machineId,
        name,
        typeId,
        departmentId,
        location,
        brand,
        model,
        serialNumber,
        startDate,
        imageUrl,
        status,
        currentCustomer: currentCustomer || undefined,
        currentSite: currentSite || undefined,
        rentalHistory: rentalHistory.length > 0 ? rentalHistory : undefined
      };
      setMachines(prev => [...prev, newMac]);
      addAuditLog('Register Machine', `Registered asset and lease: ${name} (ID: ${machineId})`);
      triggerNotification('ลงทะเบียนสำเร็จ', 'บันทึกเครื่องจัดระวางทะเบียนพร้อมสิทธิการเช่าเรียบร้อย', 'success');
    }
    setShowModal(false);
  };

  const handleDelete = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentUserRole !== 'Admin') {
      alert('บทบาท Admin เท่านั้นที่ได้รับการอนุญาตลบเครื่องจักรออกจากสารบบการผลิตความปลอดภัย!');
      return;
    }
    if (window.confirm(`คุณแน่ใจว่าต้องการลบเครื่องจักรกล "${name}" (ID: ${id}) ออกจากทะเบียน? ข้อมูลนี้และประวัติตอบรับจะสูญสิ้น`)) {
      setMachines(prev => prev.filter(m => m.id !== id));
      addAuditLog('Delete Machine', `Removed machine: ${name} (ID: ${id})`);
      triggerNotification('ลบสำเร็จ', 'นำข้อมลทะเบียนเครื่องออกเรียบร้อย', 'warning');
    }
  };

  const handleExportExcel = () => {
    let csvContent = '\uFEFF';
    csvContent += 'รหัสเครื่องจักร,ชื่อเครื่องจักร,แผนกสังกัด,สถานที่ติดตั้ง,ยี่ห้อ,รุ่น,Serial Number,เริ่มใช้งาน,สถานะปัจจุบัน,ลูกค้าผู้เช่าปัจจุบัน,ไซต์งานเช่าปัจจุบัน\n';
    filteredMachines.forEach(m => {
      csvContent += `"${m.id}","${m.name}","${m.departmentId}","${m.location}","${m.brand}","${m.model}","${m.serialNumber}","${m.startDate}","${m.status}","${m.currentCustomer || 'ไม่มี'}","${m.currentSite || 'ไม่มี'}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'MMS_Machines_Database.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerNotification('Export Excel', 'จัดเตรียมและดาวน์โหลดสรุปตารางเครื่องจักรสำเร็จ', 'success');
  };

  return (
    <div className="space-y-6" id="machines-portal">
      {/* Search Filter Header row */}
      <div className="flex flex-wrap justify-between items-center bg-white dark:bg-zinc-800 p-4 rounded-md shadow-sm border border-gray-100 dark:border-zinc-700 gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-blue-500" />
          <h3 className="text-base font-bold text-gray-800 dark:text-zinc-100 font-sans">
            ทะเบียนพิกัดเครื่องจักร (Machinery Assets Register)
          </h3>
          <span className="bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 text-xs px-2.5 py-0.5 rounded font-mono font-bold">
            {machines.length} เครื่องรันไทม์
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <input
              type="text"
              placeholder="ค้นหารหัส, S/N, ลูกค้า หรือ ไซต์..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs rounded border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 p-2 pl-8 text-gray-900 dark:text-zinc-100"
            />
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-3 text-gray-400" />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="rounded border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 p-2 text-xs text-gray-900 dark:text-zinc-100 w-full sm:w-auto"
          >
            <option value="">แผนกทั้งหมด</option>
            <option value="DEP-PRO-A">Line A (แกะแบบและขึ้นรูป)</option>
            <option value="DEP-PRO-B">Line B (แปรรูปและหลอม)</option>
            <option value="DEP-PACK">ฝ่ายบรรจุภัณฑ์</option>
            <option value="DEP-UTIL">ห้องเครื่อง Utility</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 p-2 text-xs text-gray-900 dark:text-zinc-100 w-full sm:w-auto font-bold"
          >
            <option value="">สถานะทั้งหมด</option>
            <option value="Operational" className="text-green-500">🟢 ทำงานปกติ (Operational)</option>
            <option value="Repairing" className="text-yellow-600">🟡 อยู่ระหว่างซ่อม (Repairing)</option>
            <option value="Breakdown" className="text-red-500">🔴 เครื่องชำรุด (Breakdown)</option>
            <option value="Decommissioned" className="text-gray-400">⚪ ปลดระวาง (Decommissioned)</option>
          </select>

          <button
            onClick={handleExportExcel}
            className="p-1 px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-xs font-bold transition flex items-center gap-1.5 cursor-pointer h-8.5 w-full sm:w-auto justify-center"
            title="Export csv/excel"
          >
            <Download className="h-4 w-4" />
            <span className="sm:inline">Export Excel</span>
          </button>

          {(currentUserRole === 'Admin' || currentUserRole === 'Supervisor') && (
            <button
              onClick={handleOpenAdd}
              className="px-3.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer h-8.5 w-full sm:w-auto justify-center"
            >
              <PlusCircle className="h-4 w-4" />
              <span>เพิ่มเครื่องจักร</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid Card list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMachines.map(m => {
          return (
            <div
              key={m.id}
              onClick={() => setViewDetailMachine(m)}
              className="group cursor-pointer bg-white dark:bg-zinc-800 hover:shadow-xl transition-all rounded-md overflow-hidden shadow-sm border border-gray-150 dark:border-zinc-700/60 flex flex-col justify-between"
            >
              {/* Picture banner */}
              <div className="h-44 relative bg-gray-100 dark:bg-zinc-900 overflow-hidden">
                <img
                  src={m.imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500'}
                  alt={m.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Status Badges hover */}
                <div className="absolute top-3 right-3">
                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold shadow-md tracking-wider ${
                    m.status === 'Operational' ? 'bg-green-500 text-white' :
                    m.status === 'Repairing' ? 'bg-yellow-500 text-black' :
                    m.status === 'Breakdown' ? 'bg-red-500 text-white animate-pulse' :
                    'bg-gray-500 text-white'
                  }`}>
                    {m.status === 'Operational' ? '🟢 ทำงานปกติ' :
                     m.status === 'Repairing' ? '🟡 กำลังซ่อมบำรุง' :
                     m.status === 'Breakdown' ? '🔴 หยุดเครื่องเสีย' : '⚪ ปลดระวางการทำงาน'}
                  </span>
                </div>

                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex justify-between items-end">
                  <div className="min-w-0 flex-1">
                    <span className="font-mono text-[9px] font-bold text-blue-400 block tracking-widest">{m.id}</span>
                    <h4 className="text-white font-bold font-sans text-xs tracking-tight truncate">{m.name}</h4>
                  </div>
                  <span className="ml-2 bg-zinc-950/80 text-zinc-300 font-mono text-[10px] px-1.5 py-0.5 rounded border border-zinc-700 select-none flex-shrink-0">
                    S/N: {m.serialNumber}
                  </span>
                </div>
              </div>

              {/* Sub parameters */}
              <div className="p-4 space-y-3 text-xs text-gray-600 dark:text-zinc-300 flex-1">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-400 block text-[10px]">แผนกผู้จัดสรร:</span>
                    <span className="font-semibold block truncate">
                      {m.departmentId === 'DEP-PRO-A' ? 'ไลน์ A (ขึ้นรูป)' :
                       m.departmentId === 'DEP-PRO-B' ? 'ไลน์ B (หลอมโลหะ)' :
                       m.departmentId === 'DEP-PACK' ? 'ฝ่ายบรรจุภัณฑ์' : 'ฝ่ายลาน Utility'}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[10px]">ที่อยู่พิกัดแผง:</span>
                    <span className="font-semibold block truncate">{m.location}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t pt-2 border-gray-150 dark:border-zinc-700/60 font-mono text-[10px]">
                  <div>
                    <span className="text-gray-400 block font-sans text-[9px]">ยี่ห้อ (Brand):</span>
                    <span className="font-bold truncate block">{m.brand}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-sans text-[9px]">รุ่น (Model):</span>
                    <span className="font-bold truncate block">{m.model}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-sans text-[9px]">เริ่มใช้งาน:</span>
                    <span className="font-semibold truncate block text-gray-500">{m.startDate}</span>
                  </div>
                </div>

                {/* Renter information block */}
                <div className="border-t pt-2 border-gray-150 dark:border-zinc-700/60 text-xs">
                  {m.currentCustomer ? (
                    <div className="bg-blue-50/50 dark:bg-blue-950/25 p-2 rounded border border-blue-100/50 dark:border-blue-900/40">
                      <span className="text-blue-600 dark:text-blue-400 font-extrabold block text-[9px] uppercase tracking-wider">🏢 กำลังถูกเช่าโดยลูกค้า</span>
                      <div className="font-bold text-gray-800 dark:text-zinc-200 truncate">{m.currentCustomer}</div>
                      <div className="text-gray-500 dark:text-zinc-400 text-[10px] truncate">📍 ไซต์งาน: {m.currentSite || 'ไม่ระบุไซต์งาน'}</div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-zinc-900/30 p-2 rounded border border-gray-100 dark:border-zinc-800 text-center text-gray-450 dark:text-zinc-500 italic text-[10px]">
                      📦 ไม่มีคนเช่า (ใช้ภายในโรงงาน / รอลูกค้า)
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer action and admin settings */}
              <div className="p-3 border-t border-gray-100 dark:border-zinc-700/65 bg-gray-50/50 dark:bg-zinc-800/40 flex justify-between items-center">
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5 text-blue-500" />
                  กดเพื่อดูหน้างานรายละเอียดเพิ่มเติม
                </span>

                {(currentUserRole === 'Admin' || currentUserRole === 'Supervisor') && (
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => handleOpenEdit(m, e)}
                      className="p-1 px-2.5 hover:bg-gray-100 dark:hover:bg-zinc-700 text-blue-500 dark:text-blue-400 rounded text-[11px] font-bold transition cursor-pointer"
                    >
                      แก้ไข
                    </button>
                    {currentUserRole === 'Admin' && (
                      <button
                        onClick={(e) => handleDelete(m.id, m.name, e)}
                        className="p-1 px-2.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 dark:text-red-400 rounded text-[11px] font-bold transition cursor-pointer"
                      >
                        ลบ
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

       {/* Machine Create / Edit Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/65 flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-md w-full border-t-4 border-blue-500 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-zinc-700 flex justify-between items-center bg-gray-50 dark:bg-zinc-800/50 font-sans flex-shrink-0">
              <h4 className="font-bold text-gray-800 dark:text-zinc-100 text-sm">
                {editingMachine ? `แก้ไขสเป็คเครื่องจักร: ${editingMachine.id}` : 'ลงระวางเครื่องอุตสาหกรรมในสังกัดตัวใหม่'}
              </h4>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black dark:hover:text-white font-bold text-lg cursor-pointer">×</button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3.5 text-xs text-gray-700 dark:text-zinc-300 flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold">รหัสเครื่องจักร * (ID)</label>
                  <input
                    type="text"
                    required
                    value={machineId}
                    onChange={(e) => setMachineId(e.target.value.toUpperCase().replace(/\s/g, ''))}
                    placeholder="เช่น MC-INJ-008"
                    className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 text-xs"
                    disabled={!!editingMachine}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold">ชื่อเครื่องจักรจริง *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="เช่น แขนหิ้วกลแกนยกแผ่นเหล็ก"
                    className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 font-sans">
                <div className="space-y-1">
                  <label className="block font-bold">กลุ่มหมวดหมู่เครื่อง</label>
                  <select
                    value={typeId}
                    onChange={(e) => setTypeId(e.target.value)}
                    className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2"
                  >
                    <option value="MT-01">เครื่องขึ้นรูปพลาสติก (INJ)</option>
                    <option value="MT-02">เตาอบ/หลอมอุตสาหกรรม (FRN)</option>
                    <option value="MT-03">เครื่องบรรจุหีบห่อ (PKG)</option>
                    <option value="MT-04">ปั๊มลมอัดอากาศ (CMP)</option>
                    <option value="MT-05">หุ่นยนต์อุตสาหกรรม (ROB)</option>
                    <option value="MT-06">เครื่องชิลเลอร์ทำความเย็น (CHL)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold">แผนกเจ้าของดูแล</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2"
                  >
                    <option value="DEP-PRO-A">Line A (แกะแบบและขึ้นรูป)</option>
                    <option value="DEP-PRO-B">Line B (แปรรูปและหลอม)</option>
                    <option value="DEP-PACK">ฝ่ายบรรจุภัณฑ์</option>
                    <option value="DEP-UTIL">ห้องเครื่อง Utility</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold">สถานที่ติดตั้งจริง</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="เช่น ตึกคัดแยก ชั้น 2"
                    className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold">วันที่เริ่มต้นเดินรันความพร้อม</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 font-sans">
                <div className="space-y-1">
                  <label className="block font-bold">ยี่ห้อ (Brand)</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Siemens / FANUC"
                    className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold">รุ่น (Model)</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="V2-Core-99"
                    className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold">ซีเรียล (Serial No.)</label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
                    placeholder="SN-998822"
                    className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold">รูปภาพเครื่องจักรอุตสาหกรรม (URL Photo Pathway)</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="ป้อนลิ้งค์ เช่น https://images.unsplash.com/..."
                  className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 font-mono text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold">สถานะขีดความพร้อมปัจจุบัน</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 font-bold"
                >
                  <option value="Operational">🟢 ทำงานปกติ (Operational)</option>
                  <option value="Repairing">🟡 อยู่ระหว่างซ่อมบำรุง (Repairing)</option>
                  <option value="Breakdown">🔴 เครื่องขัดข้องชำรุดเสีย (Breakdown)</option>
                  <option value="Decommissioned">⚪ ปลดระวางจำหน่ายออก (Decommissioned)</option>
                </select>
              </div>

              {/* Lease Status details in modal */}
              <div className="p-3 bg-blue-50/30 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30 rounded-lg space-y-2.5">
                <span className="text-blue-700 dark:text-blue-400 font-bold block text-[10px] uppercase tracking-wider">🏢 รายละเอียดการปล่อยเช่า (Leasing Option)</span>
                
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="block font-bold text-gray-600 dark:text-zinc-400">ชื่อลูกค้าปัจจุบันที่เช่า (Customer Name)</label>
                    <input
                      type="text"
                      className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-1.5 text-xs text-gray-900 dark:text-zinc-100"
                      value={currentCustomer}
                      onChange={(e) => setCurrentCustomer(e.target.value)}
                      placeholder="เช่น บจก. ทีอาร์ซี คอนสตรัคชั่น"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-gray-600 dark:text-zinc-400">ไซต์งานติดตั้งใช้งาน (Site Location)</label>
                    <input
                      type="text"
                      className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-1.5 text-xs text-gray-900 dark:text-zinc-100"
                      value={currentSite}
                      onChange={(e) => setCurrentSite(e.target.value)}
                      placeholder="เช่น ไคลเอนต์แหลมฉบัง ไลน์ 4"
                    />
                  </div>
                </div>

                {/* Archive Button helper */}
                {editingMachine && (currentCustomer || currentSite) && (
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (!currentCustomer) {
                          alert('กรุณากรอกชื่อลูกค้าปัจจุบันก่อนทำการย้ายเข้าคลังประวัติ!');
                          return;
                        }
                        const confirmArchive = window.confirm(`ย้ายลูกค้า "${currentCustomer}" เข้าประวัติสัญญาเช่าเก่า และเคลียร์ให้เครื่องจักรว่างในระบบ?`);
                        if (confirmArchive) {
                          const newHistRecord = {
                            id: `RT${String(rentalHistory.length + 1).padStart(3, '0')}`,
                            customerName: currentCustomer,
                            siteName: currentSite || 'ไม่ได้ระบุพิกัดไซต์งาน',
                            startDate: startDate,
                            endDate: new Date().toISOString().slice(0, 10)
                          };
                          setRentalHistory(prev => [newHistRecord, ...prev]);
                          setCurrentCustomer('');
                          setCurrentSite('');
                          triggerNotification('ย้ายสัญญาสู่ประวัติแล้ว', 'บันทึกประวัติการส่งคืนเครื่องจักรและถอนใบอนุญาตเดิมสำเร็จ', 'success');
                        }
                      }}
                      className="text-[10px] bg-amber-500 hover:bg-amber-600 text-white font-bold py-1 px-2 rounded cursor-pointer transition flex items-center shadow-sm"
                    >
                      📦 ย้ายสัญญานี้เข้าสู่สารบบประวัติการเช่าเก่า (Archive Current to Logs)
                    </button>
                  </div>
                )}
              </div>

              {/* History list editor */}
              <div className="space-y-1.5">
                <span className="text-gray-500 dark:text-zinc-400 font-bold block text-[10px]">📋 คลังประวัติเช่าเก่าทั้งหมด ({rentalHistory.length} สัญญา)</span>
                
                {rentalHistory.length > 0 ? (
                  <div className="border border-gray-200 dark:border-zinc-700 rounded bg-gray-50 dark:bg-zinc-900 divide-y dark:divide-zinc-800 max-h-24 overflow-y-auto">
                    {rentalHistory.map((hist, idx) => (
                      <div key={idx} className="p-1 px-2 text-[10.5px] flex justify-between items-center bg-white dark:bg-zinc-800">
                        <div className="truncate pr-2">
                          <strong className="text-zinc-700 dark:text-zinc-200">{hist.customerName}</strong>
                          <span className="text-[9.5px] text-gray-400 block truncate">📍 {hist.siteName}</span>
                        </div>
                        <div className="text-[9px] text-gray-500 text-right whitespace-nowrap">
                          <div>📅 {hist.startDate} ~ {hist.endDate || 'ไม่มีกำหนด'}</div>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('ยืนยันความประสงค์ที่จะลบท่อนประวัติสัญญานี้ออกอย่างถาวร?')) {
                                setRentalHistory(prev => prev.filter((_, i) => i !== idx));
                              }
                            }}
                            className="text-red-500 hover:underline font-bold text-[9px] cursor-pointer"
                          >
                            ลบประวัติแถวนี้
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-2 text-center bg-gray-50 dark:bg-zinc-900/30 text-gray-400 italic rounded text-[10px]">
                    ไม่มีบันทึกประวัติการเช่าในอดีต (เช่าครั้งแรก หรือ เป็นเครื่องจักรหมุนเวียนภายในโรงงาน)
                  </div>
                )}

                {/* Add dynamic manual history record */}
                <div className="p-2 border border-dashed border-gray-300 dark:border-zinc-700 rounded bg-gray-50 dark:bg-zinc-900/10 space-y-2 mt-1">
                  <div className="text-[9.5px] text-zinc-500 font-bold">➕ คีย์เพิ่มข้อมูลสัญญาย้อนหลังโดยตรง (Add Historical Log item):</div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <input
                      id="manual-hist-cust"
                      type="text"
                      placeholder="ชื่อลูกค้า..."
                      className="rounded border border-gray-300 dark:border-zinc-700 p-1 px-1.5 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                    />
                    <input
                      id="manual-hist-site"
                      type="text"
                      placeholder="ไซต์งานก่อสร้าง..."
                      className="rounded border border-gray-300 dark:border-zinc-700 p-1 px-1.5 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                    />
                    <div className="space-y-0.5">
                      <span className="text-[8px] text-gray-450 block">เริ่มเช่า:</span>
                      <input
                        id="manual-hist-start"
                        type="date"
                        defaultValue="2025-01-01"
                        className="w-full rounded border border-gray-300 dark:border-zinc-700 p-0.5 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[8px] text-gray-450 block">สิ้นสุดคืนเครื่อง:</span>
                      <input
                        id="manual-hist-end"
                        type="date"
                        defaultValue="2025-06-30"
                        className="w-full rounded border border-gray-300 dark:border-zinc-700 p-0.5 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const custInput = document.getElementById('manual-hist-cust') as HTMLInputElement;
                      const siteInput = document.getElementById('manual-hist-site') as HTMLInputElement;
                      const startInput = document.getElementById('manual-hist-start') as HTMLInputElement;
                      const endInput = document.getElementById('manual-hist-end') as HTMLInputElement;

                      if (!custInput?.value || !siteInput?.value) {
                        alert('ระบุชื่อลูกค้าและไซต์งานในฟิลด์เพิ่มสัญญาย้อนหลังให้ครบก่อนบันทึก!');
                        return;
                      }

                      const newRecord = {
                        id: `RT${String(rentalHistory.length + 1).padStart(3, '0')}`,
                        customerName: custInput.value,
                        siteName: siteInput.value,
                        startDate: startInput.value,
                        endDate: endInput.value || 'ไม่ระบุ'
                      };

                      setRentalHistory(prev => [newRecord, ...prev]);
                      custInput.value = '';
                      siteInput.value = '';
                      triggerNotification('เพิ่มประวัติสำเร็จ', 'เพิ่มรายการประวัติลงใบบันทึกเรียบร้อย', 'success');
                    }}
                    className="w-full bg-zinc-700 dark:bg-zinc-600 hover:bg-zinc-650 text-white p-1 text-[10px] rounded font-bold cursor-pointer transition"
                  >
                    บันทึกประวัติอดีตส่วนนี้เข้าสู่สารบรรณ
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-zinc-700 flex justify-end gap-2.5 font-sans">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-650 rounded font-bold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-bold shadow-sm cursor-pointer"
                >
                  ยืนยันบันทึกเครื่อง
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detailed Specs Drawer panel */}
      {viewDetailMachine && (
        <div className="fixed inset-0 bg-black/65 flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden border border-gray-100 dark:border-zinc-700 flex flex-col justify-between">
            <div className="h-48 relative bg-gray-150 flex-shrink-0">
              <img
                src={viewDetailMachine.imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500'}
                alt={viewDetailMachine.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                    ASSET LOGS
                  </span>
                  <button
                    onClick={() => setViewDetailMachine(null)}
                    className="text-white hover:text-red-500 font-bold text-xl drop-shadow-sm cursor-pointer"
                  >
                    ×
                  </button>
                </div>

                <div>
                  <span className="font-mono text-xs text-blue-400 font-bold block">{viewDetailMachine.id}</span>
                  <h3 className="text-white font-bold text-base leading-tight font-sans text-shadow">
                    {viewDetailMachine.name}
                  </h3>
                </div>
              </div>
            </div>

            <div className="p-5 text-xs text-gray-700 dark:text-zinc-300 space-y-4 flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-md border border-gray-100 dark:border-zinc-700/60 font-sans">
                <div>
                  <span className="text-gray-400 block pb-0.5">แผนกฝ่ายเดินงาน:</span>
                  <strong className="text-gray-900 dark:text-zinc-100">{viewDetailMachine.departmentId === 'DEP-PRO-A' ? 'Line A' : 'Line B'}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block pb-0.5">สถานที่ติดตั้ง:</span>
                  <strong className="text-gray-900 dark:text-zinc-100">{viewDetailMachine.location}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block pb-0.5" title="Start Operating Date">เริ่มวันแรก:</span>
                  <strong className="text-gray-900 dark:text-zinc-100">{viewDetailMachine.startDate}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block pb-0.5">สถานะใบพิกัด:</span>
                  <span className={`inline-block px-1.5 py-0.5 text-[10px] rounded font-bold ${
                    viewDetailMachine.status === 'Operational' ? 'bg-green-150 text-green-800' :
                    viewDetailMachine.status === 'Repairing' ? 'bg-yellow-150 text-yellow-800' :
                    'bg-red-150 text-red-800'
                  }`}>
                    {viewDetailMachine.status}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 font-mono">
                <span className="text-gray-400 block font-sans">ขีดจำกัดแบรนด์เกียร์ และใบรับรอง (Manufacturer Spec):</span>
                <p className="p-3 bg-gray-50 dark:bg-zinc-800 rounded border text-[11px] grid grid-cols-3 gap-2">
                  <span>ยี่ห้อ: <strong className="text-zinc-800 dark:text-zinc-100">{viewDetailMachine.brand}</strong></span>
                  <span>รุ่น: <strong className="text-zinc-800 dark:text-zinc-100">{viewDetailMachine.model}</strong></span>
                  <span>S/N: <strong className="text-zinc-800 dark:text-zinc-100">{viewDetailMachine.serialNumber}</strong></span>
                </p>
              </div>

              {/* Rental History Tracking Section */}
              <div className="space-y-2 border-t pt-3 border-gray-150 dark:border-zinc-700">
                <span className="text-gray-800 dark:text-zinc-200 font-bold block font-sans text-xs">
                  📊 ข้อมูลสัญญาและการเช่าเครื่องจักร (Active Lease & Customer History)
                </span>
                
                {/* Current lease */}
                <div className="p-3 rounded-lg bg-blue-50/75 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-blue-700 dark:text-blue-300 font-bold text-[10px] bg-blue-100 dark:bg-blue-950/65 px-1.5 py-0.5 rounded">
                      ผู้เช่าปัจจุบัน (Active Lease)
                    </span>
                    <span className="text-gray-500 text-[10px]">⏱️ {viewDetailMachine.startDate} ~ ปัจจุบัน</span>
                  </div>
                  {viewDetailMachine.currentCustomer ? (
                    <div className="space-y-1">
                      <div className="font-bold text-gray-900 dark:text-white text-xs">{viewDetailMachine.currentCustomer}</div>
                      <div className="text-gray-600 dark:text-zinc-300 text-[11px]">📍 พิกัดไซต์งานติดตั้ง: {viewDetailMachine.currentSite || 'ไม่ได้ระบุ'}</div>
                    </div>
                  ) : (
                    <span className="text-gray-400 dark:text-zinc-500 italic block text-[11px]">📦 ไม่ถูกปล่อยเช่า (ใช้เพื่อการผลิตในแผนกโรงงาน / ว่างในคลัง)</span>
                  )}
                </div>

                {/* Past rental history */}
                <div className="space-y-1.5">
                  <span className="text-gray-450 dark:text-zinc-400 font-semibold block text-[10.5px]">
                    คลังประวัติผู้เช่าก่อนหน้านี้ ({viewDetailMachine.rentalHistory?.length || 0} รายการ)
                  </span>
                  
                  {viewDetailMachine.rentalHistory && viewDetailMachine.rentalHistory.length > 0 ? (
                    <div className="max-h-36 overflow-y-auto space-y-2 pr-1 divide-y divide-gray-150 dark:divide-zinc-700/60">
                      {viewDetailMachine.rentalHistory.map((hist, idx) => (
                        <div key={hist.id || idx} className="pt-2 text-[11px] first:pt-0">
                          <div className="flex justify-between text-gray-400 text-[9.5px]">
                            <span className="font-bold text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-700 px-1 rounded">
                              {hist.id || `RT-${String(idx + 1).padStart(2, '0')}`}
                            </span>
                            <span>⏱️ {hist.startDate} ถึง {hist.endDate || 'ไม่มีกำหนด'}</span>
                          </div>
                          <div className="font-semibold text-gray-800 dark:text-zinc-200 mt-0.5">{hist.customerName}</div>
                          <div className="text-gray-500 dark:text-zinc-400 text-[10.5px]">📍 แหล่งไซต์งาน: {hist.siteName}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-center bg-gray-50 dark:bg-zinc-900/30 text-gray-400 dark:text-zinc-500 italic rounded text-[10px]">
                      ไม่มีบันทึกประวัติการเช่าเก่าในอดีตสำหรับเครื่องจักรนี้
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-2 flex justify-between gap-2 text-[10px] text-zinc-400">
                <span>อัปเดตสถานะ: เรียลไทม์จำลอง</span>
                <span>มาตรฐานระบบอุตสาหกรรมเครื่องจักรเช่า MMS ERP</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50/50 dark:bg-zinc-800/40 border-t border-gray-100 dark:border-zinc-700/60 p-4 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setViewDetailMachine(null)}
                className="px-5 py-2 bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 rounded text-xs font-bold font-sans cursor-pointer"
              >
                เสร็จสิ้น/ปิดดู
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
