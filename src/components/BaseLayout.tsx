import React, { ReactNode } from 'react';
import NotificationOverlay from './NotificationOverlay';
import TacticalModal from './TacticalModal';
import TacticalPrompt from './TacticalPrompt';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../store/ThemeContext';
import { LayoutDashboard, Users, Zap, Settings } from 'lucide-react';

interface BaseLayoutProps {
    children: ReactNode;
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ children, activeTab, setActiveTab }) => {
    const { t } = useTranslation();
    const { accentColor } = useTheme();

    const navItems = [
        { id: 'dashboard', icon: <LayoutDashboard size={24} />, label: t('sidebar.dashboard') },
        { id: 'people', icon: <Users size={24} />, label: t('sidebar.directory') },
        { id: 'activities', icon: <Zap size={24} />, label: t('sidebar.activities') },
        { id: 'settings', icon: <Settings size={24} />, label: t('sidebar.settings') }
    ];

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            overflow: 'hidden'
        }}>
            <NotificationOverlay />
            <TacticalModal />
            <TacticalPrompt />

            <main style={{
                flex: 1,
                overflowY: 'auto',
                position: 'relative',
                paddingBottom: '20px'
            }}>
                {children}
            </main>

            <nav className="glass" style={{
                height: 'var(--nav-bar-height)',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                paddingBottom: 'var(--safe-area-bottom)',
                borderTop: '1px solid var(--glass-border)',
                zIndex: 1000
            }}>
                {navItems.map(item => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            className="touch-active"
                            onClick={() => setActiveTab(item.id)}
                            style={{
                                flexDirection: 'column',
                                gap: '4px',
                                minWidth: '64px',
                                opacity: isActive ? 1 : 0.4,
                                color: isActive ? accentColor : 'var(--text-secondary)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {item.icon}
                            <span style={{ fontSize: '0.65rem', fontWeight: isActive ? 'bold' : 'normal' }}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default BaseLayout;
