# LH Bank — Backoffice CMS Prototype (React + TypeScript)

แหล่งดีไซน์: Figma **LH-Bank-Prototype › Page "BackEnd"** (node `8:1773`)
ใช้ชุดหน้าจอ **Type 2** (Role 1 Content Editor + Role 2 Auditor) เป็นต้นแบบ

อัปเดตล่าสุด: 17/11/2026

---

## วิธีรัน

```bash
cd web_prototype
npm install
npm run dev        # เปิด http://localhost:5173
npm run typecheck  # ตรวจ type (tsc -b)
npm run build      # ตรวจ type + build ไฟล์ static ไว้ที่ dist/
```

Tech stack: React 19 + **TypeScript 5.6 (strict)** + Vite 6 · react-router-dom (HashRouter) · lucide-react · CSS + Design tokens (ไม่ใช้ Tailwind)

**ทดลองสลับบทบาท:** คลิก Role chip มุมขวาบน (Content Editor ↔ Auditor) หรือเข้า `/#/login` · Auditor จะเห็นเมนู “งานรออนุมัติ” แทน “สถานะคำขอของฉัน”

---

## สรุปขอบเขต

| | จำนวน |
|---|---|
| Route ทั้งหมดในแอป | 53 (ทุกหน้าโหลดได้ ไม่มี console error) |
| หน้าจอจาก Figma ที่ทำเป็น React | ครบทุกหน้าจอใน Type 2 (CMS-00 … CMS-27B, CS-02 … CS-08, AU-01 … AU-05, SEO-01 … SEO-09, SCH-01 … SCH-06, MD-01 … MD-04, VR-01 … VR-04, TR-01 … TR-04) |
| หน้าจอ / Popup ที่ออกแบบเพิ่ม (ไม่มีใน Figma) | 30+ (ดูหัวข้อ C) |
| หน้าจอเพิ่มเติมที่ใส่ลง Figma แล้ว | 8 หน้าจอ + 8 Popup (ดูหัวข้อ D) |

---

## A. เฟส 1 — Shell, Component กลาง และ Flow หลัก (ทำแล้ว)

- [x] ดึง Design context / Asset 44 ไฟล์จาก Figma (โลโก้ ไอคอน Sidebar / Top Bar / Dashboard)
- [x] Design tokens + Component กลาง: Button, Field, Status, Card, Tabs, Modal, Drawer, Toast, PageHeader, Pager
- [x] Layout: Sidebar (เมนูครบ 21 รายการ + เมนูย่อย + ค้นหาเมนู), Top Bar (สลับเว็บไซต์ / Role)
- [x] Dashboard, Manage Content, ฟอร์มเนื้อหา + SEO/AEO + ส่งอนุมัติ, ประวัติเวอร์ชัน, Media, ถังขยะ, สถานะคำขอ, Calculator
- [x] ย้ายเป็น TypeScript (strict) + Domain types ที่ `src/types.ts`

## B. เฟส 2 — ทำหน้าจอจาก Figma ให้ครบ (ทำแล้ว)

### Component ใหม่ที่ใช้ร่วมกัน
- [x] `ListPage` — แม่แบบหน้า List (ตัวกรอง → การ์ด → ตาราง → แบ่งหน้า) ใช้ร่วม 15+ หน้า
- [x] `ModuleForm` — แม่แบบฟอร์มสร้าง/แก้ไข (เนื้อหาตามภาษา + การเผยแพร่ + ภาพประกอบ + แถบปุ่มล่าง) จาก pattern CMS-08 / CMS-12
- [x] `Toggle`, `TagInput` (Keywords), `KV`, `LangSwitch`, Stepper
- [x] Store: `submitRequest` (ทุกโมดูลส่งอนุมัติได้) และ `decideRequest` (Auditor อนุมัติ / ส่งกลับ) — ข้อมูลไหลระหว่าง 2 Role

### หน้าจอที่ทำเพิ่ม

| Figma | หน้าจอ | Route | สิ่งที่ทำงานได้ |
|---|---|---|---|
| CMS-01 · SEO-01…05 | SEO / AEO ระดับเว็บไซต์ | `/seo` | โหมดดู / แก้ไข, แท็บ General · Advanced · AEO, แท็บภาษา, Keywords กด Enter, SERP Preview สด, Toggle AI Crawler, ส่งอนุมัติ |
| SCH-01 · SCH-02 | Schema — รายการ + เลือกประเภท | `/seo` › แท็บ Schema | กรองรายการ, Popup เลือกประเภท (ประเภทที่มีได้ 1 รายการถูกล็อก) |
| SCH-03…06 | สร้าง Schema (3 ขั้นตอน) | `/seo/schema/new` | Apply to (Global / ประเภทเนื้อหา / Path), Map Property (เพิ่ม/ลบ, JSON-LD อัปเดตสด, คัดลอก), ผลตรวจ + Rich Result Preview, ส่งอนุมัติ |
| CMS-02 | Menu Location | `/menu/location` | แท็บภาษา, Popup เลือก Set Menu ต่อตำแหน่ง |
| CMS-03 | Set Menu | `/menu/set` | กรอง 4 ตัว, ลบ |
| CMS-05 · CMS-10 | Hero / Promotion Banner | `/banner/hero`, `/banner/promotion` | กรอง, Move Order (↑↓), ลบ, ไปฟอร์มแก้ไข |
| CMS-06A | Layout — รายการ | `/layout` | แท็บ Template, ทำสำเนา, ลบ, สร้างจาก Template |
| CMS-06 · 06B | Edit Layout — General / Page Builder | `/layout/:id` | เลือก Template, Global components, Page Builder: เลือก Section/Widget, ย้าย ↑↓, ทำสำเนา, ลบ, Undo / Redo, แผงตั้งค่า Section (Anchor, Data Source, Background) |
| CMS-06C | เพิ่ม Section + Widget Library | Page Builder | เลือกกริด 8 แบบ → เพิ่ม Section → เลือก Widget จาก Library |
| CMS-06D | ตั้งค่า Widget (Calculator) | Page Builder | โหมดคำนวณ, ธีม (เข้ม/สว่าง/มิ้นต์) พรีวิวสดบน Canvas |
| CMS-06E | Preview Mobile + ประวัติเวอร์ชัน | Page Builder › Mobile | Mockup มือถือ, แผงเวอร์ชัน v9–v13 |
| CMS-07 | Path Structure | `/path` | Tree พับ/กาง, แท็บภาษา, Move Order, เพิ่ม Path ย่อย, แก้ไข, ลบ |
| CMS-11 · CMS-12 | Products — สินเชื่อ / แก้ไขผลิตภัณฑ์ | `/products/loan`, `/products/loan/:id` | แท็บกลุ่ม, Move Order, ฟอร์ม 7 แท็บ (Calculator ตาม Figma + พรีวิวสลับโหมด) |
| CMS-13 | Life Stage | `/life-stage` | เลือกช่วงชีวิต, เรียงลำดับ, สี/ไอคอน, เพิ่ม/ลบผลิตภัณฑ์แนะนำ |
| CMS-14 · CMS-15 | อัตราดอกเบี้ย / อัตราแลกเปลี่ยน | `/rates/interest`, `/rates/exchange` | แท็บเงินฝาก/สินเชื่อ/ค่าธรรมเนียม/ประวัติ, แก้ไข → ส่งอนุมัติ, Import Excel, ดึงข้อมูล Treasury, จำกัดแสดงหน้าแรก 4 สกุล |
| CMS-16 · 17 · 18 | Advisory / News / NPA | `/advisory`, `/news`, `/npa` | ตัวกรอง, แท็บหมวด, ปักหมุดข่าว (สูงสุด 3), ราคา NPA 2 ราคา, แท็บรายการจองซื้อ |
| CMS-19 | Form — รายการติดต่อกลับ | `/form` | KPI, 4 แท็บฟอร์ม, ข้อมูลถูกปิดบัง (PDPA) |
| CMS-20 · CMS-21 | FAQ / File Manager | `/faq`, `/files` | Move Order, คัดลอก URL, อัปโหลดเวอร์ชันใหม่ (URL เดิม) |
| CMS-22 · CMS-23 | User & Role / Audit Log | `/setting/users`, `/setting/audit` | Active toggle, ตารางสิทธิ์ 2 Role, Log + Popup รายละเอียด (ก่อน/หลัง) |
| CMS-24 · 24A · 24B | AI Assistants | `/ai`, `/ai/:id`, `/ai/:id/settings` | เปิด/ปิด Assistant, Workspace แชท + ใส่ผลลงฟิลด์ + AI Search Readiness, แหล่งข้อมูล & Guardrails |
| CMS-25 · 25A · 25B | ภาษา / การเก็บเวอร์ชัน | `/setting/language`, `/setting/revision` | ตั้งค่าภาษาจีน, Fallback, Stepper 1–10, Popup ยืนยันลดเวอร์ชัน |
| AU-01 … AU-05 | Auditor — Approval Flow | `/approval`, `/approval/:id`, `/approval/:id/result` | SLA, เปรียบเทียบ v12 → v13, Checklist (ต้องครบจึงอนุมัติ), ความคิดเห็น, Popup อนุมัติ (ทันที/ตั้งเวลา) และส่งกลับ (เลือกเหตุผล/Section), Approval Trail |
| CS-08 | ถูกส่งกลับแก้ไข | `/content/8` | แบนเนอร์เหตุผลจาก Auditor, สถานะ “ต้องแก้ไข”, รอบที่ 2, แก้แล้วส่งใหม่ได้ |

## C. หน้าจอที่ไม่มีใน Figma — ออกแบบและพัฒนาเพิ่ม

| รหัส | หน้าจอ / Popup | Route / ที่อยู่ | ใส่ลง Figma |
|---|---|---|---|
| LG-00 | เข้าสู่ระบบ (SSO + เลือกบทบาทในโหมด Prototype) | `/login` | ✅ |
| ER-404 | ไม่พบหน้า | ทุก Path ที่ไม่มี | ✅ |
| PD-01 | Products — เงินฝาก (Template เดียวกับสินเชื่อ) | `/products/deposit` | ✅ |
| PD-02 | แท็บอื่นของฟอร์มผลิตภัณฑ์ (ข้อมูลทั่วไป, จุดเด่น, ดอกเบี้ย, เอกสาร, FAQ, SEO) | `/products/:line/:id` | — |
| SM-01 | Set Menu — แก้ไขรายการเมนูแบบลำดับชั้น | `/menu/set/:id` | ✅ |
| BN-01 | สร้าง / แก้ไขแบนเนอร์ | `/banner/hero/new` | ✅ |
| NW-01 | สร้าง / แก้ไขข่าว | `/news/new` | ✅ |
| NP-01 | เพิ่ม / แก้ไขทรัพย์ NPA | `/npa/:id` | ✅ |
| AD-01 · FQ-01 | ฟอร์ม Advisory / FAQ | `/advisory/:id`, `/faq/:id` | — (pattern เดียวกับ NW-01) |
| FM-01 | รายละเอียด Lead (Drawer + เปิดดูข้อมูลเต็ม) | `/form` › ดูรายละเอียด | ✅ |
| FM-02 | ตั้งค่าฟอร์ม | `/form` › ตั้งค่าฟอร์ม | — |
| PS-01 | Popup เพิ่ม / แก้ไข Path | `/path` | ✅ |
| RT-01 · RT-02 | Popup แก้ไขอัตรา / Import Excel | `/rates/interest` | ✅ |
| FX-01 · FX-02 | Popup แก้อัตราแลกเปลี่ยนด้วยมือ / ประวัติอัตรา | `/rates/exchange` | — |
| US-01 · US-02 | Popup เพิ่มผู้ใช้ / สิทธิ์ของ Role | `/setting/users` | ✅ |
| AL-01 | Popup รายละเอียด Audit Log | `/setting/audit` | — |
| LG-01 | Popup เพิ่มภาษา | `/setting/language` | ✅ |
| AI-01 | Popup สร้าง Assistant | `/ai` | ✅ |
| FL-01 | Popup อัปโหลดเวอร์ชันใหม่ (File Manager) | `/files` | ✅ |
| — | กระดิ่งแจ้งเตือน (จำนวนงานรอ) + เมนูผู้ใช้ / ออกจากระบบ | Top Bar | — |

## D. สิ่งที่ใส่ลง Figma

Section ใหม่ **“Type 2 · ออกแบบเพิ่มเติม (จาก React Prototype)”** (node `304:34335`) อยู่ทางขวาของ Type 2 ในหน้า BackEnd

- สร้างจาก Component เดิมของไฟล์: `CMS/Button`, `CMS/Field`, `CMS/Status`, `CMS/NavItem` + Text Styles (`CMS/*`, `LH/Heading/*`) + Variables `LH Color/*`
- หน้าจอเต็ม 8 หน้า: BN-01, NW-01, NP-01 (pattern CMS-08), PD-01 (pattern CMS-11), SM-01, ER-404, LG-00, FM-01
- Popup 8 รายการบนบอร์ดเดียว: PS-01, RT-01, RT-02, US-01, US-02, LG-01, AI-01, FL-01
- ทุกเฟรมมีป้าย `Label · …` พร้อม Route ของ React ที่ตรงกัน

## E. ตรวจสอบ

- [x] `tsc -b` ผ่าน, `eslint` ผ่าน (0 error, warning 2 รายการเรื่อง Fast Refresh), `npm run build` ผ่าน
- [x] เปิดครบ 53 Route ใน Chrome ด้วยสคริปต์ — ทุกหน้าแสดงผล ไม่มี console error
- [x] ตรวจภาพหน้าหลักเทียบ Figma: Page Builder, Approval Review, Life Stage, Schema Wizard (แก้คอลัมน์ Life Stage แคบเกินแล้ว)
- [x] ตรวจภาพทุกเฟรมที่ใส่ลง Figma

## F. แก้ Sidebar ของ Role Auditor ให้ตรง Figma
- [x] อ้างอิง Figma Type 2 · AU-01 ~ AU-05 (node 134:21228) — Sidebar ของ Auditor มีเพียง **Dashboard · งานรออนุมัติ · ประวัติการอนุมัติ · Setting** (เมนูจัดการเนื้อหาซ่อนทั้งหมด)
- [x] `layout/nav.ts` เพิ่ม `AUDITOR_NAV` (ไอคอนตาม Figma: home / fileText / folder / settings) และ `AUDITOR_PATHS`
- [x] `AppLayout.tsx` เลือกเมนูตาม Role · ไฮไลต์เมนูแบบ longest match (`/approval/history` ไม่ไฮไลต์ `/approval`) · Auditor เข้า URL หน้าจัดการเนื้อหาตรง ๆ จะถูก redirect ไป `/approval` · ปุ่มตั้งค่าบน Top bar ของ Auditor ไป Audit Log
- [x] หน้าใหม่ `/approval/history` "ประวัติการอนุมัติ" (ApprovalInbox โหมด history — แสดงเฉพาะคำขอที่อนุมัติ/ส่งกลับแล้ว) · ปุ่ม "ประวัติการอนุมัติ" ใน AU-01 และ breadcrumb ของ AU-05 ลิงก์มาหน้านี้
- [x] Setting ของ Auditor แสดงเฉพาะ Audit Log (ข้อสันนิษฐาน — Figma ไม่ได้กาง sub-menu ไว้)

## ข้อจำกัด

- ข้อมูลทั้งหมดเป็น Mock ในหน่วยความจำ — รีเฟรชแล้วกลับค่าเริ่มต้น
- อัตราดอกเบี้ย / ราคาแสดงเป็น `x.xx` ตาม Figma (ไม่ใช้ตัวเลขจริง)
- รูปใน Media / Banner เป็นภาพสีแทนรูปจริง
- Drag & drop ใช้ปุ่ม ↑ ↓ แทนการลากจริง
- SSO / Login เป็นการจำลอง — ยังไม่เชื่อม Identity Provider

## งานเฟสถัดไป

- [ ] เชื่อม API จริง + Login SSO + สิทธิ์ตาม Role ฝั่ง Server
- [ ] Drag & drop จริงใน Page Builder / Menu / Path
- [ ] ใส่ Figma เพิ่มสำหรับ PD-02, AD-01, FQ-01, FM-02, FX-01/02, AL-01 (ปัจจุบันมีใน React แล้ว)
