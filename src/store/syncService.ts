import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { dataService } from './dataService';
import { auditService } from './auditService';

/**
 * Cloud Sync Service for Supabase Integration
 */

export class SyncService {
    private supabase: SupabaseClient | null = null;

    constructor() {
        this.init();
    }

    private init() {
        const url = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('lrc_supabase_url');
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('lrc_supabase_key');

        if (url && key) {
            this.supabase = createClient(url, key);
        }
    }

    async testConnection(url: string, key: string): Promise<boolean> {
        try {
            const client = createClient(url, key);
            const { error } = await client.from('people').select('id').limit(1);
            return !error;
        } catch {
            return false;
        }
    }

    async sync(): Promise<boolean> {
        if (!this.supabase) this.init();
        if (!this.supabase) return false;

        try {
            await Promise.all([
                this.syncTable('people', dataService.getPeople, dataService.savePeople),
                this.syncTable('activities', dataService.getActivities, dataService.saveActivities),
                this.syncTable('attendance', dataService.getAttendance, dataService.saveAttendance),
                this.syncAuditLogs()
            ]);
            return true;
        } catch (err) {
            console.error('Sync error:', err);
            throw err;
        }
    }

    private async syncTable(
        tableName: string,
        getter: () => Promise<any[]>,
        saver: (data: any[]) => Promise<any>
    ) {
        if (!this.supabase) return;

        const localData = await getter();

        // A. PULL: Get everything newer than our local data
        const maxLocalUpdated = localData.length > 0
            ? new Date(Math.max(...localData.map(d => new Date(d.updatedAt || 0).getTime())))
            : new Date(0);

        const { data: cloudData, error: pullError } = await this.supabase
            .from(tableName)
            .select('*')
            .gt('updated_at', maxLocalUpdated.toISOString());

        if (pullError) throw pullError;

        // Merge logic
        let mergedData = [...localData];
        let hasChanges = false;

        if (cloudData && cloudData.length > 0) {
            cloudData.forEach(cloudItem => {
                const localIndex = mergedData.findIndex(d => d.id === cloudItem.id);
                const formattedItem = this.toCamelCase(cloudItem);

                if (localIndex === -1) {
                    mergedData.push(formattedItem);
                    hasChanges = true;
                } else {
                    const localUpdated = new Date(mergedData[localIndex].updatedAt || 0);
                    const cloudUpdated = new Date(formattedItem.updatedAt || 0);

                    if (cloudUpdated > localUpdated) {
                        mergedData[localIndex] = formattedItem;
                        hasChanges = true;
                    }
                }
            });
        }

        // B. PUSH: Get local items that are newer than cloud
        const localToPush = localData.filter(d => !d.syncedAt || new Date(d.updatedAt) > new Date(d.syncedAt));

        if (localToPush.length > 0) {
            const cloudPayload = localToPush.map(d => ({
                ...this.toSnakeCase(d),
                synced_at: new Date().toISOString()
            }));

            const { error: pushError } = await this.supabase
                .from(tableName)
                .upsert(cloudPayload);

            if (pushError) throw pushError;

            // Mark as synced locally
            mergedData = mergedData.map(d => {
                const isPushed = localToPush.find(lp => lp.id === d.id);
                if (isPushed) {
                    return { ...d, syncedAt: new Date().toISOString() };
                }
                return d;
            });
            hasChanges = true;
        }

        if (hasChanges) {
            await saver(mergedData);
        }
    }

    private async syncAuditLogs() {
        if (!this.supabase) return;

        const logs = await auditService.getLogs();
        const logsToPush = logs.filter(l => !l.syncedAt);

        if (logsToPush.length > 0) {
            const payload = logsToPush.map(l => ({
                ...this.toSnakeCase(l),
                synced_at: new Date().toISOString()
            }));

            const { error } = await this.supabase
                .from('audit_logs')
                .upsert(payload);

            if (!error) {
                const updatedLogs = logs.map(l => {
                    if (logsToPush.find(lp => lp.id === l.id)) {
                        return { ...l, syncedAt: new Date().toISOString() };
                    }
                    return l;
                });
                await auditService.saveLogs(updatedLogs);
            }
        }
    }

    private toSnakeCase(obj: any): any {
        const snake: any = {};
        for (const key in obj) {
            const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            snake[snakeKey] = obj[key];
        }
        return snake;
    }

    private toCamelCase(obj: any): any {
        const camel: any = {};
        for (const key in obj) {
            const camelKey = key.replace(/([-_][a-z])/ig, ($1) => $1.toUpperCase().replace('-', '').replace('_', ''));
            camel[camelKey] = obj[key];
        }
        return camel;
    }
}

export const syncService = new SyncService();
