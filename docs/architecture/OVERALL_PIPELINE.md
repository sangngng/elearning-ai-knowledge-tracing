# OVERALL SYSTEM ARCHITECTURE & AI PIPELINE

> **System:** Adaptive E-Learning System with Integrated Knowledge Tracing  
> **Authors:** Nguyen Ngoc Sang (Lead), Nguyen Huu Hao, Pham Quang Tuan  
> **Advisor:** Dr. Nguyen Quoc Minh (Department of Artificial Intelligence, HCMUT CSE)  

---

## 1. High-Level Architecture (3-Tiered Architecture)

The system adopts a modular decoupled microservices architecture designed to support high-throughput interactive learning and asynchronous AI evaluation.

```mermaid
graph TD
    subgraph ClientLayer ["1. Presentation Layer (Frontend - Next.js)"]
        UI_Student["Student Portal<br/>• Lecture Viewer<br/>• Per-Question Quiz Runner<br/>• Dynamic Radar Chart"]
        UI_Lecturer["Instructor Portal<br/>• Course Authoring<br/>• Question Bank & Skill Tagging<br/>• Class Mastery Analytics"]
    end

    subgraph APILayer ["2. Application Backend Layer (Node.js / Express API)"]
        AuthService["Auth & RBAC Service<br/>(JWT + Bcrypt)"]
        CourseService["Curriculum Service<br/>(Courses, Lessons, Quizzes)"]
        InteractionService["Interaction Logging Service<br/>(Telemetry Ingestion)"]
        AIProxy["AI Orchestration Gateway<br/>(Feature Extraction & Cache)"]
    end

    subgraph DataLayer ["3. Persistence Layer"]
        Postgres[(PostgreSQL 15+<br/>• Users, Courses, Lessons<br/>• Skills & Questions<br/>• quiz_interactions)]
    end

    subgraph AIEngine ["4. AI & Knowledge Tracing Microservice (FastAPI / PyTorch)"]
        DataPipeline["Sequence Preprocessor<br/>(Batching & One-Hot/Embedding)"]
        BKT_Model["BKT Baseline Model<br/>(Markov Probabilistic Estimator)"]
        DKT_Model["DKT Neural Engine<br/>(LSTM / RNN Latent State)"]
        BenchmarkRepo["Benchmark Dataset<br/>(ASSISTments 2009-2010)"]
    end

    UI_Student -->|REST / JSON| APILayer
    UI_Lecturer -->|REST / JSON| APILayer
    AuthService --> Postgres
    CourseService --> Postgres
    InteractionService -->|Insert response record| Postgres
    AIProxy -->|Query user response sequence| Postgres
    AIProxy -->|HTTP POST sequence| DataPipeline
    DataPipeline --> DKT_Model
    DataPipeline --> BKT_Model
    BenchmarkRepo -.->|Pre-train weights| DKT_Model
    DKT_Model -->|Return mastery probability vector| AIProxy
    AIProxy -->|JSON mastery levels| UI_Student
```

---

## 2. Telemetry and Knowledge Tracing Pipeline Flow

The end-to-end data flow operates in 5 deterministic stages:

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant Web as Next.js Frontend
    participant API as Backend Core
    participant DB as PostgreSQL DB
    participant AI as AI KT Service

    Student->>Web: Selects option and clicks "Submit"
    Web->>API: POST /api/quizzes/interactions<br/>{question_id, skill_id, choice, is_correct}
    API->>DB: INSERT INTO quiz_interactions
    DB-->>API: 201 Created

    alt Real-time Mastery Request
        Web->>API: GET /api/analytics/competency/:userId
        API->>DB: SELECT * FROM quiz_interactions WHERE user_id=:id ORDER BY created_at ASC
        DB-->>API: Sequential records X = (x_1, x_2, ..., x_t)
        API->>AI: POST /predict-mastery { user_id, interactions: [...] }
        AI->>AI: Encode into sequence tensor x_t, update hidden state h_t
        AI-->>API: { mastery: { "CTDL-CAY-01": 0.82, "CTDL-CAY-02": 0.43, ... } }
        API-->>Web: Competency Payload
        Web->>Student: Render updated Radar Chart & recommend remedial lectures
    end
```

---

## 3. Technology Stack Summary

| Component | Selected Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend UI** | Next.js 14+ (React 18), Tailwind CSS | App Router architecture, responsive design, fast interactive rendering. |
| **Backend API** | Node.js (Express) / TypeScript | Lightweight asynchronous I/O, rapid JSON API development, JWT RBAC support. |
| **Database** | PostgreSQL 15 | Strict relational integrity, UUID generation, fast JSONB storage, composite time-series indexing. |
| **AI Service** | Python 3.10+, FastAPI, PyTorch | Industry standard for deep learning inference, async HTTP endpoints, NumPy/Pandas data manipulation. |
| **Containerization** | Docker, Docker Compose | Unified local development and reproducible production deployment. |

---

## 4. Architectural & System Design Diagrams

All diagrams have been created following academic UML standards and are provided in both **Draw.io source format** (`.drawio`) for live editing and **high-resolution PNG format** (`.png`) for report/slide embedding:

| Figure | Diagram Name | Draw.io Source File | Rendered PNG Image |
| :--- | :--- | :--- | :--- |
| **Figure 3.1** | **Overall UML Use Case Diagram** | [`01_use_case_diagram.drawio`](file:///c:/Users/PC/Documents/HCMUT/doanchuyennganh/Elearning-AI/docs/diagrams/01_use_case_diagram.drawio) | [`01_use_case_diagram.png`](file:///c:/Users/PC/Documents/HCMUT/doanchuyennganh/Elearning-AI/docs/diagrams/01_use_case_diagram.png) |
| **Figure 4.1** | **Decoupled 3-Tier System Architecture** | [`02_system_architecture.drawio`](file:///c:/Users/PC/Documents/HCMUT/doanchuyennganh/Elearning-AI/docs/diagrams/02_system_architecture.drawio) | [`02_system_architecture.png`](file:///c:/Users/PC/Documents/HCMUT/doanchuyennganh/Elearning-AI/docs/diagrams/02_system_architecture.png) |
| **Figure 4.2** | **UML Activity Diagram (Quiz & Telemetry)** | [`03_activity_diagram.drawio`](file:///c:/Users/PC/Documents/HCMUT/doanchuyennganh/Elearning-AI/docs/diagrams/03_activity_diagram.drawio) | [`03_activity_diagram.png`](file:///c:/Users/PC/Documents/HCMUT/doanchuyennganh/Elearning-AI/docs/diagrams/03_activity_diagram.png) |
| **Figure 5.1** | **DKT Mathematical Inference Pipeline** | [`04_ai_pipeline_diagram.drawio`](file:///c:/Users/PC/Documents/HCMUT/doanchuyennganh/Elearning-AI/docs/diagrams/04_ai_pipeline_diagram.drawio) | [`04_ai_pipeline_diagram.png`](file:///c:/Users/PC/Documents/HCMUT/doanchuyennganh/Elearning-AI/docs/diagrams/04_ai_pipeline_diagram.png) |
| **Figure 5.2** | **Relational Database Schema (ERD)** | [`schema.dbml`](file:///c:/Users/PC/Documents/HCMUT/doanchuyennganh/Elearning-AI/docs/database/schema.dbml) | [`05_erd_database.png`](file:///c:/Users/PC/Documents/HCMUT/doanchuyennganh/Elearning-AI/docs/diagrams/05_erd_database.png) |

