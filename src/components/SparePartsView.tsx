/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SparePart, SpareTransaction, UserRole } from '../types';
import { Settings, Search, PlusCircle, MinusCircle, ShieldAlert, Logs, Archive, RefreshCcw } from 'lucide-react';

interface SparePartsViewProps {
  spareParts: SparePart[];
  setSpareParts: React.Dispatch<React.SetStateAction<SparePart[]>>;
  transactions: SpareTransaction[];
  setTransactions: React.Dispatch<React.SetStateAction<SpareTransaction[]>>;
  currentUserRole: UserRole;
  currentUserName: string;
  addAuditLog: (action: string, details: string) => void;
  triggerNotification: (title: string, message: string, type: 'info' | 'warning' | 'danger' | 'success') => void;
}

export default function SparePartsView({
  spareParts,
  setSpareParts,
  transactions,
  setTransactions,
  currentUserRole,
  currentUserName,
  addAuditLog,
  triggerNotification
}: SparePartsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'inventory' | 'history'>('inventory');
  
  // Selection states for transaction logs
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null);
  const [txType, setTxType] = useState<'IN' | 'OUT'>('IN');
  const [txQty, setTxQty] = useState(1);
  const [refNo, setRefNo] = useState('');
  const [remarks, setRemarks] = useState('');

  // Add parts state
  const [showAddPartModal, setShowAddPartModal] = useState(false);
  const [newPartName, setNewPartName] = useState('');
  const [newPartCategory, setNewPartCategory] = useState('Bearing');
  const [newPartQty, setNewPartQty] = useState(10);
  const [newPartMin, setNewPartMin] = useState(5);
  const [newPartUnit, setNewPartUnit] = useState('ชิ้น');
  const [newPartPrice, setNewPartPrice] = useState(150);

  const filteredParts = spareParts.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPart || txQty <= 0) return;

    // Permissions check
    if (txType === 'IN' && currentUserRole !== 'Admin' && currentUserRole !== 'Supervisor') {
      alert('เฉพาะ Admin หรือ Supervisor เท่านั้นที่มีสิทธิ์ลงประวัติการ "รับอะไหล่เข้าคลัง" สต็อก!');
      return;
    }

    if (txType === 'OUT' && (currentUserRole === 'User')) {
      alert('เฉพาะช่างเทคนิค ซูเปอร์ไวเซอร์ และแอดมินเท่านั้นที่จะได้รับอนุมัติให้ "เบิกอะไหล่"!');
      return;
    }

    // Stock verification on WITHDRAW
    if (txType === 'OUT' && selectedPart.quantity < txQty) {
      alert(`ข้อผิดพลาด: อะไหล่ในคลังมีเพียง ${selectedPart.quantity} ${selectedPart.unit} ซึ่งน้อยกว่าที่จะทำรายการเบิก (${txQty} ${selectedPart.unit})!`);
      return;
    }

    // 1. Update stock
    const qtyModifier = txType === 'IN' ? txQty : -txQty;
    setSpareParts(prev => prev.map(p => {
      if (p.id === selectedPart.id) {
        const nextQty = p.quantity + qtyModifier;
        
        // Notify if below critical levels
        if (nextQty <= p.minQuantity) {
          triggerNotification(
            'สต็อกอะไหล่ต่ำกว่าระดับปลอดภัย', 
            `อะไหล่ "${p.name}" เหลือปริมาณเพียง ${nextQty} ${p.unit} (ขั้นต่ำกระตุ้นสั่งซื้อคือ ${p.minQuantity})`,
            'danger'
          );
        }
        return { ...p, quantity: nextQty };
      }
      return p;
    }));

    // 2. Log transactions
    const txId = `TX-${String(transactions.length + 1).padStart(4, '0')}`;
    const newTx: SpareTransaction = {
      id: txId,
      partId: selectedPart.id,
      transactionType: txType,
      quantity: txQty,
      date: new Date('2026-06-10').toISOString().split('T')[0],
      referenceNo: refNo || 'INV-MANUAL',
      recordedBy: currentUserName,
      remarks: remarks || 'บันทึกสต็อกตรงจากผู้ดูแล'
    };
    setTransactions(prev => [newTx, ...prev]);

    // 3. Audit trail
    const auditMsg = txType === 'IN' ? 'Restock' : 'Withdraw';
    addAuditLog('Spare Part Transaction', `${auditMsg} ${txQty} of ${selectedPart.name} (${selectedPart.id}). Ref No: ${refNo}`);
    triggerNotification('ดำเนินการราบรื่น', `เสร็จสิ้นการบันทึกคลังอะไหล่เรียบร้อย`, 'success');

    // Close and reset
    setSelectedPart(null);
    setTxQty(1);
    setRefNo('');
    setRemarks('');
  };

  const handleAddNewPart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartName) return;

    if (currentUserRole !== 'Admin' && currentUserRole !== 'Supervisor') {
      alert('เฉพาะเจ้าหน้าที่สิทธิ์แอดมินหรือหัวหน้างานฝ่ายพัสดุเท่านั้นที่ลงบันทักพาร์ตอะไหล่ชิพชุดใหม่!');
      return;
    }

    const nextId = `SP-${newPartCategory.slice(0, 3).toUpperCase()}-${String(spareParts.length + 1).padStart(2, '0')}`;
    const newPart: SparePart = {
      id: nextId,
      name: newPartName,
      category: newPartCategory,
      quantity: newPartQty,
      minQuantity: newPartMin,
      unit: newPartUnit,
      unitPrice: newPartPrice
    };

    setSpareParts(prev => [...prev, newPart]);
    addAuditLog('Register Spare Part', `Registered new spare part SKU: ${nextId} - ${newPartName}`);
    triggerNotification('เพิ่มพิกัดอะไหล่สำเร็จ', `ลงชื่อรหัส SKU: ${nextId} เข้าสู่ระบบเรียบร้อย`, 'success');
    setShowAddPartModal(false);

    // reset Form
    setNewPartName('');
    setNewPartQty(10);
    setNewPartMin(3);
    setNewPartPrice(150);
  };

  return (
    <div className="space-y-6" id="spare-parts-main">
      {/* Search and Action Bar */}
      <div className="flex flex-wrap justify-between items-center bg-white dark:bg-zinc-800 p-4 rounded-md shadow-sm border border-gray-100 dark:border-zinc-700 gap-4">
        <div className="flex items-center gap-3">
          <Archive className="h-5 w-5 text-orange-500" />
          <h3 className="text-base font-bold text-gray-800 dark:text-zinc-100 font-sans">
            คลังพัสดุอะไหล่ซ่อมบำรุง (Spare Parts & Inventory)
          </h3>

          <div className="bg-gray-100 dark:bg-zinc-700 p-0.5 rounded flex text-xs">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3.5 py-1 rounded transition-all ${
                activeTab === 'inventory' ? 'bg-orange-500 text-white font-bold' : 'text-gray-600 dark:text-zinc-300'
              }`}
            >
              พัสดุคงคลัง
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1 rounded transition-all ${
                activeTab === 'history' ? 'bg-orange-500 text-white font-bold' : 'text-gray-600 dark:text-zinc-300'
              }`}
            >
              ประวัติเบิกสะสม
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <input
              type="text"
              placeholder="ค้นหาชื่ออะไหล่ หรือ SKU พาร์ต..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs rounded border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 p-2 pl-8 text-gray-900 dark:text-zinc-100"
            />
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-3 text-gray-400" />
          </div>

          {(currentUserRole === 'Admin' || currentUserRole === 'Supervisor') && (
            <button
              onClick={() => setShowAddPartModal(true)}
              className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>รหัสสินค้าใหม่</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'inventory' ? (
        /* Inventory List Table */
        <div className="card shadow-md bg-white dark:bg-zinc-800 rounded-md border border-gray-100 dark:border-zinc-700 overflow-hidden font-sans">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
              <thead className="bg-gray-50 dark:bg-zinc-800/60 text-gray-500 dark:text-zinc-400">
                <tr>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider">รหัสอะไหล่</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider">ชื่ออุปกรณ์อะไหล่</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider">หมวดหมู่</th>
                  <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-wider">จำนวนคงเหลือ</th>
                  <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-wider">เกณฑ์ความปลอดภัย</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider">ราคาต่อหน่วย</th>
                  <th className="px-5 py-3 text-center text-[11px] font-bold uppercase tracking-wider">สถานะสต็อก</th>
                  {currentUserRole !== 'User' && <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider">ทำรายการ</th>}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-800 divide-y divide-gray-100 dark:divide-zinc-700/60 text-xs text-gray-700 dark:text-zinc-200">
                {filteredParts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-400">🚨 ไม่พบรายการอะไหล่ในคลังจัดเก็บของคุณ</td>
                  </tr>
                ) : (
                  filteredParts.map(part => {
                    const isBelowMin = part.quantity <= part.minQuantity;
                    return (
                      <tr key={part.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/20">
                        <td className="px-5 py-3 whitespace-nowrap font-mono font-bold text-gray-900 dark:text-gray-100">{part.id}</td>
                        <td className="px-5 py-3 font-semibold text-gray-800 dark:text-zinc-100">{part.name}</td>
                        <td className="px-5 py-3 whitespace-nowrap text-gray-500 dark:text-zinc-400">{part.category}</td>
                        <td className="px-5 py-3 text-center whitespace-nowrap font-bold text-sm text-gray-900 dark:text-zinc-100">
                          {part.quantity} <span className="text-gray-400 text-xs font-normal">{part.unit}</span>
                        </td>
                        <td className="px-5 py-3 text-center whitespace-nowrap font-mono text-gray-500 dark:text-zinc-400">
                          {part.minQuantity} {part.unit}
                        </td>
                        <td className="px-5 py-3 text-right whitespace-nowrap font-mono font-bold">
                          ฿{part.unitPrice.toLocaleString('th-TH')}
                        </td>
                        <td className="px-5 py-3 text-center whitespace-nowrap">
                          {isBelowMin ? (
                            <span className="bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 text-[10px] px-2 py-0.5 rounded font-bold inline-flex items-center gap-1">
                              <ShieldAlert className="h-3 w-3" />
                              สต็อกวิกฤต (Low)
                            </span>
                          ) : (
                            <span className="bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-300 text-[10px] px-2 py-0.5 rounded font-bold">
                              ระดับปกติ
                            </span>
                          )}
                        </td>
                        {currentUserRole !== 'User' && (
                          <td className="px-5 py-3 whitespace-nowrap text-right space-x-1.5Packed">
                            <button
                              onClick={() => {
                                setSelectedPart(part);
                                setTxType('IN');
                                setTxQty(5);
                              }}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-green-950/30 dark:text-green-400 rounded text-[11px] font-bold cursor-pointer"
                              title="เพิ่มอะไหล่ (รับเข้า)"
                            >
                              + รับเข้า
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPart(part);
                                setTxType('OUT');
                                setTxQty(1);
                              }}
                              className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400 rounded text-[11px] font-bold cursor-pointer"
                              title="เบิกใช้อะไหล่"
                            >
                              - เบิกออก
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Part transactions history */
        <div className="card shadow-md bg-white dark:bg-zinc-800 rounded-md border border-gray-100 dark:border-zinc-700 overflow-hidden font-sans">
          <div className="p-4 bg-gray-50 dark:bg-zinc-800/40 border-b border-gray-100 dark:divide-zinc-700/65 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-zinc-400 flex items-center gap-1">
              <Logs className="h-4 w-4" /> ประวัติการรับเข้าและตัดยอดสต็อกพัสดุ (Auto Ledger Log)
            </span>
            <span className="text-gray-400 text-[10px]">บันทึกข้อมูลเรียงตามล่าสุด</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
              <thead className="bg-[#fcfcfc] dark:bg-zinc-800/30 text-gray-500">
                <tr>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase">รหัสล็อค</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase">สินค้าเป้าหมาย</th>
                  <th className="px-5 py-3 text-center text-[11px] font-bold uppercase">รายการ</th>
                  <th className="px-5 py-3 text-center text-[11px] font-bold uppercase">จำนวน</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase">วันที่ทำรายการ</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase">เลขที่อ้างอิง (Ref)</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase">ผู้บันทึก</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold">หมายเหตุ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-700 text-xs text-zinc-600 dark:text-zinc-300">
                {transactions.map(tx => {
                  const part = spareParts.find(p => p.id === tx.partId);
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-700/10">
                      <td className="px-5 py-3 font-mono text-zinc-400">{tx.id}</td>
                      <td className="px-5 py-3 font-semibold">
                        {part ? `${part.name} (${tx.partId})` : `ไม่พบอะไหล่ (${tx.partId})`}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.transactionType === 'IN' 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                        }`}>
                          {tx.transactionType === 'IN' ? 'รับพัสดุเข้า' : 'เบิกตัดสต็อก'}
                        </span>
                      </td>
                      <td className={`px-5 py-3 text-center font-bold font-mono text-sm ${
                        tx.transactionType === 'IN' ? 'text-green-600' : 'text-red-500'
                      }`}>
                        {tx.transactionType === 'IN' ? `+${tx.quantity}` : `-${tx.quantity}`}
                      </td>
                      <td className="px-5 py-3 font-mono text-zinc-500">{tx.date}</td>
                      <td className="px-5 py-3 font-mono text-blue-500 font-bold">{tx.referenceNo}</td>
                      <td className="px-5 py-3 font-medium text-gray-800 dark:text-zinc-200">{tx.recordedBy}</td>
                      <td className="px-5 py-3 text-gray-400 italic text-[11px]">{tx.remarks}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* IN/OUT Transaction Form Modal */}
      {selectedPart && (
        <div className="fixed inset-0 bg-black/65 flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-sm w-full border-t-4 border-orange-500 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-zinc-700 flex justify-between items-center bg-gray-50 dark:bg-zinc-800/50">
              <h4 className="font-bold text-gray-800 dark:text-zinc-100 text-sm">
                ทำรายการสต็อก: {txType === 'IN' ? 'รับพัสดุอะไหล่เข้าคลัง' : 'เบิกชิ้นส่วนตัดคลัง'}
              </h4>
              <button onClick={() => setSelectedPart(null)} className="text-gray-400 hover:text-black dark:hover:text-white font-bold text-lg cursor-pointer">×</button>
            </div>

            <form onSubmit={handleTransactionSubmit} className="p-5 space-y-4 text-xs text-gray-700 dark:text-zinc-300">
              <div className="p-3 bg-gray-50 dark:bg-zinc-900 rounded border">
                <span className="text-gray-400 block mb-0.5">พัสดุเป้าหมาย:</span>
                <span className="font-bold text-gray-900 dark:text-white text-xs">{selectedPart.name}</span>
                <div className="flex justify-between items-center mt-2 pt-2 border-t text-[10px]">
                  <span>คงเหลือปัจจุบัน: <strong>{selectedPart.quantity} {selectedPart.unit}</strong></span>
                  <span>ราคา/หน่วย: <strong>฿{selectedPart.unitPrice}</strong></span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold">ป้อนจำนวน ({selectedPart.unit})</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={txQty}
                    onChange={(e) => setTxQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold">เลขที่อ้างอิง (Ref No.)</label>
                  <input
                    type="text"
                    required
                    value={refNo}
                    onChange={(e) => setRefNo(e.target.value)}
                    placeholder={txType === 'IN' ? 'เช่น PO-7712' : 'เช่น WO-2026-X'}
                    className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold">บันทึกเพิ่มเติม (วัตถุประสงค์)</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="เช่น ตึกซ่อมบำรุงเปลี่ยนทดแทนมอเตอร์"
                  className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-xs text-gray-900 dark:text-zinc-100"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-zinc-700 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedPart(null)}
                  className="px-4 py-2 bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 rounded font-bold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white rounded font-bold shadow-sm cursor-pointer ${
                    txType === 'IN' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {txType === 'IN' ? 'ยืนยันรับเข้าสต็อก' : 'อนุมัติเบิกพัสดุ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Part Add Schema Modal */}
      {showAddPartModal && (
        <div className="fixed inset-0 bg-black/65 flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-sm w-full border-t-4 border-orange-500 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-zinc-700 flex justify-between items-center bg-gray-50 dark:bg-zinc-800/50">
              <h4 className="font-bold text-gray-800 dark:text-zinc-100 text-sm">ลงทะเบียนระบุอะไหล่ชนิดใหม่คลัง</h4>
              <button onClick={() => setShowAddPartModal(false)} className="text-gray-400 hover:text-black dark:hover:text-white font-bold text-lg cursor-pointer">×</button>
            </div>

            <form onSubmit={handleAddNewPart} className="p-5 space-y-3.5 text-xs text-gray-700 dark:text-zinc-300">
              <div className="space-y-1">
                <label className="block font-bold">ชื่ออะไหล่ชิ้นส่วน (ชื่อเต็มยี่ห้อ)</label>
                <input
                  type="text"
                  required
                  value={newPartName}
                  onChange={(e) => setNewPartName(e.target.value)}
                  placeholder="เช่น มอเตอร์ไฟฟ้ากระแสสลับ Mitsubishi 3HP"
                  className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold">หมวดหมู่สินค้า</label>
                  <select
                    value={newPartCategory}
                    onChange={(e) => setNewPartCategory(e.target.value)}
                    className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 font-bold"
                  >
                    <option value="Mechanical Hardware">เครื่องยนต์ / สายพาน (Belt)</option>
                    <option value="Bearing">ตลับลูกปืน (Bearing)</option>
                    <option value="Sensor & Electronics">บอร์ดไฟฟ้า / เซกชั่น (Sensor)</option>
                    <option value="Filters">ไส้กรองอะไหล่ (Filters)</option>
                    <option value="Hydraulics">วาล์ว / ไฮดรอลิก (Hydraulic)</option>
                    <option value="Lubrications">สารหล่อลื่น / น้ำมัน (Lubricants)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold">หน่วยนับ</label>
                  <input
                    type="text"
                    required
                    value={newPartUnit}
                    onChange={(e) => setNewPartUnit(e.target.value)}
                    placeholder="ชิ้น / อัน / ถัง"
                    className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="block font-bold">เริ่มบรรจุ</label>
                  <input
                    type="number"
                    min={0}
                    value={newPartQty}
                    onChange={(e) => setNewPartQty(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold">จุดแจ้งซื้อ</label>
                  <input
                    type="number"
                    min={0}
                    value={newPartMin}
                    onChange={(e) => setNewPartMin(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold">ราคาเฉลี่ย/นับ</label>
                  <input
                    type="number"
                    min={0}
                    value={newPartPrice}
                    onChange={(e) => setNewPartPrice(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-zinc-700 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddPartModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 rounded font-bold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded font-bold shadow-sm cursor-pointer"
                >
                  บันทึกลง SKU คลัง
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
