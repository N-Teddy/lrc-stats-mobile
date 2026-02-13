import React, { useState, useEffect } from 'react';
import { X, Bell, AlertTriangle, CheckCircle } from 'lucide-react';

interface Notification {
    id: number;
    title: string;
    body: string;
    type: 'info' | 'success' | 'error' | 'warning';
}

const NotificationOverlay: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        const handleNewNotification = (e: any) => {
            const { title, body, type = 'info' } = e.detail;
            const id = Date.now();

            setNotifications(prev => [...prev, { id, title, body, type }]);

            // Auto-remove after 10 seconds
            setTimeout(() => {
                removeNotification(id);
            }, 10000);
        };

        window.addEventListener('lrc-notify', handleNewNotification);
        return () => window.removeEventListener('lrc-notify', handleNewNotification);
    }, []);

    const removeNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const getTypeConfig = (type: string) => {
        switch (type) {
            case 'success':
                return { icon: <CheckCircle size={18} />, color: 'var(--accent-green)' };
            case 'error':
                return { icon: <AlertTriangle size={18} />, color: 'var(--accent-crimson)' };
            case 'warning':
                return { icon: <AlertTriangle size={18} />, color: '#ffaa00' };
            default:
                return { icon: <Bell size={18} />, color: 'var(--accent-primary)' };
        }
    };

    if (notifications.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 'calc(var(--safe-area-top) + 10px)',
            left: '10px',
            right: '10px',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            pointerEvents: 'none'
        }}>
            {notifications.map(n => {
                const config = getTypeConfig(n.type);
                return (
                    <div
                        key={n.id}
                        className="glass"
                        style={{
                            padding: '12px 16px',
                            borderRadius: 'var(--radius-lg)',
                            border: `1px solid ${config.color}33`,
                            display: 'flex',
                            gap: '12px',
                            animation: 'slideInDown 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                            pointerEvents: 'auto',
                            boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 10px ${config.color}11`,
                            position: 'relative',
                            overflow: 'hidden',
                            backgroundColor: 'rgba(10, 10, 10, 0.95)'
                        }}
                    >
                        {/* Animated Progress Bar */}
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            height: '2px',
                            backgroundColor: config.color,
                            animation: 'progress 10s linear forwards',
                            width: '100%'
                        }} />

                        <div style={{ color: config.color, display: 'flex', alignItems: 'center' }}>
                            {config.icon}
                        </div>

                        <div style={{ flex: 1 }}>
                            <h4 className="font-technical" style={{
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                marginBottom: '2px',
                                color: 'var(--text-primary)',
                                letterSpacing: '0.5px'
                            }}>
                                {n.title.toUpperCase()}
                            </h4>
                            <p style={{
                                fontSize: '0.7rem',
                                color: 'var(--text-secondary)',
                                lineHeight: '1.3'
                            }}>
                                {n.body}
                            </p>
                        </div>

                        <button
                            onClick={() => removeNotification(n.id)}
                            style={{
                                color: 'var(--text-muted)',
                                padding: '4px',
                                minWidth: '32px',
                                minHeight: '32px'
                            }}
                        >
                            <X size={14} />
                        </button>
                    </div>
                );
            })}

            <style>{`
                @keyframes slideInDown {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes progress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    );
};

export default NotificationOverlay;
