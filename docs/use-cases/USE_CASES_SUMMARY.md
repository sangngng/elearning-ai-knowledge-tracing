# USE CASE SPECIFICATION (E-LEARNING SYSTEM WITH AI INTEGRATION)

> **Course:** Capstone Project / Graduation Project (ĐACN - ĐATN HK261)  
> **Topic:** Design of an E-Learning System with AI Integration (HK261-DAGD1-480)  
> **Supervisor:** Dr. Nguyen Quoc Minh  
> **Student Authors:** Nguyen Ngoc Sang (Leader), Nguyen Huu Hao, Pham Quang Tuan  

---

## 1. System Actors
- **Student:** Enrolls in courses, attends lectures, answers multiple-choice questions, and tracks personalized competency progress.
- **Lecturer / Instructor:** Manages course materials, builds question banks, and tags questions with Knowledge Components (Skill Tags).
- **Admin:** Manages user accounts, assigns system roles, and oversees platform health.
- **AI Analysis Module (Secondary Actor):** Processes student response sequences and infers skill mastery levels (via Knowledge Tracing).

---

## 2. Core Use Case Specifications

### UC1: Log in and View Lecture Content
| Attribute | Details |
| :--- | :--- |
| **Use Case Name** | Log in and view lecture content |
| **Actor** | Student |
| **Pre-condition** | The student has an account; is enrolled in the course; the device has an Internet connection. |
| **Main Flow** | 1. The student opens the Login page.<br>2. The student enters email/student ID and password, then clicks "Log in".<br>3. The system verifies that the credentials are valid.<br>4. The system displays the Home page with the student's course list.<br>5. The student selects a course, then selects a lecture.<br>6. The system displays the lecture content (text/video).<br>7. The system records the student's learning progress. |
| **Alternative Flow** | **3a. Wrong credentials:** The system shows an error and allows re-entry; after 5 failed attempts the account is temporarily locked.<br>**3b. Forgot password:** The student selects "Forgot password" and receives a password reset link.<br>**4a. Not enrolled in any course:** The system displays "You have no courses yet" with an exploration link.<br>**6a. Video fails to load:** The system shows a "Reload" prompt and displays fallback text content. |

---

### UC2: Take a Multiple-Choice Quiz (Per-Question Tracking)
| Attribute | Details |
| :--- | :--- |
| **Use Case Name** | Take a multiple-choice quiz |
| **Actor** | Student |
| **Pre-condition** | The student is logged in; the quiz is open and belongs to an enrolled course; questions are available in the question bank. |
| **Main Flow** | 1. The student selects a quiz from the course page and clicks "Start".<br>2. The system displays the first question with options A, B, C, D.<br>3. The student selects an option and clicks "Submit answer".<br>4. The system immediately records the interaction record `(user_id, question_id, skill_id, is_correct, timestamp)` into the database.<br>5. The system shows immediate correctness feedback and transitions to the next question.<br>6. Steps 3–5 repeat until the quiz is completed.<br>7. The system saves the quiz completion summary and displays the final score. |
| **Alternative Flow** | **3a. Submitting without selection:** The system prompts the student to select an option before proceeding.<br>**4a. Network disconnection:** The system caches the answer locally in browser storage and syncs once reconnected.<br>**6a. Student exits midway:** The system preserves submitted answers and allows resuming later.<br>**6b. Time limit expiration:** The system auto-submits current answers, marking unattempted questions as unanswered. |

---

### UC3: Create a Question and Assign a Skill Tag
| Attribute | Details |
| :--- | :--- |
| **Use Case Name** | Create a question and assign a Skill Tag |
| **Actor** | Lecturer / Instructor |
| **Pre-condition** | The lecturer is logged in with Lecturer permissions; is assigned to the course; the course Skill Tag catalog is established. |
| **Main Flow** | 1. The lecturer navigates to the "Question Bank" and selects "Add Question".<br>2. The lecturer inputs the prompt and 4 options (A, B, C, D).<br>3. The lecturer marks the correct option.<br>4. The lecturer selects one or more Skill Tags from the catalog (e.g., `CTDL-CAY-01`).<br>5. The lecturer clicks "Save".<br>6. The system validates inputs, persists the question with associated Skill Tags, and confirms success. |
| **Alternative Flow** | **2a. Missing fields:** The system highlights incomplete inputs and blocks saving.<br>**3a. No correct answer chosen:** The system prompts the lecturer to mark an answer.<br>**4a. No Skill Tag assigned:** The system warns that the question will be excluded from Knowledge Tracing and offers saving as draft.<br>**4b. New Skill required:** The lecturer creates a new Skill Tag directly from the modal, then returns to Step 4. |

---

### UC4: View Knowledge Competency Chart (AI Radar Chart)
| Attribute | Details |
| :--- | :--- |
| **Use Case Name** | View knowledge competency chart |
| **Actor** | Student (Secondary Actor: AI Analysis Module) |
| **Pre-condition** | The student is logged in; has completed at least one quiz with Skill-Tagged questions; interaction logs exist. |
| **Main Flow** | 1. The student navigates to "My Competency" tab in the course view.<br>2. The backend sends the student's interaction sequence to the AI Analysis Service.<br>3. The AI service computes the mastery probability for each Knowledge Component and returns results.<br>4. The frontend renders a dynamic Radar Chart displaying mastery levels per skill.<br>5. The system generates pedagogical recommendations: highlights mastered skills and flags weak skills with remedial lecture links.<br>6. The student clicks on an individual skill to view past question history. |
| **Alternative Flow** | **1a. Insufficient data:** If no quiz has been taken, the system shows "Not enough data" with a link to practice quizzes.<br>**3a. Insufficient skill samples:** If a skill has fewer than threshold interactions, it is labeled as "Calibrating".<br>**3b. AI Service timeout/failure:** The system falls back to calculating an empirical accuracy percentage and notes that real-time AI estimation is temporarily unavailable. |
