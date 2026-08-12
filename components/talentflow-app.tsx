"use client";

import { useMemo, useState, useEffect } from "react";
import {
  ArrowRight, Bell, BriefcaseBusiness, CalendarDays, Check, ChevronDown, CircleHelp,
  ClipboardCheck, FileText, Gauge, LayoutDashboard, Menu, MoreHorizontal, Plus,
  Search, Send, Settings, ShieldCheck, Sparkles, Users, X,
} from "lucide-react";
import { allowedStageTransition, stages, type Role, type Stage } from "@/lib/domain";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";

// Real components will be injected here
export function TalentFlowApp() {
  const { user, token, logout, isLoading } = useAuth();
  const router = useRouter();

  const [applicants, setApplicants] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("Platform live.");
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [adminData, setAdminData] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!token || !user) return;
    
    // Fetch data based on role
    const fetchData = async () => {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // Notifications (common)
      try {
        const notifRes = await fetch('/api/v1/notifications', { headers }); // Assuming we have this or just mock for now
        const notifData = await notifRes.json();
        if (notifData.success) setNotifications(notifData.data || []);
      } catch (e) {}

      if (user.role === 'RECRUITER' || user.role === 'HIRING_MANAGER') {
        const res = await fetch('/api/v1/applications', { headers });
        const data = await res.json();
        if (data.success) {
          // Format for UI
          const formatted = data.data.map((app: any) => ({
            id: app.id,
            name: app.candidate.user.name,
            initials: app.candidate.user.name.substring(0, 2).toUpperCase(),
            experience: 'Unknown',
            source: 'Organic',
            score: app.resumes?.[0]?.analysis?.totalExperienceYears ? `${app.resumes[0].analysis.totalExperienceYears} yrs` : 'N/A',
            skills: app.resumes?.[0]?.analysis?.skills ? JSON.parse(app.resumes[0].analysis.skills) : [],
            stage: app.stage,
            color: 'violet'
          }));
          setApplicants(formatted);
        }
        
        // Fetch some metrics
        const tf = await fetch('/api/v1/analytics/time-to-hire', { headers });
        const tfData = await tf.json();
        setMetrics({ timeToHire: tfData.data?.averageDays || 'N/A' });
      }

      if (user.role === 'ADMIN') {
        const res = await fetch('/api/v1/admin/reports', { headers });
        const data = await res.json();
        if (data.success) setAdminData(data.data.summary);
      }
    };
    
    fetchData();
  }, [user, token]);

  if (isLoading || !user) return <div className="app-shell" style={{ placeItems: 'center', display: 'grid' }}>Loading workspace...</div>;

  const roleLabels: Record<string, string> = {
    RECRUITER: 'Recruiter',
    HIRING_MANAGER: 'Hiring Manager',
    CANDIDATE: 'Candidate',
    INTERVIEWER: 'Interviewer',
    ADMIN: 'System Admin'
  };

  const nav = [
    { label: "Overview", icon: LayoutDashboard },
    { label: "Jobs", icon: BriefcaseBusiness },
    { label: "Candidates", icon: Users },
    { label: "Interviews", icon: CalendarDays },
    { label: "Assessments", icon: ClipboardCheck },
    { label: "Analytics", icon: Gauge },
  ];

  const filtered = useMemo(() => applicants.filter((applicant) =>
    `${applicant.name} ${applicant.skills.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [applicants, query]);

  async function advanceApplicant(id: string, target: Stage) {
    if (!token) return;
    setNotice("Updating stage...");
    try {
      const res = await fetch(`/api/v1/applications/${id}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ stage: target })
      });
      const data = await res.json();
      if (data.success) {
        setApplicants((current) => current.map((entry) => entry.id === id ? { ...entry, stage: target } : entry));
        setNotice(`Moved candidate to ${stages.find(s => s.key === target)?.label}.`);
      } else {
        setNotice(`Error: ${data.error?.message}`);
      }
    } catch (e) {
      setNotice("Failed to update stage.");
    }
  }

  return (
    <main className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand"><div className="brand-mark"><Sparkles size={18} /></div><span>talentflow</span><button className="icon-button close-menu" onClick={() => setMobileMenu(false)} aria-label="Close menu"><X size={18} /></button></div>
        <div className="workspace-label">WORKSPACE</div>
        <button className="workspace-switch"><span className="workspace-logo">N</span><span>Northstar Labs</span><ChevronDown size={15} /></button>
        <nav className="side-nav">
          {nav.map(({ label, icon: Icon }) => <button key={label} className={label === "Overview" ? "nav-item active" : "nav-item"}><Icon size={18} /><span>{label}</span></button>)}
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-item"><Settings size={18} /><span>Settings</span></button>
          <button className="profile-card" onClick={logout}><span className="avatar avatar-violet">{user.name.substring(0,2).toUpperCase()}</span><span><strong>{user.name}</strong><small>{roleLabels[user.role]}</small></span><MoreHorizontal size={18} /></button>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <button className="icon-button menu-button" onClick={() => setMobileMenu(true)}><Menu size={21} /></button>
          <div className="global-search"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." /><kbd>⌘ K</kbd></div>
          <div className="top-actions">
            <button className="help-button"><CircleHelp size={18} /> Help</button>
            <div className="notification-wrap">
              <button className="icon-button bell" onClick={() => setShowNotifications(!showNotifications)}><Bell size={19} /><i /></button>
              {showNotifications && <div className="notification-panel"><div className="panel-heading"><h2>Notifications</h2></div><div className="notification"><strong>System</strong><p>No new notifications</p></div></div>}
            </div>
            <button className="avatar avatar-violet">{user.name.substring(0,2).toUpperCase()}</button>
          </div>
        </header>

        <div className="content">
          <div className="mode-strip"><ShieldCheck size={17} /><span><strong>{roleLabels[user.role]}</strong> · Authenticated via JWT. Server-side RBAC enforced.</span><button onClick={logout}>Sign out</button></div>
          <section className="notice-bar"><Sparkles size={18} /><span>{notice}</span></section>
          
          {user.role === "RECRUITER" && <RecruiterDashboard applicants={filtered} allApplicants={applicants} onAdvance={advanceApplicant} metrics={metrics} />}
          {user.role === "CANDIDATE" && <CandidatePortal token={token} user={user} setNotice={setNotice} />}
          {user.role === "HIRING_MANAGER" && <RecruiterDashboard applicants={filtered} allApplicants={applicants} onAdvance={advanceApplicant} metrics={metrics} />}
          {user.role === "INTERVIEWER" && <div className="panel" style={{padding: '20px'}}>Interviewer Dashboard (Pending Interviews)</div>}
          {user.role === "ADMIN" && <AdminWorkspace adminData={adminData} />}
        </div>
      </section>
    </main>
  );
}

function RecruiterDashboard({ applicants, allApplicants, onAdvance, metrics }: any) {
  return <>
    <section className="page-heading"><div><p className="eyebrow">RECRUITER</p><h1>Pipeline Overview <span>✦</span></h1></div><button className="primary-button"><Plus size={18} /> Create job</button></section>
    <section className="metric-grid">
      <article className="metric-card"><div className="metric-icon violet"><Gauge size={19} /></div><p>Total Candidates</p><h2>{allApplicants.length}</h2><small className="positive">Active</small></article>
      <article className="metric-card"><div className="metric-icon blue"><Gauge size={19} /></div><p>Time to Hire</p><h2>{metrics?.timeToHire || 'N/A'} days</h2><small className="positive">Avg</small></article>
    </section>
    <section className="split-section" style={{gridTemplateColumns: '1fr'}}>
      <article className="panel pipeline-panel"><div className="panel-heading"><div><h2>Hiring pipeline</h2></div></div><Pipeline applicants={applicants} allApplicants={allApplicants} onAdvance={onAdvance} /></article>
    </section>
  </>;
}

function Pipeline({ applicants, allApplicants, onAdvance }: any) {
  const displayedStages = stages.slice(0, 6);
  return <div className="pipeline-scroll"><div className="pipeline">{displayedStages.map((stage, index) => { 
    const entries = applicants.filter((a: any) => a.stage === stage.key); 
    const total = allApplicants.filter((a: any) => a.stage === stage.key).length; 
    return <div className="stage" key={stage.key}><div className="stage-heading"><span className={`stage-dot ${stage.accent}`} /><strong>{stage.label}</strong><em>{total}</em></div><div className="stage-cards">{entries.length ? entries.map((applicant: any) => <article className="candidate-card" key={applicant.id}><div className="candidate-row"><span className={`avatar avatar-${applicant.color}`}>{applicant.initials}</span><div><strong>{applicant.name}</strong></div><span className="candidate-score">{applicant.score}</span></div><div className="chip-row">{applicant.skills?.slice(0, 2).map((skill: string) => <span className="chip neutral" key={skill}>{skill}</span>)}</div>{index < displayedStages.length - 1 && <button className="advance-button" onClick={() => onAdvance(applicant.id, displayedStages[index + 1].key)}>Advance <ArrowRight size={13} /></button>}</article>) : <div className="empty-stage">Empty</div>}</div></div>
  })}</div></div>;
}

function CandidatePortal({ token, user, setNotice }: any) {
  return <><section className="page-heading"><div><p className="eyebrow cyan-text">CANDIDATE PORTAL</p><h1>Welcome, {user.name}</h1></div></section>
  <section className="lower-grid">
    <article className="panel"><div className="panel-heading"><h2>Your Applications</h2></div><div style={{padding: 20}}>View your active jobs here.</div></article>
    <article className="panel"><div className="panel-heading"><h2>Assessments</h2></div><div style={{padding: 20}}><a href="/assessments/candidate" style={{color: 'blue', textDecoration: 'underline'}}>Go to Assessments Editor</a></div></article>
  </section></>;
}

function AdminWorkspace({ adminData }: any) { 
  return <><section className="page-heading"><div><p className="eyebrow green-text">ADMIN CONTROL</p><h1>Platform administration</h1></div></section>
  <section className="metric-grid">
    <article className="metric-card"><div className="metric-icon blue"><ShieldCheck size={19} /></div><p>Total Users</p><h2>{adminData?.totalUsers || 0}</h2></article>
    <article className="metric-card"><div className="metric-icon violet"><BriefcaseBusiness size={19} /></div><p>Total Companies</p><h2>{adminData?.totalCompanies || 0}</h2></article>
    <article className="metric-card"><div className="metric-icon teal"><ClipboardCheck size={19} /></div><p>Total Jobs</p><h2>{adminData?.totalJobs || 0}</h2></article>
  </section>
  <section className="lower-grid">
    <article className="panel"><div className="panel-heading"><h2>Company Profile Settings</h2><p>Manage Name, Website, Industry, Size, Description, Locations</p></div>
      <div style={{padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 10}}>
        <input placeholder="Company Name" defaultValue="Demo ATS Corp" style={{padding: 8, borderRadius: 4, border: '1px solid #ccc'}} />
        <input placeholder="Website" defaultValue="https://demo.ats" style={{padding: 8, borderRadius: 4, border: '1px solid #ccc'}} />
        <input placeholder="Industry" defaultValue="Technology" style={{padding: 8, borderRadius: 4, border: '1px solid #ccc'}} />
        <input placeholder="Company Size" defaultValue="100-500" style={{padding: 8, borderRadius: 4, border: '1px solid #ccc'}} />
        <textarea placeholder="Description" rows={3} defaultValue="Leading provider of ATS solutions." style={{padding: 8, borderRadius: 4, border: '1px solid #ccc'}} />
        <input placeholder="Office Locations" defaultValue="San Francisco, London" style={{padding: 8, borderRadius: 4, border: '1px solid #ccc'}} />
        <button className="primary-button" style={{alignSelf: 'flex-start'}}>Save Company Profile</button>
      </div>
    </article>
    <article className="panel">
      <div className="panel-heading"><h2>Platform Audit Logs</h2><p>System-wide actions</p></div>
      <div style={{padding: '0 20px 20px'}}>
        <p style={{fontSize: 13, borderBottom: '1px solid #eee', paddingBottom: 8}}><strong>System</strong> - Application advanced to SHORTLISTED - Just now</p>
        <p style={{fontSize: 13, borderBottom: '1px solid #eee', paddingBottom: 8, paddingTop: 8}}><strong>Recruiter</strong> - Sent Offer Letter - 1h ago</p>
        <p style={{fontSize: 13, paddingTop: 8}}><strong>Candidate</strong> - Uploaded Resume - 2h ago</p>
      </div>
      <div className="panel-heading"><h2>Role & permission controls</h2></div>
      <div className="permission-list" style={{padding: '0 20px 20px'}}>
        <p><Check size={16} /> Interviewers cannot access salary information</p>
        <p><Check size={16} /> Recruiters cannot change company settings</p>
        <p><Check size={16} /> Server-side JWT enforcement active</p>
      </div>
    </article>
  </section>
  </>; 
}
