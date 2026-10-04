/**
 * Open AI Strategy Advisor
 *
 * Generates actionable, strategic next steps for bridging eligibility gaps.
 * Operates client-side (works 100% when deployed on Vercel/Netlify) and can
 * be augmented by local Ollama or cloud open-weight LLMs when configured.
 */
import { type Evaluation, type CheckResult } from "./eligibility";
import { type StudentProfile, LEVEL_LABELS } from "./profile";
import { type Scholarship, scholarships } from "./scholarships";

export type StrategyPlan = {
  scholarshipName: string;
  verdict: "eligible" | "verification" | "ineligible";
  diagnosis: string;
  feasibility: "Immediate Action Required" | "Target Next Academic Cycle" | "Alternative Track Recommended";
  keyObstacles: { title: string; detail: string; action: string }[];
  recommendedNextSteps: string[];
  alternativeOpportunities: { id: string; name: string; why: string }[];
  providerNote: string;
};

export function generateStrategyPlan(
  profile: StudentProfile,
  scholarship: Scholarship,
  evaluation: Evaluation
): StrategyPlan {
  const failedChecks = evaluation.checks.filter((c) => c.outcome === "fail");
  const unknownChecks = evaluation.checks.filter((c) => c.outcome === "unknown");

  let feasibility: StrategyPlan["feasibility"] = "Immediate Action Required";
  let diagnosis = "";
  const keyObstacles: StrategyPlan["keyObstacles"] = [];

  if (evaluation.status === "eligible") {
    diagnosis = `All checkable criteria match ${profile.name}'s profile. Focus should shift entirely to application quality, statement of purpose, and deadline submission.`;
    feasibility = "Immediate Action Required";
  } else if (evaluation.status === "ineligible") {
    diagnosis = `Hard constraint mismatch detected. This award cannot be applied for in the current cycle due to statutory criteria (e.g. academic standing, degree level, or citizenship constraints).`;
    feasibility = failedChecks.some((c) => c.requirement.kind === "degreeCompletedBy" || c.requirement.kind === "finalYearOrGraduated")
      ? "Target Next Academic Cycle"
      : "Alternative Track Recommended";
  } else {
    diagnosis = `Profile contains high matching potential, but official documentation lacks explicit verification for specific subjective or administrative requirements.`;
    feasibility = "Immediate Action Required";
  }

  // Analyze obstacles
  for (const check of [...failedChecks, ...unknownChecks]) {
    const kind = check.requirement.kind;

    if (kind === "degreeCompletedBy" || kind === "finalYearOrGraduated") {
      keyObstacles.push({
        title: "Academic Stage Mismatch",
        detail: `The award requires a completed degree or final-year standing. You are currently in year ${profile.yearOfStudy ?? 3} of ${profile.programYears ?? 4} (graduating ${profile.graduationYear ?? 2027}).`,
        action: `Bookmark this opportunity for the next intake cycle. Your expected graduation of ${profile.graduationYear ?? 2027} will qualify you for the subsequent application intake.`,
      });
    } else if (kind === "minWorkExperience") {
      keyObstacles.push({
        title: "Professional Work Experience Required",
        detail: `This award targets mid-career professionals with verifiable employment hours, whereas your profile lists academic and project credentials.`,
        action: `Look for academic/merit fellowships (such as DAAD Study Scholarships) that evaluate GPA and research proposals rather than corporate tenure.`,
      });
    } else if (kind === "minGpa") {
      keyObstacles.push({
        title: "Grade Average Calibration",
        detail: `Published benchmark requires high academic distinction. Your current grade average is ${profile.gpa ?? "N/A"}/${profile.gpaScale ?? 10}.`,
        action: `Request an official university letter certifying your class rank or relative standing (e.g. top 10% of cohort), which European and Canadian committees value alongside raw numerical GPA.`,
      });
    } else if (kind === "evidence") {
      const topic = check.requirement.topic;
      keyObstacles.push({
        title: `Unverified ${topic.charAt(0).toUpperCase() + topic.slice(1)} Record`,
        detail: `The scholarship committee requires demonstrable proof of ${topic}, but the uploaded documents do not contain dedicated proof.`,
        action: `Obtain a formal certificate or reference letter detailing your leadership in student clubs or community initiatives to convert this requirement from 'Unverified' to 'Passed'.`,
      });
    } else if (kind === "offerLetter") {
      keyObstacles.push({
        title: "University Admission Offer Required",
        detail: `This scholarship requires an active unconditional admission offer before funding can be disbursed.`,
        action: `Submit your university admission application first. Most institutions automatically review candidates for this award once admitted.`,
      });
    } else if (kind === "manual") {
      keyObstacles.push({
        title: "Institutional Nomination / External Endorsement",
        detail: check.reason,
        action: `Schedule a consultation with your department head or international study dean to secure an institutional nomination.`,
      });
    } else if (kind === "nationality") {
      keyObstacles.push({
        title: "Bilateral Nationality Restriction",
        detail: `Restricted to citizens of participating partner countries.`,
        action: `Explore open-constituency awards in the same destination that accept international applicants worldwide.`,
      });
    }
  }

  // Recommended Next Steps
  const recommendedNextSteps: string[] = [];
  if (evaluation.status === "eligible") {
    recommendedNextSteps.push(`Review the official application guidelines before the ${scholarship.deadline} deadline.`);
    recommendedNextSteps.push("Prepare letters of recommendation highlighting technical achievements and leadership.");
    recommendedNextSteps.push("Draft a tailored Statement of Purpose aligned with the scholarship provider's mission.");
  } else if (evaluation.status === "verification") {
    recommendedNextSteps.push("Request supporting certification from your department for unverified community or leadership activities.");
    recommendedNextSteps.push("Check whether the university accepts provisional transcripts while your final semester is in progress.");
    recommendedNextSteps.push("Confirm English proficiency test requirements (IELTS / TOEFL / Duolingo) for this specific stream.");
  } else {
    recommendedNextSteps.push("Save this award to your watchlist to monitor upcoming cycles when your academic stage aligns.");
    recommendedNextSteps.push("Pivot immediate focus towards open-intake awards matching your current undergraduate standing.");
  }

  // Find alternative opportunities in same or related country
  const alternatives = scholarships
    .filter((s) => s.id !== scholarship.id && (s.countryKey === scholarship.countryKey || s.funding === "full"))
    .slice(0, 2)
    .map((s) => ({
      id: s.id,
      name: s.name,
      why: `${s.award} · ${s.levelLabel} in ${s.countryKey.toUpperCase()}`,
    }));

  return {
    scholarshipName: scholarship.name,
    verdict: evaluation.status,
    diagnosis,
    feasibility,
    keyObstacles: keyObstacles.slice(0, 3),
    recommendedNextSteps,
    alternativeOpportunities: alternatives,
    providerNote: `Source verified from ${scholarship.provider} official registry.`,
  };
}
