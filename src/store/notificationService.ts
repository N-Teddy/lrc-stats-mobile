import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';
import { Person, Activity, AttendanceRecord } from './dataService';

/**
 * Service for handling in-app tactical notifications and confirmations - Mobile Edition
 */
export const notificationService = {
    /**
     * Sends an in-app tactical notification
     */
    notify: (title: string, body: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
        const event = new CustomEvent('lrc-notify', {
            detail: { title, body, type }
        });
        window.dispatchEvent(event);
    },

    /**
     * Triggers a tactical confirmation modal
     * Returns a Promise that resolves to true (Confirm) or false (Cancel)
     */
    confirm: (title: string, body: string, confirmText = 'Confirm', cancelText = 'Cancel'): Promise<boolean> => {
        return new Promise((resolve) => {
            const event = new CustomEvent('lrc-confirm', {
                detail: { title, body, confirmText, cancelText, resolve }
            });
            window.dispatchEvent(event);
        });
    },

    /**
     * Triggers a tactical input prompt modal
     * Returns a Promise that resolves to the input value (string) or null (Cancel)
     */
    prompt: (title: string, body: string, placeholder = '', defaultValue = '', inputType = 'text'): Promise<string | null> => {
        return new Promise((resolve) => {
            const event = new CustomEvent('lrc-prompt', {
                detail: { title, body, placeholder, defaultValue, inputType, resolve }
            });
            window.dispatchEvent(event);
        });
    },

    /**
     * Initialization: Request native notification permissions
     */
    init: async (): Promise<boolean> => {
        try {
            let permission = await isPermissionGranted();
            if (!permission) {
                const response = await requestPermission();
                permission = response === 'granted';
            }
            return permission;
        } catch (err) {
            console.error('Notification Init Error:', err);
            return false;
        }
    },

    /**
     * Sends a native system notification
     */
    sendNative: async (title: string, body: string) => {
        const permission = await isPermissionGranted();
        if (permission) {
            sendNotification({ title, body });
        }
    },

    /**
     * Checks for birthdays today and notifies if any
     */
    checkBirthdays: async (people: Person[]) => {
        const today = new Date();
        const todayMonth = today.getMonth();
        const todayDate = today.getDate();

        const birthdayPeeps = people.filter(p => {
            if (!p.dob) return false;
            const dob = new Date(p.dob);
            return dob.getMonth() === todayMonth && dob.getDate() === todayDate;
        });

        if (birthdayPeeps.length > 0) {
            const names = birthdayPeeps.map(p => p.name).join(', ');
            const title = '🎂 Birthday Celebration!';
            const body = `Today is the birthday of: ${names}. Don't forget to celebrate!`;

            notificationService.notify(title, body);
            notificationService.sendNative(title, body);
        }
    },

    /**
     * Checks for unlocked past activities and notifies
     */
    checkUnlockedActivities: async (activities: Activity[], attendance: AttendanceRecord[]) => {
        const today = new Date();
        const pending = activities.filter(a => {
            if (a.isDeleted) return false;
            const actDate = new Date(a.date);
            const isPast = actDate < today;
            const isLocked = attendance.some(att => att.activityId === a.id && att.isLocked);
            return isPast && !isLocked;
        });

        if (pending.length > 0) {
            const title = '🔒 Attendance Audit Required';
            const body = `There are ${pending.length} past ${pending.length === 1 ? 'activity' : 'activities'} with unlocked attendance. Please finalize them.`;

            notificationService.notify(title, body);
            notificationService.sendNative(title, body);
        }
    }
};
