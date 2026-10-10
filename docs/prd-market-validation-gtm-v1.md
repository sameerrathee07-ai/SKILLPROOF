# SkillProof — Market Validation and Go-To-Market Plan

**Supplementary Product Requirements Document | Draft v1.0**
Supplements PitchPal v1.0 and SkillProof v1.0 / v2.0

---

## 1. Purpose and Relationship to Prior Documents

This document does not replace the existing SkillProof Product Requirements Document (Draft v2.0, standalone) or the earlier hackathon-scoped SkillProof draft (v1.0) or the original PitchPal Product Requirements Document (v1.0). Those documents define what the product does: the five-step guided pitch, the six-dimension scoring engine, the gate threshold, the token economy, and the technical architecture.

This document defines what must be true about the market, and what must happen before and alongside the build, for that product to find real users. It exists because the prior documents contain an explicit, unresolved open risk: the six-out-of-ten gate threshold is untested, and the target market (small organizations in hospitality, financial services, and education) has not been validated directly. This document turns that open risk into a sequenced, testable plan.

## 2. Problem Statement

The engineering plan for SkillProof is detailed and largely sound. The market assumptions underneath it are not yet tested. Three specific gaps exist:

- The gate threshold of six out of ten is a configuration constant chosen by estimation, not by calibration against real sample pitches.
- The target sectors (hospitality, financial services, education) were chosen for Smart India Hackathon theme fit, not validated against which sector actually has the most reachable, willing-to-pay problem-posters.
- The token pricing (forty-nine, ninety-nine, and one hundred seventy-nine rupees for twenty, fifty, and one hundred tokens) is an assumption with no willingness-to-pay data behind it.

Building further product features on top of these three untested assumptions risks a working, well-engineered product that nobody uses, because the product never clears a market-facing validation gate equivalent to the one it imposes on its own users.

## 3. Goals

- Calibrate the pitch-quality gate against a known-good and known-bad test set before any external demo or pilot.
- Validate demand in one sector first, rather than three sectors simultaneously, to conserve limited solo or small-team bandwidth.
- Run a closed pilot that produces real numbers against the existing Success Metrics defined in the SkillProof Product Requirements Document (pitch completion rate, false-reject rate, gate calibration, credibility differentiation, proposal download rate).
- Produce a defensible, explainable positioning story for Smart India Hackathon judges, program stakeholders, or early investors, grounded in real pilot data rather than projected estimates.

## 4. Non-Goals (for this phase)

- Expanding to all three target sectors (hospitality, financial services, education) simultaneously.
- Any paid customer acquisition or advertising spend.
- Finalizing token pricing before willingness-to-pay data exists.
- Building new product features not already specified in the SkillProof v2.0 Product Requirements Document.

## 5. Market Sizing Summary

Full detail lives in the research conversation this document is based on; the working figures are summarized here for reference.

- **Total Addressable Market:** the global freelance platform market, valued at roughly seven to ten billion United States dollars in 2026, growing near seventeen to eighteen percent per year. This is a ceiling reference, not a near-term target, since most of that figure belongs to high-volume platforms unlike SkillProof's gated model.
- **Serviceable Available Market:** built bottom-up from India data. India has approximately seventy-eight million registered Micro, Small, and Medium Enterprises; hospitality, financial services, and education together are estimated at roughly six to nine million operationally active small organizations. On the solver side, India has an estimated fifteen million freelancers and thirty-seven million college students. A realistic Serviceable Available Market is two hundred thousand to five hundred thousand addressable small organizations across the three sectors, against a solver pool in the low millions of students concentrated in cities with strong college density.
- **Serviceable Obtainable Market:** matched to the product's own stated prototype scale target of zero to one hundred users per month. Realistic year-one obtainable numbers are a few hundred to low thousands of registered solvers, concentrated at the founding university and a small number of partner campuses, and a few dozen to a few hundred problem-posters. Revenue at this stage is nominal; the near-term goal is validated usage, not revenue capture.

## 6. Target Personas (Summary)

1. **The Overwhelmed Small-Business Problem-Poster** — a hospitality, financial-services, or education small-business owner or manager, time-poor, skeptical of unverified students, motivated by a cheap or free pre-filtered solution to a real recurring problem.
2. **The Credibility-Starved Student Solver** — a college student building a portfolio, frustrated by generic freelance platforms, motivated by structured practice, specific feedback, and a compounding credibility record.
3. **The Validation-Seeking Program Stakeholder** — a placement-cell officer, incubation-cell coordinator, or hackathon judge, looking for a defensible, explainable technical mechanism rather than a vague artificial-intelligence claim.

## 7. Competitive Positioning (Summary)

SkillProof sits in a gap between two existing categories: open, unfiltered marketplaces (Upwork, Fiverr, Internshala) that provide no quality gate at all, and expensive, slow, human-vetted networks (Toptal, Wazoku, HeroX) built for enterprise budgets and timelines far beyond a small shop's reach. SkillProof's differentiators are a deterministic, explainable, rule-based gate with no opaque artificial-intelligence call; a solver credibility score that persists and compounds; and zero cost of entry on both sides.

## 8. Phase 1: Gate Calibration (Blocking — Must Complete First)

This phase blocks every other phase. No external demo, pilot, or business-owner conversation should happen until it is complete.

### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| VAL-1 | Author five to ten strong sample pitches by hand, spread across hospitality, financial services, and education problem categories | P0 |
| VAL-2 | Author five to ten deliberately weak sample pitches: missing a price, vague customer reference, fewer than two alternatives, no experience claim | P0 |
| VAL-3 | Run all sample pitches through the five-step validation engine and the six-dimension scoring engine exactly as specified in the SkillProof Product Requirements Document | P0 |
| VAL-4 | Confirm one hundred percent of strong samples score six or above and one hundred percent of weak samples score below six | P0 |
| VAL-5 | For any sample landing on the wrong side of the six-point threshold, trace the result to the specific dimension's keyword set or boost and penalty caps (section 3.3 of the SkillProof Product Requirements Document) and adjust the keyword sets or caps, not the threshold constant itself | P0 |
| VAL-6 | Re-run the full sample set after any adjustment until VAL-4 passes completely | P0 |

### Exit Criteria

Gate Calibration success metric from the SkillProof Product Requirements Document is met: one hundred percent of the test set passes or fails as expected. Only after this is satisfied does Phase 2 begin.

## 9. Phase 2: Single-Sector Wedge — Education First

Rather than launching across hospitality, financial services, and education simultaneously, this phase validates demand in one sector.

### Rationale

Education is the recommended first wedge: direct access already exists through the founding university, coaching centers, and tuition providers; the trust gap with a student solver is smaller when the problem-poster is already education-adjacent; and problems are relatively low-stakes to pitch on (scheduling, student retention, administrative workflow) compared to financial-services problems that may touch sensitive data.

### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| VAL-7 | Identify ten to fifteen real education-sector small organizations (coaching centers, tuition providers, college departments) as conversation targets | P0 |
| VAL-8 | Run short conversations with each, specifically testing the objections identified in the Overwhelmed Small-Business Problem-Poster persona: trust in student solvers, perceived value of a free or low-cost proposal, willingness to share a real operational problem | P0 |
| VAL-9 | Document which objections recur most often and whether any are disqualifying versus addressable through product or messaging changes | P1 |
| VAL-10 | Do not open hospitality or financial-services sectors to problem-posting until at least five education-sector conversations have produced a willingness to post a real problem | P1 |

## 10. Phase 3: Closed Pilot

Once Phase 1 and Phase 2 are satisfied, run a closed pilot to generate real numbers against the existing product Success Metrics.

### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| VAL-11 | Recruit twenty to thirty solvers from the founding university's student innovation cells, coding clubs, or placement-cell partnerships | P0 |
| VAL-12 | Recruit five to ten real education-sector problem-posters identified in Phase 2 | P0 |
| VAL-13 | Run the full product loop end to end and measure against the existing Success Metrics table: pitch completion rate at or above forty-five percent, false-reject rate below ten percent, credibility differentiation visible across at least two solver accounts, proposal PDF download rate at or above sixty percent, zero crashes | P0 |
| VAL-14 | Test willingness to pay directly: track signup-to-first-token-purchase conversion at the stated forty-nine, ninety-nine, and one hundred seventy-nine rupee price points, and treat the current pricing as an untested assumption until this data exists | P1 |

### Exit Criteria

Pilot metrics meet or approach the existing Success Metrics targets, and at least one full loop (problem posted, solver fails gate once, revises, passes, proposal visible to poster) is demonstrated live without a crash.

## 11. Go-To-Market Channels (Post-Pilot)

Three channels are recommended, in priority order, once the pilot has produced validated numbers:

1. **Campus-first solver acquisition** — continued recruitment through student innovation cells and placement-cell partnerships, at zero paid-acquisition cost, consistent with the product's zero-rupee hosting constraint.
2. **Sector-by-sector expansion** — open hospitality, then financial services, only after the education wedge has a working loop and at least a small number of real success stories to show as proof, rather than launching all three sectors at once.
3. **Hackathon and innovation-program visibility** — use a live, crash-free demo at Smart India Hackathon or a similar showcase as a combined channel for solver acquisition, problem-poster acquisition through judge and mentor networks, and program-stakeholder validation.

## 12. Risks and Open Questions

| Risk | Notes |
|------|-------|
| Gate threshold miscalibration | Addressed directly by Phase 1; treat as fully blocking until resolved |
| Sector-fit assumption | Hospitality, financial services, and education were chosen for hackathon theme fit, not validated demand; Phase 2 tests this for education only, hospitality and financial services remain unvalidated until their own wedge phases run |
| Token pricing assumption | No willingness-to-pay data exists yet; VAL-14 is the first real test |
| Team strength versus product type | The original SkillProof draft already flags that this is a product and user-experience build rather than an infrastructure or security build, which may not match a team's stated strengths; worth revisiting before final commitment |
| Solver gaming of keyword rules | Once solvers learn the rule-based scoring patterns, they may learn to insert trigger keywords without genuine substance; not addressed in this document and worth a dedicated review once Phase 3 pilot data exists |

## 13. Sequencing Summary

Phase 1 (Gate Calibration) must complete before Phase 2 (Education Wedge Conversations) begins. Phase 2 must produce at least five willing problem-posters before Phase 3 (Closed Pilot) begins. Go-To-Market channel investment begins only after Phase 3 exit criteria are met. No phase should be skipped or run out of order, since each phase is designed to catch a specific class of failure before it becomes expensive to discover.
