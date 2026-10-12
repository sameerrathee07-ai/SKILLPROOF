# SkillProof Product, Design, and Launch Standards

These rules are non-negotiable across the entire codebase.

## 1. Visual & Aesthetic Standards (No "Vibe Product" Patterns)
- **Zero Purple Gradients:** Never use purple, violet, or indigo gradients. Use solid, high-contrast, grounded colors (slate, deep navy, neutral borders).
- **No Pill-Shaped Buttons or Badges:** Do not use `rounded-full` on buttons, filters, or status badges. Use structured, crisp radii (`rounded-md` or `rounded-lg`).
- **No AI-Slop Photos or Artwork:** Never use synthetic, plastic-looking AI stock portraits or floating 3D graphics.
- **No Cursor Animations:** No custom cursor trailers, particle trails, or magnetic cursor effects.
- **No Over-The-Top Scroll Animations:** No parallax scroll effects, bouncy scroll triggers, or heavy scroll-driven transforms.
- **No Emoji Icons:** Do not use emoji in UI chrome, headings, badges, or buttons. Use crisp, purposeful SVG icons (such as Lucide icons).

## 2. Copy & Messaging Standards
- **No Vague Hero Texts:** State exactly what the product does, who it is for, and how the deterministic gate operates. No empty buzzwords ("revolutionize", "supercharge", "next-gen AI synergy").
- **No AI-Slop Copy:** Tone must be concise, direct, grounded, and professional.
- **No Em Dashes (`—`):** Never use em dashes in titles, headings, badges, or marketing text. Use colons, hyphens (`-`), or standard punctuation.
- **Zero Fake Reviews or Testimonials:** No fabricated quotes, stock avatars, or fictional endorsement cards.
- **Zero Fake Metrics or Counters:** Every number shown must originate from real database records (e.g. `ProblemService.getPlatformStats()`). Never display pulsing fake visitor tickers or fabricated vanity metrics.

## 3. Mandatory Pre-Launch Checklist
We do NOT launch until all of the following are complete and verified:
1. **Custom Domain Connected:** Production DNS and SSL configured (see `docs/DOMAIN_SETUP.md`).
2. **Favicon Added:** Crisp vector/SVG favicon (`app/icon.svg`) and icons in place.
3. **No "Made with AI" Tag:** Ensure zero watermarks, badges, or footer tags mentioning "Made with AI".
4. **Privacy Policy Page Live:** Accessible at `/privacy` (`app/privacy/page.tsx`).
5. **Terms and Conditions Page Live:** Accessible at `/terms` (`app/terms/page.tsx`).
6. **Zero Defects ("Make no mistakes"):** Full test suite, deterministic calibration suite, and production build must pass with zero errors.
