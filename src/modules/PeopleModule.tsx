import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, User, Phone, AlertTriangle, TrendingUp, ChevronRight } from 'lucide-react';
import { intelligenceService, VitalityRanking } from '../store/intelligenceService';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../store/ThemeContext';
import FluidCard from '../components/FluidCard';

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

        return matchesSearch && matchesTab;
    });

    return (
        <div style={{ padding: '0 0 100px 0' }}>
            {/* Immersive Search Header */}
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
                    transition: 'var(--transition-smooth)',
                    border: '1px solid var(--glass-border)'
                }}>
                    <Search size={18} color="var(--text-muted)" />
                    <input
                        type="text"
                        placeholder={t('directory.search_placeholder')}
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
                    paddingBottom: '5px',
                    scrollbarWidth: 'none'
                }}>
                    {[
                        { id: 'active', label: t('directory.view_all_active') },
                        { id: 'jrs', label: t('directory.view_jrs') },
                        { id: 'archived', label: t('directory.view_archived') }
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

            {/* Staggered List */}
            <div style={{ padding: '10px 20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <AnimatePresence>
                    {filtered.map((rank, i) => {
                        const p = rank.person;
                        const isVeryActive = rank.score >= 0.75;
                        const isActive = rank.score >= 0.4 && rank.score < 0.75;

                        return (
                            <FluidCard
                                key={p.id}
                                padding="15px"
                                delay={i * 0.05}
                                onClick={() => onViewPerson(p.id)}
                                accentColor={isVeryActive ? '#00C853' : (isActive ? accentColor : '#555')}
                            >
                                <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
                                    <div style={{ position: 'relative' }}>
                                        <div className="glass-v2-inset" style={{
                                            width: '54px',
                                            height: '54px',
                                            borderRadius: '16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                            overflow: 'hidden'
                                        }}>
                                            {p.image ? (
                                                <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <User size={24} color="var(--text-muted)" />
                                            )}
                                        </div>
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '-3px',
                                            right: '-3px',
                                            width: '14px',
                                            height: '14px',
                                            borderRadius: '50%',
                                            backgroundColor: isVeryActive ? '#00C853' : (isActive ? accentColor : 'var(--text-muted)'),
                                            border: '2px solid var(--bg-primary)',
                                            boxShadow: `0 0 10px ${isVeryActive ? '#00C85388' : (isActive ? accentColor + '88' : 'transparent')}`
                                        }} />
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                                            {p.name}
                                        </h4>
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px' }}>
                                                {t(`directory.${p.status.toLowerCase()}`)}
                                            </span>
                                            {p.isJRs && (
                                                <div style={{ padding: '2px 6px', borderRadius: '6px', backgroundColor: 'rgba(0, 200, 83, 0.1)', color: '#00C853', fontSize: '0.55rem', fontWeight: '900' }}>
                                                    JRS
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            color: rank.forecast === 'Drop Risk' ? 'var(--accent-crimson)' : (rank.forecast === 'Growing' ? '#00C853' : 'var(--text-muted)')
                                        }}>
                                            {rank.forecast === 'Drop Risk' && <AlertTriangle size={12} />}
                                            {rank.forecast === 'Growing' && <TrendingUp size={12} />}
                                            <span style={{ fontSize: '0.8rem', fontWeight: '900', fontFamily: 'Space Grotesk' }}>
                                                {Math.round(rank.score * 100)}%
                                            </span>
                                        </div>
                                        <ChevronRight size={16} color="var(--text-muted)" style={{ opacity: 0.5 }} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '12px', alignItems: 'center', opacity: 0.4 }}>
                                    <Phone size={10} />
                                    <span style={{ fontSize: '0.65rem', fontWeight: '700' }}>{p.phone || '---'}</span>
                                </div>
                            </FluidCard>
                        );
                    })}
                </AnimatePresence>

                {filtered.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ padding: '60px 0', textAlign: 'center', opacity: 0.4 }}
                    >
                        <User size={48} style={{ marginBottom: '15px' }} />
                        <p style={{ fontSize: '0.8rem', fontWeight: '600' }}>{t('directory.no_assets_found')}</p>
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
                onClick={onAddPerson}
            >
                <UserPlus size={26} />
            </motion.button>
        </div>
    );
};

export default PeopleModule;
