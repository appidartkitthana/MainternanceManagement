/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { WorkOrder, RepairRequest, Machine, Department, User } from '../types';
import { FileText, Download, Filter, BarChart3, TrendingUp, DollarSign, Clock, Settings, RefreshCcw } from 'lucide-react';

interface ReportsViewProps {
  workOrders: WorkOrder[];
  repairRequests: RepairRequest[];
  machines: Machine[];
  departments: Department[];
  users: User[];
}

export default function ReportsView({
  workOrders,
  repairRequests,
  machines,
  departments,
  users
}: ReportsViewProps) {
  // Filter States
  const [startDate, setStartDate] = useState('2026-05-01');
  const [endDate, setEndDate] = useState('2026-06-30');
  const [selectedMachineId, setSelectedMachineId] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedTechId, setSelectedTechId] = useState('');
  const [selectedResult, setSelectedResult] = useState('');

  // 1. Filtered data calculation
  const reportData = useMemo(() => {
    return workOrders.filter(wo => {
      const req = repairRequests.find(r => r.id === wo.requestId);
      if (!req) return false;

      // Dates matching
      const woDate = new Date(wo.startDate);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && woDate < start) return false;
      if (end && woDate > end) return false;

      // Machine matching
      if (selectedMachineId && req.machineId !== selectedMachineId) return false;

      // Dept matching
      if (selectedDeptId && req.departmentId !== selectedDeptId) return false;

      // Tech matching
      if (selectedTechId && wo.responsibleTechId !== selectedTechId) return false;

      // Result matching
      if (selectedResult && wo.repairResult !== selectedResult) return false;

      return true;
    });
  }, [workOrders, repairRequests, startDate, endDate, selectedMachineId, selectedDeptId, selectedTechId, selectedResult]);

  // 2. MTTR & MTBF & Cost Calculations
  const analytics = useMemo(() => {
    let totalDowntime = 0;
    let totalRepairTime = 0;
    let totalSparesCost = 0;
    let totalOtherCost = 0;
    let breakdownCount = reportData.length;

    reportData.forEach(wo => {
      // Repair time (man hours)
      totalRepairTime += wo.manHours || 0;
      
      // Downtime calculation (estimate days/hours based on request date to end date)
      const req = repairRequests.find(r => r.id === wo.requestId);
      if (req) {
        const reqDt = new Date(`${req.requestDate}T${req.requestTime}`);
        const endDt = wo.endDate ? new Date(`${wo.endDate}T${wo.endTime || '17:00'}`) : new Date('2026-06-10T12:00:00');
        const diffMs = endDt.getTime() - reqDt.getTime();
        const diffHours = Math.max(1, diffMs / (1000 * 60 * 60));
        totalDowntime += diffHours;
      }

      totalSparesCost += wo.totalSpareCost || 0;
      totalOtherCost += wo.otherCost || 0;
    });

    const totalCost = totalSparesCost + totalOtherCost;

    // MTTR: Mean Time To Repair = (Total Repair Hours) / (Number of repairs)
    const mttrValue = breakdownCount > 0 ? (totalRepairTime / breakdownCount) : 0;

    // MTBF: Mean Time Between Failure = (Total run hours - Total downtime) / (Number of breakdowns)
    // Assume 30 production days, 24 hours per day = 720 run hours per machine, total 10 machines = 7200 total possible operational hours
    const totalPossibleHours = 10 * 30 * 24; 
    const mtbfValue = breakdownCount > 0 ? Math.max(24, (totalPossibleHours - totalDowntime) / breakdownCount) : 720;

    return {
      breakdownCount,
      totalDowntime: Math.round(totalDowntime * 10) / 10,
      totalRepairTime: Math.round(totalRepairTime * 10) / 10,
      totalSparesCost,
      totalOtherCost,
      totalCost,
      mttrValue: Math.round(mttrValue * 100) / 100,
      mtbfValue: Math.round(mtbfValue * 10) / 10
    };
  }, [reportData, repairRequests]);

  // CSV Exporter
  const handleExportCSV = () => {
    if (reportData.length === 0) {
      alert('ไม่มีข้อมูลงานซ่อมในพิกัดตัวกรองนี้เพื่อบันทึกส่งออก!');
      return;
    }

    // Build columns
    let csvContent = '\uFEFF'; // Excel encoding fix
    csvContent += 'เลขที่งานซ่อม,ใบสั่งงานอ้างอิง,วันที่เริ่ม,วันที่เสร็จ,ผู้ซ่อมหลัก,อาการวินิจฉัย,สาเหตุความเสียหาย,ผลลัพธ์ซ่อม,ชั่วโมงทำงาน,ค่าอะไหล่,ค่าใช้จ่ายอื่น\n';

    reportData.forEach(wo => {
      csvContent += `"${wo.id}","${wo.requestId}","${wo.startDate}","${wo.endDate || '-'}","${wo.responsibleTechId}","${wo.symptomDiagnosed.replace(/"/g, '""')}","${wo.causeAnalysis.replace(/"/g, '""')}","${wo.repairResult}","${wo.manHours}","${wo.totalSpareCost}","${wo.otherCost}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `MMS_Repair_Report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Simple print view dispatch
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="reports-view-panel">
      {/* Filters Card */}
      <div className="card shadow-md bg-white dark:bg-zinc-800 rounded-md border border-gray-100 dark:border-zinc-700">
        <div className="p-4 border-b border-gray-100 dark:border-zinc-700/60 bg-gray-50 dark:bg-zinc-800/40 flex justify-between items-center">
          <h4 className="font-bold flex items-center gap-2 text-gray-800 dark:text-zinc-100 font-sans">
            <Filter className="h-5 w-5 text-blue-500" />
            ตัวกรองรายงานและสถิติระดับวิสาหกิจ (Enterprise Filter Console)
          </h4>
          <button 
            onClick={() => {
              setStartDate('2026-05-01');
              setEndDate('2026-06-30');
              setSelectedMachineId('');
              setSelectedDeptId('');
              setSelectedTechId('');
              setSelectedResult('');
            }}
            className="text-xs text-gray-500 hover:text-black dark:text-zinc-400 dark:hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <RefreshCcw className="h-3.5 w-3.5" /> รีเซ็ตตัวกรอง
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-xs font-sans">
          <div className="space-y-1">
            <label className="block font-bold text-gray-700 dark:text-zinc-300">วันที่เริ่มต้น</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 p-2 text-gray-900 dark:text-zinc-100"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-gray-700 dark:text-zinc-300">วันที่สิ้นสุด</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 p-2 text-gray-900 dark:text-zinc-100"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-gray-700 dark:text-zinc-300">เครื่องจักร (Machine)</label>
            <select
              value={selectedMachineId}
              onChange={(e) => setSelectedMachineId(e.target.value)}
              className="w-full rounded border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 p-2 text-gray-900 dark:text-zinc-100"
            >
              <option value="">-- ทั้งหมด --</option>
              {machines.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.id})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-gray-700 dark:text-zinc-300">แผนกผลิตต้นรัง</label>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="w-full rounded border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 p-2 text-gray-900 dark:text-zinc-100"
            >
              <option value="">-- ทั้งหมด --</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-gray-700 dark:text-zinc-300">ผู้รับผิดชอบหลัก</label>
            <select
              value={selectedTechId}
              onChange={(e) => setSelectedTechId(e.target.value)}
              className="w-full rounded border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 p-2 text-gray-900 dark:text-zinc-100"
            >
              <option value="">-- ทั้งหมด --</option>
              {users.filter(u => u.role === 'Technician').map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-gray-700 dark:text-zinc-300">ผลงานซ่อมบำรุง</label>
            <select
              value={selectedResult}
              onChange={(e) => setSelectedResult(e.target.value)}
              className="w-full rounded border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 p-2 text-gray-900 dark:text-zinc-100"
            >
              <option value="">-- ทั้งหมด --</option>
              <option value="กลับมาใช้งานได้ปกติ">กลับมาใช้งานได้ปกติ</option>
              <option value="ใช้งานได้ชั่วคราว">ใช้งานได้ชั่วคราว</option>
              <option value="ต้องรอสั่งอะไหล่">ต้องรอสั่งอะไหล่</option>
              <option value="ซ่อมไม่ได้/ส่งเคลม">ซ่อมไม่ได้/ส่งเคลม</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Stats Block */}
      <h3 className="font-bold text-sm text-gray-800 dark:text-zinc-200 mt-2 font-sans flex items-center gap-1.5 leading-none">
        <BarChart3 className="h-4.5 w-4.5 text-blue-500" /> สถิติตัวชี้วัด (KPIs Metrics Scorecard) และ รายงานหยุดเครื่อง (Downtime Case)
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white dark:bg-zinc-800 p-4 rounded-md shadow-sm border border-gray-100 dark:border-zinc-700 flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-gray-400 block font-sans">จำนวนครั้ง Breakdown</span>
            <span className="text-2xl font-bold font-mono tracking-tight text-gray-950 dark:text-white block">
              {analytics.breakdownCount} <span className="text-xs font-normal text-gray-500 font-sans">ครั้ง</span>
            </span>
            <span className="text-[10px] text-gray-400 block">• สกัดสถิติรอบ 30 วัน</span>
          </div>
          <div className="p-3 bg-red-55 text-red-500 bg-red-50 dark:bg-red-950/20 rounded-md">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white dark:bg-zinc-800 p-4 rounded-md shadow-sm border border-gray-100 dark:border-zinc-700 flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-gray-400 block font-sans">เวลาหยุดเครื่องรวม (Downtime)</span>
            <span className="text-2xl font-bold font-mono tracking-tight text-gray-950 dark:text-white block">
              {analytics.totalDowntime} <span className="text-xs font-normal text-gray-500 font-sans">ชั่วโมง</span>
            </span>
            <span className="text-[10px] text-gray-400 block">• ระยะรับเรื่องถึงซ่อมแล้ว</span>
          </div>
          <div className="p-3 bg-yellow-50 text-yellow-600 dark:bg-yellow-950/20 rounded-md">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white dark:bg-zinc-800 p-4 rounded-md shadow-sm border border-gray-100 dark:border-zinc-700 flex items-center justify-between">
          <div className="space-y-1.5 font-sans">
            <span className="text-[11px] font-bold text-gray-400 block">ดัชนี MTTR (Mean Time To Repair)</span>
            <span className="text-2xl font-bold font-mono tracking-tight text-gray-950 dark:text-white block">
              {analytics.mttrValue} <span className="text-xs font-normal text-gray-500">ชั่วโมง/ครั้ง</span>
            </span>
            <span className="text-[10.5px] text-zinc-500 block">
              <span className="font-bold text-blue-500">สูตร:</span> ชั่วทำงาน / ครั้งเสีย
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-500 dark:bg-blue-950/20 rounded-md">
            <Settings className="h-6 w-6" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white dark:bg-zinc-800 p-4 rounded-md shadow-sm border border-gray-100 dark:border-zinc-700 flex items-center justify-between">
          <div className="space-y-1.5 font-sans">
            <span className="text-[11px] font-bold text-gray-400 block">ดัชนี MTBF (Mean Time Between Failure)</span>
            <span className="text-2xl font-bold font-mono tracking-tight text-gray-950 dark:text-white block">
              {analytics.mtbfValue} <span className="text-xs font-normal text-gray-500">ชั่วโมง/ครั้ง</span>
            </span>
            <span className="text-[10.5px] text-zinc-500 block">
              <span className="font-bold text-green-500">สูตร:</span> รันไทม์สุทธิ / ครั้งเสีย
            </span>
          </div>
          <div className="p-3 bg-green-50 text-green-600 dark:bg-green-950/20 rounded-md">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Aggregate Cost Card */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-md p-4 text-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider block text-blue-100 font-sans">ค่าใช้จ่ายงานซ่อมบำรุงและอะไหล่สะสม (Total Breakdown Expenditure)</span>
          <h4 className="text-3xl font-bold font-mono mt-1">
            ฿{analytics.totalCost.toLocaleString('th-TH')}
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-white/10 p-2 px-4 rounded-md">
          <div>
            <span className="text-blue-100 block font-sans">ค่าอะไหล่สุทธิ:</span>
            <span className="font-bold">฿{analytics.totalSparesCost.toLocaleString('th-TH')}</span>
          </div>
          <div>
            <span className="text-blue-100 block font-sans">ค่าแรงวิเคราะห์/อื่น:</span>
            <span className="font-bold">฿{analytics.totalOtherCost.toLocaleString('th-TH')}</span>
          </div>
        </div>
      </div>

      {/* Grid Filter Matching Entries Card */}
      <div className="card shadow-md bg-white dark:bg-zinc-800 rounded-md border border-gray-100 dark:border-zinc-700 overflow-hidden font-sans">
        <div className="p-4 border-b border-gray-100 dark:border-zinc-700/60 bg-gray-50 dark:bg-zinc-800/40 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-1.5">
            <FileText className="h-4.5 w-4.5 text-blue-600" />
            <h4 className="font-bold text-sm text-gray-900 dark:text-zinc-100">
              ตารางสรุปผลข้อมูลงานแจ้งซ่อมตามเกณฑ์กรอง ({reportData.length} รายการที่ตรง)
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV / Excel</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-700 dark:hover:bg-zinc-650 text-gray-800 dark:text-zinc-200 rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Print Preview / สั่งพิมพ์ PDF</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
            <thead className="bg-[#fcfcfc] dark:bg-zinc-800/40 text-gray-500">
              <tr>
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider">ใบสั่งงาน WO</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider">วันรันงาน</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider">ผู้รับผิดชอบหลัก</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider">วิเคราะห์ความชำรุด</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider">ผลลัพธ์ซ่อมบำรุง</th>
                <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-wider">ชั่วโมงหน้างาน</th>
                <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider">ค่าอะไหล่</th>
                <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider">ค่าใช้จ่ายอื่น</th>
                <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider">ค่าซ่อมรวม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-700 text-xs text-zinc-600 dark:text-zinc-300">
              {reportData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-gray-400">
                    🚨 ไม่มีงานซ่อมบำรุงตามเกณฑ์วันเวลากรอกด้านบน
                  </td>
                </tr>
              ) : (
                reportData.map(wo => {
                  const tech = users.find(u => u.id === wo.responsibleTechId);
                  const sumVal = (wo.totalSpareCost || 0) + (wo.otherCost || 0);
                  return (
                    <tr key={wo.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/10">
                      <td className="px-5 py-3.5 font-mono font-bold text-gray-900 dark:text-gray-150 whitespace-nowrap">{wo.id}</td>
                      <td className="px-5 py-3.5 font-mono whitespace-nowrap text-zinc-500">{wo.startDate}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap font-medium text-gray-800 dark:text-gray-200">
                        {tech ? tech.name : wo.responsibleTechId}
                      </td>
                      <td className="px-5 py-3.5 max-w-xs truncate" title={wo.symptomDiagnosed}>
                        {wo.symptomDiagnosed}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          wo.repairResult === 'กลับมาใช้งานได้ปกติ' ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300' :
                          wo.repairResult === 'ใช้งานได้ชั่วคราว' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300' :
                          wo.repairResult === 'ต้องรอสั่งอะไหล่' ? 'bg-orange-100 text-orange-850 dark:bg-orange-950/40 dark:text-orange-300' :
                          'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300'
                        }`}>
                          {wo.repairResult}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center font-mono font-bold">{wo.manHours} ชม.</td>
                      <td className="px-5 py-3.5 text-right font-mono">฿{wo.totalSpareCost.toLocaleString('th-TH')}</td>
                      <td className="px-5 py-3.5 text-right font-mono">฿{wo.otherCost.toLocaleString('th-TH')}</td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        ฿{sumVal.toLocaleString('th-TH')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
