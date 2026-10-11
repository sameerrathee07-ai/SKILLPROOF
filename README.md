# SkillProof

> Quality-Gated Education Problem Solving Platform connecting student solvers with educational organizations (coaching centers, tuition providers, and college departments).

---

## Core Product Thesis & Gate Architecture
SkillProof eliminates low-quality noise through an explainable, deterministic gate:
- **Tier 1: Binary Knockouts (Immediate Fail)**
  1. **Pricing Check:** Must contain explicit numbers or currency symbols (₹, $, Rs) in budget or milestones.
  2. **Alternatives Check:** Must list and evaluate at least 2 distinct alternative approaches.
  3. **Minimum Effort Check:** Total pitch length must exceed 200 characters across all fields.
- **Tier 2: 6-Dimension Quality Score (0 to 10 Scale, Threshold = 6.0)**
  1. Problem Diagnosis (Weight: 2.0)
  2. Solution Actionability (Weight: 2.0)
  3. Alternatives Depth (Weight: 1.5)
  4. Pricing Transparency (Weight: 1.5)
  5. Solver Proof & Credentials (Weight: 1.5)
  6. Constraints & Feasibility (Weight: 1.5)
- **Zero LLM Dependency:** Pure TypeScript stateless scoring engine (`/lib/scoring/engine.ts`).

---

## Tech Stack
- **Framework:** Next.js 14+ (App Router, TypeScript, Tailwind CSS, Lucide icons)
- **Database & ORM:** SQLite with Prisma (`User`, `Organization`, `Problem`, `Pitch`)
- **Multi-Tenancy:** Scoped by `organizationId` from day one

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env

# 3. Push schema to SQLite
npm run db:push

# 4. Seed sample education data
npm run db:seed

# 5. Run deterministic Gate Calibration Suite (VAL-1 to VAL-6)
npm run calibrate

# 6. Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Architecture & Code Organization
Complete technical architecture and layered design is documented in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md):
- **Services Layer (`lib/services/`)**: Pure business logic decoupled from UI and routes.
- **Config & Env (`lib/config/env.ts`)**: Centralized typed runtime settings.
- **State Management (`lib/hooks/usePitchForm.ts`)**: Unified multi-step form and live knockout analysis.
- **Standardized API (`lib/api/`)**: Centralized error hierarchy and typed response envelopes.

---

## Key Routes
- `/`: Platform home & Education Wedge overview
- `/problems`: Open challenges list with category filters (`SCHEDULING`, `STUDENT_RETENTION`, `ADMIN_WORKFLOW`)
- `/problems/[id]/pitch`: 5-Step Guided Pitch Wizard with real-time pre-validation checks & draft auto-save
- `/problems/[id]/pitch/result`: Diagnostic Screen with visual score badge, dimensional feedback, and "Revise Pitch" action
- `/org/problems/new`: Multi-tenant problem posting form
- `/org/problems/[id]/proposals`: Vetted inbox showing **ONLY** proposals where `passed === true`
- `/org/proposals/[id]`: Standardized proposal layout with A4 PDF / Print export
- `/admin/calibrate`: Interactive web runner for PRD requirements VAL-1 through VAL-6