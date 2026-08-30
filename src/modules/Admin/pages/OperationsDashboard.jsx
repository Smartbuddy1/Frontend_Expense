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
  initialAccountants,
  initialExpenses, 
  initialSiteLogs,
  initialOrganizations
} from '../data/operationsData';

import OperationsOverview from '../components/operations/OperationsOverview';
import LiveOpsPanel from '../components/operations/LiveOpsPanel';
import ProjectsTab from '../components/operations/ProjectsTab';
import OrganizationsTab from '../components/operations/OrganizationsTab';
import TeamAssignmentTab from '../components/operations/TeamAssignmentTab';
import SiteTeamTab from '../components/operations/SiteTeamTab';
import ExpensesTab from '../components/operations/ExpensesTab';
import ProgressMonitoringTab from '../components/operations/ProgressMonitoringTab';
import AlertsTab from '../components/operations/AlertsTab';
import ReconciliationTab from '../components/operations/ReconciliationTab';

// Modals
import CreateProjectModal from '../components/operations/modals/CreateProjectModal';
import CreateOrganizationModal from '../components/operations/modals/CreateOrganizationModal';
import CreateTeamMemberModal from '../components/operations/modals/CreateTeamMemberModal';
import CreateAccountantModal from '../components/operations/modals/CreateAccountantModal';
import AssignTeamModal from '../components/operations/modals/AssignTeamModal';
import { useSearchParams } from 'react-router-dom';
import ExpenseApprovalModal from '../components/operations/modals/ExpenseApprovalModal';
import SubmitExpenseModal from '../components/operations/modals/SubmitExpenseModal';
import UpdateProgressModal from '../components/operations/modals/UpdateProgressModal';
import ProjectDetailModal from '../components/operations/modals/ProjectDetailModal';
import CreateSupervisorModal from '../components/operations/modals/CreateSupervisorModal';
import TransferAdvanceModal from '../components/operations/modals/TransferAdvanceModal';
import SitePhotoGalleryModal from '../components/operations/modals/SitePhotoGalleryModal';

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
    if (!saved) return initialExpenses;
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length >= 3 ? parsed : initialExpenses;
    } catch {
      return initialExpenses;
    }
  });

  const [siteLogs, setSiteLogs] = useState(() => {
    const saved = localStorage.getItem('asems_v2_sitelogs');
    return saved ? JSON.parse(saved) : initialSiteLogs;
  });

  const [organizations, setOrganizations] = useState(() => {
    const saved = localStorage.getItem('asems_v2_organizations');
    return saved ? JSON.parse(saved) : initialOrganizations;
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
    localStorage.setItem('asems_v2_organizations', JSON.stringify(organizations));
  }, [organizations]);

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
  const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);

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

  const [isCreateTeamMemberOpen, setIsCreateTeamMemberOpen] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState(null);

  const [accountants, setAccountants] = useState(() => {
    const saved = localStorage.getItem('asems_v2_accountants');
    return saved ? JSON.parse(saved) : initialAccountants;
  });

  const [isCreateAccountantOpen, setIsCreateAccountantOpen] = useState(false);
  const [editingAccountant, setEditingAccountant] = useState(null);

  const handleSaveAccountant = (accData) => {
    const isEdit = Boolean(accData.id && accountants.some(a => a.id === accData.id));
    setAccountants(prev => {
      const updated = isEdit 
        ? prev.map(a => a.id === accData.id ? { ...a, ...accData } : a)
        : [accData, ...prev];
      try {
        localStorage.setItem('asems_v2_accountants', JSON.stringify(updated));
      } catch (err) {
        console.error('Storage error', err);
      }
      return updated;
    });

    toast.success(isEdit ? `Accountant ${accData.name} updated!` : `Accountant ${accData.name} registered successfully!`);
  };

  const handleDeleteAccountant = (accId) => {
    if (!window.confirm('Are you sure you want to remove this accountant?')) return;
    setAccountants(prev => {
      const updated = prev.filter(a => a.id !== accId);
      try {
        localStorage.setItem('asems_v2_accountants', JSON.stringify(updated));
      } catch (err) {
        console.error('Storage error', err);
      }
      return updated;
    });
    toast.success('Accountant removed');
  };

  const [isTransferAdvanceOpen, setIsTransferAdvanceOpen] = useState(false);
  const [isPhotoGalleryOpen, setIsPhotoGalleryOpen] = useState(false);

  const handleSaveTeamMember = (memberData) => {
    const isEdit = Boolean(memberData.id && teamMembers.some(m => m.id === memberData.id));
    setTeamMembers(prev => {
      const updated = isEdit 
        ? prev.map(m => m.id === memberData.id ? { ...m, ...memberData } : m)
        : [memberData, ...prev];
      try {
        localStorage.setItem('asems_v2_team', JSON.stringify(updated));
      } catch (err) {
        console.error('Storage error', err);
      }
      return updated;
    });

    toast.success(isEdit ? `Team member ${memberData.name} updated!` : `Team member ${memberData.name} registered!`);
  };

  const handleDeleteTeamMember = (memberId) => {
    setTeamMembers(prev => {
      const updated = prev.filter(m => m.id !== memberId);
      try {
        localStorage.setItem('asems_v2_team', JSON.stringify(updated));
      } catch (err) {
        console.error('Storage error', err);
      }
      return updated;
    });
    toast.success('Team member removed.');
  };

  // Advance Transfer Handler
  const handleTransferAdvance = (advData) => {
    setSupervisors(prev => {
      const updated = prev.map(s => {
        if (s.id === advData.supervisorId) {
          const currentAdv = Number(s.advanceAmount) || 0;
          return { ...s, advanceAmount: currentAdv + Number(advData.amount) };
        }
        return s;
      });
      try {
        localStorage.setItem('asems_v2_supervisors', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    toast.success(`₹${Number(advData.amount).toLocaleString('en-IN')} ॲडव्हान्स ${advData.supervisorName} यांच्या खात्यात जोडला गेला!`);
  };

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

  const handleSaveOrganization = (orgData) => {
    setOrganizations(prev => {
      const exists = prev.some(o => o.id === orgData.id);
      let updated;
      if (exists) {
        updated = prev.map(o => o.id === orgData.id ? orgData : o);
      } else {
        updated = [orgData, ...prev];
      }
      try {
        localStorage.setItem('asems_v2_organizations', JSON.stringify(updated));
      } catch (err) {
        console.error('Storage error', err);
      }
      return updated;
    });
    setEditingOrg(null);
  };

  const handleDeleteOrganization = (orgId) => {
    if (window.confirm('Are you sure you want to delete this organization?')) {
      setOrganizations(prev => {
        const updated = prev.filter(o => o.id !== orgId);
        try {
          localStorage.setItem('asems_v2_organizations', JSON.stringify(updated));
        } catch (err) {
          console.error('Storage error', err);
        }
        return updated;
      });
      toast.success('Organization removed');
    }
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

  const handleApproveExpense = (expenseId, notes) => {
    setExpenses(prev => prev.map(e => {
      if (e.id === expenseId) {
        return {
          ...e,
          status: 'Approved',
          reviewedBy: 'Operations Manager',
          reviewedAt: new Date().toLocaleString(),
          reviewNotes: notes
        };
      }
      return e;
    }));
    toast.success(`Expense ${expenseId} approved for disbursement!`);
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
          organizations={organizations}
          accountants={accountants}
          teamMembers={teamMembers}
          expenses={expenses}
          siteLogs={siteLogs}
          setActiveTab={handleTabChange}
          onOpenCreateProject={() => { setEditingProject(null); setIsCreateProjectOpen(true); }}
          onOpenSubmitExpense={() => setIsSubmitExpenseOpen(true)}
          onSelectProject={(p) => { setSelectedProjectDetail(p); setIsProjectDetailOpen(true); }}
          onApproveExpense={handleApproveExpense}
          onRejectExpense={handleRejectExpense}
          onOpenTransferAdvance={() => setIsTransferAdvanceOpen(true)}
          onOpenPhotoGallery={() => setIsPhotoGalleryOpen(true)}
        />
      )}

      {(activeTab === 'organizations' || activeTab === 'operational-head' || activeTab === 'head') && (
        <OrganizationsTab
          organizations={organizations}
          projects={projects}
          onOpenCreateOrganization={() => { setEditingOrg(null); setIsCreateOrgOpen(true); }}
          onEditOrganization={(org) => { setEditingOrg(org); setIsCreateOrgOpen(true); }}
          onDeleteOrganization={handleDeleteOrganization}
          onNavigateTab={handleTabChange}
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

      {(activeTab === 'supervisors' || activeTab === 'multi-supervisors') && (
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

      {activeTab === 'team' && (
        <SiteTeamTab
          teamMembers={teamMembers}
          projects={projects}
          supervisors={supervisors}
          onOpenCreateMember={() => { setEditingTeamMember(null); setIsCreateTeamMemberOpen(true); }}
          onEditMember={(m) => { setEditingTeamMember(m); setIsCreateTeamMemberOpen(true); }}
          onDeleteMember={handleDeleteTeamMember}
        />
      )}

      {(activeTab === 'expenses' || activeTab === 'accountant') && (
        <ExpensesTab
          activeTab={activeTab}
          expenses={expenses}
          projects={projects}
          accountants={accountants}
          onApproveExpense={handleApproveExpense}
          onRejectExpense={handleRejectExpense}
          onOpenSubmitExpense={() => setIsSubmitExpenseOpen(true)}
          onInspectExpense={(exp) => { setInspectingExpense(exp); setIsExpenseApprovalOpen(true); }}
          onOpenCreateAccountant={() => { setEditingAccountant(null); setIsCreateAccountantOpen(true); }}
          onEditAccountant={(acc) => { setEditingAccountant(acc); setIsCreateAccountantOpen(true); }}
          onDeleteAccountant={handleDeleteAccountant}
        />
      )}

      {activeTab === 'reconciliation' && (
        <ReconciliationTab
          projects={projects}
          supervisors={supervisors}
          expenses={expenses}
          onNavigateTab={setActiveTab}
          onOpenTransferAdvance={() => setIsTransferAdvanceOpen(true)}
        />
      )}

      {activeTab === 'progress' && (
        <ProgressMonitoringTab
          projects={projects}
          siteLogs={siteLogs}
          onNavigateTab={setActiveTab}
          onOpenUpdateProgress={(p) => { setTargetProjectForProgress(p); setIsUpdateProgressOpen(true); }}
          onSelectProject={(p) => { setSelectedProjectDetail(p); setIsProjectDetailOpen(true); }}
          onOpenPhotoGallery={() => setIsPhotoGalleryOpen(true)}
        />
      )}

      {activeTab === 'alerts' && (
        <AlertsTab
          onSelectProject={(p) => { setSelectedProjectDetail(p); setIsProjectDetailOpen(true); }}
        />
      )}

      {activeTab === 'live-ops' && <LiveOpsPanel />}

      {/* Modals */}
      <CreateOrganizationModal
        isOpen={isCreateOrgOpen}
        onClose={() => { setIsCreateOrgOpen(false); setEditingOrg(null); }}
        onSave={handleSaveOrganization}
        editingOrg={editingOrg}
      />

      <CreateSupervisorModal
        isOpen={isCreateSupervisorOpen}
        onClose={() => { setIsCreateSupervisorOpen(false); setEditingSupervisor(null); }}
        onCreateSupervisor={handleSaveSupervisor}
        editingSupervisor={editingSupervisor}
        projects={projects}
      />

      <CreateTeamMemberModal
        isOpen={isCreateTeamMemberOpen}
        onClose={() => { setIsCreateTeamMemberOpen(false); setEditingTeamMember(null); }}
        onSave={handleSaveTeamMember}
        editingMember={editingTeamMember}
        projects={projects}
      />

      <CreateAccountantModal
        isOpen={isCreateAccountantOpen}
        onClose={() => { setIsCreateAccountantOpen(false); setEditingAccountant(null); }}
        onSave={handleSaveAccountant}
        editingAccountant={editingAccountant}
      />

      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => { setIsCreateProjectOpen(false); setEditingProject(null); }}
        onSave={handleSaveProject}
        editingProject={editingProject}
        supervisors={supervisors}
        organizations={organizations}
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

      <ProjectDetailModal
        isOpen={isProjectDetailOpen}
        onClose={() => { setIsProjectDetailOpen(false); setSelectedProjectDetail(null); }}
        project={selectedProjectDetail}
        supervisors={supervisors}
        teamMembers={teamMembers}
        expenses={expenses}
        onOpenAssign={(p) => {
          setIsProjectDetailOpen(false);
          setTargetProjectForTeam(p);
          setIsAssignTeamOpen(true);
        }}
        onOpenProgress={(p) => {
          setIsProjectDetailOpen(false);
          setTargetProjectForProgress(p);
          setIsUpdateProgressOpen(true);
        }}
      />

      {/* Direct Advance Transfer Modal */}
      <TransferAdvanceModal
        isOpen={isTransferAdvanceOpen}
        onClose={() => setIsTransferAdvanceOpen(false)}
        onTransfer={handleTransferAdvance}
        supervisors={supervisors}
        projects={projects}
      />

      {/* Site Photo Gallery & Proofs Modal */}
      <SitePhotoGalleryModal
        isOpen={isPhotoGalleryOpen}
        onClose={() => setIsPhotoGalleryOpen(false)}
        projects={projects}
      />
    </div>
  );
};

export default OperationsDashboard;
