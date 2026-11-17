import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layout/AppLayout';
import Dashboard from './pages/Dashboard';
import RequestStatus from './pages/RequestStatus';
import ContentList from './pages/content/ContentList';
import ContentForm from './pages/content/ContentForm';
import Media from './pages/Media';
import Trash from './pages/Trash';
import CalculatorList from './pages/calculator/CalculatorList';
import CalculatorEdit from './pages/calculator/CalculatorEdit';
import SeoSite from './pages/seo/SeoSite';
import { SchemaWizard } from './pages/seo/Schema';
import { MenuLocation, SetMenuList, SetMenuEditor } from './pages/menu/Menu';
import PathStructure from './pages/PathStructure';
import { BannerList, BannerForm } from './pages/Banner';
import LifeStage from './pages/LifeStage';
import { ProductList, ProductEdit } from './pages/Products';
import { InterestRates, ExchangeRates } from './pages/Rates';
import { AdvisoryList, AdvisoryForm, NewsList, NewsForm, NpaList, NpaForm } from './pages/Modules';
import { FaqList, FaqForm, FileManager } from './pages/Modules2';
import Leads from './pages/Leads';
import { UsersRoles, AuditLog, LanguageSetting, RevisionSetting } from './pages/Settings';
import { AiList, AiWorkspace, AiSettings } from './pages/AiAssistants';
import { ApprovalInbox, ApprovalReview, ApprovalResult } from './pages/Approval';
import { LayoutList, LayoutEdit } from './pages/Layout';
import Login, { NotFound } from './pages/Login';

export default function App() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="requests" element={<RequestStatus />} />
        <Route path="approval" element={<ApprovalInbox key="inbox" />} />
        <Route path="approval/history" element={<ApprovalInbox history key="history" />} />
        <Route path="approval/:id" element={<ApprovalReview />} />
        <Route path="approval/:id/result" element={<ApprovalResult />} />

        <Route path="seo" element={<SeoSite />} />
        <Route path="seo/schema/new" element={<SchemaWizard />} />
        <Route path="menu" element={<Navigate to="/menu/location" replace />} />
        <Route path="menu/location" element={<MenuLocation />} />
        <Route path="menu/set" element={<SetMenuList />} />
        <Route path="menu/set/new" element={<SetMenuEditor key="new" />} />
        <Route path="menu/set/:id" element={<SetMenuEditor />} />
        <Route path="media" element={<Media />} />
        <Route path="banner/hero" element={<BannerList kind="hero" />} />
        <Route path="banner/hero/new" element={<BannerForm kind="hero" />} />
        <Route path="banner/hero/:id" element={<BannerForm kind="hero" />} />
        <Route path="banner/promotion" element={<BannerList kind="promotion" />} />
        <Route path="banner/promotion/new" element={<BannerForm kind="promotion" />} />
        <Route path="banner/promotion/:id" element={<BannerForm kind="promotion" />} />
        <Route path="layout" element={<LayoutList />} />
        <Route path="layout/new" element={<LayoutEdit key="new" />} />
        <Route path="layout/:id" element={<LayoutEdit />} />
        <Route path="path" element={<PathStructure />} />

        <Route path="content" element={<ContentList />} />
        <Route path="content/new" element={<ContentForm key="new" />} />
        <Route path="content/:id" element={<ContentForm />} />

        <Route path="products/loan" element={<ProductList line="loan" />} />
        <Route path="products/loan/new" element={<ProductEdit line="loan" key="loan-new" />} />
        <Route path="products/loan/:id" element={<ProductEdit line="loan" />} />
        <Route path="products/deposit" element={<ProductList line="deposit" />} />
        <Route path="products/deposit/new" element={<ProductEdit line="deposit" key="dep-new" />} />
        <Route path="products/deposit/:id" element={<ProductEdit line="deposit" />} />
        <Route path="life-stage" element={<LifeStage />} />
        <Route path="rates/interest" element={<InterestRates />} />
        <Route path="rates/exchange" element={<ExchangeRates />} />
        <Route path="rates/calculator" element={<CalculatorList />} />
        <Route path="rates/calculator/:id" element={<CalculatorEdit />} />

        <Route path="advisory" element={<AdvisoryList />} />
        <Route path="advisory/new" element={<AdvisoryForm />} />
        <Route path="advisory/:id" element={<AdvisoryForm />} />
        <Route path="news" element={<NewsList />} />
        <Route path="news/new" element={<NewsForm />} />
        <Route path="news/:id" element={<NewsForm />} />
        <Route path="npa" element={<NpaList />} />
        <Route path="npa/new" element={<NpaForm />} />
        <Route path="npa/:id" element={<NpaForm />} />
        <Route path="form" element={<Leads />} />
        <Route path="faq" element={<FaqList />} />
        <Route path="faq/new" element={<FaqForm />} />
        <Route path="faq/:id" element={<FaqForm />} />
        <Route path="files" element={<FileManager />} />

        <Route path="ai" element={<AiList />} />
        <Route path="ai/:id" element={<AiWorkspace />} />
        <Route path="ai/:id/settings" element={<AiSettings />} />
        <Route path="trash" element={<Trash />} />

        <Route path="setting/users" element={<UsersRoles />} />
        <Route path="setting/audit" element={<AuditLog />} />
        <Route path="setting/language" element={<LanguageSetting />} />
        <Route path="setting/revision" element={<RevisionSetting />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
