import { useEffect } from 'react';
import type {
  ButtonHTMLAttributes,
  CSSProperties,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { Link } from 'react-router-dom';
import { X, Info, ChevronLeft, CheckCircle2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { StatusKind, Toast } from '../types';
import './ui.css';

/* CMS/Button — variant: primary | secondary | danger | ghost · size: md | sm */
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'md' | 'sm';
  icon?: LucideIcon;
}

export function Button({ variant = 'secondary', size = 'md', icon: Icon, children, className = '', type = 'button', ...rest }: ButtonProps) {
  return (
    <button type={type} className={`btn btn-${variant} ${size === 'sm' ? 'btn-sm' : ''} ${className}`} {...rest}>
      {Icon && <Icon strokeWidth={1.6} />}
      {children}
    </button>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  danger?: boolean;
  title: string;
}

export function IconButton({ icon: Icon, danger, title, ...rest }: IconButtonProps) {
  return (
    <button type="button" className={`icon-btn ${danger ? 'danger' : ''}`} title={title} aria-label={title} {...rest}>
      <Icon strokeWidth={1.6} />
    </button>
  );
}

/* CMS/Field — label + input / select / textarea */
interface FieldProps {
  label?: ReactNode;
  required?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export function Field({ label, required, hint, error, children, style, className = '' }: FieldProps) {
  return (
    <label className={`field ${className}`} style={style}>
      {label && (
        <span className="field-label">
          {label}
          {required && <span className="req">*</span>}
          {hint && <span className="hint">{hint}</span>}
        </span>
      )}
      {children}
      {error && <span className="field-error">⚠️ {error}</span>}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="input" {...props} />;
}

export type SelectOption = string | { value: string; label: string };

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options?: readonly SelectOption[];
}

export function Select({ options = [], ...rest }: SelectProps) {
  return (
    <select className="select" {...rest}>
      {options.map((o) => {
        const v = typeof o === 'string' ? o : o.value;
        const l = typeof o === 'string' ? o : o.label;
        return (
          <option key={v} value={v}>
            {l}
          </option>
        );
      })}
    </select>
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="textarea" {...props} />;
}

/* CMS/Status — Published · Scheduled · Draft · Expired · Rejected (+ Pending / Review / Queue for request flow) */
const STATUS_LABEL: Partial<Record<StatusKind, string>> = {
  Pending: 'รออนุมัติ',
  Review: 'กำลังรีวิว',
  Queue: 'รอคิว',
};

export function Status({ status }: { status: StatusKind }) {
  return <span className={`status status-${status.toLowerCase()}`}>{STATUS_LABEL[status] ?? status}</span>;
}

interface CardProps {
  title?: ReactNode;
  sub?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Card({ title, sub, action, children, className = '', style }: CardProps) {
  return (
    <section className={`card ${className}`} style={style}>
      {(title || action) && (
        <div className="row-between" style={{ marginBottom: 16, alignItems: 'flex-start' }}>
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {sub && <p className="card-sub">{sub}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function InfoBanner({ title, children }: { title?: ReactNode; children: ReactNode }) {
  return (
    <div className="banner-info">
      <Info strokeWidth={1.6} />
      <div>
        {title && <b>{title}</b>}
        <div>{children}</div>
      </div>
    </div>
  );
}

export interface TabItem<T extends string> {
  value: T;
  label: ReactNode;
  dot?: string;
}

interface TabsProps<T extends string> {
  tabs: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: CSSProperties;
}

export function Tabs<T extends string>({ tabs, value, onChange, style }: TabsProps<T>) {
  return (
    <div className="tabs" role="tablist" style={style}>
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          role="tab"
          aria-selected={value === t.value}
          className={`tab ${value === t.value ? 'active' : ''}`}
          onClick={() => onChange(t.value)}
        >
          {t.label}
          {t.dot && <span className="dot" style={{ background: t.dot }} />}
        </button>
      ))}
    </div>
  );
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  width?: number;
  children?: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, onClose, title, width = 600, children, footer }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: width }} role="dialog" aria-modal="true">
        <div className="modal-head">
          <h2 className="modal-title">{title}</h2>
          <IconButton icon={X} title="ปิด" onClick={onClose} />
        </div>
        {children}
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function Drawer({ open, onClose, title, children, footer }: Omit<ModalProps, 'width'>) {
  if (!open) return null;
  return (
    <div className="scrim drawer-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="drawer" role="dialog" aria-modal="true">
        <div className="modal-head">
          <h2 className="modal-title">{title}</h2>
          <IconButton icon={X} title="ปิด" onClick={onClose} />
        </div>
        <div className="col" style={{ flex: 1 }}>{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </aside>
    </div>
  );
}

export function ToastView({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((t) => (
        <div className="toast" key={t.id}>
          <CheckCircle2 size={20} />
          <div>
            <div className="toast-title">{t.title}</div>
            {t.desc && <div className="toast-desc">{t.desc}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

export interface Crumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  crumbs?: Crumb[];
  title: ReactNode;
  sub?: ReactNode;
  back?: string;
  badges?: ReactNode;
  actions?: ReactNode;
}

/* Breadcrumb + page title row */
export function PageHeader({ crumbs = [], title, sub, back, badges, actions }: PageHeaderProps) {
  return (
    <div className="page-header">
      {crumbs.length > 0 && (
        <nav className="crumbs">
          {crumbs.map((c, i) => (
            <span key={i}>
              {c.to ? <Link to={c.to}>{c.label}</Link> : c.label}
              {i < crumbs.length - 1 && <span className="sep">&gt;</span>}
            </span>
          ))}
        </nav>
      )}
      <div className="row-between" style={{ flexWrap: 'wrap' }}>
        <div className="row" style={{ gap: 14 }}>
          {back && (
            <Link to={back} className="back-btn" aria-label="ย้อนกลับ">
              <ChevronLeft size={16} />
            </Link>
          )}
          <div>
            <h1 className="page-title">{title}</h1>
            {sub && <p className="t-secondary">{sub}</p>}
          </div>
          {badges}
        </div>
        {actions && <div className="row" style={{ gap: 10 }}>{actions}</div>}
      </div>
    </div>
  );
}

interface PagerProps {
  page: number;
  pages: number;
  onChange: (page: number) => void;
}

export function Pager({ page, pages, onChange }: PagerProps) {
  return (
    <div className="pager">
      <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <button type="button" key={p} className={p === page ? 'current' : ''} onClick={() => onChange(p)}>
          {p}
        </button>
      ))}
      <button type="button" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</button>
    </div>
  );
}

/* Toggle switch with label + description (SEO-03 / SEO-04) */
interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: ReactNode;
  desc?: ReactNode;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, desc, disabled }: ToggleProps) {
  const sw = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={`toggle ${checked ? 'on' : ''}`}
      onClick={() => onChange(!checked)}
    />
  );
  if (!label) return sw;
  return (
    <div className="row-between toggle-row">
      <div>
        <div>{label}</div>
        {desc && <div className="t-sm t-secondary">{desc}</div>}
      </div>
      {sw}
    </div>
  );
}

/* Keyword / tag input — Enter to add, × to remove */
export function TagInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  return (
    <div className="tag-input">
      {value.map((k) => (
        <span key={k} className="kw">
          {k}
          <button type="button" aria-label={`ลบ ${k}`} onClick={() => onChange(value.filter((x) => x !== k))}>×</button>
        </span>
      ))}
      <input
        placeholder={placeholder}
        onKeyDown={(e) => {
          const v = e.currentTarget.value.trim();
          if (e.key === 'Enter' && v) {
            e.preventDefault();
            if (!value.includes(v)) onChange([...value, v]);
            e.currentTarget.value = '';
          }
        }}
      />
    </div>
  );
}

/* Read-only label : value row */
export function KV({ k, children, w = 140 }: { k: ReactNode; children: ReactNode; w?: number }) {
  return (
    <div className="kv" style={{ gridTemplateColumns: `${w}px 1fr` }}>
      <span className="t-secondary">{k} :</span>
      <div>{children}</div>
    </div>
  );
}

/* Segmented language sub-tabs (TH (Main) / EN / 中文) */
export function LangSwitch<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="lang-switch">
      {options.map((o) => (
        <button type="button" key={o.value} className={value === o.value ? 'on' : ''} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
