import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import CatalogPage from './pages/CatalogPage';
import DetailPage from './pages/DetailPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<CatalogPage />} />
          <Route path="coin/:id" element={<DetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
