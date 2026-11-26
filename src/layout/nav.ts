import home from '../assets/figma/nav/home.svg';
import fileText from '../assets/figma/nav/file-text.svg';
import seo from '../assets/figma/nav/seo-search.svg';
import menu from '../assets/figma/nav/menu.svg';
import image from '../assets/figma/nav/image.svg';
import megaphone from '../assets/figma/nav/megaphone.svg';
import tree from '../assets/figma/nav/tree.svg';
import layers from '../assets/figma/nav/layers.svg';
import gift from '../assets/figma/nav/gift.svg';
import users from '../assets/figma/nav/users.svg';
import percent from '../assets/figma/nav/percent.svg';
import building from '../assets/figma/nav/building.svg';
import chat from '../assets/figma/nav/chat.svg';
import help from '../assets/figma/nav/help.svg';
import folder from '../assets/figma/nav/folder.svg';
import sparkles from '../assets/figma/nav/sparkles.svg';
import trash from '../assets/figma/nav/trash.svg';
import settings from '../assets/figma/nav/settings.svg';

export interface NavChild {
  label: string;
  to: string;
}

export interface NavItem {
  label: string;
  icon: string;
  to?: string;
  children?: NavChild[];
  forceOpen?: boolean;
}

/* Sidebar menu — order & icons follow Figma "CMS-00 Dashboard › Sidebar" */
export const NAV: NavItem[] = [
  { label: 'Dashboard', icon: home, to: '/' },
  { label: 'My Requests', icon: fileText, to: '/requests' },
  { label: 'SEO / AEO', icon: seo, to: '/seo' },
  {
    label: 'Menu', icon: menu, children: [
      { label: 'Menu Location', to: '/menu/location' },
      { label: 'Set Menu', to: '/menu/set' },
    ],
  },
  { label: 'Media', icon: image, to: '/media' },
  {
    label: 'Banner', icon: megaphone, children: [
      { label: 'Hero Banner', to: '/banner/hero' },
      { label: 'Promotion Banner', to: '/banner/promotion' },
    ],
  },
  {
    label: 'Page Builder', icon: layers, children: [
      { label: 'Layout', to: '/layout' },
      { label: 'Content', to: '/content' },
      { label: 'News', to: '/news' },
      { label: 'Advisory', to: '/advisory' },
    ],
  },
  { label: 'Path Structure', icon: tree, to: '/path' },
  {
    label: 'Products', icon: gift, children: [
      { label: 'สินเชื่อ', to: '/products/loan' },
      { label: 'เงินฝาก', to: '/products/deposit' },
    ],
  },
  { label: 'Life Stage', icon: users, to: '/life-stage' },
  {
    label: 'Rates', icon: percent, children: [
      { label: 'อัตราดอกเบี้ย', to: '/rates/interest' },
      { label: 'อัตราแลกเปลี่ยน', to: '/rates/exchange' },
      { label: 'เครื่องมือคำนวณ', to: '/rates/calculator' },
    ],
  },
  { label: 'NPA', icon: building, to: '/npa' },
  { label: 'Form', icon: chat, to: '/form' },
  { label: 'FAQ', icon: help, to: '/faq' },
  { label: 'File Manager', icon: folder, to: '/files' },
  { label: 'AI Assistants', icon: sparkles, to: '/ai' },
  { label: 'Recycle Bin', icon: trash, to: '/trash' },
  {
    label: 'Setting', icon: settings, children: [
      { label: 'User & Role', to: '/setting/users' },
      { label: 'Audit Log', to: '/setting/audit' },
      { label: 'ภาษา (Language)', to: '/setting/language' },
      { label: 'การเก็บเวอร์ชัน', to: '/setting/revision' },
    ],
  },
];

/* Sidebar ของ Role Auditor — ตาม Figma "AU-01 Approval Inbox" (Type 2, node 134:21228)
   แสดงเฉพาะ Dashboard · งานรออนุมัติ · ประวัติการอนุมัติ · Setting (เมนูจัดการเนื้อหาถูกซ่อน เพราะ Auditor แก้ไขเนื้อหาเองไม่ได้) */
export const AUDITOR_NAV: NavItem[] = [
  { label: 'Dashboard', icon: home, to: '/' },
  { label: 'งานรออนุมัติ', icon: fileText, to: '/approval' },
  { label: 'ประวัติการอนุมัติ', icon: folder, to: '/approval/history' },
  {
    label: 'Setting', icon: settings, children: [
      { label: 'Audit Log', to: '/setting/audit' },
    ],
  },
];

/* path ที่ Auditor เข้าถึงได้ — นอกนั้น redirect ไปงานรออนุมัติ */
export const AUDITOR_PATHS = ['/', '/approval', '/setting/audit'];
