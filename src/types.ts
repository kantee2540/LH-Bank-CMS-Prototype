/* Domain types for the LH Bank CMS prototype */

export type ContentStatus = 'Published' | 'Scheduled' | 'Draft' | 'Expired' | 'Rejected';
export type RequestState = 'Review' | 'Queue' | 'Rejected' | 'Published' | 'Scheduled';
export type StatusKind = ContentStatus | 'Pending' | RequestState;

export type ContentType = 'Page' | 'Promotion' | 'Advisory' | 'Product' | 'News' | 'NPA';

export interface ContentItem {
  id: number;
  title: string;
  langs: string;
  type: ContentType | string;
  path: string;
  status: ContentStatus;
  updated: string;
  rejected?: boolean;
  pending?: boolean;
}

export type TrashGroup = 'Content' | 'Media' | 'Banner' | 'อื่นๆ';

export interface TrashItem {
  id: string;
  title: string;
  sub: string;
  module: string;
  group: TrashGroup;
  by: string;
  days: number;
  origin?: ContentItem;
}

export type RequestTab = 'pending' | 'rejected' | 'approved';

export interface RequestItem {
  id: string;
  title: string;
  sub: string;
  module: string;
  auditor: string;
  sent: string;
  publish: string;
  state: RequestState;
  tab: RequestTab;
  fresh?: boolean;
}

export type VersionAction = 'INSERT' | 'UPDATE' | 'RECOVER';

export interface VersionItem {
  id: string;
  /** วันที่และเวลาที่แก้ไข dd/mm/yyyy hh:mm:ss */
  date: string;
  action: VersionAction;
  /** ส่วนที่เปลี่ยนแปลง แสดงเป็นป้าย */
  changes: string[];
  /** ข้อความแทนป้าย เช่น "สร้างเนื้อหา" */
  note?: string;
}

export type MediaKind = 'image' | 'logo' | 'pdf';

export interface MediaItem {
  name: string;
  kind: MediaKind;
  folder?: string;
  hue?: number;
  mine?: boolean;
  warn?: boolean;
  error?: boolean;
  alt?: string;
}

export type CalculatorSegment = 'personal' | 'sme';

export interface Calculator {
  id: string;
  name: string;
  path: string;
  formula: string;
  ref: string;
  v: string;
  status: ContentStatus;
  seg: CalculatorSegment;
}

export interface TestCase {
  amount: number;
  rate: number;
  years: number;
  expected: number | string;
}

export interface ChartSeries {
  key: string;
  label: string;
  color: string;
  width?: number;
  data: number[];
}

export interface TopList {
  title: string;
  /** อันดับต้น ๆ ที่แสดงบนการ์ด Dashboard */
  rows: [string, number][];
  /** อันดับถัดไป — แสดงเพิ่มใน Popup "ดูทั้งหมด" */
  more?: [string, number][];
  /** หน่วยของตัวเลข เช่น ครั้ง, วิว, คลิก */
  unit?: string;
  /** เมนูที่เกี่ยวข้องสำหรับปุ่มลัดใน Popup */
  link?: { label: string; to: string };
}

export type Role = 'Content Editor' | 'Auditor';

export interface Toast {
  id: string;
  title: string;
  desc?: string;
}

export interface SubmitContentInput {
  title: string;
  type: string;
  path: string;
  auditor: string;
  publish: string;
}
