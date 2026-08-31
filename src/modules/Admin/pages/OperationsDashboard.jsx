import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Building2, Users, IndianRupee, TrendingUp, LayoutDashboard,
  Plus, CheckCircle2, XCircle, Sparkles, RefreshCw, AlertCircle
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import {
  initialExpenses,
  initialSiteLogs
} from '../data/operationsData';

const API = import.meta.env.VITE_API_BASE_URL;

const STATUS_TO_DISPLAY = { planned: 'Planned', active: 'In Progress', on_hold: 'On Hold', completed: 'Completed' };
const DISPLAY_TO_STATUS = { Planned: 'planned', 'In Progress': 'active', 'On Hold': 'on_hold', Completed: 'completed' };
const HEALTH_TO_DISPLAY = { on_track: 'On Track', at_risk: 'At Risk', delayed: 'Delayed' };
const DISPLAY_TO_HEALTH = { 'On Track': 'on_track', 'At Risk': 'at_risk', Delayed: 'delayed' };

const mapProject = (p) => ({
  id: p.id,
  code: p.code,
  name: p.name,
  client: p.organization?.name || '',
  location: p.site || p.location || '',
  category: p.category || 'Infrastructure & Civil',
  budget: Number(p.budget) || 0,
  spent: 0,
  startDate: p.startDate ? p.startDate.split('T')[0] : '',
  endDate: p.endDate ? p.endDate.split('T')[0] : '',
  status: STATUS_TO_DISPLAY[p.status] || 'In Progress',
  health: HEALTH_TO_DISPLAY[p.health] || 'On Track',
  progress: p.progress || 0,
  supervisorId: p.supervisorId || '',
  supervisorName: p.supervisor?.name || 'Unassigned',
  supervisorPhone: p.supervisor?.mobile || '',
  teamCount: (p.teamAssignments || []).length,
  description: p.description || '',
  milestones: (p.milestones || []).map(m => ({ id: m.id, title: m.title, status: m.status, targetDate: m.targetDate || '' })),
  assignedTeam: (p.teamAssignments || []).map(a => a.teamMemberId),
});

const mapSupervisor = (u) => ({
  id: u.id,
  name: u.name,
  phone: u.mobile,
  email: u.email || '',
  specialization: 'Site Operations & Field Lead',
  avatarColor: 'bg-blue-600',
  status: u.status === 'active' ? 'Available' : 'Inactive',
  experience: '—',
  activeProjects: [],
  advanceAmount: 0,
});

const mapTeamMember = (t) => ({
  id: t.id,
  name: t.name,
  role: t.role || '',
  phone: t.phone || '',
  skills: t.skills || [],
  status: t.status,
});

const mapAccountant = (u) => ({
  id: u.id,
  name: u.name,
  phone: u.mobile,
  email: u.email || '',
  role: 'Accountant',
  branch: 'Head Office',
  status: u.status === 'active' ? 'Active' : 'Inactive',
});

const mapOrganization = (o) => ({
  id: o.id,
  name: o.name,
  phone: o.phone || '',
  contactPerson: o.contactPerson || '',
  email: o.email || '',
});

const mapOperationalHead = (h) => ({
  id: h.id,
  name: h.name,
  phone: h.phone || '',
  email: h.email || '',
  role: h.department || 'Operational Head',
  password: '',
});

const EXPENSE_STATUS_TO_DISPLAY = {
  submitted: 'Pending',
  ops_approved: 'Approved',
  ops_rejected: 'Rejected',
  accounts_paid: 'Approved',
};

const mapExpense = (e) => {
  const created = new Date(e.createdAt);
  return {
    id: e.id,
    voucherNo: `EXP-${e.id.slice(0, 8).toUpperCase()}`,
    date: created.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: created.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    projectId: e.projectId,
    projectName: e.project?.name || 'Unknown Project',
    supervisorId: e.submittedById,
    supervisorName: e.submittedBy?.name || 'Unknown',
    submittedBy: e.submittedBy?.name || 'Unknown',
    category: e.category?.name || 'Uncategorized',
    description: e.description,
    title: e.description,
    vendorName: e.vendorName || '',
    vendor: e.vendorName || '',
    amount: Number(e.amount),
    status: EXPENSE_STATUS_TO_DISPLAY[e.status] || 'Pending',
    billPhotoUrl: e.receiptUrl || null,
    reviewNotes: e.opsRemarks || '',
  };
};

const ADVANCE_STATUS_TO_DISPLAY = {
  requested: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  disbursed: 'Disbursed',
};

const mapAdvance = (a) => ({
  id: a.id,
  projectId: a.projectId,
  projectName: a.project?.name || 'Unknown Project',
  site: a.project?.site || '',
  supervisorId: a.requestedById,
  supervisor: a.requestedBy?.name || 'Unknown',
  supervisorMobile: a.requestedBy?.mobile || '',
  purpose: a.purpose || '',
  amount: Number(a.amount),
  status: ADVANCE_STATUS_TO_DISPLAY[a.status] || 'Pending',
  rawStatus: a.status,
  date: a.createdAt,
});

import OperationsOverview from '../components/operations/OperationsOverview';
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

  // Projects, supervisors, team members, organizations, and accountants all
  // come from the real backend now. Expenses/site logs below are still the
  // original mock data — see docs/03-frontend-status.md for what's real vs not.
  const [projects, setProjects] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [accountants, setAccountants] = useState([]);
  const [operationalHeads, setOperationalHeads] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [advances, setAdvances] = useState([]);
  const [loadingCore, setLoadingCore] = useState(true);

  const fetchCore = useCallback(async () => {
    setLoadingCore(true);
    try {
      const [projRes, supRes, teamRes, orgRes, accRes, headsRes, expRes, advRes] = await Promise.all([
        axios.get(`${API}/projects`, { params: { pageSize: 100 } }),
        axios.get(`${API}/users`, { params: { role: 'site_supervisor' } }),
        axios.get(`${API}/team-members`),
        axios.get(`${API}/organizations`),
        axios.get(`${API}/users`, { params: { role: 'accountant' } }),
        axios.get(`${API}/operational-heads`),
        axios.get(`${API}/expenses`, { params: { pageSize: 100 } }),
        axios.get(`${API}/advances`),
      ]);
      setProjects(projRes.data.projects.map(mapProject));
      setSupervisors(supRes.data.users.map(mapSupervisor));
      setTeamMembers(teamRes.data.teamMembers.map(mapTeamMember));
      setOrganizations(orgRes.data.organizations.map(mapOrganization));
      setAccountants(accRes.data.users.map(mapAccountant));
      setOperationalHeads(headsRes.data.operationalHeads.map(mapOperationalHead));
      setExpenses(expRes.data.expenses.map(mapExpense));
      setAdvances(advRes.data.advances.map(mapAdvance));
    } catch (err) {
      toast.error('Could not load live operations data from the server');
      console.error(err);
    } finally {
      setLoadingCore(false);
    }
  }, []);

  useEffect(() => { fetchCore(); }, [fetchCore]);

  const [siteLogs, setSiteLogs] = useState(() => {
    const saved = localStorage.getItem('asems_v2_sitelogs');
    return saved ? JSON.parse(saved) : initialSiteLogs;
  });

  // Save changes to localStorage (site logs only — the rest is real now)
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

  const [isCreateAccountantOpen, setIsCreateAccountantOpen] = useState(false);
  const [editingAccountant, setEditingAccountant] = useState(null);

  const handleSaveAccountant = async (accData) => {
    if (accData.id) {
      toast.error('Editing an existing accountant account is not supported yet.');
      return;
    }
    const mobile = (accData.phone || '').replace(/\D/g, '');
    if (mobile.length < 10) {
      toast.error('A valid 10-digit mobile number is required to create a real login');
      return;
    }
    const password = accData.password || 'changeme123';
    try {
      await axios.post(`${API}/users`, {
        name: accData.name,
        mobile,
        password,
        role: 'accountant',
        email: accData.email || undefined,
      });
      toast.success(`Accountant "${accData.name}" created! Login: ${mobile} / ${password}`, { duration: 8000 });
      await fetchCore();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not create accountant');
    }
  };

  const handleDeleteAccountant = () => {
    toast.error('Removing an accountant account isn\'t supported yet — deactivate them with an admin instead of deleting, since their approval history has to stay intact.');
  };

  const [isTransferAdvanceOpen, setIsTransferAdvanceOpen] = useState(false);
  const [isPhotoGalleryOpen, setIsPhotoGalleryOpen] = useState(false);

  const handleSaveTeamMember = async (memberData) => {
    try {
      if (memberData.id) {
        await axios.patch(`${API}/team-members/${memberData.id}`, {
          name: memberData.name,
          role: memberData.role,
          phone: memberData.phone,
        });
        toast.success(`Team member ${memberData.name} updated!`);
      } else {
        await axios.post(`${API}/team-members`, {
          name: memberData.name,
          role: memberData.role,
          phone: memberData.phone,
          skills: memberData.skills ? String(memberData.skills).split(',').map(s => s.trim()).filter(Boolean) : undefined,
        });
        toast.success(`Team member ${memberData.name} registered!`);
      }
      await fetchCore();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not save the team member');
    }
  };

  const handleDeleteTeamMember = async (memberId) => {
    try {
      await axios.delete(`${API}/team-members/${memberId}`);
      toast.success('Team member removed.');
      await fetchCore();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not remove the team member');
    }
  };

  // Advance Transfer Handler — hands a supervisor cash on the spot (auto-approved,
  // still needs Accounts to actually disburse it).
  const handleTransferAdvance = async (advData) => {
    try {
      await axios.post(`${API}/advances/transfer`, {
        projectId: advData.projectId,
        supervisorId: advData.supervisorId,
        amount: advData.amount,
        purpose: advData.purpose || 'Direct transfer by Admin',
      });
      toast.success(`₹${Number(advData.amount).toLocaleString('en-IN')} ॲडव्हान्स ${advData.supervisorName} यांच्या खात्यात जोडला गेला!`);
      await fetchCore();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not transfer the advance');
    }
  };

  // Handlers
  const handleSaveSupervisor = async (supData) => {
    const fullName = supData.name || [supData.firstName, supData.surname].filter(Boolean).join(' ').trim() || 'Supervisor';

    if (supData.id) {
      toast.error('Editing an existing supervisor account is not supported yet — remove and re-create if details are wrong.');
      return;
    }
    const mobile = (supData.phone || '').replace(/\D/g, '');
    if (mobile.length < 10) {
      toast.error('A valid 10-digit mobile number is required to create a real login');
      return;
    }
    const password = supData.password || 'changeme123';

    try {
      const { data } = await axios.post(`${API}/users`, {
        name: fullName,
        mobile,
        password,
        role: 'site_supervisor',
        email: supData.email || undefined,
      });

      if (supData.assignedProjectId) {
        await axios.patch(`${API}/projects/${supData.assignedProjectId}`, { supervisorId: data.user.id });
      }

      toast.success(`Supervisor "${fullName}" created! Login: ${mobile} / ${password}`, { duration: 8000 });
      await fetchCore();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not create supervisor');
    }
    setEditingSupervisor(null);
  };

  const handleDeleteSupervisor = () => {
    toast.error('Removing a supervisor account isn\'t supported yet — deactivate them with an admin instead of deleting, since their expense history has to stay intact.');
  };

  const handleSaveOrganization = async (orgData) => {
    try {
      const payload = {
        name: orgData.name,
        phone: orgData.phone || undefined,
        contactPerson: orgData.contactPerson || undefined,
        email: orgData.email || undefined,
      };
      if (orgData.id && organizations.some(o => o.id === orgData.id)) {
        await axios.patch(`${API}/organizations/${orgData.id}`, payload);
        toast.success(`Organization "${orgData.name}" updated!`);
      } else {
        await axios.post(`${API}/organizations`, payload);
        toast.success(`Organization "${orgData.name}" created!`);
      }
      await fetchCore();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not save the organization');
    }
    setEditingOrg(null);
  };

  const handleDeleteOrganization = async (orgId) => {
    if (!window.confirm('Are you sure you want to delete this organization?')) return;
    try {
      await axios.delete(`${API}/organizations/${orgId}`);
      toast.success('Organization removed');
      await fetchCore();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not delete the organization');
    }
  };

  const handleSaveOperationalHead = async (headData) => {
    try {
      const payload = {
        name: headData.name,
        phone: headData.phone || undefined,
        email: headData.email || undefined,
        department: headData.role || undefined,
      };
      if (headData.id && operationalHeads.some(h => h.id === headData.id)) {
        await axios.patch(`${API}/operational-heads/${headData.id}`, payload);
        toast.success(`Operational Head "${headData.name}" updated!`);
      } else {
        await axios.post(`${API}/operational-heads`, payload);
        toast.success(`Operational Head "${headData.name}" added!`);
      }
      await fetchCore();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not save the operational head');
    }
  };

  const handleDeleteOperationalHead = async (headId) => {
    try {
      await axios.delete(`${API}/operational-heads/${headId}`);
      toast.success('Operational Head removed');
      await fetchCore();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not delete the operational head');
    }
  };

  const handleSaveProject = async (projectData) => {
    try {
      let organizationId;
      if (projectData.client) {
        const { data: orgData } = await axios.get(`${API}/organizations`);
        const existingOrg = orgData.organizations.find(o => o.name.toLowerCase() === projectData.client.toLowerCase());
        if (existingOrg) {
          organizationId = existingOrg.id;
        } else {
          const { data: created } = await axios.post(`${API}/organizations`, {
            name: projectData.client,
            phone: projectData.phone || undefined,
            email: projectData.email || undefined,
          });
          organizationId = created.organization.id;
        }
      }

      const payload = {
        name: projectData.name,
        site: projectData.location,
        organizationId,
        supervisorId: projectData.supervisorId || undefined,
        budget: Number(projectData.budget) || undefined,
        category: projectData.category,
        description: projectData.description,
        status: DISPLAY_TO_STATUS[projectData.status] || 'active',
        startDate: projectData.startDate || undefined,
        endDate: projectData.endDate || undefined,
      };

      const isEdit = Boolean(editingProject);
      if (isEdit) {
        await axios.patch(`${API}/projects/${editingProject.id}`, payload);
        toast.success(`Project "${projectData.name}" updated successfully!`);
      } else {
        await axios.post(`${API}/projects`, { ...payload, code: projectData.id });
        toast.success(`Project "${projectData.name}" launched successfully!`);
      }
      await fetchCore();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not save the project');
    }
    setEditingProject(null);
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await axios.delete(`${API}/projects/${projectId}`);
      toast.success('Project removed.');
      await fetchCore();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not delete the project');
    }
  };

  const handleAssignTeam = async (assignmentData) => {
    const { projectId, supervisorId, assignedTeam, teamCount } = assignmentData;
    try {
      await axios.patch(`${API}/projects/${projectId}`, { supervisorId: supervisorId || undefined });

      const currentProject = projects.find(p => p.id === projectId);
      const currentTeam = currentProject?.assignedTeam || [];
      const toAdd = (assignedTeam || []).filter(id => !currentTeam.includes(id));
      const toRemove = currentTeam.filter(id => !(assignedTeam || []).includes(id));

      await Promise.all([
        ...toAdd.map(teamMemberId => axios.post(`${API}/projects/${projectId}/team`, { teamMemberId })),
        ...toRemove.map(teamMemberId => axios.delete(`${API}/projects/${projectId}/team/${teamMemberId}`)),
      ]);

      toast.success(`Supervisor & Field Crew (${teamCount || (assignedTeam || []).length} Members) assigned successfully!`);
      await fetchCore();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not save the team assignment');
    }
  };

  const handleApproveExpense = async (expenseId, notes) => {
    try {
      await axios.patch(`${API}/expenses/${expenseId}/approve`);
      toast.success(`Expense ${expenseId} approved for disbursement!`);
      await fetchCore();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not approve the expense');
    }
  };

  const handleRejectExpense = async (expenseId, notes) => {
    try {
      await axios.patch(`${API}/expenses/${expenseId}/reject`, { remarks: notes });
      toast.error(`Expense ${expenseId} rejected with audit remarks.`);
      await fetchCore();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not reject the expense');
    }
  };

  const handleSubmitNewExpense = async (newExpense) => {
    try {
      await axios.post(`${API}/expenses`, {
        projectId: newExpense.projectId,
        description: newExpense.title || newExpense.description,
        vendorName: newExpense.vendor || newExpense.vendorName,
        amount: newExpense.amount,
      });
      toast.success(`Expense claim submitted for approval!`);
      await fetchCore();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not submit the expense claim');
    }
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
          operationalHeads={operationalHeads}
          onOpenCreateOrganization={() => { setEditingOrg(null); setIsCreateOrgOpen(true); }}
          onEditOrganization={(org) => { setEditingOrg(org); setIsCreateOrgOpen(true); }}
          onDeleteOrganization={handleDeleteOrganization}
          onSaveOperationalHead={handleSaveOperationalHead}
          onDeleteOperationalHead={handleDeleteOperationalHead}
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
          advances={advances}
          onNavigateTab={setActiveTab}
          onOpenTransferAdvance={() => setIsTransferAdvanceOpen(true)}
          onRefresh={fetchCore}
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
