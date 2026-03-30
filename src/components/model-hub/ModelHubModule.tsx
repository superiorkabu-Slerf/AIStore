import { useEffect, useState } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import './module/modelhub.css';
import { Layout } from './module/components/Layout';
import { SearchModal } from './module/components/SearchModal';
import { CompareProvider } from './module/contexts/CompareContext';
import { Compare } from './module/pages/Compare';
import { Discover } from './module/pages/Discover';
import { ModelDetail } from './module/pages/ModelDetail';
import { ProviderDetail } from './module/pages/ProviderDetail';
import { ProviderEcosystem } from './module/pages/ProviderEcosystem';
import { Providers } from './module/pages/Providers';
import { Rankings } from './module/pages/Rankings';

export default function ModelHubModule() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <CompareProvider>
      <Toaster position="top-center" theme="dark" richColors />
      <HashRouter basename="/model-hub">
        <div className="modelhub-scope modelhub-shell">
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/ai-models/providers" replace />} />
              <Route path="/ai-models" element={<Navigate to="/ai-models/providers" replace />} />
              <Route path="/ai-models/discover" element={<Discover />} />
              <Route path="/ai-models/providers" element={<Providers />} />
              <Route path="/ai-models/providers/:id" element={<ProviderDetail />} />
              <Route path="/ai-models/models/:id" element={<ModelDetail />} />
              <Route path="/ai-models/rankings" element={<Rankings />} />
              <Route path="/ai-models/compare" element={<Compare />} />
              <Route path="/ai-models/ecosystem" element={<ProviderEcosystem />} />
              <Route path="*" element={<Navigate to="/ai-models/providers" replace />} />
            </Routes>
          </Layout>
          <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </div>
      </HashRouter>
    </CompareProvider>
  );
}
