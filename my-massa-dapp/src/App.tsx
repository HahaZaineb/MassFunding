import { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { ThemeProvider } from '@/components/theme-provider';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import Loader from '@/components/Loader';
import { ProjectProvider } from '@/context/project-context';

import LandingPage from '@/pages/Home';
import Projects from '@/pages/Projects';
import RequestFunding from '@/pages/RequestFunding';
import AboutPage from '@/pages/About';
import ProfilePage from './pages/Profile';
import PrivateRoute from './components/PrivateRoute';
import { FundPage } from './pages/Fund';

function App() {
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
      <ProjectProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/request-funding" element={<RequestFunding />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/fund/:projectId" element={<FundPage />} />
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
      </ProjectProvider>
    </ThemeProvider>
  );
}

export default App;
