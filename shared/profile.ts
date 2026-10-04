/**
 * Student profile — the single shape shared by:
 *   - the open-model extractor (server/ai/extractProfile.ts)
 *   - the rule-based fallback extractor (server/ai/heuristics.ts)
 *   - the deterministic eligibility engine (shared/eligibility.ts)
 *   - the editable profile form (client)
 *
 * Convention: `null` means "not found in the documents". The engine treats
 * null as UNKNOWN (→ "Needs verification"), never as a pass or a fail.
 */
import { z } from "zod";

export const CURRENT_LEVELS = ["high_school", "bachelors", "masters", "phd"] as const;
export type CurrentLevel = (typeof CURRENT_LEVELS)[number];

export const TARGET_LEVELS = ["bachelors", "masters", "phd"] as const;
export type TargetLevel = (typeof TARGET_LEVELS)[number];

export const ENGLISH_TESTS = ["IELTS", "TOEFL", "PTE", "Duolingo"] as const;
export type EnglishTestType = (typeof ENGLISH_TESTS)[number];

export const LEVEL_LABELS: Record<CurrentLevel, string> = {
  high_school: "High school",
  bachelors: "Bachelor's",
  masters: "Master's",
  phd: "PhD",
};

export const studentProfileSchema = z.object({
  name: z.string(),
  nationality: z.string().nullable(),
  birthYear: z.number().int().nullable(),
  currentLevel: z.enum(CURRENT_LEVELS).nullable(),
  degreeName: z.string().nullable(),
  field: z.string().nullable(),
  yearOfStudy: z.number().int().nullable(),
  programYears: z.number().int().nullable(),
  gpa: z.number().nullable(),
  gpaScale: z.number().nullable(),
  graduationYear: z.number().int().nullable(),
  targetLevel: z.enum(TARGET_LEVELS).nullable(),
  workExperienceMonths: z.number().int().nullable(),
  englishTest: z.object({ type: z.enum(ENGLISH_TESTS), score: z.number() }).nullable(),
  skills: z.array(z.string()),
  achievements: z.array(z.string()),
  leadership: z.array(z.string()),
  community: z.array(z.string()),
  research: z.array(z.string()),
  hasOfferLetter: z.boolean().nullable(),
});

export type StudentProfile = z.infer<typeof studentProfileSchema>;
export type ProfileField = keyof StudentProfile;

/** A quote from the uploaded documents that supports one profile field. */
export const evidenceSchema = z.object({
  field: z.string(),
  quote: z.string(),
  document: z.string(),
});
export type Evidence = z.infer<typeof evidenceSchema>;

export type ExtractionSource = "open-model" | "rules";

export type ExtractionResult = {
  profile: StudentProfile;
  evidence: Evidence[];
  warnings: string[];
  source: ExtractionSource;
  provider: string;
  model: string | null;
  durationMs: number;
  /** Raw JSON the model produced, before code-level verification. Shown in "How it works". */
  raw: unknown;
};

export function emptyProfile(): StudentProfile {
  return {
    name: "",
    nationality: null,
    birthYear: null,
    currentLevel: null,
    degreeName: null,
    field: null,
    yearOfStudy: null,
    programYears: null,
    gpa: null,
    gpaScale: null,
    graduationYear: null,
    targetLevel: null,
    workExperienceMonths: null,
    englishTest: null,
    skills: [],
    achievements: [],
    leadership: [],
    community: [],
    research: [],
    hasOfferLetter: null,
  };
}

/** Human labels used by the form, the engine's explanations, and the LLM prompt. */
export const FIELD_LABELS: Record<ProfileField, string> = {
  name: "Name",
  nationality: "Nationality",
  birthYear: "Birth year",
  currentLevel: "Current level",
  degreeName: "Degree",
  field: "Field of study",
  yearOfStudy: "Year of study",
  programYears: "Programme length",
  gpa: "CGPA / GPA",
  gpaScale: "Grade scale",
  graduationYear: "Graduation year",
  targetLevel: "Applying for",
  workExperienceMonths: "Work experience",
  englishTest: "English test",
  skills: "Skills",
  achievements: "Achievements",
  leadership: "Leadership",
  community: "Community work",
  research: "Research",
  hasOfferLetter: "University offer",
};

/** Count of fields that carry a real value — drives the "profile confidence" meter. */
export function profileCompleteness(profile: StudentProfile): { filled: number; total: number } {
  const keys: ProfileField[] = [
    "name", "nationality", "birthYear", "currentLevel", "degreeName", "field", "yearOfStudy",
    "programYears", "gpa", "graduationYear", "targetLevel", "workExperienceMonths", "englishTest",
  ];
  const listKeys: ProfileField[] = ["skills", "achievements", "leadership", "community", "research"];
  let filled = 0;
  for (const key of keys) {
    const value = profile[key];
    if (value !== null && value !== "") filled++;
  }
  for (const key of listKeys) {
    if ((profile[key] as string[]).length > 0) filled++;
  }
  return { filled, total: keys.length + listKeys.length };
}
