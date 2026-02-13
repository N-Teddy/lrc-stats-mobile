import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Save, Download, Upload, Trash2, ChevronRight, Palette, Globe, RefreshCcw, Info } from 'lucide-react';
import { useTheme, ACCENTS } from '../store/ThemeContext';
import { useTranslation } from 'react-i18next';
import { syncService } from '../store/syncService';
import { notificationService } from '../store/notificationService';
import FluidCard from '../components/FluidCard';

const SettingsModule: React.FC = () => {
    const { theme, toggleTheme, accentColor, accent, setAccent } = useTheme();
    const { t, i18n } = useTranslation();
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            await syncService.sync();
            notificationService.notify(t('settings.sync_success'), t('settings.sync_success_msg'));
        } catch (err: any) {
            notificationService.notify(t('settings.sync_failed_title'), err.message, 'error');
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div style={{ padding: '0 0 100px 0' }}>
            <div style={{
                padding: 'calc(var(--safe-area-top) + 25px) 25px 30px 25px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div className="gradient-mesh" style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, filter: 'blur(40px)', zIndex: 0
                }} />
                <h2 className="font-display" style={{ fontSize: '2.2rem', fontWeight: '900', color: 'white', position: 'relative', zIndex: 1 }}>
                    {t('settings.title').toUpperCase()}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.5px', marginTop: '5px', position: 'relative', zIndex: 1 }}>
                    {t('settings.subtitle').toUpperCase()}
                </p>
            </div>

            <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {/* Cloud Sync Section */}
                <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', marginLeft: '5px' }}>
                        <Cloud size={14} color="var(--text-muted)" />
                        <h3 className="font-technical" style={{ fontSize: '0.65rem', fontWeight: '900', color: 'var(--text-muted)', letterSpacing: '1px' }}>
                            NEURAL SYNC & CLOUD
                        </h3>
                    </div>
                    <FluidCard padding="0" accentColor="#0070f3">
                        <div
                            className="touch-active"
                            onClick={handleSync}
                            style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '18px' }}
                        >
                            <div className="glass-v2-inset" style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(0, 112, 243, 0.1)' }}>
                                <RefreshCcw size={20} color="#0070f3" className={isSyncing ? 'animate-spin' : ''} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.95rem', fontWeight: '800' }}>{t('settings.sync_now')}</p>
                                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', marginTop: '2px' }}>
                                    {isSyncing ? 'SYNCHRONIZING WITH VAULT...' : 'UPDATE LOCAL DATA FROM CLOUD'}
                                </p>
                            </div>
                            <ChevronRight size={18} color="var(--text-muted)" opacity={0.5} />
                        </div>
                    </FluidCard>
                </section>

                {/* Appearance Section */}
                <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', marginLeft: '5px' }}>
                        <Palette size={14} color="var(--text-muted)" />
                        <h3 className="font-technical" style={{ fontSize: '0.65rem', fontWeight: '900', color: 'var(--text-muted)', letterSpacing: '1px' }}>
                            VISUAL ARCHITECTURE
                        </h3>
                    </div>
                    <FluidCard padding="25px">
                        <div style={{ marginBottom: '25px' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: '900', marginBottom: '20px', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                                CORE ACCENT ENGINE
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px' }}>
                                {Object.entries(ACCENTS).map(([key, data]) => (
                                    <motion.button
                                        key={key}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setAccent(key as any)}
                                        style={{
                                            aspectRatio: '1',
                                            borderRadius: '12px',
                                            backgroundColor: data.color,
                                            border: accent === key ? '2px solid white' : '1px solid rgba(255,255,255,0.1)',
                                            boxShadow: accent === key ? `0 0 20px ${data.color}66` : 'none',
                                            position: 'relative'
                                        }}
                                    >
                                        {accent === key && (
                                            <motion.div
                                                layoutId="accent-ring"
                                                style={{ position: 'absolute', top: -5, left: -5, right: -5, bottom: -5, borderRadius: '16px', border: `2px solid ${data.color}`, opacity: 0.5 }}
                                            />
                                        )}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px', borderTop: '1px solid var(--glass-border)' }}>
                            <div>
                                <p style={{ fontSize: '0.85rem', fontWeight: '800' }}>DARK PROTOCOL</p>
                                <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '700', marginTop: '2px' }}>TOGGLE SYSTEM LUMINANCE</p>
                            </div>
                            <button
                                onClick={toggleTheme}
                                style={{
                                    width: '54px',
                                    height: '28px',
                                    backgroundColor: theme === 'dark' ? accentColor : 'rgba(255,255,255,0.05)',
                                    borderRadius: '14px',
                                    position: 'relative',
                                    border: '1px solid var(--glass-border)'
                                }}
                            >
                                <motion.div
                                    animate={{ left: theme === 'dark' ? '28px' : '4px' }}
                                    style={{
                                        width: '20px',
                                        height: '20px',
                                        backgroundColor: theme === 'dark' ? 'black' : 'white',
                                        borderRadius: '10px',
                                        position: 'absolute',
                                        top: '3px',
                                    }}
                                />
                            </button>
                        </div>
                    </FluidCard>
                </section>

                {/* Localization Section */}
                <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', marginLeft: '5px' }}>
                        <Globe size={14} color="var(--text-muted)" />
                        <h3 className="font-technical" style={{ fontSize: '0.65rem', fontWeight: '900', color: 'var(--text-muted)', letterSpacing: '1px' }}>
                            LINGUISTIC MATRIX
                        </h3>
                    </div>
                    <FluidCard padding="5px">
                        <div style={{ display: 'flex' }}>
                            {['en', 'fr'].map(lang => {
                                const isActive = i18n.language.startsWith(lang);
                                return (
                                    <button
                                        key={lang}
                                        onClick={() => i18n.changeLanguage(lang)}
                                        style={{
                                            flex: 1,
                                            padding: '14px',
                                            borderRadius: '10px',
                                            backgroundColor: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                                            color: isActive ? accentColor : 'var(--text-muted)',
                                            fontWeight: '900',
                                            fontSize: '0.75rem',
                                            letterSpacing: '1px',
                                            transition: 'var(--transition-smooth)'
                                        }}
                                    >
                                        {lang === 'en' ? 'ENGLISH' : 'FRANÇAIS'}
                                    </button>
                                );
                            })}
                        </div>
                    </FluidCard>
                </section>

                {/* Data Backup Section */}
                <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', marginLeft: '5px' }}>
                        <Save size={14} color="var(--text-muted)" />
                        <h3 className="font-technical" style={{ fontSize: '0.65rem', fontWeight: '900', color: 'var(--text-muted)', letterSpacing: '1px' }}>
                            ARCHIVE MANAGEMENT
                        </h3>
                    </div>
                    <FluidCard padding="0">
                        <div className="touch-active" style={{ padding: '18px 25px', display: 'flex', alignItems: 'center', gap: '18px', borderBottom: '1px solid var(--glass-border)' }}>
                            <div className="glass-v2-inset" style={{ padding: '10px', borderRadius: '10px' }}>
                                <Download size={18} color="var(--text-muted)" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.9rem', fontWeight: '800' }}>EXPORT DOSSIER</p>
                                <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '700' }}>GENERATE ENCRYPTED BACKUP</p>
                            </div>
                        </div>
                        <div className="touch-active" style={{ padding: '18px 25px', display: 'flex', alignItems: 'center', gap: '18px' }}>
                            <div className="glass-v2-inset" style={{ padding: '10px', borderRadius: '10px' }}>
                                <Upload size={18} color="var(--text-muted)" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.9rem', fontWeight: '800' }}>IMPORT DOSSIER</p>
                                <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '700' }}>RESTORE FROM BACKUP FILE</p>
                            </div>
                        </div>
                    </FluidCard>
                </section>

                {/* Maintenance Section */}
                <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', marginLeft: '5px' }}>
                        <Trash2 size={14} color="var(--accent-crimson)" />
                        <h3 className="font-technical" style={{ fontSize: '0.65rem', fontWeight: '900', color: 'var(--accent-crimson)', letterSpacing: '1px' }}>
                            CRITICAL COMMANDS
                        </h3>
                    </div>
                    <FluidCard padding="20px" style={{ backgroundColor: 'rgba(255, 77, 77, 0.03)', border: '1px solid rgba(255, 77, 77, 0.1)' }}>
                        <motion.button
                            whileHover={{ backgroundColor: 'rgba(255, 77, 77, 0.15)' }}
                            whileTap={{ scale: 0.98 }}
                            className="touch-active"
                            style={{
                                width: '100%',
                                padding: '16px',
                                borderRadius: '12px',
                                backgroundColor: 'rgba(255, 77, 77, 0.1)',
                                color: 'var(--accent-crimson)',
                                border: '1px solid rgba(255, 77, 77, 0.3)',
                                fontWeight: '900',
                                fontSize: '0.75rem',
                                letterSpacing: '1.5px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px'
                            }}
                        >
                            <Trash2 size={16} />
                            FACTORY SYSTEM RESET
                        </motion.button>
                    </FluidCard>
                </section>

                <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.3 }}>
                    <div className="glass-v2-inset" style={{ display: 'inline-flex', padding: '10px 20px', borderRadius: '20px', marginBottom: '15px' }}>
                        <Info size={14} style={{ marginRight: '8px' }} />
                        <span style={{ fontSize: '0.65rem', fontWeight: '900', letterSpacing: '2px' }}>OS VERSION 1.4.2 // BUILD.7721</span>
                    </div>
                    <p style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                        &copy; 2026 JRS ELITE STATS • ENCRYPTED • TAURI V2 CORE
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SettingsModule;
