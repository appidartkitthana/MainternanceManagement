import { LINEConfig } from '../types';

interface NotificationPayload {
  title: string;
  machineName?: string;
  machineCode?: string;
  location?: string;
  priority?: string;
  symptom?: string;
  requester?: string;
  technician?: string;
  orderNo?: string;
  actionTaken?: string;
  totalCost?: number;
  manHours?: number;
  notes?: string;
  imageUrl?: string;
  dateTime?: string;
}

/**
 * Compiles a beautiful, structured multi-line text for LINE Notify
 */
export function compileNotifyText(eventType: string, data: NotificationPayload): string {
  const hr = '\n========================\n';
  let emojiHeader = '📢 แจ้งเตือนจากระบบ';
  let title = data.title;

  if (eventType === 'breakdown') {
    emojiHeader = '🚨 [แจ้งเหตุเครื่องจักรชำรุด] 🚨';
  } else if (eventType === 'work_order_assign') {
    emojiHeader = '🔧 [จ่ายงานบำรุงรักษาซ่อมแซม]';
  } else if (eventType === 'work_order_complete') {
    emojiHeader = '✅ [ปิดงานซ่อมบำรุงสำเร็จ]';
  } else if (eventType === 'pm_done') {
    emojiHeader = '🛡️ [บำรุงรักษาเชิงป้องกันสำเร็จ]';
  }

  let text = `${emojiHeader}${hr}`;
  text += `หัวข้อ: ${title}\n`;
  text += `เวลา: ${data.dateTime || new Date().toLocaleString('th-TH')}\n`;
  text += `------------------------\n`;

  if (data.machineName) {
    text += `🖥️ เครื่องจักร: ${data.machineName} (${data.machineCode || 'N/A'})\n`;
  }
  if (data.location) {
    text += `📍 พิกัดติดตั้ง: ${data.location}\n`;
  }
  if (data.priority) {
    let pEmoji = 'ℹ️';
    if (data.priority === 'Critical') pEmoji = '🔴 [วิกฤต]';
    else if (data.priority === 'High') pEmoji = '🟠 [สูง]';
    else if (data.priority === 'Medium') pEmoji = '🟡 [ปานกลาง]';
    else if (data.priority === 'Low') pEmoji = '🟢 [ต่ำ]';
    text += `⚠️ ความรุนแรง: ${pEmoji}\n`;
  }
  if (data.symptom) {
    text += `📝 อาการขัดข้อง: ${data.symptom}\n`;
  }
  if (data.requester) {
    text += `👤 ผู้แจ้งเหตุ: ${data.requester}\n`;
  }
  if (data.orderNo) {
    text += `📋 เลขที่ใบสั่งงาน: ${data.orderNo}\n`;
  }
  if (data.technician) {
    text += `🧑‍🔧 ช่างผู้รับผิดชอบ: ${data.technician}\n`;
  }
  if (data.actionTaken) {
    text += `🔧 ผลงานซ่อม: ${data.actionTaken}\n`;
  }
  if (data.totalCost !== undefined) {
    text += `💰 ค่าใช้จ่ายรวม: ฿${data.totalCost.toLocaleString('th-TH')}\n`;
  }
  if (data.manHours !== undefined) {
    text += `⏳ เวลาซ่อมแซม: ${data.manHours} ชม.\n`;
  }
  if (data.notes) {
    text += `📓 หมายเหตุ: ${data.notes}\n`;
  }

  text += `------------------------\n`;
  text += `🔗 เข้าสู่ระบบเพื่อตรวจสอบ:\nhttps://ais-pre-advgn7dllexqgd4y4kka6e-185445953068.asia-east1.run.app`;
  
  return text;
}

/**
 * Compiles a beautiful LINE Flex Message JSON Payload matching LINE's native design guidelines
 */
export function compileFlexMessagePayload(eventType: string, data: NotificationPayload) {
  let headerColor = '#4b5563'; // Gray
  let headerText = 'MMS NOTIFICATION';
  let badgeColor = '#9ca3af';
  let badgeText = 'General';

  if (eventType === 'breakdown') {
    headerColor = '#ef4444'; // Red
    headerText = '🚨 MACHINE BREAKDOWN';
    badgeColor = '#fee2e2';
    badgeText = data.priority === 'Critical' ? 'CRITICAL ALERT' : 'BREAKDOWN REPORT';
  } else if (eventType === 'work_order_assign') {
    headerColor = '#3b82f6'; // Blue
    headerText = '🔧 WORK ORDER ASSIGNED';
    badgeColor = '#dbeafe';
    badgeText = 'MAINTENANCE WORK';
  } else if (eventType === 'work_order_complete') {
    headerColor = '#10b981'; // Green
    headerText = '✅ WORK COMPLETED';
    badgeColor = '#d1fae5';
    badgeText = 'JOB FINISHED';
  } else if (eventType === 'pm_done') {
    headerColor = '#8b5cf6'; // Purple
    headerText = '🛡️ PM SERVICE COMPLETED';
    badgeColor = '#ede9fe';
    badgeText = 'PREVENTIVE';
  }

  const infoRows: any[] = [];

  if (data.machineName) {
    infoRows.push({
      type: 'box',
      layout: 'baseline',
      spacing: 'sm',
      contents: [
        { type: 'text', text: 'เครื่องจักร', color: '#aaaaaa', size: 'sm', flex: 2 },
        { type: 'text', text: `${data.machineName} (${data.machineCode || 'N/A'})`, wrap: true, color: '#333333', size: 'sm', flex: 5, weight: 'bold' }
      ]
    });
  }
  if (data.location) {
    infoRows.push({
      type: 'box',
      layout: 'baseline',
      spacing: 'sm',
      contents: [
        { type: 'text', text: 'พิกัด/ไลน์', color: '#aaaaaa', size: 'sm', flex: 2 },
        { type: 'text', text: data.location, color: '#333333', size: 'sm', flex: 5 }
      ]
    });
  }
  if (data.priority) {
    infoRows.push({
      type: 'box',
      layout: 'baseline',
      spacing: 'sm',
      contents: [
        { type: 'text', text: 'ความเร่งด่วน', color: '#aaaaaa', size: 'sm', flex: 2 },
        { type: 'text', text: data.priority, color: data.priority === 'Critical' ? '#ef4444' : '#f59e0b', size: 'sm', flex: 5, weight: 'bold' }
      ]
    });
  }
  if (data.symptom) {
    infoRows.push({
      type: 'box',
      layout: 'baseline',
      spacing: 'sm',
      contents: [
        { type: 'text', text: 'อาการขัดข้อง', color: '#aaaaaa', size: 'sm', flex: 2 },
        { type: 'text', text: data.symptom, wrap: true, color: '#333333', size: 'sm', flex: 5 }
      ]
    });
  }
  if (data.requester) {
    infoRows.push({
      type: 'box',
      layout: 'baseline',
      spacing: 'sm',
      contents: [
        { type: 'text', text: 'ผู้แจ้งเหตุ', color: '#aaaaaa', size: 'sm', flex: 2 },
        { type: 'text', text: data.requester, color: '#333333', size: 'sm', flex: 5 }
      ]
    });
  }
  if (data.orderNo) {
    infoRows.push({
      type: 'box',
      layout: 'baseline',
      spacing: 'sm',
      contents: [
        { type: 'text', text: 'ใบสั่งงาน', color: '#aaaaaa', size: 'sm', flex: 2 },
        { type: 'text', text: data.orderNo, color: '#3b82f6', size: 'sm', flex: 5, weight: 'bold' }
      ]
    });
  }
  if (data.technician) {
    infoRows.push({
      type: 'box',
      layout: 'baseline',
      spacing: 'sm',
      contents: [
        { type: 'text', text: 'ผู้รับผิดชอบ', color: '#aaaaaa', size: 'sm', flex: 2 },
        { type: 'text', text: data.technician, color: '#333333', size: 'sm', flex: 5 }
      ]
    });
  }
  if (data.actionTaken) {
    infoRows.push({
      type: 'box',
      layout: 'baseline',
      spacing: 'sm',
      contents: [
        { type: 'text', text: 'วิธีแก้ไข', color: '#aaaaaa', size: 'sm', flex: 2 },
        { type: 'text', text: data.actionTaken, wrap: true, color: '#333333', size: 'sm', flex: 5 }
      ]
    });
  }
  if (data.totalCost !== undefined) {
    infoRows.push({
      type: 'box',
      layout: 'baseline',
      spacing: 'sm',
      contents: [
        { type: 'text', text: 'ค่าซ่อมรวม', color: '#aaaaaa', size: 'sm', flex: 2 },
        { type: 'text', text: `฿${data.totalCost.toLocaleString('th-TH')}`, color: '#10b981', size: 'sm', flex: 5, weight: 'bold' }
      ]
    });
  }
  if (data.manHours !== undefined) {
    infoRows.push({
      type: 'box',
      layout: 'baseline',
      spacing: 'sm',
      contents: [
        { type: 'text', text: 'เวลาแรงงาน', color: '#aaaaaa', size: 'sm', flex: 2 },
        { type: 'text', text: `${data.manHours} ชม.`, color: '#333333', size: 'sm', flex: 5 }
      ]
    });
  }

  // Add Timestamp Row
  infoRows.push({
    type: 'box',
    layout: 'baseline',
    spacing: 'sm',
    contents: [
      { type: 'text', text: 'เวลาประกาศ', color: '#aaaaaa', size: 'sm', flex: 2 },
      { type: 'text', text: data.dateTime || new Date().toLocaleTimeString('th-TH'), color: '#666666', size: 'sm', flex: 5 }
    ]
  });

  // Compile full LINE Bubble payload
  return {
    type: 'flex',
    altText: `MaintenanceIDEVA-OS: ${data.title}`,
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: headerColor,
        paddingTop: '16px',
        paddingBottom: '16px',
        contents: [
          {
            type: 'text',
            text: headerText,
            color: '#ffffff',
            weight: 'bold',
            size: 'md',
            align: 'center',
            letterSpacing: '1px'
          }
        ]
      },
      hero: data.imageUrl ? {
        type: 'image',
        url: data.imageUrl,
        size: 'full',
        aspectRatio: '20:13',
        aspectMode: 'cover',
        action: {
          type: 'uri',
          uri: 'https://ais-pre-advgn7dllexqgd4y4kka6e-185445953068.asia-east1.run.app'
        }
      } : undefined,
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: data.title,
                size: 'md',
                weight: 'bold',
                color: '#111827',
                wrap: true,
                flex: 4
              }
            ]
          },
          {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: infoRows
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: headerColor,
            height: 'sm',
            action: {
              type: 'uri',
              label: 'เข้าชมใบสั่งซ่อมบำรุง',
              uri: 'https://ais-pre-advgn7dllexqgd4y4kka6e-185445953068.asia-east1.run.app'
            }
          },
          {
            type: 'text',
            text: 'POWERED BY MaintenanceIDEVA-OS',
            color: '#cccccc',
            size: 'xxs',
            align: 'center',
            margin: 'md'
          }
        ]
      }
    }
  };
}

/**
 * Main Dispatcher to deliver real LINE alert using either LINE Notify or LINE Messaging API
 */
export async function sendLineAlert(
  config: LINEConfig,
  eventType: 'breakdown' | 'work_order_assign' | 'work_order_complete' | 'pm_done' | 'general',
  data: NotificationPayload
): Promise<{ success: boolean; message: string; details?: any }> {
  
  if (!config.isEnabled) {
    console.log('[LINE Alert] Aborted: LINE configuration is disabled.');
    return { success: false, message: 'LINE configurations are disabled.' };
  }

  const mode = config.apiMode || 'notify';

  try {
    if (mode === 'notify') {
      // LINE Notify mode
      if (!config.token) {
        throw new Error('Missing LINE Notify Access Token');
      }

      const text = compileNotifyText(eventType, data);
      
      const bodyPayload: any = {
        token: config.token,
        message: text
      };

      if (data.imageUrl) {
        bodyPayload.imageThumbnail = data.imageUrl;
        bodyPayload.imageFullsize = data.imageUrl;
      }

      console.log('[LINE Notify] Forwarding request to proxy...');
      const response = await fetch('/api/line-notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyPayload)
      });

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.error || resJson.message || `HTTP ${response.status}`);
      }

      return { success: true, message: 'LINE Notify Alert sent successfully!', details: resJson };
    } else {
      // LINE Messaging API (Flex Messages) mode
      if (!config.channelAccessToken) {
        throw new Error('Missing LINE Channel Access Token');
      }
      if (!config.toUserIdOrGroupId) {
        throw new Error('Missing Destination ID (User / Group ID)');
      }

      const flexMessage = compileFlexMessagePayload(eventType, data);

      const bodyPayload = {
        channelAccessToken: config.channelAccessToken,
        to: config.toUserIdOrGroupId,
        messages: [flexMessage]
      };

      console.log('[LINE Flex] Forwarding request to proxy...');
      const response = await fetch('/api/line-flex', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyPayload)
      });

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.error || resJson.message || `HTTP ${response.status}`);
      }

      return { success: true, message: 'LINE Flex Message sent successfully!', details: resJson };
    }
  } catch (err: any) {
    console.error('[LINE Alert] Dispatch failed:', err);
    return { success: false, message: err.message || 'Unknown network error' };
  }
}
