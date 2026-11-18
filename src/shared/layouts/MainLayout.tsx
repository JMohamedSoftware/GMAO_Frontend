import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/shared/components/layout/Sidebar';
import { Navbar } from '@/shared/components/layout/Navbar';
import { CommandMenu } from '@/shared/components/CommandMenu';
import { useIncidentModal } from '@/context/IncidentModalContext';
import { useGmao } from '@/shared/hooks/useGmao';
import { Archive, RotateCcw } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
  currentScreen: string;
  onNavigate: (target: string) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, currentScreen, onNavigate }) => {
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const { openIncidentModal } = useIncidentModal();
  const { isCampaignClosed, selectedCampaign, setSelectedCampaign, activeRunningCampaign } = useGmao();

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
      <div className="flex-1 flex flex-col min-h-screen p-4 overflow-x-hidden ml-36 lg:ml-44">
        {/* Glass Top Navbar */}
        <Navbar 
          currentScreen={currentScreen} 
          onNavigate={onNavigate} 
          onOpenCommandMenu={() => setIsCommandMenuOpen(true)}
        />

        {/* Dynamic Screen Slot */}
        <main className="flex-1 w-full relative pt-20">
          {/* Global Archive Warning Banner */}
          {isCampaignClosed && (
            <div className="mb-6 w-full bg-amber-500/15 dark:bg-amber-950/40 border border-amber-500/30 rounded-2xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 text-amber-900 dark:text-amber-200 text-xs font-semibold backdrop-blur-md shadow-sm animate-[fadeIn_0.3s_ease-out]">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Archive className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      Mode Archive — {selectedCampaign}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-black uppercase">
                      Clôturée
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 font-normal mt-0.5">
                    Consultation des données historiques en lecture seule. La création et modification d'interventions sont verrouillées pour préserver l'intégrité de l'historique.
                  </p>
                </div>
              </div>
              {activeRunningCampaign && (
                <button
                  onClick={() => setSelectedCampaign(activeRunningCampaign.name)}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer hover:shadow"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Revenir à {activeRunningCampaign.name} (Active)</span>
                </button>
              )}
            </div>
          )}
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
