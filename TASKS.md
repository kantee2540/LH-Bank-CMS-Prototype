# LH Bank — Backoffice CMS Prototype (React.js)

แหล่งดีไซน์: Figma **LH-Bank-Prototype › Page "BackEnd"** (node `8:1773`)
ใช้ชุดหน้าจอ **Type 2 · Role 1 Content Editor** (เวอร์ชันล่าสุด ที่แยกตาม Role) เป็นต้นแบบ

วันที่ทำ: 13/11/2026

---

## วิธีรัน

```bash
cd web_prototype
npm install
npm run dev        # เปิด http://localhost:5173
npm run typecheck  # ตรวจ type (tsc -b)
npm run build      # ตรวจ type + build ไฟล์ static ไว้ที่ dist/
```

Tech stack: React 19 + **TypeScript 5.6 (strict)** + Vite 6 · react-router-dom (HashRouter) · lucide-react (ไอคอนในเนื้อหา) · CSS ธรรมดา + Design tokens (ไม่ใช้ Tailwind)

---

## Task ที่ทำแล้ว

### 1. วิเคราะห์ดีไซน์จาก Figma
- [x] อ่านโครงสร้างไฟล์ Figma ทั้งหมด (~90 หน้าจอ แบ่งเป็น Type 1 / Type 2, Role 1 Content Editor / Role 2 Auditor และ Flow ต่าง ๆ)
- [x] ดึง Design context ของ Shell หลัก: Sidebar, Top Bar, Page Header, Dashboard (Summary, Stats, Top list)
- [x] ดึง Component กลาง: `CMS/NavItem` (Default / Active / Sub / Sub Active), `CMS/Button` (Primary / Secondary / Danger · 42 / 32), `CMS/Status` (Published / Scheduled / Draft / Expired / Rejected), `CMS/Field`
- [x] ดึง Screenshot ของหน้าหลักเพื่อใช้เป็นเป้าหมายด้านภาพ (CS-02…08, VR-01…03, CMS-04, CMS-26, CMS-27/27A/27B, TR-01)

### 2. ตั้งค่าโปรเจกต์
- [x] สร้างโปรเจกต์ React (Vite) ที่ `web_prototype/`
- [x] ดาวน์โหลด Asset จาก Figma 44 ไฟล์ (โลโก้ LH Bank, ไอคอนเมนู Sidebar, Top Bar, ไอคอนสถิติ Dashboard) → `src/assets/figma/`
- [x] สร้าง Design tokens (`src/index.css`): สี navy `#12386b`, nav active `#1f6fa8`, ข้อความ, เส้นขอบ, radius, ฟอนต์ IBM Plex Sans Thai
- [x] Mock data ตามข้อมูลในดีไซน์ (`src/data/mock.ts`) และ Store ในหน่วยความจำ (`src/store.tsx`) เพื่อให้ Flow ทำงานต่อเนื่องกันได้

### 3. Component กลาง (`src/components/`)
- [x] Button, IconButton, Field / Input / Select / Textarea, Status badge, Card, InfoBanner, Tabs
- [x] Modal, Drawer, Toast, PageHeader (Breadcrumb + ปุ่มย้อนกลับ + Badge + Actions), Pager
- [x] MediaPicker (Popup เลือกรูปจาก Library / อัปโหลดใหม่ + Alt text 3 ภาษา), MediaThumb

### 4. Layout หลัก (`src/layout/`)
- [x] Sidebar 260px ตาม Figma — เมนูครบ 21 รายการ, เมนูย่อยพับ/กางได้ (Menu, Banner, Products, Rates, Setting), ไฮไลต์เมนูที่เปิดอยู่, ช่องค้นหาเมนูกรองได้จริง
- [x] Top Bar — ปุ่มย่อ/ขยาย Sidebar, ตัวเลือกเว็บไซต์ (Personal / SME / Corporate), Role chip (คลิกสลับ Content Editor ↔ Auditor), Avatar
- [x] เลื่อนกลับขึ้นบนสุดเมื่อเปลี่ยนหน้า

### 5. หน้าจอที่ทำเป็น React แล้ว

| Figma | หน้าจอ | Route | สิ่งที่ทำงานได้ |
|---|---|---|---|
| CMS-00 | Dashboard | `/` | สรุปผู้เข้าชม + mini bar, สถิติเนื้อหา 12 ประเภท, กราฟเส้น (สลับ รายเดือน/สัปดาห์/วัน, ซ่อน/แสดง series, tooltip ตามเมาส์), Top list 12 กล่อง, ตัวกรองปี |
| CMS-26 / 26A | สถานะคำขอของฉัน | `/requests` | KPI 4 การ์ด, แท็บ รออนุมัติ/ถูกส่งกลับ/อนุมัติแล้ว/ทั้งหมด, ตัวกรอง Module + ค้นหา, Drawer รายละเอียดคำขอพร้อมไทม์ไลน์ |
| CS-02 | Manage Content — รายการเนื้อหา | `/content` | ค้นหา/กรอง Content Type, Status, Language, แบ่งหน้า + เลือกจำนวนแถว, ลิงก์ไปแก้ไข |
| CS-03 | เลือกประเภทเนื้อหา | Popup ใน `/content` | เลือก Page / Promotion / Advisory → เปิดฟอร์ม, ลิงก์ทางลัดไปโมดูลเฉพาะ |
| TR-02 | ยืนยันย้ายไปถังขยะ | Popup ใน `/content` | ลบแล้วรายการย้ายไปถังขยะจริง (ดูได้ที่ `/trash`) |
| CS-04 / 04A / 04B / 04C | ฟอร์มสร้างเนื้อหา — แท็บเนื้อหา | `/content/new` | แท็บภาษา TH / EN / 中文, Rich text editor (ตัวหนา/เอียง/List/แทรกตัวแปร `{rate:...}`), เลือกรูป Hero จาก Media Library หรืออัปโหลด, กล่อง “ความครบของภาษา” คำนวณจากข้อมูลจริง |
| CS-05 / SEO-06…09 | แท็บ SEO / AEO | `/content/new` › SEO / AEO | Meta title/description พร้อมนับตัวอักษร, Slug, ตัวอย่างผลการค้นหา (SERP) อัปเดตสด, AEO Readiness x/10 คำนวณจริง, เพิ่ม/แก้/ลบ FAQ Schema (SEO-07) |
| CS-06 | ยืนยันส่งอนุมัติ | Popup | Checklist ตรวจความพร้อมจริง — กดส่งไม่ได้ถ้าภาษาจีนยังไม่ครบหรือยังไม่เลือกรูป, เลือกผู้อนุมัติ + วันเผยแพร่ |
| CS-07 | ส่งอนุมัติแล้ว | Toast + ไป `/requests` | รายการใหม่โผล่ในสถานะคำขอ (ไฮไลต์) และใน Manage Content |
| VR-01 | ประวัติเวอร์ชันของเนื้อหา | `/content/1` | ตารางเวอร์ชัน v1–v5, ป้าย Live |
| VR-02 | ดูและเปรียบเทียบเวอร์ชัน | Popup | เทียบฟิลด์กับ v5 (Live) ไฮไลต์จุดที่ต่าง |
| VR-03 / VR-04 | กู้คืนเวอร์ชัน | Popup | เลือกส่วนที่จะกู้คืน + เหตุผล → สร้างฉบับร่าง v6 ใหม่ในตาราง |
| CMS-04 / MD-01…04 | Media | `/media` | โฟลเดอร์ + ค้นหาโฟลเดอร์, กรองชื่อ/ชนิดไฟล์, My Files, เลือกหลายไฟล์ → ลบ, อัปโหลด 2 ขั้น (เลือกไฟล์ → Alt text 3 ภาษา) |
| TR-01 / 03 / 04 | ถังขยะ | `/trash` | แท็บตามประเภท, เลือกหลายรายการ, กู้คืน (กลับเป็น Draft), ลบถาวร (ต้องพิมพ์ “ลบถาวร” ยืนยัน), ไฮไลต์ใกล้ลบ ≤ 3 วัน |
| CMS-27 | Calculator — รายการเครื่องมือคำนวณ | `/rates/calculator` | แท็บ ทั้งหมด / บุคคล / SME |
| CMS-27A | แก้ไขตัวแปรและสูตร | `/rates/calculator/:id` | ทดลองคำนวณค่างวด PMT ได้จริง (3 ล้าน · 5.69% · 30 ปี = 19,400 บาท ตรงกับดีไซน์), ปรับ rate_buffer / การปัดเศษ, ตรวจช่วงค่า, Popup แก้ไขตัวแปร |
| CMS-27B | ทดสอบสูตรและส่งอนุมัติ | แท็บ “ทดสอบสูตร” | รันชุดทดสอบ 6 กรณีด้วยสูตรจริง → ผ่าน/ไม่ผ่าน, เปรียบเทียบกับ v4, ปุ่มส่งอนุมัติถูกล็อกถ้าทดสอบไม่ผ่าน |

### 6. ย้ายภาษาเป็น TypeScript
- [x] เปลี่ยนไฟล์ทั้งหมด `.jsx/.js` → `.tsx/.ts` และเพิ่ม `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json` (strict mode, noUnusedLocals)
- [x] สร้าง Domain types กลางที่ `src/types.ts` (ContentItem, TrashItem, RequestItem, VersionItem, MediaItem, Calculator, TestCase ฯลฯ)
- [x] ใส่ type ให้ Component กลาง (props ของ Button / Field / Select / Tabs แบบ generic / Modal / PageHeader ฯลฯ) และ Store (`useStore()` คืนค่า type `Store` และ throw ถ้าไม่ได้อยู่ใน Provider)
- [x] สูตร PMT คืนค่าเป็น discriminated union (`ok: true | false`) เพื่อแยกผลลัพธ์กับข้อความแจ้งเตือนอย่างปลอดภัย
- [x] ESLint ใช้ `typescript-eslint`, คำสั่ง `build` รัน `tsc -b` ก่อน build

### 7. ตรวจสอบ
- [x] `tsc -b` ผ่าน (0 error), `eslint` ผ่าน, `npm run build` ผ่าน
- [x] เปิดทุกหน้าหลักใน Chrome หลังย้ายเป็น TypeScript — ไม่มี console error
- [x] เปิดดูใน Chrome ที่ 1440px เทียบกับ Figma: Dashboard, Manage Content, ฟอร์มสร้างเนื้อหา, Popup ส่งอนุมัติ, Calculator, ถังขยะ
- [x] แก้จุดที่พบ: ป้ายแกน Y ของกราฟถูกตัด, Path ในตารางตัดคำผิดที่, หน้าไม่เลื่อนขึ้นบนเมื่อเปลี่ยนเมนู

---

## ข้อจำกัด / สิ่งที่ปรับจากดีไซน์
- ไอคอนในเนื้อหาหน้า (ปุ่ม, ตาราง, Popup) ใช้ `lucide-react` เส้นแบบเดียวกับใน Figma; ไอคอน Sidebar / Top Bar / Dashboard ใช้ไฟล์ SVG จาก Figma โดยตรง
- รูปใน Media Library เป็นข้อมูลที่ผู้ใช้อัปโหลด จึงแสดงเป็นภาพตัวอย่างสีแทนรูปจริง
- ข้อมูลทั้งหมดเป็น Mock ในหน่วยความจำ — รีเฟรชหน้าแล้วข้อมูลกลับค่าเริ่มต้น
- ปรับมาใช้ input แบบ `datetime-local` ของเบราว์เซอร์สำหรับวันเวลา

---

## Task เฟสถัดไป (ยังเป็นหน้า Placeholder ที่บอกชื่อ Frame ใน Figma)

- [ ] CMS-01 / SEO-01…05 — SEO / AEO ระดับเว็บไซต์ (General, Advanced, AEO / AI Search)
- [ ] SCH-01…06 — Schema Flow (เลือกประเภท Schema, Map Property, Preview)
- [ ] CMS-02 / 03 — Menu Location, Set Menu
- [ ] CMS-05 / 10 — Hero Banner, Promotion Banner
- [ ] CMS-06, 06A…06E — Layout / Page Builder (Section & Widget Library, ตั้งค่า Widget, Preview Mobile)
- [ ] CMS-07 — Path Structure
- [ ] CMS-11 / 12 — Products (รายการ + แก้ไขผลิตภัณฑ์)
- [ ] CMS-13 — Life Stage
- [ ] CMS-14 / 15 — Rates อัตราดอกเบี้ย, อัตราแลกเปลี่ยน
- [ ] CMS-16…21 — Advisory, News, NPA, Form (Lead), FAQ, File Manager
- [ ] CMS-24 / 24A / 24B — AI Assistants
- [ ] CMS-22 / 23 / 25 / 25A / 25B — Setting (User & Role, Audit Log, ภาษา, การเก็บเวอร์ชัน)
- [ ] AU-01…05 — มุมมอง Auditor (Approval Inbox, Review & เปรียบเทียบ, Approve / Reject)
- [ ] CS-08 — หน้าแก้ไขเมื่อถูกส่งกลับ (แสดงความเห็น Auditor ในฟอร์ม)
- [ ] เชื่อม API จริงแทน Mock data และระบบ Login / สิทธิ์ตาม Role
