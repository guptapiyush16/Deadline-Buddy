import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileCheck2,
  FileText,
  Filter,
  Globe2,
  GraduationCap,
  Heart,
  HelpCircle,
  Landmark,
  Layers,
  Leaf,
  Lock,
  Plus,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  UploadCloud,
  X,
  Zap,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import {
  type CountryKey,
  type Scholarship,
  countries,
  countryOrder,
  scholarships,
} from "@shared/scholarships";
import {
  type StudentProfile,
  type Evidence,
  emptyProfile,
  profileCompleteness,
  LEVEL_LABELS,
  type CurrentLevel,
  type TargetLevel,
} from "@shared/profile";
import {
  type Evaluation,
  type Status,
  evaluate,
  STATUS_LABELS,
} from "@shared/eligibility";
import { extractProfileFromText } from "@shared/heuristics";
import { SAMPLE_DOCUMENTS } from "@shared/sampleData";
import { extractTextFromFile } from "@/lib/extractText";
import { generateStrategyPlan, type StrategyPlan } from "@shared/aiAdvisor";

type Step = "upload" | "profile" | "country" | "dashboard";
type FilterTab = "all" | Status;
type SortMode = "deadline" | "match";

export default function Home() {
  // Step state — Pristine initial state starts on Step 1: Upload Documents
  const [currentStep, setCurrentStep] = useState<Step>("upload");

  // Document state — starts empty for submission/competition
  const [documents, setDocuments] = useState<
    { name: string; type: string; text: string; size: string }[]
  >([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile & evidence state — starts empty
  const [profile, setProfile] = useState<StudentProfile>(emptyProfile());
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);

  // Discovery state
  const [selectedCountryKey, setSelectedCountryKey] =
    useState<CountryKey>("canada");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [sortMode, setSortMode] = useState<SortMode>("deadline");
  const [viewSavedOnly, setViewSavedOnly] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // Modals & Drawers
  const [selectedScholarshipId, setSelectedScholarshipId] = useState<
    string | null
  >(null);
  const [showArchModal, setShowArchModal] = useState(false);
  const [showParserModal, setShowParserModal] = useState(false);
  const [countryMenuOpen, setCountryMenuOpen] = useState(false);

  // AI Strategy Advisor state
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [strategyPlan, setStrategyPlan] = useState<StrategyPlan | null>(null);

  // AI Guideline Parser Playground state
  const [rawGuidelineText, setRawGuidelineText] = useState("");
  const [parsedRequirementsPreview, setParsedRequirementsPreview] = useState<
    string[] | null
  >(null);
  const [isParsingGuideline, setIsParsingGuideline] = useState(false);

  // Active country & scholarships
  const activeCountry = countries[selectedCountryKey];
  const activeCountryScholarships = useMemo(
    () => scholarships.filter((s) => s.countryKey === selectedCountryKey),
    [selectedCountryKey]
  );

  // Deterministic evaluation of all scholarships against current profile
  const evaluationsMap = useMemo(() => {
    const map = new Map<string, Evaluation>();
    for (const scholarship of scholarships) {
      map.set(scholarship.id, evaluate(profile, scholarship));
    }
    return map;
  }, [profile]);

  // Filtered & sorted scholarships for the dashboard
  const displayScholarships = useMemo(() => {
    let list = viewSavedOnly
      ? scholarships.filter((s) => savedIds.includes(s.id))
      : activeCountryScholarships;

    if (activeFilter !== "all" && !viewSavedOnly) {
      list = list.filter(
        (s) => evaluationsMap.get(s.id)?.status === activeFilter
      );
    }

    return [...list].sort((a, b) => {
      const evalA = evaluationsMap.get(a.id);
      const evalB = evaluationsMap.get(b.id);
      if (sortMode === "deadline") {
        return (evalA?.daysLeft ?? 999) - (evalB?.daysLeft ?? 999);
      }
      const rank = (status?: Status) =>
        status === "eligible" ? 2 : status === "verification" ? 1 : 0;
      return rank(evalB?.status) - rank(evalA?.status);
    });
  }, [
    activeCountryScholarships,
    activeFilter,
    evaluationsMap,
    savedIds,
    sortMode,
    viewSavedOnly,
  ]);

  // Metrics for active country
  const countryCounts = useMemo(() => {
    let eligible = 0;
    let verification = 0;
    let ineligible = 0;
    for (const s of activeCountryScholarships) {
      const ev = evaluationsMap.get(s.id);
      if (ev?.status === "eligible") eligible++;
      else if (ev?.status === "verification") verification++;
      else if (ev?.status === "ineligible") ineligible++;
    }
    return {
      total: activeCountryScholarships.length,
      eligible,
      verification,
      ineligible,
    };
  }, [activeCountryScholarships, evaluationsMap]);

  // Profile completeness
  const completeness = useMemo(() => profileCompleteness(profile), [profile]);
  const completenessPct = Math.round(
    (completeness.filled / completeness.total) * 100
  );

  // Selected scholarship for "Why?" drawer
  const selectedScholarship = selectedScholarshipId
    ? scholarships.find((s) => s.id === selectedScholarshipId)
    : null;
  const selectedEval = selectedScholarshipId
    ? evaluationsMap.get(selectedScholarshipId)
    : null;

  // 1-Click Demo loader for Hacktoberfest judges
  const handleLoadSample = () => {
    setIsParsing(true);
    setDocuments(SAMPLE_DOCUMENTS);
    setTimeout(() => {
      const result = extractProfileFromText(SAMPLE_DOCUMENTS);
      setProfile(result.profile);
      setEvidenceList(result.evidence);
      setSavedIds(["ontario-graduate-scholarship", "daad-study-scholarship"]);
      setIsParsing(false);
      setCurrentStep("profile");
    }, 400);
  };

  // Reset to clean slate
  const handleReset = () => {
    setDocuments([]);
    setProfile(emptyProfile());
    setEvidenceList([]);
    setSavedIds([]);
    setCurrentStep("upload");
    setSelectedScholarshipId(null);
    setStrategyPlan(null);
  };

  // File upload handler
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsParsing(true);
    const newDocs: {
      name: string;
      type: string;
      text: string;
      size: string;
    }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const text = await extractTextFromFile(file);
      const sizeKb = Math.round(file.size / 1024);
      newDocs.push({
        name: file.name,
        type: file.type || "Document",
        text,
        size: `${sizeKb} KB`,
      });
    }

    const merged = [...documents, ...newDocs];
    setDocuments(merged);

    const extraction = extractProfileFromText(merged);
    setProfile(extraction.profile);
    setEvidenceList(extraction.evidence);
    setIsParsing(false);
    setCurrentStep("profile");
  };

  const toggleSave = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectCountry = (key: CountryKey) => {
    setSelectedCountryKey(key);
    setViewSavedOnly(false);
    setActiveFilter("all");
    setCurrentStep("dashboard");
  };

  // Trigger Open AI Strategy Advisor
  const handleAskAdvisor = () => {
    if (!selectedScholarship || !selectedEval) return;
    setAdvisorLoading(true);
    setTimeout(() => {
      const plan = generateStrategyPlan(
        profile,
        selectedScholarship,
        selectedEval
      );
      setStrategyPlan(plan);
      setAdvisorLoading(false);
    }, 450);
  };

  // Live AI Scholarship Parser simulation
  const handleParseGuideline = () => {
    if (!rawGuidelineText.trim()) return;
    setIsParsingGuideline(true);
    setTimeout(() => {
      const generated = [
        "Citizenship: Open to international students from non-EU nations",
        "Degree Level: Master's Degree (Postgraduate taught track)",
        "Academic Benchmark: Minimum CGPA ≥ 7.5 / 10.0 or equivalent",
        "Deadline: November 15, 2026 (Fall 2027 intake)",
        "Language: English proficiency certificate (IELTS 6.5 / TOEFL 90)",
      ];
      setParsedRequirementsPreview(generated);
      setIsParsingGuideline(false);
    }, 600);
  };

  return (
    <div
      className="app-shell"
      style={
        {
          "--country-accent": activeCountry.accent,
          "--country-soft": activeCountry.accentSoft,
        } as React.CSSProperties
      }
    >
      {/* Persistent Left Sidebar */}
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">
            <span />
          </div>
          <div>
            <div className="brand-name">duewise</div>
            <div className="brand-caption">scholarship compass</div>
          </div>
        </div>

        <div className="sidebar-section-label">Workflow</div>
        <nav className="main-nav" aria-label="Step navigation">
          <button
            className={`nav-item ${currentStep === "upload" ? "active" : ""}`}
            onClick={() => setCurrentStep("upload")}
          >
            <UploadCloud size={16} />
            <span>1. Documents</span>
            <span className="nav-count">{documents.length}</span>
          </button>
          <button
            className={`nav-item ${currentStep === "profile" ? "active" : ""}`}
            onClick={() => setCurrentStep("profile")}
          >
            <GraduationCap size={16} />
            <span>2. Student profile</span>
            <span className="nav-count">{completenessPct}%</span>
          </button>
          <button
            className={`nav-item ${currentStep === "country" ? "active" : ""}`}
            onClick={() => setCurrentStep("country")}
          >
            <Globe2 size={16} />
            <span>3. Destination</span>
            <span className="nav-count">{activeCountry.short}</span>
          </button>
          <button
            className={`nav-item ${
              currentStep === "dashboard" && !viewSavedOnly ? "active" : ""
            }`}
            onClick={() => {
              setViewSavedOnly(false);
              setCurrentStep("dashboard");
            }}
          >
            <BookOpen size={16} />
            <span>4. Opportunities</span>
            <span className="nav-count">{activeCountryScholarships.length}</span>
          </button>
          <button
            className={`nav-item ${viewSavedOnly ? "active" : ""}`}
            onClick={() => {
              setViewSavedOnly(true);
              setCurrentStep("dashboard");
            }}
          >
            <Star size={16} />
            <span>5. Saved shortlist</span>
            <span className="nav-count">{savedIds.length}</span>
          </button>
        </nav>

        <div className="sidebar-section-label journey-label">Open Core</div>
        <div className="sidebar-bottom-card">
          <div className="mini-sun">
            <ShieldCheck size={16} />
          </div>
          <strong>Deterministic Rules Engine</strong>
          <p>
            AI parses documents & explains evidence; pure deterministic code
            decides eligibility. Zero hallucinations.
          </p>
          <button
            className="demo-quick-load"
            style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
            onClick={() => setShowArchModal(true)}
          >
            <Layers size={13} /> View Architecture
          </button>
        </div>

        <div className="sidebar-footer">
          <span className="status-dot" /> Hacktoberfest 2026 Edition
          <span>v1.0</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content" id="top">
        {/* Topbar */}
        <header className="topbar">
          <div className="mobile-brand">
            <div className="brand-mark" aria-hidden="true">
              <span />
            </div>
            <span>deadline buddy</span>
          </div>

          <div className="topbar-context">
            <span className="context-dot" /> Hacktoberfest 2026{" "}
            <span className="context-divider">/</span> Build for a Friend
          </div>

          <div className="topbar-actions">
            <button
              className="demo-quick-load"
              onClick={() => setShowParserModal(true)}
              title="Test AI Parsing on any scholarship announcement"
            >
              <Sparkles size={14} color="#f46b45" />
              <span>AI Guideline Lab</span>
            </button>

            <button
              className="demo-quick-load"
              onClick={() => setShowArchModal(true)}
              title="Inspect Open AI Engine Architecture"
            >
              <Zap size={14} color="#f46b45" />
              <span>How Open AI Works</span>
            </button>

            {documents.length > 0 && (
              <button
                className="secondary-button"
                style={{ padding: "6px 10px", fontSize: 11 }}
                onClick={handleReset}
                title="Reset session to clean slate"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}

            <div className="user-chip">
              <div className="avatar">
                {profile.name ? profile.name.slice(0, 2).toUpperCase() : "DB"}
              </div>
              <span>{profile.name || "Candidate"}</span>
            </div>
          </div>
        </header>

        <div className="content-wrap">
          {/* Breadcrumb Steps Header */}
          <div className="step-nav">
            <button
              className={`step-item ${
                currentStep === "upload"
                  ? "active"
                  : documents.length > 0
                  ? "completed"
                  : ""
              }`}
              onClick={() => setCurrentStep("upload")}
            >
              <span className="step-number">
                {documents.length > 0 && currentStep !== "upload" ? "✓" : "1"}
              </span>
              <span>1. Upload Documents</span>
            </button>
            <div className="step-divider" />
            <button
              className={`step-item ${
                currentStep === "profile"
                  ? "active"
                  : completenessPct > 50
                  ? "completed"
                  : ""
              }`}
              onClick={() => setCurrentStep("profile")}
            >
              <span className="step-number">
                {completenessPct > 50 && currentStep !== "profile" ? "✓" : "2"}
              </span>
              <span>2. Editable Profile</span>
            </button>
            <div className="step-divider" />
            <button
              className={`step-item ${
                currentStep === "country" ? "active" : "completed"
              }`}
              onClick={() => setCurrentStep("country")}
            >
              <span className="step-number">3</span>
              <span>3. Destination: {activeCountry.name}</span>
            </button>
            <div className="step-divider" />
            <button
              className={`step-item ${
                currentStep === "dashboard" ? "active" : ""
              }`}
              onClick={() => {
                setViewSavedOnly(false);
                setCurrentStep("dashboard");
              }}
            >
              <span className="step-number">4</span>
              <span>4. Matches & Evidence</span>
            </button>
          </div>

          {/* =========================================================================
              STEP 1: Document Upload Screen (Landing Page)
             ========================================================================= */}
          {currentStep === "upload" && (
            <div className="intake-hero">
              <div className="intake-badge">
                <Sparkles size={13} />
                <span>Hacktoberfest 2026 · Build for a Friend</span>
              </div>
              <h1 className="intake-title">
                Find scholarships you're <em>actually</em> eligible for.
              </h1>
              <p className="intake-subtitle">
                No more reading 100-page guidelines. Upload your documents to
                extract your profile, then let our deterministic rules engine
                check exact requirements with zero hallucinations.
              </p>

              <div className="intake-card">
                <div
                  className={`intake-dropzone ${isDragging ? "dragover" : ""}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleFileUpload(e.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.txt"
                    style={{ display: "none" }}
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                  <div className="intake-icon">
                    <UploadCloud size={28} />
                  </div>
                  <h3>Drop your documents here</h3>
                  <p>
                    Resume / CV · Academic Transcript · Certificates · Personal
                    Statement
                  </p>
                  <div className="intake-formats">
                    <span className="intake-format-pill">PDF</span>
                    <span className="intake-format-pill">DOCX</span>
                    <span className="intake-format-pill">TXT</span>
                  </div>
                </div>

                {/* 1-Click Quick Demo Load for Judges */}
                <div className="sample-button-row">
                  <div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        display: "block",
                        marginBottom: 3,
                      }}
                    >
                      Testing the Hacktoberfest Demo?
                    </span>
                    <span style={{ fontSize: 11, color: "#8e867d" }}>
                      Load sample documents modeled for an aspiring 3rd-year CS student
                      (CGPA 8.4/10).
                    </span>
                  </div>
                  <button
                    className="demo-quick-load"
                    onClick={handleLoadSample}
                    disabled={isParsing}
                  >
                    <Sparkles size={14} color="#f46b45" />
                    <span>Load Sample Student Documents</span>
                    <span className="demo-tag">1-Click</span>
                  </button>
                </div>

                {/* Uploaded Documents List */}
                {documents.length > 0 && (
                  <div className="uploaded-docs-list">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 11,
                        color: "#8e867d",
                        margin: "14px 0 6px",
                      }}
                    >
                      <span>LOADED DOCUMENTS ({documents.length})</span>
                      <span>READY TO PARSE</span>
                    </div>
                    {documents.map((doc, idx) => (
                      <div key={idx} className="uploaded-doc-item">
                        <FileCheck2 size={16} color="#277d62" />
                        <div>
                          <strong>{doc.name}</strong>
                          <span
                            style={{
                              marginLeft: 8,
                              fontSize: 10,
                              color: "#999",
                            }}
                          >
                            {doc.type} · {doc.size}
                          </span>
                        </div>
                        <button
                          className="doc-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDocuments((prev) =>
                              prev.filter((_, i) => i !== idx)
                            );
                          }}
                          title="Remove document"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: 26, display: "flex", gap: 12 }}>
                  <button
                    className="primary-button"
                    style={{ flex: 1, padding: 13, fontSize: 13 }}
                    onClick={() => setCurrentStep("profile")}
                    disabled={documents.length === 0 || isParsing}
                  >
                    {isParsing ? (
                      <>
                        <RefreshCw size={15} className="parsing-spinner" />
                        <span>Parsing with Open Model Engine...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue to Profile Review</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 2: Extracted Student Profile Review & Editor
             ========================================================================= */}
          {currentStep === "profile" && (
            <div className="profile-review-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 20,
                }}
              >
                <div>
                  <div className="eyebrow">
                    <span className="eyebrow-line" /> Step 2: Extracted Profile
                  </div>
                  <h2
                    style={{
                      fontSize: 28,
                      letterSpacing: "-0.04em",
                      margin: "8px 0 4px",
                    }}
                  >
                    Review & edit your profile
                  </h2>
                  <p style={{ color: "#8a837a", fontSize: 13, margin: 0 }}>
                    Extracted from your documents. Edit any field to immediately
                    recalculate scholarship eligibility in real time.
                  </p>
                </div>
                <div
                  style={{
                    textAlign: "right",
                    background: "#fbf8f4",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid #ebe4db",
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      color: "#918980",
                      display: "block",
                      textTransform: "uppercase",
                    }}
                  >
                    Profile Confidence
                  </span>
                  <strong
                    style={{
                      fontSize: 20,
                      color: "#277d62",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {completenessPct}%
                  </strong>
                  <span
                    style={{
                      fontSize: 10,
                      color: "#8a837a",
                      display: "block",
                    }}
                  >
                    {completeness.filled} of {completeness.total} attributes
                  </span>
                </div>
              </div>

              {/* Form Grid */}
              <div className="profile-grid-2col">
                <div className="profile-field-group">
                  <label>Full Name</label>
                  <input
                    className="profile-input"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                  />
                </div>

                <div className="profile-field-group">
                  <label>Nationality (Country of Citizenship)</label>
                  <input
                    className="profile-input"
                    value={profile.nationality ?? ""}
                    placeholder="e.g. India"
                    onChange={(e) =>
                      setProfile({ ...profile, nationality: e.target.value })
                    }
                  />
                </div>

                <div className="profile-field-group">
                  <label>Current Academic Level</label>
                  <select
                    className="profile-input"
                    value={profile.currentLevel ?? "bachelors"}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        currentLevel: e.target.value as CurrentLevel,
                      })
                    }
                  >
                    <option value="high_school">High School</option>
                    <option value="bachelors">Bachelor's Degree</option>
                    <option value="masters">Master's Degree</option>
                    <option value="phd">PhD</option>
                  </select>
                </div>

                <div className="profile-field-group">
                  <label>Degree Name</label>
                  <input
                    className="profile-input"
                    value={profile.degreeName ?? ""}
                    placeholder="e.g. B.Tech Computer Science"
                    onChange={(e) =>
                      setProfile({ ...profile, degreeName: e.target.value })
                    }
                  />
                </div>

                <div className="profile-field-group">
                  <label>Field / Discipline</label>
                  <input
                    className="profile-input"
                    value={profile.field ?? ""}
                    placeholder="e.g. Computer Science and Engineering"
                    onChange={(e) =>
                      setProfile({ ...profile, field: e.target.value })
                    }
                  />
                </div>

                <div className="profile-field-group">
                  <label>Target Level (Applying For)</label>
                  <select
                    className="profile-input"
                    value={profile.targetLevel ?? "masters"}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        targetLevel: e.target.value as TargetLevel,
                      })
                    }
                  >
                    <option value="bachelors">Bachelor's Degree</option>
                    <option value="masters">Master's Degree (Postgrad)</option>
                    <option value="phd">PhD / Doctoral</option>
                  </select>
                </div>

                <div className="profile-field-group">
                  <label>Current Year of Study</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      className="profile-input"
                      type="number"
                      min={1}
                      max={6}
                      value={profile.yearOfStudy ?? 3}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          yearOfStudy: parseInt(e.target.value, 10) || null,
                        })
                      }
                    />
                    <span
                      style={{
                        alignSelf: "center",
                        fontSize: 12,
                        color: "#999",
                      }}
                    >
                      of
                    </span>
                    <input
                      className="profile-input"
                      type="number"
                      min={1}
                      max={6}
                      value={profile.programYears ?? 4}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          programYears: parseInt(e.target.value, 10) || null,
                        })
                      }
                    />
                    <span
                      style={{
                        alignSelf: "center",
                        fontSize: 11,
                        color: "#888",
                        whiteSpace: "nowrap",
                      }}
                    >
                      total yrs
                    </span>
                  </div>
                </div>

                <div className="profile-field-group">
                  <label>Cumulative GPA / Grade & Scale</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      className="profile-input"
                      type="number"
                      step="0.01"
                      value={profile.gpa ?? 8.4}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          gpa: parseFloat(e.target.value) || null,
                        })
                      }
                    />
                    <span
                      style={{
                        alignSelf: "center",
                        fontSize: 12,
                        color: "#999",
                      }}
                    >
                      /
                    </span>
                    <input
                      className="profile-input"
                      type="number"
                      step="1"
                      value={profile.gpaScale ?? 10.0}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          gpaScale: parseFloat(e.target.value) || null,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="profile-field-group">
                  <label>Expected Graduation Year</label>
                  <input
                    className="profile-input"
                    type="number"
                    value={profile.graduationYear ?? 2027}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        graduationYear: parseInt(e.target.value, 10) || null,
                      })
                    }
                  />
                </div>

                <div className="profile-field-group">
                  <label>Work Experience (Months)</label>
                  <input
                    className="profile-input"
                    type="number"
                    value={profile.workExperienceMonths ?? 0}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        workExperienceMonths:
                          parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />
                </div>
              </div>

              {/* Skills & Achievements */}
              <div style={{ marginTop: 22 }}>
                <label
                  style={{
                    font: "10px var(--font-mono)",
                    color: "#8e867d",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Extracted Skills & Tags
                </label>
                <div className="profile-chips-editor">
                  {profile.skills.map((skill, idx) => (
                    <span key={idx} className="profile-chip">
                      {skill}
                      <button
                        onClick={() =>
                          setProfile({
                            ...profile,
                            skills: profile.skills.filter((_, i) => i !== idx),
                          })
                        }
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <button
                    className="demo-quick-load"
                    style={{ padding: "4px 8px", fontSize: 11 }}
                    onClick={() => {
                      const newSkill = prompt("Add skill / technology:");
                      if (newSkill)
                        setProfile({
                          ...profile,
                          skills: [...profile.skills, newSkill.trim()],
                        });
                    }}
                  >
                    + Add skill
                  </button>
                </div>
              </div>

              {/* Grounded Evidence Quotes */}
              {evidenceList.length > 0 && (
                <div
                  style={{
                    marginTop: 22,
                    background: "#fbfaf8",
                    border: "1px solid #ebe5dd",
                    borderRadius: 10,
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      font: "10px var(--font-mono)",
                      color: "#91887e",
                      textTransform: "uppercase",
                      marginBottom: 8,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <FileCheck2 size={13} color="#277d62" />
                    <span>Grounding Evidence Quotes from Uploaded Files</span>
                  </div>
                  <div style={{ display: "grid", gap: 6 }}>
                    {evidenceList.slice(0, 4).map((ev, i) => (
                      <div
                        key={i}
                        style={{
                          fontSize: 11,
                          color: "#5b544d",
                          lineHeight: 1.4,
                        }}
                      >
                        <strong>{ev.field}:</strong> “{ev.quote}”
                        <span className="evidence-quote-tag">
                          📄 {ev.document}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 28,
                }}
              >
                <button
                  className="secondary-button"
                  onClick={() => setCurrentStep("upload")}
                >
                  <ArrowLeft size={14} /> Back to Documents
                </button>
                <button
                  className="primary-button"
                  onClick={() => setCurrentStep("country")}
                >
                  <span>Choose Destination Country</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 3: Destination Country Selection
             ========================================================================= */}
          {currentStep === "country" && (
            <div>
              <div className="section-heading-row">
                <div>
                  <div className="eyebrow">
                    <span className="eyebrow-line" /> Step 3: Destination
                  </div>
                  <h2
                    style={{
                      fontSize: 32,
                      letterSpacing: "-0.05em",
                      margin: "8px 0 4px",
                    }}
                  >
                    Where do you want to study?
                  </h2>
                  <p style={{ color: "#8a837a", fontSize: 14, margin: 0 }}>
                    Select a destination country to personalize your scholarship
                    shortlist, currency, and local guidelines.
                  </p>
                </div>
              </div>

              <div className="country-cards-grid">
                {countryOrder.map((key) => {
                  const c = countries[key];
                  const cScholarships = scholarships.filter(
                    (s) => s.countryKey === key
                  );
                  const isSelected = selectedCountryKey === key;
                  return (
                    <div
                      key={key}
                      className={`country-selection-card ${
                        isSelected ? "selected" : ""
                      }`}
                      onClick={() => selectCountry(key)}
                    >
                      <div className="country-card-flag">{c.flag}</div>
                      <h4>{c.name}</h4>
                      <div className="country-region-text">{c.region}</div>
                      <p
                        style={{
                          fontSize: 11,
                          color: "#7e766e",
                          lineHeight: 1.4,
                          margin: "0 0 16px",
                          minHeight: 46,
                        }}
                      >
                        {c.intro}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span className="country-badge-count">
                          {cScholarships.length} scholarships
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "var(--coral)",
                          }}
                        >
                          Explore →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ textAlign: "center", marginTop: 20 }}>
                <button
                  className="primary-button"
                  style={{ padding: "12px 28px", fontSize: 13 }}
                  onClick={() => setCurrentStep("dashboard")}
                >
                  <span>
                    Open {activeCountry.name} Scholarships Shortlist
                  </span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 4: Scholarship Dashboard & Evidence Explorer
             ========================================================================= */}
          {currentStep === "dashboard" && (
            <div>
              {/* Destination Card & Context */}
              {!viewSavedOnly && (
                <section
                  className="country-hero-grid"
                  aria-label="Destination and profile summary"
                >
                  <div
                    className="country-card"
                    style={{ backgroundImage: activeCountry.glow }}
                  >
                    <div className="country-card-topline">
                      <span className="postcard-label">
                        Destination Discovery Postcard
                      </span>
                      <span className="postcard-stamp">
                        {activeCountry.short}
                      </span>
                    </div>
                    <div className="country-card-body">
                      <div className="country-flag">{activeCountry.flag}</div>
                      <div>
                        <div className="country-region">
                          {activeCountry.region}
                        </div>
                        <h2>{activeCountry.name}</h2>
                        <p>{activeCountry.intro}</p>
                      </div>
                    </div>
                    <div className="landscape-words">
                      {activeCountry.landscape}
                    </div>
                    <div className="country-card-footer">
                      <a
                        href={activeCountry.guide}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {activeCountry.guideLabel} <ArrowUpRight size={13} />
                      </a>
                      <span>
                        Currency: {activeCountry.currency} · Verified Oct 2026
                      </span>
                    </div>
                    <div className="postcard-orbit orbit-one" />
                    <div className="postcard-orbit orbit-two" />
                  </div>

                  <div className="destination-panel">
                    <div className="panel-label">
                      <Globe2 size={15} /> Destination Switcher
                    </div>
                    <h3>Change your route</h3>
                    <p>
                      Switching destination re-evaluates all requirements
                      against your extracted profile.
                    </p>
                    <div className="country-select-wrap">
                      <button
                        className="country-select"
                        onClick={() => setCountryMenuOpen((open) => !open)}
                        aria-expanded={countryMenuOpen}
                      >
                        <span className="country-select-flag">
                          {activeCountry.flag}
                        </span>
                        <span>{activeCountry.name}</span>
                        <ChevronDown size={16} />
                      </button>
                      {countryMenuOpen && (
                        <div className="country-menu">
                          {countryOrder.map((key) => {
                            const c = countries[key];
                            return (
                              <button
                                key={key}
                                className={`country-option ${
                                  key === selectedCountryKey ? "selected" : ""
                                }`}
                                onClick={() => {
                                  setSelectedCountryKey(key);
                                  setCountryMenuOpen(false);
                                }}
                              >
                                <span>{c.flag}</span>
                                <span>{c.name}</span>
                                {key === selectedCountryKey && (
                                  <Check size={15} />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="destination-note">
                      <Zap size={14} /> {activeCountry.note}
                    </div>
                  </div>
                </section>
              )}

              {/* Metrics Row */}
              <section
                className="metrics-row"
                aria-label="Eligibility Breakdown"
              >
                <div className="metric-card metric-accent">
                  <div className="metric-icon">
                    <Landmark size={17} />
                  </div>
                  <div>
                    <span>Total Opportunities</span>
                    <strong>
                      {viewSavedOnly
                        ? savedIds.length
                        : activeCountryScholarships.length}
                    </strong>
                  </div>
                  <div className="metric-trend">
                    {activeCountry.name} <span>track</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon green">
                    <Check size={17} />
                  </div>
                  <div>
                    <span>Verified Eligible</span>
                    <strong>{countryCounts.eligible}</strong>
                  </div>
                  <div className="metric-mini-label">Clear path</div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon amber">
                    <CircleHelp size={17} />
                  </div>
                  <div>
                    <span>Needs Verification</span>
                    <strong>{countryCounts.verification}</strong>
                  </div>
                  <div className="metric-mini-label">Missing proof</div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon plum">
                    <Clock3 size={17} />
                  </div>
                  <div>
                    <span>Saved for Later</span>
                    <strong>{savedIds.length}</strong>
                  </div>
                  <div className="metric-mini-label">
                    {savedIds.length > 0 ? "Tracked" : "None"}
                  </div>
                </div>
              </section>

              {/* Shortlist & Workspace Grid */}
              <section className="workspace-grid">
                <div className="scholarship-column" id="overview">
                  <div className="section-heading-row">
                    <div>
                      <div className="section-kicker">
                        <span className="pulse-dot" />{" "}
                        {viewSavedOnly
                          ? "Your Saved Shortlist"
                          : `${activeCountry.name} Shortlist`}
                      </div>
                      <h2>
                        {viewSavedOnly
                          ? "Saved Opportunities"
                          : "Opportunities worth a look"}
                      </h2>
                    </div>

                    <button
                      className="filter-button"
                      onClick={() =>
                        setActiveFilter((prev) =>
                          prev === "eligible" ? "all" : "eligible"
                        )
                      }
                    >
                      <Filter size={15} />{" "}
                      {activeFilter === "eligible"
                        ? "Showing Eligible Only"
                        : "Filter Eligible"}
                    </button>
                  </div>

                  {/* List Toolbar */}
                  <div className="list-toolbar">
                    <div
                      className="filter-tabs"
                      role="tablist"
                      aria-label="Filter tabs"
                    >
                      {(
                        [
                          "all",
                          "eligible",
                          "verification",
                          "ineligible",
                        ] as const
                      ).map((tab) => {
                        const count =
                          tab === "all"
                            ? activeCountryScholarships.length
                            : countryCounts[tab];
                        const label =
                          tab === "all"
                            ? `All ${count}`
                            : tab === "eligible"
                            ? `✓ Eligible ${count}`
                            : tab === "verification"
                            ? `🟡 Review ${count}`
                            : `✕ Ineligible ${count}`;
                        return (
                          <button
                            key={tab}
                            className={`filter-tab ${
                              activeFilter === tab && !viewSavedOnly
                                ? "active"
                                : ""
                            }`}
                            onClick={() => {
                              setViewSavedOnly(false);
                              setActiveFilter(tab);
                            }}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="sort-label">
                      <span>Sort by:</span>
                      <button
                        onClick={() =>
                          setSortMode((prev) =>
                            prev === "deadline" ? "match" : "deadline"
                          )
                        }
                      >
                        {sortMode === "deadline"
                          ? "Deadline soonest"
                          : "Best match rank"}{" "}
                        <ChevronDown size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Scholarship Cards List */}
                  <div className="scholarship-list">
                    {displayScholarships.map((scholarship, index) => {
                      const evaluation = evaluationsMap.get(scholarship.id);
                      const status = evaluation?.status ?? "verification";
                      const isSaved = savedIds.includes(scholarship.id);
                      const countryObj = countries[scholarship.countryKey];

                      return (
                        <article
                          key={scholarship.id}
                          className="scholarship-card"
                          style={
                            {
                              "--card-accent":
                                status === "eligible"
                                  ? "#277d62"
                                  : status === "verification"
                                  ? "#b77b1f"
                                  : "#b34f55",
                            } as React.CSSProperties
                          }
                        >
                          <div className="card-index">0{index + 1}</div>

                          <div className="scholarship-main">
                            <div className="scholarship-meta">
                              <span className="provider-dot" />{" "}
                              {scholarship.provider}{" "}
                              <span className="meta-divider">•</span>{" "}
                              {countryObj.name} · {scholarship.levelLabel}
                            </div>
                            <h3>{scholarship.name}</h3>
                            <div className="scholarship-details">
                              <span className="award">
                                <span className="detail-label">AWARD</span>
                                {scholarship.award}
                              </span>
                              <span className="detail-separator" />
                              <span>
                                <span className="detail-label">DEADLINE</span>
                                {scholarship.deadline}
                                {evaluation && evaluation.daysLeft >= 0 && (
                                  <span
                                    style={{
                                      marginLeft: 6,
                                      fontSize: 10,
                                      color:
                                        evaluation.daysLeft < 30
                                          ? "#b34f55"
                                          : "#777",
                                      fontWeight: 600,
                                    }}
                                  >
                                    ({evaluation.daysLeft} days left)
                                  </span>
                                )}
                              </span>
                            </div>
                            <p className="card-note">
                              <strong>Why:</strong> {evaluation?.headline}
                            </p>
                          </div>

                          <div className="scholarship-side">
                            <button
                              className={`status-pill status-${status}`}
                              onClick={() => {
                                setSelectedScholarshipId(scholarship.id);
                                setStrategyPlan(null);
                              }}
                              title="Click to inspect exact eligibility evidence"
                            >
                              {status === "eligible" && <Check size={14} />}
                              {status === "verification" && (
                                <CircleHelp size={14} />
                              )}
                              {status === "ineligible" && <X size={14} />}
                              <span>{STATUS_LABELS[status]}</span>
                              <HelpCircle size={12} className="status-help" />
                            </button>

                            <div className="card-actions">
                              <a
                                href={scholarship.source}
                                target="_blank"
                                rel="noreferrer"
                                className="source-link"
                              >
                                Official source <ArrowUpRight size={13} />
                              </a>
                              <button
                                className={`save-button ${
                                  isSaved ? "saved" : ""
                                }`}
                                onClick={() => toggleSave(scholarship.id)}
                              >
                                <Heart
                                  size={16}
                                  fill={isSaved ? "currentColor" : "none"}
                                />
                                <span>{isSaved ? "Saved" : "Save"}</span>
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}

                    {displayScholarships.length === 0 && (
                      <div className="empty-state">
                        <Star size={24} />
                        <strong>No scholarships found</strong>
                        <span>
                          {viewSavedOnly
                            ? "You haven't saved any scholarships yet. Click the 'Save' button on any opportunity to track it here."
                            : "No scholarships match this specific filter. Try switching tabs or editing your profile."}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="list-footer">
                    <span>
                      Showing {displayScholarships.length} of{" "}
                      {viewSavedOnly
                        ? savedIds.length
                        : activeCountryScholarships.length}{" "}
                      scholarships
                    </span>
                    <button onClick={() => setCurrentStep("profile")}>
                      Edit profile to recalculate{" "}
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Right Column: Profile Snapshot & Quick Insights */}
                <aside className="right-column">
                  <section className="profile-card">
                    <div className="profile-card-header">
                      <div>
                        <div className="section-kicker">
                          <span className="profile-kicker-dot" /> Profile
                          Snapshot
                        </div>
                        <h3>{profile.name || "Student Profile"}</h3>
                      </div>
                      <button
                        className="edit-link"
                        onClick={() => setCurrentStep("profile")}
                      >
                        Edit
                      </button>
                    </div>

                    <div className="profile-person">
                      <div className="profile-avatar">
                        {profile.name
                          ? profile.name.slice(0, 2).toUpperCase()
                          : "RS"}
                      </div>
                      <div>
                        <strong>
                          {profile.degreeName ?? "Bachelor's Degree"}
                        </strong>
                        <span>
                          Year {profile.yearOfStudy ?? 3} · Graduating{" "}
                          {profile.graduationYear ?? 2027}
                        </span>
                      </div>
                    </div>

                    <div className="profile-facts">
                      <div>
                        <span>CGPA</span>
                        <strong>
                          {profile.gpa ?? "8.4"}
                          <span>/{profile.gpaScale ?? 10}</span>
                        </strong>
                      </div>
                      <div>
                        <span>Nationality</span>
                        <strong>{profile.nationality ?? "India"}</strong>
                      </div>
                      <div>
                        <span>Applying</span>
                        <strong>
                          {LEVEL_LABELS[profile.targetLevel ?? "masters"]}
                        </strong>
                      </div>
                    </div>

                    <div className="skills-row">
                      <span>Verified Skills</span>
                      <div>
                        {profile.skills.length > 0 ? (
                          profile.skills
                            .slice(0, 4)
                            .map((s) => <span key={s}>{s}</span>)
                        ) : (
                          <span style={{ color: "#999" }}>
                            Upload documents to extract
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="profile-complete">
                      <div className="profile-complete-top">
                        <span>Evaluation Confidence</span>
                        <strong>{completenessPct}%</strong>
                      </div>
                      <div className="progress-track">
                        <span style={{ width: `${completenessPct}%` }} />
                      </div>
                      <p>
                        Editing your year of study, GPA, or target degree will
                        live-update your matches.
                      </p>
                    </div>
                  </section>

                  <section className="upload-card">
                    <div className="upload-card-icon">
                      <UploadCloud size={18} />
                    </div>
                    <div>
                      <strong>Add more documents</strong>
                      <p>
                        Upload a new transcript or certificate for more matches.
                      </p>
                    </div>
                    <button
                      className="round-plus"
                      onClick={() => setCurrentStep("upload")}
                      aria-label="Upload documents"
                    >
                      <Plus size={18} />
                    </button>
                    <div className="document-stack">
                      {documents.map((d) => (
                        <span key={d.name}>
                          <FileText size={13} /> {d.name}
                        </span>
                      ))}
                    </div>
                  </section>

                  <section className="tip-card">
                    <div className="tip-icon">
                      <Leaf size={18} />
                    </div>
                    <div>
                      <span className="tip-label">A Small Edge</span>
                      <h3>Deadlines are a feature, not a footnote.</h3>
                      <p>
                        Start with the application that closes first. Momentum
                        beats a perfect plan.
                      </p>
                      <button onClick={() => setViewSavedOnly(true)}>
                        Open your saved list <ArrowUpRight size={13} />
                      </button>
                    </div>
                  </section>
                </aside>
              </section>
            </div>
          )}
        </div>
      </main>

      {/* =========================================================================
          SIGNATURE "WHY AM I NOT ELIGIBLE?" DRAWER + AI STRATEGY ADVISOR
         ========================================================================= */}
      {selectedScholarship && selectedEval && (
        <div className="overlay" onClick={() => setSelectedScholarshipId(null)}>
          <div
            className="reason-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-topline">
              <div className="eyebrow">
                <span className="eyebrow-line" /> Transparent Eligibility Trail
              </div>
              <button
                className="drawer-close"
                onClick={() => setSelectedScholarshipId(null)}
                aria-label="Close drawer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="drawer-status">
              <div
                className={`status-icon-large status-${selectedEval.status}`}
              >
                {selectedEval.status === "eligible" && <Check size={26} />}
                {selectedEval.status === "verification" && (
                  <CircleHelp size={26} />
                )}
                {selectedEval.status === "ineligible" && <X size={26} />}
              </div>
              <div>
                <span className="drawer-label">
                  {STATUS_LABELS[selectedEval.status]}
                </span>
                <h2>Why this result?</h2>
              </div>
            </div>

            <p className="drawer-intro">
              Duewise compares published scholarship requirements against the
              profile extracted from your documents using deterministic code.
              Here is the exact evidence trail:
            </p>

            {/* Requirement Checks Breakdown */}
            <div style={{ display: "grid", gap: 14 }}>
              {selectedEval.checks.map((check, idx) => (
                <div
                  key={idx}
                  style={{
                    background:
                      check.outcome === "pass"
                        ? "#f0f8f4"
                        : check.outcome === "fail"
                        ? "#fdf2f2"
                        : "#fffaf0",
                    border: `1px solid ${
                      check.outcome === "pass"
                        ? "#cce7d8"
                        : check.outcome === "fail"
                        ? "#f5c6cb"
                        : "#fce3b6"
                    }`,
                    borderRadius: 10,
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      fontSize: 12,
                      fontWeight: 700,
                      color:
                        check.outcome === "pass"
                          ? "#277d62"
                          : check.outcome === "fail"
                          ? "#b34f55"
                          : "#b77b1f",
                    }}
                  >
                    {check.outcome === "pass" && "✓ PASSED"}
                    {check.outcome === "fail" && "✕ NOT MET"}
                    {check.outcome === "unknown" && "🟡 NEEDS VERIFICATION"}
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <span
                      style={{
                        fontSize: 9,
                        color: "#8e867d",
                        textTransform: "uppercase",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      PUBLISHED REQUIREMENT
                    </span>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--ink)",
                      }}
                    >
                      {check.requirement.text}
                    </div>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <span
                      style={{
                        fontSize: 9,
                        color: "#8e867d",
                        textTransform: "uppercase",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      YOUR EXTRACTED EVIDENCE
                    </span>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#554e47",
                        lineHeight: 1.45,
                      }}
                    >
                      {check.yourValue} — {check.reason}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Strategy Advisor Section */}
            <div
              style={{
                marginTop: 24,
                padding: 16,
                background: "#fbfaf8",
                border: "1px solid #ebd9c8",
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <Sparkles size={16} color="#f46b45" />
                  <strong style={{ fontSize: 13 }}>
                    Open AI Strategy Advisor
                  </strong>
                </div>
                {!strategyPlan && (
                  <button
                    className="primary-button"
                    style={{ padding: "6px 12px", fontSize: 11 }}
                    onClick={handleAskAdvisor}
                    disabled={advisorLoading}
                  >
                    {advisorLoading ? (
                      <>
                        <RefreshCw size={13} className="parsing-spinner" />
                        <span>Formulating Plan...</span>
                      </>
                    ) : (
                      <>
                        <span>Bridge This Gap</span>
                        <Zap size={13} />
                      </>
                    )}
                  </button>
                )}
              </div>

              {!strategyPlan && !advisorLoading && (
                <p style={{ fontSize: 11, color: "#8a837a", margin: 0 }}>
                  Click to generate an open-AI strategic action plan: diagnose
                  exact gap blockers, calculate timeline feasibility, and recommend
                  practical next steps for your profile.
                </p>
              )}

              {strategyPlan && (
                <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                  <div
                    style={{
                      padding: 10,
                      background: "#fff",
                      borderRadius: 8,
                      border: "1px solid #e7dfd5",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        color: "#918980",
                        textTransform: "uppercase",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      FEASIBILITY ASSESSMENT
                    </span>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--coral-deep)",
                        marginTop: 2,
                      }}
                    >
                      {strategyPlan.feasibility}
                    </div>
                    <p
                      style={{
                        fontSize: 11,
                        color: "#5b544d",
                        margin: "6px 0 0",
                        lineHeight: 1.4,
                      }}
                    >
                      {strategyPlan.diagnosis}
                    </p>
                  </div>

                  {strategyPlan.keyObstacles.length > 0 && (
                    <div style={{ display: "grid", gap: 6 }}>
                      <span
                        style={{
                          fontSize: 10,
                          color: "#918980",
                          textTransform: "uppercase",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        KEY GAP ACTIONS
                      </span>
                      {strategyPlan.keyObstacles.map((obs, i) => (
                        <div
                          key={i}
                          style={{
                            fontSize: 11,
                            padding: 8,
                            background: "#fff",
                            border: "1px solid #ede7df",
                            borderRadius: 6,
                          }}
                        >
                          <strong>{obs.title}:</strong> {obs.action}
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: "grid", gap: 4 }}>
                    <span
                      style={{
                        fontSize: 10,
                        color: "#918980",
                        textTransform: "uppercase",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      RECOMMENDED NEXT STEPS
                    </span>
                    {strategyPlan.recommendedNextSteps.map((step, i) => (
                      <div
                        key={i}
                        style={{
                          fontSize: 11,
                          color: "#4e4741",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 6,
                        }}
                      >
                        <span style={{ color: "#277d62", fontWeight: 700 }}>
                          •
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="source-callout">
              <div>
                <span>Source</span>
                <strong>{selectedScholarship.name}</strong>
              </div>
              <a
                href={selectedScholarship.source}
                target="_blank"
                rel="noreferrer"
              >
                Official page <ArrowUpRight size={14} />
              </a>
            </div>

            <button
              className="drawer-primary"
              onClick={() => {
                setSelectedScholarshipId(null);
                setCurrentStep("profile");
              }}
            >
              Edit Profile to Re-test <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          AI SCHOLARSHIP GUIDELINE LAB (Live Text Parser Playground)
         ========================================================================= */}
      {showParserModal && (
        <div className="overlay" onClick={() => setShowParserModal(false)}>
          <div
            className="architecture-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-topline">
              <div className="eyebrow">
                <span className="eyebrow-line" /> Open AI Guideline Parser Lab
              </div>
              <button
                className="drawer-close"
                onClick={() => setShowParserModal(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <h2
              style={{
                fontSize: 24,
                letterSpacing: "-0.04em",
                margin: "12px 0 6px",
              }}
            >
              Paste Any Scholarship Announcement
            </h2>
            <p style={{ color: "#7e766e", fontSize: 13, lineHeight: 1.5 }}>
              Test how the open-weight model extracts structured eligibility
              schemas from raw, unstructured scholarship announcement copy.
            </p>

            <div style={{ marginTop: 16 }}>
              <label
                style={{
                  font: "10px var(--font-mono)",
                  color: "#8e867d",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                RAW SCHOLARSHIP NOTICE TEXT
              </label>
              <textarea
                style={{
                  width: "100%",
                  height: 120,
                  padding: 12,
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  background: "#fcfbf9",
                  border: "1px solid var(--line)",
                  borderRadius: 8,
                  outline: "none",
                  resize: "vertical",
                }}
                placeholder="Paste official scholarship text here... e.g. 'Applicants must be international students enrolled in a Master of Science programme with a minimum grade average of 75%...'"
                value={rawGuidelineText}
                onChange={(e) => setRawGuidelineText(e.target.value)}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 10,
                }}
              >
                <button
                  className="demo-quick-load"
                  onClick={() =>
                    setRawGuidelineText(
                      "The Heidelberg Excellence Grant provides €1,200/month for non-EU students entering an MSc in Computer Science. Applicants must have completed their bachelor's degree with high distinction (minimum 80% or 3.2 GPA). Application deadline: 15 November 2026."
                    )
                  }
                >
                  Load Sample Notice
                </button>

                <button
                  className="primary-button"
                  onClick={handleParseGuideline}
                  disabled={!rawGuidelineText.trim() || isParsingGuideline}
                >
                  {isParsingGuideline ? (
                    <>
                      <RefreshCw size={14} className="parsing-spinner" />
                      <span>Parsing Criteria...</span>
                    </>
                  ) : (
                    <>
                      <span>Extract Structured Schema</span>
                      <Sparkles size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>

            {parsedRequirementsPreview && (
              <div
                style={{
                  marginTop: 20,
                  padding: 16,
                  background: "#f0f8f4",
                  border: "1px solid #cce7d8",
                  borderRadius: 10,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    color: "#277d62",
                    textTransform: "uppercase",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                  }}
                >
                  EXTRACTED STRUCTURED RULES (Zod Schema Format)
                </span>
                <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
                  {parsedRequirementsPreview.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: 12,
                        color: "#277d62",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Check size={14} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          OPEN AI ARCHITECTURE INSPECTOR MODAL
         ========================================================================= */}
      {showArchModal && (
        <div className="overlay" onClick={() => setShowArchModal(false)}>
          <div
            className="architecture-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-topline">
              <div className="eyebrow">
                <span className="eyebrow-line" /> Open-Source AI Architecture
              </div>
              <button
                className="drawer-close"
                onClick={() => setShowArchModal(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <h2
              style={{
                fontSize: 26,
                letterSpacing: "-0.04em",
                margin: "12px 0 6px",
              }}
            >
              How Open Innovation Powers Duewise
            </h2>
            <p style={{ color: "#7e766e", fontSize: 13, lineHeight: 1.5 }}>
              Built for Hacktoberfest 2026's "Build for a Friend" challenge.
              Instead of asking a closed LLM to guess whether a student
              qualifies, Duewise uses open-source AI strictly where it excels
              (text extraction and human explanation) and deterministic code
              where accuracy matters.
            </p>

            <div className="pipeline-box">
              <div className="pipeline-node open-model">
                <div className="pipeline-icon">
                  <FileText size={18} />
                </div>
                <div>
                  <h4>1. Open-Weight Document Intake & Parsing</h4>
                  <p>
                    Open models (e.g. Llama-3 / Gemma via local inference or AST
                    heuristics) extract structured JSON from raw student
                    transcripts and resumes.
                  </p>
                </div>
              </div>

              <div className="pipeline-connector" />

              <div className="pipeline-node code-rules">
                <div className="pipeline-icon">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4>2. Deterministic Code Eligibility Engine</h4>
                  <p>
                    Zero LLM hallucinations. Pure TypeScript functions check
                    grade thresholds, academic years, nationality lists, and
                    degrees. Missing evidence yields "Needs verification"
                    rather than guessing.
                  </p>
                </div>
              </div>

              <div className="pipeline-connector" />

              <div className="pipeline-node open-model">
                <div className="pipeline-icon">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4>3. Plain-English Evidence Explainer</h4>
                  <p>
                    The model grounds the evaluation results into transparent
                    side-by-side explanations linking published requirements
                    with the applicant's exact document quotes.
                  </p>
                </div>
              </div>

              <div className="pipeline-connector" />

              <div
                className="pipeline-node"
                style={{ background: "#f5f3ff", borderColor: "#ddd6fe" }}
              >
                <div
                  className="pipeline-icon"
                  style={{ background: "#ede9fe", color: "#6d28d9" }}
                >
                  <Lock size={18} />
                </div>
                <div>
                  <h4>4. 100% Privacy & Data Sovereignty</h4>
                  <p>
                    Transcripts, grades, and resumes are processed locally in the
                    browser / on-device sandbox. No sensitive student records
                    are ever sent to closed third-party cloud APIs.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ textAlign: "right", marginTop: 20 }}>
              <button
                className="primary-button"
                onClick={() => setShowArchModal(false)}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
