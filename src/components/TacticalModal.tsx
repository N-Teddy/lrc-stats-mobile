import React, { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';

interface ModalData {
    title: string;
    body: string;
    confirmText: string;
    cancelText: string;
    resolve: (value: boolean) => void;
}

const TacticalModal: React.FC = () => {
    const [modal, setModal] = useState<ModalData | null>(null);

    useEffect(() => {
        const handleConfirm = (e: any) => {
            setModal(e.detail);
        };

        window.addEventListener('lrc-confirm', handleConfirm);
        return () => window.removeEventListener('lrc-confirm', handleConfirm);
    }, []);

    if (!modal) return null;

    const handleAction = (choice: boolean) => {
        modal.resolve(choice);
        setModal(null);
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
            zIndex: 11000,
            padding: '24px'
        }}>
            <div className="glass" style={{
                width: '100%',
                maxWidth: '400px',
                padding: '30px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--glass-border)',
                boxShadow: '0 24px 48px rgba(0,0,0,0.6)',
                textAlign: 'center',
                animation: 'modalPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}>
                <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
                    <div style={{
                        padding: '18px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(var(--accent-primary-rgb), 0.1)',
                        color: 'var(--accent-primary)'
                    }}>
                        <ShieldAlert size={36} />
                    </div>
                </div>

                <h3 className="font-technical" style={{
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    marginBottom: '12px',
                    color: 'var(--text-primary)',
                    letterSpacing: '0.5px'
                }}>
                    {modal.title.toUpperCase()}
                </h3>

                <p style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '32px',
                    lineHeight: '1.6'
                }}>
                    {modal.body}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                        className="touch-active"
                        onClick={() => handleAction(true)}
                        style={{
                            padding: '16px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'white',
                            color: 'black',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            boxShadow: '0 4px 15px rgba(255, 255, 255, 0.1)'
                        }}
                    >
                        {modal.confirmText.toUpperCase()}
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
                        {modal.cancelText.toUpperCase()}
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

export default TacticalModal;
