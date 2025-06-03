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

import LandingPage from '@/pages';
import Projects from '@/pages/projects';
import RequestFunding from '@/pages/request-funding';
import AboutPage from '@/pages/about';

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
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            <Footer />
        </Router>
      </ProjectProvider>
    </ThemeProvider>
  );
}

export default App;
