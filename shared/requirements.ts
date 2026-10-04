/**
 * Structured scholarship requirements.
 *
 * Every scholarship is stored as data, not prose. The open model's job (see
 * scripts/extract-requirements.ts) is to turn an official page into this shape;
 * a human reviews it; the deterministic engine in shared/eligibility.ts checks it.
 *
 * `text` is always the published requirement in plain words — it is what the
 * student sees in the "Why?" drawer next to their own profile value.
 */
import { z } from "zod";
import { TARGET_LEVELS, CURRENT_LEVELS } from "./profile";

const base = { id: z.string(), text: z.string() };

export const requirementSchema = z.discriminatedUnion("kind", [
  /** Which degree the scholarship funds. */
  z.object({ ...base, kind: z.literal("targetLevel"), levels: z.array(z.enum(TARGET_LEVELS)) }),
  /** What the applicant must currently be studying (e.g. internships for current undergrads). */
  z.object({ ...base, kind: z.literal("currentLevel"), levels: z.array(z.enum(CURRENT_LEVELS)) }),
  /** Citizenship rules. Country names are lowercase English names, e.g. "india". */
  z.object({
    ...base,
    kind: z.literal("nationality"),
    allowed: z.array(z.string()).optional(),
    excluded: z.array(z.string()).optional(),
  }),
  /** Minimum grade, expressed on the scale the provider publishes (e.g. 3.0 on 4). */
  z.object({ ...base, kind: z.literal("minGpa"), value: z.number(), scale: z.number() }),
  /** Bachelor's (or equivalent) must be finished by this year — usually the programme start. */
  z.object({ ...base, kind: z.literal("degreeCompletedBy"), year: z.number().int() }),
  /** Applicant must be in the final year of their current degree, or already graduated. */
  z.object({ ...base, kind: z.literal("finalYearOrGraduated") }),
  /** Applicant must be in at least this year of their current degree. */
  z.object({ ...base, kind: z.literal("minYearOfStudy"), year: z.number().int() }),
  /** Graduated no more than N years ago (future graduation dates pass). */
  z.object({ ...base, kind: z.literal("maxYearsSinceGraduation"), years: z.number().int() }),
  z.object({ ...base, kind: z.literal("minWorkExperience"), months: z.number().int() }),
  /** Any keyword matching the student's field / degree name passes. */
  z.object({ ...base, kind: z.literal("field"), keywords: z.array(z.string()) }),
  z.object({
    ...base,
    kind: z.literal("englishTest"),
    ielts: z.number().optional(),
    toefl: z.number().optional(),
    pte: z.number().optional(),
  }),
  /** Age limit measured on a specific date (ISO yyyy-mm-dd). */
  z.object({ ...base, kind: z.literal("maxAge"), age: z.number().int(), asOf: z.string() }),
  /** Subjective criteria: code can only confirm that evidence EXISTS in the documents. */
  z.object({
    ...base,
    kind: z.literal("evidence"),
    topic: z.enum(["leadership", "community", "research"]),
  }),
  /** Award requires an admission offer from a participating university. */
  z.object({ ...base, kind: z.literal("offerLetter") }),
  /** Criteria code cannot check from documents (class rank, nomination...). Always "Needs verification". */
  z.object({ ...base, kind: z.literal("manual"), why: z.string() }),
]);

export type Requirement = z.infer<typeof requirementSchema>;
export type RequirementKind = Requirement["kind"];
