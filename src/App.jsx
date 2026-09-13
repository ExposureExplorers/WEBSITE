import React, { Suspense, lazy, useState, useEffect } from 'react'
import './App.css'
import './styles/responsive.css'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import RouteTransitionLoader from './components/RouteTransitionLoader'
import MobileChromeHider from './components/MobileChromeHider'
import { Analytics } from "@vercel/analytics/react"
import { useMediaQuery } from './hooks/useMediaQuery'
import Wireframe1 from './components/Wireframe1'
import './utils/tutorialTestHelper'

const Landing = lazy(() => import('./components/Landing'))
const TextCursorOverlay = lazy(() => import('./components/TextCursorOverlay'))
const Frame50 = lazy(() => import('./components/Frame50'))
const Featured = lazy(() => import('./components/Featured'))
const FeaturedMobile = lazy(() => import('./components/FeaturedMobile'))
const TheTeamPage = lazy(() => import('./components/TheTeamPage'))
const TheTeamMobile = lazy(() => import('./components/the-team-mobile'))
const AboutUs = lazy(() => import('./components/AboutUs'))
const AboutUsMobile = lazy(() => import('./components/AboutUsMobile'))
const Admin = lazy(() => import('./components/Admin'))
const Fly = lazy(() => import('./components/Fly'))
const Events = lazy(() => import('./components/Events'))
const ContactUs = lazy(() => import('./components/ContactUs'))
const ContactUsMobile = lazy(() => import('./components/ContactUsMobile'))
const Desktop1 = lazy(() => import('./components/Desktop1'))

function ContactRoute() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return isMobile ? <ContactUsMobile /> : <ContactUs />;
}

function FeaturedRoute() {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  return isMobile ? <FeaturedMobile /> : <Featured />;
}

function TheTeamRoute() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return isMobile ? <TheTeamMobile /> : <TheTeamPage />;
}

function AboutUsRoute() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return isMobile ? <AboutUsMobile /> : <AboutUs />;
}

function App() {
  return (
    <Router>
      <Suspense fallback={null}>
        <InnerApp />
      </Suspense>
      <Analytics />
    </Router>
  );
}

function InnerApp() {
  const location = useLocation();
  const showFrame50 = location.pathname === '/';

  // Splash screen logic
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000); // 3.5 seconds

    return () => clearTimeout(timer);
  }, []);

  // Show splash first
  if (showSplash) {
    return <Wireframe1 />;
  }

  return (
    <div className="app-wrapper">
      {location.pathname === '/pictures' && <MobileChromeHider />}
      <RouteTransitionLoader />
      <TextCursorOverlay />
      {showFrame50 && <Frame50 />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/merch" element={<Desktop1 />} />
        <Route path="/about-us" element={<AboutUsRoute />} />
        <Route path="/effects" element={<div style={{ width: '100%', height: '100vh', background: '#0b74ff' }} />} />
        <Route path="/gallery" element={<FeaturedRoute />} />
        <Route path="/pictures" element={<FeaturedRoute />} />
        <Route path="/the-team" element={<TheTeamRoute />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/fly" element={<Fly />} />
        <Route path="/events" element={<Events />} />
        <Route path="/contact" element={<ContactRoute />} />
      </Routes>
    </div>
  );
}

export default App