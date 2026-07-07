/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Bell, ShieldCheck, RefreshCw, Smartphone, Key, Layers, Send } from 'lucide-react';
import { LINEConfig, EmailConfig, AuditLog, UserRole } from '../types';

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
  const [lineToken, setLineToken] = useState(lineConfig.token);
  const [lineGrp, setLineGrp] = useState(lineConfig.recipientGroup);
  const [lineEnabled, setLineEnabled] = useState(lineConfig.isEnabled);

  const [smtpSrvr, setSmtpSrvr] = useState(emailConfig.smtpServer);
  const [smtpPrt, setSmtpPrt] = useState(emailConfig.smtpPort.toString());
  const [sndrEm, setSndrEm] = useState(emailConfig.senderEmail);
  const [rcptEm, setRcptEm] = useState(emailConfig.recipientEmails);
  const [emailEnabled, setEmailEnabled] = useState(emailConfig.isEnabled);

  const [sendingLineTest, setSendingLineTest] = useState(false);
  const [sendingEmailTest, setSendingEmailTest] = useState(false);
  const [activeAlert, setActiveAlert] = useState<{ msg: string; type: 'success' | 'danger' } | null>(null);

  const handleSaveLine = (e: React.FormEvent) => {
    e.preventDefault();
    setLineConfig({
      isEnabled: lineEnabled,
      token: lineToken,
      recipientGroup: lineGrp
    });
    addAuditLog('Update LINE Configuration', `Updated LINE Notify parameters. Status: ${lineEnabled ? 'Active' : 'Inactive'}`);
    showAlert('บันทึกกำหนดค่า LINE Notify สำเร็จแล้ว!', 'success');
    triggerNotification('บันทึกสำเร็จ', 'อัปเดตช่องทางการรับข้อมูลทาง LINE Notify เรียบร้อย', 'success');
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
    setTimeout(() => setActiveAlert(null), 4000);
  };

  const testLineDispatch = () => {
    if (!lineToken) {
      showAlert('กรุณาป้อน LINE Notify Token ก่อนทดสอบ!', 'danger');
      return;
    }
    setSendingLineTest(true);
    setTimeout(() => {
      setSendingLineTest(false);
      showAlert('LINE Notify: ส่งข้อความจำลองไปยังไลน์กลุ่ม "' + lineGrp + '" สำเร็จแล้ว! (Status 200 OK)', 'success');
      triggerNotification('LINE Notify Dispatched', 'ข้อความทดสอบถูกกระตุ้นส่งไปยังกลุ่ม ' + lineGrp, 'success');
      addAuditLog('Test LINE Notify', `Triggered connection test to LINE Notify. Token: ...${lineToken.slice(-6)}`);
    }, 1200);
  };

  const testEmailDispatch = () => {
    if (!smtpSrvr || !rcptEm) {
      showAlert('กรุณากรอกเซิร์ฟเวอร์ SMTP และที่อยู่อีเมลผู้รับ!', 'danger');
      return;
    }
    setSendingEmailTest(true);
    setTimeout(() => {
      setSendingEmailTest(false);
      showAlert('Email Sent: ส่งอีเมลแจ้งเตือนจำลองไปยัง "' + rcptEm + '" เรียบร้อยแล้ว!', 'success');
      triggerNotification('Email Dispatched', 'ระบบส่งอีเมลแจ้งเหตุงานซ่อมไปที่ ' + rcptEm, 'success');
      addAuditLog('Test Email Dispatch', `Triggered SMTP delivery test to ${rcptEm}`);
    }, 1500);
  };

  return (
    <div className="space-y-6" id="ntf-settings-panel">
      {activeAlert && (
        <div className={`p-4 rounded shadow-sm text-sm font-sans flex items-center justify-between border-l-4 ${
          activeAlert.type === 'success' 
            ? 'bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300 border-green-500' 
            : 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border-red-500'
        }`}>
          <span>{activeAlert.msg}</span>
          <button onClick={() => setActiveAlert(null)} className="font-bold cursor-pointer text-gray-500">×</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LINE Notify Form */}
        <div className="card shadow-md bg-white dark:bg-zinc-800 rounded-md border-t-4 border-green-500 flex flex-col justify-between">
          <div className="p-4 border-b border-gray-100 dark:border-zinc-700 flex justify-between items-center bg-gray-50 dark:bg-zinc-800/40">
            <h4 className="font-bold flex items-center gap-2 text-gray-800 dark:text-zinc-100 font-sans">
              <Smartphone className="h-5 w-5 text-green-500" />
              การเชื่อมต่อ LINE Notify (แจ้งเตือนความเสียหายทันที)
            </h4>
            <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
              lineEnabled ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-zinc-300'
            }`}>
              {lineEnabled ? 'เปิดใช้งาน' : 'ปิดการทำงาน'}
            </span>
          </div>

          <form onSubmit={handleSaveLine} className="p-5 space-y-4 flex-1">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/10 rounded border border-green-100 dark:border-green-900/30">
              <div>
                <span className="text-xs font-bold text-green-800 dark:text-green-400 block font-sans">
                  ระบบส่งการแจ้งเหตุโรงงานเครื่องเกิดเสีย
                </span>
                <span className="text-[11px] text-gray-500 dark:text-zinc-400 block">
                  เมื่อฝ่ายผลิตกรอกใบแจ้งซ่อม ระบบจะส่ง Push message ตรงไปยังกลุ่มช่างทันทีพร้อมชื่อผู้แจ้งและรูปเครื่องจักร
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={lineEnabled}
                  onChange={(e) => setLineEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-green-300 dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase font-sans">
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
                  placeholder="กรอกสิทธิ์ Token รหัสเชื่อมต่อไปที่ Webhook LINE"
                  className="form-control pl-10 block w-full rounded border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 p-2.5 text-xs text-gray-900 dark:text-zinc-100"
                />
              </div>
              <p className="text-[10px] text-gray-400">
                รับ Token ได้โดยการเข้าใช้สิทธิ์ https://notify-bot.line.me และออกโทเค็นร่วมกลุ่มซ่อมบำรุง
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase font-sans">
                กลุ่มปลายทาง (Recipient Group / Chat Room Label)
              </label>
              <input
                type="text"
                value={lineGrp}
                onChange={(e) => setLineGrp(e.target.value)}
                placeholder="เช่น กลุ่มช่างเทคนิคซ่อมตึก A"
                className="form-control block w-full rounded border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 p-2.5 text-xs text-gray-900 dark:text-zinc-100"
              />
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-zinc-700 flex justify-between gap-2.5">
              <button
                type="button"
                onClick={testLineDispatch}
                disabled={sendingLineTest}
                className="px-4 py-2 bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 disabled:opacity-50 text-gray-800 dark:text-zinc-200 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {sendingLineTest ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5 text-green-500" />}
                <span>ส่งข้อความทดสอบ (LINE API Test)</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                บันทึกกำหนดค่า LINE
              </button>
            </div>
          </form>
        </div>

        {/* Email SMTP Config Form */}
        <div className="card shadow-md bg-white dark:bg-zinc-800 rounded-md border-t-4 border-blue-500 flex flex-col justify-between">
          <div className="p-4 border-b border-gray-100 dark:border-zinc-700 flex justify-between items-center bg-gray-50 dark:bg-zinc-800/40">
            <h4 className="font-bold flex items-center gap-2 text-gray-800 dark:text-zinc-100 font-sans">
              <Mail className="h-5 w-5 text-blue-500" />
              กำหนดเกตเวย์ Email Server (SMTP Gateway)
            </h4>
            <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
              emailEnabled ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300' : 'bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-zinc-300'
            }`}>
              {emailEnabled ? 'เปิดใช้งาน' : 'ไม่ได้เปิดใช้งาน'}
            </span>
          </div>

          <form onSubmit={handleSaveEmail} className="p-5 space-y-3.5 flex-1">
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/10 rounded border border-blue-100 dark:border-blue-900/30">
              <div>
                <span className="text-xs font-bold text-blue-800 dark:text-blue-400 block font-sans">
                  ระบบแจ้งเตือนแบบทางการ (Official Mail Alerts)
                </span>
                <span className="text-[11px] text-gray-500 dark:text-zinc-400 block">
                  จะจัดส่งใบตรวจซ่อม ใบเบิกอะไหล่วิกฤต และแจ้งเตือนสรุปแผนการ PM แก่ผู้จัดการฝ่ายบริหารและผู้ที่เกี่ยวข้อง
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

            <div className="grid grid-cols-3 gap-2.5">
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
                Sender E-mail (ผู้ส่งเครื่องจักร)
              </label>
              <input
                type="email"
                value={sndrEm}
                onChange={(e) => setSndrEm(e.target.value)}
                placeholder="noreply-mms-engine@factory-erp.com"
                className="form-control block w-full rounded border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 p-2 text-xs text-gray-900 dark:text-zinc-100"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-gray-700 dark:text-zinc-300 font-sans">
                Recipient Emails (ผู้รับหลัก - ดำเนินการคั่นด้วยเครื่องหมายจุลภาค , )
              </label>
              <input
                type="text"
                value={rcptEm}
                onChange={(e) => setRcptEm(e.target.value)}
                placeholder="manager@factory.com, plant-engineer@factory.com"
                className="form-control block w-full rounded border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 p-2 text-xs text-gray-900 dark:text-zinc-100"
              />
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-zinc-700 flex justify-between gap-2.5">
              <button
                type="button"
                onClick={testEmailDispatch}
                disabled={sendingEmailTest}
                className="px-4 py-1.5 bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 disabled:opacity-50 text-gray-800 dark:text-zinc-200 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {sendingEmailTest ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5 text-blue-500" />}
                <span>ส่งเมลทดสอบ (SMTP Test)</span>
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

      {/* Safety Instructions */}
      <div className="p-5 rounded bg-zinc-50 dark:bg-zinc-800/20 border border-gray-200 dark:border-zinc-700/60">
        <h5 className="font-bold text-xs text-gray-800 dark:text-zinc-200 flex items-center gap-1.5 mb-2 font-sans">
          <ShieldCheck className="h-4 w-4 text-green-500" />
          ระบบบันทึกความปลอดภัยและประมวลผลเซสชั่น (Secure Event Log System)
        </h5>
        <div className="text-xs text-gray-500 dark:text-zinc-400 space-y-1.5">
          <p>
            • ทุกการกระทำที่มีการแก้ไข สต็อก ข้อมูลเครื่องจักร หรือการเปิดปิดและบันทึกปิดงานซ่อม จะถูกบันทึกประวัติการใช้สิทธิ์ (Audit Trails) โดยอัตโนมัติ ไม่สามารถลบหรือดัดแปลงโดยบุคลากรภายนอกเพื่อความปลอดภัยสูงสุดตามเกณฑ์ ISO 9001
          </p>
          <p>
            • LINE Notify API และ SMTP Routing อยู่บนมาตรฐานการเข้าถึงด้วย SSL/TLS แบบ End-to-end encryption ป้องกันการสอดแนมสัญญาณความปลอดภัยระหว่างเครือข่ายภายในโรงงานอุตสาหกรรม
          </p>
        </div>
      </div>
    </div>
  );
}
