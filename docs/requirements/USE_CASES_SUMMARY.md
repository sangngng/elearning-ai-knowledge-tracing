# USE CASE SPECIFICATION (E-LEARNING SYSTEM WITH AI INTEGRATION)

> **Course:** Specialized Project (CO4029), semester HK261  
> **Topic:** Design of an E-Learning System with AI Integration (HK261-DAGD1-480)  
> **Supervisor:** Dr. Nguyen Quoc Minh  
> **Student Authors:** Nguyen Ngoc Sang, Nguyen Huu Hao, Pham Quang Tuan  

---

## 1. System Actors
- **Student:** Enrolls in courses, attends lectures, answers multiple-choice questions, and tracks personalized competency progress.
- **Lecturer / Instructor:** Manages course materials, builds question banks, and tags questions with Knowledge Components (Skill Tags).
- **Admin:** Manages user accounts, assigns system roles, and oversees platform health.
- **AI Analysis Module (Secondary Actor):** Processes student response sequences and infers skill mastery levels (via Knowledge Tracing).

---

## 2. Core Use Case Specifications

### UC1: Log in and view session content
| Attribute | Details |
| :--- | :--- |
| **Use Case Name** | Log in and view session content |
| **Primary Actor** | Student |
| **Secondary Actor** | System |
| **Description** | A visitor registers as a student or logs in with e-mail and password. The student then sees the courses of the active semester as cards, opens a course class, and views the ordered materials (slide, code or video) of a session. |
| **Trigger** | The user opens the Login page, or a logged-in Student selects a session of an enrolled class. |
| **Pre-conditions** | 1. The user has an account, or registers as a student in alternative flow A1.<br>2. For viewing content: the Student has the status "enrolled" in the class (the class list is imported by the Lecturer from the university registration system).<br>3. The device has an Internet connection. |
| **Post-conditions** | 1. The client holds a signed access token that is valid for one day.<br>2. The Student sees only the classes in which he or she is enrolled, and the materials of the selected session in their stored order.<br>3. No data is modified, except that a new student account exists after A1. |
| **Main Flow** | 1. The user opens the Login page.<br>2. The user enters e-mail and password and clicks "Log in".<br>3. The System compares the e-mail (not case-sensitive) and the password with the stored hash, issues an access token valid for one day and returns the user's name and role.<br>4. The System shows the home page with the courses of the active semester as cards (a Student sees the classes he or she is enrolled in; a Lecturer sees the classes he or she teaches).<br>5. The Student selects a course class; the System displays its sessions (Session 1 → Session 15).<br>6. The Student selects a session; the System displays the title, date, room and the ordered list of materials.<br>7. The Student opens a material (slide, code or video). |
| **Alternative Flows** | **A1 – Register:** At step 1 a visitor selects "Register" and enters name, e-mail and a password of at least 8 characters. The System creates a student account, logs the user in and continues at step 4. Lecturer and administrator accounts are created by an administrator.<br>**A2 – No enrolled class:** At step 4 the Student has no class in the active semester. The System shows "You are not enrolled in any class" and suggests contacting the Lecturer.<br>**A3 – No materials:** At step 6 the session has no materials. The System shows "No materials yet". |
| **Exception Flows** | **E1 – Wrong credentials:** The System shows "Invalid email or password" without saying which one is wrong; the user can try again.<br>**E2 – Invalid registration:** A field is empty, the password is shorter than 8 characters or the e-mail is already used. The System shows an error and creates no account.<br>**E3 – Token missing or expired:** The System rejects the request and sends the user back to the Login page.<br>**E4 – Session of another class:** The System shows "not found" and returns no data.<br>**E5 – Material cannot be loaded:** The System shows a "Reload" prompt; the other materials remain usable.<br>**E6 – System error:** The System shows an error message and the user can retry. |
| **Business Rules** | BR1: Passwords are stored only as bcrypt hashes and are never returned by the API.<br>BR2: An access token expires after one day.<br>BR3: A Student can only see classes with enrollment status "enrolled".<br>BR4: Materials have the type slide, code or video and are shown in their position order within the session. |

---

### UC2: Take a multiple-choice quiz (per-answer recording)
| Attribute | Details |
| :--- | :--- |
| **Use Case Name** | Take a multiple-choice quiz (per-answer recording) |
| **Primary Actor** | Student |
| **Secondary Actor** | System |
| **Description** | The Student answers the questions of the published quiz of a session. The System checks every answer on the server, shows immediate feedback and stores each answer as a separate interaction record (user, session, question, skill, correct or not, attempt number, time) for the later competency analysis. |
| **Trigger** | The Student selects "Start" on the quiz of a session. |
| **Pre-conditions** | 1. The Student is logged in.<br>2. The Student is enrolled in the class of the session.<br>3. The quiz is published and has at least one question; every question has a skill label. |
| **Post-conditions** | 1. Each submitted answer has one record in quiz_interactions with the question's skill and attempt_count equal to the number of earlier attempts of this Student on this question plus 1.<br>2. The Student has seen the correctness of each answer and the final score.<br>3. Quizzes, questions and answer keys are not modified. |
| **Main Flow** | 1. The Student opens a session and clicks "Start" on its quiz.<br>2. The System displays the questions in order, each with options A, B, C and D. The answer key is not sent to the browser.<br>3. The Student selects an option and clicks "Submit answer".<br>4. The System checks the answer on the server, stores the interaction record in one transaction and returns whether the answer is correct.<br>5. The System shows the feedback and moves to the next question.<br>6. Steps 3–5 repeat until the last question.<br>7. The System displays the score (correct answers / total questions). |
| **Alternative Flows** | **A1 – No option selected:** At step 3 the System asks the Student to select an option before submitting.<br>**A2 – Retake:** The Student takes the quiz again later. The System adds new records with a higher attempt_count and keeps the earlier ones.<br>**A3 – Exit midway:** Answers already submitted stay stored. The Student can come back and continue with the questions not yet answered.<br>**A4 – No published quiz:** At step 1 the session has no published quiz. The System shows "No quiz for this session". |
| **Exception Flows** | **E1 – Quiz not accessible:** The quiz is not published or the Student is not enrolled in the class. The System answers "Quiz not found" and stores nothing.<br>**E2 – Invalid answer set:** A question does not belong to the quiz, or the same question appears twice in one submission. The System rejects the request and stores nothing (the transaction is rolled back).<br>**E3 – Token expired:** The System asks the Student to log in again.<br>**E4 – Connection lost:** The answer is not stored; the Student can submit it again when the connection returns.<br>**E5 – System error:** The System rolls back, shows an error message and allows the Student to retry. |
| **Business Rules** | BR1: The correct answer exists only on the server and is never included in a response to a learner.<br>BR2: Every answer creates one quiz_interactions record; its skill_id is copied from the question.<br>BR3: attempt_count increases by 1 for each new attempt of the same Student on the same question; simultaneous submissions are processed one after another.<br>BR4: Score = number of correct answers / number of submitted answers. |

---

### UC3: Create a question and assign a skill label
| Attribute | Details |
| :--- | :--- |
| **Use Case Name** | Create a question and assign a skill label |
| **Primary Actor** | Lecturer |
| **Secondary Actor** | System |
| **Description** | The Lecturer adds a multiple-choice question with four options to the quiz of a session, marks the correct option and assigns exactly one skill label from the skill catalog. The skill label links the question to the interaction records used for knowledge tracing. |
| **Trigger** | The Lecturer selects "Add question" in the quiz of a session. |
| **Pre-conditions** | 1. The Lecturer is logged in with the role instructor (or admin).<br>2. The Lecturer is in charge of the class of the session.<br>3. The session has a quiz, and the skill catalog contains the skill labels of the course (for example DSA-ARRAY, DSA-HEAP). |
| **Post-conditions** | 1. The question is stored in the quiz with its prompt, four options, correct answer, skill label and the next free position.<br>2. The question appears in the quiz when the quiz is published, and every later answer to it is recorded with its skill label. |
| **Main Flow** | 1. The Lecturer opens the quiz of a session and selects "Add question".<br>2. The Lecturer enters the question text.<br>3. The Lecturer enters the four options A, B, C and D.<br>4. The Lecturer marks the correct option.<br>5. The Lecturer selects one skill label from the catalog.<br>6. The Lecturer clicks "Save".<br>7. The System validates the data, stores the question at the next position of the quiz and shows a confirmation. |
| **Alternative Flows** | **A1 – New skill needed:** At step 5 the skill does not exist. The Lecturer creates it (unique code and name) in a dialog and returns to step 5.<br>**A2 – Edit a question:** The Lecturer edits the text, the options, the correct answer or the skill label of a question; the System validates again (step 7) and saves.<br>**A3 – Delete a question:** The System warns that the interaction records of this question will be deleted as well; after confirmation it deletes the question.<br>**A4 – Publish the quiz:** After adding questions the Lecturer publishes the quiz so that enrolled Students can take it (UC2). |
| **Exception Flows** | **E1 – Missing data:** The question text or an option is empty. The System highlights the field and does not save.<br>**E2 – No correct answer:** No option is marked, or the marked option is not one of A–D. The System asks the Lecturer to mark one.<br>**E3 – No skill label:** The System refuses to save, because every question needs a skill label to be used in knowledge tracing.<br>**E4 – Duplicate skill code:** When creating a new skill (A1) the code already exists. The System rejects it and suggests selecting the existing skill.<br>**E5 – No permission:** The user is not the Lecturer of the class. The System denies access.<br>**E6 – System error:** The question cannot be saved. The System shows an error and keeps the entered data so the Lecturer can retry. |
| **Business Rules** | BR1: A question has exactly four options and exactly one correct answer.<br>BR2: A question has exactly one skill label.<br>BR3: The position of a question is unique within its quiz.<br>BR4: The correct answer is private and is never sent to learners. |

---

### UC4: View the knowledge competency chart
| Attribute | Details |
| :--- | :--- |
| **Use Case Name** | View the knowledge competency chart |
| **Primary Actor** | Student |
| **Secondary Actor** | AI Analysis Module, System |
| **Description** | The Student opens the competency view of a course class. The System sends the Student's answer history to the AI Analysis Module, which estimates the mastery of each skill. The result is shown as a radar chart together with the skills that need review and the sessions where they are taught. This use case belongs to phase 2. |
| **Trigger** | The Student selects the "My Competency" tab of a course class. |
| **Pre-conditions** | 1. The Student is logged in and enrolled in the class.<br>2. The Student has answered at least one quiz question that has a skill label (UC2), so interaction records exist.<br>3. The AI Analysis Module is running (otherwise alternative flow A3 applies). |
| **Post-conditions** | 1. The Student sees the mastery level of every skill that he or she has answered, with the status Mastered, Developing or Needs Review.<br>2. No stored data is modified; the mastery values are computed from quiz_interactions on request. |
| **Main Flow** | 1. The Student opens the "My Competency" tab of a class.<br>2. The System reads the Student's interaction records in time order and sends them (question, skill, correct or not) to the AI Analysis Module.<br>3. The AI Analysis Module estimates the mastery probability of each skill with the knowledge tracing model (BKT in phase 2A) and returns it.<br>4. The System classifies each skill: Mastered (0.75 or higher), Developing (from 0.50 to below 0.75) or Needs Review (below 0.50).<br>5. The Frontend draws a radar chart with one axis per skill.<br>6. For each skill that needs review, the System lists the sessions of the class whose quiz contains questions of that skill, as review links.<br>7. The Student selects a skill to see his or her earlier answers to its questions. |
| **Alternative Flows** | **A1 – No data yet:** At step 1 the Student has no interaction record. The System shows "Not enough data" and a link to the quizzes of the class.<br>**A2 – Too few answers for a skill:** At step 4 a skill has fewer answers than the minimum set in the system configuration. The System marks it "Calibrating" and does not classify it.<br>**A3 – AI module not available:** At step 2 the AI Analysis Module does not answer in time or returns an error. The System shows the percentage of correct answers per skill instead and states that the AI estimate is temporarily unavailable.<br>**A4 – Retake and refresh:** After the Student retakes a quiz (UC2), reopening the tab shows the updated chart. |
| **Exception Flows** | **E1 – Not enrolled:** The Student is not enrolled in the class. The System denies access and shows no data.<br>**E2 – Token expired:** The System asks the Student to log in again.<br>**E3 – Invalid result from the AI module:** The result misses a skill or contains a value outside 0–1. The System ignores that value and uses the percentage of correct answers for the skill (as in A3).<br>**E4 – System error:** The data cannot be loaded. The System shows an error message and allows the Student to reload. |
| **Business Rules** | BR1: Only the Student's own interaction records are used; a Student cannot see the competency of another Student.<br>BR2: The thresholds are 0.75 for Mastered and 0.50 for Developing.<br>BR3: A skill is evaluated only from answers to questions that carry that skill label.<br>BR4: The AI Analysis Module only reads the data sent to it and does not write to the database. |
