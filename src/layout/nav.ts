import home from '../assets/figma/nav/home.svg';
import fileText from '../assets/figma/nav/file-text.svg';
import seo from '../assets/figma/nav/seo-search.svg';
import menu from '../assets/figma/nav/menu.svg';
import image from '../assets/figma/nav/image.svg';
import megaphone from '../assets/figma/nav/megaphone.svg';
import layout from '../assets/figma/nav/layout.svg';
import tree from '../assets/figma/nav/tree.svg';
import layers from '../assets/figma/nav/layers.svg';
import gift from '../assets/figma/nav/gift.svg';
import users from '../assets/figma/nav/users.svg';
import percent from '../assets/figma/nav/percent.svg';
import trending from '../assets/figma/nav/trending-up.svg';
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
  { label: 'สถานะคำขอของฉัน', icon: fileText, to: '/requests' },
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
  { label: 'Layout', icon: layout, to: '/layout' },
  { label: 'Path Structure', icon: tree, to: '/path' },
  { label: 'Manage Content', icon: layers, to: '/content' },
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
  { label: 'Advisory', icon: trending, to: '/advisory' },
  { label: 'News', icon: fileText, to: '/news' },
  { label: 'NPA', icon: building, to: '/npa' },
  { label: 'Form', icon: chat, to: '/form' },
  { label: 'FAQ', icon: help, to: '/faq' },
  { label: 'File Manager', icon: folder, to: '/files' },
  { label: 'AI Assistants', icon: sparkles, to: '/ai' },
  { label: 'ถังขยะ', icon: trash, to: '/trash' },
  {
    label: 'Setting', icon: settings, children: [
      { label: 'User & Role', to: '/setting/users' },
      { label: 'Audit Log', to: '/setting/audit' },
      { label: 'ภาษา (Language)', to: '/setting/language' },
      { label: 'การเก็บเวอร์ชัน', to: '/setting/revision' },
    ],
  },
];

/* Figma frame references for modules that are placeholders in this prototype */
export const PLACEHOLDER_INFO: Record<string, string[]> = {
  '/seo': ['CMS-01 SEO / AEO — ตั้งค่าเว็บไซต์', 'SEO-01 … SEO-09'],
  '/menu/location': ['CMS-02 Menu Location'],
  '/menu/set': ['CMS-03 Set Menu'],
  '/banner/hero': ['CMS-05 Hero Banner'],
  '/banner/promotion': ['CMS-10 Promotion Banner'],
  '/layout': ['CMS-06 Page Builder', 'CMS-06A … CMS-06E Layout'],
  '/path': ['CMS-07 Path Structure'],
  '/products/loan': ['CMS-11 Products — สินเชื่อ', 'CMS-12 Products — แก้ไขผลิตภัณฑ์'],
  '/products/deposit': ['CMS-11 Products'],
  '/life-stage': ['CMS-13 Life Stage'],
  '/rates/interest': ['CMS-14 Rates — อัตราดอกเบี้ย'],
  '/rates/exchange': ['CMS-15 Rates — อัตราแลกเปลี่ยน'],
  '/advisory': ['CMS-16 LH Bank Advisory'],
  '/news': ['CMS-17 News — ข่าวสารและกิจกรรม'],
  '/npa': ['CMS-18 NPA — สินทรัพย์รอการขาย'],
  '/form': ['CMS-19 Form — รายการติดต่อกลับ (Lead)'],
  '/faq': ['CMS-20 FAQ — คำถามที่พบบ่อย'],
  '/files': ['CMS-21 File Manager — เอกสารดาวน์โหลด'],
  '/ai': ['CMS-24 AI Assistants', 'CMS-24A Workspace', 'CMS-24B ตั้งค่า & Guardrails'],
  '/setting/users': ['CMS-22 Setting — User & Role'],
  '/setting/audit': ['CMS-23 Setting — Audit Log'],
  '/setting/language': ['CMS-25 Setting — ภาษา (Language)'],
  '/setting/revision': ['CMS-25A Setting — การเก็บเวอร์ชัน', 'CMS-25B ยืนยันลดจำนวนเวอร์ชัน'],
};

export function findNavLabel(path: string): string {
  for (const item of NAV) {
    if (item.to === path) return item.label;
    for (const c of item.children || []) if (c.to === path) return c.label;
  }
  return '';
}
