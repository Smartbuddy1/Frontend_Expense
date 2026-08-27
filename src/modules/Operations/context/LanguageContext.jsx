import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    dashboard: 'Dashboard',
    operations: 'Operations Dashboard',
    projects: 'Projects',
    createProject: 'Create Project',
    manageProjects: 'Create & Manage Projects',
    assignTeam: 'Site Supervisors',
    expenses: 'Approve Operational Expenses',
    cashadvance: 'Cash & Advance',
    reconciliation: 'Request Advance',
    progress: 'Progress Monitoring',
    alerts: 'Alerts',
    logout: 'Logout',
    allSites: 'All Sites',
    attendance: "Today's Attendance",
    supervisor: 'Supervisor',
    crew: 'Field Crew',
    status: 'Status',
    timeline: 'Timeline',
    actions: 'Actions',
    previous: 'Previous',
    next: 'Next',
    search: 'Search...',
    edit: 'Edit',
    delete: 'Delete',
    active: 'Active',
    completed: 'Completed',
    inProgress: 'In Progress',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language] = useState('en');

  useEffect(() => {
    localStorage.setItem('app_language', 'en');
  }, []);

  const toggleLanguage = () => {};

  const t = (key) => {
    return translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language: 'en', setLanguage: () => {}, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'en',
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: (key) => key
    };
  }
  return context;
};
