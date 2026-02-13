import React, { useState, useEffect } from 'react';
import { Search, UserPlus, User, Phone, AlertTriangle, TrendingUp, ChevronRight } from 'lucide-react';
import { intelligenceService, VitalityRanking } from '../store/intelligenceService';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../store/ThemeContext';

interface PeopleModuleProps {
    onViewPerson: (id: string) => void;
    onAddPerson: () => void;
}

const PeopleModule: React.FC<PeopleModuleProps> = ({ onViewPerson, onAddPerson }) => {
    const { t } = useTranslation();
    const { accentColor } = useTheme();
    const [rankings, setRankings] = useState<VitalityRanking[]>([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'active' | 'jrs' | 'archived'>('active');
    const [statusFilter] = useState<'all' | 'Membre' | 'Eleve'>('all');

    useEffect(() => {
        loadPeople();
    }, []);

    const loadPeople = async () => {
        const data = await intelligenceService.getVitalityRankings();
        setRankings(data);
    };

    const filtered = rankings.filter(r => {
        const p = r.person;
        if (p.isDeleted) return false;

        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.phone.includes(search);

        const matchesTab = filter === 'archived' ? p.isArchived :
            (filter === 'jrs' ? (!p.isArchived && p.isJRs) : !p.isArchived);

        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

        return matchesSearch && matchesTab && matchesStatus;
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
                        placeholder={t('directory.search_placeholder')}
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
                    marginTop: '15px',
                    overflowX: 'auto',
                    paddingBottom: '5px'
                }}>
                    {[
                        { id: 'active', label: t('directory.view_all_active') },
                        { id: 'jrs', label: t('directory.view_jrs') },
                        { id: 'archived', label: t('directory.view_archived') }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id as any)}
                            style={{
                                padding: '6px 14px',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                whiteSpace: 'nowrap',
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
                {filtered.map((rank) => {
                    const p = rank.person;
                    const isVeryActive = rank.score >= 0.75;
                    const isActive = rank.score >= 0.4 && rank.score < 0.75;

                    return (
                        <div
                            key={p.id}
                            className="glass"
                            style={{
                                padding: '15px',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--glass-border)',
                                position: 'relative'
                            }}
                            onClick={() => onViewPerson(p.id)}
                        >
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: 'var(--radius-md)',
                                    backgroundColor: 'var(--bg-tertiary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative'
                                }}>
                                    <User size={24} color="var(--text-muted)" />
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '-4px',
                                        right: '-4px',
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '50%',
                                        backgroundColor: isVeryActive ? 'var(--accent-green)' : (isActive ? 'var(--accent-primary)' : 'var(--text-muted)'),
                                        border: '2px solid var(--bg-primary)'
                                    }} />
                                </div>

                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--text-primary)' }}>{p.name}</h4>
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                                            {t(`directory.${p.status.toLowerCase()}`)}
                                        </span>
                                        {p.isJRs && (
                                            <span style={{ fontSize: '0.65rem', color: 'var(--accent-green)', fontWeight: 'bold' }}>JRs</span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '8px', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                                            <Phone size={12} />
                                            <span style={{ fontSize: '0.7rem' }}>{p.phone || '---'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        color: rank.forecast === 'Drop Risk' ? 'var(--accent-crimson)' : (rank.forecast === 'Growing' ? 'var(--accent-green)' : 'var(--text-muted)')
                                    }}>
                                        {rank.forecast === 'Drop Risk' && <AlertTriangle size={14} />}
                                        {rank.forecast === 'Growing' && <TrendingUp size={14} />}
                                        <span style={{ fontSize: '0.65rem', fontWeight: 'bold' }}>{Math.round(rank.score * 100)}%</span>
                                    </div>
                                    <ChevronRight size={18} color="var(--text-muted)" />
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filtered.length === 0 && (
                    <div style={{ padding: '60px 0', textAlign: 'center', opacity: 0.5 }}>
                        <p style={{ fontSize: '0.9rem' }}>{t('directory.no_assets_found')}</p>
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
                onClick={onAddPerson}
            >
                <UserPlus size={24} />
            </button>
        </div>
    );
};

export default PeopleModule;
