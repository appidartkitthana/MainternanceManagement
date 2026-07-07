/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  User, Machine, RepairRequest, WorkOrder, SparePart, 
  PreventiveMaintenance, MaintenanceSchedule, SpareTransaction, 
  SystemNotification, AuditLog, UserRole, LINEConfig, EmailConfig
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
import { sendLineAlert } from './lib/lineNotification';

import { Shield, Eye, EyeOff, KeyRound, Hammer, HelpCircle } from 'lucide-react';
import { seedDatabaseIfEmpty, loadCollection, saveDocument } from './lib/firebase';

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

  // Loading indicator for Firebase Initialization
  const [loadingFirebase, setLoadingFirebase] = useState(true);

  // Initialize and Sync Firebase
  useEffect(() => {
    async function initFirebase() {
      try {
        console.log('[Firebase] Initializing and checking seeding...');
        await seedDatabaseIfEmpty();

        console.log('[Firebase] Fetching data from Firestore...');
        const [
          dbUsers, dbMachines, dbRepair, dbWorkOrders, 
          dbParts, dbPmPlans, dbPmScheds, dbTrans, 
          dbNotifications, dbLogs
        ] = await Promise.all([
          loadCollection<User>('users'),
          loadCollection<Machine>('machines'),
          loadCollection<RepairRequest>('repair_requests'),
          loadCollection<WorkOrder>('work_orders'),
          loadCollection<SparePart>('parts'),
          loadCollection<PreventiveMaintenance>('pm_plans'),
          loadCollection<MaintenanceSchedule>('pm_schedules'),
          loadCollection<SpareTransaction>('spare_transactions'),
          loadCollection<SystemNotification>('notifications'),
          loadCollection<AuditLog>('audit_logs')
        ]);

        if (dbUsers.length > 0) setUsers(dbUsers);
        if (dbMachines.length > 0) setMachines(dbMachines);
        if (dbRepair.length > 0) setRepairRequests(dbRepair);
        if (dbWorkOrders.length > 0) setWorkOrders(dbWorkOrders);
        if (dbParts.length > 0) setSpareParts(dbParts);
        if (dbPmPlans.length > 0) setPmPlans(dbPmPlans);
        if (dbPmScheds.length > 0) setPmSchedules(dbPmScheds);
        if (dbTrans.length > 0) setTransactions(dbTrans);
        if (dbNotifications.length > 0) setNotifications(dbNotifications);
        if (dbLogs.length > 0) setAuditLogs(dbLogs);

        console.log('[Firebase] Loaded and synced successfully.');
      } catch (err) {
        console.error('[Firebase] Init failed, running on in-memory mock storage fallback:', err);
      } finally {
        setLoadingFirebase(false);
      }
    }
    initFirebase();
  }, []);

  // Sync state wrappers to Firestore in the background
  const handleSetUsers = (updater: React.SetStateAction<User[]>) => {
    setUsers((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      const prevMap = new Map(prev.map(u => [u.id, u]));
      next.forEach(u => {
        const old = prevMap.get(u.id);
        if (!old || JSON.stringify(old) !== JSON.stringify(u)) {
          saveDocument('users', u).catch(console.error);
        }
      });
      return next;
    });
  };

  const handleSetMachines = (updater: React.SetStateAction<Machine[]>) => {
    setMachines((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      const prevMap = new Map(prev.map(m => [m.id, m]));
      next.forEach(m => {
        const old = prevMap.get(m.id);
        if (!old || JSON.stringify(old) !== JSON.stringify(m)) {
          saveDocument('machines', m).catch(console.error);
        }
      });
      return next;
    });
  };

  const handleSetRepairRequests = (updater: React.SetStateAction<RepairRequest[]>) => {
    setRepairRequests((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      const prevMap = new Map(prev.map(r => [r.id, r]));
      next.forEach(r => {
        const old = prevMap.get(r.id);
        if (!old || JSON.stringify(old) !== JSON.stringify(r)) {
          saveDocument('repair_requests', r).catch(console.error);
        }
      });
      return next;
    });
  };

  const handleSetWorkOrders = (updater: React.SetStateAction<WorkOrder[]>) => {
    setWorkOrders((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      const prevMap = new Map(prev.map(w => [w.id, w]));
      next.forEach(w => {
        const old = prevMap.get(w.id);
        if (!old || JSON.stringify(old) !== JSON.stringify(w)) {
          saveDocument('work_orders', w).catch(console.error);
        }
      });
      return next;
    });
  };

  const handleSetSpareParts = (updater: React.SetStateAction<SparePart[]>) => {
    setSpareParts((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      const prevMap = new Map(prev.map(s => [s.id, s]));
      next.forEach(s => {
        const old = prevMap.get(s.id);
        if (!old || JSON.stringify(old) !== JSON.stringify(s)) {
          saveDocument('parts', s).catch(console.error);
        }
      });
      return next;
    });
  };

  const handleSetPmPlans = (updater: React.SetStateAction<PreventiveMaintenance[]>) => {
    setPmPlans((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      const prevMap = new Map(prev.map(p => [p.id, p]));
      next.forEach(p => {
        const old = prevMap.get(p.id);
        if (!old || JSON.stringify(old) !== JSON.stringify(p)) {
          saveDocument('pm_plans', p).catch(console.error);
        }
      });
      return next;
    });
  };

  const handleSetPmSchedules = (updater: React.SetStateAction<MaintenanceSchedule[]>) => {
    setPmSchedules((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      const prevMap = new Map(prev.map(s => [s.id, s]));
      next.forEach(s => {
        const old = prevMap.get(s.id);
        if (!old || JSON.stringify(old) !== JSON.stringify(s)) {
          saveDocument('pm_schedules', s).catch(console.error);
        }
      });
      return next;
    });
  };

  const handleSetTransactions = (updater: React.SetStateAction<SpareTransaction[]>) => {
    setTransactions((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      const prevMap = new Map(prev.map(t => [t.id, t]));
      next.forEach(t => {
        const old = prevMap.get(t.id);
        if (!old || JSON.stringify(old) !== JSON.stringify(t)) {
          saveDocument('spare_transactions', t).catch(console.error);
        }
      });
      return next;
    });
  };

  const handleSetNotifications = (updater: React.SetStateAction<SystemNotification[]>) => {
    setNotifications((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      const prevMap = new Map(prev.map(n => [n.id, n]));
      next.forEach(n => {
        const old = prevMap.get(n.id);
        if (!old || JSON.stringify(old) !== JSON.stringify(n)) {
          saveDocument('notifications', n).catch(console.error);
        }
      });
      return next;
    });
  };

  // Layout preference
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[0]); // default logged as Admin
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Google Auth Simulation State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGmail, setCustomGmail] = useState('');
  const [customGmailName, setCustomGmailName] = useState('');
  const [customGmailRole, setCustomGmailRole] = useState<UserRole>('Technician');

  const handleGoogleLogin = (email: string, name: string, role: UserRole) => {
    const formattedEmail = email.trim().toLowerCase();
    if (!formattedEmail.includes('@')) {
      alert('กรุณากรอกอีเมลให้ถูกต้อง!');
      return;
    }

    const prefix = formattedEmail.split('@')[0];
    
    // Attempt to find user
    let resolvedUser = users.find(u => u.username === prefix || u.id === formattedEmail);

    if (!resolvedUser) {
      // Create User Automatically
      const newUser: User = {
        id: formattedEmail,
        username: prefix,
        name: name || prefix.toUpperCase(),
        department: 'แผนกวิศวกรรมบำรุงรักษา (ENG)',
        position: `Google Account (${role})`,
        role: role,
        isActive: true
      };
      handleSetUsers(prev => [...prev, newUser]);
      resolvedUser = newUser;
      
      // Save info simulation in Firestore
      const logMsg = `[Firestore Auto-create User] Created new user UID: ${formattedEmail}, Name: ${name}, Role: ${role}, Photo: google_avatar_${prefix}.png`;
      console.log(logMsg);
    }

    setCurrentUser(resolvedUser);
    
    // Simulate logging to Firestore audit log
    addAuditLog('Google Login', `Signed in via Google Authentication (${formattedEmail}). Saved profile data UID: ${formattedEmail}, Name: ${name}, Role: ${resolvedUser.role} down to Cloud Firestore`);
    triggerNotification('Google Login สำเร็จ', `ยินดีต้อนรับคุณ ${resolvedUser.name} (${resolvedUser.role}) ด้วยบัญชี Google Workspace!`, 'success');
    setCurrentView('dashboard');
    setShowGoogleModal(false);
  };

  // Shared notification configuration states
  const [lineConfig, setLineConfig] = useState<LINEConfig>({
    isEnabled: true,
    token: 'LN_MMS_DEV_TOKEN_2026_X',
    recipientGroup: 'สตาฟช่างแผนกบำรุงรักษา A',
    apiMode: 'notify',
    channelAccessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJsaW5lIiwiZXhwIjoxNzgxNTUwMjAwfQ.example_token_mms',
    toUserIdOrGroupId: 'C8a9d18080c3b035fd771234abcd5678'
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
    setNotifications(prev => {
      const next = [newAlert, ...prev];
      saveDocument('notifications', newAlert).catch(console.error);
      return next;
    });

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
    setAuditLogs(prev => {
      const next = [newLog, ...prev];
      saveDocument('audit_logs', newLog).catch(console.error);
      return next;
    });
  };

  // Core LINE Notification Trigger
  const triggerLineAlert = (
    eventType: 'breakdown' | 'work_order_assign' | 'work_order_complete' | 'pm_done' | 'general',
    data: any
  ) => {
    sendLineAlert(lineConfig, eventType, data)
      .then(res => {
        if (res.success) {
          console.log('[LINE Alert SUCCESS]', res.message);
        } else {
          console.warn('[LINE Alert BYPASSED/DISABLED]', res.message);
        }
      })
      .catch(err => {
        console.error('[LINE Alert ERROR]', err);
      });
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

  if (loadingFirebase) {
    return (
      <div className="min-h-screen bg-slate-950 text-emerald-400 flex flex-col justify-center items-center p-6 font-mono select-none">
        <div className="w-full max-w-sm bg-zinc-900 border border-emerald-500/30 rounded-lg p-6 shadow-[0_0_50px_rgba(16,185,129,0.1)] space-y-4">
          <div className="flex items-center gap-3 border-b border-emerald-500/20 pb-3">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="font-sans font-black tracking-wider text-white text-[10px] bg-emerald-600 px-2 py-0.5 rounded">IDEVA-OS GATEWAY</span>
            <span className="text-emerald-500/60 text-[9px] ml-auto">EST. 2026</span>
          </div>
          <div className="space-y-1 text-[11px]">
            <p className="text-white font-bold animate-pulse">ideva-os-cmms Terminal Booting...</p>
            <p className="text-emerald-500/80">Connecting cloud core: <span className="text-blue-400">ideva-os-cmms</span></p>
            <p className="text-emerald-500/80">Firestore DB: <span className="text-orange-400">ai-studio-maintenancemanag...</span></p>
            <p className="text-emerald-500/50">Status: BINDING ENCRYPTION KEY... SUCCESS</p>
            <p className="text-emerald-500/50">Loading dataset collections: [users, machines, repair, pm, parts]</p>
          </div>
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden relative">
            <div className="h-full bg-emerald-500 rounded-full w-2/3 animate-pulse"></div>
          </div>
          <div className="flex justify-between items-center text-[9px] text-emerald-500/60 pt-1">
            <span>SYS STATUS: SECURED</span>
            <span className="animate-pulse">BOOTING INTEGRATION...</span>
          </div>
        </div>
      </div>
    );
  }

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

              <div className="flex items-center justify-center my-2.5 text-zinc-500 font-bold text-[10px]">
                <div className="border-t border-zinc-700 flex-1"></div>
                <span className="px-2.5">หรือเข้าผ่าน GOOGLE AUTHENTICATION</span>
                <div className="border-t border-zinc-700 flex-1"></div>
              </div>

              <button
                type="button"
                onClick={() => setShowGoogleModal(true)}
                className="w-full py-2.5 bg-white hover:bg-gray-100 text-gray-900 font-bold rounded shadow-md border border-gray-300 transition-all cursor-pointer flex items-center justify-center gap-2 font-sans"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>Sign in with Google GMail</span>
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

          {/* Google Account Selection Popup Simulator */}
          {showGoogleModal && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
              <div className="bg-white text-zinc-800 rounded-lg shadow-2xl max-w-sm w-full border-t-4 border-blue-600 overflow-hidden text-xs">
                
                {/* Google Sign-In Header */}
                <div className="p-5 text-center border-b border-gray-100">
                  <div className="flex justify-center mb-1">
                    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm">ลงชื่อเข้าใช้ด้วย Google</h4>
                  <p className="text-gray-500 text-[11px] mt-0.5">เพื่อดำเนินการต่อยัง <strong>ideva-os-cmms</strong></p>
                </div>

                {/* Account list */}
                <div className="p-4 space-y-2.5">
                  <span className="text-gray-400 font-bold block text-[10px] uppercase tracking-wider">บัญชีที่ลงทะเบียนในอุปกรณ์:</span>
                  
                  <button
                    onClick={() => handleGoogleLogin('appid.artkitthana@gmail.com', 'Art Kitthana', 'Admin')}
                    className="w-full p-2.5 rounded border border-gray-250 hover:bg-blue-50/50 hover:border-blue-400 text-left transition flex items-center gap-3"
                  >
                    <div className="h-8 w-8 rounded-full bg-red-55/10 border text-red-600 font-bold flex items-center justify-center uppercase">
                      AK
                    </div>
                    <div>
                      <span className="font-bold text-gray-800 block">Art Kitthana</span>
                      <span className="text-gray-500 text-[10px]">appid.artkitthana@gmail.com (Role: Admin)</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleGoogleLogin('manager.ideva@gmail.com', 'Somchai Manager', 'Supervisor')}
                    className="w-full p-2.5 rounded border border-gray-250 hover:bg-blue-50/50 hover:border-blue-400 text-left transition flex items-center gap-3"
                  >
                    <div className="h-8 w-8 rounded-full bg-orange-55/10 border text-orange-600 font-bold flex items-center justify-center uppercase">
                      SM
                    </div>
                    <div>
                      <span className="font-bold text-gray-800 block">Somchai Manager</span>
                      <span className="text-gray-500 text-[10px]">manager.ideva@gmail.com (Role: Supervisor)</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleGoogleLogin('engineer.wichai@gmail.com', 'Wichai Engineer', 'Technician')}
                    className="w-full p-2.5 rounded border border-gray-250 hover:bg-blue-50/50 hover:border-blue-400 text-left transition flex items-center gap-3"
                  >
                    <div className="h-8 w-8 rounded-full bg-blue-55/10 border text-blue-600 font-bold flex items-center justify-center uppercase">
                      WE
                    </div>
                    <div>
                      <span className="font-bold text-gray-800 block">Wichai Engineer</span>
                      <span className="text-gray-500 text-[10px]">engineer.wichai@gmail.com (Role: Technician)</span>
                    </div>
                  </button>

                  {/* Manual input */}
                  <div className="border-t pt-3 mt-1.5 space-y-2">
                    <span className="text-gray-400 font-bold block text-[10px] uppercase tracking-wider">ใช้บัญชีอื่น (Auto-create in Firestore):</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="ชื่อ-นามสกุล..."
                        value={customGmailName}
                        onChange={(e) => setCustomGmailName(e.target.value)}
                        className="rounded border border-gray-300 p-2 text-xs text-gray-900 bg-white"
                      />
                      <select
                        value={customGmailRole}
                        onChange={(e) => setCustomGmailRole(e.target.value as UserRole)}
                        className="rounded border border-gray-300 p-2 text-xs text-gray-900 bg-white"
                      >
                        <option value="Admin">ผู้ดูแลระบบ (Admin)</option>
                        <option value="Supervisor">ผู้ตรวจสอบ (Supervisor)</option>
                        <option value="Technician">ช่างเทคนิค (Technician)</option>
                        <option value="User">ผู้แจ้งทั่วไป (User)</option>
                      </select>
                    </div>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="กรอกบัญชี @gmail.com ใดๆ..."
                        value={customGmail}
                        onChange={(e) => setCustomGmail(e.target.value)}
                        className="w-full rounded border border-gray-300 p-2 pr-12 text-xs text-gray-900 bg-white"
                      />
                      <button
                        onClick={() => {
                          if (!customGmail.trim() || !customGmail.toLowerCase().endsWith('@gmail.com')) {
                            alert('กรุณากรอก Gmail ที่ลงท้ายด้วย @gmail.com เท่านั้น!');
                            return;
                          }
                          handleGoogleLogin(customGmail, customGmailName || customGmail.split('@')[0], customGmailRole);
                        }}
                        className="absolute right-1 top-1 bg-blue-600 hover:bg-blue-750 text-white font-bold px-2 py-1 rounded text-[10.5px]"
                      >
                        ถัดไป
                      </button>
                    </div>
                  </div>

                </div>

                {/* Footer Cancel */}
                <div className="bg-gray-50 p-3.5 border-t border-gray-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowGoogleModal(false)}
                    className="text-gray-500 hover:text-gray-800 font-bold cursor-pointer text-xs"
                  >
                    ยกเลิก
                  </button>
                </div>

              </div>
            </div>
          )}

          <span className="text-[10.2px] text-zinc-500 mt-4">ideva-os-cmms Plant Gate Terminal. Standard Operating System 2026.</span>
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
              setMachines={handleSetMachines}
              currentUserRole={currentUser.role}
              addAuditLog={addAuditLog}
              triggerNotification={triggerNotification}
            />
          )}

          {currentView === 'repair' && (
            <RepairRequestsView
              requests={repairRequests}
              setRequests={handleSetRepairRequests}
              machines={machines}
              currentUserRole={currentUser.role}
              currentUserName={currentUser.name}
              addAuditLog={addAuditLog}
              triggerNotification={triggerNotification}
              triggerLineAlert={triggerLineAlert}
              onNavigateToWorkOrderWithReq={handleNavigateToWorkOrderWithReq}
            />
          )}

          {currentView === 'workorder' && (
            <WorkOrdersView
              workOrders={workOrders}
              setWorkOrders={handleSetWorkOrders}
              requests={repairRequests}
              setRequests={handleSetRepairRequests}
              machines={machines}
              setMachines={handleSetMachines}
              spareParts={spareParts}
              setSpareParts={handleSetSpareParts}
              addAuditLog={addAuditLog}
              triggerNotification={triggerNotification}
              triggerLineAlert={triggerLineAlert}
              currentUserRole={currentUser.role}
              currentUserName={currentUser.name}
              autoSelectRequestId={autoSelectRequestId}
              clearAutoSelectRequest={() => setAutoSelectRequestId(undefined)}
              setTransactions={handleSetTransactions}
              transactions={transactions}
            />
          )}

          {currentView === 'spareparts' && (
            <SparePartsView
              spareParts={spareParts}
              setSpareParts={handleSetSpareParts}
              transactions={transactions}
              setTransactions={handleSetTransactions}
              currentUserRole={currentUser.role}
              currentUserName={currentUser.name}
              addAuditLog={addAuditLog}
              triggerNotification={triggerNotification}
            />
          )}

          {currentView === 'pm' && (
            <PMView
              pmPlans={pmPlans}
              setPmPlans={handleSetPmPlans}
              schedules={pmSchedules}
              setSchedules={handleSetPmSchedules}
              machines={machines}
              currentUserRole={currentUser.role}
              addAuditLog={addAuditLog}
              triggerNotification={triggerNotification}
              triggerLineAlert={triggerLineAlert}
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
              setUsers={handleSetUsers}
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
