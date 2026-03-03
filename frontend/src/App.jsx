import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import CatalogPage from './pages/CatalogPage';
import DetailPage from './pages/DetailPage';
import AdminPage from './pages/AdminPage';
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<CatalogPage />} />
          <Route path="coin/:id" element={<DetailPage />} />
          <Route path="admin" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'USER_WALLET']}>
              <AdminPage />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
