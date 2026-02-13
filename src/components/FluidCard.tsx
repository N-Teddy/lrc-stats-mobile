import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface FluidCardProps {
    children: ReactNode;
    padding?: string;
    margin?: string;
    onClick?: () => void;
    accentColor?: string;
    delay?: number;
    className?: string;
    style?: React.CSSProperties;
}

const FluidCard: React.FC<FluidCardProps> = ({
    children,
    padding = '20px',
    margin = '0',
    onClick,
    accentColor,
    delay = 0,
    className = '',
    style = {}
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay, ease: [0.3, 1, 0.3, 1] }}
            onClick={onClick}
            className={`glass-v2 ${className}`}
            style={{
                padding,
                margin,
                borderRadius: 'var(--radius-lg)',
                position: 'relative',
                overflow: 'hidden',
                cursor: onClick ? 'pointer' : 'default',
                ...style
            }}
        >
            {accentColor && (
                <div style={{
                    position: 'absolute',
                    top: '-40%',
                    right: '-20%',
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${accentColor}22 0%, transparent 70%)`,
                    filter: 'blur(30px)',
                    zIndex: 0,
                    pointerEvents: 'none'
                }} />
            )}
            <div style={{ position: 'relative', zIndex: 1 }}>
                {children}
            </div>
        </motion.div>
    );
};

export default FluidCard;
