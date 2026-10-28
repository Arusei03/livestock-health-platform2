import { useEffect, useMemo, useState } from "react";
import "./App.css";

/* ---------- constants & helpers ---------- */
const SPECIES = ["Cow", "Goat", "Sheep", "Pig", "Chicken", "Other"];
const EVENT_TYPES = ["Symptom", "Treatment"];
const SYMPTOMS = ["Cough", "Fever", "Diarrhoea", "Not eating", "Limping", "Skin lumps or sores", "Nose or eye discharge", "Weakness", "Other"];
const VACCINE_SUGGESTIONS = ["FMD", "Anthrax", "Black quarter", "Lumpy skin disease", "PPR", "Sheep and goat pox", "Newcastle disease", "Brucellosis", "Rabies"];
const SOON_DAYS = 14;

/* Risk rules: change these numbers to tune the detection. A vet should confirm the right values. */
const REPEAT_WINDOW = 14; // days: look-back for repeated sickness in one animal
const REPEAT_HIGH = 3;    // symptom reports in that window = high risk
const AREA_WINDOW = 7;    // days: look-back for symptoms across animals in one area
const AREA_HIGH = 3;      // animals with symptoms in the same area = high risk
const RECENT_DAYS = 7;    // a recent symptom or treatment = under observation

const LEVELS = ["ok", "watch", "high"];
const LEVEL_LABEL = { ok: "Healthy", watch: "Under observation", high: "High risk" };

const uid = () => Math.random().toString(36).slice(2, 10);
const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toLocaleDateString("en-CA"); };
const todayISO = () => addDays(0);
const daysUntil = (iso) => Math.round((new Date(iso + "T00:00:00") - new Date(new Date().toDateString())) / 864e5);
const ageDays = (iso) => -daysUntil(iso);
const fmt = (iso) => iso ? new Date(iso + "T00:00:00").toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "";

function ageOf(iso) {
  if (!iso) return "";
  const months = Math.max(0, Math.floor((Date.now() - new Date(iso + "T00:00:00")) / 2629800000));
  const y = Math.floor(months / 12), m = months % 12;
  return [y && `${y} yr`, (m || !y) && `${m} mo`].filter(Boolean).join(" ");
}

/* ----- vaccination schedule ----- */
function dueItems(a) {
  const latest = {};
  a.vaccinations.forEach((v) => {
    const k = v.vaccine.trim().toLowerCase();
    if (!latest[k] || v.dateGiven > latest[k].dateGiven) latest[k] = v;
  });
  return Object.values(latest)
    .filter((v) => v.nextDue)
    .map((v) => ({ vaccine: v.vaccine, nextDue: v.nextDue, days: daysUntil(v.nextDue) }))
    .sort((x, y) => x.days - y.days);
}

const dueClass = (days) => (days < 0 ? "overdue" : days <= SOON_DAYS ? "soon" : "ok");
const DUE_LABEL = { overdue: "Overdue", soon: "Due soon", ok: "Up to date" };

function dueText(days) {
  if (days < 0) return `${-days} day${days === -1 ? "" : "s"} overdue`;
  if (days === 0) return "Due today";
  return `Due in ${days} day${days === 1 ? "" : "s"}`;
}

/* ----- risk detection: runs over the event logs every time anything changes ----- */
const symptomsOf = (a) => a.health.filter((h) => h.type === "Symptom");
const symptomName = (h) => h.symptom || h.notes || "symptom";

function assess(animals) {
  const by = {};
  const alerts = [];
  animals.forEach((a) => { by[a.id] = { level: 0, reasons: [] }; });
  const raise = (id, level, reason) => {
    const r = by[id];
    if (level > r.level) r.level = level;
    if (!r.reasons.includes(reason)) r.reasons.push(reason);
  };

  // Rule 1: the same animal getting sick repeatedly in a short window
  animals.forEach((a) => {
    const s = symptomsOf(a);
    const inWindow = s.filter((h) => ageDays(h.date) <= REPEAT_WINDOW);
    if (inWindow.length >= REPEAT_HIGH) {
      raise(a.id, 2, `${inWindow.length} symptom reports in ${REPEAT_WINDOW} days`);
      alerts.push({
        key: `animal:${a.id}`, title: `${a.name} keeps getting sick`, area: a.area, animalIds: [a.id],
        detail: `${inWindow.length} symptom reports in the last ${REPEAT_WINDOW} days: ${inWindow.map(symptomName).join(", ")}.`,
      });
    } else if (inWindow.length === 2) {
      raise(a.id, 1, `2 symptom reports in ${REPEAT_WINDOW} days`);
    } else if (s.some((h) => ageDays(h.date) <= RECENT_DAYS)) {
      raise(a.id, 1, `Symptom reported in the last ${RECENT_DAYS} days`);
    }
    if (a.health.some((h) => h.type === "Treatment" && ageDays(h.date) <= RECENT_DAYS)) {
      raise(a.id, 1, `Treated in the last ${RECENT_DAYS} days`);
    }
  });

  // Rule 2: several animals showing symptoms in the same area
  const areas = {};
  animals.forEach((a) => {
    if (symptomsOf(a).some((h) => ageDays(h.date) <= AREA_WINDOW)) {
      const key = (a.area || "").trim() || "Unspecified area";
      (areas[key] = areas[key] || []).push(a);
    }
  });
  Object.entries(areas).forEach(([area, list]) => {
    if (list.length >= AREA_HIGH) {
      list.forEach((a) => raise(a.id, 2, `${list.length} animals in ${area} have shown symptoms this week`));
      alerts.push({
        key: `area:${area}`, title: `Possible outbreak in ${area}`, area, animalIds: list.map((a) => a.id),
        detail: `${list.length} animals showed symptoms in the last ${AREA_WINDOW} days: ${list.map((a) => a.name).join(", ")}.`,
      });
    } else if (list.length === 2) {
      list.forEach((a) => raise(a.id, 1, `2 animals in ${area} have shown symptoms this week`));
    }
  });

  alerts.sort((x, y) => (x.key.startsWith("area") ? -1 : 1) - (y.key.startsWith("area") ? -1 : 1));
  return { by, alerts };
}

function summaryText(alert, animals, user) {
  const lines = [`Livestock health alert from ${user.name} (${user.phone}), ${user.location}`, alert.title, alert.detail, ""];
  animals.filter((a) => alert.animalIds.includes(a.id)).forEach((a) => {
    lines.push(`${a.name} (${a.tag}, ${a.species}, area: ${a.area || "not set"})`);
    a.health.filter((h) => h.type === "Symptom" || h.type === "Treatment")
      .sort((x, y) => y.date.localeCompare(x.date)).slice(0, 5)
      .forEach((h) => lines.push(`  ${fmt(h.date)} ${h.type}: ${h.type === "Symptom" ? symptomName(h) : ""}${h.notes && h.symptom ? ` - ${h.notes}` : h.type === "Treatment" ? h.notes : ""}`));
  });
  return lines.join("\n");
}

function sampleAnimals() {
  return [
    {
      id: uid(), tag: "KE-001", name: "Daisy", species: "Cow", breed: "Friesian", sex: "Female", birthDate: "2022-03-12", area: "North paddock",
      vaccinations: [
        { id: uid(), vaccine: "FMD", dateGiven: addDays(-200), nextDue: addDays(-5) },
        { id: uid(), vaccine: "Anthrax", dateGiven: addDays(-100), nextDue: addDays(265) },
      ],
      health: [
        { id: uid(), type: "Symptom", date: addDays(-9), symptom: "Cough", notes: "" },
        { id: uid(), type: "Symptom", date: addDays(-5), symptom: "Not eating", notes: "Left most of her feed" },
        { id: uid(), type: "Treatment", date: addDays(-3), notes: "Antibiotic injection given by the vet" },
        { id: uid(), type: "Symptom", date: addDays(-2), symptom: "Fever", notes: "" },
      ],
    },
    {
      id: uid(), tag: "KE-002", name: "Billy", species: "Goat", breed: "Boer", sex: "Male", birthDate: "2024-01-20", area: "North paddock",
      vaccinations: [{ id: uid(), vaccine: "PPR", dateGiven: addDays(-170), nextDue: addDays(9) }],
      health: [{ id: uid(), type: "Symptom", date: addDays(-3), symptom: "Diarrhoea", notes: "Mild" }],
    },
    {
      id: uid(), tag: "KE-003", name: "Wooly", species: "Sheep", breed: "Dorper", sex: "Female", birthDate: "2023-07-02", area: "South paddock",
      vaccinations: [
        { id: uid(), vaccine: "Sheep and goat pox", dateGiven: addDays(-60), nextDue: addDays(305) },
        { id: uid(), vaccine: "Enterotoxaemia", dateGiven: addDays(-150), nextDue: addDays(30) },
      ],
      health: [{ id: uid(), type: "Treatment", date: addDays(-40), notes: "Deworming" }],
    },
  ];
}

/* ---------- storage & connectivity hooks ---------- */
function useStored(key, initial) {
  const [v, setV] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : typeof initial === "function" ? initial() : initial; }
    catch { return typeof initial === "function" ? initial() : initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* storage full or blocked */ } }, [key, v]);
  return [v, setV];
}

function useOnline() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  return online;
}

/* ---------- small shared components ---------- */
function Risk({ level }) {
  const k = LEVELS[level];
  return <span className={`badge badge-${k}`}>{LEVEL_LABEL[k]}</span>;
}

function Field({ label, children }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

function Modal({ title, onClose, children }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head"><h2>{title}</h2><button className="btn btn-ghost" onClick={onClose}>Close</button></div>
        {children}
      </div>
    </div>
  );
}

/* ---------- auth ---------- */
function Auth({ users, onSignup, onLogin }) {
  const [mode, setMode] = useState("signup");
  const [f, setF] = useState({ name: "", phone: "", location: "" });
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  function submit(e) {
    e.preventDefault();
    const phone = f.phone.replace(/\s+/g, "");
    if (!/^\+?\d{9,15}$/.test(phone)) return setErr("Enter a valid phone number, for example 0712345678.");
    if (mode === "signup") {
      if (!f.name.trim() || !f.location.trim()) return setErr("Fill in your name and location.");
      if (users.some((u) => u.phone === phone)) return setErr("This phone number already has an account. Log in instead.");
      onSignup({ name: f.name.trim(), phone, location: f.location.trim() });
    } else {
      const u = users.find((x) => x.phone === phone);
      if (!u) return setErr("No account found for this phone number. Sign up first.");
      onLogin(u.phone);
    }
  }

  return (
    <main className="auth">
      <h1>Herd Health Book</h1>
      <p className="lead">Log vaccines, treatments and symptoms. The app watches for patterns and warns you and your vet early.</p>
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={mode === "signup"} className={mode === "signup" ? "tab on" : "tab"} onClick={() => { setMode("signup"); setErr(""); }}>Sign up</button>
        <button role="tab" aria-selected={mode === "login"} className={mode === "login" ? "tab on" : "tab"} onClick={() => { setMode("login"); setErr(""); }}>Log in</button>
      </div>
      <form onSubmit={submit} className="stack">
        {mode === "signup" && <Field label="Your name"><input value={f.name} onChange={set("name")} autoComplete="name" /></Field>}
        <Field label="Phone number"><input value={f.phone} onChange={set("phone")} inputMode="tel" autoComplete="tel" /></Field>
        {mode === "signup" && <Field label="Location (village, town or county)"><input value={f.location} onChange={set("location")} /></Field>}
        {err && <p className="error" role="alert">{err}</p>}
        <button className="btn btn-primary" type="submit">{mode === "signup" ? "Create account" : "Log in"}</button>
      </form>
      <p className="hint">This demo saves data on this device only. Cognito will replace this login with a verified sign-in once the backend is connected.</p>
    </main>
  );
}

/* ---------- forms ---------- */
function AnimalForm({ initial, animals, onSave }) {
  const [f, setF] = useState(initial || { tag: "", name: "", species: "Cow", breed: "", sex: "Female", birthDate: "", area: "" });
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const areas = [...new Set(animals.map((a) => a.area).filter(Boolean))];
  function submit(e) {
    e.preventDefault();
    if (!f.tag.trim() || !f.name.trim()) return setErr("Tag or ID number and name are required.");
    if (!(f.area || "").trim()) return setErr("Enter the area or paddock where this animal stays. It helps spot outbreaks.");
    if (animals.some((a) => a.tag.toLowerCase() === f.tag.trim().toLowerCase() && a.id !== initial?.id)) return setErr("Another animal already uses this tag or ID.");
    if (f.birthDate && f.birthDate > todayISO()) return setErr("Birth date cannot be in the future.");
    onSave({ ...f, tag: f.tag.trim(), name: f.name.trim(), breed: f.breed.trim(), area: f.area.trim() });
  }
  return (
    <form onSubmit={submit} className="stack">
      <Field label="Tag or ID number"><input value={f.tag} onChange={set("tag")} /></Field>
      <Field label="Name"><input value={f.name} onChange={set("name")} /></Field>
      <Field label="Species"><select value={f.species} onChange={set("species")}>{SPECIES.map((s) => <option key={s}>{s}</option>)}</select></Field>
      <Field label="Breed"><input value={f.breed} onChange={set("breed")} /></Field>
      <Field label="Sex"><select value={f.sex} onChange={set("sex")}><option>Female</option><option>Male</option></select></Field>
      <Field label="Birth date"><input type="date" value={f.birthDate} onChange={set("birthDate")} max={todayISO()} /></Field>
      <Field label="Area or paddock"><input list="areas" value={f.area || ""} onChange={set("area")} /></Field>
      <datalist id="areas">{areas.map((a) => <option key={a} value={a} />)}</datalist>
      {err && <p className="error" role="alert">{err}</p>}
      <button className="btn btn-primary" type="submit">Save animal</button>
    </form>
  );
}

function VaccForm({ initial, onSave }) {
  const [f, setF] = useState(initial || { vaccine: "", dateGiven: todayISO(), nextDue: "" });
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  function submit(e) {
    e.preventDefault();
    if (!f.vaccine.trim() || !f.dateGiven) return setErr("Vaccine name and date given are required.");
    if (f.nextDue && f.nextDue <= f.dateGiven) return setErr("Next due date must be after the date given.");
    onSave({ ...f, vaccine: f.vaccine.trim() });
  }
  return (
    <form onSubmit={submit} className="stack">
      <Field label="Vaccine name"><input list="vaccines" value={f.vaccine} onChange={set("vaccine")} /></Field>
      <datalist id="vaccines">{VACCINE_SUGGESTIONS.map((v) => <option key={v} value={v} />)}</datalist>
      <Field label="Date given"><input type="date" value={f.dateGiven} onChange={set("dateGiven")} max={todayISO()} /></Field>
      <Field label="Next due date"><input type="date" value={f.nextDue} onChange={set("nextDue")} /></Field>
      {err && <p className="error" role="alert">{err}</p>}
      <button className="btn btn-primary" type="submit">Save vaccination</button>
    </form>
  );
}

function EventForm({ initial, onSave }) {
  const [f, setF] = useState(initial || { type: "Symptom", date: todayISO(), symptom: SYMPTOMS[0], notes: "" });
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const isSymptom = f.type === "Symptom";
  function submit(e) {
    e.preventDefault();
    if (!f.date) return setErr("Choose a date.");
    if (!isSymptom && !f.notes.trim()) return setErr("Write what treatment was given.");
    const out = { ...f, notes: f.notes.trim() };
    if (!isSymptom) delete out.symptom;
    onSave(out);
  }
  return (
    <form onSubmit={submit} className="stack">
      <Field label="What happened?">
        <select value={f.type} onChange={set("type")}>{EVENT_TYPES.map((t) => <option key={t} value={t}>{t === "Symptom" ? "I noticed a symptom" : "I gave a treatment"}</option>)}</select>
      </Field>
      <Field label="Date"><input type="date" value={f.date} onChange={set("date")} max={todayISO()} /></Field>
      {isSymptom && <Field label="Symptom"><select value={f.symptom || SYMPTOMS[0]} onChange={set("symptom")}>{SYMPTOMS.map((s) => <option key={s}>{s}</option>)}</select></Field>}
      <Field label={isSymptom ? "Notes (optional)" : "Treatment given"}><textarea rows={3} value={f.notes} onChange={set("notes")} /></Field>
      {err && <p className="error" role="alert">{err}</p>}
      <button className="btn btn-primary" type="submit">Save</button>
    </form>
  );
}

/* ---------- screens ---------- */
function Home({ animals, risk, go, openAdd, user, onLogout }) {
  const counts = [0, 0, 0];
  animals.forEach((a) => counts[risk.by[a.id].level]++);
  const urgent = animals.flatMap((a) => dueItems(a).filter((d) => d.days <= SOON_DAYS).map((d) => ({ ...d, animal: a }))).sort((x, y) => x.days - y.days).slice(0, 3);
  const tiles = [[2, "High risk"], [1, "Under observation"], [0, "Healthy"]];
  return (
    <section className="stack">
      <h1>Hello, {user.name.split(" ")[0]}</h1>
      <p className="lead">{animals.length} animal{animals.length === 1 ? "" : "s"} on your farm in {user.location}.</p>
      <div className="tiles">
        {tiles.map(([lvl, label]) => (
          <button key={lvl} className={`tile tile-${LEVELS[lvl]}`} onClick={() => go("animals", null, { status: LEVELS[lvl] })}>
            <strong>{counts[lvl]}</strong><span>{label}</span>
          </button>
        ))}
      </div>
      {risk.alerts.length > 0 && (
        <>
          <h2>Flagged for your vet</h2>
          <ul className="list">
            {risk.alerts.slice(0, 2).map((al) => (
              <li key={al.key}><button className="row row-high" onClick={() => go("alerts")}>
                <span><b>{al.title}</b><small>{al.detail}</small></span><span className="badge badge-high">High risk</span>
              </button></li>
            ))}
          </ul>
        </>
      )}
      <h2>Vaccinations to plan</h2>
      {urgent.length === 0 ? <p className="empty">No vaccinations are due in the next {SOON_DAYS} days.</p> : (
        <ul className="list">
          {urgent.map((d, i) => (
            <li key={i}><button className="row" onClick={() => go("detail", d.animal.id)}>
              <span><b>{d.animal.name}</b> needs {d.vaccine}<small>{dueText(d.days)} · {fmt(d.nextDue)}</small></span>
              <span className={`badge badge-${dueClass(d.days)}`}>{DUE_LABEL[dueClass(d.days)]}</span>
            </button></li>
          ))}
        </ul>
      )}
      <button className="btn btn-primary" onClick={openAdd}>Add an animal</button>
      <button className="link signout" onClick={onLogout}>Log out of this phone</button>
    </section>
  );
}

function AnimalList({ animals, risk, filters, setFilters, go, openAdd, loadSample }) {
  const vaccineNames = useMemo(() => [...new Set(animals.flatMap((a) => a.vaccinations.map((v) => v.vaccine)))].sort(), [animals]);
  const shown = animals.filter((a) => {
    const q = filters.q.trim().toLowerCase();
    if (q && !`${a.name} ${a.tag} ${a.breed} ${a.area || ""}`.toLowerCase().includes(q)) return false;
    if (filters.species && a.species !== filters.species) return false;
    if (filters.vaccine && !a.vaccinations.some((v) => v.vaccine === filters.vaccine)) return false;
    if (filters.status && LEVELS[risk.by[a.id].level] !== filters.status) return false;
    return true;
  });
  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });
  const active = filters.q || filters.species || filters.vaccine || filters.status;
  return (
    <section className="stack">
      <h1>Animals</h1>
      <input className="search" type="search" placeholder="Search by name, tag, breed or area" value={filters.q} onChange={set("q")} aria-label="Search animals" />
      <div className="filters">
        <select value={filters.species} onChange={set("species")} aria-label="Filter by species"><option value="">All species</option>{SPECIES.map((s) => <option key={s}>{s}</option>)}</select>
        <select value={filters.vaccine} onChange={set("vaccine")} aria-label="Filter by vaccine"><option value="">Any vaccine</option>{vaccineNames.map((v) => <option key={v}>{v}</option>)}</select>
        <select value={filters.status} onChange={set("status")} aria-label="Filter by health status"><option value="">Any health status</option><option value="high">High risk</option><option value="watch">Under observation</option><option value="ok">Healthy</option></select>
      </div>
      {active && <button className="btn btn-ghost" onClick={() => setFilters({ q: "", species: "", vaccine: "", status: "" })}>Clear filters</button>}
      {animals.length === 0 ? (
        <div className="empty"><p>No animals yet. Add your first one, or load three sample animals to see how the app works.</p><button className="btn" onClick={loadSample}>Load sample animals</button></div>
      ) : shown.length === 0 ? <p className="empty">No animals match these filters.</p> : (
        <ul className="list">
          {shown.map((a) => {
            const r = risk.by[a.id];
            return (
              <li key={a.id}><button className="row" onClick={() => go("detail", a.id)}>
                <span><b>{a.name}</b> <em>{a.tag}</em>
                  <small>{a.species}{a.breed && ` · ${a.breed}`} · {a.sex}{a.area && ` · ${a.area}`}</small>
                  {r.level > 0 && <small className="why">{r.reasons[0]}</small>}
                </span>
                <Risk level={r.level} />
              </button></li>
            );
          })}
        </ul>
      )}
      <button className="btn btn-primary" onClick={openAdd}>Add an animal</button>
    </section>
  );
}

function Alerts({ animals, risk, notified, markNotified, copySummary, go }) {
  const items = animals.flatMap((a) => dueItems(a).filter((d) => d.days <= 30).map((d) => ({ ...d, animal: a }))).sort((x, y) => x.days - y.days);
  return (
    <section className="stack">
      <h1>Alerts</h1>
      <h2>Flagged for your vet</h2>
      <p className="lead">The app checks your logs after every entry. It flags an animal that falls sick repeatedly in {REPEAT_WINDOW} days, or {AREA_HIGH} or more animals with symptoms in one area within {AREA_WINDOW} days.</p>
      {risk.alerts.length === 0 ? <p className="empty">No high-risk patterns found. Keep logging symptoms and treatments as they happen.</p> : (
        <ul className="list">
          {risk.alerts.map((al) => (
            <li key={al.key} className="alert-card">
              <div className="head"><b>{al.title}</b><span className="badge badge-high">High risk</span></div>
              <p>{al.detail}</p>
              <p className="hint">{notified[al.key] ? `Marked as sent to the vet on ${fmt(notified[al.key])}.` : "Not yet sent to a vet."}</p>
              <div className="actions">
                <button className="btn btn-primary" onClick={() => copySummary(al)}>Copy summary for vet</button>
                <button className="btn" onClick={() => markNotified(al.key)} disabled={!!notified[al.key]}>{notified[al.key] ? "Vet informed" : "Mark vet informed"}</button>
              </div>
              <div className="tl-actions">{al.animalIds.map((id) => { const a = animals.find((x) => x.id === id); return a && <button key={id} className="link" onClick={() => go("detail", id)}>Open {a.name}</button>; })}</div>
            </li>
          ))}
        </ul>
      )}
      <h2>Vaccination reminders</h2>
      {items.length === 0 ? <p className="empty">No vaccinations are due in the next 30 days.</p> : (
        <ul className="list">
          {items.map((d, i) => (
            <li key={i}><button className="row" onClick={() => go("detail", d.animal.id)}>
              <span><b>{d.vaccine}</b> for {d.animal.name}<small>{dueText(d.days)} · {fmt(d.nextDue)}</small></span>
              <span className={`badge badge-${dueClass(d.days)}`}>{DUE_LABEL[dueClass(d.days)]}</span>
            </button></li>
          ))}
        </ul>
      )}
      <p className="hint">SMS and email reminders to you and your vet will be added once the backend is connected.</p>
    </section>
  );
}

function Detail({ animal, risk, go, edit, remove, openModal, removeRecord }) {
  if (!animal) return <section className="stack"><p className="empty">This animal was not found.</p><button className="btn" onClick={() => go("animals")}>Back to animals</button></section>;
  const r = risk.by[animal.id];
  const timeline = [
    ...animal.vaccinations.map((v) => ({ kind: "vacc", id: v.id, date: v.dateGiven, title: `Vaccinated: ${v.vaccine}`, detail: v.nextDue ? `Next due ${fmt(v.nextDue)}` : "No next date set", rec: v })),
    ...animal.health.map((h) => ({ kind: "event", id: h.id, date: h.date, title: h.type === "Symptom" ? `Symptom: ${symptomName(h)}` : h.type, detail: h.symptom ? h.notes : h.type === "Symptom" ? "" : h.notes, rec: h, type: h.type })),
  ].sort((a, b) => b.date.localeCompare(a.date));
  const due = dueItems(animal);
  return (
    <section className="stack">
      <button className="btn btn-ghost back" onClick={() => go("animals")}>Back to animals</button>
      <div className="head">
        <h1>{animal.name}</h1>
        <Risk level={r.level} />
      </div>
      <p className="lead">{animal.tag} · {animal.species}{animal.breed && ` · ${animal.breed}`} · {animal.sex}{animal.area && ` · ${animal.area}`}{animal.birthDate && ` · born ${fmt(animal.birthDate)} (${ageOf(animal.birthDate)})`}</p>
      {r.level > 0 && (
        <div className={`banner banner-${LEVELS[r.level]}`}>
          <b>{r.level === 2 ? "Flagged as high risk. Contact your vet." : "Keep watching this animal."}</b>
          <ul>{r.reasons.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
      )}
      {due.length > 0 && (
        <ul className="list">
          {due.map((d) => <li key={d.vaccine} className={`due due-${dueClass(d.days)}`}><b>{d.vaccine}</b><small>{dueText(d.days)} · {fmt(d.nextDue)}</small></li>)}
        </ul>
      )}
      <div className="actions">
        <button className="btn btn-primary" onClick={() => openModal({ type: "event" })}>Log symptom or treatment</button>
        <button className="btn" onClick={() => openModal({ type: "vacc" })}>Log vaccination</button>
        <button className="btn" onClick={edit}>Edit animal</button>
        <button className="btn btn-danger" onClick={remove}>Delete animal</button>
      </div>
      <h2>History</h2>
      {timeline.length === 0 ? <p className="empty">No records yet. Log the first vaccination, symptom or treatment.</p> : (
        <ol className="timeline">
          {timeline.map((t) => (
            <li key={t.id} className={`tl tl-${t.kind === "vacc" ? "vacc" : t.type === "Symptom" ? "symptom" : "treat"}`}>
              <time>{fmt(t.date)}</time>
              <b>{t.title}</b>
              {t.detail && <p>{t.detail}</p>}
              <div className="tl-actions">
                <button className="link" onClick={() => openModal({ type: t.kind, record: t.rec })}>Edit</button>
                <button className="link link-danger" onClick={() => removeRecord(t.kind, t.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/* ---------- main tracker ---------- */
function Tracker({ user, onLogout }) {
  const [data, setData] = useStored(`lvt:data:${user.phone}`, () => ({ animals: sampleAnimals(), pending: 0, notified: {} }));
  const [view, setView] = useState({ page: "home", id: null });
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const [filters, setFilters] = useState({ q: "", species: "", vaccine: "", status: "" });
  const online = useOnline();
  const { animals } = data;
  const notified = data.notified || {};
  const risk = assess(animals); // re-scanned on every render, so any new log updates every status

  const notify = (m, ms = 2800) => { setToast(m); setTimeout(() => setToast(""), ms); };
  const go = (page, id = null, f) => { if (f) setFilters({ q: "", species: "", vaccine: "", status: "", ...f }); setView({ page, id }); window.scrollTo(0, 0); };
  const commit = (fn) => setData((d) => ({ ...d, animals: fn(d.animals), pending: online ? d.pending : d.pending + 1 }));
  const patch = (id, fn) => commit((list) => list.map((a) => (a.id === id ? fn(a) : a)));

  // When the connection returns, push queued changes to the server.
  // TODO: replace this placeholder with a real call to your API Gateway endpoint.
  useEffect(() => {
    if (online && data.pending > 0) {
      setData((d) => ({ ...d, pending: 0 }));
      notify("Back online. Your changes are synced.");
    }
  }, [online]); // eslint-disable-line react-hooks/exhaustive-deps

  const current = animals.find((a) => a.id === view.id);
  const attention = risk.alerts.length + animals.reduce((n, a) => n + dueItems(a).filter((d) => d.days <= SOON_DAYS).length, 0);

  function saveAnimal(values) {
    if (modal.record) { patch(modal.record.id, (a) => ({ ...a, ...values })); notify("Animal updated."); }
    else { const a = { ...values, id: uid(), vaccinations: [], health: [] }; commit((l) => [...l, a]); notify("Animal added."); go("detail", a.id); }
    setModal(null);
  }
  function saveVacc(values) {
    const rec = modal.record;
    patch(current.id, (a) => ({ ...a, vaccinations: rec ? a.vaccinations.map((v) => (v.id === rec.id ? { ...v, ...values } : v)) : [...a.vaccinations, { ...values, id: uid() }] }));
    notify("Vaccination saved."); setModal(null);
  }
  function saveEvent(values) {
    const rec = modal.record;
    const nextHealth = rec ? current.health.map((h) => (h.id === rec.id ? { ...h, ...values } : h)) : [...current.health, { ...values, id: uid() }];
    const before = new Set(risk.alerts.map((x) => x.key));
    const fresh = assess(animals.map((a) => (a.id === current.id ? { ...a, health: nextHealth } : a))).alerts.find((x) => !before.has(x.key));
    patch(current.id, (a) => ({ ...a, health: nextHealth }));
    if (fresh) notify(`High risk flagged: ${fresh.title}. Open Alerts to tell your vet.`, 6000); else notify("Saved.");
    setModal(null);
  }
  function removeAnimal() {
    if (!window.confirm(`Delete ${current.name} and all of their records? This cannot be undone.`)) return;
    commit((l) => l.filter((a) => a.id !== current.id)); notify("Animal deleted."); go("animals");
  }
  function removeRecord(kind, id) {
    if (!window.confirm("Delete this record? This cannot be undone.")) return;
    patch(current.id, (a) => (kind === "vacc" ? { ...a, vaccinations: a.vaccinations.filter((v) => v.id !== id) } : { ...a, health: a.health.filter((h) => h.id !== id) }));
    notify("Record deleted.");
  }
  const markNotified = (key) => setData((d) => ({ ...d, notified: { ...(d.notified || {}), [key]: todayISO() } }));
  async function copySummary(al) {
    try { await navigator.clipboard.writeText(summaryText(al, animals, user)); notify("Summary copied. Paste it into SMS or WhatsApp for your vet.", 4000); }
    catch { notify("Could not copy. Try again or write the details down.", 4000); }
  }

  const nav = [["home", "Home"], ["animals", "Animals"], ["alerts", "Alerts"]];
  const activeTab = view.page === "detail" ? "animals" : view.page;

  return (
    <div className="app">
      <header className="top">
        <span className="brand">Herd Health Book</span>
        <span className={online ? "net net-on" : "net net-off"}>{online ? "Online" : `Offline${data.pending ? ` · ${data.pending} to sync` : ""}`}</span>
      </header>
      <main className="page">
        {view.page === "home" && <Home animals={animals} risk={risk} go={go} user={user} onLogout={() => window.confirm("Log out of this phone? You will need to sign in again.") && onLogout()} openAdd={() => setModal({ type: "animal" })} />}
        {view.page === "animals" && <AnimalList animals={animals} risk={risk} filters={filters} setFilters={setFilters} go={go} openAdd={() => setModal({ type: "animal" })} loadSample={() => { commit((l) => [...l, ...sampleAnimals().filter((s) => !l.some((a) => a.tag === s.tag))]); notify("Sample animals added."); }} />}
        {view.page === "alerts" && <Alerts animals={animals} risk={risk} notified={notified} markNotified={markNotified} copySummary={copySummary} go={go} />}
        {view.page === "detail" && <Detail animal={current} risk={risk} go={go} edit={() => setModal({ type: "animal", record: current })} remove={removeAnimal} openModal={(m) => setModal(m)} removeRecord={removeRecord} />}
      </main>
      <nav className="bottom" aria-label="Main">
        {nav.map(([k, label]) => (
          <button key={k} className={activeTab === k ? "nav on" : "nav"} aria-current={activeTab === k ? "page" : undefined} onClick={() => go(k)}>
            {label}{k === "alerts" && attention > 0 && <i className="count">{attention}</i>}
          </button>
        ))}
      </nav>
      {toast && <div className="toast" role="status">{toast}</div>}
      {modal?.type === "animal" && <Modal title={modal.record ? "Edit animal" : "Add an animal"} onClose={() => setModal(null)}><AnimalForm initial={modal.record} animals={animals} onSave={saveAnimal} /></Modal>}
      {modal?.type === "vacc" && <Modal title={modal.record ? "Edit vaccination" : "Log vaccination"} onClose={() => setModal(null)}><VaccForm initial={modal.record} onSave={saveVacc} /></Modal>}
      {modal?.type === "event" && <Modal title={modal.record ? "Edit entry" : "Log symptom or treatment"} onClose={() => setModal(null)}><EventForm initial={modal.record} onSave={saveEvent} /></Modal>}
    </div>
  );
}

/* ---------- root ---------- */
export default function App() {
  const [users, setUsers] = useStored("lvt:users", []);
  const [session, setSession] = useStored("lvt:session", null);
  const user = users.find((u) => u.phone === session);
  if (!user) return <Auth users={users} onSignup={(u) => { setUsers([...users, u]); setSession(u.phone); }} onLogin={setSession} />;
  return <Tracker key={user.phone} user={user} onLogout={() => setSession(null)} />;
}
