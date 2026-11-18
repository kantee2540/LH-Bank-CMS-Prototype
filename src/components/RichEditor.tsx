import { Editor } from '@tinymce/tinymce-react';
/* TinyMCE self-hosted (GPL) — bundle ทุกอย่างไว้ในแอป ไม่โหลดจาก Cloud */
import 'tinymce/tinymce';
import 'tinymce/models/dom/model';
import 'tinymce/themes/silver';
import 'tinymce/icons/default';
import 'tinymce/skins/ui/oxide/skin.js';
import 'tinymce/skins/ui/oxide/content.js';
import 'tinymce/skins/content/default/content.js';
/* Plugins แบบ Open source ชุดเดียวกับ Demo หน้า tiny.cloud */
import 'tinymce/plugins/accordion';
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/autosave';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/code';
import 'tinymce/plugins/codesample';
import 'tinymce/plugins/directionality';
import 'tinymce/plugins/emoticons';
import 'tinymce/plugins/emoticons/js/emojis';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/help';
import 'tinymce/plugins/help/js/i18n/keynav/en';
import 'tinymce/plugins/image';
import 'tinymce/plugins/importcss';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/link';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/media';
import 'tinymce/plugins/nonbreaking';
import 'tinymce/plugins/pagebreak';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/quickbars';
import 'tinymce/plugins/save';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/table';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/visualchars';
import 'tinymce/plugins/wordcount';

const PLUGINS = [
  'accordion', 'advlist', 'anchor', 'autolink', 'autosave', 'charmap', 'code', 'codesample',
  'directionality', 'emoticons', 'fullscreen', 'help', 'image', 'importcss', 'insertdatetime',
  'link', 'lists', 'media', 'nonbreaking', 'pagebreak', 'preview', 'quickbars', 'save',
  'searchreplace', 'table', 'visualblocks', 'visualchars', 'wordcount',
];

/* Menubar + Toolbar ตาม Demo หน้า https://www.tiny.cloud/
   (ตัดปุ่มของ Plugin แบบเสียเงินออก: importword · exportword · exportpdf · math) */
const MENUBAR = 'file edit view insert format tools table help';
const TOOLBAR = [
  'undo redo',
  'accordion accordionremove',
  'blocks fontfamily fontsize',
  'bold italic underline strikethrough',
  'align numlist bullist',
  'link image',
  'table media',
  'lineheight outdent indent',
  'forecolor backcolor removeformat',
  'charmap emoticons',
  'code fullscreen preview',
  'save print',
  'pagebreak anchor codesample',
  'ltr rtl',
].join(' | ');

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  /** ป้ายภาษาที่มุมขวาบนของ editor เช่น TH */
  langLabel?: string;
  height?: number;
}

export default function RichEditor({ value, onChange, langLabel, height = 500 }: RichEditorProps) {
  return (
    <div className="rich-editor">
      {langLabel && <span className="rich-editor-lang">{langLabel}</span>}
      <Editor
        licenseKey="gpl"
        value={value}
        onEditorChange={(html) => onChange(html)}
        init={{
          height,
          menubar: MENUBAR,
          plugins: PLUGINS,
          toolbar: TOOLBAR,
          branding: true,
          promotion: false,
          skin_url: 'default',
          content_css: 'default',
          font_family_formats: "IBM Plex Sans Thai='IBM Plex Sans Thai', sans-serif; Arial=arial,helvetica,sans-serif; Georgia=georgia,palatino,serif; Courier New='courier new',courier,monospace",
          content_style: "body { font-family: 'IBM Plex Sans Thai', sans-serif; font-size: 16px; line-height: 1.6; }",
        }}
      />
    </div>
  );
}
