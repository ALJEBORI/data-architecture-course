# Data Architect Practical Tracker v4: Comprehensive Guide

---

## 1. Executive Summary

The file **`data_architect_practical_tracker_v4.xlsx`** is an intensive, 20-week, milestone-driven execution plan, portfolio builder, and certification roadmap designed to transition/upskill a data engineer or integration specialist into a senior **Data Architect**, **Data Platform Architect**, or **Solutions Architect**.

Rather than relying purely on passive video consumption, the program enforces a **practical-first strategy**:
- **Total Duration**: 20 Weeks (10 hours per week = 200 hours total)
- **Workload Balance**: **61% Practical Project / Build** (122 hours) vs. **39% Study / Theory** (78 hours)
- **Central Project ("OrderFlow")**: One production-grade, end-to-end B2B Order-to-Cash data platform built iteratively across the 20 weeks.
- **Certifications**: 3 vendor and industry credentials timed strategically across the phases.
- **Proof-of-Work**: 28 tangible deliverables (Architecture Decision Records / ADRs, dbt models, infrastructure scripts, C4 diagrams, governance policies, and a video walkthrough).

---

## 2. The 10 Workbook Sheets Explained

The workbook is structured into 10 linked worksheets:

### 1. `Dashboard`
- **Role**: Command center and progress cockpit.
- **Key Formulas & Metrics**:
  - Overall progress (% of weeks complete, hours logged vs. planned).
  - Practical share of hours calculation.
  - Deliverables completed counter (`x / 28`).
  - Udemy courses and certifications tracker.
  - Phase-by-phase completion breakdown.
  - Exam readiness monitor (calculates best practice test scores and flags `"Ready to book"` when $\ge 80\%$).
- **User Inputs**:
  - Cell `B4`: **Start Date** (set your start Monday).
  - Cell `B5`: **Practice-exam readiness target** (default `80%`).

### 2. `This Week`
- **Role**: Daily tactical driver. Focuses exclusively on the current 7-day period and hides distractions.
- **Dynamic Logic**: Automatically detects what week number you are on using `=TODAY() - Dashboard!B4`. (Cell `B4` has an optional manual override).
- **Contents**:
  - Current Phase, Week Start Date, Study Focus, and Build Milestone.
  - Primary links and definition of "Done".
  - **10-Hour Weekly Rhythm**:
    - **Mon (1.5h) & Tue (1.5h)**: Core study / theory.
    - **Wed (2h) & Thu (1.5h)**: Start hands-on milestone.
    - **Sat (3h)**: Deep work block to complete and commit deliverables.
    - **Sun (0.5h)**: Weekly retro, time logging, and planning ahead.
  - Fallback contingency instructions if you fall behind.

### 3. `Setup`
- **Role**: Pre-flight checklist to complete before Week 1 starts.
- **Checklist Items**:
  1. Create the GitHub repository named `orderflow`.
  2. Enter your real start date on the `Dashboard`.
  3. Install Python 3 and code editor (VS Code / Cursor).
  4. Install Docker for running local containers (Airflow, OpenMetadata).
  5. Schedule Snowflake trial account setup (timing it close to Week 4 so credits do not expire).
  6. Schedule GCP free-tier account setup with budget alerts (close to Week 10).
  7. Verify corporate Udemy / learning portal access.
  8. Confirm company training budget / exam voucher policies.

### 4. `Weekly Plan`
- **Role**: The master 20-week curriculum and progress log.
- **Structure per Week**:
  - `Week Number` & `Week Starts Date` (calculated from Dashboard).
  - `Phase`.
  - `Study Focus (Learn)`: Theoretical topic.
  - `Course / Resource Name` and `Direct URL`.
  - `Udemy Support Slot`.
  - `Build Milestone (Hands-on)`: What to code/design.
  - `Milestone Action`: High-priority operational triggers (e.g., "BOOK exam", "EXAM DAY").
  - `Done When`: Acceptance criteria.
  - `Deliverable IDs`: Corresponding deliverables on the `Deliverables` tab.
  - `Planned Study / Project Hours`.
  - `Status Dropdown` (`Not started`, `In progress`, `Done`).
  - `Actual Hours Logged`.

### 5. `Project Overview`
- **Role**: Specification document for the flagship portfolio project: **OrderFlow**.
- **Platform Architecture**:
  - **Scenario**: Mid-size B2B distributor receiving Purchase Orders (850), Advance Shipping Notices (856), and Invoices (810) via EDI/API files with realistic injected flaws (duplicates, bad records, late arrivals).
  - **Architecture Layers**: Ingestion $\rightarrow$ `RAW` $\rightarrow$ `STG` $\rightarrow$ `CORE` (Kimball dimensional modeling, with Data Vault alternative documented) $\rightarrow$ `MART` $\rightarrow$ Serving (BI, secure data shares, MCP server for AI agents).
  - **Tech Stack**: Snowflake (primary), Google BigQuery (secondary comparison), dbt, Dockerized Apache Airflow, OpenMetadata / Marquez for lineage.
  - **Cost Controls**: Zero-cost guardrails using free tiers, auto-suspend warehouses, and daily budget alerts.

### 6. `Udemy Courses`
- **Role**: Course evaluation and vetting log.
- **Features**:
  - Pre-filled search keywords for 5 CORE courses (SnowPro Architect, GCP Data Engineer, CDMP) and 5 OPTIONAL slots (Data Modeling, Airflow, Governance/MDM, AI Agents/MCP, Architecture Interviews).
  - Contains a date-check formula: `=IF(TODAY()-date <= 365, "Yes", "No: check another course")` ensuring course materials are kept current within 12 months.

### 7. `Practice Exams`
- **Role**: Mock exam score tracker.
- **Workflow**:
  - Log test vendor, attempt number, date, percentage score, and observed weak areas.
  - Feeds into the Dashboard formula to verify if readiness criteria are met before spending money on exam booking.

### 8. `Deliverables`
- **Role**: Catalog of 28 proof-of-work assets (D01 to D28).
- **Details**:
  - Suggested due dates calculated automatically relative to your start date.
  - Explicit "Proof of Done" requirements (e.g., passing `dbt test`, SQL role scripts, C4 architecture diagrams, recorded videos).
  - User fields for Status and GitHub commit links.

### 9. `Certifications`
- **Role**: Milestone schedule and booking tracker for the 3 target credentials:
  1. **SnowPro Advanced: Architect** (Exam target: Week 9 / Book by Week 4)
  2. **Google Cloud Professional Data Engineer** (Exam target: Week 14 / Book by Week 10)
  3. **CDMP Data Management Fundamentals** (Exam target: Week 18 / Book by Week 15)

### 10. `Application Log`
- **Role**: Job application CRM starting in Week 10.
- **Target Titles**: Data Architect, Data Platform Architect, Solutions Architect (Data), Integration Architect, Lead Data Engineer.
- **Tracking Fields**: Company, Role Title, Date Applied, Source, Status, and Next Steps.

---

## 3. The 20-Week Phase Breakdown

```
[Weeks 1-3]   Phase 1: Enterprise Data Modeling & Foundations
[Weeks 4-9]   Phase 2: Snowflake Architecture & SnowPro Architect Exam
[Weeks 10-14] Phase 3: GCP Data Engineering & GCP PDE Exam (Job hunt starts)
[Weeks 15-18] Phase 4: Data Governance, MDM, AI Agents (MCP) & CDMP Exam
[Weeks 19-20] Phase 5: Portfolio Finalization, Video Demo & System Design Interviews
```

### Phase 1: Data Modeling (Weeks 1–3)
* **Week 1**: Kimball dimensional modeling (grain, facts, conformed dimensions, bus matrix). Deliverables: Scenario inventory (`D01`), Bus matrix (`D02`).
* **Week 2**: Slowly Changing Dimensions (SCD Type 2), bridge tables, dbt snapshots. Deliverables: Python synthetic data generator (`D03`), dbt customer snapshot (`D04`).
* **Week 3**: Data Vault 2.0 vs. Medallion vs. OBT. Deliverables: Order-to-cash logical model (`D05`), **ADR-001** (Kimball vs. Data Vault per layer) (`D06`).

### Phase 2: Snowflake Architecture (Weeks 4–9)
* **Week 4**: Organization & Account design, editions, multi-region, environment provisioning. Deliverables: Snowflake setup scripts (`D07`), **ADR-002** (Environment & Account strategy) (`D08`). *Action: Book SnowPro Architect Exam.*
* **Week 5**: Enterprise Security: RBAC hierarchy, dynamic data masking, row access policies. Deliverables: RBAC and masking scripts with multi-role test queries (`D09`).
* **Week 6**: Secure Data Sharing, cross-cloud replication, disaster recovery (RPO/RTO). Deliverables: Clean partner share and BCP/DR architecture design note (`D10`).
* **Week 7**: Performance optimization & cost management: micro-partitioning, clustering, warehouse sizing, query profile analysis. Deliverables: dbt bronze/silver/gold pipeline (`D11`), Cost & Performance benchmark report (`D12`).
* **Week 8**: Near-real-time & streaming: Streams, Tasks, Dynamic Tables, Iceberg integration. Deliverables: Automated incremental ingestion pipeline (`D13`).
* **Week 9**: SnowPro Architect review and practice tests. Deliverables: Snowflake Architecture diagram v1 (`D14`).
  * **Milestone**: **EXAM DAY — SnowPro Advanced: Architect**.

### Phase 3: GCP Data Engineering (Weeks 10–14)
* **Week 10**: GCP project setup, BigQuery architecture (partitioning, clustering, slot management, authorized views). Deliverables: BigQuery load and optimization design (`D15`). *Action: Book GCP PDE exam & Begin Job Applications.*
* **Week 11**: Streaming data ingestion: Google Cloud Pub/Sub and BigQuery streaming inserts/Dataflow. Deliverables: Real-time event streaming slice (`D16`).
* **Week 12**: Orchestration and storage strategy: Apache Airflow (Docker), GCS classes, Bigtable vs. Spanner. Deliverables: Orchestrated Airflow DAG + Storage Selection Matrix (`D17`).
* **Week 13**: Cloud Security & Compliance: Google Cloud IAM, VPC Service Controls, Cloud DLP (Data Loss Prevention), Dataplex. Deliverables: GCP Security & Governance Report (`D18`).
* **Week 14**: GCP PDE review and practice tests. Deliverables: **ADR-004** (Snowflake vs. BigQuery architectural and cost comparison across 3 workloads) (`D19`).
  * **Milestone**: **EXAM DAY — Google Cloud Professional Data Engineer**.

### Phase 4: Data Governance, MDM & CDMP (Weeks 15–18)
* **Week 15**: Data quality, observability, metadata management, and lineage. Deliverables: dbt data tests + local catalog/lineage graph via OpenMetadata or Marquez (`D20`). *Action: Book CDMP exam.*
* **Week 16**: Master Data Management (MDM): Customer golden record, match/merge survivorship rules, reference data. Deliverables: Customer Golden Record matching code (`D21`).
* **Week 17**: AI-ready Governance & Model Context Protocol (MCP): Serving governed data views, data dictionary, and metadata to AI agents with RBAC enforcement. Deliverables: Working MCP Server tested with Claude Desktop (`D22`).
* **Week 18**: Privacy and compliance: GDPR, Right-to-Erasure, data classification, retention policies. Deliverables: Governance & GDPR Architecture Blueprint (`D23`).
  * **Milestone**: **EXAM DAY — CDMP Fundamentals (DAMA-DMBOK)**.

### Phase 5: Portfolio Polish & Job Search (Weeks 19–20)
* **Week 19**: Architecture communication: C4 model diagrams (Context, Container, Component). Deliverables: Final C4 diagrams (`D24`), Production README & Runbook (`D25`), 5–10 min video walkthrough (`D26`).
* **Week 20**: Architect interview prep: System design defense, trade-off storytelling, CV rewrite for architect scope, LinkedIn publication. Deliverables: Rewritten Architect CV (`D27`), LinkedIn project article (`D28`), 3 mock architecture interviews.

---

## 4. Step-by-Step Instructions: How to Use the Tracker

### Day 1: Setup
1. Open `data_architect_practical_tracker_v4.xlsx` in Excel.
2. Go to the **`Dashboard`** tab:
   - Click on cell **`B4`** and enter your desired start date (must be a Monday, e.g., `2026-10-19`).
   - Notice how all dates across `Weekly Plan`, `Deliverables`, and `Certifications` recalculate automatically.
3. Open the **`Setup`** tab:
   - Walk through tasks 1–8. Initialize your GitHub repository `orderflow` and configure your local development environment (Python 3, Docker).

### Weekly Routine
- **Daily Focus**: Navigate directly to the **`This Week`** tab. It calculates your current week based on today's date. Keep your focus strictly on that week's:
  - *Study focus and course link*
  - *Build milestone description*
  - *Deliverable IDs*
- **Follow the 10-Hour Rhythm**:
  - Mon/Tue: 3 hours study.
  - Wed/Thu: 3.5 hours building.
  - Saturday: 3 hours deep work to finish and commit code.
  - Sunday: 30 minutes updating the tracker.

### Weekly Closeout (Every Sunday)
1. In the **`Deliverables`** tab:
   - Mark completed deliverables as `Done` in Column `G`.
   - Paste the direct GitHub commit or pull request URL in Column `H`.
2. In the **`Weekly Plan`** tab:
   - Set the week's Status to `Done` in Column `N`.
   - Log the actual hours spent in Column `O`.
3. In the **`Practice Exams`** tab:
   - Log scores as you take mock tests. Check the `Dashboard` readiness indicator before booking exam dates.
4. In the **`Application Log`** tab:
   - From Week 10 onward, record job applications, recruiter screens, and interview feedback.

---

## 5. Golden Rules for Success

1. **Yellow Cells with Blue Text**: These are the only cells designed for manual entry. All other cells contain automatic formulas—do not overwrite them.
2. **If You Fall Behind**:
   - **Shrink the week, not the plan**: Complete the build deliverable and skip optional study videos.
   - **Protect three critical assets**: Fixed exam dates, Architecture Decision Records (ADRs), and a clean GitHub `README`.
   - **Cut optional stretch items first**: Drop the streaming Pub/Sub slice, Iceberg table, or full Airflow DAG before cutting documentation or core models.
3. **Change the Plan Only on Sundays**: Maintain strict focus during the week and make adjustments only during your Sunday retro.
