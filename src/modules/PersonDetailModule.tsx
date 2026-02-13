import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Phone, Calendar, Clock, TrendingUp, Activity, Download, Award, Zap } from 'lucide-react';
import { dataService, Person, AttendanceRecord, Activity as ActivityType } from '../store/dataService';
import { reportService } from '../store/reportService';
import { useTranslation } from 'react-i18next';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../store/ThemeContext';

interface PersonDetailModuleProps {
    personId: string;
    onBack: () => void;
}

const PersonDetailModule: React.FC<PersonDetailModuleProps> = ({ personId, onBack }) => {
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

    if (!person) return <div className="glass" style={{ margin: '20px', padding: '40px', textAlign: 'center' }}>{t('person_detail.loading')}</div>;

    return (
        <div className="animate-in" style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', paddingBottom: '40px' }}>
            <div style={{
                height: '220px',
                backgroundColor: 'var(--bg-secondary)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '20px',
                borderBottom: '1px solid var(--glass-border)',
                background: `linear-gradient(to bottom, transparent, rgba(0,0,0,0.8)), radial-gradient(circle at top right, ${accentColor}11, transparent)`
            }}>
                <button
                    onClick={onBack}
                    style={{
                        position: 'absolute',
                        top: 'calc(var(--safe-area-top) + 15px)',
                        left: '20px',
                        width: '40px',
                        height: '40px',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10
                    }}
                >
                    <ArrowLeft size={20} />
                </button>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '2px solid var(--glass-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <User size={40} color="var(--text-muted)" />
                    </div>
                    <div>
                        <h2 className="font-technical" style={{ fontSize: '1.5rem', fontWeight: '900', color: 'white' }}>{person.name}</h2>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                            <span style={{ fontSize: '0.6rem', backgroundColor: accentColor, color: 'black', padding: '2px 10px', borderRadius: '10px', fontWeight: 'bold' }}>
                                {t(`directory.${person.status.toLowerCase()}`).toUpperCase()}
                            </span>
                            {person.isJRs && <span style={{ fontSize: '0.6rem', backgroundColor: 'var(--accent-green)', color: 'black', padding: '2px 10px', borderRadius: '10px', fontWeight: 'bold' }}>JRS</span>}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ padding: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                    <div className="glass" style={{ padding: '15px', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                        <TrendingUp size={16} color={accentColor} style={{ marginBottom: '8px' }} />
                        <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('person_detail.engagement')}</p>
                        <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{stats.rate}%</p>
                    </div>
                    <div className="glass" style={{ padding: '15px', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                        <Activity size={16} color="var(--accent-green)" style={{ marginBottom: '8px' }} />
                        <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('person_detail.sessions')}</p>
                        <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{stats.totalAttendance}</p>
                    </div>
                </div>

                <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', marginBottom: '25px' }}>
                    <h3 className="font-technical" style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '20px', color: 'var(--text-muted)' }}>{t('person_detail.information').toUpperCase()}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Phone size={16} color="var(--text-muted)" />
                            <span style={{ fontSize: '0.9rem' }}>{person.phone || '---'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Calendar size={16} color="var(--text-muted)" />
                            <span style={{ fontSize: '0.9rem' }}>{t('person_detail.born')}: {person.dob || '---'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Clock size={16} color="var(--text-muted)" />
                            <span style={{ fontSize: '0.9rem' }}>{t('person_detail.joined')}: {stats.joinedDate}</span>
                        </div>
                    </div>
                </div>

                <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
                    <h3 className="font-technical" style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '20px', color: 'var(--text-muted)' }}>{t('person_detail.recent_participation').toUpperCase()}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {history.length > 0 ? history.slice(0, 10).map((h, i) => (
                            <div key={i} style={{
                                padding: '12px',
                                backgroundColor: 'var(--bg-tertiary)',
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                border: '1px solid var(--glass-border)'
                            }}>
                                <div>
                                    <p style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{h.name}</p>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{h.date}</p>
                                </div>
                                <Award size={16} color="var(--accent-green)" />
                            </div>
                        )) : (
                            <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{t('person_detail.no_records')}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonDetailModule;
