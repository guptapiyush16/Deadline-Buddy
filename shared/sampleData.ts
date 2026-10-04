/**
 * Rahul's Sample Documents for 1-Click Demo Testing
 *
 * Modeled after our friend Rahul Sharma, a 3rd-year CS student at NITK
 * navigating obscure eligibility requirements for study-abroad master's scholarships.
 */

export const RAHUL_RESUME_TEXT = `RAHUL SHARMA
Email: rahul.sharma.tech@gmail.com | Phone: +91 98765 43210 | Location: Bengaluru, India
GitHub: github.com/rahulsharma-dev | LinkedIn: linkedin.com/in/rahulsharma-tech

EDUCATION
National Institute of Technology Karnataka (NITK), Surathkal
Bachelor of Technology (B.Tech) in Computer Science and Engineering
Year of Study: 3rd Year (Expected Graduation: June 2027)
Cumulative GPA (CGPA): 8.40 / 10.00 (till Semester 5)
Nationality: Indian

TECHNICAL SKILLS
• Languages: Python, TypeScript, JavaScript, C++, SQL
• Frameworks & Libraries: React, Node.js, FastAPI, PyTorch, Scikit-Learn, Docker, Git
• Core Topics: Machine Learning, Natural Language Processing, Algorithms, Data Structures

PROJECTS & RESEARCH
• NeuralSummarizer: Extractive & abstractive document summarizer built with PyTorch and Hugging Face Transformers. Benchmarked 89% ROUGE-1 score.
• CampusSync: Open-source academic event scheduler in React & FastAPI used by 800+ department peers.

ACHIEVEMENTS & HONORS
• Finalist, Smart India Hackathon 2025 - Ranked in top 5 out of 1,200 national teams.
• 2nd Place, HackNITK 2024 for automated document triage tool.
• Department Academic Merit List (Top 10% in Year 2).

ACTIVITIES & LEADERSHIP
• Core Tech Lead, Open Source Student Club (conducted 4 workshops for 120+ freshmen).
• Volunteer mentor for CodeForIndia community initiative.`;

export const RAHUL_TRANSCRIPT_TEXT = `OFFICIAL ACADEMIC TRANSCRIPT (UNOFFICIAL STUDENT COPY)
NATIONAL INSTITUTE OF TECHNOLOGY KARNATAKA, SURATHKAL
Student Name: Rahul Sharma
Roll Number: 231CS248
Degree: Bachelor of Technology
Discipline: Computer Science and Engineering
Current Semester: Semester 5 (3rd Year)
Program Duration: 4 Years (2023 - 2027)
Nationality: Indian

ACADEMIC RECORD:
Semester 1: SGPA 8.10 / 10.00
Semester 2: SGPA 8.35 / 10.00
Semester 3: SGPA 8.60 / 10.00
Semester 4: SGPA 8.45 / 10.00
Semester 5: SGPA 8.50 / 10.00

CUMULATIVE GRADE POINT AVERAGE (CGPA): 8.40 / 10.00
Total Credits Earned: 112 / 160
Expected Graduation Date: June 2027
Medium of Instruction: English`;

export const SAMPLE_DOCUMENTS = [
  {
    name: "rahul_resume.pdf",
    type: "Resume / CV",
    text: RAHUL_RESUME_TEXT,
    size: "142 KB",
  },
  {
    name: "transcript_sem5.pdf",
    type: "Official Transcript",
    text: RAHUL_TRANSCRIPT_TEXT,
    size: "218 KB",
  },
];
