import { Routes, Route } from 'react-router-dom';
import AppLayout from './layout/AppLayout';
import Dashboard from './pages/Dashboard';
import RequestStatus from './pages/RequestStatus';
import ContentList from './pages/content/ContentList';
import ContentForm from './pages/content/ContentForm';
import Media from './pages/Media';
import Trash from './pages/Trash';
import CalculatorList from './pages/calculator/CalculatorList';
import CalculatorEdit from './pages/calculator/CalculatorEdit';
import Placeholder from './pages/Placeholder';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="requests" element={<RequestStatus />} />
        <Route path="content" element={<ContentList />} />
        <Route path="content/new" element={<ContentForm key="new" />} />
        <Route path="content/:id" element={<ContentForm />} />
        <Route path="media" element={<Media />} />
        <Route path="trash" element={<Trash />} />
        <Route path="rates/calculator" element={<CalculatorList />} />
        <Route path="rates/calculator/:id" element={<CalculatorEdit />} />
        <Route path="*" element={<Placeholder />} />
      </Route>
    </Routes>
  );
}
