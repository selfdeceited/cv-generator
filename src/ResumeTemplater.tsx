import { useState, useEffect, type ChangeEvent } from "react";
import Markdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "./ResumeTemplater.css";

const STORAGE_KEY = "resume-fields";

function getForkKey(fork: string) {
  return `${STORAGE_KEY}__${fork}`;
}

function getAvailableForks(): string[] {
  const prefix = `${STORAGE_KEY}__`;
  return Object.keys(localStorage)
    .filter((k) => k.startsWith(prefix))
    .map((k) => k.slice(prefix.length));
}

interface ResumeFields {
  name: string;
  email: string;
  location: string;
  linkedinLink: string;
  githubLink: string;
  title: string;
  whoAmI: string;
  aboutIt: string;
}

interface WorkEntry {
  role: string;
  company: string;
  location: string;
  dateRange: string;
  employmentType: string;
  description: string;
}

interface EducationEntry {
  institution: string;
  degree: string;
  dateRange: string;
}

interface AchievementEntry {
  title: string;
  description: string;
}

const initialFields: ResumeFields = {
  name: "",
  email: "",
  location: "",
  linkedinLink: "",
  githubLink: "",
  title: "",
  whoAmI: "",
  aboutIt: "",
};

const blankWork = (): WorkEntry => ({
  role: "",
  company: "",
  location: "",
  dateRange: "",
  employmentType: "",
  description: "",
});

const blankEducation = (): EducationEntry => ({
  institution: "",
  degree: "",
  dateRange: "",
});

const blankAchievement = (): AchievementEntry => ({
  title: "",
  description: "",
});

function IconEmail() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconLocation() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconLinkedIn() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function IconGitHub() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

interface PreviewIdentityProps {
  name: string;
  title: string;
  email: string;
  location: string;
  linkedinLink: string;
  githubLink: string;
  photo: string;
}

function PreviewIdentity({ name, title, email, location, linkedinLink, githubLink, photo }: PreviewIdentityProps) {
  return (
    <div className="cv-identity">
      <div>
        <h1>{name || <em style={{ opacity: 0.4 }}>Name</em>}</h1>
        <h2>{title || <em style={{ opacity: 0.4 }}>Title</em>}</h2>
        <div className="cv-links">
          {location && (
            <span className="cv-link-item">
              <IconLocation /> {location}
            </span>
          )}
          {email && (
            <a href={`mailto:${email}`} className="cv-link-item">
              <IconEmail /> {email}
            </a>
          )}
          {linkedinLink && (
            <a href={linkedinLink} target="_blank" rel="noreferrer" className="cv-link-item">
              <IconLinkedIn /> LinkedIn
            </a>
          )}
          {githubLink && (
            <a href={githubLink} target="_blank" rel="noreferrer" className="cv-link-item">
              <IconGitHub /> GitHub
            </a>
          )}
        </div>
      </div>
      {photo && <img src={photo} alt="Profile" className="cv-photo" />}
    </div>
  );
}

function PreviewText({ value }: { value: string }) {
  if (!value) return <em style={{ opacity: 0.4 }}>—</em>;
  return <Markdown remarkPlugins={[remarkBreaks]}>{value}</Markdown>;
}

function loadFromStorage(storageKey = STORAGE_KEY): {
  fields: ResumeFields;
  workEntries: WorkEntry[];
  educationEntries: EducationEntry[];
  achievementEntries: AchievementEntry[];
  hardSkills: string;
  softSkills: string;
  otherSkills: string;
  photo: string;
} {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        fields: { ...initialFields, ...parsed.fields },
        workEntries: parsed.workEntries ?? [],
        educationEntries: parsed.educationEntries ?? [],
        achievementEntries: parsed.achievementEntries ?? [],
        hardSkills: parsed.hardSkills ?? parsed.skills ?? "",
        softSkills: parsed.softSkills ?? "",
        otherSkills: parsed.otherSkills ?? "",
        photo: parsed.photo ?? "",
      };
    }
  } catch {
    // ignore parse errors
  }
  return { fields: initialFields, workEntries: [], educationEntries: [], achievementEntries: [], hardSkills: "", softSkills: "", otherSkills: "", photo: "" };
}

export function ResumeTemplater() {
  const initial = loadFromStorage();
  const [fields, setFields] = useState<ResumeFields>(initial.fields);
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>(initial.workEntries);
  const [educationEntries, setEducationEntries] = useState<EducationEntry[]>(initial.educationEntries);
  const [achievementEntries, setAchievementEntries] = useState<AchievementEntry[]>(initial.achievementEntries);
  const [hardSkills, setHardSkills] = useState<string>(initial.hardSkills);
  const [softSkills, setSoftSkills] = useState<string>(initial.softSkills);
  const [otherSkills, setOtherSkills] = useState<string>(initial.otherSkills);
  const [photo, setPhoto] = useState<string>(initial.photo);
  const [isEditing, setIsEditing] = useState(true);
  const [saved, setSaved] = useState(false);

  const [activeFork, setActiveFork] = useState<string | null>(null);
  const [forks, setForks] = useState<string[]>(() => getAvailableForks());
  const [forkSelected, setForkSelected] = useState(() => getAvailableForks().length === 0);
  const [forkInput, setForkInput] = useState("");
  const [showForkInput, setShowForkInput] = useState(false);

  const [readOnly, setReadOnly] = useState(false);
  const [loading, setLoading] = useState(() => Boolean(new URLSearchParams(window.location.search).get("data")));

  useEffect(() => {
    const url = new URLSearchParams(window.location.search).get("data");
    if (!url) return;
    const unescape = (s: string) => s.replace(/\\n/g, "\n");
    const unescapeStrings = <T,>(obj: T): T => {
      if (typeof obj === "string") return unescape(obj) as T;
      if (Array.isArray(obj)) return obj.map(unescapeStrings) as T;
      if (obj && typeof obj === "object") {
        return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, unescapeStrings(v)])) as T;
      }
      return obj;
    };
    fetch(url)
      .then((r) => r.json())
      .then((raw) => {
        const parsed = unescapeStrings(raw);
        setFields({ ...initialFields, ...parsed.fields });
        setWorkEntries(parsed.workEntries ?? []);
        setEducationEntries(parsed.educationEntries ?? []);
        setAchievementEntries(parsed.achievementEntries ?? []);
        setHardSkills(parsed.hardSkills ?? "");
        setSoftSkills(parsed.softSkills ?? "");
        setOtherSkills(parsed.otherSkills ?? "");
        setPhoto(parsed.photo ?? "");
        setReadOnly(true);
        setIsEditing(false);
        setForkSelected(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange =
    (key: keyof ResumeFields) =>
    (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      setFields((prev) => ({ ...prev, [key]: e.target.value }));
      setSaved(false);
    };

  const handleMdChange =
    (key: keyof ResumeFields) => (value: string | undefined) => {
      setFields((prev) => ({ ...prev, [key]: value ?? "" }));
      setSaved(false);
    };

  const handleWorkChange = (index: number, key: keyof WorkEntry, value: string) => {
    setWorkEntries((prev) => prev.map((e, i) => i === index ? { ...e, [key]: value } : e));
    setSaved(false);
  };

  const handleEducationChange = (index: number, key: keyof EducationEntry, value: string) => {
    setEducationEntries((prev) => prev.map((e, i) => i === index ? { ...e, [key]: value } : e));
    setSaved(false);
  };

  const handleAchievementChange = (index: number, key: keyof AchievementEntry, value: string) => {
    setAchievementEntries((prev) => prev.map((e, i) => i === index ? { ...e, [key]: value } : e));
    setSaved(false);
  };


  const currentData = () => ({ fields, workEntries, educationEntries, achievementEntries, hardSkills, softSkills, otherSkills, photo });

  const handleSave = () => {
    const key = activeFork ? getForkKey(activeFork) : STORAGE_KEY;
    localStorage.setItem(key, JSON.stringify(currentData()));
    setSaved(true);
  };

  const switchFork = (fork: string | null) => {
    const key = fork ? getForkKey(fork) : STORAGE_KEY;
    const data = loadFromStorage(key);
    setFields(data.fields);
    setWorkEntries(data.workEntries);
    setEducationEntries(data.educationEntries);
    setAchievementEntries(data.achievementEntries);
    setHardSkills(data.hardSkills);
    setSoftSkills(data.softSkills);
    setOtherSkills(data.otherSkills);
    setPhoto(data.photo);
    setActiveFork(fork);
    setForkSelected(true);
    setSaved(false);
  };

  const createFork = () => {
    const name = forkInput.trim();
    if (!name) return;
    const key = getForkKey(name);
    localStorage.setItem(key, JSON.stringify(currentData()));
    setForks((prev) => [...prev.filter((f) => f !== name), name]);
    setActiveFork(name);
    setForkInput("");
    setShowForkInput(false);
    setSaved(true);
  };

  const toTags = (s: string) => s.split(",").map((t) => t.trim()).filter(Boolean);
  const hardTags = toTags(hardSkills);
  const softTags = toTags(softSkills);
  const otherTags = toTags(otherSkills);

  if (loading) {
    return <div className="cv"><p style={{ padding: "2rem", color: "#888" }}>Loading…</p></div>;
  }

  if (!forkSelected) {
    return (
      <div className="cv">
        <div className="cv-fork-picker">
          <h2>Select Resume</h2>
          <div className="cv-fork-options">
            <button className="cv-fork-option" onClick={() => switchFork(null)}>Base</button>
            {forks.map((f) => (
              <button key={f} className="cv-fork-option" onClick={() => switchFork(f)}>{f}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cv">
      <div className="cv-header">
        {readOnly ? (
          <button onClick={() => window.print()}>Print</button>
        ) : (
          <>
            {isEditing && <h1>Resume Generator</h1>}
            <span className="cv-fork-badge">{activeFork ?? "Base"}</span>
            <button onClick={() => setForkSelected(false)}>Switch</button>
            <button onClick={() => setIsEditing((prev) => !prev)}>
              {isEditing ? "Preview" : "Edit"}
            </button>
            <button onClick={handleSave}>Save</button>
            {saved && <span>Saved</span>}
            {!isEditing && <button onClick={() => window.print()}>Print</button>}
            {isEditing && (
              showForkInput ? (
                <span className="cv-fork-create">
                  <input
                    value={forkInput}
                    onChange={(e) => setForkInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && createFork()}
                    placeholder="Company name"
                    autoFocus
                  />
                  <button onClick={createFork}>Create</button>
                  <button onClick={() => { setShowForkInput(false); setForkInput(""); }}>Cancel</button>
                </span>
              ) : (
                <button onClick={() => setShowForkInput(true)}>Fork</button>
              )
            )}
          </>
        )}
      </div>

      {isEditing ? (
        <div className="cv-fields">
          {/* Identity */}
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" type="text" value={fields.name} onChange={handleChange("name")} placeholder="Jane Doe" />
          </div>
          <div className="field">
            <label htmlFor="title">Title</label>
            <input id="title" type="text" value={fields.title} onChange={handleChange("title")} placeholder="Senior Software Engineer" />
          </div>
          <div className="field">
            <label htmlFor="location">Location</label>
            <input id="location" type="text" value={fields.location} onChange={handleChange("location")} placeholder="Tbilisi, Georgia" />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={fields.email} onChange={handleChange("email")} placeholder="you@example.com" />
          </div>
          <div className="field">
            <label htmlFor="linkedinLink">LinkedIn</label>
            <input id="linkedinLink" type="url" value={fields.linkedinLink} onChange={handleChange("linkedinLink")} placeholder="https://linkedin.com/in/you" />
          </div>
          <div className="field">
            <label htmlFor="githubLink">GitHub</label>
            <input id="githubLink" type="url" value={fields.githubLink} onChange={handleChange("githubLink")} placeholder="https://github.com/you" />
          </div>

          <div className="field">
            <label htmlFor="photo">Photo URL</label>
            <div className="cv-photo-upload">
              <input id="photo" type="url" value={photo} onChange={(e) => { setPhoto(e.target.value); setSaved(false); }} placeholder="https://example.com/photo.jpg" />
              {photo && <img src={photo} alt="Preview" className="cv-photo-thumb" />}
            </div>
          </div>

          {/* About */}
          <div className="field field--big">
            <label>About</label>
            <MDEditor value={fields.whoAmI} onChange={handleMdChange("whoAmI")} preview="edit" hideToolbar={false} textareaProps={{ spellCheck: true }} />
          </div>

          {/* Work Experience */}
          <div className="cv-list-section">
            <div className="cv-list-header">
              <span className="cv-list-label">Work Experience</span>
              <button type="button" onClick={() => { setWorkEntries((prev) => [...prev, blankWork()]); setSaved(false); }}>+ Add</button>
            </div>
            {workEntries.map((entry, i) => (
              <div key={i} className="cv-entry-edit">
                <div className="cv-entry-edit-row">
                  <div className="field">
                    <label>Role</label>
                    <input type="text" value={entry.role} onChange={(e) => handleWorkChange(i, "role", e.target.value)} placeholder="Tech Lead" />
                  </div>
                  <div className="field">
                    <label>Company</label>
                    <input type="text" value={entry.company} onChange={(e) => handleWorkChange(i, "company", e.target.value)} placeholder="Acme Corp" />
                  </div>
                  <div className="field">
                    <label>Location</label>
                    <input type="text" value={entry.location} onChange={(e) => handleWorkChange(i, "location", e.target.value)} placeholder="Tbilisi, Georgia" />
                  </div>
                </div>
                <div className="cv-entry-edit-row">
                  <div className="field">
                    <label>Date Range</label>
                    <input type="text" value={entry.dateRange} onChange={(e) => handleWorkChange(i, "dateRange", e.target.value)} placeholder="Jan 2022 – Dec 2024" />
                  </div>
                  <div className="field">
                    <label>Employment Type</label>
                    <input type="text" value={entry.employmentType} onChange={(e) => handleWorkChange(i, "employmentType", e.target.value)} placeholder="Full-time" />
                  </div>
                </div>
                <div className="field field--big">
                  <label>Description</label>
                  <MDEditor value={entry.description} onChange={(v) => handleWorkChange(i, "description", v ?? "")} preview="edit" hideToolbar={false} textareaProps={{ spellCheck: true }} />
                </div>
                <button type="button" className="cv-remove-btn" onClick={() => { setWorkEntries((prev) => prev.filter((_, idx) => idx !== i)); setSaved(false); }}>Remove</button>
              </div>
            ))}
          </div>

          {/* Education */}
          <div className="cv-list-section">
            <div className="cv-list-header">
              <span className="cv-list-label">Education</span>
              <button type="button" onClick={() => { setEducationEntries((prev) => [...prev, blankEducation()]); setSaved(false); }}>+ Add</button>
            </div>
            {educationEntries.map((entry, i) => (
              <div key={i} className="cv-entry-edit">
                <div className="cv-entry-edit-row">
                  <div className="field">
                    <label>Institution</label>
                    <input type="text" value={entry.institution} onChange={(e) => handleEducationChange(i, "institution", e.target.value)} placeholder="MIT" />
                  </div>
                  <div className="field">
                    <label>Degree</label>
                    <input type="text" value={entry.degree} onChange={(e) => handleEducationChange(i, "degree", e.target.value)} placeholder="B.Sc. Computer Science" />
                  </div>
                  <div className="field">
                    <label>Date Range</label>
                    <input type="text" value={entry.dateRange} onChange={(e) => handleEducationChange(i, "dateRange", e.target.value)} placeholder="2008 – 2014" />
                  </div>
                </div>
                <button type="button" className="cv-remove-btn" onClick={() => { setEducationEntries((prev) => prev.filter((_, idx) => idx !== i)); setSaved(false); }}>Remove</button>
              </div>
            ))}
          </div>

          {/* Achievements */}
          <div className="cv-list-section">
            <div className="cv-list-header">
              <span className="cv-list-label">Achievements</span>
              <button type="button" onClick={() => { setAchievementEntries((prev) => [...prev, blankAchievement()]); setSaved(false); }}>+ Add</button>
            </div>
            {achievementEntries.map((entry, i) => (
              <div key={i} className="cv-entry-edit">
                <div className="field">
                  <label>Title</label>
                  <input type="text" value={entry.title} onChange={(e) => handleAchievementChange(i, "title", e.target.value)} placeholder="Led migration to microservices" />
                </div>
                <div className="field field--big">
                  <label>Description</label>
                  <MDEditor value={entry.description} onChange={(v) => handleAchievementChange(i, "description", v ?? "")} preview="edit" hideToolbar={false} textareaProps={{ spellCheck: true }} />
                </div>
                <button type="button" className="cv-remove-btn" onClick={() => { setAchievementEntries((prev) => prev.filter((_, idx) => idx !== i)); setSaved(false); }}>Remove</button>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="field">
            <label htmlFor="hardSkills">Hard Skills (comma-separated)</label>
            <input id="hardSkills" type="text" value={hardSkills} onChange={(e) => { setHardSkills(e.target.value); setSaved(false); }} placeholder="React, TypeScript, C#, Microservices" />
          </div>
          <div className="field">
            <label htmlFor="softSkills">Soft Skills (comma-separated)</label>
            <input id="softSkills" type="text" value={softSkills} onChange={(e) => { setSoftSkills(e.target.value); setSaved(false); }} placeholder="Team Leadership, Mentoring, Communication" />
          </div>
          <div className="field">
            <label htmlFor="otherSkills">Other (comma-separated)</label>
            <input id="otherSkills" type="text" value={otherSkills} onChange={(e) => { setOtherSkills(e.target.value); setSaved(false); }} placeholder="Agile, CI/CD, AWS" />
          </div>
        </div>
      ) : (
        <div className="cv-preview">
          <PreviewIdentity
            name={fields.name}
            title={fields.title}
            email={fields.email}
            location={fields.location}
            linkedinLink={fields.linkedinLink}
            githubLink={fields.githubLink}
            photo={photo}
          />

          <div className="cv-columns">
            <div className="cv-col-left">
              {workEntries.length > 0 && (
                <div className="cv-section">
                  <h3 className="cv-section-title">Work Experience</h3>
                  {workEntries.map((entry, i) => (
                    <div key={i} className="cv-entry">
                      <div className="cv-entry-header">
                        <div>
                          <strong>{entry.role || <em style={{ opacity: 0.4 }}>Role</em>}</strong>
                          {entry.company && <span> · <span className="cv-entry-role">{entry.company}</span></span>}
                          {entry.location && <span className="cv-entry-meta"> · <IconLocation />{entry.location}</span>}
                        </div>
                        <div className="cv-entry-meta">
                          {entry.dateRange && <><IconCalendar />{entry.dateRange}</>}
                          {entry.employmentType && <span> · {entry.employmentType}</span>}
                        </div>
                      </div>
                      {entry.description && (
                        <div className="cv-entry-body">
                          <Markdown remarkPlugins={[remarkBreaks]}>{entry.description}</Markdown>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {educationEntries.length > 0 && (
                <div className="cv-section">
                  <h3 className="cv-section-title">Education</h3>
                  {educationEntries.map((entry, i) => (
                    <div key={i} className="cv-entry">
                      <div className="cv-entry-header">
                        <div>
                          <strong>{entry.institution || <em style={{ opacity: 0.4 }}>Institution</em>}</strong>
                          {entry.degree && <span className="cv-entry-meta"> · {entry.degree}</span>}
                        </div>
                        <div className="cv-entry-meta">{entry.dateRange}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="cv-col-right">
              {fields.whoAmI && (
                <div className="cv-section">
                  <h3 className="cv-section-title">About</h3>
                  <PreviewText value={fields.whoAmI} />
                </div>
              )}

              {achievementEntries.length > 0 && (
                <div className="cv-section">
                  <h3 className="cv-section-title">Achievements</h3>
                  {achievementEntries.map((entry, i) => (
                    <div key={i} className="cv-entry">
                      <div className="cv-entry-header">
                        <strong>{entry.title || <em style={{ opacity: 0.4 }}>Title</em>}</strong>
                      </div>
                      {entry.description && (
                        <div className="cv-entry-body">
                          <Markdown remarkPlugins={[remarkBreaks]}>{entry.description}</Markdown>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {(hardTags.length > 0 || softTags.length > 0 || otherTags.length > 0) && (
                <div className="cv-section">
                  <h3 className="cv-section-title">Skills</h3>
                  {hardTags.length > 0 && (
                    <div className="cv-skills-group">
                      <span className="cv-skills-group-label">Hard Skills</span>
                      <div className="cv-skills">
                        {hardTags.map((skill, i) => <span key={i} className="cv-skill-tag">{skill}</span>)}
                      </div>
                    </div>
                  )}
                  {softTags.length > 0 && (
                    <div className="cv-skills-group">
                      <span className="cv-skills-group-label">Soft Skills</span>
                      <div className="cv-skills">
                        {softTags.map((skill, i) => <span key={i} className="cv-skill-tag">{skill}</span>)}
                      </div>
                    </div>
                  )}
                  {otherTags.length > 0 && (
                    <div className="cv-skills-group">
                      <span className="cv-skills-group-label">Other</span>
                      <span className="cv-entry-meta">{otherTags.join(", ")}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
