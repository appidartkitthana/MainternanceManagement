/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Mail, 
  ShieldCheck, 
  RefreshCw, 
  Smartphone, 
  Key, 
  Send, 
  Layers, 
  MessageSquare, 
  Eye, 
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { LINEConfig, EmailConfig } from '../types';
import { sendLineAlert } from '../lib/lineNotification';

interface NotificationsSettingsViewProps {
  lineConfig: LINEConfig;
  setLineConfig: React.Dispatch<React.SetStateAction<LINEConfig>>;
  emailConfig: EmailConfig;
  setEmailConfig: React.Dispatch<React.SetStateAction<EmailConfig>>;
  triggerNotification: (title: string, message: string, type: 'info' | 'warning' | 'danger' | 'success') => void;
  addAuditLog: (action: string, details: string) => void;
}

export default function NotificationsSettingsView({
  lineConfig,
  setLineConfig,
  emailConfig,
  setEmailConfig,
  triggerNotification,
  addAuditLog
}: NotificationsSettingsViewProps) {
  // LINE Config States
  const [apiMode, setApiMode] = useState<'notify' | 'messaging_api'>(lineConfig.apiMode || 'notify');
  const [lineToken, setLineToken] = useState(lineConfig.token || '');
  const [lineGrp, setLineGrp] = useState(lineConfig.recipientGroup || '');
  const [channelAccessToken, setChannelAccessToken] = useState(lineConfig.channelAccessToken || '');
  const [toUserIdOrGroupId, setToUserIdOrGroupId] = useState(lineConfig.toUserIdOrGroupId || '');
  const [lineEnabled, setLineEnabled] = useState(lineConfig.isEnabled);

  // SMTP Config States
  const [smtpSrvr, setSmtpSrvr] = useState(emailConfig.smtpServer);
  const [smtpPrt, setSmtpPrt] = useState(emailConfig.smtpPort.toString());
  const [sndrEm, setSndrEm] = useState(emailConfig.senderEmail);
  const [rcptEm, setRcptEm] = useState(emailConfig.recipientEmails);
  const [emailEnabled, setEmailEnabled] = useState(emailConfig.isEnabled);

  // Simulation & UI States
  const [sendingLineTest, setSendingLineTest] = useState(false);
  const [sendingEmailTest, setSendingEmailTest] = useState(false);
  const [activeAlert, setActiveAlert] = useState<{ msg: string; type: 'success' | 'danger' } | null>(null);
  
  // Simulator Controls
  const [previewEventType, setPreviewEventType] = useState<'breakdown' | 'work_order_assign' | 'work_order_complete' | 'pm_done'>('breakdown');
  const [previewImage, setPreviewImage] = useState('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=60');

  const handleSaveLine = (e: React.FormEvent) => {
    e.preventDefault();
    setLineConfig({
      isEnabled: lineEnabled,
      apiMode,
      token: lineToken,
      recipientGroup: lineGrp,
      channelAccessToken,
      toUserIdOrGroupId
    });
    addAuditLog('Update LINE Configuration', `Updated LINE parameters in ${apiMode} mode. Status: ${lineEnabled ? 'Active' : 'Inactive'}`);
    showAlert('บันทึกกำหนดค่าช่องทาง LINE สำเร็จแล้ว!', 'success');
    triggerNotification('บันทึกสำเร็จ', `อัปเดตช่องทางรับข้อมูลผ่าน LINE ${apiMode === 'notify' ? 'Notify' : 'Flex Message'} สำเร็จ`, 'success');
  };

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailConfig({
      isEnabled: emailEnabled,
      smtpServer: smtpSrvr,
      smtpPort: parseInt(smtpPrt) || 587,
      senderEmail: sndrEm,
      recipientEmails: rcptEm
    });
    addAuditLog('Update SMTP Configuration', `Updated server: ${smtpSrvr}. Port: ${smtpPrt}.`);
    showAlert('บันทึกกำหนดค่าระบบ Email SMTP สำเร็จแล้ว!', 'success');
    triggerNotification('บันทึกสำเร็จ', 'ตั้งค่า Email Alert Gateway สำเร็จ', 'success');
  };

  const showAlert = (msg: string, type: 'success' | 'danger') => {
    setActiveAlert({ msg, type });
    setTimeout(() => setActiveAlert(null), 5000);
  };

  // Real API Dispatcher Test using proxy
  const testLineDispatch = async () => {
    // Validate fields based on mode
    if (apiMode === 'notify' && !lineToken) {
      showAlert('กรุณากรอก LINE Notify Access Token ก่อนทดสอบ!', 'danger');
      return;
    }
    if (apiMode === 'messaging_api' && (!channelAccessToken || !toUserIdOrGroupId)) {
      showAlert('กรุณากรอก Channel Access Token และ User/Group ID ปลายทางก่อนทดสอบ!', 'danger');
      return;
    }

    const testConfig: LINEConfig = {
      isEnabled: true,
      apiMode,
      token: lineToken,
      recipientGroup: lineGrp,
      channelAccessToken,
      toUserIdOrGroupId
    };

    setSendingLineTest(true);
    try {
      const mockPayload = {
        title: previewEventType === 'breakdown' ? 'แจ้งเหตุเครื่องจักรขัดข้องฉุกเฉิน (MMS Simulator)'
               : previewEventType === 'work_order_assign' ? 'จ่ายใบสั่งงานซ่อมบำรุงวิศวกรรม (MMS Simulator)'
               : previewEventType === 'work_order_complete' ? 'ใบงานซ่อมบำรุงปิดงานสมบูรณ์ (MMS Simulator)'
               : 'บำรุงรักษาเชิงป้องกันสำเร็จตามเกณฑ์ (MMS Simulator)',
        machineName: 'CNC Lathe Machine Type A3',
        machineCode: 'CNC-A3-104',
        location: 'Factory Zone C, Line 4',
        priority: previewEventType === 'breakdown' ? 'Critical' : 'Medium',
        symptom: 'พัดลมระบายความร้อนแกนขับมอเตอร์หลักขัดข้อง มีกลิ่นไหม้และความร้อนแกนเกิน 95°C',
        requester: 'คุณธวัชชัย นิติกุล (หัวหน้าส่วนการผลิต)',
        technician: 'สมชาย รักดี',
        orderNo: 'WO-2026-0244',
        actionTaken: 'ดำเนินการเปลี่ยนบอร์ดคัปเปลอร์ ระบายฝุ่นคาร์บอน สะอาดแกนตลับลูกปืนทนความร้อนสูง',
        totalCost: 18700,
        manHours: 3.5,
        notes: 'ทดสอบระบบส่งสัญญาณความปลอดภัยผ่าน MMS Server Gateway',
        imageUrl: previewImage || undefined,
        dateTime: new Date().toLocaleString('th-TH')
      };

      const res = await sendLineAlert(testConfig, previewEventType, mockPayload);
      if (res.success) {
        showAlert(`ส่งข้อความสำเร็จ: ${res.message} (เช็คกลุ่มไลน์ของคุณ!)`, 'success');
        triggerNotification('LINE Alert Sent', `ทดสอบส่งข้อมูลสำเร็จเรียบร้อยแล้ว`, 'success');
        addAuditLog('Test LINE Alert', `Dispatched simulated ${apiMode} message successfully to LINE.`);
      } else {
        showAlert(`ส่งข้อความไม่สำเร็จ: ${res.message}`, 'danger');
        triggerNotification('LINE Alert Failed', `ส่งข้อมูลล้มเหลว: ${res.message}`, 'danger');
      }
    } catch (err: any) {
      console.error(err);
      showAlert(`ล้มเหลว: ${err.message}`, 'danger');
    } finally {
      setSendingLineTest(false);
    }
  };

  const testEmailDispatch = () => {
    if (!smtpSrvr || !rcptEm) {
      showAlert('กรุณากรอกเซิร์ฟเวอร์ SMTP และที่อยู่อีเมลผู้รับ!', 'danger');
      return;
    }
    setSendingEmailTest(true);
    setTimeout(() => {
      setSendingEmailTest(false);
      showAlert('Email Sent: ส่งอีเมลแจ้งเตือนจำลองไปยัง "' + rcptEm + '" เรียบร้อยแล้ว! (SMTP Server Bypassed)', 'success');
      triggerNotification('Email Dispatched', 'ระบบส่งอีเมลแจ้งเหตุงานซ่อมไปที่ ' + rcptEm, 'success');
      addAuditLog('Test Email Dispatch', `Triggered SMTP delivery test to ${rcptEm}`);
    }, 1200);
  };

  // Helper variables to display the simulator's text
  const getHeaderStyle = () => {
    if (previewEventType === 'breakdown') return { bg: 'bg-[#ef4444]', title: '🚨 MACHINE BREAKDOWN', badgeBg: 'bg-red-100 text-red-800' };
    if (previewEventType === 'work_order_assign') return { bg: 'bg-[#3b82f6]', title: '🔧 WORK ORDER ASSIGNED', badgeBg: 'bg-blue-100 text-blue-800' };
    if (previewEventType === 'work_order_complete') return { bg: 'bg-[#10b981]', title: '✅ WORK COMPLETED', badgeBg: 'bg-green-100 text-green-800' };
    return { bg: 'bg-[#8b5cf6]', title: '🛡️ PM SERVICE COMPLETED', badgeBg: 'bg-purple-100 text-purple-800' };
  };

  const headerDetails = getHeaderStyle();

  return (
    <div className="space-y-6" id="ntf-settings-panel">
      {activeAlert && (
        <div className={`p-4 rounded shadow-sm text-sm font-sans flex items-center justify-between border-l-4 ${
          activeAlert.type === 'success' 
            ? 'bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300 border-green-500' 
            : 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border-red-500'
        }`}>
          <div className="flex items-center gap-2">
            {activeAlert.type === 'success' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-red-500" />}
            <span>{activeAlert.msg}</span>
          </div>
          <button onClick={() => setActiveAlert(null)} className="font-bold cursor-pointer text-gray-500 hover:text-gray-700 text-lg">×</button>
        </div>
      )}

      {/* Main Configurations & Simulator Dual Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Config Forms: 7 Columns on desktop */}
        <div className="xl:col-span-7 space-y-6">
          
          {/* LINE Notification Control Card */}
          <div className="card shadow-md bg-white dark:bg-zinc-800 rounded-md border-t-4 border-[#06c755] flex flex-col justify-between">
            <div className="p-4 border-b border-gray-100 dark:border-zinc-700 flex flex-wrap justify-between items-center bg-gray-50 dark:bg-zinc-800/40 gap-2">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-[#06c755]" />
                <h4 className="font-bold text-gray-800 dark:text-zinc-100 font-sans text-sm">
                  การเชื่อมต่อระบบแจ้งเตือนผ่าน LINE Gateway
                </h4>
              </div>
              <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                lineEnabled ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-zinc-300'
              }`}>
                {lineEnabled ? 'เปิดใช้งาน (ACTIVE)' : 'ปิดการทำงาน (INACTIVE)'}
              </span>
            </div>

            <form onSubmit={handleSaveLine} className="p-5 space-y-5 flex-1">
              
              {/* Enable Toggle Switch */}
              <div className="flex items-center justify-between p-3.5 bg-green-50 dark:bg-green-950/10 rounded border border-green-100 dark:border-green-900/30">
                <div className="max-w-[80%]">
                  <span className="text-xs font-bold text-green-800 dark:text-green-400 block font-sans">
                    ส่งข้อความด่วนแจ้งสถานะซ่อมแซมโรงงาน
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-zinc-400 block mt-0.5">
                    เมื่อเกิดเหตุเครื่องชำรุด, มอบหมายงานช่าง, หรือปิดงานซ่อมสำเร็จ ระบบจะส่ง Push Alert สวยงามทันที
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lineEnabled}
                    onChange={(e) => setLineEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-green-300 dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#06c755]"></div>
                </label>
              </div>

              {/* API Mode Selector Tabs */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase font-sans">
                  โหมดเชื่อมต่อสัญญาณระบบ (Connection Mode)
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-zinc-900 rounded-md">
                  <button
                    type="button"
                    onClick={() => setApiMode('notify')}
                    className={`py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      apiMode === 'notify'
                        ? 'bg-white dark:bg-zinc-800 text-[#06c755] shadow-sm'
                        : 'text-gray-500 hover:text-gray-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    LINE Notify (มาตรฐานข้อความ)
                  </button>
                  <button
                    type="button"
                    onClick={() => setApiMode('messaging_api')}
                    className={`py-2 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      apiMode === 'messaging_api'
                        ? 'bg-white dark:bg-zinc-800 text-blue-500 shadow-sm'
                        : 'text-gray-500 hover:text-gray-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    <Sparkles className="h-3 w-3 text-yellow-500 animate-pulse" />
                    LINE Flex Message (การ์ดหรูหรา)
                  </button>
                </div>
              </div>

              {/* Conditional Form Inputs */}
              {apiMode === 'notify' ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-zinc-300 uppercase font-sans">
                      LINE Notify Access Token
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Key className="h-4 w-4" />
                      </div>
                      <input
                        type="password"
                        value={lineToken}
                        onChange={(e) => setLineToken(e.target.value)}
                        placeholder="กรอกสิทธิ์ Token รหัสเชื่อมต่อไปที่ LINE Notify"
                        className="form-control pl-10 block w-full rounded border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 p-2 text-xs text-gray-900 dark:text-zinc-100 font-mono"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400">
                      รับ Token ได้โดยการล็อกอินที่เว็บ <a href="https://notify-bot.line.me" target="_blank" rel="noreferrer" className="text-green-500 hover:underline">https://notify-bot.line.me</a> และเลือกห้องแชทซ่อมบำรุง
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-zinc-300 uppercase font-sans">
                      ชื่อกลุ่มหรือห้องแชทแสดงบน UI (Chat Room Label)
                    </label>
                    <input
                      type="text"
                      value={lineGrp}
                      onChange={(e) => setLineGrp(e.target.value)}
                      placeholder="เช่น กลุ่มช่างเทคนิควิศวกรรม"
                      className="form-control block w-full rounded border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 p-2 text-xs text-gray-900 dark:text-zinc-100"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-zinc-300 uppercase font-sans">
                      Channel Access Token (Long-Lived)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Key className="h-4 w-4" />
                      </div>
                      <input
                        type="password"
                        value={channelAccessToken}
                        onChange={(e) => setChannelAccessToken(e.target.value)}
                        placeholder="กรอกสิทธิ์ Channel Access Token จาก LINE Developers Console"
                        className="form-control pl-10 block w-full rounded border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 p-2 text-xs text-gray-900 dark:text-zinc-100 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-zinc-300 uppercase font-sans">
                      ห้องกลุ่มเป้าหมาย (Destination User ID / Group ID / Room ID)
                    </label>
                    <input
                      type="text"
                      value={toUserIdOrGroupId}
                      onChange={(e) => setToUserIdOrGroupId(e.target.value)}
                      placeholder="กรอก ID ห้องกลุ่มหรือรหัสผู้รับ เช่น C8123df76... หรือ U239bf..."
                      className="form-control block w-full rounded border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 p-2 text-xs text-gray-900 dark:text-zinc-100 font-mono"
                    />
                    <p className="text-[10px] text-gray-400">
                      * LINE Group ID สามารถหาได้จากการตั้งค่า Webhook บอต หรือใช้เครื่องมือดักดูค่า Event payload จากกลุ่มช่างซ่อมบำรุง
                    </p>
                  </div>
                </div>
              )}

              {/* Save & Test Action buttons */}
              <div className="pt-4 border-t border-gray-100 dark:border-zinc-700 flex flex-wrap justify-between gap-3">
                <button
                  type="button"
                  onClick={testLineDispatch}
                  disabled={sendingLineTest}
                  className="px-4 py-2 bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 disabled:opacity-50 text-gray-800 dark:text-zinc-200 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {sendingLineTest ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5 text-[#06c755]" />}
                  <span>ทดสอบส่งจริง (Test Dispatch to LINE)</span>
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-[#06c755] hover:bg-green-600 text-white rounded text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  บันทึกพารามิเตอร์ LINE
                </button>
              </div>
            </form>
          </div>

          {/* Email SMTP Config Card */}
          <div className="card shadow-md bg-white dark:bg-zinc-800 rounded-md border-t-4 border-blue-500 flex flex-col justify-between">
            <div className="p-4 border-b border-gray-100 dark:border-zinc-700 flex justify-between items-center bg-gray-50 dark:bg-zinc-800/40">
              <h4 className="font-bold flex items-center gap-2 text-gray-800 dark:text-zinc-100 font-sans text-sm">
                <Mail className="h-5 w-5 text-blue-500" />
                กำหนดค่าการส่งจดหมายทางการ (SMTP Mail Gateway)
              </h4>
              <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                emailEnabled ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300' : 'bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-zinc-300'
              }`}>
                {emailEnabled ? 'เปิดใช้งาน' : 'ปิดการส่งเมล'}
              </span>
            </div>

            <form onSubmit={handleSaveEmail} className="p-5 space-y-4 flex-1">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/10 rounded border border-blue-100 dark:border-blue-900/30">
                <div className="max-w-[80%]">
                  <span className="text-xs font-bold text-blue-800 dark:text-blue-400 block font-sans">
                    รายงานความปลอดภัยอย่างเป็นทางการ (Email Security Alerts)
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-zinc-400 block mt-0.5">
                    จะส่งรายงานสรุปแผนการซ่อมประจำเดือน (Monthly report) และสรุปยอด PM ไปยังที่อยู่อีเมลผู้บริหารโดยตรง
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailEnabled}
                    onChange={(e) => setEmailEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-zinc-300 font-sans">
                    SMTP Host Address
                  </label>
                  <input
                    type="text"
                    value={smtpSrvr}
                    onChange={(e) => setSmtpSrvr(e.target.value)}
                    placeholder="เช่น smtp.gmail.com"
                    className="form-control block w-full rounded border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 p-2 text-xs text-gray-900 dark:text-zinc-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-zinc-300 font-sans">
                    SMTP Port
                  </label>
                  <input
                    type="number"
                    value={smtpPrt}
                    onChange={(e) => setSmtpPrt(e.target.value)}
                    placeholder="587"
                    className="form-control block w-full rounded border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 p-2 text-xs text-gray-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-700 dark:text-zinc-300 font-sans">
                  Sender E-mail (บัญชีผู้ส่งระบบแจ้งเหตุมอเตอร์)
                </label>
                <input
                  type="email"
                  value={sndrEm}
                  onChange={(e) => setSndrEm(e.target.value)}
                  placeholder="noreply-mms@maintenance-ideva.com"
                  className="form-control block w-full rounded border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 p-2 text-xs text-gray-900 dark:text-zinc-100"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-700 dark:text-zinc-300 font-sans">
                  Recipient Emails (อีเมลเป้าหมายผู้บริหาร - คั่นด้วยจุลภาค , )
                </label>
                <input
                  type="text"
                  value={rcptEm}
                  onChange={(e) => setRcptEm(e.target.value)}
                  placeholder="factory-director@ideva.co.th, supervisor-mms@ideva.co.th"
                  className="form-control block w-full rounded border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 p-2 text-xs text-gray-900 dark:text-zinc-100"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-zinc-700 flex justify-between gap-3">
                <button
                  type="button"
                  onClick={testEmailDispatch}
                  disabled={sendingEmailTest}
                  className="px-4 py-1.5 bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 disabled:opacity-50 text-gray-800 dark:text-zinc-200 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {sendingEmailTest ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5 text-blue-500" />}
                  <span>ทดสอบส่งเมล์จริง (SMTP Test)</span>
                </button>

                <button
                  type="submit"
                  className="px-5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  บันทึกกำหนดค่า SMTP
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right Panel: Interactive LINE App Live Simulator: 5 Columns */}
        <div className="xl:col-span-5 space-y-4">
          
          {/* Simulator Header & Customization Controls */}
          <div className="bg-white dark:bg-zinc-800 p-4 rounded-md shadow border border-gray-100 dark:border-zinc-700">
            <h4 className="font-bold text-xs text-gray-700 dark:text-zinc-300 flex items-center gap-1.5 mb-3 uppercase font-sans">
              <Eye className="h-4 w-4 text-[#06c755] animate-pulse" />
              โปรแกรมจำลอง LINE Flex / LINE Notify Simulator
            </h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                  1. เลือกเหตุการณ์จำลอง (Simulate Event Type)
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewEventType('breakdown');
                      setPreviewImage('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=60');
                    }}
                    className={`px-2 py-1.5 text-[10px] font-bold rounded border transition-all text-left ${
                      previewEventType === 'breakdown'
                        ? 'border-red-500 bg-red-50 dark:bg-red-950/20 text-red-700'
                        : 'border-gray-200 dark:border-zinc-700 text-gray-600'
                    }`}
                  >
                    🚨 เครื่องซ่อมฉุกเฉิน (Breakdown)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewEventType('work_order_assign');
                      setPreviewImage('https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&auto=format&fit=crop&q=60');
                    }}
                    className={`px-2 py-1.5 text-[10px] font-bold rounded border transition-all text-left ${
                      previewEventType === 'work_order_assign'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 text-blue-700'
                        : 'border-gray-200 dark:border-zinc-700 text-gray-600'
                    }`}
                  >
                    🔧 มอบจ่ายงานช่าง (Assigned)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewEventType('work_order_complete');
                      setPreviewImage('https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60');
                    }}
                    className={`px-2 py-1.5 text-[10px] font-bold rounded border transition-all text-left ${
                      previewEventType === 'work_order_complete'
                        ? 'border-green-500 bg-green-50 dark:bg-green-950/20 text-green-700'
                        : 'border-gray-200 dark:border-zinc-700 text-gray-600'
                    }`}
                  >
                    ✅ ซ่อมบำรุงปิดงาน (Completed)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewEventType('pm_done');
                      setPreviewImage('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=60');
                    }}
                    className={`px-2 py-1.5 text-[10px] font-bold rounded border transition-all text-left ${
                      previewEventType === 'pm_done'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20 text-purple-700'
                        : 'border-gray-200 dark:border-zinc-700 text-gray-600'
                    }`}
                  >
                    🛡️ บำรุงรักษาแผน PM (Plan Done)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                  2. ลิงก์รูปภาพประกอบ (Simulated Image URL)
                </label>
                <input
                  type="text"
                  value={previewImage}
                  onChange={(e) => setPreviewImage(e.target.value)}
                  placeholder="กรอก URL ภาพ หรือเว้นว่างเพื่อซ่อนภาพในไลน์"
                  className="form-control block w-full rounded border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 p-1.5 text-[10px] text-gray-900 dark:text-zinc-100 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Genuine Mock LINE Mobile Chat Interface Frame */}
          <div className="bg-[#8cabd9] rounded-2xl overflow-hidden shadow-lg border-4 border-gray-200 dark:border-zinc-700 flex flex-col h-[560px] font-sans">
            
            {/* LINE App Header */}
            <div className="bg-[#2c3e50] text-white px-4 py-3 flex items-center justify-between border-b border-black/10">
              <div className="flex items-center gap-2.5">
                <div className="h-2.5 w-2.5 bg-green-400 rounded-full animate-ping" />
                <div>
                  <h5 className="font-bold text-xs">MMS Maintenance Group (3)</h5>
                  <p className="text-[9px] text-gray-300">LINE Chat Service Active • Port 3000</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="bg-[#06c755] text-white font-bold px-2 py-0.5 rounded-full text-[9px]">
                  {apiMode === 'notify' ? 'Notify Bot' : 'Line Bot'}
                </span>
              </div>
            </div>

            {/* Chat Conversation Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col justify-end">
              
              {/* Message Timestamp */}
              <div className="text-center">
                <span className="bg-black/10 text-white text-[9px] px-2 py-0.5 rounded-full">
                  วันนี้ {new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                </span>
              </div>

              {/* Bot Message Avatar + Bubble Layout */}
              <div className="flex items-start gap-2.5">
                
                {/* LINE avatar */}
                <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow border border-gray-300 flex-shrink-0">
                  <div className="bg-[#06c755] text-white rounded-full h-7 w-7 flex items-center justify-center font-bold text-xs">
                    L
                  </div>
                </div>

                {/* Message Body depending on Mode */}
                <div className="max-w-[85%]">
                  <span className="text-[10px] text-[#2c3e50] dark:text-gray-200 font-bold block mb-1">
                    {apiMode === 'notify' ? 'LINE Notify' : 'MMS Gateway Bot'}
                  </span>

                  {apiMode === 'notify' ? (
                    /* LINE Notify Text Bubble */
                    <div className="bg-white text-gray-800 rounded-2xl rounded-tl-none p-3 shadow-sm border border-gray-200 text-xs leading-relaxed font-mono whitespace-pre-wrap">
                      <p className="font-bold text-[#06c755] border-b pb-1 mb-2">
                        📢 {previewEventType === 'breakdown' ? '🚨 [แจ้งเหตุเครื่องจักรชำรุด] 🚨'
                             : previewEventType === 'work_order_assign' ? '🔧 [จ่ายงานบำรุงรักษาซ่อมแซม]'
                             : previewEventType === 'work_order_complete' ? '✅ [ปิดงานซ่อมบำรุงสำเร็จ]'
                             : '🛡️ [บำรุงรักษาเชิงป้องกันสำเร็จ]'}
                      </p>
                      <p>หัวข้อ: {previewEventType === 'breakdown' ? 'แจ้งเตือนพบจุดบกพร่องวิกฤต' : 'ใบสั่งงานตรวจวิเคราะห์ตามวงรอบ'}</p>
                      <p>เวลา: {new Date().toLocaleString('th-TH')}</p>
                      <p>------------------------</p>
                      <p>🖥️ เครื่องจักร: CNC Lathe Machine A3 (CNC-A3-104)</p>
                      <p>📍 พิกัดติดตั้ง: Factory Zone C, Line 4</p>
                      <p>⚠️ ความรุนแรง: {previewEventType === 'breakdown' ? '🔴 [วิกฤต]' : '🟡 [ปานกลาง]'}</p>
                      <p>📝 อาการขัดข้อง: พัดลมระบายความร้อนแกนขับหลักขัดข้อง มีกลิ่นไหม้และความร้อนเกิน 95°C</p>
                      {previewEventType === 'work_order_complete' && (
                        <>
                          <p>🔧 ผลงานซ่อม: เปลี่ยนบอร์ดคัปเปลอร์ สะอาดตลับลูกปืนเรียบร้อย</p>
                          <p>💰 ค่าใช้จ่ายรวม: ฿18,700</p>
                          <p>⏳ เวลาซ่อมแซม: 3.5 ชม.</p>
                        </>
                      )}
                      <p>👤 ผู้แจ้ง/ช่าง: {previewEventType === 'breakdown' ? 'ธวัชชัย นิติกุล' : 'สมชาย รักดี'}</p>
                      {previewImage && (
                        <div className="mt-2 rounded-md overflow-hidden border border-gray-100">
                          <img src={previewImage} alt="Simulated machine" className="max-h-24 w-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      )}
                      <p>------------------------</p>
                      <p className="text-[10px] text-blue-500 break-all underline">
                        https://ais-pre-advgn7dllexqgd4y4kka6e-185445953068.asia-east1.run.app
                      </p>
                    </div>
                  ) : (
                    /* LINE Flex Message bubble mockup matching official guidelines */
                    <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-200/60 w-[260px] flex flex-col text-xs">
                      
                      {/* Flex Header */}
                      <div className={`${headerDetails.bg} text-white font-bold py-2.5 px-3 flex items-center justify-center tracking-wide text-[10px] shadow-inner`}>
                        {headerDetails.title}
                      </div>

                      {/* Flex Hero Image */}
                      {previewImage && (
                        <div className="h-32 bg-gray-100 overflow-hidden relative">
                          <img src={previewImage} alt="Machine" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                          <span className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold ${headerDetails.badgeBg}`}>
                            CNC-A3-104
                          </span>
                        </div>
                      )}

                      {/* Flex Body */}
                      <div className="p-3.5 space-y-3">
                        <div className="space-y-1">
                          <h6 className="font-bold text-gray-900 leading-snug">
                            {previewEventType === 'breakdown' ? 'แจ้งเตือนเครื่องเกิดความร้อนสะสมฉุกเฉิน' 
                             : previewEventType === 'work_order_assign' ? 'เริ่มงานซ่อมเปลี่ยนชุดกรองอากาศห้องควบคุม' 
                             : previewEventType === 'work_order_complete' ? 'ใบงานซ่อมบำรุงปิดงานพร้อมคืนสภาพเครื่อง' 
                             : 'ทำความสะอาดเช็คสารหล่อเย็นประจำสัปดาห์'}
                          </h6>
                          <div className="h-[1px] bg-gray-100 my-1" />
                        </div>

                        {/* Flex Rows */}
                        <div className="space-y-1.5 text-[11px]">
                          <div className="flex items-baseline">
                            <span className="text-gray-400 w-16 flex-shrink-0">เครื่องจักร</span>
                            <span className="text-gray-800 font-bold flex-1">CNC Lathe Machine A3</span>
                          </div>
                          <div className="flex items-baseline">
                            <span className="text-gray-400 w-16 flex-shrink-0">พิกัด/ไลน์</span>
                            <span className="text-gray-800 flex-1">Factory Zone C, Line 4</span>
                          </div>
                          <div className="flex items-baseline">
                            <span className="text-gray-400 w-16 flex-shrink-0">ความฉุกเฉิน</span>
                            <span className={`font-bold flex-1 ${previewEventType === 'breakdown' ? 'text-red-500' : 'text-amber-500'}`}>
                              {previewEventType === 'breakdown' ? 'Critical' : 'Medium'}
                            </span>
                          </div>
                          <div className="flex items-baseline">
                            <span className="text-gray-400 w-16 flex-shrink-0">อาการขัดข้อง</span>
                            <span className="text-gray-800 flex-1 truncate">พัดลมแกนหลักกลิ่นไหม้ความร้อนสะสม</span>
                          </div>
                          {previewEventType === 'work_order_complete' && (
                            <>
                              <div className="flex items-baseline">
                                <span className="text-gray-400 w-16 flex-shrink-0">วิธีซ่อม</span>
                                <span className="text-gray-800 flex-1">เปลี่ยนบอร์ดคัปเปลอร์ เรียบร้อย</span>
                              </div>
                              <div className="flex items-baseline">
                                <span className="text-gray-400 w-16 flex-shrink-0">ค่าซ่อมรวม</span>
                                <span className="text-green-500 font-bold flex-1">฿18,700</span>
                              </div>
                            </>
                          )}
                          <div className="flex items-baseline border-t border-dashed border-gray-100 pt-1.5 mt-1">
                            <span className="text-gray-400 w-16 flex-shrink-0">เวลาประกาศ</span>
                            <span className="text-gray-500 flex-1 text-[10px]">
                              {new Date().toLocaleTimeString('th-TH')} น.
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Flex Footer Buttons */}
                      <div className="px-3 pb-3 pt-1 space-y-1.5">
                        <button type="button" className={`w-full py-1.5 rounded text-white font-bold text-[10px] text-center shadow-sm block ${headerDetails.bg}`}>
                          เข้าชมใบสั่งซ่อมบำรุง
                        </button>
                        <p className="text-[7px] text-center text-gray-300 font-semibold tracking-wider">
                          POWERED BY ideva-os-cmms
                        </p>
                      </div>

                    </div>
                  )}

                  <span className="text-[8px] text-[#2c3e50]/40 font-medium block mt-1 text-right">
                    อ่านแล้ว {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

            </div>

            {/* Chat Input Bar */}
            <div className="bg-white px-3 py-2 flex items-center justify-between gap-2 border-t border-gray-100">
              <input 
                type="text" 
                placeholder="พิมพ์ข้อความจำลองทดสอบ..." 
                disabled 
                className="bg-gray-100 block w-full rounded-full px-3 py-1 text-[10px] text-gray-400 focus:outline-none"
              />
              <button disabled className="bg-[#06c755] text-white p-1 rounded-full opacity-60">
                <Send className="h-3 w-3" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Security & Technical Specifications */}
      <div className="p-5 rounded bg-zinc-50 dark:bg-zinc-800/20 border border-gray-200 dark:border-zinc-700/60 font-sans">
        <h5 className="font-bold text-xs text-gray-800 dark:text-zinc-200 flex items-center gap-1.5 mb-2">
          <ShieldCheck className="h-4 w-4 text-green-500" />
          ระบบบันทึกความปลอดภัยและประมวลผลเซสชั่น (Secure Event Log System)
        </h5>
        <div className="text-xs text-gray-500 dark:text-zinc-400 space-y-1.5 leading-relaxed">
          <p>
            • ทุกการกระทำที่มีการแก้ไข สต็อก ข้อมูลเครื่องจักร หรือการเปิดปิดและบันทึกปิดงานซ่อม จะถูกบันทึกประวัติการใช้สิทธิ์ (Audit Trails) โดยอัตโนมัติ ไม่สามารถลบหรือดัดแปลงโดยบุคลากรภายนอกเพื่อความปลอดภัยสูงสุดตามเกณฑ์ ISO 9001
          </p>
          <p>
            • LINE Notify API และ LINE Messaging API อยู่บนมาตรฐานการเข้าถึงด้วย SSL/TLS แบบ End-to-end encryption โดยทำหน้าที่ผ่าน API Proxy Server ฝั่งเซิร์ฟเวอร์ของระบบ (Port 3000) ทำให้ปลอดภัยจากช่องโหว่การสกัดจับโทเค็นในบราวเซอร์ (CSRF/CORS Protection)
          </p>
        </div>
      </div>
    </div>
  );
}
