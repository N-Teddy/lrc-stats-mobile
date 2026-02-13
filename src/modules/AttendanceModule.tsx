import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Check, ShieldCheck, Lock, Unlock, Users } from 'lucide-react';
import { dataService, Person, AttendanceRecord } from '../store/dataService';
import { notificationService } from '../store/notificationService';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../store/ThemeContext';
import FluidCard from '../components/FluidCard';

interface AttendanceModuleProps {
    activity: any;
    onBack: () => void;
}

const AttendanceModule: React.FC<AttendanceModuleProps> = ({ activity, onBack }) => {
    const { t } = useTranslation();
    const { accentColor } = useTheme();
    const [people, setPeople] = useState<Person[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [search, setSearch] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        loadData();
    }, [activity]);

    const loadData = async () => {
        const [allPeople, allAttendance] = await Promise.all([
            dataService.getPeople(),
            dataService.getAttendance()
        ]);

        setPeople(allPeople.filter(p => !p.isArchived));

        const currentAtt = allAttendance.find(a => a.activityId === activity.id);
        if (currentAtt) {
            setSelectedIds(new Set(currentAtt.personIds));
            setIsLocked(!!currentAtt.isLocked);
        }
    };

    const togglePerson = (id: string) => {
        if (isLocked) return;
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelectedIds(newSelected);

        // Minor haptic feel
        if (navigator.vibrate) navigator.vibrate([5]);
    };

    const handleSave = async (shouldLock = false) => {
        setIsSaving(true);
        try {
            const allAttendance = await dataService.getAttendance();
            const otherAttendance = allAttendance.filter(a => a.activityId !== activity.id);

            const newEntry: AttendanceRecord = {
                id: (allAttendance.find(a => a.activityId === activity.id) as any)?.id || activity.id,
                activityId: activity.id,
                activityName: activity.name,
                date: activity.date,
                personIds: Array.from(selectedIds),
                count: selectedIds.size,
                isLocked: shouldLock || isLocked,
                updatedAt: new Date().toISOString()
            };

            await dataService.saveAttendance([...otherAttendance, newEntry]);
            notificationService.notify(
                shouldLock ? t('attendance.locked') : t('attendance.recording'),
                shouldLock ? t('attendance.finalized_msg') : t('attendance.saved_msg'),
                'success'
            );
            onBack();
        } catch (err) {
            console.error(err);
            notificationService.notify(t('common.error'), 'Failed to save attendance.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const filtered = people.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) &&
        (!isLocked || selectedIds.has(p.id))
    );

    return (
        <div style={{ paddingBottom: '140px' }}>
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                backgroundColor: 'rgba(11, 14, 20, 0.8)',
                backdropFilter: 'blur(20px)',
                padding: 'calc(var(--safe-area-top) + 15px) 20px 15px 20px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                    <button onClick={onBack} className="glass-v2-inset touch-active" style={{ width: '40px', height: '40px', borderRadius: '12px' }}>
                        <ArrowLeft size={18} />
                    </button>
                    <div style={{ flex: 1 }}>
                        <h2 className="font-display" style={{ fontSize: '1.1rem', fontWeight: '900', color: 'white', letterSpacing: '-0.02em' }}>
                            {activity.name.toUpperCase()}
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isLocked ? 'var(--accent-crimson)' : '#00C853', boxShadow: `0 0 10px ${isLocked ? 'var(--accent-crimson)' : '#00C853'}66` }} />
                            <span style={{ fontSize: '0.6rem', color: isLocked ? 'var(--accent-crimson)' : 'var(--text-muted)', fontWeight: '900', letterSpacing: '0.5px' }}>
                                {isLocked ? 'SESSION FINALIZED' : 'TRACKING LIVE'}
                            </span>
                        </div>
                    </div>
                    <div className="glass-v2-inset" style={{ padding: '8px 15px', borderRadius: '12px', border: `1px solid ${accentColor}33`, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={14} color={accentColor} />
                        <span style={{ fontSize: '1.1rem', fontWeight: '900', color: accentColor, fontFamily: 'Space Grotesk' }}>{selectedIds.size}</span>
                    </div>
                </div>

                <div className="glass-v2-inset" style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0 15px',
                    border: '1px solid var(--glass-border)'
                }}>
                    <Search size={16} color="var(--text-muted)" />
                    <input
                        type="text"
                        placeholder={t('attendance.search_placeholder')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-primary)',
                            fontSize: '0.85rem'
                        }}
                    />
                </div>
            </div>

            <div style={{ padding: '15px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <AnimatePresence>
                    {filtered.map((p, i) => {
                        const isSelected = selectedIds.has(p.id);
                        return (
                            <FluidCard
                                key={p.id}
                                padding="14px 18px"
                                delay={i * 0.03}
                                onClick={() => togglePerson(p.id)}
                                accentColor={isSelected ? (isLocked ? 'var(--accent-crimson)' : accentColor) : 'transparent'}
                                style={{
                                    border: isSelected ? `1px solid ${isLocked ? 'var(--accent-crimson)' : accentColor}44` : '1px solid var(--glass-border)',
                                    opacity: isLocked && !isSelected ? 0.4 : 1
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div className="glass-v2-inset" style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: isSelected ? `${isLocked ? 'var(--accent-crimson)' : accentColor}22` : 'rgba(255,255,255,0.03)',
                                        border: isSelected ? `1px solid ${isLocked ? 'var(--accent-crimson)' : accentColor}33` : '1px solid var(--glass-border)',
                                        transition: 'var(--transition-smooth)'
                                    }}>
                                        {isSelected ? (
                                            <Check size={20} color={isLocked ? 'var(--accent-crimson)' : accentColor} strokeWidth={3} />
                                        ) : (
                                            <div style={{ width: '8px', height: '8px', borderRadius: '2px', border: '2px solid var(--text-muted)', opacity: 0.3 }} />
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '0.9rem', fontWeight: '800', color: isSelected ? 'white' : 'var(--text-primary)', transition: 'color 0.2s' }}>{p.name}</p>
                                        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px' }}>{t(`directory.${p.status.toLowerCase()}`).toUpperCase()}</span>
                                    </div>
                                    {p.isJRs && (
                                        <div style={{ padding: '3px 8px', borderRadius: '6px', backgroundColor: 'rgba(0, 200, 83, 0.1)', color: '#00C853', fontSize: '0.5rem', fontWeight: '900' }}>
                                            JRS
                                        </div>
                                    )}
                                </div>
                            </FluidCard>
                        );
                    })}
                </AnimatePresence>
            </div>

            {!isLocked && (
                <div style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '20px 25px calc(var(--safe-area-bottom) + 20px) 25px',
                    backgroundColor: 'rgba(11, 14, 20, 0.9)',
                    backdropFilter: 'blur(30px)',
                    borderTop: '1px solid var(--glass-border)',
                    display: 'flex',
                    gap: '15px',
                    zIndex: 1000
                }}>
                    <button
                        className="glass-v2-inset touch-active"
                        onClick={() => handleSave(false)}
                        disabled={isSaving}
                        style={{
                            flex: 1,
                            padding: '18px',
                            borderRadius: '16px',
                            color: 'white',
                            fontWeight: '900',
                            fontSize: '0.75rem',
                            letterSpacing: '1px',
                            border: '1px solid var(--glass-border)'
                        }}
                    >
                        {t('attendance.save').toUpperCase()}
                    </button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="touch-active"
                        onClick={async () => {
                            const confirmed = await notificationService.confirm(
                                t('attendance.finalize'),
                                t('attendance.finalize_confirm')
                            );
                            if (confirmed) {
                                handleSave(true);
                            }
                        }}
                        disabled={isSaving}
                        style={{
                            flex: 1.5,
                            padding: '18px',
                            borderRadius: '16px',
                            backgroundColor: accentColor,
                            color: 'black',
                            fontWeight: '900',
                            fontSize: '0.75rem',
                            letterSpacing: '1px',
                            boxShadow: `0 10px 25px ${accentColor}44`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px'
                        }}
                    >
                        <ShieldCheck size={18} />
                        {t('attendance.finalize').toUpperCase()}
                    </motion.button>
                </div>
            )}
        </div>
    );
};

export default AttendanceModule;
