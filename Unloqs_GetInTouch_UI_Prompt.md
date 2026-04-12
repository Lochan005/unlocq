# Unloqs — "Get in Touch" Page UI Design Prompt

---

## Context

**Product**: Unloqs — India's first intelligent mortgage repayment acceleration platform  
**Tagline**: "Money Matters ₹"  
**Brand Color Palette**: Midnight Blue (#1e3a5f) primary, with accents of Warm Gold (#d4a843), Soft Teal (#5ab0a8), and light slate backgrounds  
**Design System**: Rounded cards, clean lines, gradient CTAs, warm and trustworthy tone  
**Target Audience**: Indian homeowners (25–50 age group) with active home loans, first-time buyers, and potential banking/NBFC partners

---

## Page Objective

Design a "Get in Touch" page that feels approachable and trustworthy — not corporate or cold. The page should serve anyone who wants to reach the Unloqs team — whether it's a curious visitor, a potential bank partner, or an existing user needing help.

The design must make the visitor feel heard before they even type a word. Keep the form minimal and frictionless — three fields, no more.

---

## Page Structure & Layout

### Section 1 — Hero / Headline Area

- **Heading**: A warm, inviting headline (e.g., "We'd Love to Hear From You" or "Let's Talk About Your Financial Freedom")
- **Subheading**: A one-liner that sets expectations (e.g., "Drop us a line and we'll get back within 24 hours.")
- **Visual element**: A subtle illustration or animation related to communication/connection — not a generic stock photo. Think: a stylized chat bubble with the Unloqs logo, or a hand-drawn envelope motif.

---

### Section 2 — Contact Form (Primary CTA)

The form should be the visual centerpiece of the page. Clean, spacious, with clear labels. Only three fields — zero friction.

#### Input Fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| Name | Text input | Yes | Placeholder: "Your name" |
| Email Address | Email input | Yes | Placeholder: "you@example.com" — validate format on blur, show error if invalid |
| Your Query | Textarea | Yes | Placeholder: "How can we help you?" — minimum 3 rows, expandable |

#### Form UX Details:
- **Inline validation**: Green checkmark on valid email, red highlight with helper text on invalid format
- **Character counter** on the Query field (e.g., "0 / 500")
- **Submit button**: Prominent gradient CTA (midnight blue → deep navy), full-width or large. Label: "Send Message" with a subtle send-arrow icon
- **Loading state**: Button shows a spinner on submit
- **Success state**: Replace the form with a confirmation card — "✅ Message Sent! We'll get back to you within 24 hours." Include a "Send another message" link to reset the form.
- **Error state**: Toast notification or inline banner — "Something went wrong. Please try again or email us directly at hello@unloqs.in"

---

### Section 3 — Company Contact Information (Left sidebar or below form)

Display these details clearly with icons:

| Info | Icon | Value |
|---|---|---|
| Email | ✉️ Mail icon | hello@unloqs.in |
| Phone | 📞 Phone icon | +91-XXXXX-XXXXX |
| Office Address | 📍 Pin icon | [City, State, India — placeholder] |
| Working Hours | 🕐 Clock icon | Mon–Fri: 10:00 AM – 7:00 PM IST |
| Response Time | ⚡ Lightning icon | "We typically respond within 24 hours" |

---

### Section 4 — Alternative Contact Channels

A row of icon cards or buttons for:

- **Email Us**: Direct mailto link
- **WhatsApp**: Click-to-chat link (popular in India — include this)
- **LinkedIn**: Company page link
- **Twitter / X**: Handle link

Each with a recognizable icon and a one-line description (e.g., "Chat with us instantly on WhatsApp").

---

### Section 5 — FAQ Teaser (Optional but Recommended)

A compact accordion or card grid with 3–4 common questions to reduce unnecessary inquiries:

- "How does Unloqs help me save on my home loan?"
- "Is Unloqs free to use?"
- "How do I connect my bank account?"
- "Can banks or NBFCs partner with Unloqs?"

Each expands to a 2–3 line answer. Include a "View All FAQs →" link.

---

### Section 6 — Trust Signals (Footer area of the page)

A subtle strip showing:

- "🔒 Your data is encrypted and secure"
- "🇮🇳 Made in India"
- "Aligned with Viksit Bharat 2047"
- Any certifications or compliance badges (RBI guidelines, data protection)

---

## Design Guidelines

### Layout
- **Desktop**: Two-column layout — form on the right (60% width), contact info + social links on the left (40% width). Hero spans full width above.
- **Mobile**: Single column, stacked. Hero → Form → Contact Info → Social → FAQ → Trust Signals.
- Generous whitespace. No cramped fields. Each form field should breathe.

### Typography
- Headings: Bold, warm, slightly rounded typeface (consistent with Unloqs brand — e.g., Plus Jakarta Sans 700/800)
- Body/labels: Clean, legible, 14–16px
- Placeholder text: Light gray, italic optional

### Colors
- **Primary**: Midnight Blue (#1e3a5f) — headers, CTA backgrounds, key accents
- **Secondary**: Warm Gold (#d4a843) — highlights, hover states, badges, icons
- **Tertiary**: Soft Teal (#5ab0a8) — success states, links, secondary buttons
- **Background**: Light slate gradient (#f0f4f8 → #e8edf2 → white)
- **Form card**: White with subtle midnight blue border/shadow
- **CTA button**: Midnight blue gradient (#1e3a5f → #0f2440) with white text
- **Success/confirmation**: Soft Teal (#5ab0a8) accent
- **Error**: Soft red (#ef4444) with light red background
- **Body text**: Dark charcoal (#1e293b) for readability
- **Muted text**: Slate gray (#64748b) for labels, placeholders, secondary info

### Interactions & Micro-animations
- Form fields: Subtle border-color transition on focus (gray → midnight blue)
- Submit button: Slight scale-up on hover, shadow deepening, gold shimmer accent on hover
- Success state: Fade-in with a checkmark animation
- FAQ accordion: Smooth expand/collapse with rotation on the chevron icon
- Social channel cards: Lift on hover with shadow

### Accessibility
- All form fields must have visible labels (not just placeholders)
- Tab order must be logical (top to bottom, left to right)
- Error messages must be associated with their fields via aria-describedby
- Color contrast must meet WCAG AA standards
- Submit button must be keyboard-accessible

---

## What NOT to Include

- No CAPTCHA on the initial design (can be added later — consider invisible reCAPTCHA)
- No file upload field (keep it simple)
- No live chat widget (future scope)
- No map embed (unnecessary for a digital-first platform unless a physical office is confirmed)
- No overly corporate stock imagery — keep it illustration-driven or abstract
- No extra form fields beyond the three specified — keep it minimal

---

## Summary of Input Fields

1. Name (required)
2. Email Address (required, validated)
3. Your Query — textarea with character counter (required)

---

## Summary of Info Sections

1. Company email, phone, address, working hours, response time
2. Social/alternative channels: WhatsApp, Email, LinkedIn, Twitter
3. 3–4 FAQ entries with expand/collapse
4. Trust signals: encryption, compliance, Made in India

---

*Use this prompt to generate a pixel-perfect, brand-consistent "Get in Touch" page for Unloqs that converts visitors into engaged users and partners.*
