import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, ChevronRight, Lock, Unlock, CheckCircle2, Users, Mic2, HeartPulse, Gamepad2, Home, MoreHorizontal } from 'lucide-react';
import { dataService, Activity as ActivityType, AttendanceRecord, ACTIVITY_TYPES, getActivityTypeKey } from '../store/dataService';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../store/ThemeContext';

const TYPE_CONFIG: any = {
    'REUNION MENSUELLE': { icon: Users, color: 'var(--accent-primary)' },
    'CONFERENCE': { icon: Mic2, color: 'var(--accent-green)' },
    'SERVICE JRS': { icon: HeartPulse, color: 'var(--accent-crimson)' },
    'ACTIVITE LUDIQUE': { icon: Gamepad2, color: '#7928ca' },
    'JPO': { icon: Home, color: '#f5a623' },
    'AUTRES': { icon: MoreHorizontal, color: 'var(--text-muted)' }
};

interface ActivitiesModuleProps {
    onTrackAttendance: (activity: ActivityType) => void;
    onAnalyzeActivity: (activity: ActivityType) => void;
}

const ActivitiesModule: React.FC<ActivitiesModuleProps> = ({ onTrackAttendance, onAnalyzeActivity }) => {
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
        <div className="animate-in" style={{ padding: '0 0 80px 0' }}>
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                backgroundColor: 'rgba(5, 5, 5, 0.8)',
                backdropFilter: 'blur(20px)',
                padding: 'calc(var(--safe-area-top) + 15px) 20px 15px 20px',
                borderBottom: '1px solid var(--glass-border)'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0 15px',
                    border: '1px solid var(--border-color)'
                }}>
                    <Search size={18} color="var(--text-muted)" />
                    <input
                        type="text"
                        placeholder={t('activities.search_placeholder')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-primary)',
                            fontSize: '0.95rem'
                        }}
                    />
                </div>

                <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginTop: '15px'
                }}>
                    {[
                        { id: 'all', label: t('activities.all_logs') },
                        { id: 'past', label: t('activities.past_only') },
                        { id: 'scheduled', label: t('activities.scheduled') }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id as any)}
                            style={{
                                padding: '6px 14px',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                backgroundColor: filter === tab.id ? accentColor : 'var(--bg-tertiary)',
                                color: filter === tab.id ? 'black' : 'var(--text-secondary)',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            {tab.label.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {filtered.map((activity, idx) => {
                    const attRecord = attendance.find(att => att.activityId === activity.id);
                    const isLocked = attRecord?.isLocked || false;
                    const isRecorded = !!attRecord;
                    const config = TYPE_CONFIG[activity.type] || TYPE_CONFIG['AUTRES'];
                    const Icon = config.icon;

                    return (
                        <div
                            key={activity.id}
                            className="glass"
                            style={{
                                padding: '15px',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--glass-border)',
                                position: 'relative',
                                opacity: isLocked ? 0.7 : 1
                            }}
                            onClick={() => onTrackAttendance(activity)}
                        >
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <div style={{
                                    padding: '10px',
                                    backgroundColor: 'var(--bg-tertiary)',
                                    borderRadius: 'var(--radius-md)',
                                    border: `1px solid ${config.color}33`
                                }}>
                                    <Icon size={20} color={config.color} />
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{activity.name}</h4>
                                        {isLocked ? <Lock size={12} color="var(--text-muted)" /> : <Unlock size={12} color={accentColor} opacity={0.5} />}
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{activity.date}</span>
                                        <span style={{ fontSize: '0.7rem', color: config.color, fontWeight: 'bold' }}>
                                            {t(`activities.type_${getActivityTypeKey(activity.type)}`)}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                                    {isRecorded && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-green)' }}>
                                            <CheckCircle2 size={12} />
                                            <span style={{ fontSize: '0.65rem', fontWeight: 'bold' }}>{attRecord?.count}</span>
                                        </div>
                                    )}
                                    <ChevronRight size={18} color="var(--text-muted)" />
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filtered.length === 0 && (
                    <div style={{ padding: '60px 0', textAlign: 'center', opacity: 0.5 }}>
                        <p style={{ fontSize: '0.9rem' }}>{t('activities.no_activities')}</p>
                    </div>
                )}
            </div>

            <button
                className="touch-active"
                style={{
                    position: 'fixed',
                    bottom: 'calc(var(--nav-bar-height) + 20px)',
                    right: '25px',
                    width: '56px',
                    height: '56px',
                    borderRadius: '28px',
                    backgroundColor: accentColor,
                    color: 'black',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
                    zIndex: 100
                }}
            >
                <Plus size={24} />
            </button>
        </div>
    );
};

export default ActivitiesModule;
