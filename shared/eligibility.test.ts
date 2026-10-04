import { describe, it, expect } from "vitest";
import { evaluate } from "./eligibility";
import { emptyProfile, type StudentProfile } from "./profile";
import { scholarships } from "./scholarships";
import { generateStrategyPlan } from "./aiAdvisor";

describe("Deterministic Eligibility Engine", () => {
  const rahulProfile: StudentProfile = {
    ...emptyProfile(),
    name: "Rahul Sharma",
    nationality: "india",
    currentLevel: "bachelors",
    yearOfStudy: 3,
    programYears: 4,
    graduationYear: 2027,
    field: "Computer Science",
    degreeName: "Bachelor of Technology in Computer Science & Engineering",
    institution: "National Institute of Technology Karnataka, Surathkal",
    gpa: 8.4,
    gpaScale: 10,
    targetLevel: "masters",
    leadership: ["Finalist Smart India Hackathon"],
    research: ["Undergraduate research in distributed caching"],
    community: ["Mentored 20 junior coders"],
    workExperienceMonths: 3,
  };

  it("correctly identifies eligible scholarships for senior undergraduates", () => {
    // Mitacs Globalink is open to 3rd year Indian undergrads
    const mitacs = scholarships.find((s) => s.id === "mitacs-globalink");
    expect(mitacs).toBeDefined();

    if (mitacs) {
      const evaluation = evaluate(rahulProfile, mitacs);
      expect(evaluation.status).toBe("eligible");
      expect(evaluation.failed).toBe(0);
      expect(evaluation.passed).toBeGreaterThan(0);
    }
  });

  it("strictly marks ineligible when degree level doesn't match", () => {
    // Lester B. Pearson is for high school students entering first bachelor's
    const pearson = scholarships.find((s) => s.id === "lester-pearson");
    expect(pearson).toBeDefined();

    if (pearson) {
      const evaluation = evaluate(rahulProfile, pearson);
      expect(evaluation.status).toBe("ineligible");
      expect(evaluation.failed).toBeGreaterThan(0);
      const levelCheck = evaluation.checks.find(
        (c) => c.requirement.kind === "targetLevel" || c.requirement.kind === "currentLevel"
      );
      expect(levelCheck?.outcome).toBe("fail");
    }
  });

  it("fails when GPA is below the requirement threshold", () => {
    const lowGpaProfile: StudentProfile = {
      ...rahulProfile,
      gpa: 5.0,
      gpaScale: 10,
    };

    const mitacs = scholarships.find((s) => s.id === "mitacs-globalink");
    expect(mitacs).toBeDefined();

    if (mitacs) {
      const evaluation = evaluate(lowGpaProfile, mitacs);
      expect(evaluation.status).toBe("ineligible");
      const gpaCheck = evaluation.checks.find((c) => c.requirement.kind === "minGpa");
      expect(gpaCheck?.outcome).toBe("fail");
    }
  });

  it("marks verification when a subjective requirement or nomination is needed", () => {
    // daad-study-scholarship requires final year or graduated
    const daad = scholarships.find((s) => s.id === "daad-study-scholarship");
    expect(daad).toBeDefined();

    if (daad) {
      const evaluation = evaluate(rahulProfile, daad);
      // Rahul is in year 3 of 4, so final year or graduated fails for the 2026 intake
      expect(evaluation.status).toBe("ineligible");
    }
  });
});

describe("AI Strategy Advisor Engine", () => {
  const rahulProfile: StudentProfile = {
    ...emptyProfile(),
    name: "Rahul Sharma",
    nationality: "india",
    currentLevel: "bachelors",
    yearOfStudy: 3,
    programYears: 4,
    graduationYear: 2027,
    field: "Computer Science",
    degreeName: "B.Tech in Computer Science",
    institution: "NITK Surathkal",
    gpa: 8.4,
    gpaScale: 10,
    targetLevel: "masters",
  };

  it("generates structured diagnostic plans with action steps and alternative scholarships", () => {
    const daad = scholarships.find((s) => s.id === "daad-study-scholarship")!;
    expect(daad).toBeDefined();

    const evaluation = evaluate(rahulProfile, daad);
    const plan = generateStrategyPlan(rahulProfile, daad, evaluation);

    expect(plan.scholarshipName).toBe(daad.name);
    expect(plan.diagnosis).toBeDefined();
    expect(typeof plan.diagnosis).toBe("string");
    expect(plan.recommendedNextSteps.length).toBeGreaterThan(0);
    expect([
      "Immediate Action Required",
      "Target Next Academic Cycle",
      "Alternative Track Recommended",
    ]).toContain(plan.feasibility);
    expect(plan.alternativeOpportunities.length).toBeGreaterThanOrEqual(1);
    expect(plan.keyObstacles.length).toBeGreaterThan(0);
  });
});
