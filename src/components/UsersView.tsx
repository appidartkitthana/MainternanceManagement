/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { UserPlus, Search, Edit2, Trash2, Key, Users, CheckCircle, XCircle } from 'lucide-react';

interface UsersViewProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  currentUserRole: UserRole;
  addAuditLog: (action: string, details: string) => void;
  triggerNotification: (title: string, message: string, type: 'info' | 'warning' | 'danger' | 'success') => void;
}

export default function UsersView({
  users,
  setUsers,
  currentUserRole,
  addAuditLog,
  triggerNotification
}: UsersViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form states
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('ฝ่ายผลิตไลน์ A');
  const [position, setPosition] = useState('');
  const [role, setRole] = useState<UserRole>('User');
  const [isActive, setIsActive] = useState(true);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingUser(null);
    setUsername('');
    setName('');
    setDepartment('ฝ่ายผลิตไลน์ A');
    setPosition('');
    setRole('User');
    setIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setUsername(user.username);
    setName(user.name);
    setDepartment(user.department);
    setPosition(user.position);
    setRole(user.role);
    setIsActive(user.isActive);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUserRole !== 'Admin') {
      alert('เฉพาะผู้ใช้สิทธิ์ Admin เท่านั้นที่สามารถจัดสรรหรือแก้ไขสิทธิ์ผู้ใช้งานได้!');
      return;
    }

    if (editingUser) {
      // Edit
      setUsers(prev => prev.map(u => u.id === editingUser.id ? {
        ...u, username, name, department, position, role, isActive
      } : u));
      addAuditLog('Edit User Profile', `Modified User ${username} (${name}). Role: ${role}. Active: ${isActive}`);
      triggerNotification('ปรับเปลี่ยนข้อมูลสำเร็จ', `แก้ไขบัญชีผู้ใช้ ${name} เรียบร้อย`, 'success');
    } else {
      // Add new
      const nextId = `U${String(users.length + 1).padStart(3, '0')}`;
      const newUser: User = {
        id: nextId,
        username,
        name,
        department,
        position,
        role,
        isActive
      };
      setUsers(prev => [...prev, newUser]);
      addAuditLog('Add New User', `Created account ${username} for ${name} in role ${role}`);
      triggerNotification('ลงทะเบียนสำเร็จ', `เพิ่มบัญชีผู้ใช้งานใหม่ ${name} ลงตาราง`, 'success');
    }
    setShowModal(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (currentUserRole !== 'Admin') {
      alert('เฉพาะผู้ปฏิบัติการสิทธิ์ Admin เท่านั้นที่ได้รับการยินยอมให้ลบรายชื่อได้!');
      return;
    }
    if (window.confirm(`คุณแน่ใจว่าต้องการลบบัญชีผู้ใช้งาน "${name}" หรือไม่? การลบนี้เป็นความเสี่ยงระยะยาว`)) {
      setUsers(prev => prev.filter(u => u.id !== id));
      addAuditLog('Delete User', `Removed user profile: ${name} (ID: ${id})`);
      triggerNotification('ลบผู้ใช้สำเร็จ', `ลบสิทธิ์ใช้งานของ ${name} ออกจากฐานข้อมูลโรงงานแล้ว`, 'warning');
    }
  };

  return (
    <div className="space-y-6" id="users-view-main">
      {/* Top action row */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white dark:bg-zinc-800 p-4 rounded-md shadow-sm border border-gray-100 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          <h3 className="text-base font-bold text-gray-800 dark:text-zinc-100 font-sans">ทะเบียนผู้ใช้งาน & สิทธิ์ใช้งาน (Users & Roles)</h3>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <input
              type="text"
              placeholder="ค้นหาผู้ใช้ แผนก หรือตำแหน่ง..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs rounded border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 p-2 pl-8 text-gray-900 dark:text-zinc-100"
            />
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-3 text-gray-400" />
          </div>

          {currentUserRole === 'Admin' && (
            <button
              onClick={openAddModal}
              className="px-3.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              <span>เพิ่มผู้ใช้งาน</span>
            </button>
          )}
        </div>
      </div>

      {/* Role permission info banner */}
      <div className="p-3 bg-blue-50/50 dark:bg-zinc-800/40 border-l-4 border-blue-500 rounded text-xs text-gray-600 dark:text-zinc-300 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <span className="font-bold text-blue-700 dark:text-blue-400 font-sans">🔑 Admin:</span> ดูแลระบบรอบด้าน ปรับปรุงผู้ใช้ บันทึก SQL Schema ตรวจตั้งตาราง
        </div>
        <div>
          <span className="font-bold text-green-700 dark:text-green-400 font-sans">🛠️ Supervisor:</span> จัดการเครื่องจักร อนุมัติ PM และมอบหมายงานช่างซ่อม
        </div>
        <div>
          <span className="font-bold text-orange-700 dark:text-orange-400 font-sans">⚡ Technician:</span> วินิจฉัยวิเคราะห์ ดำเนินการ และลงบันทึกอะไหล่ปิดงานซ่อม
        </div>
        <div>
          <span className="font-bold text-indigo-700 dark:text-indigo-400 font-sans">👤 User (Operator):</span> พนักงานไลน์คอยสอดส่องและกรอกสลิป "ใบแจ้งซ่อม"
        </div>
      </div>

      {/* Main Grid table */}
      <div className="card shadow-md bg-white dark:bg-zinc-800 rounded-md border border-gray-100 dark:border-zinc-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700 font-sans">
            <thead className="bg-gray-50 dark:bg-zinc-800/50">
              <tr>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">รหัส</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">ชื่อบัญชีผู้ใช้</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">ชื่อ-นามสกุล</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">แผนก</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">ตำแหน่งหน้าที่</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">บทบาทสิทธิ์ (Role)</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">สถานะ</th>
                {currentUserRole === 'Admin' && <th className="px-5 py-3 text-right text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">จัดการ</th>}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-zinc-800 divide-y divide-gray-100 dark:divide-zinc-700/60 text-xs text-gray-700 dark:text-zinc-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-400">🚨 ไม่พบรายชื่อผู้ใช้งานตรงตามความต้องการ</td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/30 transition-colors">
                    <td className="px-5 py-3 whitespace-nowrap font-mono font-bold text-gray-900 dark:text-gray-100">{user.id}</td>
                    <td className="px-5 py-3 whitespace-nowrap font-mono text-zinc-600 dark:text-zinc-300">@{user.username}</td>
                    <td className="px-5 py-3 whitespace-nowrap font-bold">{user.name}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-gray-500 dark:text-zinc-400">{user.department}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-gray-500 dark:text-zinc-400">{user.position}</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        user.role === 'Admin' ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300' :
                        user.role === 'Supervisor' ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300' :
                        user.role === 'Technician' ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className="flex items-center gap-1 font-sans">
                        {user.isActive ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-green-600 dark:text-green-400 font-medium">เปิดใช้งาน</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-red-400" />
                            <span className="text-red-500 dark:text-red-400 font-medium font-sans">ระงับสิทธิ์</span>
                          </>
                        )}
                      </span>
                    </td>
                    {currentUserRole === 'Admin' && (
                      <td className="px-5 py-3 whitespace-nowrap text-right space-x-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1 px-2 hover:bg-gray-100 dark:hover:bg-zinc-700 text-blue-500 dark:text-blue-400 rounded inline-flex items-center gap-1 transition shadow-xs cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>แก้ไข</span>
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          className="p-1 px-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 dark:text-red-400 rounded inline-flex items-center gap-1 transition shadow-xs cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>ลบ</span>
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/65 flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-md w-full border-t-4 border-blue-500 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-zinc-700 flex justify-between items-center bg-gray-50 dark:bg-zinc-800/50">
              <h4 className="font-bold text-gray-800 dark:text-zinc-100 text-sm">
                {editingUser ? `แก้ไขบัญชีผู้ใช้งาน: ${editingUser.name}` : 'เพิ่มผู้ใช้งานระบบโรงงานใหม่'}
              </h4>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black dark:hover:text-white font-bold text-lg cursor-pointer">×</button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs text-gray-700 dark:text-zinc-300">
              <div className="space-y-1">
                <label className="block font-bold">ชื่อบัญชีผู้ใช้งาน (Username - ภาษาอังกฤษ)</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="เช่น tech_worakit"
                  className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5"
                  disabled={!!editingUser}
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold">ชื่อ - นามสกุลจริง (ภาษาไทย)</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น วรดิตถ์ เกียรติเกรียงไกร"
                  className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold">แผนกสังกัด</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5"
                  >
                    <option value="ฝ่ายผลิตไลน์ A">ฝ่ายผลิตไลน์ A</option>
                    <option value="ฝ่ายแปรรูปและหลอม (Line B)">ฝ่ายแปรรูปและหลอม (Line B)</option>
                    <option value="ฝ่ายบรรจุภัณฑ์และห่อ">ฝ่ายบรรจุภัณฑ์และห่อ</option>
                    <option value="ฝ่ายระบบสาธารณูปโภค (Utility)">ฝ่ายระบบสาธารณูปโภค (Utility)</option>
                    <option value="ฝ่ายวิศวกรรมซ่อมบำรุง">ฝ่ายวิศวกรรมซ่อมบำรุง</option>
                    <option value="ฝ่ายผลิตระบบบริหาร">ฝ่ายบริหารระบบIT</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold">ตำแหน่งงานประจำ</label>
                  <input
                    type="text"
                    required
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="เช่น Senior Operator"
                    className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold">สิทธิ์ดำเนินการในระบบ (Role)</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 font-bold"
                  >
                    <option value="User">User</option>
                    <option value="Technician">Technician</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold">สถานะบัญชี</label>
                  <select
                    value={isActive ? 'true' : 'false'}
                    onChange={(e) => setIsActive(e.target.value === 'true')}
                    className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5"
                  >
                    <option value="true">เปิดใช้งานปกติ</option>
                    <option value="false">ระงับสิทธิ์ชั่วคราว</option>
                  </select>
                </div>
              </div>

              {currentUserRole !== 'Admin' && (
                <p className="text-[10px] text-red-500 font-semibold font-sans mt-2">
                  ⚠️ คุณไม่ใช่สิทธิ์กลุ่ม Admin จะระดมเซฟบันทึกรายการข้อมูลนี้ไม่ได้
                </p>
              )}

              <div className="pt-4 border-t border-gray-100 dark:border-zinc-700 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 rounded font-bold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={currentUserRole !== 'Admin'}
                  className="px-5 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded font-bold shadow-sm cursor-pointer"
                >
                  {editingUser ? 'แก้ไขสิทธิ์' : 'เพิ่มผู้ใช้'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
