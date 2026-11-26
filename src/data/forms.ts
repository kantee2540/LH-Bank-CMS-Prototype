/* Dynamic Form — นิยามฟอร์ม (ฟิลด์กำหนดเองได้) และข้อมูลที่ส่งเข้ามาจากหน้าเว็บ */

export type FieldType = 'text' | 'email' | 'phone' | 'number' | 'select' | 'textarea' | 'date' | 'checkbox';
export type LeadStatus = 'ใหม่' | 'กำลังติดต่อ' | 'ติดต่อแล้ว' | 'ไม่สำเร็จ';
export const LEAD_STATUSES: LeadStatus[] = ['ใหม่', 'กำลังติดต่อ', 'ติดต่อแล้ว', 'ไม่สำเร็จ'];
export const ST_CLASS: Record<LeadStatus, string> = { ใหม่: 'new', กำลังติดต่อ: 'doing', ติดต่อแล้ว: 'done', ไม่สำเร็จ: 'fail' };

export const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'ข้อความสั้น' },
  { value: 'textarea', label: 'ข้อความยาว' },
  { value: 'email', label: 'อีเมล' },
  { value: 'phone', label: 'เบอร์โทรศัพท์' },
  { value: 'number', label: 'ตัวเลข' },
  { value: 'select', label: 'ตัวเลือก (Dropdown)' },
  { value: 'checkbox', label: 'ช่องทำเครื่องหมาย (เลือกได้หลายข้อ)' },
  { value: 'date', label: 'วันที่' },
];

export interface FormField {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  /** แสดงเป็นคอลัมน์ในตาราง Submissions */
  inList: boolean;
  /** ข้อมูลส่วนบุคคล — ปิดบังจนกว่าจะกด "แสดงข้อมูลเต็ม" (บันทึก Audit Log) */
  pii?: boolean;
  options?: string[];
  placeholder?: string;
}

export interface FormDef {
  id: string;
  name: string;
  desc: string;
  status: 'Published' | 'Draft';
  path: string;
  notify: string;
  retention: string;
  updated: string;
  fields: FormField[];
}

export interface Submission {
  id: string;
  formId: string;
  /** dd/mm/yyyy hh:mm */
  date: string;
  status: LeadStatus;
  channel: string;
  owner?: string;
  note?: string;
  data: Record<string, string>;
}

export const CHANNELS = ['Website', 'Facebook', 'LINE', 'Google', 'TikTok'];
export const OWNERS = ['ทีม Telesales', 'ทีมบัตรเครดิต', 'ทีม NPA', 'RM ธุรกิจ', 'สาขาสยามพารากอน'];

const f = (key: string, label: string, type: FieldType, opts: Partial<FormField> = {}): FormField => ({ key, label, type, required: true, inList: false, ...opts });
const NAME = [f('first', 'ชื่อ', 'text', { inList: true, pii: true }), f('last', 'นามสกุล', 'text', { inList: true, pii: true })];
const PHONE = f('phone', 'เบอร์โทรศัพท์', 'phone', { inList: true, pii: true });
const EMAIL = f('email', 'อีเมล', 'email', { pii: true });
const CONSENT = f('consent', 'ยินยอมตามนโยบายความเป็นส่วนตัว (PDPA)', 'checkbox', { options: ['ยินยอม'] });

export const FORMS: FormDef[] = [
  {
    id: 'drop', name: 'Drop-lead Form', desc: 'ฟอร์มให้ติดต่อกลับ ติดอยู่ท้ายหน้าผลิตภัณฑ์', status: 'Published', path: 'ทุกหน้าผลิตภัณฑ์', notify: 'telesales@lhbank.co.th', retention: '1 ปี', updated: '20/11/2026',
    fields: [...NAME, PHONE, { ...EMAIL, required: false }, f('product', 'ผลิตภัณฑ์ที่สนใจ', 'select', { inList: true, options: ['สินเชื่อบ้านใหม่', 'สินเชื่อรีไฟแนนซ์บ้าน', 'สินเชื่อส่วนบุคคล', 'เงินฝากประจำ', 'กองทุนรวม', 'หุ้นกู้ / Structured Notes'] }), f('time', 'เวลาที่สะดวกให้ติดต่อ', 'select', { required: false, options: ['09:00 – 12:00', '12:00 – 15:00', '15:00 – 18:00', '18:00 – 20:00'] }), CONSENT],
  },
  {
    id: 'card', name: 'สมัครบัตรเครดิต', desc: 'ฟอร์มสมัครบัตรเครดิตออนไลน์', status: 'Published', path: '/th/personal/credit-card/apply', notify: 'cards@lhbank.co.th', retention: '1 ปี', updated: '24/11/2026',
    fields: [...NAME, PHONE, { ...EMAIL, inList: true }, f('income', 'รายได้ต่อเดือน', 'select', { inList: true, options: ['15,000 – 30,000 บาท', '30,001 – 50,000 บาท', '50,001 – 100,000 บาท', 'มากกว่า 100,000 บาท'] }), CONSENT],
  },
  {
    id: 'npa', name: 'จองซื้อทรัพย์ NPA', desc: 'นัดชมทรัพย์ / แสดงความสนใจซื้อทรัพย์สินรอการขาย', status: 'Published', path: '/th/property-for-sale/asset-for-sale', notify: 'npa@lhbank.co.th', retention: '2 ปี', updated: '15/11/2026',
    fields: [...NAME, PHONE, f('asset', 'รหัสทรัพย์', 'select', { inList: true, options: ['NPA-0101 บ้านเดี่ยว 2 ชั้น', 'NPA-0102 คอนโดใกล้รถไฟฟ้า', 'NPA-0103 ทาวน์โฮม 3 ชั้น', 'NPA-0104 ที่ดินเปล่า'] }), f('visit', 'วันที่ต้องการนัดชม', 'date', { inList: true, required: false }), CONSENT],
  },
  {
    id: 'rm', name: 'ติดต่อ RM (Sustainability)', desc: 'ลูกค้าธุรกิจสนใจสินเชื่อเพื่อความยั่งยืน', status: 'Published', path: '/th/business/sustainability', notify: 'rm.business@lhbank.co.th', retention: '2 ปี', updated: '02/11/2026',
    fields: [f('company', 'ชื่อบริษัท', 'text', { inList: true }), f('contact', 'ชื่อผู้ติดต่อ', 'text', { inList: true, pii: true }), PHONE, { ...EMAIL, inList: true }, f('topic', 'เรื่องที่สนใจ', 'select', { inList: true, options: ['Sustainability-linked Loan', 'Green Loan', 'Solar Rooftop Financing'] }), f('message', 'รายละเอียดเพิ่มเติม', 'textarea', { required: false }), CONSENT],
  },
  {
    id: 'news', name: 'สมัครรับข่าวสาร', desc: 'สมัครรับจดหมายข่าวทางอีเมล', status: 'Published', path: 'Footer ทุกหน้า', notify: 'marketing@lhbank.co.th', retention: 'จนกว่าจะยกเลิก', updated: '01/10/2026',
    fields: [{ ...EMAIL, inList: true }, f('topics', 'หัวข้อที่สนใจ', 'checkbox', { inList: true, options: ['โปรโมชัน', 'บทวิเคราะห์การลงทุน', 'ข่าวธนาคาร'] }), CONSENT],
  },
];

/* ---------- Mock submissions (สร้างแบบ deterministic ให้ Dashboard มีข้อมูล) ---------- */
const FIRST = ['กมล', 'มานี', 'ธนา', 'ปรีชา', 'ศิริ', 'พิมพ์', 'สมชาย', 'อรุณ', 'วรรณ', 'นภา', 'ชัยวัฒน์', 'กานต์'];
const LAST = ['สุขใจ', 'รักดี', 'วงศ์ไทย', 'จันทร์งาม', 'กิตติกุล', 'ชัยมงคล', 'มีสุข', 'ประเสริฐ', 'ทองดี', 'ศรีสวัสดิ์'];
const COMPANIES = ['บริษัท กรีนเอนเนอร์ยี่ จำกัด', 'บริษัท สยามโซลาร์ จำกัด', 'บริษัท ไทยแพ็ค จำกัด'];
const WEIGHT: Record<string, number> = { drop: 5, card: 4, npa: 2, rm: 1, news: 3 };

function rnd(seed: number) {
  let s = seed;
  return () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
}
const pick = <T,>(r: () => number, a: T[]) => a[Math.floor(r() * a.length)];
const pad = (n: number) => String(n).padStart(2, '0');

function buildSubmissions(): Submission[] {
  const r = rnd(42);
  const out: Submission[] = [];
  // 30 วันล่าสุด ถึง 26/11/2026
  for (let d = 29; d >= 0; d--) {
    const day = new Date(2026, 10, 26 - d);
    for (const form of FORMS) {
      const n = Math.floor(r() * (WEIGHT[form.id] + 1) + (day.getDay() % 6 === 0 ? 0 : WEIGHT[form.id] / 2));
      for (let i = 0; i < n; i++) {
        const fi = pick(r, FIRST), la = pick(r, LAST);
        const data: Record<string, string> = {};
        for (const fl of form.fields) {
          if (fl.key === 'first') data.first = fi;
          else if (fl.key === 'last') data.last = la;
          else if (fl.key === 'contact') data.contact = `${fi} ${la}`;
          else if (fl.key === 'company') data.company = pick(r, COMPANIES);
          else if (fl.type === 'phone') data[fl.key] = `08${Math.floor(r() * 10)}-${String(Math.floor(r() * 900) + 100)}-${String(Math.floor(r() * 9000) + 1000)}`;
          else if (fl.type === 'email') data[fl.key] = `${['k', 'm', 't', 'p', 's'][Math.floor(r() * 5)]}${la.length}${Math.floor(r() * 90) + 10}@example.com`;
          else if (fl.key === 'consent') data.consent = 'ยินยอม';
          else if (fl.type === 'select') data[fl.key] = pick(r, fl.options ?? ['—']);
          else if (fl.type === 'checkbox') data[fl.key] = (fl.options ?? []).filter(() => r() > 0.45).join(', ') || (fl.options?.[0] ?? '');
          else if (fl.type === 'date') data[fl.key] = `${pad(Math.min(28, day.getDate() + 3))}/12/2026`;
          else if (fl.required) data[fl.key] = 'สนใจรายละเอียดเพิ่มเติม';
        }
        // ยิ่งเก่ายิ่งมีโอกาสถูกติดต่อแล้ว
        const x = r();
        const status: LeadStatus = d <= 1 ? (x < 0.75 ? 'ใหม่' : 'กำลังติดต่อ') : d <= 5 ? (x < 0.2 ? 'ใหม่' : x < 0.55 ? 'กำลังติดต่อ' : x < 0.9 ? 'ติดต่อแล้ว' : 'ไม่สำเร็จ') : x < 0.08 ? 'กำลังติดต่อ' : x < 0.85 ? 'ติดต่อแล้ว' : 'ไม่สำเร็จ';
        const ch = r();
        out.push({
          id: `${form.id}-${out.length + 1}`,
          formId: form.id,
          date: `${pad(day.getDate())}/${pad(day.getMonth() + 1)}/${day.getFullYear()} ${pad(8 + Math.floor(r() * 13))}:${pad(Math.floor(r() * 60))}`,
          status,
          channel: ch < 0.45 ? 'Website' : ch < 0.68 ? 'Facebook' : ch < 0.84 ? 'LINE' : ch < 0.95 ? 'Google' : 'TikTok',
          owner: status === 'ใหม่' ? undefined : pick(r, OWNERS),
          note: status === 'ไม่สำเร็จ' ? 'ติดต่อไม่ได้ 3 ครั้ง' : undefined,
          data,
        });
      }
    }
  }
  return out.reverse();
}

export const SUBMISSIONS: Submission[] = buildSubmissions();

/* วันที่ dd/mm/yyyy hh:mm → yyyy-mm-dd สำหรับเทียบช่วงเวลา */
export const isoOf = (date: string) => { const [d, m, y] = date.slice(0, 10).split('/'); return `${y}-${m}-${d}`; };

/* ปิดบังข้อมูลส่วนบุคคล */
export function mask(type: FieldType, v: string): string {
  if (!v) return '—';
  if (type === 'phone') return v.replace(/^(\d{2})\d-\d{3}-\d(\d{3})$/, '$1x-xxx-x$2');
  if (type === 'email') { const [u, d] = v.split('@'); return `${u[0]}****@${d?.[0] ?? ''}******.${d?.split('.').pop() ?? ''}`; }
  return `${[...v][0]}*****`;
}
