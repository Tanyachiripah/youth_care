import { useEffect, useState, FormEvent } from "react";
import { NavLink, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import {
  HeartHandshake, LayoutDashboard, MessageCircle, Building2, BookOpen,
  BriefcaseBusiness, ClipboardList, ShieldCheck, LogOut, Menu, X,
  ArrowUpRight, Sparkles, Search, Send, CheckCircle2, Clock3, Users
} from "lucide-react";
import { api, User, Organisation, Resource, Opportunity } from "./api";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  async function refreshUser() {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
    } catch { setUser(null); }
    finally { setLoading(false); }
  }

  useEffect(() => { void refreshUser(); }, []);

  async function logout() {
    await api.post("/auth/logout").catch(() => undefined);
    setUser(null);
    navigate("/");
  }

  if (loading) return <div className="loading-screen">Loading YouthCare…</div>;

  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink to="/" className="brand"><span className="brand-mark"><HeartHandshake size={22}/></span><span>YouthCare</span></NavLink>
        <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation">{mobileOpen ? <X/> : <Menu/>}</button>
        <nav className={mobileOpen ? "topnav open" : "topnav"}>
          {user ? <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/organisations">Find support</NavLink>
            <NavLink to="/resources">Resources</NavLink>
            <NavLink to="/opportunities">Opportunities</NavLink>
            {user.role === "admin" && <NavLink to="/admin">Admin</NavLink>}
            <button className="nav-user" onClick={logout}><LogOut size={16}/> Sign out</button>
          </> : <>
            <a href="#how-it-works">How it works</a><a href="#services">Explore support</a>
            <NavLink to="/login" className="nav-login">Log in</NavLink>
            <NavLink to="/register" className="button button-small">Get started <ArrowUpRight size={15}/></NavLink>
          </>}
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Landing user={user}/>}/>
          <Route path="/login" element={user ? <Navigate to="/dashboard"/> : <AuthPage mode="login" onAuth={refreshUser}/>}/>
          <Route path="/register" element={user ? <Navigate to="/dashboard"/> : <AuthPage mode="register" onAuth={refreshUser}/>}/>
          <Route path="/dashboard" element={<Protected user={user}><Dashboard user={user!}/></Protected>}/>
          <Route path="/companion" element={<Protected user={user}><Companion/></Protected>}/>
          <Route path="/organisations" element={<Organisations user={user}/>}/>
          <Route path="/resources" element={<Resources/>}/>
          <Route path="/opportunities" element={<Opportunities/>}/>
          <Route path="/referrals" element={<Protected user={user}><Referrals/></Protected>}/>
          <Route path="/admin" element={<Protected user={user} admin><Admin/></Protected>}/>
          <Route path="*" element={<Navigate to="/"/>}/>
        </Routes>
      </main>
      <footer className="footer"><div className="footer-brand"><HeartHandshake size={20}/> YouthCare</div><p>Guidance, education and connection. You deserve support.</p><small>Demonstration platform. Not an emergency or clinical service.</small></footer>
    </div>
  );
}

function Protected({ user, admin = false, children }: { user: User | null; admin?: boolean; children: React.ReactNode }) {
  if (!user) return <Navigate to="/login" replace/>;
  if (admin && user.role !== "admin") return <Navigate to="/dashboard" replace/>;
  return <>{children}</>;
}

function Landing({ user }: { user: User | null }) {
  return <div className="landing">
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow"><span className="pulse-dot"/> A support network for young people</div>
        <h1>You don't have to figure <em>everything</em> out alone.</h1>
        <p className="hero-text">Find guidance, learn practical skills, explore opportunities and connect with support that understands your needs.</p>
        <div className="hero-actions"><NavLink className="button" to={user ? "/dashboard" : "/register"}>{user ? "Go to dashboard" : "Find your next step"} <ArrowUpRight size={17}/></NavLink><a className="text-link" href="#how-it-works">See how it works <span>↓</span></a></div>
        <div className="hero-note"><ShieldCheck size={17}/> A respectful space. Clear limits. Human support matters.</div>
      </div>
      <div className="hero-art">
        <div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/>
        <div className="art-card card-main"><div className="art-icon"><HeartHandshake size={28}/></div><span className="art-kicker">YOUR NEXT STEP</span><h3>Start where you are.</h3><p>Small steps count. Explore support at your own pace.</p><div className="art-progress"><span/></div><small>One step at a time</small></div>
        <div className="floating-chip chip-top"><Sparkles size={15}/> Guidance that listens</div>
        <div className="floating-chip chip-bottom"><CheckCircle2 size={15}/> Find real-world support</div>
      </div>
    </section>
    <section className="trust-strip"><div><strong>Support</strong><span>without judgement</span></div><div><strong>Guidance</strong><span>at your own pace</span></div><div><strong>Connection</strong><span>to verified services</span></div></section>
    <section id="services" className="section"><div className="section-heading"><span className="eyebrow">WHAT YOU CAN FIND</span><h2>Support for the things<br/>that matter to you.</h2><p>One place to explore practical guidance and opportunities for your next chapter.</p></div>
      <div className="feature-grid">
        <Feature icon={<MessageCircle/>} title="AI support companion" text="A supportive starting point for questions, reflection and practical next steps. Not a replacement for professional care."/>
        <Feature icon={<Building2/>} title="Find organisations" text="Explore service providers and understand what they offer before requesting a referral."/>
        <Feature icon={<BookOpen/>} title="Learn and grow" text="Accessible information about well-being, personal development and seeking support."/>
        <Feature icon={<BriefcaseBusiness/>} title="Explore opportunities" text="Discover skills development, training and pathways towards employment."/>
      </div>
    </section>
    <section id="how-it-works" className="how-section"><div className="section-heading"><span className="eyebrow">HOW IT WORKS</span><h2>Your journey. Your pace.</h2></div><div className="steps"><div><b>01</b><h3>Tell us what you need</h3><p>Explore topics and identify the kind of support that may help.</p></div><div><b>02</b><h3>Explore your options</h3><p>Read resources, discover opportunities and find listed organisations.</p></div><div><b>03</b><h3>Choose a next step</h3><p>Where a verified provider is available, request a referral with your consent.</p></div></div></section>
    <section className="cta-band"><div><span className="eyebrow">YOU DESERVE TO BE HEARD</span><h2>Start with one small step.</h2><p>Explore support and opportunities at a pace that works for you.</p></div><NavLink className="button button-light" to={user ? "/dashboard" : "/register"}>Get started <ArrowUpRight size={17}/></NavLink></section>
  </div>;
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <article className="feature-card"><div className="feature-icon">{icon}</div><h3>{title}</h3><p>{text}</p><span className="feature-arrow">↗</span></article>;
}

function AuthPage({ mode, onAuth }: { mode: "login" | "register"; onAuth: () => Promise<void> }) {
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  async function submit(e: FormEvent) {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      await api.post(`/auth/${mode}`, mode === "register" ? { name, email, password } : { email, password });
      await onAuth(); navigate("/dashboard");
    } catch (err: any) { setError(err.response?.data?.error || "Something went wrong. Please try again."); }
    finally { setBusy(false); }
  }
  return <section className="auth-wrap"><div className="auth-aside"><span className="eyebrow">A PLACE TO BEGIN</span><h2>Every next step starts somewhere.</h2><p>YouthCare brings guidance, information and connections together in one supportive space.</p><div className="auth-quote">“You do not need to have everything figured out to take your next step.”</div></div><form className="auth-card" onSubmit={submit}><div className="feature-icon"><HeartHandshake/></div><h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1><p>{mode === "login" ? "Sign in to continue your YouthCare journey." : "Join YouthCare and explore support at your own pace."}</p>
    {mode === "register" && <label>Full name<input value={name} onChange={e=>setName(e.target.value)} required minLength={2} maxLength={80} placeholder="Your name"/></label>}
    <label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com"/></label>
    <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={mode === "register" ? 10 : 1} placeholder={mode === "register" ? "At least 10 characters" : "Your password"}/></label>
    {error && <div className="error-box">{error}</div>}<button className="button full-button" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"} <ArrowUpRight size={16}/></button>
    <div className="auth-switch">{mode === "login" ? "New to YouthCare?" : "Already have an account?"} <NavLink to={mode === "login" ? "/register" : "/login"}>{mode === "login" ? "Create an account" : "Sign in"}</NavLink></div>
    <small className="fine-print">Use only information you are comfortable sharing. This platform is not an emergency service.</small>
  </form></section>;
}

function PageHeader({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return <div className="page-header"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{text}</p></div>;
}

function Dashboard({ user }: { user: User }) {
  return <div className="page-container"><PageHeader eyebrow="YOUR SPACE" title={`Welcome, ${user.name.split(" ")[0]}.`} text="A place to explore support, learn something useful and take your next step."/>
    <div className="dashboard-grid">
      <NavLink to="/companion" className="dashboard-feature"><div className="feature-icon"><MessageCircle/></div><span className="eyebrow">START A CONVERSATION</span><h2>Talk through what's on your mind.</h2><p>Get supportive information and practical next steps from the AI companion.</p><span className="button">Open companion <ArrowUpRight size={16}/></span></NavLink>
      <div className="quick-panel"><h3>Your support toolkit</h3><QuickLink to="/organisations" icon={<Building2/>} title="Find an organisation" desc="Explore verified services"/><QuickLink to="/resources" icon={<BookOpen/>} title="Read resources" desc="Guidance and information"/><QuickLink to="/opportunities" icon={<BriefcaseBusiness/>} title="Explore opportunities" desc="Skills and career pathways"/><QuickLink to="/referrals" icon={<ClipboardList/>} title="My referrals" desc="Review your requests"/></div>
    </div>
    <div className="notice"><ShieldCheck size={19}/><div><strong>Your safety matters</strong><p>YouthCare is not an emergency or clinical service. If you are in immediate danger, contact local emergency services or go to the nearest emergency department.</p></div></div>
  </div>;
}

function QuickLink({ to, icon, title, desc }: { to: string; icon: React.ReactNode; title: string; desc: string }) {
  return <NavLink className="quick-link" to={to}><span className="quick-icon">{icon}</span><span><strong>{title}</strong><small>{desc}</small></span><ArrowUpRight size={16}/></NavLink>;
}

function Organisations({ user }: { user: User | null }) {
  const [items,setItems] = useState<Organisation[]>([]); const [query,setQuery] = useState(""); const [loading,setLoading] = useState(true);
  useEffect(()=>{ api.get("/organisations").then(r=>setItems(r.data.organisations)).catch(()=>setItems([])).finally(()=>setLoading(false)); },[]);
  const filtered = items.filter(o => `${o.name} ${o.description} ${o.location} ${o.services.join(" ")}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="page-container"><PageHeader eyebrow="FIND SUPPORT" title="You don't have to search alone." text="Explore organisations that have completed YouthCare's verification process."/>
    <div className="search-bar"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search services, locations or organisations"/></div>
    {loading ? <p>Loading organisations…</p> : filtered.length ? <div className="listing-grid">{filtered.map(o=><article className="listing-card" key={o._id}><div className="listing-top"><span className="tag">{o.location}</span><span className="verified"><ShieldCheck size={14}/> Verified</span></div><h3>{o.name}</h3><p>{o.description}</p><div className="chips">{o.services.map(s=><span key={s}>{s}</span>)}</div><small>{o.eligibility}</small>{user && <NavLink className="text-link" to="/referrals">Request a referral <ArrowUpRight size={15}/></NavLink>}</article>)}</div> : <div className="empty-state"><Building2/><h3>No verified organisations listed yet</h3><p>Listings appear here after direct verification. Demo entries are intentionally not presented as real providers.</p></div>}
  </div>;
}

function Resources() {
  const [items,setItems] = useState<Resource[]>([]);
  useEffect(()=>{ api.get("/resources").then(r=>setItems(r.data.resources)).catch(()=>setItems([])); },[]);
  return <div className="page-container"><PageHeader eyebrow="LEARN AND GROW" title="Useful knowledge, one step at a time." text="Practical information to help you explore well-being, peer support and personal development."/>
    <div className="resource-grid">{items.map(item=><article className="resource-card" key={item._id}><span className="tag">{item.category}</span><h3>{item.title}</h3><p>{item.summary}</p><details><summary>Read more</summary><p>{item.body}</p></details></article>)}</div>
    {!items.length && <p className="empty-state">Resources are being prepared. Please check back soon.</p>}
  </div>;
}

function Opportunities() {
  const [items,setItems] = useState<Opportunity[]>([]);
  useEffect(()=>{ api.get("/opportunities").then(r=>setItems(r.data.opportunities)).catch(()=>setItems([])); },[]);
  return <div className="page-container"><PageHeader eyebrow="OPPORTUNITIES" title="Explore what could come next." text="Discover pathways for learning, skills development and employment."/>
    <div className="listing-grid">{items.map(item=><article className="listing-card" key={item._id}><span className="tag">{item.category}</span><h3>{item.title}</h3><p>{item.description}</p><small>{item.provider} · {item.location}</small>{item.applicationUrl && <a className="text-link" href={item.applicationUrl} target="_blank" rel="noreferrer">Explore opportunity <ArrowUpRight size={15}/></a>}</article>)}</div>
    {!items.length && <p className="empty-state">No opportunities are currently listed.</p>}
  </div>;
}

function Companion() {
  const [messages,setMessages] = useState<{role:"assistant"|"user";text:string}[]>([{role:"assistant",text:"Hi. I'm the YouthCare companion. I can offer supportive information and help you think through practical next steps. I'm not a therapist or emergency service. What's on your mind?"}]);
  const [value,setValue] = useState(""); const [busy,setBusy] = useState(false); const [error,setError] = useState("");
  async function send(e: FormEvent) {
    e.preventDefault(); if(!value.trim() || busy) return;
    const message=value.trim(); setValue(""); setMessages(m=>[...m,{role:"user",text:message}]); setBusy(true); setError("");
    try { const {data}=await api.post("/ai/chat",{message}); setMessages(m=>[...m,{role:"assistant",text:data.reply}]); }
    catch(err:any) { setError(err.response?.data?.error || "The companion is unavailable right now."); }
    finally { setBusy(false); }
  }
  return <div className="page-container companion-page"><PageHeader eyebrow="AI SUPPORT COMPANION" title="A space to put things into words." text="Share what's on your mind and explore possible next steps without judgement."/>
    <div className="chat-shell"><div className="chat-top"><div className="feature-icon"><Sparkles/></div><div><strong>YouthCare Companion</strong><small>Supportive information · Not a clinician</small></div><span className="online-label">Available</span></div>
      <div className="chat-messages">{messages.map((m,i)=><div className={`chat-message ${m.role}`} key={i}><div>{m.text}</div></div>)}{busy && <div className="chat-message assistant"><div>Thinking through this…</div></div>}</div>
      {error && <div className="error-box chat-error">{error}</div>}
      <form className="chat-input" onSubmit={send}><input value={value} onChange={e=>setValue(e.target.value)} placeholder="Write a message…" maxLength={2000}/><button className="button" disabled={busy || !value.trim()} aria-label="Send message"><Send size={17}/></button></form>
      <div className="chat-disclaimer">Do not share passwords, addresses or other identifying details. This chat is not monitored for emergencies. If you may be in immediate danger, seek urgent human help.</div>
    </div>
  </div>;
}

function Referrals() {
  const [orgs,setOrgs]=useState<Organisation[]>([]); const [referrals,setReferrals]=useState<any[]>([]);
  const [organisationId,setOrganisationId]=useState(""); const [reason,setReason]=useState(""); const [consent,setConsent]=useState(false); const [message,setMessage]=useState("");
  async function load(){ const [o,r]=await Promise.all([api.get("/organisations"),api.get("/referrals/mine")]);setOrgs(o.data.organisations);setReferrals(r.data.referrals); }
  useEffect(()=>{void load().catch(()=>undefined)},[]);
  async function submit(e:FormEvent){e.preventDefault();setMessage("");try{await api.post("/referrals",{organisationId,reason,consentToShare:consent});setReason("");setConsent(false);setMessage("Your referral request has been recorded.");await load();}catch(err:any){setMessage(err.response?.data?.error||"Could not submit referral.");}}
  return <div className="page-container"><PageHeader eyebrow="YOUR REFERRALS" title="Choose a next step with consent." text="A referral request shares only the details you enter with the selected verified organisation. A request is not a confirmed appointment."/>
    <form className="form-panel" onSubmit={submit}><h3>Request a referral</h3><label>Verified organisation<select required value={organisationId} onChange={e=>setOrganisationId(e.target.value)}><option value="">Choose an organisation</option>{orgs.map(o=><option key={o._id} value={o._id}>{o.name}</option>)}</select></label><label>What support are you looking for?<textarea required minLength={10} maxLength={1200} value={reason} onChange={e=>setReason(e.target.value)} placeholder="Share only what is necessary for this request."/></label><label className="consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/> I consent to sharing the information above with this organisation for the purpose of this referral request.</label><button className="button" disabled={!consent || !organisationId}>Submit referral request <ArrowUpRight size={16}/></button>{message&&<p className="form-message">{message}</p>}</form>
    <div className="section-subhead"><h2>Your requests</h2></div><div className="referral-list">{referrals.map(r=><div className="referral-row" key={r._id}><div><strong>{r.organisation?.name || "Organisation"}</strong><small>{new Date(r.createdAt).toLocaleDateString()}</small></div><span className="tag">{r.status}</span></div>)}{!referrals.length&&<p>No referral requests yet.</p>}</div>
  </div>;
}

function Admin() {
  const [overview,setOverview]=useState<any>(null); const [name,setName]=useState(""); const [description,setDescription]=useState(""); const [location,setLocation]=useState("Zimbabwe"); const [status,setStatus]=useState("pending"); const [notice,setNotice]=useState("");
  useEffect(()=>{api.get("/admin/overview").then(r=>setOverview(r.data.counts)).catch(()=>undefined)},[]);
  async function create(e:FormEvent){e.preventDefault();try{await api.post("/admin/organisations",{name,description,location,verificationStatus:status,services:[],contactEmail:"",website:""});setName("");setDescription("");setNotice("Organisation listing created.");const r=await api.get("/admin/overview");setOverview(r.data.counts);}catch(err:any){setNotice(err.response?.data?.error||"Could not create listing.");}}
  return <div className="page-container"><PageHeader eyebrow="ADMINISTRATION" title="Platform overview." text="Manage platform content and maintain clear verification standards."/>
    <div className="stats-grid">{Object.entries(overview||{}).map(([k,v])=><div className="stat-card" key={k}><span>{k}</span><strong>{String(v)}</strong></div>)}</div>
    <form className="form-panel admin-form" onSubmit={create}><h3>Add an organisation listing</h3><p>New listings should remain pending until direct verification is completed.</p><label>Organisation name<input required value={name} onChange={e=>setName(e.target.value)}/></label><label>Description<textarea required minLength={10} value={description} onChange={e=>setDescription(e.target.value)}/></label><label>Location<input value={location} onChange={e=>setLocation(e.target.value)}/></label><label>Initial status<select value={status} onChange={e=>setStatus(e.target.value)}><option value="pending">Pending verification</option><option value="demo">Demonstration only</option></select></label><button className="button">Create listing</button>{notice&&<p>{notice}</p>}</form>
    <div className="notice"><ShieldCheck/><div><strong>Verification reminder</strong><p>Only mark an organisation as verified after confirming its services, eligibility, availability, referral process and safeguarding arrangements directly.</p></div></div>
  </div>;
}

export default App;
