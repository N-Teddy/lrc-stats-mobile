import React, { useState } from 'react';
import { Cloud, Save, Download, Upload, Trash2, Shield, ChevronRight } from 'lucide-react';
import { useTheme, ACCENTS } from '../store/ThemeContext';
import { useTranslation } from 'react-i18next';
import { syncService } from '../store/syncService';
import { notificationService } from '../store/notificationService';

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
        <div className="animate-in" style={{ padding: '0 0 40px 0' }}>
            <div style={{
                padding: 'calc(var(--safe-area-top) + 20px) 20px 20px 20px',
                borderBottom: '1px solid var(--glass-border)',
                marginBottom: '20px'
            }}>
                <h2 className="font-technical" style={{ fontSize: '1.5rem', fontWeight: '900' }}>{t('settings.title').toUpperCase()}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('settings.subtitle')}</p>
            </div>

            <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '25px' }}>

                {/* Cloud Sync Section */}
                <section>
                    <h3 className="font-technical" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '10px', marginLeft: '5px' }}>CLOUD SERVICES</h3>
                    <div className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                        <div
                            className="touch-active"
                            onClick={handleSync}
                            style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px solid var(--glass-border)' }}
                        >
                            <div style={{ padding: '10px', backgroundColor: 'rgba(0, 112, 243, 0.1)', borderRadius: '10px' }}>
                                <Cloud size={20} color="#0070f3" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>{t('settings.sync_now')}</p>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{isSyncing ? 'Synchronizing...' : 'Update communal vault data'}</p>
                            </div>
                            <ChevronRight size={18} color="var(--text-muted)" />
                        </div>
                    </div>
                </section>

                {/* Appearance Section */}
                <section>
                    <h3 className="font-technical" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '10px', marginLeft: '5px' }}>APPEARANCE</h3>
                    <div className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', padding: '20px' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <p style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '15px' }}>{t('settings.accent_theme')}</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                                {Object.entries(ACCENTS).map(([key, data]) => (
                                    <button
                                        key={key}
                                        onClick={() => setAccent(key as any)}
                                        style={{
                                            aspectRatio: '1',
                                            borderRadius: '50%',
                                            backgroundColor: data.color,
                                            border: accent === key ? '3px solid white' : 'none',
                                            boxShadow: accent === key ? `0 0 15px ${data.color}` : 'none',
                                            transition: 'all 0.2s cubic-bezier(0.18, 0.89, 0.32, 1.28)'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Dark Mode</p>
                            <button
                                onClick={toggleTheme}
                                style={{
                                    width: '50px',
                                    height: '26px',
                                    backgroundColor: theme === 'dark' ? accentColor : 'var(--bg-tertiary)',
                                    borderRadius: '13px',
                                    position: 'relative',
                                    transition: 'background-color 0.3s ease'
                                }}
                            >
                                <div style={{
                                    width: '20px',
                                    height: '20px',
                                    backgroundColor: 'white',
                                    borderRadius: '10px',
                                    position: 'absolute',
                                    top: '3px',
                                    left: theme === 'dark' ? '27px' : '3px',
                                    transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }} />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Localization Section */}
                <section>
                    <h3 className="font-technical" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '10px', marginLeft: '5px' }}>LOCALIZATION</h3>
                    <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '5px' }}>
                        <div style={{ display: 'flex' }}>
                            {['en', 'fr'].map(lang => (
                                <button
                                    key={lang}
                                    onClick={() => i18n.changeLanguage(lang)}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        borderRadius: 'var(--radius-md)',
                                        backgroundColor: i18n.language.startsWith(lang) ? 'rgba(255,255,255,0.05)' : 'transparent',
                                        color: i18n.language.startsWith(lang) ? accentColor : 'var(--text-muted)',
                                        fontWeight: 'bold',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    {lang === 'en' ? 'ENGLISH' : 'FRANÇAIS'}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Data Backup Section */}
                <section>
                    <h3 className="font-technical" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '10px', marginLeft: '5px' }}>DATA STORAGE</h3>
                    <div className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                        <div className="touch-active" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px solid var(--glass-border)' }}>
                            <Save size={18} color="var(--text-muted)" />
                            <span style={{ fontSize: '0.9rem', flex: 1 }}>{t('settings.export_backup')}</span>
                            <Download size={16} color="var(--text-muted)" />
                        </div>
                        <div className="touch-active" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <Shield size={18} color="var(--text-muted)" />
                            <span style={{ fontSize: '0.9rem', flex: 1 }}>{t('settings.restore_backup')}</span>
                            <Upload size={16} color="var(--text-muted)" />
                        </div>
                    </div>
                </section>

                {/* Maintenance Section */}
                <section style={{ marginTop: '10px' }}>
                    <div className="glass" style={{
                        padding: '20px',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid rgba(255, 77, 77, 0.2)',
                        backgroundColor: 'rgba(255, 77, 77, 0.05)'
                    }}>
                        <h3 className="font-technical" style={{ fontSize: '0.8rem', color: 'var(--accent-crimson)', marginBottom: '15px', fontWeight: 'bold' }}>
                            DANGER ZONE
                        </h3>
                        <button
                            className="touch-active"
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: 'rgba(255, 77, 77, 0.1)',
                                color: 'var(--accent-crimson)',
                                border: '1px solid var(--accent-crimson)',
                                fontWeight: 'bold',
                                fontSize: '0.8rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px'
                            }}
                        >
                            <Trash2 size={16} />
                            FACTORY RESET
                        </button>
                    </div>
                </section>

                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '2px' }}>LRC STATS MOBILE V1.0.0</p>
                    <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '5px' }}>ENCRYPTED • MOBILE NATIVE • TAURI V2</p>
                </div>

            </div>
        </div>
    );
};

export default SettingsModule;
