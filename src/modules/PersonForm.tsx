import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Camera } from 'lucide-react';
import { dataService, Person, createPersonModel, PERSON_STATUS_TYPES } from '../store/dataService';
import { notificationService } from '../store/notificationService';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../store/ThemeContext';

interface PersonFormProps {
    personId?: string;
    onBack: () => void;
    onSave: () => void;
}

const PersonForm: React.FC<PersonFormProps> = ({ personId, onBack, onSave }) => {
    const { t } = useTranslation();
    const { accentColor } = useTheme();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Person>(createPersonModel());

    useEffect(() => {
        if (personId) {
            loadPerson();
        }
    }, [personId]);

    const loadPerson = async () => {
        const people = await dataService.getPeople();
        const person = people.find(p => p.id === personId);
        if (person) {
            setFormData(person);
        }
    };

    const handleInputChange = (field: keyof Person, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
            updatedAt: new Date().toISOString()
        }));
    };

    const handleArchive = async () => {
        const confirmed = await notificationService.confirm(
            t('directory.archive_person'),
            t('directory.archive_confirm')
        );

        if (!confirmed) return;

        setLoading(true);
        try {
            const people = await dataService.getPeople();
            const newPeople = people.map(p =>
                p.id === personId ? { ...p, isArchived: true, updatedAt: new Date().toISOString() } : p
            );

            await dataService.savePeople(newPeople, {
                action: 'ARCHIVE',
                name: formData.name
            });

            notificationService.notify(t('common.success'), 'Personnel archived', 'success');
            onSave();
        } catch (err) {
            notificationService.notify(t('common.error'), 'Failed to archive', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            notificationService.notify(t('common.error'), 'Name is required', 'error');
            return;
        }

        setLoading(true);
        try {
            const people = await dataService.getPeople();
            let newPeople: Person[];

            if (personId) {
                newPeople = people.map(p => p.id === personId ? formData : p);
            } else {
                newPeople = [...people, formData];
            }

            const result = await dataService.savePeople(newPeople, {
                action: personId ? 'UPDATE' : 'CREATE',
                name: formData.name
            });

            if (result.success) {
                notificationService.notify(
                    t('common.success'),
                    personId ? 'Personnel updated successfully' : 'Personnel added successfully',
                    'success'
                );
                onSave();
            } else {
                notificationService.notify(t('common.error'), result.error || 'Failed to save', 'error');
            }
        } catch (err) {
            console.error(err);
            notificationService.notify(t('common.error'), 'An unexpected error occurred', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-in" style={{ paddingBottom: '40px' }}>
            {/* Header */}
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                backgroundColor: 'rgba(5, 5, 5, 0.8)',
                backdropFilter: 'blur(20px)',
                padding: 'calc(var(--safe-area-top) + 15px) 20px 15px 20px',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
            }}>
                <button onClick={onBack} style={{ color: 'var(--text-secondary)' }}>
                    <ArrowLeft size={22} />
                </button>
                <h2 className="font-technical" style={{ fontSize: '1.1rem', fontWeight: 'bold', flex: 1 }}>
                    {personId ? t('directory.edit_person').toUpperCase() : t('directory.add_person').toUpperCase()}
                </h2>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                        color: accentColor,
                        fontWeight: 'bold',
                        opacity: loading ? 0.5 : 1,
                        fontSize: '0.9rem'
                    }}
                >
                    {t('common.save').toUpperCase()}
                </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Photo Section */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: 'var(--radius-lg)',
                            backgroundColor: 'var(--bg-tertiary)',
                            border: '1px solid var(--glass-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                        }}>
                            {formData.image ? (
                                <img src={formData.image} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <Camera size={32} color="var(--text-muted)" />
                            )}
                        </div>
                        <button style={{
                            position: 'absolute',
                            bottom: '-10px',
                            right: '-10px',
                            width: '36px',
                            height: '36px',
                            borderRadius: '18px',
                            backgroundColor: accentColor,
                            color: 'black',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '4px solid var(--bg-primary)'
                        }}>
                            <Camera size={16} />
                        </button>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                    <div style={{ padding: '15px', borderBottom: '1px solid var(--glass-border)' }}>
                        <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '5px', fontWeight: 'bold' }}>FULL NAME</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Ente name..."
                            style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none' }}
                        />
                    </div>
                    <div style={{ padding: '15px', borderBottom: '1px solid var(--glass-border)' }}>
                        <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '5px', fontWeight: 'bold' }}>PHONE NUMBER</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="+237 ..."
                            style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none' }}
                        />
                    </div>
                </div>

                <div className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                    <div style={{ padding: '15px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '5px', fontWeight: 'bold' }}>STATUS</label>
                            <span style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{formData.status}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            {PERSON_STATUS_TYPES.map(status => (
                                <button
                                    key={status}
                                    onClick={() => handleInputChange('status', status)}
                                    style={{
                                        padding: '5px 12px',
                                        borderRadius: '15px',
                                        fontSize: '0.7rem',
                                        fontWeight: 'bold',
                                        backgroundColor: formData.status === status ? accentColor : 'rgba(255,255,255,0.05)',
                                        color: formData.status === status ? 'black' : 'var(--text-secondary)',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {status.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '5px', fontWeight: 'bold' }}>JRs AFFILIATION</label>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Member of JRs group</span>
                        </div>
                        <button
                            onClick={() => handleInputChange('isJRs', !formData.isJRs)}
                            style={{
                                width: '50px',
                                height: '26px',
                                backgroundColor: formData.isJRs ? 'var(--accent-green)' : 'rgba(255,255,255,0.1)',
                                borderRadius: '13px',
                                position: 'relative',
                                transition: 'background-color 0.3s'
                            }}
                        >
                            <div style={{
                                width: '20px',
                                height: '20px',
                                backgroundColor: 'white',
                                borderRadius: '10px',
                                position: 'absolute',
                                top: '3px',
                                left: formData.isJRs ? '27px' : '3px',
                                transition: 'left 0.3s'
                            }} />
                        </button>
                    </div>
                </div>

                <div className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                    <div style={{ padding: '15px', borderBottom: '1px solid var(--glass-border)' }}>
                        <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '5px', fontWeight: 'bold' }}>DATE OF BIRTH</label>
                        <input
                            type="date"
                            value={formData.dob}
                            onChange={(e) => handleInputChange('dob', e.target.value)}
                            style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none' }}
                        />
                    </div>
                    <div style={{ padding: '15px' }}>
                        <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '5px', fontWeight: 'bold' }}>INTEGRATION DATE</label>
                        <input
                            type="date"
                            value={formData.dateIntegration}
                            onChange={(e) => handleInputChange('dateIntegration', e.target.value)}
                            style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none' }}
                        />
                    </div>
                </div>

                {personId && (
                    <button
                        className="touch-active"
                        onClick={handleArchive}
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '16px',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--accent-crimson)',
                            backgroundColor: 'rgba(255, 77, 77, 0.05)',
                            color: 'var(--accent-crimson)',
                            fontWeight: 'bold',
                            fontSize: '0.85rem',
                            marginTop: '10px'
                        }}
                    >
                        {t('directory.archive_person').toUpperCase()}
                    </button>
                )}
            </div>

            {/* Sticky Actions */}
            <div style={{
                position: 'fixed',
                bottom: 'calc(var(--safe-area-bottom) + 20px)',
                left: '20px',
                right: '20px',
                zIndex: 100
            }}>
                <button
                    className="touch-active"
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '18px',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: accentColor,
                        color: 'black',
                        fontWeight: '900',
                        fontSize: '1rem',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px'
                    }}
                >
                    {loading ? 'SAVING...' : (
                        <>
                            <Save size={20} />
                            {personId ? 'UPDATE PROFILE' : 'CREATE PROFILE'}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default PersonForm;
