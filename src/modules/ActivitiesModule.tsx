import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, ChevronRight, Lock, Unlock, CheckCircle2, Users, Mic2, HeartPulse, Gamepad2, Home, MoreHorizontal, Calendar } from 'lucide-react';
import { dataService, Activity as ActivityType, AttendanceRecord, getActivityTypeKey } from '../store/dataService';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../store/ThemeContext';
import FluidCard from '../components/FluidCard';

const TYPE_CONFIG: any = {
    'REUNION MENSUELLE': { icon: Users, color: '#00D4FF' },
    'CONFERENCE': { icon: Mic2, color: '#BB86FC' },
    'SERVICE JRS': { icon: HeartPulse, color: 'var(--accent-crimson)' },
    'ACTIVITE LUDIQUE': { icon: Gamepad2, color: '#00C853' },
    'JPO': { icon: Home, color: '#FFD54F' },
    'AUTRES': { icon: MoreHorizontal, color: 'var(--text-muted)' }
};

interface ActivitiesModuleProps {
    onTrackAttendance: (activity: ActivityType) => void;
}

const ActivitiesModule: React.FC<ActivitiesModuleProps> = ({ onTrackAttendance }) => {
    const { t } = useTranslation();
    const { accentColor } = useTheme();
    const [activities, setActivities] = useState<ActivityType[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'past' | 'scheduled'>('all');

    useEffect(() => {
        loadActivities();
    }, []);

    const loadActivities = async () => {
        const [actData, attData] = await Promise.all([
            dataService.getActivities(),
            dataService.getAttendance()
        ]);
        setActivities(actData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setAttendance(attData);
    };

    const filtered = activities.filter(a => {
        if (a.isDeleted) return false;
        const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase());
        const isFuture = new Date(a.date) > new Date();
        const matchesFilter = filter === 'all' ||
            (filter === 'past' && !isFuture) ||
            (filter === 'scheduled' && isFuture);

        return matchesSearch && matchesFilter;
    });

    return (
        <div style={{ padding: '0 0 100px 0' }}>
            {/* Sticky Search Header */}
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                backgroundColor: 'rgba(11, 14, 20, 0.8)',
                backdropFilter: 'blur(20px)',
                padding: 'calc(var(--safe-area-top) + 15px) 20px 15px 20px',
            }}>
                <div className="glass-v2-inset" style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0 15px',
                    border: '1px solid var(--glass-border)'
                }}>
                    <Search size={18} color="var(--text-muted)" />
                    <input
                        type="text"
                        placeholder={t('activities.search_placeholder')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            flex: 1,
                            padding: '14px 12px',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-primary)',
                            fontSize: '0.9rem',
                            backdropFilter: 'none'
                        }}
                    />
                </div>

                <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginTop: '15px',
                    overflowX: 'auto',
                    scrollbarWidth: 'none'
                }}>
                    {[
                        { id: 'all', label: t('activities.all_logs') },
                        { id: 'past', label: t('activities.past_only') },
                        { id: 'scheduled', label: t('activities.scheduled') }
                    ].map(tab => {
                        const isActive = filter === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setFilter(tab.id as any)}
                                style={{
                                    padding: '8px 18px',
                                    borderRadius: '12px',
                                    fontSize: '0.65rem',
                                    fontWeight: '900',
                                    whiteSpace: 'nowrap',
                                    letterSpacing: '0.5px',
                                    backgroundColor: isActive ? accentColor : 'rgba(255,255,255,0.03)',
                                    color: isActive ? 'black' : 'var(--text-muted)',
                                    transition: 'var(--transition-smooth)',
                                    border: isActive ? 'none' : '1px solid var(--glass-border)'
                                }}
                            >
                                {tab.label.toUpperCase()}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div style={{ padding: '10px 20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <AnimatePresence>
                    {filtered.map((activity, i) => {
                        const attRecord = attendance.find(att => att.activityId === activity.id);
                        const isLocked = attRecord?.isLocked || false;
                        const isRecorded = !!attRecord;
                        const config = TYPE_CONFIG[activity.type] || TYPE_CONFIG['AUTRES'];
                        const Icon = config.icon;

                        return (
                            <FluidCard
                                key={activity.id}
                                padding="18px"
                                delay={i * 0.05}
                                onClick={() => onTrackAttendance(activity)}
                                accentColor={config.color}
                                style={{ opacity: isLocked ? 0.7 : 1 }}
                            >
                                <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
                                    <div className="glass-v2-inset" style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                        border: `1px solid ${config.color}33`
                                    }}>
                                        <Icon size={22} color={config.color} />
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                                                {activity.name}
                                            </h4>
                                            {isLocked ? (
                                                <div style={{ padding: '3px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                                    <Lock size={10} color="var(--text-muted)" />
                                                </div>
                                            ) : (
                                                <div style={{ padding: '3px', borderRadius: '6px', backgroundColor: `${accentColor}11` }}>
                                                    <Unlock size={10} color={accentColor} />
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '6px', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', opacity: 0.5 }}>
                                                <Calendar size={10} />
                                                <span style={{ fontSize: '0.65rem', fontWeight: '700' }}>{activity.date}</span>
                                            </div>
                                            <div style={{ padding: '2px 8px', borderRadius: '6px', backgroundColor: `${config.color}11`, color: config.color, fontSize: '0.55rem', fontWeight: '900', letterSpacing: '0.5px' }}>
                                                {t(`activities.type_${getActivityTypeKey(activity.type)}`).toUpperCase()}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                                        {isRecorded ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#00C853' }}>
                                                <CheckCircle2 size={12} />
                                                <span style={{ fontSize: '1rem', fontWeight: '900', fontFamily: 'Space Grotesk' }}>{attRecord?.count}</span>
                                            </div>
                                        ) : (
                                            <div style={{ padding: '4px 8px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)', fontSize: '0.6rem', fontWeight: '800' }}>
                                                PENDING
                                            </div>
                                        )}
                                        <ChevronRight size={16} color="var(--text-muted)" style={{ opacity: 0.5 }} />
                                    </div>
                                </div>
                            </FluidCard>
                        );
                    })}
                </AnimatePresence>

                {filtered.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ padding: '80px 0', textAlign: 'center', opacity: 0.4 }}
                    >
                        <Calendar size={48} style={{ marginBottom: '15px' }} />
                        <p style={{ fontSize: '0.8rem', fontWeight: '600' }}>{t('activities.no_activities')}</p>
                    </motion.div>
                )}
            </div>

            {/* Fluid FAB */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="gradient-mesh touch-active"
                style={{
                    position: 'fixed',
                    bottom: 'calc(var(--safe-area-bottom) + 100px)',
                    right: '25px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '20px',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
                    zIndex: 100,
                    border: '1px solid rgba(255,255,255,0.2)'
                }}
            >
                <Plus size={26} />
            </motion.button>
        </div>
    );
};

export default ActivitiesModule;
