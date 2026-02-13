import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Check } from 'lucide-react';
import { dataService, Person, AttendanceRecord } from '../store/dataService';
import { notificationService } from '../store/notificationService';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../store/ThemeContext';

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
        if (navigator.vibrate) navigator.vibrate(5);
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
        <div className="animate-in" style={{ paddingBottom: '100px' }}>
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                backgroundColor: 'rgba(5, 5, 5, 0.8)',
                backdropFilter: 'blur(20px)',
                padding: 'calc(var(--safe-area-top) + 15px) 20px 15px 20px',
                borderBottom: '1px solid var(--glass-border)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                    <button onClick={onBack} style={{ color: 'var(--text-secondary)' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <div style={{ flex: 1 }}>
                        <h2 className="font-technical" style={{ fontSize: '1rem', fontWeight: 'bold' }}>{activity.name.toUpperCase()}</h2>
                        <span style={{ fontSize: '0.65rem', color: isLocked ? 'var(--accent-crimson)' : accentColor, fontWeight: 'bold' }}>
                            {isLocked ? 'FINALIZED' : 'RECORDING...'}
                        </span>
                    </div>
                    <div className="glass" style={{ padding: '5px 15px', borderRadius: '15px', border: `1px solid ${accentColor}44` }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: '900', color: accentColor }}>{selectedIds.size}</span>
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0 15px',
                    border: '1px solid var(--border-color)'
                }}>
                    <Search size={16} color="var(--text-muted)" />
                    <input
                        type="text"
                        placeholder={t('attendance.search_placeholder')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            flex: 1,
                            padding: '10px',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-primary)',
                            fontSize: '0.9rem'
                        }}
                    />
                </div>
            </div>

            <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filtered.map(p => {
                    const isSelected = selectedIds.has(p.id);
                    return (
                        <div
                            key={p.id}
                            className="glass touch-active"
                            style={{
                                padding: '12px 15px',
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px',
                                border: isSelected ? `1px solid ${accentColor}` : '1px solid var(--glass-border)',
                                backgroundColor: isSelected ? `${accentColor}11` : 'transparent',
                                opacity: isLocked && !isSelected ? 0.4 : 1
                            }}
                            onClick={() => togglePerson(p.id)}
                        >
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '18px',
                                backgroundColor: 'var(--bg-tertiary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Check size={18} color={isSelected ? accentColor : 'transparent'} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.9rem', fontWeight: 'bold', color: isSelected ? accentColor : 'var(--text-primary)' }}>{p.name}</p>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{t(`directory.${p.status.toLowerCase()}`)}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {!isLocked && (
                <div style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '15px 20px calc(var(--safe-area-bottom) + 15px) 20px',
                    backgroundColor: 'rgba(5, 5, 5, 0.9)',
                    backdropFilter: 'blur(20px)',
                    borderTop: '1px solid var(--glass-border)',
                    display: 'flex',
                    gap: '12px',
                    zIndex: 1000
                }}>
                    <button
                        className="touch-active"
                        onClick={() => handleSave(false)}
                        disabled={isSaving}
                        style={{
                            flex: 1,
                            padding: '16px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-color)',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.9rem'
                        }}
                    >
                        {t('attendance.save').toUpperCase()}
                    </button>
                    <button
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
                            flex: 1,
                            padding: '16px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: accentColor,
                            color: 'black',
                            fontWeight: 'bold',
                            fontSize: '0.9rem'
                        }}
                    >
                        {t('attendance.finalize').toUpperCase()}
                    </button>
                </div>
            )}
        </div>
    );
};

export default AttendanceModule;
