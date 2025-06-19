import { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeProvider';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import Loader from '@/components/Loader';
import { Provider } from 'react-redux';
import { store } from '@/store';
import LandingPage from '@/pages/Home';
import Projects from '@/pages/Projects';
import RequestFunding from '@/pages/RequestFunding';
import ProfilePage from './pages/Profile';
import PrivateRoute from './components/PrivateRoute';
import { FundPage } from './pages/Fund';
import { ToastProvider } from './contexts/ToastProvider';
import useAccountSync from './hooks/useAccountSync';
import BridgePage from './pages/Bridge';
import AboutPage from './pages/About';
import ScrollToTop from './components/ScrollToTop';
import RoadmapPage from './pages/Roadmap';
import SwapPage from './pages/Swap';
import ProjectDetailsPage from './pages/ProjectDetails';

function App() {
  useAccountSync();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <ThemeProvider>
      <Provider store={store}>
        <ToastProvider>
          <Router>
            <Navbar />
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/request-funding" element={<RequestFunding />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetailsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/fund/:projectId" element={<FundPage />} />
              <Route path="/swap" element={<SwapPage />} />
              <Route path="/bridge" element={<BridgePage />} />
              <Route path="/roadmap" element={<RoadmapPage />} />

              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            <Footer />
          </Router>
        </ToastProvider>
      </Provider>
    </ThemeProvider>
  );
}

export default App;
