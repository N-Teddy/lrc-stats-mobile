import { readTextFile, writeTextFile, exists, BaseDirectory } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';
import { v4 as uuidv4 } from 'uuid';

const AUDIT_FILE = 'audit_logs.json';

interface UserIdentity {
    name: string;
    email: string;
    deviceId: string;
}

export interface AuditLogEntry {
    id: string;
    action: string;
    entityType: string;
    entityName: string;
    timestamp: string;
    userName: string;
    userEmail: string;
    deviceId: string;
    syncedAt?: string;
    [key: string]: any;
}

const getAuditPath = async (): Promise<string> => {
    return await join('db', AUDIT_FILE);
};

export const auditService = {
    getUserIdentity: (): UserIdentity | null => {
        const stored = localStorage.getItem('lrc_user_identity_mobile');
        return stored ? JSON.parse(stored) : null;
    },

    setUserIdentity: (name: string, email: string): UserIdentity => {
        const identity = { name, email, deviceId: auditService.getDeviceId() };
        localStorage.setItem('lrc_user_identity_mobile', JSON.stringify(identity));
        return identity;
    },

    getDeviceId: (): string => {
        let deviceId = localStorage.getItem('lrc_device_id_mobile');
        if (!deviceId) {
            deviceId = `MOB-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
            localStorage.setItem('lrc_device_id_mobile', deviceId);
        }
        return deviceId;
    },

    log: async (action: string, entityType: string, entityName: string, metadata: Record<string, any> = {}): Promise<AuditLogEntry | undefined> => {
        try {
            const identity = auditService.getUserIdentity();
            const logEntry: AuditLogEntry = {
                id: uuidv4(),
                action, // CREATE, UPDATE, DELETE, PDF_GEN, LOGIN
                entityType,
                entityName,
                timestamp: new Date().toISOString(),
                userName: identity?.name || 'Unknown',
                userEmail: identity?.email || 'Unknown',
                deviceId: auditService.getDeviceId(),
                ...metadata
            };

            // Save locally
            const path = await getAuditPath();
            let logs: AuditLogEntry[] = [];
            if (await exists(path, { baseDir: BaseDirectory.AppData })) {
                const content = await readTextFile(path, { baseDir: BaseDirectory.AppData });
                logs = JSON.parse(content);
            }

            logs.unshift(logEntry);

            // Keep only last 1000 logs locally
            if (logs.length > 1000) logs = logs.slice(0, 1000);

            await writeTextFile(path, JSON.stringify(logs, null, 2), { baseDir: BaseDirectory.AppData });

            return logEntry;
        } catch (err) {
            console.error('Audit Log Error:', err);
        }
    },

    getLogs: async (): Promise<AuditLogEntry[]> => {
        try {
            const path = await getAuditPath();
            if (await exists(path, { baseDir: BaseDirectory.AppData })) {
                const content = await readTextFile(path, { baseDir: BaseDirectory.AppData });
                return JSON.parse(content);
            }
            return [];
        } catch (err) {
            console.error('Error reading logs:', err);
            return [];
        }
    },

    saveLogs: async (logs: AuditLogEntry[]): Promise<void> => {
        try {
            const path = await getAuditPath();
            await writeTextFile(path, JSON.stringify(logs, null, 2), { baseDir: BaseDirectory.AppData });
        } catch (err) {
            console.error('Error saving logs:', err);
        }
    }
};
