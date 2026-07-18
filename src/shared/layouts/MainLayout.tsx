import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/shared/components/layout/Sidebar';
import { Navbar } from '@/shared/components/layout/Navbar';
import { CommandMenu } from '@/shared/components/CommandMenu';
import { useIncidentModal } from '@/context/IncidentModalContext';

interface MainLayoutProps {
  children: React.ReactNode;
  currentScreen: string;
  onNavigate: (target: string) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, currentScreen, onNavigate }) => {
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const { openIncidentModal } = useIncidentModal();

  // Keyboard shortcut listener (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandMenuOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen w-full flex bg-slate-100 dark:bg-slate-950 grid-bg relative">
      {/* Spotlight design effect */}
      <div className="absolute inset-0 spotlight pointer-events-none opacity-40"></div>

      {/* Main Glassmorphic Sidebar */}
      <Sidebar 
        currentScreen={currentScreen} 
        onNavigate={onNavigate}
      />

      {/* Screen Frame containing Navbar and active Screen */}
      <div className="flex-1 flex flex-col min-h-screen p-4 gap-4 overflow-x-hidden">
        {/* Glass Top Navbar */}
        <Navbar 
          currentScreen={currentScreen} 
          onNavigate={onNavigate} 
          onOpenCommandMenu={() => setIsCommandMenuOpen(true)}
        />

        {/* Dynamic Screen Slot */}
        <main className="flex-1 w-full relative">
          {children}
        </main>
      </div>

      {/* Floating Raycast Command Overlay */}
      <CommandMenu 
        isOpen={isCommandMenuOpen}
        onClose={() => setIsCommandMenuOpen(false)}
        onNavigate={onNavigate}
        onDeclareIncident={() => openIncidentModal()}
      />
    </div>
  );
};
