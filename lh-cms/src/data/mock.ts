import type { Calculator, ChartSeries, ContentItem, MediaItem, RequestItem, TestCase, TopList, TrashItem, VersionItem } from '../types';

/* Mock data — values taken from the Figma screens (CS-02, CMS-26, TR-01, VR-01, CMS-27 …) */

export const CONTENTS: ContentItem[] = [
  { id: 1, title: 'เงินฝากประจำพิเศษ 6 เดือน', langs: 'TH · EN', type: 'Promotion', path: '/th/personal/deposit/fixed-6m', status: 'Published', updated: '28/10/2026 14:20' },
  { id: 2, title: 'อยู่ครบ 1 ปี ก็รีได้ (Retention)', langs: 'TH · EN', type: 'Promotion', path: '/th/promotion/retention', status: 'Scheduled', updated: '27/10/2026 10:12' },
  { id: 3, title: 'สินเชื่อรีไฟแนนซ์บ้าน', langs: 'TH · EN', type: 'Product', path: '/th/personal/loan/home-loan/refinance', status: 'Published', updated: '26/10/2026 16:40' },
  { id: 4, title: 'Weekly Report 27 ต.ค. 2569', langs: 'TH', type: 'Advisory', path: '/th/advisory/weekly-report', status: 'Published', updated: '27/10/2026 08:30' },
  { id: 5, title: 'LH Bank SMART Money ม.ธรรมศาสตร์', langs: 'TH · EN', type: 'News', path: '/th/news/smart-money-tu', status: 'Published', updated: '20/10/2026 15:15' },
  { id: 6, title: 'ประกาศความเป็นส่วนตัว', langs: 'TH · EN', type: 'Page', path: '/th/privacy-notice', status: 'Published', updated: '01/10/2026 09:00' },
  { id: 7, title: 'สินเชื่อบ้านแลกเงิน', langs: 'TH', type: 'Product', path: '/th/personal/loan/home-loan/home-for-cash', status: 'Draft', updated: '29/10/2026 11:05' },
  { id: 8, title: 'เงินฝากเพื่อการศึกษาบุตร', langs: 'TH · EN', type: 'Promotion', path: '/th/personal/deposit/edu-saving', status: 'Rejected', updated: '04/11/2026 16:05', rejected: true },
  { id: 9, title: 'ประกาศอัตราดอกเบี้ย พ.ย. 2569', langs: 'TH', type: 'News', path: '/th/news/rate-nov-2026', status: 'Rejected', updated: '03/11/2026 11:30', rejected: true },
  { id: 10, title: 'คอนโดใกล้ BTS (NPA-0012)', langs: 'TH', type: 'NPA', path: '/th/npa/npa-0012', status: 'Expired', updated: '15/09/2026 13:40' },
  { id: 11, title: 'บัญชีออมทรัพย์ดิจิทัล LHB You', langs: 'TH · EN', type: 'Product', path: '/th/personal/deposit/lhb-you', status: 'Published', updated: '12/09/2026 10:00' },
  { id: 12, title: 'โปรโมชันรับเหมาเกมเมอร์ 300 เครดิต', langs: 'TH', type: 'Promotion', path: '/th/promotion/richman-300', status: 'Draft', updated: '10/09/2026 17:22' },
  { id: 13, title: 'วางแผนเกษียณฉบับคนทำงาน', langs: 'TH · EN', type: 'Advisory', path: '/th/advisory/retirement-plan', status: 'Published', updated: '02/09/2026 08:10' },
  { id: 14, title: 'เงื่อนไขการใช้บริการเว็บไซต์', langs: 'TH · EN', type: 'Page', path: '/th/terms', status: 'Published', updated: '01/09/2026 09:00' },
];

export const TRASH: TrashItem[] = [
  { id: 't1', title: 'สินเชื่อบ้านแลกเงิน', sub: 'Product · /th/personal/loan/home-loan/home-for-cash', module: 'Manage Content', group: 'Content', by: 'Content Editor 01 · 12/11/2026 16:20', days: 29 },
  { id: 't2', title: 'hero-home-q3.webp', sub: 'รูปภาพ · 1920×800 · 412 KB', module: 'Media', group: 'Media', by: 'Content Editor 02 · 11/11/2026 10:05', days: 28 },
  { id: 't3', title: 'ลูกค้าใหม่ รับ E-Voucher 100 บาท', sub: 'Hero Banner · TH · EN', module: 'Banner', group: 'Banner', by: 'Content Editor 02 · 08/11/2026 14:30', days: 25 },
  { id: 't4', title: 'เปิดบัญชีออนไลน์ต้องใช้เอกสารอะไรบ้าง', sub: 'FAQ · หมวดเงินฝาก', module: 'FAQ', group: 'อื่นๆ', by: 'Content Editor 01 · 01/11/2026 09:12', days: 18 },
  { id: 't5', title: 'LH Bank ร่วมงาน Money Expo 2025', sub: 'News · /th/news/money-expo-2025', module: 'News', group: 'Content', by: 'Content Editor 02 · 20/10/2026 11:40', days: 6 },
  { id: 't6', title: 'fee-schedule-2568.pdf', sub: 'เอกสาร PDF · 1.2 MB', module: 'File Manager', group: 'อื่นๆ', by: 'Content Editor 01 · 17/10/2026 15:02', days: 3 },
  { id: 't7', title: 'NPA-0098 คอนโดใกล้ BTS อ่อนนุช', sub: 'NPA · ขายแล้ว', module: 'NPA', group: 'อื่นๆ', by: 'Content Editor 02 · 16/10/2026 10:20', days: 2 },
  { id: 't8', title: 'Landing แคมเปญสงกรานต์ 2569', sub: 'Layout · /th/campaign/songkran-2026', module: 'Layout', group: 'อื่นๆ', by: 'Content Editor 01 · 15/10/2026 17:45', days: 1 },
  { id: 't9', title: 'promo-old-banner.jpg', sub: 'รูปภาพ · 1200×628 · 210 KB', module: 'Media', group: 'Media', by: 'Content Editor 02 · 14/10/2026 09:30', days: 1 },
  { id: 't10', title: 'สมัครบัตรเดบิตรับเงินคืน', sub: 'Promotion Banner · TH', module: 'Banner', group: 'Banner', by: 'Content Editor 01 · 13/10/2026 12:10', days: 1 },
  { id: 't11', title: 'ประกาศวันหยุดธนาคาร 2568', sub: 'News · /th/news/holiday-2568', module: 'News', group: 'Content', by: 'Content Editor 01 · 12/10/2026 08:45', days: 1 },
  { id: 't12', title: 'Footer เมนูเก่า', sub: 'Menu · Footer', module: 'Menu', group: 'อื่นๆ', by: 'Content Editor 02 · 11/10/2026 16:00', days: 1 },
];

export const REQUESTS: RequestItem[] = [
  { id: 'r1', title: 'สินเชื่อรีไฟแนนซ์บ้าน', sub: 'Layout · เปิดตรวจ 10:42', module: 'Layout', auditor: 'Auditor – Marketing', sent: '30/10 09:10', publish: '05/11/2026 09:00', state: 'Review', tab: 'pending' },
  { id: 'r2', title: 'เงินฝากประจำพิเศษ 6 เดือน', sub: 'Promotion · เปิดตรวจ 09:58', module: 'Promotion', auditor: 'Auditor – ฝ่ายเงินฝาก', sent: '30/10 09:02', publish: 'ทันที', state: 'Review', tab: 'pending' },
  { id: 'r3', title: 'Hero Banner ลำดับ 3', sub: 'Banner · แก้ไขรูปและลิงก์', module: 'Banner', auditor: 'Auditor – Marketing', sent: '29/10 16:30', publish: '01/11/2026 00:00', state: 'Queue', tab: 'pending' },
  { id: 'r4', title: 'อัตราดอกเบี้ยเงินฝาก 11/2026', sub: 'Rates · อัปเดตตาราง', module: 'Rates', auditor: 'Auditor – ฝ่ายเงินฝาก', sent: '29/10 14:12', publish: '01/11/2026 00:00', state: 'Queue', tab: 'pending' },
  { id: 'r5', title: 'FAQ หมวดบัตรเครดิต', sub: 'FAQ · เพิ่ม 3 คำถาม', module: 'FAQ', auditor: 'Auditor – Marketing', sent: '28/10 17:45', publish: 'ทันที', state: 'Queue', tab: 'pending' },
  { id: 'r6', title: 'LH Bank ร่วมงาน Money Expo', sub: 'News · สร้างใหม่', module: 'News', auditor: 'Auditor – Marketing', sent: '28/10 11:20', publish: '02/11/2026 09:00', state: 'Queue', tab: 'pending' },
  { id: 'r7', title: 'เงินฝากเพื่อการศึกษาบุตร', sub: 'Promotion · ขาด Disclaimer', module: 'Promotion', auditor: 'Auditor – ฝ่ายเงินฝาก', sent: '04/11 10:00', publish: '—', state: 'Rejected', tab: 'rejected' },
  { id: 'r8', title: 'Weekly Report 27 ต.ค. 2569', sub: 'Advisory · เผยแพร่แล้ว', module: 'Advisory', auditor: 'Auditor – Marketing', sent: '26/10 15:00', publish: '27/10/2026 08:30', state: 'Published', tab: 'approved' },
  { id: 'r9', title: 'อยู่ครบ 1 ปี ก็รีได้ (Retention)', sub: 'Promotion · ตั้งเวลาเผยแพร่', module: 'Promotion', auditor: 'Auditor – Marketing', sent: '25/10 11:30', publish: '15/11/2026 00:00', state: 'Scheduled', tab: 'approved' },
];

export const VERSIONS: VersionItem[] = [
  { v: 'v5', live: true, status: 'Published', summary: 'ใช้ตัวแปร {rate:fd-6m} แทนตัวเลข · เปลี่ยนรูป Hero · ปรับช่วงเวลาแสดงผล', by: 'Content Editor 01', approver: 'อนุมัติโดย Auditor – Marketing', date: '01/11/2026' },
  { v: 'v4', status: 'Expired', summary: 'เพิ่ม FAQ 3 ข้อ · แก้คำโปรยภาษาอังกฤษ', by: 'Content Editor 02', date: '20/10/2026' },
  { v: 'v3', status: 'Expired', summary: 'ขยายช่วงเวลาแสดงผลถึง 31/12/2026 · ใช้รูป Hero ชุดแรก', by: 'Content Editor 01', date: '05/10/2026' },
  { v: 'v2', status: 'Rejected', summary: 'เปลี่ยนเงื่อนไขฝากขั้นต่ำ · ส่งกลับ: ขาด Disclaimer', by: 'Content Editor 02', date: '28/09/2026' },
  { v: 'v1', status: 'Expired', summary: 'สร้างเนื้อหาครั้งแรก', by: 'Content Editor 01', date: '15/09/2026' },
];

export const MEDIA_FOLDERS: string[] = ['Homepage Banner', 'Promotion', 'Life Stage', 'Products', 'Advisory', 'News & Activity', 'Documents (PDF)', 'Logo & Brand'];

export const MEDIA: MediaItem[] = [
  { name: 'hero-evoucher-200.jpg', folder: 'Homepage Banner', kind: 'image', hue: 330, mine: true },
  { name: 'promo-fixed-6m.jpg', folder: 'Promotion', kind: 'image', hue: 195, mine: true },
  { name: 'promo-retention.jpg', folder: 'Promotion', kind: 'image', hue: 160 },
  { name: 'promo-richman-300.jpg', folder: 'Promotion', kind: 'image', hue: 50, warn: true },
  { name: 'lifestage-first-job.jpg', folder: 'Life Stage', kind: 'image', hue: 30 },
  { name: 'lifestage-family.jpg', folder: 'Life Stage', kind: 'image', hue: 110, mine: true },
  { name: 'advisory-weekly.jpg', folder: 'Advisory', kind: 'image', hue: 185 },
  { name: 'news-smart-money.jpg', folder: 'News & Activity', kind: 'image', hue: 220 },
  { name: 'app-lhb-you.png', folder: 'Products', kind: 'image', hue: 210 },
  { name: 'logo-lhbank-color.svg', folder: 'Logo & Brand', kind: 'logo' },
  { name: 'fee-schedule-2569.pdf', folder: 'Documents (PDF)', kind: 'pdf' },
  { name: 'fact-sheet-LHAI.pdf', folder: 'Documents (PDF)', kind: 'pdf', error: true },
];

export const CALCULATORS: Calculator[] = [
  { id: 'home-1st-class', name: 'คำนวณสินเชื่อบ้านใหม่ Home 1st Class', path: '/calculator/home-1st-class', formula: 'ค่างวดคงที่ (PMT)', ref: 'สินเชื่อบ้านใหม่ · MRR', v: 'v4', status: 'Published', seg: 'personal' },
  { id: 'home-refinance', name: 'คำนวณสินเชื่อบ้าน HOME REFINANCE', path: '/calculator/home-refinance', formula: 'ค่างวดคงที่ (PMT)', ref: 'สินเชื่อบ้านรีไฟแนนซ์', v: 'v3', status: 'Published', seg: 'personal' },
  { id: 'refinance-saving', name: 'คำนวณความประหยัดจากการรีไฟแนนซ์', path: '/calculator/refinance-saving', formula: 'เปรียบเทียบค่างวด', ref: 'รีไฟแนนซ์ + อัตราเดิมที่กรอก', v: 'v2', status: 'Published', seg: 'personal' },
  { id: 'home-4cash', name: 'คำนวณสินเชื่อบ้าน Home 4Cash', path: '/calculator/home-4cash', formula: 'ค่างวดคงที่ (PMT)', ref: 'สินเชื่อบ้านแลกเงิน', v: 'v2', status: 'Published', seg: 'personal' },
  { id: 'home-2nd-hand', name: 'คำนวณสินเชื่อบ้านมือสอง Home 2nd Hand', path: '/calculator/home-2nd-hand', formula: 'ค่างวดคงที่ (PMT)', ref: 'สินเชื่อบ้านมือสอง', v: 'v2', status: 'Scheduled', seg: 'personal' },
  { id: 'happy-cash', name: 'คำนวณสินเชื่อส่วนบุคคล Happy Cash', path: '/calculator/happy-cash', formula: 'ค่างวดตามรายได้', ref: 'สินเชื่อส่วนบุคคล', v: 'v3', status: 'Published', seg: 'personal' },
  { id: 'fixed-deposit', name: 'คำนวณเงินฝากประจำ', path: '/calculator/fixed-deposit', formula: 'ดอกเบี้ยรับสุทธิ', ref: 'เงินฝากประจำ 3–24 เดือน', v: 'v1', status: 'Published', seg: 'personal' },
  { id: 'sme-installment', name: 'คำนวณหาอัตราผ่อนชำระ (SME)', path: '/sme/calculator/installment', formula: 'ค่างวดคงที่ (PMT)', ref: 'สินเชื่อ SME', v: 'v2', status: 'Draft', seg: 'sme' },
  { id: 'sme-loan-limit', name: 'คำนวณหาวงเงินกู้ (SME)', path: '/sme/calculator/loan-limit', formula: 'วงเงินจากค่างวด (PV)', ref: 'สินเชื่อ SME', v: 'v1', status: 'Published', seg: 'sme' },
];

export const TEST_CASES: TestCase[] = [
  { amount: 3000000, rate: 5.69, years: 30, expected: 19400 },
  { amount: 2000000, rate: 5.69, years: 3, expected: 61500 },
  { amount: 5000000, rate: 4.25, years: 25, expected: 30000 },
  { amount: 10000000, rate: 6.1, years: 20, expected: 78200 },
  { amount: 50000000, rate: 5.69, years: 30, expected: 322400 },
  { amount: 1500000, rate: 5.69, years: 30, expected: 'แจ้งเตือน: ต่ำกว่า 2 ล้านบาท' },
];

/* Dashboard — visitors per month (ม.ค.–ต.ค. 2569) */
export const MONTHS: string[] = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
export const VISITOR_SERIES: ChartSeries[] = [
  { key: 'all', label: 'All Website Visitors', color: '#2f86c1', width: 2.5, data: [820, 760, 910, 880, 1020, 990, 1150, 1210, 1080, 1297] },
  { key: 'page', label: 'หน้าเพจ', color: '#5ab4b8', data: [370, 345, 410, 395, 460, 448, 520, 548, 488, 584] },
  { key: 'product', label: 'ผลิตภัณฑ์', color: '#8e64a8', data: [180, 168, 198, 192, 224, 218, 252, 266, 236, 285] },
  { key: 'promo', label: 'โปรโมชัน', color: '#e8a557', data: [148, 138, 165, 160, 185, 180, 205, 216, 192, 232] },
  { key: 'news', label: 'ข่าวสาร', color: '#e3917f', data: [62, 58, 70, 68, 80, 77, 88, 93, 83, 100] },
  { key: 'npa', label: 'ทรัพย์ NPA', color: '#9aa096', data: [38, 35, 42, 41, 48, 46, 53, 56, 50, 60] },
];

export const TOP_LISTS: TopList[] = [
  { title: 'คำค้นหายอดนิยม', rows: [['รีไฟแนนซ์', 214], ['ดอกเบี้ยเงินฝาก', 168], ['สินเชื่อบ้าน', 151], ['อัตราแลกเปลี่ยน', 97], ['LHB You', 88]] },
  { title: 'เพจยอดนิยม', rows: [['หน้าแรก', 4120], ['สินเชื่อบ้าน', 1854], ['เงินฝากประจำ', 1320], ['อัตราดอกเบี้ย', 1105], ['ติดต่อเรา', 642]] },
  { title: 'โปรโมชัน', rows: [['เงินฝากประจำพิเศษ 6 เดือน', 812], ['อยู่ครบ 1 ปี ก็รีได้', 604], ['ลูกค้าใหม่ รับ E-Voucher', 455], ['โปรเกมเมอร์ 300 เครดิต', 301]] },
  { title: 'ผลิตภัณฑ์', rows: [['สินเชื่อรีไฟแนนซ์บ้าน', 920], ['สินเชื่อบ้านใหม่ Home 1st Class', 774], ['บัญชี LHB You', 512], ['สินเชื่อบ้านแลกเงิน', 388]] },
  { title: 'ข่าวสารและกิจกรรม', rows: [['LH Bank SMART Money', 342], ['ประกาศอัตราดอกเบี้ย', 288], ['Money Expo 2025', 140]] },
  { title: 'คำถามที่พบบ่อย', rows: [['เปิดบัญชีออนไลน์', 266], ['ลืมรหัส LHB You', 204], ['ค่าธรรมเนียมโอน', 117]] },
  { title: 'ทรัพย์ NPA ยอดนิยม', rows: [['คอนโดใกล้ BTS (NPA-0012)', 198], ['ทาวน์โฮม บางนา', 154], ['ที่ดิน เชียงใหม่', 96]] },
  { title: 'LH Bank Advisory (ดาวน์โหลด)', rows: [['Weekly Report', 412], ['Monthly Outlook', 256], ['Fund Fact Sheet', 133]] },
  { title: 'รายการติดต่อกลับ (Lead) ตามผลิตภัณฑ์', rows: [['สินเชื่อบ้าน', 48], ['รีไฟแนนซ์', 27], ['สินเชื่อ SME', 12], ['เงินฝาก', 9]] },
  { title: 'ช่วงชีวิต (คลิก)', rows: [['เริ่มทำงาน', 321], ['สร้างครอบครัว', 288], ['มีบ้านหลังแรก', 245], ['วางแผนเกษียณ', 132]] },
  { title: 'Banner (คลิก)', rows: [['Hero — E-Voucher 200', 1204], ['Hero — ฝากประจำ 6 เดือน', 986], ['Promotion — Retention', 433]] },
  { title: 'เอกสารดาวน์โหลด', rows: [['ตารางค่าธรรมเนียม 2569', 520], ['แบบฟอร์มขอสินเชื่อ', 344], ['Fact Sheet LHAI', 121]] },
];
