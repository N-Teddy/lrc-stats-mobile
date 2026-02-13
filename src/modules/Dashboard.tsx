import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Activity, Zap, Clock, Cake, Gift, Bell } from 'lucide-react';
import { dataService, Person, Activity as ActivityType, AttendanceRecord } from '../store/dataService';
import { useTheme } from '../store/ThemeContext';
import { useTranslation } from 'react-i18next';
import FluidCard from '../components/FluidCard';
import {
    AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const StatCard = ({ icon: Icon, label, value, color, delay }: any) => {
    const { accentColor } = useTheme();
    return (
        <FluidCard
            padding="16px"
            delay={delay}
            accentColor={color}
            style={{ minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
        >
            <div style={{ color: color || accentColor, opacity: 0.8, marginBottom: '12px' }}>
                <Icon size={20} />
            </div>
            <div>
                <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800' }}>
                    {label}
                </p>
                <motion.p
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    style={{ fontSize: '1.8rem', fontWeight: '900', marginTop: '2px', fontFamily: 'Space Grotesk' }}
                >
                    {value}
                </motion.p>
            </div>
        </FluidCard>
    );
};

const Dashboard: React.FC = () => {
    const { accentColor, theme, toggleTheme } = useTheme();
    const { t } = useTranslation();
    const [stats, setStats] = useState({
        membres: 0, eleves: 0, jrs: 0, total: 0, activitiesCount: 0, avgAttendance: 0,
        recentAttendance: [] as AttendanceRecord[], birthdays: [] as Person[], pendingAlerts: [] as ActivityType[]
    });

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
            recentAttendance: attendance.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-7),
            birthdays: monthlyBirthdays,
            pendingAlerts
        });
    };

    const chartData = useMemo(() => {
        return stats.recentAttendance.map(a => ({
            name: a.activityName.length > 8 ? a.activityName.substring(0, 6) + '..' : a.activityName,
            count: a.count,
            date: a.date
        }));
    }, [stats.recentAttendance]);

    return (
        <div style={{ padding: '0 20px 40px 20px', minHeight: '100%' }}>
            {/* Immersive Header */}
            <header style={{
                height: "var(--header-height)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
                paddingTop: "var(--safe-area-top)"
            }}>
                <div>
                    <h1 className="font-display" style={{ fontSize: "1.6rem", fontWeight: '900', color: 'white' }}>
                        LRC <span style={{ color: accentColor }}>Stats</span>
                    </h1>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: '700' }}>
                        Intelligence Dashboard
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="glass-v2 touch-active" onClick={toggleTheme} style={{
                        width: '40px', height: '40px', borderRadius: '12px', minWidth: '40px', fontSize: '0.7rem'
                    }}>
                        {theme === 'dark' ? 'DARK' : 'LIGHT'}
                    </button>
                    <div className="glass-v2" style={{
                        width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Bell size={18} />
                    </div>
                </div>
            </header>

            {/* Critical Alert */}
            {stats.pendingAlerts.length > 0 && (
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="glass-v2 touch-active"
                    style={{
                        padding: '16px',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '20px',
                        border: '1px solid rgba(255, 23, 68, 0.2)',
                        background: 'linear-gradient(90deg, rgba(255, 23, 68, 0.1) 0%, transparent 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px'
                    }}
                >
                    <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(255, 23, 68, 0.1)' }}>
                        <Clock size={18} color="var(--accent-crimson)" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '700' }}>
                            {stats.pendingAlerts.length} Pending Actions
                        </p>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                            Attendance records require finalization
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Quick Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                <StatCard icon={Users} label={t('directory.membres')} value={stats.membres} color="#00D4FF" delay={0.1} />
                <StatCard icon={Zap} label={t('dashboard.jrs_group')} value={stats.jrs} color="#BB86FC" delay={0.2} />
                <StatCard icon={Calendar} label={t('sidebar.activities')} value={stats.activitiesCount} color="#536DFE" delay={0.3} />
                <StatCard icon={Activity} label={t('dashboard.average')} value={stats.avgAttendance} color="#00C853" delay={0.4} />
            </div>

            {/* Engagement Graph */}
            <FluidCard padding="20px" marginBottom="25px" delay={0.5}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 className="font-technical" style={{ fontSize: '0.75rem', fontWeight: '900', letterSpacing: '1px' }}>
                        {t('dashboard.engagement_title').toUpperCase()}
                    </h3>
                    <div style={{ padding: '4px 10px', borderRadius: '10px', backgroundColor: 'rgba(0, 200, 83, 0.1)', color: '#00C853', fontSize: '0.6rem', fontWeight: '800' }}>
                        ACTIVE FLOW
                    </div>
                </div>
                <div style={{ width: '100%', height: '180px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={accentColor} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: '700' }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: '12px', border: '1px solid var(--glass-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                itemStyle={{ color: 'white', fontWeight: 'bold' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke={accentColor}
                                strokeWidth={3}
                                fill="url(#colorCount)"
                                animationDuration={1500}
                                animationBegin={600}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </FluidCard>

            {/* Recent Intelligence Hub */}
            <div style={{ marginBottom: '25px' }}>
                <h3 className="font-technical" style={{ fontSize: '0.75rem', fontWeight: '900', letterSpacing: '1px', marginBottom: '15px', color: 'var(--text-muted)' }}>
                    HISTORY LOG
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {stats.recentAttendance.length > 0 ? stats.recentAttendance.slice(-4).reverse().map((act, i) => (
                        <FluidCard key={act.activityId} padding="15px" delay={0.6 + (i * 0.1)} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div className="glass-v2-inset" style={{ width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Clock size={18} color="var(--text-muted)" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.85rem', fontWeight: '800' }}>{act.activityName}</p>
                                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{act.date}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '1.1rem', fontWeight: '900', color: accentColor }}>{act.count}</p>
                                <p style={{ fontSize: '0.5rem', fontWeight: '800', color: 'var(--text-muted)' }}>PRESENCE</p>
                            </div>
                        </FluidCard>
                    )) : <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t('dashboard.no_activities')}</p>}
                </div>
            </div>

            {/* Birthday Radar */}
            <FluidCard padding="20px" delay={1} className="gradient-mesh" style={{ border: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', position: 'relative', zIndex: 2 }}>
                    <h3 className="font-technical" style={{ fontSize: '0.75rem', fontWeight: '900', letterSpacing: '1px', color: 'white' }}>
                        {t('dashboard.birthday_watch').toUpperCase()}
                    </h3>
                    <Cake size={18} color="#FFD54F" />
                </div>
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px', position: 'relative', zIndex: 2 }}>
                    {stats.birthdays.length > 0 ? stats.birthdays.map((p) => (
                        <div key={p.id} style={{ minWidth: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <div className="glass-v2" style={{ width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)' }}>
                                {p.image ? (
                                    <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                        <Users size={20} color="white" />
                                    </div>
                                )}
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '0.7rem', fontWeight: '800', whiteSpace: 'nowrap' }}>{p.name.split(' ')[0]}</p>
                                <p style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.6)' }}>{p.dob?.substring(5)}</p>
                            </div>
                        </div>
                    )) : <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>No celebrations this month.</p>}
                </div>
            </FluidCard>
        </div>
    );
};

export default Dashboard;
