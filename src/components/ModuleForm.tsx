import { useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button, Card, Field, Input, Select, Textarea, Toggle, LangSwitch, PageHeader, Status } from './ui';
import type { SelectOption } from './ui';
import RichEditor from './RichEditor';
import MediaPicker from './MediaPicker';
import MediaThumb from './MediaThumb';
import { useStore } from '../store';
import { openPreview } from '../pages/Preview';
import type { ContentStatus, MediaItem } from '../types';

type Lang = 'th' | 'en' | 'zh';

export interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'rich' | 'number' | 'date' | 'datetime' | 'file' | 'toggle';
  options?: SelectOption[];
  required?: boolean;
  /** span 1 = half width, 2 = full width (default 2) */
  span?: 1 | 2;
  hint?: string;
  placeholder?: string;
  /** shared across languages (not translated) */
  shared?: boolean;
  desc?: string;
}

interface ModuleFormProps {
  back: string;
  title: string;
  status?: ContentStatus;
  module: string;
  fields: FieldDef[];
  initial?: Partial<Record<Lang, Record<string, string>>>;
  publishFields?: FieldDef[];
  image?: { label: string; hint: string; initial?: MediaItem | null } | null;
  aside?: ReactNode;
  langs?: Lang[];
  /** what to call the final action */
  submitLabel?: string;
}

const LANG_LABEL: Record<Lang, string> = { th: 'TH (Main)', en: 'EN', zh: '中文' };

function renderInput(f: FieldDef, value: string, onChange: (v: string) => void) {
  switch (f.type) {
    case 'textarea':
      return <Textarea rows={3} value={value} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} />;
    case 'rich':
      return (
        <RichEditor value={value} onChange={onChange} height={340} />
      );
    case 'select':
      return <Select value={value} onChange={(e) => onChange(e.target.value)} options={f.options ?? []} />;
    case 'number':
      return <Input type="number" value={value} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} />;
    case 'date':
      return <Input type="date" value={value} onChange={(e) => onChange(e.target.value)} />;
    case 'datetime':
      return <Input type="datetime-local" value={value} onChange={(e) => onChange(e.target.value)} />;
    case 'file':
      return (
        <label className="file-pick">
          <Upload size={16} /> <span className="grow">{value || 'เลือกไฟล์ (PDF ไม่เกิน 10 MB)'}</span>
          <input type="file" hidden onChange={(e) => onChange(e.target.files?.[0]?.name ?? value)} />
        </label>
      );
    case 'toggle':
      return <Toggle checked={value === 'true'} onChange={(v) => onChange(String(v))} label={f.label} desc={f.desc} />;
    default:
      return <Input value={value} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} />;
  }
}

/* Generic module create/edit form — pattern from Figma CMS-08 / CMS-12:
   left = content per language, right = การเผยแพร่ + ภาพประกอบ, bottom bar = Cancel / Save Draft / Publish */
export default function ModuleForm({ back, title, status = 'Draft', module, fields, initial = {}, publishFields = [], image, aside, langs = ['th', 'en', 'zh'], submitLabel = 'ส่งอนุมัติ' }: ModuleFormProps) {
  const navigate = useNavigate();
  const { toast, submitRequest } = useStore();
  const [lang, setLang] = useState<Lang>('th');
  const [data, setData] = useState<Record<Lang, Record<string, string>>>(() => ({ th: { ...initial.th }, en: { ...initial.en }, zh: { ...initial.zh } }));
  const [pub, setPub] = useState<Record<string, string>>(() => Object.fromEntries(publishFields.map((f) => [f.key, initial.th?.[f.key] ?? (f.type === 'select' ? String(typeof f.options?.[0] === 'string' ? f.options?.[0] : f.options?.[0]?.value ?? '') : '')])));
  const [img, setImg] = useState<MediaItem | null>(image?.initial ?? null);
  const [alt, setAlt] = useState(image?.initial?.alt ?? '');
  const [picker, setPicker] = useState(false);
  const [tried, setTried] = useState(false);

  const get = (f: FieldDef) => (f.shared ? data.th[f.key] : data[lang][f.key]) ?? (f.type === 'select' ? String(typeof f.options?.[0] === 'string' ? f.options?.[0] : f.options?.[0]?.value ?? '') : '');
  const set = (f: FieldDef, v: string) => setData((d) => (f.shared ? { ...d, th: { ...d.th, [f.key]: v } } : { ...d, [lang]: { ...d[lang], [f.key]: v } }));
  const missing = fields.filter((f) => f.required && !(f.shared ? data.th[f.key] : data.th[f.key])?.trim());
  const name = data.th[fields[0]?.key] || title;

  const submit = () => {
    setTried(true);
    if (missing.length || (image && !img)) {
      toast('ยังส่งไม่ได้', `กรอกฟิลด์บังคับให้ครบ: ${[...missing.map((m) => m.label), ...(image && !img ? [image.label] : [])].join(', ')}`);
      return;
    }
    submitRequest({ title: name, module, sub: `${module} · ${status === 'Draft' ? 'สร้างใหม่' : 'แก้ไข'}` });
    toast('ส่งอนุมัติแล้ว — รอ Auditor', name);
    navigate('/requests');
  };

  return (
    <div className="with-bottom-bar">
      <PageHeader
        back={back}
        title={title}
        badges={<Status status={status} />}
        actions={<Button icon={Eye} onClick={() => { const rich = fields.find((f) => f.type === 'rich'); openPreview({ title: name, body: rich ? data.th[rich.key] : undefined, type: module }); }}>Preview</Button>}
      />
      <div className="split">
        <Card title="เนื้อหา">
          {langs.length > 1 && <LangSwitch value={lang} onChange={setLang} options={langs.map((l) => ({ value: l, label: LANG_LABEL[l] }))} />}
          <div className="form-grid">
            {fields.map((f) => (
              <div key={f.key} style={{ gridColumn: f.span === 1 ? 'span 1' : '1 / -1' }}>
                {f.type === 'toggle' ? renderInput(f, get(f), (v) => set(f, v)) : (
                  <Field label={f.label} required={f.required && (lang === 'th' || f.shared)} hint={f.hint} error={tried && f.required && lang === 'th' && !get(f)?.trim() ? `กรุณากรอก${f.label}` : null}>
                    {renderInput(f, get(f), (v) => set(f, v))}
                  </Field>
                )}
                {f.type === 'textarea' && f.hint?.includes('/') && <span className="t-sm t-tertiary">{get(f).length} {f.hint}</span>}
              </div>
            ))}
          </div>
        </Card>
        <div className="col">
          {publishFields.length > 0 && (
            <Card title="การเผยแพร่">
              <div className="col">
                {publishFields.map((f) => (
                  <div key={f.key}>{f.type === 'toggle' ? renderInput(f, pub[f.key], (v) => setPub({ ...pub, [f.key]: v })) : <Field label={f.label}>{renderInput(f, pub[f.key], (v) => setPub({ ...pub, [f.key]: v }))}</Field>}</div>
                ))}
              </div>
            </Card>
          )}
          {image && (
            <Card title={image.label}>
              <div className="thumb-box" style={{ height: 150, overflow: 'hidden', border: tried && !img ? '1px solid #e0625a' : undefined }}>
                {img ? <div style={{ width: '100%' }}><MediaThumb item={img} height={150} /></div> : <ImageIcon size={30} strokeWidth={1.4} className="t-tertiary" />}
              </div>
              {img && <p className="t-sm mt-8" style={{ textAlign: 'center' }}>{img.name}</p>}
              <div className="row mt-8">
                <Button size="sm" icon={Upload} onClick={() => setPicker(true)}>{img ? 'เปลี่ยนภาพ' : 'เลือกภาพ'}</Button>
                {img && <Button size="sm" variant="danger" icon={Trash2} onClick={() => setImg(null)}>ลบ</Button>}
              </div>
              <p className="t-sm t-secondary mt-8">{image.hint}</p>
              <Field label="Alt text" className="mt-8"><Input value={alt} onChange={(e) => setAlt(e.target.value)} /></Field>
            </Card>
          )}
          {aside}
        </div>
      </div>
      <div className="bottom-bar">
        <Button onClick={() => navigate(back)}>Cancel</Button>
        <Button onClick={() => toast('บันทึก Draft แล้ว', name)}>Save Draft</Button>
        <Button variant="primary" icon={Upload} onClick={submit}>{submitLabel}</Button>
      </div>
      <MediaPicker open={picker} onClose={() => setPicker(false)} onPick={(m) => { setImg(m); setAlt(m.alt ?? alt); }} />
    </div>
  );
}
