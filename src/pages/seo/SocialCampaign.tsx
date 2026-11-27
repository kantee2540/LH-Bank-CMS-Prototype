import { useState } from "react";
import { Copy, Link2, Image as ImageIcon } from "lucide-react";
import {
  Button,
  Card,
  Field,
  Input,
  Select,
  Textarea,
  Toggle,
  IconButton,
  Modal,
} from "../../components/ui";
import { useStore } from "../../store";
import { PHOTOS } from "../../data/photos";
import type { ContentStatus } from "../../types";
import "../pages.css";

/* NEW — SEO-06 Social Campaign: ตั้งค่า Tracking ของแต่ละ Social Platform + สร้างลิงก์แคมเปญ (UTM) และภาพ/ข้อความตอนแชร์ */

type PlatformKey =
  | "facebook"
  | "instagram"
  | "line"
  | "tiktok"
  | "youtube"
  | "x"
  | "linkedin";

const PLATFORMS: {
  key: PlatformKey;
  label: string;
  color: string;
  source: string;
}[] = [
  { key: "facebook", label: "Facebook", color: "#1877f2", source: "facebook" },
  {
    key: "instagram",
    label: "Instagram",
    color: "#d62976",
    source: "instagram",
  },
  { key: "line", label: "LINE", color: "#06c755", source: "line" },
  { key: "tiktok", label: "TikTok", color: "#111111", source: "tiktok" },
  { key: "youtube", label: "YouTube", color: "#ff0000", source: "youtube" },
  { key: "x", label: "X", color: "#333333", source: "x" },
  { key: "linkedin", label: "LinkedIn", color: "#0a66c2", source: "linkedin" },
];
const plat = (k: PlatformKey) => PLATFORMS.find((p) => p.key === k)!;

/* Tracking / Pixel ระดับเว็บไซต์ — ติดตั้งทุกหน้าเมื่อเปิดใช้ */
interface Tracker {
  key: string;
  label: string;
  platforms: string;
  placeholder: string;
  id: string;
  on: boolean;
}
const TRACKERS: Tracker[] = [
  {
    key: "meta",
    label: "Meta Pixel",
    platforms: "Facebook · Instagram",
    placeholder: "เช่น 123456789012345",
    id: "8812•••••••4410",
    on: true,
  },
  {
    key: "line",
    label: "LINE Tag",
    platforms: "LINE Ads",
    placeholder: "Tag ID",
    id: "a1b2•••••-77c",
    on: true,
  },
  {
    key: "tiktok",
    label: "TikTok Pixel",
    platforms: "TikTok",
    placeholder: "Pixel ID",
    id: "",
    on: false,
  },
  {
    key: "google",
    label: "Google Ads / GA4",
    platforms: "YouTube · Google",
    placeholder: "G-XXXXXXX / AW-XXXXXXX",
    id: "G-LHB••••••",
    on: true,
  },
  {
    key: "x",
    label: "X Pixel",
    platforms: "X",
    placeholder: "Pixel ID",
    id: "",
    on: false,
  },
  {
    key: "linkedin",
    label: "LinkedIn Insight Tag",
    platforms: "LinkedIn",
    placeholder: "Partner ID",
    id: "",
    on: false,
  },
];

const MEDIUMS = ["social", "paid_social", "cpc", "video", "message"];

interface Campaign {
  id: string;
  name: string;
  platforms: PlatformKey[];
  landing: string;
  medium: string;
  campaign: string;
  content: string;
  start: string;
  end: string;
  status: ContentStatus;
  shareTitle: string;
  shareDesc: string;
  image: string;
  clicks: number;
}

const CAMPAIGNS: Campaign[] = [
  {
    id: "cp1",
    name: "เงินฝากประจำพิเศษ 6 เดือน",
    platforms: ["facebook", "instagram", "line"],
    landing: "/th/personal/deposit/fixed-6m",
    medium: "paid_social",
    campaign: "fixed-6m-q4-2026",
    content: "carousel-a",
    start: "2026-11-01",
    end: "2026-12-31",
    status: "Published",
    shareTitle: "เงินฝากประจำพิเศษ 6 เดือน ดอกเบี้ยสูง",
    shareDesc:
      "ฝากขั้นต่ำ 10,000 บาท รับดอกเบี้ยพิเศษ เงื่อนไขเป็นไปตามที่ธนาคารกำหนด",
    image: PHOTOS.saving,
    clicks: 4821,
  },
  {
    id: "cp2",
    name: "LHB You — เปิดบัญชีออนไลน์",
    platforms: ["tiktok", "youtube"],
    landing: "/th/personal/digital/lhb-you",
    medium: "video",
    campaign: "lhb-you-onboarding",
    content: "joey-15s",
    start: "2026-10-15",
    end: "2026-12-15",
    status: "Published",
    shareTitle: "เปิดบัญชีง่าย ๆ ผ่านแอป LHB You",
    shareDesc: "ทำธุรกรรมได้ทุกที่ ทุกเวลา",
    image: PHOTOS.heroLhbYou,
    clicks: 12093,
  },
  {
    id: "cp3",
    name: "ลดหย่อนภาษีด้วย RMF / ThaiESG",
    platforms: ["facebook", "line", "linkedin"],
    landing: "/th/personal/investment/tax-saving",
    medium: "social",
    campaign: "tax-saving-2026",
    content: "",
    start: "2026-12-01",
    end: "2026-12-31",
    status: "Scheduled",
    shareTitle: "ลดหย่อนภาษี พร้อมรับสิทธิประโยชน์ทางภาษี",
    shareDesc: "กองทุน RMF และ ThaiESG สำหรับปีภาษี 2569",
    image: PHOTOS.bannerTaxSaving,
    clicks: 0,
  },
  {
    id: "cp4",
    name: "ทรัพย์ NPA ราคาพิเศษ",
    platforms: ["facebook"],
    landing: "/th/property-for-sale/asset-for-sale",
    medium: "social",
    campaign: "npa-special-price",
    content: "",
    start: "",
    end: "",
    status: "Draft",
    shareTitle: "ทรัพย์สินรอการขาย ราคาพิเศษ",
    shareDesc: "",
    image: PHOTOS.npaHouse,
    clicks: 0,
  },
];

const blank = (): Campaign => ({
  id: "",
  name: "",
  platforms: ["facebook"],
  landing: "/th/",
  medium: "social",
  campaign: "",
  content: "",
  start: "",
  end: "",
  status: "Draft",
  shareTitle: "",
  shareDesc: "",
  image: PHOTOS.branch,
  clicks: 0,
});

/* ลิงก์แคมเปญแยกตามแพลตฟอร์ม — utm_source เปลี่ยนตามแพลตฟอร์มอัตโนมัติ */
function campaignUrl(c: Campaign, p: PlatformKey): string {
  const q = new URLSearchParams({
    utm_source: plat(p).source,
    utm_medium: c.medium,
    utm_campaign: c.campaign || "campaign",
  });
  if (c.content) q.set("utm_content", c.content);
  return `https://www.lhbank.co.th${c.landing}?${q.toString()}`;
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9ก-๙]+/g, "-")
    .replace(/^-|-$/g, "");

function PlatformChip({ k }: { k: PlatformKey }) {
  const p = plat(k);
  return (
    <span
      className="plat-chip"
      style={{ borderColor: p.color, color: p.color }}
    >
      {p.label}
    </span>
  );
}

export default function SocialCampaign({
  creating,
  onCloseCreate,
}: {
  creating: boolean;
  onCloseCreate: () => void;
}) {
  const { toast } = useStore();
  const [trackers, setTrackers] = useState(TRACKERS);
  const [rows, setRows] = useState(CAMPAIGNS);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [del, setDel] = useState<Campaign | null>(null);
  const form = creating ? (editing ?? blank()) : editing;

  const close = () => {
    setEditing(null);
    onCloseCreate();
  };
  const patch = (p: Partial<Campaign>) =>
    setEditing({ ...(form ?? blank()), ...p });
  const copy = (url: string) => {
    void navigator.clipboard?.writeText(url).catch(() => undefined);
    toast("คัดลอกลิงก์แคมเปญแล้ว", url.replace("https://www.", ""));
  };
  const errors = form
    ? {
        name: !form.name.trim() ? "กรุณากรอกชื่อแคมเปญ" : "",
        platforms: !form.platforms.length ? "เลือกอย่างน้อย 1 แพลตฟอร์ม" : "",
        campaign: !form.campaign.trim() ? "กรุณากรอก utm_campaign" : "",
        period:
          form.start && form.end && form.start > form.end
            ? "วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่มต้น"
            : "",
      }
    : null;
  const invalid = !!errors && Object.values(errors).some(Boolean);

  const save = (status: ContentStatus) => {
    if (!form || invalid) return;
    const item = { ...form, id: form.id || `cp${Date.now()}`, status };
    setRows(
      form.id
        ? rows.map((r) => (r.id === form.id ? item : r))
        : [item, ...rows],
    );
    toast(
      status === "Draft" ? "บันทึก Draft แล้ว" : "บันทึกแคมเปญแล้ว",
      `${item.name} · ${item.platforms.length} แพลตฟอร์ม`,
    );
    close();
  };

  return (
    <div className="col" style={{ gap: 20 }}>
      <Card
        title="การเชื่อมต่อ Tracking ของ Social Platform"
        sub="ติดตั้ง Pixel / Tag ทุกหน้าของเว็บไซต์เมื่อเปิดใช้ · เก็บข้อมูลตามความยินยอมคุกกี้ (Cookie Consent) ของผู้ใช้เท่านั้น"
        action={
          <Button
            size="sm"
            variant="primary"
            onClick={() =>
              toast("บันทึกการเชื่อมต่อแล้ว", "บันทึกใน Audit Log")
            }
          >
            บันทึกการเชื่อมต่อ
          </Button>
        }
      >
        <div className="tracker-grid">
          {trackers.map((t) => (
            <div key={t.key} className={`tracker ${t.on ? "on" : ""}`}>
              <div className="row-between">
                <div>
                  <b style={{ fontWeight: 500 }}>{t.label}</b>
                  <div className="t-sm t-secondary">{t.platforms}</div>
                </div>
                <Toggle
                  checked={t.on}
                  onChange={(on) =>
                    setTrackers(
                      trackers.map((x) => (x.key === t.key ? { ...x, on } : x)),
                    )
                  }
                />
              </div>
              <Input
                value={t.id}
                placeholder={t.placeholder}
                disabled={!t.on}
                onChange={(e) =>
                  setTrackers(
                    trackers.map((x) =>
                      x.key === t.key ? { ...x, id: e.target.value } : x,
                    ),
                  )
                }
              />
              {t.on && !t.id && (
                <span className="field-error">⚠️ กรุณากรอก ID ก่อนเปิดใช้</span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* SEO-07 สร้าง / แก้ไขแคมเปญ */}
      <Modal
        open={!!form}
        onClose={close}
        width={1040}
        title={form?.id ? `แก้ไขแคมเปญ · ${form.name}` : "สร้างแคมเปญ Social"}
        footer={
          <>
            <Button onClick={close}>ยกเลิก</Button>
            <Button disabled={invalid} onClick={() => save("Draft")}>
              บันทึก Draft
            </Button>
            <Button
              variant="primary"
              disabled={invalid}
              onClick={() =>
                save(
                  form?.start && form.start > "2026-11-26"
                    ? "Scheduled"
                    : "Published",
                )
              }
            >
              บันทึกและใช้งาน
            </Button>
          </>
        }
      >
        {form && errors && (
          <div className="camp-form">
            <div className="col">
              <Field label="ชื่อแคมเปญ" required error={errors.name || null}>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    patch({
                      name: e.target.value,
                      campaign:
                        form.id || form.campaign
                          ? form.campaign
                          : slug(e.target.value),
                    })
                  }
                  placeholder="เช่น เงินฝากประจำพิเศษ 6 เดือน"
                />
              </Field>
              <div className="field">
                <span className="field-label">
                  แพลตฟอร์ม <span className="req">*</span>
                </span>
                <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                  {PLATFORMS.map((p) => {
                    const on = form.platforms.includes(p.key);
                    return (
                      <button
                        key={p.key}
                        type="button"
                        className={`chip-filter ${on ? "on" : ""}`}
                        onClick={() =>
                          patch({
                            platforms: on
                              ? form.platforms.filter((x) => x !== p.key)
                              : [...form.platforms, p.key],
                          })
                        }
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
                {errors.platforms && (
                  <span className="field-error">⚠️ {errors.platforms}</span>
                )}
              </div>
              <Field label="หน้าปลายทาง (Landing page)" required>
                <Input
                  value={form.landing}
                  onChange={(e) => patch({ landing: e.target.value })}
                  placeholder="/th/personal/..."
                />
              </Field>
              <div className="grid-2">
                <Field label="utm_medium" required>
                  <Select
                    value={form.medium}
                    onChange={(e) => patch({ medium: e.target.value })}
                    options={MEDIUMS}
                  />
                </Field>
                <Field
                  label="utm_campaign"
                  required
                  error={errors.campaign || null}
                >
                  <Input
                    value={form.campaign}
                    onChange={(e) => patch({ campaign: slug(e.target.value) })}
                    placeholder="fixed-6m-q4-2026"
                  />
                </Field>
              </div>
              <Field
                label="utm_content"
                hint="(ไม่บังคับ · ใช้แยกชิ้นงาน เช่น carousel-a)"
              >
                <Input
                  value={form.content}
                  onChange={(e) => patch({ content: slug(e.target.value) })}
                />
              </Field>
              <div className="grid-2">
                <Field label="วันที่เริ่มต้น">
                  <Input
                    type="date"
                    value={form.start}
                    max={form.end || undefined}
                    onChange={(e) => patch({ start: e.target.value })}
                  />
                </Field>
                <Field label="วันที่สิ้นสุด" error={errors.period || null}>
                  <Input
                    type="date"
                    value={form.end}
                    min={form.start || undefined}
                    onChange={(e) => patch({ end: e.target.value })}
                  />
                </Field>
              </div>
            </div>
            <div className="col">
              <h3 className="section-h" style={{ margin: 0 }}>
                ภาพและข้อความตอนแชร์ (Open Graph)
              </h3>
              <Field
                label="หัวข้อตอนแชร์"
                hint={`(${form.shareTitle.length} / 60)`}
              >
                <Input
                  value={form.shareTitle}
                  onChange={(e) => patch({ shareTitle: e.target.value })}
                  placeholder="ไม่กรอก = ใช้ Title ของหน้าปลายทาง"
                />
              </Field>
              <Field
                label="คำอธิบายตอนแชร์"
                hint={`(${form.shareDesc.length} / 110)`}
              >
                <Textarea
                  rows={2}
                  value={form.shareDesc}
                  onChange={(e) => patch({ shareDesc: e.target.value })}
                />
              </Field>
              <div className="share-card">
                <img src={form.image} alt="" />
                <div className="share-body">
                  <span className="t-sm t-secondary">LHBANK.CO.TH</span>
                  <b>{form.shareTitle || form.name || "หัวข้อตอนแชร์"}</b>
                  <span className="t-sm t-secondary">
                    {form.shareDesc || "คำอธิบายจากหน้าปลายทาง"}
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                icon={ImageIcon}
                style={{ alignSelf: "flex-start" }}
                onClick={() =>
                  toast("เลือกภาพจาก Media Library", "ขนาดแนะนำ 1200 × 630 px")
                }
              >
                เปลี่ยนภาพ (1200 × 630)
              </Button>
              <h3 className="section-h" style={{ margin: "8px 0 0" }}>
                ลิงก์แคมเปญแยกตามแพลตฟอร์ม
              </h3>
              <div className="col" style={{ gap: 6 }}>
                {form.platforms.map((p) => {
                  const url = campaignUrl(form, p);
                  return (
                    <div key={p} className="camp-link">
                      <PlatformChip k={p} />
                      <Link2
                        size={14}
                        className="t-tertiary"
                        style={{ flex: "none" }}
                      />
                      <span className="camp-url" title={url}>
                        {url.replace("https://www.", "")}
                      </span>
                      <IconButton
                        icon={Copy}
                        title="คัดลอกลิงก์"
                        onClick={() => copy(url)}
                      />
                    </div>
                  );
                })}
                {!form.platforms.length && (
                  <span className="t-sm t-tertiary">
                    เลือกแพลตฟอร์มเพื่อสร้างลิงก์
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!del}
        onClose={() => setDel(null)}
        title="ลบแคมเปญ?"
        footer={
          <>
            <Button onClick={() => setDel(null)}>ยกเลิก</Button>
            <Button
              variant="danger"
              onClick={() => {
                setRows(rows.filter((r) => r.id !== del?.id));
                toast("ย้ายแคมเปญไป Recycle Bin แล้ว", del?.name);
                setDel(null);
              }}
            >
              ลบ
            </Button>
          </>
        }
      >
        <p className="t-secondary" style={{ margin: 0 }}>
          “{del?.name}” จะถูกย้ายไป Recycle Bin ·
          ลิงก์ที่แชร์ไปแล้วยังเปิดหน้าปลายทางได้ แต่จะไม่นับสถิติแคมเปญ
        </p>
      </Modal>
    </div>
  );
}
