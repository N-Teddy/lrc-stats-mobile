import { dataService, Person } from './dataService';

/**
 * Intelligence Service for Personnel Vitality and Community Insights
 */

export interface VitalityRanking {
    person: Person;
    attendanceCount: number;
    score: number;
    forecast: 'Drop Risk' | 'Growing' | 'Stable';
}

export const intelligenceService = {
    /**
     * Calculates vitality rankings based on weighted recent attendance.
     * Members who missed the last 3 sessions are flagged as high risk.
     */
    getVitalityRankings: async (): Promise<VitalityRanking[]> => {
        try {
            const [people, activities, attendance] = await Promise.all([
                dataService.getPeople(),
                dataService.getActivities(),
                dataService.getAttendance()
            ]);

            const activePeople = people.filter(p => !p.isArchived && !p.isDeleted);

            // Get last 10 activities to calculate a "Pulse"
            const recentActivities = activities
                .filter(a => !a.isDeleted && new Date(a.date) <= new Date())
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 10);

            const recentActivityIds = recentActivities.map(a => a.id);

            const rankings: VitalityRanking[] = activePeople.map(person => {
                const personAttendance = attendance.filter(r => r.personIds?.includes(person.id));
                const recentPresentCount = personAttendance.filter(r => recentActivityIds.includes(r.activityId)).length;

                // AI-Lite Forecasting: Compare last 3 sessions vs previous 3 sessions
                const latestThree = recentActivityIds.slice(0, 3);
                const previousThree = recentActivityIds.slice(3, 6);

                let forecastStatus: 'Drop Risk' | 'Growing' | 'Stable' = 'Stable';
                if (latestThree.length > 0 && previousThree.length > 0) {
                    const latestCount = attendance.filter(r => latestThree.includes(r.activityId) && r.personIds?.includes(person.id)).length;
                    const previousCount = attendance.filter(r => previousThree.includes(r.activityId) && r.personIds?.includes(person.id)).length;

                    if (latestCount === 0 && previousCount > 0) forecastStatus = 'Drop Risk';
                    else if (latestCount > previousCount) forecastStatus = 'Growing';
                    else if (latestCount < previousCount && latestCount > 0) forecastStatus = 'Drop Risk';
                }

                return {
                    person,
                    attendanceCount: personAttendance.length,
                    score: recentPresentCount / (recentActivities.length || 1),
                    forecast: forecastStatus
                };
            });

            return rankings.sort((a, b) => b.score - a.score);
        } catch (err) {
            console.error('Intelligence Error:', err);
            return [];
        }
    },

    /**
     * Identifies members who missed the last N gatherings.
     */
    getAtRiskMembers: async (consecutiveMisses = 3): Promise<Person[]> => {
        try {
            const [people, activities, attendance] = await Promise.all([
                dataService.getPeople(),
                dataService.getActivities(),
                dataService.getAttendance()
            ]);

            const recentActivities = activities
                .filter(a => !a.isDeleted && new Date(a.date) <= new Date())
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, consecutiveMisses);

            if (recentActivities.length < consecutiveMisses) return [];

            const recentActivityIds = recentActivities.map(a => a.id);

            const atRisk = people.filter(p => !p.isArchived && !p.isDeleted).filter(person => {
                const personAttendance = attendance.filter(r =>
                    recentActivityIds.includes(r.activityId) && r.personIds?.includes(person.id)
                );
                return personAttendance.length === 0;
            });

            return atRisk;
        } catch (err) {
            console.error('At Risk Error:', err);
            return [];
        }
    }
};
