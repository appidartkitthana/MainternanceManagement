/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  User, Machine, RepairRequest, WorkOrder, SparePart, 
  PreventiveMaintenance, MaintenanceSchedule, SpareTransaction, 
  SystemNotification, AuditLog, UserRole
} from './types';
import {
  INITIAL_USERS, DEPARTMENTS, INITIAL_MACHINES, INITIAL_SPARE_PARTS,
  INITIAL_REPAIR_REQUESTS, INITIAL_WORK_ORDERS, INITIAL_PREVENTIVE_MAINTENANCE,
  INITIAL_MAINTENANCE_SCHEDULE, INITIAL_SPARE_TRANSACTIONS,
  INITIAL_NOTIFICATIONS, INITIAL_AUDIT_LOGS
} from './data/mockData';

// Component imports
import AdminLTELayout from './components/AdminLTELayout';
import DashboardView from './components/DashboardView';
import MachinesView from './components/MachinesView';
import RepairRequestsView from './components/RepairRequestsView';
import WorkOrdersView from './components/WorkOrdersView';
import SparePartsView from './components/SparePartsView';
import PMView from './components/PMView';
import ReportsView from './components/ReportsView';
import UsersView from './components/UsersView';
import NotificationsSettingsView from './components/NotificationsSettingsView';
import SqlSchemaView from './components/SqlSchemaView';

import { Shield, Eye, EyeOff, KeyRound, Hammer, HelpCircle } from 'lucide-react';

export default function App() {
  // Global States
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [machines, setMachines] = useState<Machine[]>(INITIAL_MACHINES);
  const [repairRequests, setRepairRequests] = useState<RepairRequest[]>(INITIAL_REPAIR_REQUESTS);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(INITIAL_WORK_ORDERS);
  const [spareParts, setSpareParts] = useState<SparePart[]>(INITIAL_SPARE_PARTS);
  const [pmPlans, setPmPlans] = useState<PreventiveMaintenance[]>(INITIAL_PREVENTIVE_MAINTENANCE);
  const [pmSchedules, setPmSchedules] = useState<MaintenanceSchedule[]>(INITIAL_MAINTENANCE_SCHEDULE);
  const [transactions, setTransactions] = useState<SpareTransaction[]>(INITIAL_SPARE_TRANSACTIONS);
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Layout preference
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[0]); // default logged as Admin
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Shared notification configuration states
  const [lineConfig, setLineConfig] = useState({
    isEnabled: true,
    token: 'LN_MMS_DEV_TOKEN_2026_X',
    recipientGroup: 'สตาฟช่างแผนกบำรุงรักษา A'
  });
  const [emailConfig, setEmailConfig] = useState({
    isEnabled: false,
    smtpServer: 'smtp.mms-smartfactory.co.th',
    smtpPort: 587,
    senderEmail: 'mms-alert@mms-smartfactory.co.th',
    recipientEmails: 'eng-lead@mms-smartfactory.co.th, plant-manager@mms-smartfactory.co.th'
  });

  // Hot linking selection
  const [autoSelectRequestId, setAutoSelectRequestId] = useState<string | undefined>(undefined);

  // Core Alert Trigger Function
  const triggerNotification = (title: string, message: string, type: 'info' | 'warning' | 'danger' | 'success') => {
    const nextId = `NTF-${String(notifications.length + 1).padStart(3, '0')}`;
    const newAlert: SystemNotification = {
      id: nextId,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setNotifications(prev => [newAlert, ...prev]);

    // Simulated browser flash
    console.log(`[MMS Notification] ${title}: ${message}`);
  };

  // Core Logging Function
  const addAuditLog = (action: string, details: string) => {
    const nextId = `LOG-${String(auditLogs.length + 1).padStart(4, '0')}`;
    const newLog: AuditLog = {
      id: nextId,
      userId: currentUser?.id || 'GUEST',
      userName: currentUser?.name || 'Guest Operator',
      userRole: currentUser?.role || 'User',
      action,
      timestamp: new Date().toISOString(),
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Fast route routing from ticket link
  const handleNavigateToWorkOrderWithReq = (reqId: string) => {
    setAutoSelectRequestId(reqId);
    setCurrentView('workorder');
    triggerNotification('เชื่อมต่อใบงานสำเร็จ', `กรุณากรอกผลซ่อมเพื่อปิดใบนัด ${reqId}`, 'info');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedUser = users.find(u => u.username === usernameInput.toLowerCase().trim() && u.isActive);
    if (resolvedUser) {
      setCurrentUser(resolvedUser);
      addAuditLog('Login Successfully', `Granted application ingress gate with role ${resolvedUser.role}`);
      setCurrentView('dashboard');
    } else {
      alert('ไม่พบบัญชีผู้ใช้งานที่เปิดหรือคีย์รหัสผ่านถูกต้อง! กรุณาตรวจสอบหรือใช้บัญชีด่วนด้านล่าง');
    }
  };

  const handleQuickLogin = (userObj: User) => {
    setCurrentUser(userObj);
    addAuditLog('Login via Quick Testing Card', `Bypassed gate credentials for direct role test as: ${userObj.name} (${userObj.role})`);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    addAuditLog('Logout', 'Successfully exited MMS industrial interface');
    setCurrentUser(null);
    setUsernameInput('');
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      
      {/* 1. GUEST/LOGIN VIEW SECTION */}
      {!currentUser ? (
        <div className="min-h-screen bg-slate-900 text-zinc-100 flex flex-col justify-center items-center p-4 selection:bg-blue-500 font-sans">
          
          <div className="w-full max-w-md bg-zinc-800 rounded-lg shadow-2xl border border-zinc-700 overflow-hidden">
            
            {/* Header pattern */}
            <div className="bg-gradient-to-r from-blue-600 via-emerald-600 to-orange-500 p-5 text-center">
              <span className="p-1 px-2.5 bg-white text-slate-900 font-mono font-black rounded tracking-widest text-xs shadow-md">
                MMS ERP
              </span>
              <h2 className="text-white font-bold text-lg mt-2 tracking-tight">ระบบบันทึกงานซ่อมบำรุงเครื่องจักร</h2>
              <p className="text-blue-100 text-[10.5px] tracking-wider uppercase mt-1">Maintenance Management System (MMS)</p>
            </div>

            {/* Login form */}
            <form onSubmit={handleLogin} className="p-6 space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="block text-zinc-400 font-bold">ชื่อบัญชีผู้ใช้ระบบ (Username)</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="ป้อนชื่อผู้ใช้ เช่น admin หรือ tech_wichai"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2.5 pl-8 text-white focus:outline-none focus:border-blue-500 text-xs"
                  />
                  <div className="absolute left-2.5 top-3 text-zinc-500">👤</div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-zinc-400 font-bold">รหัสผ่านเข้าใช้งาน (MMS Key)</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-2.5 pl-8 text-white focus:outline-none focus:border-emerald-500 tracking-widest text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-zinc-500 font-bold hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <div className="absolute left-2.5 top-3 text-zinc-500">🔒</div>
                </div>
              </div>

              {/* Extras indicators */}
              <div className="flex justify-between items-center text-[10.5px]">
                <label className="flex items-center gap-1.5 cursor-pointer text-zinc-400">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-blue-500 focus:ring-0"
                  />
                  <span>จดจำรหัสผ่านผู้ใช้งาน</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('จำลองระบบรีเซ็ตรหัสความปลอดภัย: กรุณาติดต่อหัวหน้าแผนกวิศวกรรมบำรุงรักษาแผนกผลิต!')}
                  className="text-blue-400 hover:underline cursor-pointer"
                >
                  ลืมรหัสผ่าน?
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 font-bold text-white rounded shadow-md transition-all cursor-pointer font-sans"
              >
                ยืนยันการเข้าสู่ระบบ
              </button>
            </form>

            {/* Quick Testing accounts sector */}
            <div className="p-5 bg-zinc-900/60 border-t border-zinc-700 text-xs font-sans">
              <span className="text-zinc-500 text-[10px] font-bold block mb-2 text-center">🎯 บัญชีผู้ใช้จำลองเพื่อทดสอบสิทธิ์ Role-Based Access:</span>
              <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                {users.slice(0, 4).map(u => (
                  <button
                    key={u.id}
                    onClick={() => handleQuickLogin(u)}
                    className="p-2 bg-zinc-800 hover:bg-zinc-750 rounded border border-zinc-700 hover:border-zinc-500 text-left cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-gray-200 block">{u.username}</span>
                      <span className="text-[9.5px] text-zinc-400">{u.role}</span>
                    </div>
                    <span className="text-[10px]">👉</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          <span className="text-[10.2px] text-zinc-500 mt-4">MMS Plant Gate Terminal. Standard Operating System 2026.</span>
        </div>
      ) : (
        
        // 2. LOGGED INDUSTRIAL SYSTEM LAYOUT
        <AdminLTELayout
          currentView={currentView}
          setCurrentView={setCurrentView}
          currentUserRole={currentUser.role}
          currentUserName={currentUser.name}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          onLogout={handleLogout}
          notifications={notifications}
          clearNotifications={() => setNotifications([])}
        >
          {/* Main content body routers */}
          {currentView === 'dashboard' && (
            <DashboardView
              machines={machines}
              repairRequests={repairRequests}
              workOrders={workOrders}
              spareParts={spareParts}
              notifications={notifications}
              auditLogs={auditLogs}
              onNavigateToView={setCurrentView}
              triggerNotification={triggerNotification}
              onNavigateToWorkOrderWithReq={handleNavigateToWorkOrderWithReq}
            />
          )}

          {currentView === 'machines' && (
            <MachinesView
              machines={machines}
              setMachines={setMachines}
              currentUserRole={currentUser.role}
              addAuditLog={addAuditLog}
              triggerNotification={triggerNotification}
            />
          )}

          {currentView === 'repair' && (
            <RepairRequestsView
              requests={repairRequests}
              setRequests={setRepairRequests}
              machines={machines}
              currentUserRole={currentUser.role}
              currentUserName={currentUser.name}
              addAuditLog={addAuditLog}
              triggerNotification={triggerNotification}
              onNavigateToWorkOrderWithReq={handleNavigateToWorkOrderWithReq}
            />
          )}

          {currentView === 'workorder' && (
            <WorkOrdersView
              workOrders={workOrders}
              setWorkOrders={setWorkOrders}
              requests={repairRequests}
              setRequests={setRepairRequests}
              machines={machines}
              setMachines={setMachines}
              spareParts={spareParts}
              setSpareParts={setSpareParts}
              addAuditLog={addAuditLog}
              triggerNotification={triggerNotification}
              currentUserRole={currentUser.role}
              currentUserName={currentUser.name}
              autoSelectRequestId={autoSelectRequestId}
              clearAutoSelectRequest={() => setAutoSelectRequestId(undefined)}
              setTransactions={setTransactions}
              transactions={transactions}
            />
          )}

          {currentView === 'spareparts' && (
            <SparePartsView
              spareParts={spareParts}
              setSpareParts={setSpareParts}
              transactions={transactions}
              setTransactions={setTransactions}
              currentUserRole={currentUser.role}
              currentUserName={currentUser.name}
              addAuditLog={addAuditLog}
              triggerNotification={triggerNotification}
            />
          )}

          {currentView === 'pm' && (
            <PMView
              pmPlans={pmPlans}
              setPmPlans={setPmPlans}
              schedules={pmSchedules}
              setSchedules={setPmSchedules}
              machines={machines}
              currentUserRole={currentUser.role}
              addAuditLog={addAuditLog}
              triggerNotification={triggerNotification}
            />
          )}

          {currentView === 'reports' && (
            <ReportsView
              workOrders={workOrders}
              repairRequests={repairRequests}
              machines={machines}
              departments={DEPARTMENTS}
              users={users}
            />
          )}

          {currentView === 'users' && (
            <UsersView
              users={users}
              setUsers={setUsers}
              currentUserRole={currentUser.role}
              addAuditLog={addAuditLog}
              triggerNotification={triggerNotification}
            />
          )}

          {currentView === 'notifications' && (
            <NotificationsSettingsView
              lineConfig={lineConfig}
              setLineConfig={setLineConfig}
              emailConfig={emailConfig}
              setEmailConfig={setEmailConfig}
              triggerNotification={triggerNotification}
              addAuditLog={addAuditLog}
            />
          )}

          {currentView === 'schema' && (
            <SqlSchemaView />
          )}

        </AdminLTELayout>
      )}

    </div>
  );
}
