import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import OverviewPage from './pages/OverviewPage';
import ServiceNetworkPage from './pages/ServiceNetworkPage';
import PopularityPage from './pages/PopularityPage';
import ExploratoryAnalysisPage from './pages/ExploratoryAnalysisPage';
import AssociationRulesPage from './pages/AssociationRulesPage';
import JourneySimulatorPage from './pages/JourneySimulatorPage';
import IntegrationPlanningPage from './pages/IntegrationPlanningPage';
import SystemInformationPage from './pages/SystemInformationPage';
import Sidebar, { NAVIGATION_ITEMS } from './components/layout/Sidebar';
import Header from './components/layout/Header';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { sound } from './services/soundService';

function AppContent() {
  const [showLanding, setShowLanding] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { isDark } = useTheme();

  const currentTabItem = NAVIGATION_ITEMS.find(item => item.id === activeTab) || NAVIGATION_ITEMS[0];

  const handleTabChange = (tabId) => {
    sound.playTransition();
    setActiveTab(tabId);
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPage onNavigate={handleTabChange} />;
      case 'network':
        return <ServiceNetworkPage />;
      case 'popularity':
        return <PopularityPage />;
      case 'eda':
        return <ExploratoryAnalysisPage />;
      case 'rules':
        return <AssociationRulesPage />;
      case 'simulator':
        return <JourneySimulatorPage />;
      case 'integration':
        return <IntegrationPlanningPage />;
      case 'system':
        return <SystemInformationPage />;
      default:
        return <OverviewPage onNavigate={handleTabChange} />;
    }
  };

  if (showLanding) {
    return <LandingPage onEnterApplication={() => setShowLanding(false)} />;
  }

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-sans transition-colors duration-300 ${
      isDark
        ? 'bg-[#050816] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200'
        : 'bg-[#F8FAFC] text-slate-900 selection:bg-sky-500/20 selection:text-sky-900'
    }`}>
      {/* Collapsible Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onReturnToLanding={() => setShowLanding(true)}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Sticky Top Header */}
        <Header
          activeTabLabel={currentTabItem.label}
          subtitle="Government Service Intelligence & Recommendation System"
        />

        {/* Scrollable Page View with Animated Transitions and Generous Margins */}
        <main className={`flex-1 overflow-y-auto px-8 py-10 md:px-14 md:py-12 transition-colors ${
          isDark
            ? 'bg-gradient-to-b from-[#050816] via-[#080D1C] to-[#050816]'
            : 'bg-gradient-to-b from-[#F8FAFC] via-[#F1F5F9] to-[#F8FAFC]'
        }`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              {renderActivePage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
