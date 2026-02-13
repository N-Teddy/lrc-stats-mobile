import { writeTextFile, exists, mkdir, remove, BaseDirectory } from '@tauri-apps/plugin-fs';
import { v4 as uuidv4 } from 'uuid';
import { Person, Activity, AttendanceRecord } from './dataService';

/**
 * Dev Service for internal seeding and sandbox management - Mobile Edition
 */

const firstNames = ["Jean-Paul", "Marie", "Thomas", "Sarah", "Lucas", "Sophie", "Alain", "Emilie", "David", "Laura", "Marc", "Camille", "Nicolas", "Julie", "Eric", "Fatou", "Ahmed", "Lucie", "Pierre", "Monique"];
const lastNames = ["Kamga", "Ngo Bakot", "Ebakisse", "Douala", "Muller", "Perrin", "Morin", "Rousseau", "Fontaine", "Guerin", "Dupont", "Durand", "Lefebvre", "Moreau", "Petit", "Roux", "Bernard", "Richard", "Garnier", "Faure"];
const activityTypes = ['REUNION MENSUELLE', 'CONFERENCE', 'SERVICE JRS', 'ACTIVITE LUDIQUE', 'JPO', 'AUTRES'];

export const devService = {
    isSandbox: (): boolean => {
        return localStorage.getItem('lrc_operation_mode_mobile') === 'SANDBOX';
    },

    setMode: (mode: 'SANDBOX' | 'PRODUCTION'): void => {
        localStorage.setItem('lrc_operation_mode_mobile', mode);
    },

    generateSeed: async (): Promise<boolean> => {
        console.log('[DEV] Initializing Tactical Mobile Sandbox Seed...');

        const peopleCount = 120;
        let pillars: string[] = [];
        let atRisk: string[] = [];
        let regulars: string[] = [];
        let newRecruits: string[] = [];

        // 1. Generate People
        const people: Person[] = [];
        for (let i = 0; i < peopleCount; i++) {
            const id = uuidv4();
            const firstName = firstNames[i % firstNames.length];
            const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
            const name = `${firstName} ${lastName}${i > 40 ? ' (' + i + ')' : ''}`;

            const isMembre = i < (peopleCount * 0.75);
            const isJRs = Math.random() > 0.7;
            const isArchived = i >= 110 && i < 115;
            const isDeleted = i >= 115;

            people.push({
                id,
                name: name.trim(),
                phone: i < (peopleCount * 0.9) ? `+237 6${Math.floor(Math.random() * 90000000 + 10000000)}` : '',
                status: isMembre ? 'Membre' : 'Eleve',
                dob: `${1970 + (i % 35)}-01-01`,
                dateIntegration: i < 90 ? '2023-01-01' : '2025-11-15',
                dateDeparture: '',
                isJRs,
                image: '',
                isArchived,
                isDeleted,
                deletedAt: isDeleted ? new Date().toISOString() : null,
                updatedAt: new Date().toISOString()
            });

            if (!isArchived && !isDeleted) {
                if (i < 40) pillars.push(id);
                else if (i < 55) atRisk.push(id);
                else if (i < 90) regulars.push(id);
                else newRecruits.push(id);
            }
        }

        // 2. Generate Activities (18/year, 2023-2026)
        const activities: any[] = [];
        const years = [2023, 2024, 2025, 2026];
        const today = new Date();

        years.forEach(year => {
            for (let i = 1; i <= 18; i++) {
                const id = uuidv4();
                const month = Math.ceil(i / 1.5);
                const day = (i % 2 === 0) ? 10 : 25;
                const dateStr = `${year}-${String(Math.min(month, 12)).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                activities.push({
                    id,
                    name: `${activityTypes[i % activityTypes.length]} ${year} #${i}`,
                    type: activityTypes[i % activityTypes.length],
                    date: dateStr,
                    isDeleted: false,
                    notes: '',
                    updatedAt: new Date().toISOString(),
                    _isFuture: new Date(dateStr) > today,
                    _isOverdue: new Date(dateStr) < today && new Date(dateStr) > new Date(today.getTime() - (30 * 86400000)) && i > 15 && year === 2026
                });
            }
        });

        // 3. Generate Attendance
        const attendance: AttendanceRecord[] = activities.filter(act => !act._isFuture).map(act => {
            let attendeeIds: string[] = [];
            pillars.forEach(p => { if (Math.random() < 0.95) attendeeIds.push(p); });
            regulars.forEach(p => { if (Math.random() < 0.6) attendeeIds.push(p); });
            if (new Date(act.date).getFullYear() >= 2025) {
                newRecruits.forEach(p => { if (Math.random() < 0.7) attendeeIds.push(p); });
            }
            if (new Date(act.date) < new Date('2025-08-01')) {
                atRisk.forEach(p => { if (Math.random() < 0.8) attendeeIds.push(p); });
            }

            return {
                id: uuidv4(),
                activityId: act.id,
                activityName: act.name,
                date: act.date,
                personIds: attendeeIds,
                count: attendeeIds.length,
                isLocked: !act._isOverdue,
                updatedAt: new Date().toISOString()
            };
        });

        // 4. Persistence
        const dbDirExists = await exists('db', { baseDir: BaseDirectory.AppData });
        if (!dbDirExists) {
            await mkdir('db', { baseDir: BaseDirectory.AppData, recursive: true });
        }

        await writeTextFile('db/people.json', JSON.stringify(people, null, 2), { baseDir: BaseDirectory.AppData });
        await writeTextFile('db/activities.json', JSON.stringify(activities.map(({ _isFuture, _isOverdue, ...rest }) => rest), null, 2), { baseDir: BaseDirectory.AppData });
        await writeTextFile('db/attendance.json', JSON.stringify(attendance, null, 2), { baseDir: BaseDirectory.AppData });

        // Seed some audit logs
        const logs = [
            { id: uuidv4(), action: 'LOGIN', entityType: 'SYSTEM', entityName: 'Mobile Sandbox Session Started', timestamp: new Date().toISOString(), userName: 'Explorer', deviceId: 'MOB-SANDBOX-01' },
            { id: uuidv4(), action: 'CREATE', entityType: 'PERSON', entityName: 'Mobile Pioneer Unit', timestamp: new Date().toISOString(), userName: 'Explorer', deviceId: 'MOB-SANDBOX-01' }
        ];
        await writeTextFile('db/audit_logs.json', JSON.stringify(logs, null, 2), { baseDir: BaseDirectory.AppData });

        return true;
    },

    clearData: async (): Promise<boolean> => {
        try {
            if (await exists('db', { baseDir: BaseDirectory.AppData })) {
                await remove('db', { baseDir: BaseDirectory.AppData, recursive: true });
            }
            return true;
        } catch (err) {
            console.error('Clear Data Error:', err);
            return false;
        }
    }
};
