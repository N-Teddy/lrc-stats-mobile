import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, User, Phone, Calendar, Clock, TrendingUp, Activity, Award, Mail, MapPin, Edit3 } from 'lucide-react';
import { dataService, Person } from '../store/dataService';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../store/ThemeContext';
import FluidCard from '../components/FluidCard';

interface PersonDetailModuleProps {
    personId: string;
    onBack: () => void;
    onEdit: () => void;
}

const PersonDetailModule: React.FC<PersonDetailModuleProps> = ({ personId, onBack, onEdit }) => {
    const { t } = useTranslation();
    const { accentColor } = useTheme();
    const [person, setPerson] = useState<Person | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalAttendance: 0,
        rate: 0,
        lastSeen: '---',
        joinedDate: '---'
    });

    const { scrollY } = useScroll();
    const heroHeight = useTransform(scrollY, [0, 200], [280, 180]);
    const nameScale = useTransform(scrollY, [0, 200], [1, 0.8]);
    const nameY = useTransform(scrollY, [0, 200], [0, -40]);

    useEffect(() => {
        loadData();
    }, [personId]);

    const loadData = async () => {
        const [people, activities, attendance] = await Promise.all([
            dataService.getPeople(),
            dataService.getActivities(),
            dataService.getAttendance()
        ]);

        const currentPerson = people.find(p => p.id === personId);
        if (!currentPerson) return;
        setPerson(currentPerson);

        const personAttendance = attendance
            .filter(record => record.personIds.includes(personId))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const hist = personAttendance.map(record => {
            const activity = activities.find(act => act.id === record.activityId);
            return {
                id: record.activityId,
                name: activity?.name || record.activityName || 'Unknown Activity',
                date: record.date
            };
        });

        setHistory(hist);

        const totalPossible = activities.filter(act =>
            !act.isDeleted &&
            new Date(act.date) >= new Date(currentPerson.dateIntegration || act.date) &&
            new Date(act.date) <= new Date()
        ).length;

        setStats({
            totalAttendance: hist.length,
            rate: totalPossible > 0 ? Math.round((hist.length / totalPossible) * 100) : 0,
            lastSeen: hist[0]?.date || 'Never',
            joinedDate: currentPerson.dateIntegration || '---'
        });
    };

    if (!person) return <div className="glass-v2" style={{ margin: '40px', padding: '60px', textAlign: 'center' }}>{t('person_detail.loading')}</div>;

    return (
        <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', paddingBottom: '40px' }}>
            {/* Liquid Hero Header */}
            <motion.div
                style={{
                    height: heroHeight,
                    width: '100%',
                    position: 'fixed',
                    top: 0,
                    zIndex: 50,
                    background: `linear-gradient(135deg, ${accentColor}11 0%, transparent 100%)`,
                    overflow: 'hidden',
                    borderBottom: '1px solid var(--glass-border)',
                }}
            >
                {/* Animated Background Mesh */}
                <div className="gradient-mesh" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.15,
                    filter: 'blur(60px)',
                    zIndex: 0
                }} />

                <div style={{
                    position: 'absolute',
                    top: 'calc(var(--safe-area-top) + 15px)',
                    left: '20px',
                    right: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    zIndex: 20
                }}>
                    <button className="glass-v2-inset touch-active" onClick={onBack} style={{ width: '42px', height: '42px', borderRadius: '14px' }}>
                        <ArrowLeft size={18} />
                    </button>
                    <button className="glass-v2-inset touch-active" onClick={onEdit} style={{
                        padding: '0 15px', borderRadius: '14px', fontSize: '0.65rem', fontWeight: '900', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                        <Edit3 size={14} /> {t('common.edit').toUpperCase()}
                    </button>
                </div>

                <motion.div
                    style={{
                        position: 'absolute',
                        bottom: '30px',
                        left: '25px',
                        right: '25px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        zIndex: 10,
                        scale: nameScale,
                        y: nameY
                    }}
                >
                    <div className="glass-v2" style={{
                        width: '90px',
                        height: '90px',
                        borderRadius: '24px',
                        border: '2px solid rgba(255,255,255,0.1)',
                        padding: '3px',
                        flexShrink: 0
                    }}>
                        <div style={{ width: '100%', height: '100%', borderRadius: '20px', overflow: 'hidden', backgroundColor: 'var(--bg-tertiary)' }}>
                            {person.image ? (
                                <img src={person.image} alt={person.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <User size={40} color="var(--text-muted)" />
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <h2 className="font-display" style={{ fontSize: '1.8rem', fontWeight: '900', color: 'white', lineHeight: 1.1 }}>
                            {person.name}
                        </h2>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <div style={{ backgroundColor: accentColor, color: 'black', padding: '3px 12px', borderRadius: '8px', fontSize: '0.6rem', fontWeight: '900', letterSpacing: '0.5px' }}>
                                {t(`directory.${person.status.toLowerCase()}`).toUpperCase()}
                            </div>
                            {person.isJRs && (
                                <div style={{ backgroundColor: 'rgba(0, 200, 83, 0.1)', color: '#00C853', padding: '3px 12px', borderRadius: '8px', border: '1px solid rgba(0, 200, 83, 0.2)', fontSize: '0.6rem', fontWeight: '900' }}>
                                    JRS ELITE
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Content Spacer */}
            <div style={{ height: '300px' }} />

            {/* Main Content Area */}
            <div style={{ padding: '0 20px', position: 'relative', zIndex: 60 }}>
                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                    <FluidCard padding="20px" accentColor={accentColor}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            <TrendingUp size={16} color={accentColor} />
                            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '0.5px' }}>
                                VITALITY SCORE
                            </span>
                        </div>
                        <p style={{ fontSize: '1.8rem', fontWeight: '900', fontFamily: 'Space Grotesk' }}>{stats.rate}%</p>
                        <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '2px', marginTop: '10px', overflow: 'hidden' }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${stats.rate}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                                style={{ height: '100%', backgroundColor: accentColor }}
                            />
                        </div>
                    </FluidCard>

                    <FluidCard padding="20px" accentColor="#00C853">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            <Activity size={16} color="#00C853" />
                            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '0.5px' }}>
                                TOTAL FLOW
                            </span>
                        </div>
                        <p style={{ fontSize: '1.8rem', fontWeight: '900', fontFamily: 'Space Grotesk' }}>{stats.totalAttendance}</p>
                        <p style={{ fontSize: '0.55rem', color: 'var(--text-muted)', marginTop: '5px', fontWeight: '700' }}>
                            SESSIONS RECORDED
                        </p>
                    </FluidCard>
                </div>

                {/* Information Card */}
                <FluidCard padding="25px" marginBottom="25px">
                    <h3 className="font-technical" style={{ fontSize: '0.75rem', fontWeight: '900', letterSpacing: '1px', marginBottom: '20px', color: 'var(--text-muted)' }}>
                        DOSSIER CORE
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div className="glass-v2-inset" style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Phone size={16} color="var(--text-muted)" />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.85rem', fontWeight: '800' }}>{person.phone || '---'}</p>
                                <p style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: '700' }}>MOBILE COMMS</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div className="glass-v2-inset" style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Calendar size={16} color="var(--text-muted)" />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.85rem', fontWeight: '800' }}>{person.dob || '---'}</p>
                                <p style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: '700' }}>TEMPORAL ORIGIN (DOB)</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div className="glass-v2-inset" style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Clock size={16} color="var(--text-muted)" />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.85rem', fontWeight: '800' }}>{stats.joinedDate}</p>
                                <p style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: '700' }}>INTEGRATION DATE</p>
                            </div>
                        </div>
                    </div>
                </FluidCard>

                {/* Participation Logs */}
                <div style={{ marginBottom: '25px' }}>
                    <h3 className="font-technical" style={{ fontSize: '0.75rem', fontWeight: '900', letterSpacing: '1px', marginBottom: '15px', color: 'var(--text-muted)' }}>
                        PARTICIPATION TIMELINE
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {history.length > 0 ? history.slice(0, 10).map((h, i) => (
                            <FluidCard key={i} padding="15px" delay={i * 0.05} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ fontSize: '0.85rem', fontWeight: '800' }}>{h.name}</p>
                                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700' }}>{h.date}</p>
                                </div>
                                <div className="glass-v2-inset" style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Award size={14} color="#00C853" />
                                </div>
                            </FluidCard>
                        )) : (
                            <div style={{ padding: '40px', textAlign: 'center', opacity: 0.4 }}>
                                <Activity size={32} style={{ marginBottom: '10px' }} />
                                <p style={{ fontSize: '0.75rem', fontWeight: '700' }}>{t('person_detail.no_records')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonDetailModule;
