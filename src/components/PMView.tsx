/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PreventiveMaintenance, MaintenanceSchedule, Machine, UserRole } from '../types';
import { Calendar, Search, ShieldAlert, Plus, CheckCircle2, ClipboardList, Clock, ArrowRight } from 'lucide-react';

interface PMViewProps {
  pmPlans: PreventiveMaintenance[];
  setPmPlans: React.Dispatch<React.SetStateAction<PreventiveMaintenance[]>>;
  schedules: MaintenanceSchedule[];
  setSchedules: React.Dispatch<React.SetStateAction<MaintenanceSchedule[]>>;
  machines: Machine[];
  currentUserRole: UserRole;
  addAuditLog: (action: string, details: string) => void;
  triggerNotification: (title: string, message: string, type: 'info' | 'warning' | 'danger' | 'success') => void;
  triggerLineAlert?: (eventType: 'breakdown' | 'work_order_assign' | 'work_order_complete' | 'pm_done' | 'general', data: any) => void;
}

export default function PMView({
  pmPlans,
  setPmPlans,
  schedules,
  setSchedules,
  machines,
  currentUserRole,
  addAuditLog,
  triggerNotification,
  triggerLineAlert
}: PMViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'plans' | 'calendar'>('plans');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState<PreventiveMaintenance | null>(null);

  // Form states
  const [selectedMachineId, setSelectedMachineId] = useState('');
  const [planName, setPlanName] = useState('');
  const [frequency, setFrequency] = useState<'Every Day' | 'Every Week' | 'Every Month' | 'Every Quarter' | 'Every Year'>('Every Month');
  const [assignedTeam, setAssignedTeam] = useState('ทีมวิศวกรรม/เครื่องกล');
  const [rawChecklist, setRawChecklist] = useState("• ตรวจสอบสภาพยางรอง\n• วัดระดับกระแสไฟฟ้า\n• ทาจาระบีวาล์วหลัก\n• ตรวจคราบสเกลเลอร์ระเบิด");

  // Filter for search
  const filteredPlans = pmPlans.filter(p => {
    const m = machines.find(mac => mac.id === p.machineId);
    const mName = m ? m.name : '';
    return p.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           mName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           p.assignedTeam.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Calculate day difference for notification highlights
  const getDaysDiff = (targetDateStr: string) => {
    const today = new Date('2026-06-10'); // Fix relative to user datetime environment
    const target = new Date(targetDateStr);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getUrgencyBadge = (dateStr: string) => {
    const diff = getDaysDiff(dateStr);
    if (diff < 0) {
      return (
        <span className="bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 text-[10px] px-2 py-0.5 rounded font-bold">
          เลยขีดจำกัด ({Math.abs(diff)} วัน)
        </span>
      );
    }
    if (diff <= 7) {
      return (
        <span className="bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300 text-[10px] px-2 py-0.5 rounded font-bold animate-pulse">
          วิกฤต (อีก {diff} วัน)
        </span>
      );
    }
    if (diff <= 15) {
      return (
        <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300 text-[10px] px-2 py-0.5 rounded font-bold">
          อีก 15 วัน ({diff} วัน)
        </span>
      );
    }
    if (diff <= 30) {
      return (
        <span className="bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 text-[10px] px-2 py-0.5 rounded font-bold">
          อีก 30 วัน ({diff} วัน)
        </span>
      );
    }
    return (
      <span className="bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-zinc-300 text-[10px] px-2 py-0.5 rounded">
        ปกติ ({diff} วัน)
      </span>
    );
  };

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMachineId || !planName) return;

    if (currentUserRole !== 'Admin' && currentUserRole !== 'Supervisor') {
      alert('เฉพาะบทบาท Admin และ Supervisor เท่านั้นที่สามารถจัดสรรแผน PM บัตรรถจักรได้!');
      return;
    }

    const nextId = `PM-${String(pmPlans.length + 1).padStart(3, '0')}`;
    const cleanChecklist = rawChecklist.split('\n').map(l => l.replace(/^[•\s\-\*]+/g, '').trim()).filter(Boolean);

    // Calc frequency days
    let freqDays = 30;
    if (frequency === 'Every Day') freqDays = 1;
    else if (frequency === 'Every Week') freqDays = 7;
    else if (frequency === 'Every Month') freqDays = 30;
    else if (frequency === 'Every Quarter') freqDays = 90;
    else if (frequency === 'Every Year') freqDays = 365;

    // Calculate due date (from today 2026-06-10)
    const dueDateObj = new Date('2026-06-10');
    dueDateObj.setDate(dueDateObj.getDate() + freqDays);
    const nextDueDate = dueDateObj.toISOString().split('T')[0];

    const newPlan: PreventiveMaintenance = {
      id: nextId,
      machineId: selectedMachineId,
      planName,
      frequency,
      frequencyDays: freqDays,
      lastDoneDate: '2026-06-10',
      nextDueDate,
      assignedTeam,
      checklist: cleanChecklist
    };

    setPmPlans(prev => [...prev, newPlan]);

    // Create a pending schedule
    const newSchedule: MaintenanceSchedule = {
      id: `SCH-${String(schedules.length + 1).padStart(3, '0')}`,
      pmId: nextId,
      scheduledDate: nextDueDate,
      status: 'Pending'
    };
    setSchedules(prev => [newSchedule, ...prev]);

    addAuditLog('Create PM Plan', `Created PM Plan ${nextId} for machine ${selectedMachineId}. Next due: ${nextDueDate}`);
    triggerNotification('บันทึกแผน PM สำเร็จ', `จัดสรรแผนบำรุงรักษาเชิงป้องกัน ${planName} สำเร็จ`, 'success');
    setShowPlanModal(false);

    // Reset Form
    setSelectedMachineId('');
    setPlanName('');
    setFrequency('Every Month');
    setRawChecklist("• ตรวจสอบสภาพยางรอง\n• วัดระดับกระแสไฟฟ้า\n• ทาจาระบีวาล์วหลัก\n• ตรวจคราบสเกลเลอร์ระเบิด");
  };

  const markScheduleComplete = (schedId: string, notes: string) => {
    setSchedules(prev => prev.map(s => {
      if (s.id === schedId) {
        return {
          ...s,
          status: 'Completed',
          doneDate: '2026-06-10',
          doneBy: 'สมชาย รักดี',
          notes: notes || 'ผ่านเกณฑ์ตรวจสอบปกติเรียบร้อย'
        };
      }
      return s;
    }));

    // Find schedule and update associated plan's LastDone & NextDue
    const targetSched = schedules.find(s => s.id === schedId);
    if (targetSched) {
      const pmPlan = pmPlans.find(p => p.id === targetSched.pmId);
      const machine = pmPlan ? machines.find(m => m.id === pmPlan.machineId) : undefined;

      // Trigger LINE Notification for PM completion
      if (triggerLineAlert) {
        triggerLineAlert('pm_done', {
          title: `บำรุงรักษาเชิงป้องกันสำเร็จ [${schedId}]`,
          orderNo: schedId,
          machineName: machine ? machine.name : (pmPlan ? pmPlan.machineId : 'เครื่องจักร'),
          machineCode: machine ? machine.id : undefined,
          location: machine ? machine.location : undefined,
          actionTaken: pmPlan ? pmPlan.planName : 'บำรุงรักษาเครื่องจักรตามแผน',
          technician: 'สมชาย รักดี',
          notes: notes || 'ผ่านเกณฑ์ตรวจสอบปกติเรียบร้อย',
          dateTime: '2026-06-10 16:30'
        });
      }

      setPmPlans(prev => prev.map(p => {
        if (p.id === targetSched.pmId) {
          const nextVal = new Date('2026-06-10');
          nextVal.setDate(nextVal.getDate() + p.frequencyDays);
          return {
            ...p,
            lastDoneDate: '2026-06-10',
            nextDueDate: nextVal.toISOString().split('T')[0]
          };
        }
        return p;
      }));
    }

    addAuditLog('Complete PM Work', `Marked PM Schedule ${schedId} as Completed.`);
    triggerNotification('ลงผล PM สำเร็จ', `ลงประวัติบำรุงรักษาเชิงป้องกันสำเร็จเสร็จสิ้น`, 'success');
  };

  return (
    <div className="space-y-6" id="pm-view-panel">
      {/* Menu Navigation Bar & Search */}
      <div className="flex flex-wrap justify-between items-center bg-white dark:bg-zinc-800 p-4 rounded-md shadow-sm border border-gray-100 dark:border-zinc-700 gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-blue-500" />
          <h3 className="text-base font-bold text-gray-800 dark:text-zinc-100 font-sans">
            ระบบบำรุงรักษาเชิงป้องกัน (Preventive Maintenance)
          </h3>
          
          <div className="bg-gray-100 dark:bg-zinc-700 p-0.5 rounded flex text-xs">
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-3.5 py-1 rounded transition-all ${
                activeTab === 'plans' ? 'bg-blue-500 text-white font-bold' : 'text-gray-600 dark:text-zinc-300'
              }`}
            >
              แผน PM เชิงรุก
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-3.5 py-1 rounded transition-all ${
                activeTab === 'calendar' ? 'bg-blue-500 text-white font-bold' : 'text-gray-600 dark:text-zinc-300'
              }`}
            >
              ตารางงานตรวจบำรุง (Calendar)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <input
              type="text"
              placeholder="ค้นหาแผน ซ่อมบำรุง เครื่องจักร..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs rounded border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 p-2 pl-8 text-gray-900 dark:text-zinc-100"
            />
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-3 text-gray-400" />
          </div>

          {(currentUserRole === 'Admin' || currentUserRole === 'Supervisor') && (
            <button
              onClick={() => setShowPlanModal(true)}
              className="px-3.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>สร้างแผน PM ใหม่</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'plans' ? (
        /* Plans tab grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map(plan => {
            const m = machines.find(mac => mac.id === plan.machineId);
            return (
              <div
                key={plan.id}
                className="card shadow-md bg-white dark:bg-zinc-800 rounded-md border border-gray-100 dark:border-zinc-700 flex flex-col justify-between overflow-hidden"
              >
                <div className="p-4 border-b border-gray-100 dark:border-zinc-700/60 bg-gray-50 dark:bg-zinc-800/40 flex justify-between items-start gap-2">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300 px-2 py-0.5 rounded">
                      {plan.id}
                    </span>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 mt-1 text-sm leading-tight font-sans">
                      {plan.planName}
                    </h4>
                  </div>
                  <span className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded font-bold font-sans">
                    {plan.frequency === 'Every Day' ? 'ทุกวัน' :
                     plan.frequency === 'Every Week' ? 'ทุกสัปดาห์' :
                     plan.frequency === 'Every Month' ? 'ทุกเดือน' :
                     plan.frequency === 'Every Quarter' ? 'ทุกไตรมาส' : 'ทุกปี'}
                  </span>
                </div>

                <div className="p-4 space-y-3 flex-1 text-xs text-gray-600 dark:text-zinc-300">
                  <div className="space-y-1">
                    <span className="text-gray-400 block">เครื่องจักร:</span>
                    <span className="font-bold text-gray-800 dark:text-zinc-200 block">
                      {m ? `${m.name} (${m.id})` : 'ไม่ทราบเครื่องจักร'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-t pt-2 border-gray-100 dark:border-zinc-700/60">
                    <div>
                      <span className="text-gray-400 block">บำรุงรักษาล่าสุด:</span>
                      <span className="font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        {plan.lastDoneDate}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 block">รอบบำรุงถัดไป:</span>
                      <span className="font-bold text-gray-800 dark:text-zinc-200 block mt-0.5">
                        {plan.nextDueDate}
                      </span>
                      <div className="mt-1">{getUrgencyBadge(plan.nextDueDate)}</div>
                    </div>
                  </div>

                  <div className="border-t pt-2 border-gray-100 dark:border-zinc-700/60">
                    <span className="text-gray-400 block">ทีมช่างรับผิดชอบ:</span>
                    <span className="font-semibold text-gray-800 dark:text-zinc-200">{plan.assignedTeam}</span>
                  </div>
                </div>

                <div className="p-3 bg-gray-50/50 dark:bg-zinc-800/30 border-t border-gray-100 dark:border-zinc-700/60 flex justify-between gap-2.5">
                  <button
                    onClick={() => setShowChecklistModal(plan)}
                    className="p-1.5 px-3 text-xs text-blue-500 hover:bg-blue-50 dark:hover:bg-zinc-700/40 rounded border border-blue-200 dark:border-zinc-700 flex items-center gap-1 cursor-pointer"
                  >
                    <ClipboardList className="h-3.5 w-3.5" />
                    <span>รายการเช็คลิสต์ ({plan.checklist.length})</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('calendar');
                      setSearchTerm(plan.id);
                    }}
                    className="p-1.5 text-xs text-gray-500 hover:text-black dark:text-zinc-400 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <span>ดูตารางงาน</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Calendar Schedule Tab list */
        <div className="card shadow-md bg-white dark:bg-zinc-800 rounded-md border border-gray-100 dark:border-zinc-700 overflow-hidden">
          <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-700 flex flex-wrap gap-3 items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-zinc-400 font-sans">ปฏิทินแผนดำเนินงานซ่อมบำรุงล่วงหน้า</span>
            <div className="text-xs text-gray-400 flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-yellow-400 inline-block"></span> รอช่างดำเนินการ</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-green-500 inline-block"></span> บำรุงเสร็จสิ้น</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700 font-sans">
              <thead className="bg-gray-50 dark:bg-zinc-800/25">
                <tr>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">รหัสแผน</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">ขีดจำกัด PM</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">ยี่ห้อ & เครื่องจักร</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">วันที่นัดหมาย</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">สถานะ</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">ผู้ทำ / บันทึกเพิ่มเติม</th>
                  {(currentUserRole === 'Admin' || currentUserRole === 'Technician' || currentUserRole === 'Supervisor') && <th className="px-5 py-3 text-right text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">ปุ่มกระทำ</th>}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-800 divide-y divide-gray-100 dark:divide-zinc-700/60 text-xs text-gray-700 dark:text-zinc-300">
                {schedules
                  .filter(s => s.pmId.toLowerCase().includes(searchTerm.toLowerCase()) || s.scheduledDate.includes(searchTerm))
                  .map(sched => {
                    const planObj = pmPlans.find(p => p.id === sched.pmId);
                    const machineObj = planObj ? machines.find(m => m.id === planObj.machineId) : null;
                    return (
                      <tr key={sched.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/20">
                        <td className="px-5 py-3.5 whitespace-nowrap font-mono font-bold text-blue-500 bg-blue-50/20">{sched.pmId}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap font-semibold">{planObj?.planName}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {machineObj ? (
                            <span className="font-semibold block">{machineObj.name} <span className="text-gray-400 font-mono">({machineObj.brand} / {machineObj.id})</span></span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap font-mono font-bold text-gray-900 dark:text-gray-100">{sched.scheduledDate}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {sched.status === 'Completed' ? (
                            <span className="bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300 text-[10px] px-2.5 py-0.5 rounded font-bold">
                              สำเร็จเสร็จสิ้น
                            </span>
                          ) : (
                            <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300 text-[10px] px-2.5 py-0.5 rounded font-bold animate-pulse">
                              รอดำเนินงาน
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          {sched.status === 'Completed' ? (
                            <div>
                              <span className="font-bold text-gray-800 dark:text-zinc-200">ช่าง: {sched.doneBy}</span>
                              <span className="text-gray-400 block text-[10px]">บันทึก: {sched.notes}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">ยังไม่มีการบันทึก</span>
                          )}
                        </td>
                        {(currentUserRole === 'Admin' || currentUserRole === 'Technician' || currentUserRole === 'Supervisor') && (
                          <td className="px-5 py-3 whitespace-nowrap text-right">
                            {sched.status === 'Pending' ? (
                              <button
                                onClick={() => {
                                  const text = prompt('กรอกผลการตรวจสอบ และการซ่อมชุบงาน PM ถัดไป:', 'การตรวจระดับน้ำมันและเกียร์ปกติ ข้อโซ่ทาจาระบีเรียบร้อยดี');
                                  if (text !== null) markScheduleComplete(sched.id, text);
                                }}
                                className="px-2.5 py-1 text-[11px] bg-green-500 hover:bg-green-600 text-white rounded font-bold transition shadow-xs cursor-pointer"
                              >
                                บันทึกผล PM
                              </button>
                            ) : (
                              <span className="text-green-500 font-bold font-sans">✔️ ลงประวัติแล้ว</span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Plan Add Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/65 flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-md w-full border-t-4 border-blue-500 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-zinc-700 flex justify-between items-center bg-gray-50 dark:bg-zinc-800/50">
              <h4 className="font-bold text-gray-800 dark:text-zinc-100 text-sm">สร้างโครงการแผน PM ชิงรุกในโรงผลิต</h4>
              <button onClick={() => setShowPlanModal(false)} className="text-gray-400 hover:text-black dark:hover:text-white font-bold text-lg cursor-pointer">×</button>
            </div>

            <form onSubmit={handleCreatePlan} className="p-5 space-y-4 text-xs text-gray-700 dark:text-zinc-300">
              <div className="space-y-1">
                <label className="block font-bold">เลือกเครื่องจักรกล</label>
                <select
                  required
                  value={selectedMachineId}
                  onChange={(e) => setSelectedMachineId(e.target.value)}
                  className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5"
                >
                  <option value="">-- เลือกเครื่องจักร --</option>
                  {machines.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.id})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold">ชื่อแผนงานการบำรุงรักษาเชิงป้องกัน (Plan Name)</label>
                <input
                  type="text"
                  required
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="เช่น อัดฉีดปะเก็นวาล์วรอบดันคิวเบิล"
                  className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold">ความถี่ในการตรวจบำรุง</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 font-bold"
                  >
                    <option value="Every Day">ทุกวัน</option>
                    <option value="Every Week">ทุกสัปดาห์</option>
                    <option value="Every Month">ทุกเดือน (แนะนำ)</option>
                    <option value="Every Quarter">ทุกไตรมาส</option>
                    <option value="Every Year">ทุกปี</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold">ฝ่ายหรือทีมที่ดูแล</label>
                  <input
                    type="text"
                    required
                    value={assignedTeam}
                    onChange={(e) => setAssignedTeam(e.target.value)}
                    placeholder="เช่น ทีมช่างระบบความเย็น"
                    className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold">ตรวจสอบทีละรายการ (Checklist แยกด้วยเว้นบรรทัด)</label>
                <textarea
                  required
                  rows={4}
                  value={rawChecklist}
                  onChange={(e) => setRawChecklist(e.target.value)}
                  className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 font-mono text-[11px]"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-zinc-700 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 rounded font-bold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-bold shadow-sm cursor-pointer"
                >
                  อนุมัติแผนรุก PM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Checklist View Drawer / Modal */}
      {showChecklistModal && (
        <div className="fixed inset-0 bg-black/65 flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-sm w-full border-t-4 border-emerald-500 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-zinc-700 flex justify-between items-center bg-gray-50 dark:bg-zinc-800/50">
              <h4 className="font-bold text-gray-800 dark:text-zinc-100 text-sm flex items-center gap-1.5">
                <ClipboardList className="h-4 w-4 text-emerald-500" />
                เช็คลิสต์: {showChecklistModal.id}
              </h4>
              <button onClick={() => setShowChecklistModal(null)} className="text-gray-400 hover:text-black dark:hover:text-white font-bold text-lg cursor-pointer">×</button>
            </div>

            <div className="p-5 text-xs text-gray-700 dark:text-zinc-300 space-y-3.5">
              <span className="font-bold text-gray-400 block uppercase tracking-wider">รายการกิจกรรมตรวจสอบบังคับ:</span>
              <ul className="space-y-2.5 font-sans text-xs bg-gray-50 dark:bg-zinc-900/40 p-4 rounded-md border">
                {showChecklistModal.checklist.map((item, id) => (
                  <li key={id} className="flex items-start gap-2.5">
                    <span className="h-4 w-4 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center font-bold text-[9px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {id + 1}
                    </span>
                    <span className="flex-1 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setShowChecklistModal(null)}
                className="w-full py-2 bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 rounded font-bold transition text-center cursor-pointer"
              >
                เสร็จและปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
