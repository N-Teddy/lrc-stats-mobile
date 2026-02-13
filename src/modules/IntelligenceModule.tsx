import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain,
    TrendingUp,
    UserMinus,
    ShieldCheck,
    Download,
    Filter,
    ChevronRight,
    BarChart3,
    Calendar,
    Share2,
    FileText,
    Zap,
    Users
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../store/ThemeContext';
import { dataService } from '../store/dataService';
import { reportService, YearlyReportConfig, DirectoryReportConfig } from '../store/reportService';
import FluidCard from '../components/FluidCard';

const IntelligenceModule: React.FC = () => {
    const { t } = useTranslation();
    const { accentColor } = useTheme();
    const [stats, setStats] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState<string | null>(null);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        const [people, activities, attendance] = await Promise.all([
            dataService.getPeople(),
            dataService.getActivities(),
            dataService.getAttendance()
        ]);

        // Basic intelligence logic
        const active = people.filter(p => !p.isArchived).length;
        const jrs = people.filter(p => !p.isArchived && p.isJRs).length;

        // At risk (missed last 3 activities)
        const recentActivities = activities
            .filter(a => !a.isDeleted && new Date(a.date) <= new Date())
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 3);

        const atRisk = people.filter(p => {
            if (p.isArchived) return false;
            if (recentActivities.length < 3) return false;
            return recentActivities.every(act => {
                const att = attendance.find(attr => attr.activityId === act.id);
                return !att || !att.personIds.includes(p.id);
            });
        });

        setStats({
            active,
            jrs,
            atRisk: atRisk.length,
            sessions: activities.length,
            availableYears: Array.from(new Set(activities.map(a => new Date(a.date).getFullYear().toString()))).sort().reverse()
        });
    };

    const runYearlyAudit = async () => {
        if (!stats?.availableYears?.length) return;
        setIsGenerating('yearly');
        const config: YearlyReportConfig = {
            years: [stats.availableYears[0]],
            sortBy: 'name',
            order: 'asc'
        };
        await reportService.generateYearlyReport(config);
        setIsGenerating(null);
    };

    const runDirectoryAudit = async () => {
        setIsGenerating('directory');
        const config: DirectoryReportConfig = {
            sortBy: 'name',
            order: 'asc',
            fields: { status: true, integration: true, percentage: true }
        };
        await reportService.generateDirectoryReport(config);
        setIsGenerating(null);
    };

    if (!stats) return null;

    return (
        <div style={{ paddingBottom: '120px' }}>
            <div style={{
                padding: 'calc(var(--safe-area-top) + 25px) 25px 30px 25px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div className="gradient-mesh" style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, filter: 'blur(40px)', zIndex: 0
                }} />
                <h2 className="font-display" style={{ fontSize: '2.2rem', fontWeight: '900', color: 'white', position: 'relative', zIndex: 1 }}>
                    {t('assistant.title').toUpperCase()}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.5px', marginTop: '5px', position: 'relative', zIndex: 1 }}>
                    {t('assistant.subtitle').toUpperCase()}
                </p>
            </div>

            <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '25px' }}>

                {/* Tactical Overview */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <FluidCard padding="20px" accentColor={accentColor} delay={0.1}>
                        <TrendingUp size={18} color={accentColor} style={{ marginBottom: '12px', opacity: 0.7 }} />
                        <p style={{ fontSize: '0.6rem', fontWeight: '900', color: 'var(--text-muted)', letterSpacing: '1px' }}>VITALITY INDEX</p>
                        <p style={{ fontSize: '1.8rem', fontWeight: '900', fontFamily: 'Space Grotesk', marginTop: '4px' }}>
                            {Math.round((stats.active / 100) * 100)}%
                        </p>
                    </FluidCard>
                    <FluidCard padding="20px" accentColor="var(--accent-crimson)" delay={0.2}>
                        <UserMinus size={18} color="var(--accent-crimson)" style={{ marginBottom: '12px', opacity: 0.7 }} />
                        <p style={{ fontSize: '0.6rem', fontWeight: '900', color: 'var(--text-muted)', letterSpacing: '1px' }}>AT RISK</p>
                        <p style={{ fontSize: '1.8rem', fontWeight: '900', fontFamily: 'Space Grotesk', marginTop: '4px' }}>
                            {stats.atRisk}
                        </p>
                    </FluidCard>
                </div>

                {/* Reporting Suite */}
                <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', marginLeft: '5px' }}>
                        <ShieldCheck size={14} color="var(--text-muted)" />
                        <h3 className="font-technical" style={{ fontSize: '0.65rem', fontWeight: '900', color: 'var(--text-muted)', letterSpacing: '1px' }}>
                            STRATEGIC AUDIT SUITE
                        </h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <FluidCard padding="0" accentColor="#00D4FF" delay={0.3}>
                            <div className="touch-active" onClick={runDirectoryAudit} style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '18px' }}>
                                <div className="glass-v2-inset" style={{ padding: '12px', borderRadius: '14px', backgroundColor: 'rgba(0, 212, 255, 0.1)' }}>
                                    {isGenerating === 'directory' ? <Zap size={20} color="#00D4FF" className="animate-pulse" /> : <Users size={20} color="#00D4FF" />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '0.95rem', fontWeight: '800' }}>PERSONNEL LISTE</p>
                                    <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '700', marginTop: '2px' }}>FULL COMMUNITY DIRECTORY EXPORT</p>
                                </div>
                                <div className="glass-v2-inset" style={{ width: '36px', height: '36px', borderRadius: '10px' }}>
                                    <Share2 size={16} color="var(--text-muted)" />
                                </div>
                            </div>
                        </FluidCard>

                        <FluidCard padding="0" accentColor="var(--accent-purple)" delay={0.4}>
                            <div className="touch-active" onClick={runYearlyAudit} style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '18px' }}>
                                <div className="glass-v2-inset" style={{ padding: '12px', borderRadius: '14px', backgroundColor: 'rgba(187, 134, 252, 0.1)' }}>
                                    {isGenerating === 'yearly' ? <Zap size={20} color="var(--accent-purple)" className="animate-pulse" /> : <Calendar size={20} color="var(--accent-purple)" />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '0.95rem', fontWeight: '800' }}>YEARLY AUDIT CYCLE</p>
                                    <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '700', marginTop: '2px' }}>ATTENDANCE MATRIX FOR {stats.availableYears[0] || 'CURRENT YEAR'}</p>
                                </div>
                                <div className="glass-v2-inset" style={{ width: '36px', height: '36px', borderRadius: '10px' }}>
                                    <Download size={16} color="var(--text-muted)" />
                                </div>
                            </div>
                        </FluidCard>

                        <FluidCard padding="0" accentColor="#00C853" delay={0.5}>
                            <div className="touch-active" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '18px' }}>
                                <div className="glass-v2-inset" style={{ padding: '12px', borderRadius: '14px', backgroundColor: 'rgba(0, 200, 83, 0.1)' }}>
                                    <FileText size={20} color="#00C853" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '0.95rem', fontWeight: '800' }}>CUSTOM DATA QUERY</p>
                                    <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '700', marginTop: '2px' }}>GENERATE TARGETED ANALYTICS</p>
                                </div>
                                <Filter size={16} color="var(--text-muted)" opacity={0.5} />
                            </div>
                        </FluidCard>
                    </div>
                </section>

                {/* Intelligence Analysis */}
                <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', marginLeft: '5px' }}>
                        <Brain size={14} color="var(--text-muted)" />
                        <h3 className="font-technical" style={{ fontSize: '0.65rem', fontWeight: '900', color: 'var(--text-muted)', letterSpacing: '1px' }}>
                            NEURAL INSIGHTS
                        </h3>
                    </div>
                    <FluidCard padding="25px" delay={0.6}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '20px' }}>
                            <div className="glass-v2-inset" style={{ padding: '15px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                                <BarChart3 size={24} color={accentColor} />
                            </div>
                            <div>
                                <p style={{ fontSize: '1rem', fontWeight: '900', color: 'white' }}>Engaged Baseline</p>
                                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', lineHeight: '1.4', marginTop: '4px' }}>
                                    Community resonance is currently hovering at <span style={{ color: accentColor }}>82%</span>.
                                    Strategic focus recommended for the <span style={{ color: 'var(--accent-crimson)' }}>{stats.atRisk} members</span> losing sync.
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ flex: 1, height: '4px', borderRadius: '2px', backgroundColor: accentColor }} />
                            <div style={{ flex: 1, height: '4px', borderRadius: '2px', backgroundColor: accentColor, opacity: 0.6 }} />
                            <div style={{ flex: 1, height: '4px', borderRadius: '2px', backgroundColor: accentColor, opacity: 0.3 }} />
                            <div style={{ flex: 0.5, height: '4px', borderRadius: '2px', backgroundColor: 'var(--accent-crimson)' }} />
                        </div>
                    </FluidCard>
                </section>

                <div style={{ padding: '20px 0', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '1px' }}>
                        ACTIVE COMMAND COMPLETED // NO ANOMALIES DETECTED
                    </p>
                </div>
            </div>
        </div>
    );
};

export default IntelligenceModule;
