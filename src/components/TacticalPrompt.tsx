import React, { useState, useEffect, useRef } from 'react';
import { Key } from 'lucide-react';

interface PromptData {
    title: string;
    body: string;
    placeholder: string;
    defaultValue: string;
    inputType: string;
    resolve: (value: string | null) => void;
}

const TacticalPrompt: React.FC = () => {
    const [modal, setModal] = useState<PromptData | null>(null);
    const [value, setValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handlePrompt = (e: any) => {
            setModal(e.detail);
            setValue(e.detail.defaultValue || '');
        };

        window.addEventListener('lrc-prompt', handlePrompt);
        return () => window.removeEventListener('lrc-prompt', handlePrompt);
    }, []);

    useEffect(() => {
        if (modal && inputRef.current) {
            inputRef.current.focus();
        }
    }, [modal]);

    if (!modal) return null;

    const handleAction = (choice: boolean) => {
        if (choice) {
            modal.resolve(value);
        } else {
            modal.resolve(null);
        }
        setModal(null);
        setValue('');
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 11001,
            padding: '24px'
        }}>
            <div className="glass" style={{
                width: '100%',
                maxWidth: '400px',
                padding: '30px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--glass-border)',
                boxShadow: '0 24px 48px rgba(0,0,0,0.6)',
                animation: 'modalPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}>
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                    <div style={{
                        padding: '16px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(var(--accent-primary-rgb), 0.1)',
                        color: 'var(--accent-primary)'
                    }}>
                        <Key size={32} />
                    </div>
                </div>

                <h3 className="font-technical" style={{
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    marginBottom: '10px',
                    color: 'var(--text-primary)',
                    textAlign: 'center'
                }}>
                    {modal.title.toUpperCase()}
                </h3>

                <p style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '24px',
                    lineHeight: '1.5',
                    textAlign: 'center'
                }}>
                    {modal.body}
                </p>

                <div style={{ marginBottom: '32px' }}>
                    <input
                        ref={inputRef}
                        type={modal.inputType || 'text'}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={modal.placeholder}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAction(true);
                            if (e.key === 'Escape') handleAction(false);
                        }}
                        style={{
                            width: '100%',
                            padding: '16px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            fontSize: '1rem',
                            outline: 'none',
                            textAlign: 'center'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                        className="touch-active"
                        onClick={() => handleAction(true)}
                        style={{
                            padding: '16px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--accent-primary)',
                            color: 'black',
                            fontWeight: 'bold',
                            fontSize: '0.9rem'
                        }}
                    >
                        CONFIRM
                    </button>
                    <button
                        className="touch-active"
                        onClick={() => handleAction(false)}
                        style={{
                            padding: '14px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            fontWeight: 'bold',
                            fontSize: '0.85rem'
                        }}
                    >
                        CANCEL
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes modalPop {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default TacticalPrompt;
