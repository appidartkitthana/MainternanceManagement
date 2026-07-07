/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserRole, SystemNotification } from '../types';
import { 
  LayoutDashboard, Settings, Wrench, AlertCircle, Database, Shield, FileSpreadsheet, 
  Menu, Sun, Moon, Bell, LogOut, ChevronRight, User, Package, CalendarCheck, HelpCircle, Eye
} from 'lucide-react';

interface AdminLTELayoutProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  currentUserRole: UserRole;
  currentUserName: string;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onLogout: () => void;
  notifications: SystemNotification[];
  clearNotifications: () => void;
  children: React.ReactNode;
}

export default function AdminLTELayout({
  currentView,
  setCurrentView,
  currentUserRole,
  currentUserName,
  isDarkMode,
  setIsDarkMode,
  onLogout,
  notifications,
  clearNotifications,
  children
}: AdminLTELayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard ยุทธศาสตร์', icon: LayoutDashboard, minRole: 'User' },
    { id: 'machines', label: 'ทะเบียนเครื่องจักร', icon: Wrench, minRole: 'User' },
    { id: 'repair', label: 'แจ้งซ่อมเครื่องจักร', icon: AlertCircle, minRole: 'User' },
    { id: 'workorder', label: 'ใบสั่งซ่อมบำรุง (WO)', icon: Settings, minRole: 'User' },
    { id: 'spareparts', label: 'คลังอะไหล่สำรอง', icon: Package, minRole: 'User' },
    { id: 'pm', label: 'แผนบำรุงเชิงป้องกัน (PM)', icon: CalendarCheck, minRole: 'User' },
    { id: 'reports', label: 'สถิติ MTTR / MTBF', icon: FileSpreadsheet, minRole: 'User' },
    { id: 'users', label: 'ช่างซ่อม & บัญชีผู้ใช้', icon: User, minRole: 'Admin' },
    { id: 'notifications', label: 'ตั้งค่า LINE & SMTP', icon: Bell, minRole: 'Supervisor' },
    { id: 'schema', label: 'ERD / SQL Engine', icon: Database, minRole: 'User' }
  ];

  const hasAccess = (itemMinRole: string) => {
    if (currentUserRole === 'Admin') return true;
    if (currentUserRole === 'Supervisor') {
      return itemMinRole !== 'Admin';
    }
    if (currentUserRole === 'Technician') {
      return itemMinRole === 'User' || itemMinRole === 'Technician';
    }
    // User role
    return itemMinRole === 'User';
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'Admin': return 'bg-red-500 text-white';
      case 'Supervisor': return 'bg-orange-500 text-white';
      case 'Technician': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className={`min-h-screen text-xs flex flex-col font-sans transition-colors duration-200 ${
      isDarkMode ? 'dark bg-zinc-900 text-zinc-100' : 'bg-gray-100 text-zinc-900'
    }`} id="admin-lte-canvas">

      {/* Top Navbar */}
      <header className="h-14 border-b border-gray-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-800 flex items-center justify-between px-4 sticky top-0 z-40 shadow-xs">
        
        {/* Brand and toggle */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 hover:bg-gray-150 dark:hover:bg-zinc-700 rounded transition cursor-pointer"
            title="Toggle Sidebar"
          >
            <Menu className="h-4.5 w-4.5 text-gray-600 dark:text-zinc-300" />
          </button>

          <div className="flex items-center gap-2">
            <span className="p-1 px-2 bg-gradient-to-r from-blue-500 via-emerald-500 to-orange-500 text-white rounded font-mono font-black text-[12px] tracking-wide shadow-xs">
              IDEVA-OS
            </span>
            <span className="font-sans font-bold text-sm tracking-tight hidden sm:inline-block">
              Maintenance<span className="text-blue-500 dark:text-blue-400">IDEVA-OS</span> <span className="text-[10px] bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 px-1.5 py-0.5 rounded ml-1 font-mono">v1.2</span>
            </span>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-3.5">
          
          {/* Light / Dark selector button */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 hover:bg-gray-150 dark:hover:bg-zinc-750 rounded text-gray-500 dark:text-zinc-300 transition cursor-pointer"
            title="Theme switch"
          >
            {isDarkMode ? <Sun className="h-4.5 w-4.5 text-yellow-400" /> : <Moon className="h-4.5 w-4.5" />}
          </button>

          {/* Real-time active alerts pullout */}
          <div className="relative font-sans">
            <button
              onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
              className="p-2 hover:bg-gray-150 dark:hover:bg-zinc-750 rounded text-gray-500 dark:text-zinc-300 transition relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="h-4.5 w-4.5" />
              {notifications.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-bounce">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Pullout drawer overlay */}
            {showNotificationDropdown && (
              <div className="absolute right-0 mt-2.5 w-72 bg-white dark:bg-zinc-800 rounded-md border border-gray-200 dark:border-zinc-700 shadow-xl z-50 overflow-hidden animate-fade-in text-xs">
                <div className="p-3 bg-gray-50 dark:bg-zinc-900 border-b border-gray-150 dark:border-zinc-700 text-[11px] font-bold flex justify-between items-center">
                  <span className="text-gray-700 dark:text-zinc-200">LINE/Dashboard แจ้งเหตุ ({notifications.length})</span>
                  {notifications.length > 0 && (
                    <button 
                      onClick={() => {
                        clearNotifications();
                        setShowNotificationDropdown(false);
                      }}
                      className="text-xs text-blue-500 hover:underline cursor-pointer"
                    >
                      ล้างทั้งหมด
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-zinc-700/60 p-1 bg-white dark:bg-zinc-800/40">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 font-sans text-[11px]">ไม่มีหมวดแจ้งค้างระงับขณะนี้</div>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-2.5 text-[11px] rounded transition duration-150 hover:bg-gray-50 dark:hover:bg-zinc-700 flex flex-col gap-1 ${
                          n.type === 'danger' ? 'border-l-3 border-l-red-500' :
                          n.type === 'warning' ? 'border-l-3 border-l-orange-500' : 'border-l-3 border-l-blue-400'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-gray-800 dark:text-zinc-200 tracking-tight leading-none">{n.title}</span>
                          <span className="text-[9px] text-gray-455 font-mono">{n.timestamp.slice(11, 16)}</span>
                        </div>
                        <p className="text-gray-500 dark:text-zinc-400 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User profile avatar info badge */}
          <div className="flex items-center gap-2 border-l pl-3.5 border-gray-200/90 dark:border-zinc-700">
            <div className="h-7 w-7 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-gray-100 dark:ring-zinc-700 uppercase">
              {currentUserName.charAt(0)}
            </div>
            <div className="hidden md:block font-sans text-left">
              <span className="font-bold text-gray-800 dark:text-zinc-200 block text-[11px] leading-tight">{currentUserName}</span>
              <span className={`text-[8.5px] px-1 rounded block w-fit font-bold mt-0.5 ${getRoleBadgeColor(currentUserRole)}`}>
                {currentUserRole}
              </span>
            </div>
            
            <button
              onClick={onLogout}
              className="p-1 px-2 text-red-500 hover:bg-red-55/10 rounded font-bold cursor-pointer flex items-center gap-1 font-sans"
              title="ออกจากระบบ"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline text-[11px]">Logout</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Structural Body */}
      <div className="flex-1 flex" id="outer-flex-core">
        
        {/* Left Sidebar collapsing */}
        <aside className={`bg-[#2c333e] text-zinc-300 shrink-0 transition-all duration-200 hidden md:block select-none ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`} id="adminlte-sidebar">
          
          <div className="p-4 border-b border-zinc-700/60 flex items-center gap-3 font-sans">
            <div className="h-8 w-8 rounded bg-[#3b82f6] text-white flex items-center justify-center font-bold font-mono">
              IDEVA
            </div>
            {!sidebarCollapsed && (
              <div className="text-left leading-tight">
                <span className="font-bold text-zinc-100 block">IDEVA-OS CMMS</span>
                <span className="text-[9.5px] text-zinc-400 block tracking-widest uppercase">Plant Gateway v1.2</span>
              </div>
            )}
          </div>

          <nav className="p-3.5 space-y-1.5 font-sans">
            {menuItems.map(item => {
              if (!hasAccess(item.minRole)) return null;
              const IconComp = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded transition duration-150 text-[11px] font-bold text-left cursor-pointer ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'hover:bg-zinc-700/40 text-zinc-300'
                  }`}
                  title={item.label}
                >
                  <div className="flex items-center gap-3 truncate">
                    <IconComp className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-blue-400'}`} />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!sidebarCollapsed && isActive && <ChevronRight className="h-3.5 w-3.5 opacity-80" />}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content Viewframe container */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-y-auto max-w-full">
          {/* Breadcrumbs for ERP realism */}
          <div className="mb-4 flex flex-wrap justify-between items-center gap-2 font-sans text-[11.5px] text-zinc-400 dark:text-zinc-550 border-b pb-2 border-gray-150 dark:border-zinc-800">
            <div>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">โรงผลิตอุตสาหกรรม A-B</span>
              <span className="mx-2">/</span>
              <span className="text-blue-500 uppercase font-mono">{currentView} portal</span>
            </div>
            <span className="font-mono text-[10px] text-gray-400">DATABASE INTEGRITY: OK</span>
          </div>

          {children}
        </main>
      </div>

      {/* FOOTER BAR */}
      <footer className="bg-white dark:bg-zinc-850 border-t border-gray-100 dark:border-zinc-800 p-3 px-6 text-center text-[10px] text-gray-400 font-sans hidden md:block">
        <strong>Copyright &copy; 2026 <span className="text-blue-500 font-bold">MMS Enterprise Systems</span>.</strong> สงวนลิขสิทธิ์ความปลอดภัยอัจฉริยะประวิทยบริการ
      </footer>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      {/* "bottom navigation for the sidebar and larger touch targets for plant personnel." */}
      <div className="fixed bottom-0 inset-x-0 h-16 bg-white dark:bg-zinc-800 border-t border-gray-200 dark:border-zinc-700/80 grid grid-cols-5 items-center justify-center md:hidden z-40 px-1 font-sans">
        
        <button 
          onClick={() => setCurrentView('dashboard')}
          className={`flex flex-col items-center justify-center p-1 cursor-pointer rounded-md ${
            currentView === 'dashboard' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[9px] mt-1 font-bold">Dashboard</span>
        </button>

        <button 
          onClick={() => setCurrentView('machines')}
          className={`flex flex-col items-center justify-center p-1 cursor-pointer rounded-md ${
            currentView === 'machines' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
          }`}
        >
          <Wrench className="h-5 w-5" />
          <span className="text-[9px] mt-1 font-bold">เครื่องจักร</span>
        </button>

        <button 
          onClick={() => setCurrentView('repair')}
          className={`flex flex-col items-center justify-center p-1 cursor-pointer rounded-md ${
            currentView === 'repair' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
          }`}
        >
          <AlertCircle className="h-5 w-5" />
          <span className="text-[9px] mt-1 font-bold">แจ้งซ่อม</span>
        </button>

        <button 
          onClick={() => setCurrentView('workorder')}
          className={`flex flex-col items-center justify-center p-1 cursor-pointer rounded-md ${
            currentView === 'workorder' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
          }`}
        >
          <Settings className="h-5 w-5" />
          <span className="text-[9px] mt-1 font-bold">ใบสั่งซ่อม</span>
        </button>

        <button 
          onClick={() => setCurrentView('reports')}
          className={`flex flex-col items-center justify-center p-1 cursor-pointer rounded-md ${
            currentView === 'reports' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
          }`}
        >
          <FileSpreadsheet className="h-5 w-5" />
          <span className="text-[9px] mt-1 font-bold">รายงาน</span>
        </button>

      </div>

    </div>
  );
}
