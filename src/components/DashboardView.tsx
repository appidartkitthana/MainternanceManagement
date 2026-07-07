/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { 
  Machine, RepairRequest, WorkOrder, SparePart, 
  SystemNotification, AuditLog 
} from '../types';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line
} from 'recharts';
import { 
  Wrench, Activity, AlertTriangle, ShieldCheck, DollarSign, Clock, Settings, ArrowRight, LucideIcon 
} from 'lucide-react';

interface DashboardViewProps {
  machines: Machine[];
  repairRequests: RepairRequest[];
  workOrders: WorkOrder[];
  spareParts: SparePart[];
  notifications: SystemNotification[];
  auditLogs: AuditLog[];
  onNavigateToView: (view: string) => void;
  triggerNotification: (title: string, message: string, type: 'info' | 'warning' | 'danger' | 'success') => void;
  onNavigateToWorkOrderWithReq: (reqId: string) => void;
}

export default function DashboardView({
  machines,
  repairRequests,
  workOrders,
  spareParts,
  notifications,
  auditLogs,
  onNavigateToView,
  triggerNotification,
  onNavigateToWorkOrderWithReq
}: DashboardViewProps) {

  // Dynamic state computed telemetry
  const stats = useMemo(() => {
    // 1. Counter cards
    const totalTodayRepairs = repairRequests.filter(r => r.requestDate === '2026-06-10').length;
    const pendingTickets = repairRequests.filter(r => r.status === 'รอรับงาน').length;
    const activeRepairs = repairRequests.filter(r => r.status === 'กำลังดำเนินการ').length;
    const completedRepairs = repairRequests.filter(r => r.status === 'เสร็จสิ้น').length;

    // 2. Extra KPI: Most frequent broken machines
    const machineCounts: Record<string, number> = {};
    repairRequests.forEach(r => {
      machineCounts[r.machineId] = (machineCounts[r.machineId] || 0) + 1;
    });
    let topBrokenMachineId = '-';
    let topCount = 0;
    Object.entries(machineCounts).forEach(([mId, count]) => {
      if (count > topCount) {
        topCount = count;
        topBrokenMachineId = mId;
      }
    });
    const brokenMachineObj = machines.find(m => m.id === topBrokenMachineId);
    const topMachineNameDisplay = brokenMachineObj ? `${brokenMachineObj.name} (${topBrokenMachineId})` : '-';

    // 3. Spares cost this month
    const totalSparesCostThisMonth = workOrders.reduce((sum, wo) => sum + (wo.totalSpareCost || 0) + (wo.otherCost || 0), 0);

    // 4. MTTR & MTBF (Live calculated)
    let totalRepairTime = 0;
    let totalDowntime = 0;
    workOrders.forEach(wo => {
      totalRepairTime += wo.manHours || 0;
      
      const req = repairRequests.find(r => r.id === wo.requestId);
      if (req) {
        const reqDt = new Date(`${req.requestDate}T${req.requestTime}`);
        const endDt = wo.endDate ? new Date(`${wo.endDate}T${wo.endTime || '17:00'}`) : new Date('2026-06-10T12:00:00');
        const diffMs = endDt.getTime() - reqDt.getTime();
        const diffHours = Math.max(1, diffMs / (1000 * 60 * 60));
        totalDowntime += diffHours;
      }
    });

    const repairsCount = workOrders.length;
    const mttr = repairsCount > 0 ? (totalRepairTime / repairsCount) : 0;
    
    // Total running hours of plant
    const possibleHours = 10 * 30 * 24; // 10 machines, 30 days, 24 hr/day
    const mtbf = repairsCount > 0 ? Math.max(24, (possibleHours - totalDowntime) / repairsCount) : 720;

    return {
      totalTodayRepairs,
      pendingTickets,
      activeRepairs,
      completedRepairs,
      topMachineNameDisplay,
      totalSparesCostThisMonth,
      mttr: Math.round(mttr * 100) / 100,
      mtbf: Math.round(mtbf * 10) / 10
    };
  }, [repairRequests, workOrders, machines]);

  // --- RECHARTS 1: Status Distribution (Pie) ---
  const pieData = [
    { name: 'รอรับงาน (Pending)', value: stats.pendingTickets, color: '#ef4444' },
    { name: 'กำลังดำเนินการ (In Progress)', value: stats.activeRepairs, color: '#f59e0b' },
    { name: 'เสร็จสิ้นภารกิจ (Completed)', value: stats.completedRepairs, color: '#10b981' }
  ].filter(d => d.value > 0);

  // --- RECHARTS 2: Monthly Spare Costs (Bar) ---
  const monthlyExpenseData = [
    { month: 'ม.ค.', spares: 12500, maintenance: 3200 },
    { month: 'ก.พ.', spares: 18900, maintenance: 4500 },
    { month: 'มี.ค.', spares: 24000, maintenance: 8900 },
    { month: 'เม.ย.', spares: 15400, maintenance: 2900 },
    { month: 'พ.ค.', spares: 31000, maintenance: 12000 },
    { month: 'มิ.ย. (ปัจจุบัน)', spares: stats.totalSparesCostThisMonth, maintenance: 4500 }
  ];

  // --- RECHARTS 3: Breakdown Trend Line (Downtime in hours) ---
  const lineData = [
    { date: '05-10', hours: 3.5 },
    { date: '05-15', hours: 1.75 },
    { date: '05-24', hours: 4.0 },
    { date: '06-02', hours: 6.0 },
    { date: '06-09', hours: 5.0 }
  ];

  // --- RECHARTS 4: Top Machine Breakdowns counts ---
  const topMachinesData = useMemo(() => {
    const counts: Record<string, number> = {};
    repairRequests.forEach(r => {
      counts[r.machineId] = (counts[r.machineId] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([id, count]) => ({ name: id, 'จำนวนครั้งเสีย': count }))
      .sort((a, b) => b['จำนวนครั้งเสีย'] - a['จำนวนครั้งเสีย'])
      .slice(0, 5);
  }, [repairRequests]);


  return (
    <div className="space-y-6" id="kpi-panel-hub">
      
      {/* Real-time Cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1 */}
        <div className="bg-white dark:bg-zinc-800 p-4 rounded-md shadow-sm border-l-4 border-blue-500 border border-gray-150 dark:border-zinc-700/60 flex items-center justify-between">
          <div className="space-y-1 font-sans">
            <span className="text-[11px] font-bold text-gray-400 block">งานแจ้งวันนี้ (Repairs Today)</span>
            <span className="text-2xl font-bold font-mono tracking-tight text-gray-950 dark:text-white block">
              {stats.totalTodayRepairs} <span className="text-xs font-normal text-gray-500">ใบเสร็จ</span>
            </span>
            <button onClick={() => onNavigateToView('repair')} className="text-[10px] text-blue-500 font-bold hover:underline flex items-center gap-0.5 cursor-pointer">
              เปิดรายตาราง <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-500 rounded">
            <Wrench className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-zinc-800 p-4 rounded-md shadow-sm border-l-4 border-yellow-500 border border-gray-150 dark:border-zinc-700/60 flex items-center justify-between">
          <div className="space-y-1 font-sans">
            <span className="text-[11px] font-bold text-gray-400 block">กำลังดำเนินการ (In Progress)</span>
            <span className="text-2xl font-bold font-mono tracking-tight text-gray-950 dark:text-white block animate-pulse">
              {stats.activeRepairs} <span className="text-xs font-normal text-gray-500">ใบงาน</span>
            </span>
            <span className="text-[10px] text-yellow-600 dark:text-yellow-400 block font-bold">• ตรวจสอบและซ่อมแซมหน้างาน</span>
          </div>
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 rounded">
            <Activity className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-zinc-800 p-4 rounded-md shadow-sm border-l-4 border-red-500 border border-gray-150 dark:border-zinc-700/60 flex items-center justify-between">
          <div className="space-y-1 font-sans">
            <span className="text-[11px] font-bold text-gray-400 block">งานค้างรับ (Pending Queue)</span>
            <span className="text-2xl font-bold font-mono tracking-tight text-zinc-950 dark:text-white block">
              {stats.pendingTickets} <span className="text-xs font-normal text-gray-500">ใบขอแจ้ง</span>
            </span>
            <span className="text-[10px] text-red-500 block">• รอวิศวกรวินิจฉัยหน้างาน</span>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 rounded">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white dark:bg-zinc-800 p-4 rounded-md shadow-sm border-l-4 border-green-500 border border-gray-150 dark:border-zinc-700/60 flex items-center justify-between">
          <div className="space-y-1 font-sans">
            <span className="text-[11px] font-bold text-gray-400 block">งานชำระเสร็จ (Completed Job)</span>
            <span className="text-2xl font-bold font-mono tracking-tight text-gray-950 dark:text-white block">
              {stats.completedRepairs} <span className="text-xs font-normal text-gray-500">ใบปิด</span>
            </span>
            <span className="text-[10px] text-green-600 dark:text-green-400 block">• อะไหล่สำรองถูกบันทึกสมเกียรติ</span>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-950/20 text-green-500 rounded">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* Real-time calculated MTTR / MTBF Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans bg-slate-900 text-white rounded-md p-5 border border-zinc-700">
        <div className="space-y-1 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/10 pb-3 md:pb-0 pr-3">
          <span className="text-zinc-400 text-[10.5px] font-bold uppercase tracking-wider block">ความถี่เครื่องจักรพังดุที่สุด (Top Breakdown Item)</span>
          <strong className="text-orange-400 text-sm block truncate mt-0.5">{stats.topMachineNameDisplay}</strong>
          <span className="text-[10px] text-zinc-500 block">ตรวจนับจำลองพฤติกรรมสายการผลิต</span>
        </div>

        <div className="space-y-1 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/10 pb-3 md:pb-0 px-0 md:px-4">
          <span className="text-zinc-400 text-[10.5px] font-bold uppercase tracking-wider flex items-center gap-1">
            <Clock className="h-3 w-3 text-blue-400" /> ดัชนีเฉลี่ย MTTR
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-bold font-mono text-white">{stats.mttr}</span>
            <span className="text-zinc-400 text-[11px]">ชั่วโมง/ครั้ง</span>
          </div>
          <p className="text-[9.5px] text-zinc-500 leading-none">ค่าซ่อมเฉลี่ยประตูด้านวิศวกรรมบำรุง</p>
        </div>

        <div className="space-y-1 flex flex-col justify-center px-0 md:px-4">
          <span className="text-zinc-400 text-[10.5px] font-bold uppercase tracking-wider flex items-center gap-1">
            <Settings className="h-3 w-3 text-emerald-400" /> ดัชนีเฉลี่ย MTBF
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-bold font-mono text-emerald-400">{stats.mtbf}</span>
            <span className="text-zinc-400 text-[11px]">ชั่วโมง/รันไทม์</span>
          </div>
          <p className="text-[9.5px] text-zinc-500 leading-none">มาตรฐานเป้าหมายเวลารองรับไร้จุดผิดพลาด</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="dashboard-recharts-suite">
        
        {/* CHART 1: Pie chart of ticket statuses */}
        <div className="card shadow-md bg-white dark:bg-zinc-800 rounded-md border border-gray-150 dark:border-zinc-700/60 p-4 flex flex-col justify-between">
          <h4 className="font-bold text-sm text-gray-800 dark:text-zinc-100 font-sans mb-3 pb-2 border-b">
            📊 สัดส่วนและสถานะใบงานแจ้งซ่อมบำรุงรวม
          </h4>
          <div className="h-60 w-full">
            {pieData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-xs">ไม่มีสลิปซ่อมบำรุงสะสมช่วงนี้</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} ใบงาน`} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', fontFamily: 'sans-serif' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* CHART 2: Monthly Spare Costs (Bar Chart) */}
        <div className="card shadow-md bg-white dark:bg-zinc-800 rounded-md border border-gray-150 dark:border-zinc-700/60 p-4 flex flex-col justify-between">
          <h4 className="font-bold text-sm text-gray-800 dark:text-zinc-100 font-sans mb-3 pb-2 border-b">
            💸 รายงานสะสมค่าแรงและอะไหล่ซ่อมรายเหมือง (บาท)
          </h4>
          <div className="h-60 w-full text-[11px] font-sans">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyExpenseData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v) => `฿${Number(v).toLocaleString()}`} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar name="ค่าอะไหล่พวงซ่อม" dataKey="spares" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar name="ค่าแรงพ่วงวิเคราะห์" dataKey="maintenance" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 3: Line Chart trend for Breakdown occurrences */}
        <div className="card shadow-md bg-white dark:bg-zinc-800 rounded-md border border-gray-150 dark:border-zinc-700/60 p-4 flex flex-col justify-between">
          <h4 className="font-bold text-sm text-gray-800 dark:text-zinc-100 font-sans mb-3 pb-2 border-b">
            📉 แนวโน้มความเร่งของเวลา Downtime ต่อรอบงานคิวซ่อมล่าสุด (ชั่วโมง)
          </h4>
          <div className="h-60 w-full text-[11px] font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(v) => `${v} ชั่วโมง`} />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'sans-serif' }} />
                <Line name="ชั่วโมงหยุดนิ่ง (Downtime)" type="monotone" dataKey="hours" stroke="#f43f5e" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: Top Machine Breakdowns counts */}
        <div className="card shadow-md bg-white dark:bg-zinc-800 rounded-md border border-gray-150 dark:border-zinc-700/60 p-4 flex flex-col justify-between">
          <h4 className="font-bold text-sm text-gray-800 dark:text-zinc-100 font-sans mb-3 pb-2 border-b">
            ⚙️ ผู้นำเครื่องจักรชำรุดและเสียพังสูงสุด 5 อันดับแรก
          </h4>
          <div className="h-60 w-full text-[11px] font-sans">
            {topMachinesData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-xs">ไม่มีรายละเอียดสถิติความเสียหาย</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={topMachinesData} margin={{ top: 5, right: 5, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Bar dataKey="จำนวนครั้งเสีย" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Recent Activity Ticker panel */}
      <div className="card shadow-md bg-white dark:bg-zinc-800 rounded-md border border-gray-150 dark:border-zinc-700 overflow-hidden font-sans">
        <div className="p-4 border-b border-gray-100 dark:border-zinc-700/50 bg-[#f9fafc] dark:bg-zinc-800/40 flex items-center justify-between">
          <h4 className="font-bold text-sm text-gray-800 dark:text-zinc-100 flex items-center gap-1.5 font-sans">
            <Activity className="h-4.5 w-4.5 text-blue-500 animate-spin" /> คิวแจ้งเหตุและบันทึกประมวลระบบ (Real-Time Audits Log)
          </h4>
          <button 
            onClick={() => onNavigateToView('users')}
            className="text-[11px] font-bold text-blue-500 hover:underline cursor-pointer"
          >
            ดูทั้งหมด
          </button>
        </div>

        <div className="p-4 divide-y divide-gray-100 dark:divide-zinc-700 text-xs max-h-56 overflow-y-auto">
          {auditLogs.slice(0, 6).map((log, idx) => {
            return (
              <div key={log.id || idx} className="py-2.5 first:pt-0 last:pb-0 flex cursor-pointer hover:bg-slate-50/50 dark:hover:bg-zinc-700/10 rounded px-1 transition duration-150">
                <span className="font-mono text-zinc-400 w-16 block shrink-0">{log.timestamp.slice(11, 19) || '11:27:00'}</span>
                
                <div className="flex-1 px-2">
                  <p className="text-gray-900 dark:text-zinc-200 font-medium">
                    {log.userName} ({log.userRole})
                  </p>
                  <p className="text-gray-500 dark:text-zinc-400 text-[11px] mt-0.5">{log.action}: {log.details}</p>
                </div>

                <span className="text-[10px] bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300 h-fit px-2 py-0.5 rounded font-mono shrink-0">
                  {log.id}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
