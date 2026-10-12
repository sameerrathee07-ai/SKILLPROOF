# SkillProof Custom Domain Setup and Launch Runbook

This document details the exact configuration required to connect and verify a custom domain for SkillProof prior to production launch.

---

## 1. Domain Architecture
- **Primary Domain:** `skillproof.org` (or configured apex domain)
- **Subdomain Redirect:** `www.skillproof.org` -> `skillproof.org`
- **Application URL:** Configured in runtime environment variable `NEXT_PUBLIC_APP_URL`

---

## 2. DNS Record Configuration

Configure the following records with your domain registrar or DNS provider (Cloudflare, AWS Route 53, Namecheap, Google Domains):

| Type | Name / Host | Target / Value | TTL | Note |
|---|---|---|---|---|
| **A** | `@` (Apex) | `76.76.21.21` (or server static IP) | Auto / 300s | Primary web traffic |
| **CNAME** | `www` | `cname.skillproof.org` (or platform CNAME) | Auto / 300s | Subdomain alias |
| **CAA** | `@` | `0 issue "letsencrypt.org"` | 3600s | SSL issuance guard |
| **TXT** | `@` | `v=spf1 include:... ~all` | 3600s | Email deliverability (if sending notifications) |

---

## 3. SSL / TLS Security Requirements
- **Enforce HTTPS:** Automated redirect from HTTP (port 80) to HTTPS (port 443).
- **HSTS Header:** Minimum 1 year duration (`max-age=31536000; includeSubDomains; preload`).
- **TLS Version:** TLS 1.2 minimum, TLS 1.3 preferred.

---

## 4. Environment Variables Checklist
Update your production `.env` / deployment environment:

```env
NEXT_PUBLIC_APP_URL="https://skillproof.org"
DATABASE_URL="file:./prisma/prod.db"
NODE_ENV="production"
PORT=3000
```

---

## 5. Mandatory Pre-Launch Verification Gate
Before pointing production traffic live:
1. [x] **Zero "Vibe Product" aesthetics:** No purple/indigo gradients, no pill buttons (`rounded-full`), no cursor animations, no over-the-top scroll animations.
2. [x] **Zero synthetic content:** No AI-slop photos, no AI-slop copy, no emoji icons in UI chrome, no em dashes (`—`).
3. [x] **Truthful metrics:** Zero fake reviews, fake customer counters, or fabricated stats.
4. [x] **Favicon verified:** Vector SVG favicon active at `app/icon.svg`.
5. [x] **Zero "Made with AI" labels:** Entire codebase and public DOM audited with zero badges/labels.
6. [x] **Legal pages active:** `/privacy` (Privacy Policy) and `/terms` (Terms and Conditions) rendered with real, applicable text.
7. [x] **Deterministic gate calibration:** 100% test pass rate across VAL-1 to VAL-6 (`npm run calibrate`).
8. [x] **Zero build errors:** `npm run build` succeeds cleanly with all static and dynamic routes.
