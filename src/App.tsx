import React, { useState, useEffect } from "react";
import BaseLayout from "./components/BaseLayout";
import Dashboard from "./modules/Dashboard";
import PeopleModule from "./modules/PeopleModule";
import PersonDetailModule from "./modules/PersonDetailModule";
import ActivitiesModule from "./modules/ActivitiesModule";
import AttendanceModule from "./modules/AttendanceModule";
import SettingsModule from "./modules/SettingsModule";
import { useTranslation } from "react-i18next";
import { notificationService } from "./store/notificationService";
import { dataService } from "./store/dataService";
import { syncService } from "./store/syncService";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [viewState, setViewState] = useState<{ type: 'list' | 'detail' | 'track' | 'analyze', id?: string, data?: any }>({ type: 'list' });
  const { t } = useTranslation();

  useEffect(() => {
    const initApp = async () => {
      // 1. Init Notifications
      const granted = await notificationService.init();
      if (granted) {
        const [people, activities, attendance] = await Promise.all([
          dataService.getPeople(),
          dataService.getActivities(),
          dataService.getAttendance()
        ]);
        notificationService.checkBirthdays(people);
        notificationService.checkUnlockedActivities(activities, attendance);
      }

      // 2. Auto-sync if configured
      const url = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('lrc_supabase_url');
      if (url) {
        try {
          await syncService.sync();
        } catch (err) {
          console.warn('Sync deferred:', err);
        }
      }
    };

    initApp();
  }, []);

  // Reset view state when switching tabs
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setViewState({ type: 'list' });
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "people":
        if (viewState.type === 'detail' && viewState.id) {
          return <PersonDetailModule personId={viewState.id} onBack={() => setViewState({ type: 'list' })} />;
        }
        return <PeopleModule onViewPerson={(id) => setViewState({ type: 'detail', id })} />;
      case "activities":
        if (viewState.type === 'track') {
          return <AttendanceModule activity={viewState.data} onBack={() => setViewState({ type: 'list' })} />;
        }
        return (
          <ActivitiesModule
            onTrackAttendance={(activity) => setViewState({ type: 'track', data: activity })}
            onAnalyzeActivity={(activity) => setViewState({ type: 'analyze', data: activity })}
          />
        );
      case "settings":
        return <SettingsModule />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <BaseLayout activeTab={activeTab} setActiveTab={handleTabChange}>
      {renderContent()}
    </BaseLayout>
  );
}

export default App;
