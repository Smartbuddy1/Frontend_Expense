import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, IndianRupee, TrendingUp, LayoutDashboard, 
  Plus, CheckCircle2, XCircle, Sparkles, RefreshCw, AlertCircle 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import { 
  initialProjects, 
  initialSupervisors, 
  initialTeamMembers, 
  initialExpenses, 
  initialSiteLogs 
} from '../data/operationsData';

import OperationsOverview from '../components/operations/OperationsOverview';
import ProjectsTab from '../components/operations/ProjectsTab';
import TeamAssignmentTab from '../components/operations/TeamAssignmentTab';
import ExpensesTab from '../components/operations/ExpensesTab';
import ProgressMonitoringTab from '../components/operations/ProgressMonitoringTab';
import AlertsTab from '../components/operations/AlertsTab';
import ReconciliationTab from '../components/operations/ReconciliationTab';

// Modals
import CreateProjectModal from '../components/operations/modals/CreateProjectModal';
import AssignTeamModal from '../components/operations/modals/AssignTeamModal';
import { useSearchParams } from 'react-router-dom';
import ExpenseApprovalModal from '../components/operations/modals/ExpenseApprovalModal';
import SubmitExpenseModal from '../components/operations/modals/SubmitExpenseModal';
import UpdateProgressModal from '../components/operations/modals/UpdateProgressModal';
import ProjectDetailModal from '../components/operations/modals/ProjectDetailModal';
import CreateSupervisorModal from '../components/operations/modals/CreateSupervisorModal';

const OperationsDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');

  // Navigation active tab
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'overview');

  // Sync tab state whenever URL search params change (e.g. clicking sidebar links or browser back/forward)
  useEffect(() => {
    const currentTab = tabFromUrl || 'overview';
    setActiveTab(currentTab);
  }, [tabFromUrl]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Persistent State (ASEMS Operations Data - Projects Roster)
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('asems_v2_projects');
    return saved ? JSON.parse(saved) : initialProjects;
  });

  const [supervisors, setSupervisors] = useState(() => {
    const saved = localStorage.getItem('asems_v2_supervisors');
    const list = saved ? JSON.parse(saved) : initialSupervisors;
    return list.map(sup => {
      let p = (sup.phone || '').trim();
      if (!p || p.length < 8 || p === '98' || p === '+91 98') {
        const nameLower = (sup.name || '').toLowerCase();
        if (nameLower.includes('rohit')) p = '+91 98220 11223';
        else if (nameLower.includes('amit')) p = '+91 98230 45678';
        else if (nameLower.includes('sagar')) p = '+91 94220 88990';
        else p = '+91 98220 55443';
      }
      return { ...sup, phone: p };
    });
  });

  const [teamMembers, setTeamMembers] = useState(() => {
    const saved = localStorage.getItem('asems_v2_team');
    return saved ? JSON.parse(saved) : initialTeamMembers;
  });

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('asems_v2_expenses');
    const list = saved ? JSON.parse(saved) : initialExpenses;
    return list.filter(e => e.id !== 'EXP-SGM-004').map(e => {
      const d = (e.description || e.title || '').toLowerCase();
      let desc = e.description;
      if (d.includes('cement') || d.includes('pvc') || d.includes('pipe') || d.includes('foundation') || d.includes('bags')) {
        desc = 'Cement & Pipes';
      } else if (d.includes('tempo') || d.includes('freight') || d.includes('swargate') || d.includes('travel') || d.includes('transport')) {
        desc = 'Tempo / Transport';
      } else if (d.includes('excavation') || d.includes('labor') || d.includes('helper') || d.includes('wages') || d.includes('workers')) {
        desc = 'Labor Wages';
      }
      return { ...e, description: desc };
    });
  });

  const [siteLogs, setSiteLogs] = useState(() => {
    const saved = localStorage.getItem('asems_v2_sitelogs');
    return saved ? JSON.parse(saved) : initialSiteLogs;
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('asems_v2_projects', JSON.stringify(projects));
    } catch (e) {
      console.error(e);
    }
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('asems_v2_supervisors', JSON.stringify(supervisors));
  }, [supervisors]);

  useEffect(() => {
    localStorage.setItem('asems_v2_team', JSON.stringify(teamMembers));
  }, [teamMembers]);

  useEffect(() => {
    localStorage.setItem('asems_v2_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('asems_v2_sitelogs', JSON.stringify(siteLogs));
  }, [siteLogs]);

  // Modal States
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [isAssignTeamOpen, setIsAssignTeamOpen] = useState(false);
  const [targetProjectForTeam, setTargetProjectForTeam] = useState(null);

  const [isExpenseApprovalOpen, setIsExpenseApprovalOpen] = useState(false);
  const [inspectingExpense, setInspectingExpense] = useState(null);

  const [isSubmitExpenseOpen, setIsSubmitExpenseOpen] = useState(false);

  const [isUpdateProgressOpen, setIsUpdateProgressOpen] = useState(false);
  const [targetProjectForProgress, setTargetProjectForProgress] = useState(null);

  const [isProjectDetailOpen, setIsProjectDetailOpen] = useState(false);
  const [selectedProjectDetail, setSelectedProjectDetail] = useState(null);

  const [isCreateSupervisorOpen, setIsCreateSupervisorOpen] = useState(false);
  const [editingSupervisor, setEditingSupervisor] = useState(null);

  // Handlers
  const handleSaveSupervisor = (supData) => {
    const isEdit = Boolean(supData.id && supervisors.some(s => s.id === supData.id));
    const newId = supData.id || `sup-${Date.now()}`;
    const fullName = supData.name || [supData.firstName, supData.surname].filter(Boolean).join(' ').trim() || 'Supervisor';

    const supervisorObj = {
      id: newId,
      name: fullName,
      phone: supData.phone || '+91 98000 00000',
      email: supData.email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@aaryainnovtech.com`,
      specialization: supData.specialization || 'Site Operations & Field Lead',
      avatarColor: 'bg-blue-600',
      status: supData.assignedProjectId ? 'On-Site' : 'Available',
      experience: supData.experience || '5+ Years',
      activeProjects: supData.assignedProjectId ? [supData.assignedProjectId] : [],
      advanceAmount: Number(supData.advanceAmount) || 50000
    };

    setSupervisors(prev => {
      const updated = isEdit 
        ? prev.map(s => s.id === newId ? { ...s, ...supervisorObj } : s)
        : [supervisorObj, ...prev];
      try {
        localStorage.setItem('asems_v2_supervisors', JSON.stringify(updated));
      } catch (err) {
        console.error('Storage error', err);
      }
      return updated;
    });

    if (supData.assignedProjectId) {
      setProjects(prev => {
        const updatedProjects = prev.map(p => {
          if (p.id === supData.assignedProjectId) {
            return {
              ...p,
              supervisorId: newId,
              supervisorName: fullName,
              supervisorPhone: supData.phone || '+91 98000 00000'
            };
          }
          return p;
        });
        try {
          localStorage.setItem('asems_v2_projects', JSON.stringify(updatedProjects));
        } catch (err) {
          console.error('Storage error', err);
        }
        return updatedProjects;
      });
    }

    toast.success(isEdit ? `Supervisor "${fullName}" updated successfully!` : `Supervisor "${fullName}" created successfully!`);
    setEditingSupervisor(null);
  };

  const handleDeleteSupervisor = (supervisorId) => {
    setSupervisors(prev => {
      const updated = prev.filter(s => s.id !== supervisorId);
      try {
        localStorage.setItem('asems_v2_supervisors', JSON.stringify(updated));
      } catch (err) {
        console.error('Storage error', err);
      }
      return updated;
    });

    // Also unassign from any project if currently assigned
    setProjects(prev => {
      const updatedProjects = prev.map(p => {
        if (p.supervisorId === supervisorId) {
          return {
            ...p,
            supervisorId: '',
            supervisorName: 'Unassigned',
            supervisorPhone: ''
          };
        }
        return p;
      });
      try {
        localStorage.setItem('asems_v2_projects', JSON.stringify(updatedProjects));
      } catch (err) {
        console.error('Storage error', err);
      }
      return updatedProjects;
    });

    toast.success('Supervisor removed from roster.');
  };

  const handleSaveProject = (projectData) => {
    setProjects(prev => {
      const exists = prev.some(p => p.id === projectData.id);
      const updated = exists 
        ? prev.map(p => p.id === projectData.id ? { ...p, ...projectData } : p)
        : [projectData, ...prev];
      try {
        localStorage.setItem('asems_v2_projects', JSON.stringify(updated));
      } catch (err) {
        console.error('Storage error', err);
      }
      return updated;
    });

    const isEdit = Boolean(editingProject || projects.some(p => p.id === projectData.id));
    if (isEdit) {
      toast.success(`Project "${projectData.name}" updated successfully!`);
    } else {
      toast.success(`Project "${projectData.name}" launched successfully!`);
    }
    setEditingProject(null);
  };

  const handleDeleteProject = (projectId) => {
    setProjects(prev => {
      const updated = prev.filter(p => p.id !== projectId);
      try {
        localStorage.setItem('asems_v2_projects', JSON.stringify(updated));
      } catch (err) {
        console.error('Storage error', err);
      }
      return updated;
    });
    toast.success(`Project removed from active operations.`);
  };

  const handleAssignTeam = (assignmentData) => {
    const { projectId, supervisorId, supervisorName, supervisorPhone, assignedTeam, teamCount } = assignmentData;
    
    // Update project
    setProjects(prev => {
      const updated = prev.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            supervisorId,
            supervisorName,
            supervisorPhone,
            assignedTeam,
            teamCount: Number(teamCount) || 8
          };
        }
        return p;
      });
      try {
        localStorage.setItem('asems_v2_projects', JSON.stringify(updated));
      } catch (err) {
        console.error('Storage error', err);
      }
      return updated;
    });

    // Update supervisor active projects & status
    setSupervisors(prev => {
      const updated = prev.map(sup => {
        if (sup.id === supervisorId) {
          const currentProjects = sup.activeProjects || [];
          return {
            ...sup,
            status: 'On-Site',
            activeProjects: currentProjects.includes(projectId) ? currentProjects : [...currentProjects, projectId]
          };
        }
        return sup;
      });
      try {
        localStorage.setItem('asems_v2_supervisors', JSON.stringify(updated));
      } catch (err) {
        console.error('Storage error', err);
      }
      return updated;
    });

    // Update team members assignedProject
    setTeamMembers(prev => {
      const updated = prev.map(member => {
        if (assignedTeam.includes(member.id)) {
          return { ...member, assignedProject: projectId, status: 'Active' };
        }
        return member;
      });
      try {
        localStorage.setItem('asems_v2_team_members', JSON.stringify(updated));
      } catch (err) {
        console.error('Storage error', err);
      }
      return updated;
    });

    toast.success(`Supervisor & Field Crew (${teamCount} Members) assigned successfully!`);
  };

  const handleApproveExpense = (expenseId, notes, targetStatus = 'Approved') => {
    setExpenses(prev => prev.map(e => {
      if (e.id === expenseId) {
        return {
          ...e,
          status: targetStatus,
          reviewedBy: targetStatus === 'Pending' ? null : 'Operations Manager',
          reviewedAt: targetStatus === 'Pending' ? null : new Date().toLocaleString(),
          reviewNotes: notes
        };
      }
      return e;
    }));
    if (targetStatus === 'Approved') {
      toast.success(`Expense ${expenseId} approved for disbursement!`);
    } else if (targetStatus === 'Pending') {
      toast.success(`Expense ${expenseId} reset to Pending!`);
    }
  };

  const handleRejectExpense = (expenseId, notes) => {
    setExpenses(prev => prev.map(e => {
      if (e.id === expenseId) {
        return {
          ...e,
          status: 'Rejected',
          reviewedBy: 'Operations Manager',
          reviewedAt: new Date().toLocaleString(),
          reviewNotes: notes
        };
      }
      return e;
    }));
    toast.error(`Expense ${expenseId} rejected with audit remarks.`);
  };

  const handleForwardExpense = (expenseId, forwardTo = 'Accounts & Finance', notes = '') => {
    setExpenses(prev => prev.map(e => {
      if (e.id === expenseId) {
        return {
          ...e,
          status: 'Forwarded',
          forwardedTo: forwardTo,
          forwardedAt: new Date().toLocaleString(),
          forwardNotes: notes
        };
      }
      return e;
    }));
    toast.success(`Expense ${expenseId} forwarded to ${forwardTo}!`);
  };

  const handleSubmitNewExpense = (newExpense) => {
    setExpenses(prev => [newExpense, ...prev]);
    toast.success(`Expense claim ${newExpense.id} submitted for approval!`);
  };

  const handleUpdateProgress = (updateData) => {
    const { projectId, progress, health, milestones, status, newLog } = updateData;
    
    // Update project
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          progress,
          health,
          milestones,
          status
        };
      }
      return p;
    }));

    // Prepend new site log
    if (newLog) {
      setSiteLogs(prev => [newLog, ...prev]);
    }

    toast.success(`Site progress updated to ${progress}%!`);
  };

  const handleResetData = () => {
    if (window.confirm('Reset Operations Module to default demo datasets?')) {
      setProjects(initialProjects);
      setSupervisors(initialSupervisors);
      setTeamMembers(initialTeamMembers);
      setExpenses(initialExpenses);
      setSiteLogs(initialSiteLogs);
      localStorage.clear();
      toast.success('Operations demo data reset successfully.');
    }
  };

  const pendingExpensesCount = expenses.filter(e => e.status === 'Pending').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300 font-sans">
      <Toaster position="top-right" />

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <OperationsOverview
          projects={projects}
          supervisors={supervisors}
          teamMembers={teamMembers}
          expenses={expenses}
          siteLogs={siteLogs}
          setActiveTab={handleTabChange}
          onOpenCreateProject={() => { setEditingProject(null); setIsCreateProjectOpen(true); }}
          onOpenSubmitExpense={() => setIsSubmitExpenseOpen(true)}
          onSelectProject={(p) => { setSelectedProjectDetail(p); setIsProjectDetailOpen(true); }}
          onApproveExpense={handleApproveExpense}
          onRejectExpense={handleRejectExpense}
        />
      )}

      {activeTab === 'projects' && (
        <ProjectsTab
          projects={projects}
          supervisors={supervisors}
          onOpenCreateProject={() => { setEditingProject(null); setIsCreateProjectOpen(true); }}
          onEditProject={(p) => { setEditingProject(p); setIsCreateProjectOpen(true); }}
          onDeleteProject={handleDeleteProject}
          onSelectProject={(p) => { setSelectedProjectDetail(p); setIsProjectDetailOpen(true); }}
          onOpenAssignTeam={(p) => { setTargetProjectForTeam(p); setIsAssignTeamOpen(true); }}
          onOpenUpdateProgress={(p) => { setTargetProjectForProgress(p); setIsUpdateProgressOpen(true); }}
        />
      )}

      {activeTab === 'team' && (
        <TeamAssignmentTab
          projects={projects}
          supervisors={supervisors}
          teamMembers={teamMembers}
          onOpenCreateSupervisor={() => { setEditingSupervisor(null); setIsCreateSupervisorOpen(true); }}
          onEditSupervisor={(sup) => { setEditingSupervisor(sup); setIsCreateSupervisorOpen(true); }}
          onDeleteSupervisor={handleDeleteSupervisor}
          onOpenAssignTeam={(p) => { setTargetProjectForTeam(p); setIsAssignTeamOpen(true); }}
          onSelectProject={(p) => { setSelectedProjectDetail(p); setIsProjectDetailOpen(true); }}
        />
      )}

      {activeTab === 'expenses' && (
        <ExpensesTab
          expenses={expenses}
          projects={projects}
          supervisors={supervisors}
          onApproveExpense={handleApproveExpense}
          onForwardExpense={handleForwardExpense}
          onRejectExpense={handleRejectExpense}
          onOpenSubmitExpense={() => setIsSubmitExpenseOpen(true)}
          onInspectExpense={(exp) => { setInspectingExpense(exp); setIsExpenseApprovalOpen(true); }}
        />
      )}

      {(activeTab === 'reconciliation' || activeTab === 'cashadvance') && (
        <ReconciliationTab
          projects={projects}
          supervisors={supervisors}
          expenses={expenses}
          activeView={activeTab}
        />
      )}

      {activeTab === 'progress' && (
        <ProgressMonitoringTab
          projects={projects}
          siteLogs={siteLogs}
          onOpenUpdateProgress={(p) => { setTargetProjectForProgress(p); setIsUpdateProgressOpen(true); }}
          onSelectProject={(p) => { setSelectedProjectDetail(p); setIsProjectDetailOpen(true); }}
        />
      )}

      {activeTab === 'alerts' && (
        <AlertsTab
          onSelectProject={(p) => { setSelectedProjectDetail(p); setIsProjectDetailOpen(true); }}
        />
      )}

      {/* Modals */}
      <CreateSupervisorModal
        isOpen={isCreateSupervisorOpen}
        onClose={() => { setIsCreateSupervisorOpen(false); setEditingSupervisor(null); }}
        onCreateSupervisor={handleSaveSupervisor}
        editingSupervisor={editingSupervisor}
        projects={projects}
      />

      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => { setIsCreateProjectOpen(false); setEditingProject(null); }}
        onSave={handleSaveProject}
        editingProject={editingProject}
        supervisors={supervisors}
      />

      <AssignTeamModal
        isOpen={isAssignTeamOpen}
        onClose={() => { setIsAssignTeamOpen(false); setTargetProjectForTeam(null); }}
        onAssign={handleAssignTeam}
        project={targetProjectForTeam}
        projects={projects}
        supervisors={supervisors}
        teamMembers={teamMembers}
      />

      <ExpenseApprovalModal
        isOpen={isExpenseApprovalOpen}
        onClose={() => { setIsExpenseApprovalOpen(false); setInspectingExpense(null); }}
        expense={inspectingExpense}
        onApprove={handleApproveExpense}
        onReject={handleRejectExpense}
      />

      <SubmitExpenseModal
        isOpen={isSubmitExpenseOpen}
        onClose={() => setIsSubmitExpenseOpen(false)}
        onSubmit={handleSubmitNewExpense}
        projects={projects}
        supervisors={supervisors}
      />

      <UpdateProgressModal
        isOpen={isUpdateProgressOpen}
        onClose={() => { setIsUpdateProgressOpen(false); setTargetProjectForProgress(null); }}
        project={targetProjectForProgress}
        onUpdateProgress={handleUpdateProgress}
        supervisors={supervisors}
      />
    </div>
  );
};

export default OperationsDashboard;
