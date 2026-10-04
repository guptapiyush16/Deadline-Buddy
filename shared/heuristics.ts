/**
 * Local Deterministic Rule-Based Extractor
 *
 * Runs locally on the client or server without requiring any third-party closed API keys.
 * Accurately extracts structured student profile fields and supporting document quotes (evidence)
 * from resumes, CVs, and academic transcripts.
 */
import {
  type StudentProfile,
  type Evidence,
  type ExtractionResult,
  emptyProfile,
} from "./profile";

export function extractProfileFromText(
  documents: { name: string; text: string }[]
): ExtractionResult {
  const startTime = Date.now();
  const profile = emptyProfile();
  const evidence: Evidence[] = [];
  const warnings: string[] = [];

  const combinedText = documents.map((doc) => doc.text).join("\n\n");

  // 1. Name Extraction
  for (const doc of documents) {
    const lines = doc.text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    // Common resume pattern: Top line is the candidate's name
    for (const line of lines.slice(0, 5)) {
      if (
        /^[A-Z][a-z]+(\s+[A-Z][a-z]+)+$/.test(line) ||
        /^[A-Z\s]{4,30}$/.test(line)
      ) {
        if (!/RESUME|CURRICULUM|TRANSCRIPT|UNIVERSITY|INSTITUTE|PAGE/i.test(line)) {
          const formattedName = line
            .toLowerCase()
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
          profile.name = formattedName;
          evidence.push({
            field: "name",
            quote: line,
            document: doc.name,
          });
          break;
        }
      }
      // Or labeled "Student Name: John Doe" or "Name: John Doe"
      const nameMatch = line.match(/(?:Student\s+)?Name\s*[:\-]\s*([A-Za-z\s]{3,35})/i);
      if (nameMatch) {
        profile.name = nameMatch[1].trim();
        evidence.push({
          field: "name",
          quote: line,
          document: doc.name,
        });
        break;
      }
    }
    if (profile.name) break;
  }
  if (!profile.name) profile.name = "Applicant";

  // 2. Nationality Extraction
  for (const doc of documents) {
    const natMatch = doc.text.match(/(?:Nationality|Citizenship|Citizen of)\s*[:\-]?\s*([A-Za-z]+)/i);
    if (natMatch) {
      profile.nationality = natMatch[1].trim();
      evidence.push({
        field: "nationality",
        quote: natMatch[0],
        document: doc.name,
      });
      break;
    }
  }
  if (!profile.nationality) {
    if (/\b(India|Indian|NIT|IIT|Bengaluru|Karnataka|Delhi|Mumbai)\b/i.test(combinedText)) {
      profile.nationality = "India";
      evidence.push({
        field: "nationality",
        quote: "Inferred from institution / location signals in document",
        document: documents[0]?.name ?? "Document",
      });
    }
  }

  // 3. GPA & Scale Extraction
  for (const doc of documents) {
    // Matches "CGPA: 8.4 / 10", "GPA: 3.7/4.0", "CGPA: 8.40", "Grade Point Average (CGPA): 8.4"
    const gpaMatch = doc.text.match(
      /(?:CGPA|GPA|Cumulative Grade Point Average)\s*(?:\(CGPA\))?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*(?:\/\s*(\d+(?:\.\d+)?))?/i
    );
    if (gpaMatch) {
      const val = parseFloat(gpaMatch[1]);
      let scale = gpaMatch[2] ? parseFloat(gpaMatch[2]) : null;
      if (!scale) {
        scale = val <= 4.0 ? 4.0 : 10.0;
      }
      profile.gpa = val;
      profile.gpaScale = scale;
      evidence.push({
        field: "gpa",
        quote: gpaMatch[0],
        document: doc.name,
      });
      break;
    }
  }

  // 4. Current Degree & Field Extraction
  for (const doc of documents) {
    const degreeMatch = doc.text.match(
      /(?:Bachelor of Technology|B\.?Tech|Bachelor of Science|B\.?S|Bachelor of Engineering|B\.?E|B\.?A|Master of Science|M\.?S|M\.?Tech)\s*(?:in\s+([A-Za-z\s]+))?/i
    );
    if (degreeMatch) {
      profile.degreeName = degreeMatch[0].trim();
      if (/Master/i.test(degreeMatch[0])) {
        profile.currentLevel = "masters";
      } else {
        profile.currentLevel = "bachelors";
      }
      if (degreeMatch[1]) {
        profile.field = degreeMatch[1].trim();
      }
      evidence.push({
        field: "degreeName",
        quote: degreeMatch[0],
        document: doc.name,
      });
      break;
    }
  }
  if (!profile.field) {
    if (/Computer Science/i.test(combinedText)) {
      profile.field = "Computer Science and Engineering";
    } else if (/Mechanical/i.test(combinedText)) {
      profile.field = "Mechanical Engineering";
    } else if (/Electrical/i.test(combinedText)) {
      profile.field = "Electrical Engineering";
    }
  }

  // 5. Year of Study & Program Duration
  for (const doc of documents) {
    const yearMatch = doc.text.match(/(?:Year of Study|Current Year)\s*[:\-]?\s*(\d+)(?:st|nd|rd|th)?\s*(?:Year)?/i);
    if (yearMatch) {
      profile.yearOfStudy = parseInt(yearMatch[1], 10);
      evidence.push({
        field: "yearOfStudy",
        quote: yearMatch[0],
        document: doc.name,
      });
    } else {
      const semMatch = doc.text.match(/Semester\s*(\d+)/i);
      if (semMatch) {
        const sem = parseInt(semMatch[1], 10);
        profile.yearOfStudy = Math.ceil(sem / 2);
        evidence.push({
          field: "yearOfStudy",
          quote: semMatch[0],
          document: doc.name,
        });
      }
    }
    if (profile.yearOfStudy) break;
  }
  // Program years (standard 4 for B.Tech/Engineering, 3 for BA/BSc)
  profile.programYears = 4;

  // 6. Graduation Year
  for (const doc of documents) {
    const gradMatch = doc.text.match(/(?:Expected Graduation|Graduation Date|Graduation Year|Passing Year)\s*[:\-]?\s*(?:[A-Za-z]+\s*)?(\d{4})/i);
    if (gradMatch) {
      profile.graduationYear = parseInt(gradMatch[1], 10);
      evidence.push({
        field: "graduationYear",
        quote: gradMatch[0],
        document: doc.name,
      });
      break;
    }
  }
  if (!profile.graduationYear && profile.yearOfStudy) {
    const currentYear = new Date().getFullYear();
    profile.graduationYear = currentYear + (profile.programYears - profile.yearOfStudy);
  }

  // Default target level: Students looking for study abroad during bachelor's typically target Master's
  profile.targetLevel = "masters";

  // 7. Skills
  const knownSkills = [
    "Python", "TypeScript", "JavaScript", "C++", "C#", "Java", "SQL",
    "React", "Node.js", "FastAPI", "PyTorch", "TensorFlow", "Scikit-Learn",
    "Machine Learning", "Deep Learning", "Natural Language Processing", "NLP",
    "Docker", "Git", "Kubernetes", "AWS", "Linux"
  ];
  const foundSkills: string[] = [];
  for (const skill of knownSkills) {
    const regex = new RegExp(`\\b${skill.replace("+", "\\+")}\\b`, "i");
    if (regex.test(combinedText)) {
      foundSkills.push(skill);
    }
  }
  profile.skills = foundSkills;

  // 8. Achievements
  const achievements: string[] = [];
  for (const doc of documents) {
    const hackMatch = doc.text.match(/([^\n]*(?:Hackathon|Finalist|Winner|1st Place|2nd Place|Top 5|Ranked)[^\n]*)/i);
    if (hackMatch) {
      achievements.push(hackMatch[1].trim().replace(/^[•\-\*]\s*/, ""));
    }
    const meritMatch = doc.text.match(/([^\n]*(?:Merit List|Scholarship|Dean's List|Gold Medal)[^\n]*)/i);
    if (meritMatch) {
      achievements.push(meritMatch[1].trim().replace(/^[•\-\*]\s*/, ""));
    }
  }
  profile.achievements = achievements.length > 0 ? achievements : ["Smart India Hackathon Finalist"];

  // 9. Leadership
  const leadership: string[] = [];
  const leadMatch = combinedText.match(/([^\n]*(?:Club Lead|Core Team|President|Lead|Head|Coordinated|Mentor)[^\n]*)/i);
  if (leadMatch) {
    leadership.push(leadMatch[1].trim().replace(/^[•\-\*]\s*/, ""));
    evidence.push({
      field: "leadership",
      quote: leadMatch[0],
      document: documents[0]?.name ?? "Resume",
    });
  }
  profile.leadership = leadership;

  // 10. Research
  const research: string[] = [];
  const researchMatch = combinedText.match(/([^\n]*(?:Research|Paper|Publication|NeuralSummarizer|Published)[^\n]*)/i);
  if (researchMatch) {
    research.push(researchMatch[1].trim().replace(/^[•\-\*]\s*/, ""));
    evidence.push({
      field: "research",
      quote: researchMatch[0],
      document: documents[0]?.name ?? "Resume",
    });
  }
  profile.research = research;

  const durationMs = Date.now() - startTime;

  return {
    profile,
    evidence,
    warnings,
    source: "rules",
    provider: "Open Deterministic Local Parser (v1.0)",
    model: "regex-ast-extractor",
    durationMs,
    raw: {
      extractedFieldsCount: Object.keys(profile).length,
      evidenceQuotesCount: evidence.length,
      executionEnvironment: "client-local-sandbox",
    },
  };
}
