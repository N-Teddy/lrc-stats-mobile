import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationOverlay from './NotificationOverlay';
import TacticalModal from './TacticalModal';
import TacticalPrompt from './TacticalPrompt';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../store/ThemeContext';
import { LayoutDashboard, Users, Zap, Settings, Brain } from 'lucide-react';

interface BaseLayoutProps {
    children: ReactNode;
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ children, activeTab, setActiveTab }) => {
    const { t } = useTranslation();
    const { accentColor } = useTheme();

    const navItems = [
        { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: t('sidebar.dashboard') },
        { id: 'people', icon: <Users size={20} />, label: t('sidebar.directory') },
        { id: 'activities', icon: <Zap size={20} />, label: t('sidebar.activities') },
        { id: 'intelligence', icon: <Brain size={20} />, label: t('sidebar.assistant') },
        { id: 'settings', icon: <Settings size={20} />, label: t('sidebar.settings') }
    ];

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            overflow: 'hidden',
            position: 'relative'
        }}>
            <NotificationOverlay />
            <TacticalModal />
            <TacticalPrompt />

            <main style={{
                flex: 1,
                overflowY: 'auto',
                position: 'relative',
                paddingBottom: '120px' // Space for floating nav
            }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -15, scale: 0.98 }}
                        transition={{
                            duration: 0.4,
                            ease: [0.3, 1, 0.3, 1]
                        }}
                        style={{ height: '100%' }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Floating Navigation Arc */}
            <div style={{
                position: 'fixed',
                bottom: 'calc(var(--safe-area-bottom) + 15px)',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'min(96%, 440px)',
                zIndex: 1000,
            }}>
                <nav className="glass-v2" style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    padding: '8px',
                    borderRadius: 'var(--radius-lg)',
                    position: 'relative',
                    overflow: 'visible'
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
                                    minWidth: '60px',
                                    height: '60px',
                                    position: 'relative',
                                    transition: 'var(--transition-smooth)'
                                }}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-bg"
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                            borderRadius: 'var(--radius-md)',
                                            zIndex: -1
                                        }}
                                        transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
                                    />
                                )}
                                <div style={{
                                    color: isActive ? accentColor : 'var(--text-muted)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center'
                                }}>
                                    {item.icon}
                                    <span style={{
                                        fontSize: '0.6rem',
                                        fontWeight: isActive ? '900' : 'normal',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        marginTop: '2px',
                                        color: isActive ? 'white' : 'var(--text-muted)'
                                    }}>
                                        {item.label}
                                    </span>
                                </div>
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-dot"
                                        style={{
                                            position: 'absolute',
                                            bottom: '-6px',
                                            width: '4px',
                                            height: '4px',
                                            borderRadius: '50%',
                                            backgroundColor: accentColor,
                                            boxShadow: `0 0 10px ${accentColor}`
                                        }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
};

export default BaseLayout;
