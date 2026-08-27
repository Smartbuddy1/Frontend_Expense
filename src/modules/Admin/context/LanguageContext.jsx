import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    dashboard: 'Dashboard',
    operations: 'Operations Dashboard',
    projects: 'Projects',
    createProject: 'Create Project',
    manageProjects: 'Create & Manage Projects',
    assignTeam: 'Assign Site Supervisors & Teams',
    expenses: 'Approve Operational Expenses',
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
  },
  mr: {
    dashboard: 'डॅशबोर्ड',
    operations: 'ऑपरेशन्स डॅशबोर्ड',
    projects: 'प्रोजेक्ट्स',
    createProject: 'नवीन प्रोजेक्ट',
    manageProjects: 'प्रोजेक्ट्स व्यवस्थापन',
    assignTeam: 'सुपरवायझर व टीम नेमणूक',
    expenses: 'खर्च मंजुरी',
    progress: 'कामाची प्रगती',
    alerts: 'सूचना व अलर्ट्स',
    logout: 'लॉगआउट',
    allSites: 'सर्व साईट्स',
    attendance: 'आजची हजेरी',
    supervisor: 'सुपरवायझर',
    crew: 'फील्ड कामगार',
    status: 'स्थिती',
    timeline: 'कालावधी',
    actions: 'कृती',
    previous: 'मागे',
    next: 'पुढे',
    search: 'शोधा...',
    edit: 'बदला',
    delete: 'काढून टाका',
    active: 'सक्रिय',
    completed: 'पूर्ण',
    inProgress: 'चालू काम',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    localStorage.setItem('app_language', 'en');
  }, []);

  const toggleLanguage = () => {};

  const t = (key) => {
    return translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language: 'en', setLanguage, toggleLanguage, t }}>
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
