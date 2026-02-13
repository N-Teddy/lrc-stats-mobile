import React, { useState, useEffect, useMemo } from 'react';
import { Users, Calendar, Activity, Zap, Clock, Cake, Gift, ChevronRight } from 'lucide-react';
import { dataService, Person, Activity as ActivityType, AttendanceRecord } from '../store/dataService';
import { useTheme } from '../store/ThemeContext';
import { useTranslation } from 'react-i18next';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const StatCard = ({ icon: Icon, label, value, color, subtext }: any) => (
    <div className="glass" style={{ padding: '16px', borderRadius: 'var(--radius-lg)', position: 'relative', overflow: 'hidden' }}>
        <div style={{
            position: 'absolute', top: '-10px', right: '-10px', width: '60px', height: '60px',
            background: `radial-gradient(circle, rgba(${color}, 0.1) 0%, transparent 70%)`
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ color: `rgb(${color})`, marginBottom: '8px' }}>
                <Icon size={18} />
            </div>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>{label}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: '900', marginTop: '2px' }}>{value}</p>
            {subtext && <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '2px' }}>{subtext}</p>}
        </div>
    </div>
);

const Dashboard: React.FC = () => {
    const { accentColor, theme, toggleTheme } = useTheme();
    const { t } = useTranslation();
    const [stats, setStats] = useState({
        membres: 0, eleves: 0, jrs: 0, total: 0, activitiesCount: 0, avgAttendance: 0,
        recentAttendance: [] as AttendanceRecord[], birthdays: [] as Person[], pendingAlerts: [] as ActivityType[]
    });
    const [allData, setAllData] = useState({ people: [] as Person[] });

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        const [people, activities, attendance] = await Promise.all([
            dataService.getPeople(),
            dataService.getActivities(),
            dataService.getAttendance()
        ]);

        const activePeople = people.filter(p => !p.isArchived && !p.isDeleted);
        const jrs = activePeople.filter(p => p.isJRs).length;
        const membres = activePeople.filter(p => p.status === 'Membre').length;
        const eleves = activePeople.filter(p => p.status === 'Eleve').length;

        const totalAttendance = attendance.reduce((sum, entry) => sum + (entry.count || 0), 0);
        const avg = attendance.length > 0 ? Math.round(totalAttendance / attendance.length) : 0;

        const currentMonth = new Date().getMonth();
        const monthlyBirthdays = activePeople.filter(p => p.dob && new Date(p.dob).getMonth() === currentMonth);

        const today = new Date();
        const pendingAlerts = activities.filter(a => {
            if (a.isDeleted) return false;
            const actDate = new Date(a.date);
            const isPast = actDate < today;
            const isLocked = attendance.some(att => att.activityId === a.id && att.isLocked);
            return isPast && !isLocked;
        });

        setStats({
            membres, eleves, jrs, total: activePeople.length,
            activitiesCount: activities.length, avgAttendance: avg,
            recentAttendance: attendance.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-5),
            birthdays: monthlyBirthdays,
            pendingAlerts
        });
        setAllData({ people: activePeople });
    };

    const chartData = useMemo(() => {
        return stats.recentAttendance.map(a => ({
            name: a.activityName.length > 8 ? a.activityName.substring(0, 6) + '..' : a.activityName,
            count: a.count,
            date: a.date
        }));
    }, [stats.recentAttendance]);

    return (
        <div className="animate-in" style={{ padding: '20px' }}>
            <header style={{
                height: "var(--header-height)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
                paddingTop: "var(--safe-area-top)"
            }}>
                <h1 className="font-technical" style={{ fontSize: "1.2rem", color: accentColor }}>
                    LRC STATS MOBILE
                </h1>
                <button className="touch-active" onClick={toggleTheme} style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                    {theme.toUpperCase()}
                </button>
            </header>

            {stats.pendingAlerts.length > 0 && (
                <div className="glass" style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: '20px',
                    border: '1px solid var(--accent-crimson)',
                    backgroundColor: 'rgba(255, 77, 77, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <Clock size={16} color="var(--accent-crimson)" />
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>
                        {stats.pendingAlerts.length} {t('dashboard.pending_attendance_msg')}
                    </p>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <StatCard icon={Users} label={t('directory.membres')} value={stats.membres} color="0, 210, 255" />
                <StatCard icon={Zap} label={t('dashboard.jrs_group')} value={stats.jrs} color="57, 255, 20" />
                <StatCard icon={Calendar} label={t('sidebar.activities')} value={stats.activitiesCount} color="0, 112, 243" />
                <StatCard icon={Activity} label={t('dashboard.average')} value={stats.avgAttendance} color="255, 170, 0" />
            </div>

            <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: '20px' }}>
                <h3 className="font-technical" style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '15px' }}>{t('dashboard.engagement_title').toUpperCase()}</h3>
                <div style={{ width: '100%', height: '160px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={accentColor} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 9 }} />
                            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', fontSize: '10px' }} />
                            <Area type="monotone" dataKey="count" stroke={accentColor} strokeWidth={2} fill="url(#colorCount)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', marginBottom: '20px' }}>
                <h3 className="font-technical" style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '15px' }}>{t('dashboard.recent_activity_hub').toUpperCase()}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {stats.recentAttendance.length > 0 ? stats.recentAttendance.slice(-3).reverse().map((act, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--glass-border)' }}>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{act.activityName}</p>
                                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{act.date}</p>
                            </div>
                            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: accentColor }}>{act.count}</span>
                        </div>
                    )) : <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t('dashboard.no_activities')}</p>}
                </div>
            </div>

            <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, rgba(255, 170, 0, 0.05) 0%, transparent 100%)', border: '1px solid rgba(255, 170, 0, 0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 className="font-technical" style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#ffaa00' }}>{t('dashboard.birthday_watch').toUpperCase()}</h3>
                    <Cake size={14} color="#ffaa00" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {stats.birthdays.slice(0, 3).map((p, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Gift size={14} color="var(--text-muted)" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{p.name}</p>
                                <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{p.dob?.substring(5)}</p>
                            </div>
                        </div>
                    ))}
                    {stats.birthdays.length === 0 && <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>No celebrations this month.</p>}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
