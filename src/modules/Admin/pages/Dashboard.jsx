import React from 'react';

const Dashboard = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome to your new project dashboard.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Sample Stat Cards */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Users</h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">1,234</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Revenue</h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">$5,678</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Sessions</h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">42</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Bounce Rate</h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">12%</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm min-h-[400px] flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Main Content Area</p>
      </div>
    </div>
  );
};

export default Dashboard;
