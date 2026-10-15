import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether,
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (Pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 11 * inch - 36, "SkillProof — Team Technical Roles & Contribution Breakdown")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(54, 11 * inch - 42, 8.5 * inch - 54, 11 * inch - 42)
        
        # Footer (All pages)
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(54, 46, 8.5 * inch - 54, 46)
        
        self.drawString(54, 34, "SkillProof Technical Documentation | Confidential & Internal")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * inch - 54, 34, page_str)
        self.restoreState()

def build_pdf(filename="SkillProof_Team_Roles_and_Contributions.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=22,
        leading=26,
        textColor=colors.HexColor("#0F172A"),
        spaceAfter=4,
    )

    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#475569"),
        spaceAfter=12,
    )

    h1_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=17,
        textColor=colors.HexColor("#0F172A"),
        spaceBefore=10,
        spaceAfter=6,
    )

    body_style = ParagraphStyle(
        "BodyDark",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#334155"),
        spaceAfter=6,
    )

    bullet_style = ParagraphStyle(
        "BulletText",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor("#1E293B"),
        leftIndent=12,
        firstLineIndent=-12,
        spaceAfter=4,
    )

    role_badge_style = ParagraphStyle(
        "RoleBadge",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#1E293B"),
    )

    meta_label = ParagraphStyle(
        "MetaLabel",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#475569"),
    )

    meta_val = ParagraphStyle(
        "MetaVal",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#0F172A"),
    )

    tbl_header = ParagraphStyle(
        "TblHeader",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11,
        textColor=colors.white,
    )

    tbl_cell = ParagraphStyle(
        "TblCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#1E293B"),
    )

    tbl_cell_bold = ParagraphStyle(
        "TblCellBold",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#0F172A"),
    )

    story = []

    # Title & Header Banner
    story.append(Paragraph("SkillProof Engineering Team", title_style))
    story.append(Paragraph("Technical Roles, Ownership & Deliverable Contributions Breakdown", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0F172A"), spaceAfter=10))

    # Executive Summary Card
    summary_text = (
        "<b>Platform Scope:</b> SkillProof is a deterministic, quality-gated problem-solving platform tailored for the "
        "education sector (coaching hubs, tuition academies, and college departments). The system connects student solvers "
        "with institutions by replacing unstructured freelance proposals with a standardized 5-step pitch wizard, a two-tier "
        "grading gate (binary knockouts + 6 quality dimensions at a 6.0/10.0 threshold), and noise-free vetted inboxes with 1-click PDF export. "
        "Below is the comprehensive responsibility and contribution profile for each of the 5 core team members."
    )
    summary_p = Paragraph(summary_text, body_style)
    summary_tbl = Table([[summary_p]], colWidths=[504])
    summary_tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#CBD5E1")),
        ("PADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(summary_tbl)
    story.append(Spacer(1, 10))

    # Team Members Details
    team_data = [
        {
            "name": "Nitin",
            "role": "Frontend Engineer",
            "ownership": "User Interface, Stepper Navigation, Interactive Gauges & Client State",
            "key_files": "components/Stepper.tsx, ScoreMeter.tsx, KnockoutCard.tsx, ProposalCard.tsx, SlideButton.tsx, app/problems/[id]/pitch/page.tsx",
            "deliverables": [
                "<b>5-Step Guided Pitch Wizard:</b> Built the comprehensive solver workflow breaking proposals into 5 structured stages (Problem Breakdown, Technical Architecture, Alternative Analysis, Budget/Milestones, and Proof/Feasibility).",
                "<b>Vertical Stepper (Uiverse Component):</b> Developed the dynamic vertical stepper component tracking real-time status badges (Completed, In Progress, Pending) and connecting lines.",
                "<b>6-Tube Evaluation Gauge:</b> Created the cylindrical 6-dimension score meter displaying visual fluid fill heights and dynamic threshold colors (Emerald for &ge; 6.0 pass, Rose for &lt; 6.0 revision).",
                "<b>Comic Neo-Brutalist Knockout Card:</b> Implemented the high-impact diagnostic card rendering when Tier 1 fails, displaying exact gate violations and direct 'Fix Step X' revision CTAs.",
                "<b>Vetted Proposal Cards & Poster Inbox:</b> Structured the client-side proposal cards featuring verified solver badges, fixed price tags, delivery turnaround, and 1-click standardized PDF downloads.",
                "<b>Interactive Slide-Fill Buttons:</b> Standardized the smooth slide-fill button animations across all hero banners, wizard controls, auth pages, and inbox action bars.",
            ],
        },
        {
            "name": "Tanmay",
            "role": "Backend Engineer",
            "ownership": "Deterministic Scoring Algorithm, Database Relational Schema & Core APIs",
            "key_files": "lib/scoring/engine.ts, prisma/schema.prisma, lib/services/pitch.service.ts, problem.service.ts, app/api/*",
            "deliverables": [
                "<b>Two-Tier Quality Gating Engine:</b> Engineered the pure, stateless, zero-external-LLM grading algorithm executing in under 10ms with mathematical determinism.",
                "<b>Tier 1 Binary Knockout Logic:</b> Built zero-tolerance knockouts immediately disqualifying submissions (Score = 0) if pricing is missing, fewer than 2 alternatives are evaluated, or total length is under 200 characters.",
                "<b>Tier 2 6-Dimension Quality Scorer:</b> Programmed the weighted 10-point scoring algorithm covering Problem Diagnosis (2.0), Solution Feasibility (2.0), Alternative Depth (1.5), Pricing Transparency (1.5), Solver Credentials (1.5), and Constraints/Edge Cases (1.5).",
                "<b>Relational Multi-Tenant Data Schema:</b> Architected the Prisma SQLite/PostgreSQL schema modeling Users, Organizations, Problems, and Pitches scoped by organizationId.",
                "<b>API Services & Endpoint Architecture:</b> Developed decoupled backend services and Next.js Route Handlers powering pitch submissions, problem creation, and automated credibility score updates.",
            ],
        },
        {
            "name": "Sameer",
            "role": "Testing & QA Lead",
            "ownership": "Quality Assurance, Calibration Benchmark Runner, Edge Cases & E2E Validation",
            "key_files": "lib/scoring/calibrationData.ts, scripts/calibrate.ts, app/admin/calibrate/page.tsx, E2E Test Suite",
            "deliverables": [
                "<b>Calibration Benchmark Suite (VAL-1 to VAL-6):</b> Authored the definitive test corpus spanning high-quality passes (&ge; 7.0), knockout edge cases (missing quotes, 1 alternative, low effort), borderline fails (&lt; 6.0), and minimal passing thresholds (6.0-6.5).",
                "<b>Automated Calibration CLI Runner:</b> Built the standalone calibration test runner (scripts/calibrate.ts) allowing instant automated regression testing of scoring accuracy.",
                "<b>Admin Gate Verification Dashboard:</b> Tested and verified the interactive /admin/calibrate portal enabling evaluators to run real-time gate benchmarks with zero score drift.",
                "<b>End-to-End User Flow Validation:</b> Executed thorough validation of both core loops: Solver Journey (Discovery &rarr; 5-step draft &rarr; Gate scoring &rarr; Diagnostic feedback &rarr; Revision loop) and Poster Journey (Problem post &rarr; Vetted inbox &rarr; Noise shielding audit &rarr; PDF export).",
                "<b>Type Safety & Build Integrity:</b> Enforced strict zero-error TypeScript compilation across all app routes and component interfaces (npx tsc --noEmit).",
            ],
        },
        {
            "name": "Nikhil",
            "role": "Security Engineer",
            "ownership": "Multi-Tenant Data Isolation, Input Validation, Anti-Gaming & Boundary Defense",
            "key_files": "lib/api/response.ts, lib/api/errors.ts, lib/auth/AuthContext.ts, API Middleware",
            "deliverables": [
                "<b>Multi-Tenant Data Isolation:</b> Enforced query-level organizational boundary constraints ensuring problems, pitches, and candidate proposals remain strictly segregated by organizationId.",
                "<b>Input Sanitization & Schema Defense:</b> Built strict input validation and centralized error handling (AppError, withErrorHandler) to prevent payload tampering, script injections, and stack trace leaks.",
                "<b>Anti-Gaming Deterministic Gate Rules:</b> Hardened the scoring engine against buzzword stuffing by verifying structural integrity in trade-off comparisons (distinct pros, cons, and rejection reasons).",
                "<b>Pricing Quote Integrity:</b> Blocked solver attempts to bypass budget knockouts with placeholder text ('negotiable', 'discuss later'), enforcing numeric or currency-explicit quotes.",
                "<b>Local Authentication & IAM Roadmap:</b> Implemented role-based authorization (SOLVER, POSTER, ADMIN) with clean passwordless local session handling, primed for seamless Google OAuth migration.",
            ],
        },
        {
            "name": "Tushar",
            "role": "Hosting & DevOps Engineer",
            "ownership": "Google Cloud Infrastructure, Containerization, Domain/SSL & Production Ops",
            "key_files": "Dockerfile, next.config.mjs, GCP Cloud Run / Compute Engine Config, Deployment Scripts",
            "deliverables": [
                "<b>Google Cloud Server Deployment:</b> Configured and deployed the production Next.js application on Google Cloud infrastructure (Google Cloud Run / Compute Engine / Firebase App Hosting).",
                "<b>Environment & Secrets Management:</b> Managed server environment variables (DATABASE_URL, NODE_ENV, port mappings) and secure runtime configurations across cloud environments.",
                "<b>Build Artifact Optimization:</b> Optimized Docker container builds and Next.js standalone outputs, minimizing image size and eliminating extraneous dependencies.",
                "<b>Domain, DNS & SSL Provisioning:</b> Managed custom domain routing, DNS record setups (A / CNAME records), and automated Google-managed SSL/TLS certificates for HTTPS encryption.",
                "<b>Uptime & Latency Monitoring:</b> Configured cloud health probes, cold-start mitigation, and container resource scaling to guarantee responsive performance during evaluator demonstrations.",
            ],
        },
    ]

    for member in team_data:
        box_content = []
        
        # Header Row
        header_text = f"<b>{member['name']}</b> &nbsp;—&nbsp; <font color='#475569'>{member['role']}</font>"
        box_content.append(Paragraph(header_text, h1_style))
        box_content.append(Paragraph(f"<b>Primary Ownership:</b> {member['ownership']}", body_style))
        box_content.append(Paragraph(f"<b>Key Code / Artifacts:</b> <font face='Courier' size='7.5'>{member['key_files']}</font>", body_style))
        box_content.append(Spacer(1, 3))
        box_content.append(Paragraph("<b>Key Technical Deliverables & Contributions:</b>", meta_label))
        
        for bullet in member["deliverables"]:
            box_content.append(Paragraph(f"• {bullet}", bullet_style))
            
        box_table = Table([[box_content]], colWidths=[504])
        box_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FFFFFF")),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#CBD5E1")),
            ("LINEBEFORE", (0, 0), (-1, -1), 3.5, colors.HexColor("#0F172A")),
            ("PADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        
        story.append(KeepTogether([box_table, Spacer(1, 8)]))

    # Page Break before Summary Table for clean presentation
    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>Consolidated Team Contribution Matrix</b>", h1_style))
    story.append(Paragraph("Quick reference matrix mapping team members to their core deliverable and technical stack.", body_style))
    story.append(Spacer(1, 4))

    # Table Header & Rows
    tbl_rows = [
        [
            Paragraph("Member", tbl_header),
            Paragraph("Role", tbl_header),
            Paragraph("Core Deliverable", tbl_header),
            Paragraph("Tech Stack & Key Files", tbl_header),
        ]
    ]

    matrix_rows = [
        ("Nitin", "Frontend Engineer", "5-Step Pitch Wizard, 6-Tube Gauge, Stepper, Knockout Card", "React, Next.js, Tailwind, components/"),
        ("Tanmay", "Backend Engineer", "Two-Tier Deterministic Scoring Engine, Relational DB, API Handlers", "TypeScript, Prisma, SQLite, lib/scoring/"),
        ("Sameer", "Testing & QA Lead", "VAL-1 to VAL-6 Calibration Test Harness, Admin Portal, E2E QA", "Benchmark Suite, scripts/calibrate.ts, QA"),
        ("Nikhil", "Security Engineer", "Anti-Gaming Gate Guards, Input Sanitization, Multi-Tenancy", "Schema Validation, Security Rules, Auth"),
        ("Tushar", "Hosting & DevOps", "Google Cloud Server Deployment, Docker, SSL, DNS, Performance", "GCP Cloud Run / Compute, Docker, CI/CD"),
    ]

    for m_name, m_role, m_del, m_tech in matrix_rows:
        tbl_rows.append([
            Paragraph(m_name, tbl_cell_bold),
            Paragraph(m_role, tbl_cell),
            Paragraph(m_del, tbl_cell),
            Paragraph(m_tech, tbl_cell),
        ])

    matrix_tbl = Table(tbl_rows, colWidths=[65, 95, 185, 159])
    matrix_tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F172A")),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("PADDING", (0, 0), (-1, -1), 5),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#FFFFFF"), colors.HexColor("#F8FAFC")]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
    ]))
    story.append(matrix_tbl)

    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated: {filename}")

if __name__ == "__main__":
    build_pdf()
