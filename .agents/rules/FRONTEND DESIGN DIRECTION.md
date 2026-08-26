---
trigger: always_on
---

STACKAUDIT — FRONTEND DESIGN DIRECTION

IMPORTANT:

Do NOT treat "professional UI" as:
dark background + purple accent + centered hero + rounded card + pill selectors + large CTA.

That visual pattern is explicitly NOT the desired StackAudit design language.

The current StackAudit interface must NOT resemble a generic AI-generated SaaS template.

Avoid the following composition unless there is a strong product-specific reason:

- Centered hero section
- Large gradient headline
- Single centered card
- Pill-based option selectors
- Large rounded containers
- Generic dashboard statistic cards
- Purple/blue neon accents
- Excessive rounded corners
- Large empty areas
- Generic "AI-powered" marketing language
- Gradient buttons
- Glowing borders
- Glassmorphism
- Decorative gradients
- "Magic AI" visual language

Do not simply restyle the current UI.
Reconsider the INFORMATION ARCHITECTURE and PAGE COMPOSITION.

The goal is to make the product feel like a serious developer tool created by an experienced product design and frontend engineering team.

==================================================
STACKAUDIT DESIGN CHARACTER
==================================================

StackAudit should feel:

- Technical
- Editorial
- Precise
- Calm
- Intelligent
- Developer-focused
- Information-dense where appropriate
- Visually restrained
- Highly intentional

It should feel closer to a serious engineering product than a marketing website.

The interface should communicate:

"These people understand developers and software engineering."

It should NOT communicate:

"An AI generated a modern SaaS landing page."

==================================================
DO NOT START WITH VISUAL DECORATION
==================================================

Before designing a page, first determine:

1. What is the user's task?
2. What information does the user need first?
3. What decision is the user making?
4. What action should the user take next?
5. What information is secondary?

Then design the hierarchy around those answers.

Do not start with:

"Hero → Card → CTA."

==================================================
LAYOUT DIRECTION
==================================================

Prefer asymmetric and information-oriented layouts where appropriate.

Use:

- Strong horizontal structure
- Editorial layouts
- Split layouts
- Side navigation when appropriate
- Contextual panels
- Tables
- Lists
- Dense but readable information sections
- Clear content hierarchy
- Persistent context
- Deliberate alignment
- Grid systems

Not every page should be centered.

Not every section should be inside a card.

Not every interaction should be a pill.

Not every action should be represented by a giant button.

==================================================
DISCOVERY EXPERIENCE
==================================================

The StackAudit discovery experience should NOT look like a survey inside a centered card.

The current pattern:

"Tell us your stack"
→ pills
→ experience segmented control
→ giant button

is too generic and must be redesigned.

The discovery experience should feel like a real developer workspace.

Think in terms of:

Developer profile +
Technical preferences +
Contribution preferences +
Repository/issue discovery

The user should feel like they are configuring a professional developer workspace, not completing an AI onboarding questionnaire.

For example, the interface can use:

- Structured preference panels
- Technical filters
- Search
- Multi-select controls
- Clear labels
- Contribution-type filters
- Repository language filters
- Difficulty filters
- Issue-type filters
- Experience context

Use the appropriate component for the information.

Do not turn every option into a pill.

==================================================
COLOR
==================================================

Do not default to purple simply because StackAudit is an AI product.

Purple is NOT the StackAudit identity unless explicitly defined by the design system.

Establish a restrained visual system.

Use color primarily for:

- Hierarchy
- State
- Status
- Interaction
- Important actions

Do not use color as decoration.

Avoid:

- Neon purple
- Neon blue
- Purple gradients
- Glowing borders
- Gradient text
- Colorful backgrounds

The UI should remain visually strong even if the accent color is removed.

==================================================
CARDS
==================================================

Cards are not the default container for everything.

Do not place every section inside a rounded rectangle.

Use cards only when they create meaningful grouping.

Prefer:

- Dividers
- Whitespace
- Typography
- Grid alignment
- Panels
- Sections
- Tables
- Lists

A page should not look like a collection of floating rounded rectangles.

==================================================
BORDER RADIUS
==================================================

Use restrained border radii.

Avoid extremely rounded UI.

Do not use pill shapes for normal buttons or containers.

Pill shapes should be reserved for things that are genuinely tags, statuses, or compact filters.

==================================================
TYPOGRAPHY
==================================================

Typography must carry the hierarchy.

Do not rely on:

- Gradient text
- Huge headings
- Bold text everywhere
- Bright colors

Use:

- Weight
- Size
- Line height
- Letter spacing
- Muted text
- Spacing
- Alignment

to create hierarchy.

Headings should be confident but not oversized.

==================================================
SPACING
==================================================

Do not interpret "clean design" as "large empty space everywhere."

Use whitespace intentionally.

Developer tools often require higher information density than marketing websites.

The interface should comfortably present useful information without feeling crowded.

==================================================
COMPONENT RULE
==================================================

Use shadcn/ui as a component foundation where appropriate.

However:

DO NOT produce an untouched shadcn demo.

Components should be adapted to the StackAudit design language.

Maintain consistency across:

- Buttons
- Inputs
- Selects
- Tabs
- Tables
- Navigation
- Dialogs
- Cards
- Status indicators
- Empty states
- Loading states

==================================================
DEVELOPER PRODUCT AESTHETIC
==================================================

StackAudit should visually communicate that it is built for software developers.

Appropriate visual references include the qualities of:

- Developer tools
- Engineering dashboards
- Documentation systems
- Code hosting platforms
- Technical research tools
- Professional productivity software

Do not copy any specific company's interface.

Use the underlying principles:

- Information hierarchy
- Dense useful content
- Precise typography
- Strong navigation
- Clear states
- Technical context
- Excellent interaction design

==================================================
CONTRIBUTION-FIRST UX
==================================================

The product's central concept is:

DISCOVER → UNDERSTAND → MATCH → PREPARE → CONTRIBUTE

The UI must visually reinforce this.

The most important content should eventually be:

Repository
Issue
Why it matches the developer
Difficulty
Required skills
Estimated effort
Relevant files
Relevant code context
Contribution guidance

Repository metrics are supporting information.

They must not dominate the interface.

==================================================
AI UX
==================================================

Do not advertise AI through visual effects.

Do not use sparkle icons everywhere.

Do not use:

"✨ AI Magic"

"AI-powered"

"AI insight"

as decorative labels.

AI should feel like infrastructure inside the product.

Prefer useful language:

"Why this matches you"

"Relevant code"

"What to understand first"

"Contribution context"

"Suggested approach"

==================================================
VISUAL VARIETY
==================================================

Do not use the same layout pattern on every page.

Different tasks require different compositions.

Discovery page:
→ search/filter-oriented

Repository page:
→ technical overview + contribution opportunities

Issue page:
→ issue context + developer match + relevant code

Code understanding:
→ source/context-oriented layout

Dashboard:
→ personalized contribution opportunities

Use the appropriate information architecture for each task.

==================================================
NO TEMPLATE REUSE
==================================================

Do not repeatedly generate:

Hero
↓
subtitle
↓
rounded card
↓
pills
↓
CTA

This pattern must NOT become StackAudit's default page architecture.

Each page should be designed from its user task.

==================================================
DESIGN REVIEW
==================================================

Before considering a UI implementation complete, ask:

1. Does this look like a generic AI-generated SaaS template?
2. Is the page centered merely because it is easy to generate?
3. Are cards being used unnecessarily?
4. Are pills being used unnecessarily?
5. Is purple being used merely because it looks "AI"?
6. Is there unnecessary gradient usage?
7. Is there excessive empty space?
8. Does the layout communicate the user's actual task?
9. Does the interface feel like a developer product?
10. Does the visual hierarchy make sense without decorative effects?
11. Are interactions obvious?
12. Are loading, empty, error, and success states designed?
13. Does the page feel consistent with the rest of StackAudit?
14. Would an experienced product designer approve this composition?

If the answer to the first question is YES, redesign the composition rather than merely changing colors.

==================================================
CRITICAL REQUIREMENT
==================================================

Do NOT make incremental cosmetic changes to a weak layout.

If the existing page follows a generic AI SaaS composition, redesign the page structure.

Changing:

purple → blue
rounded card → slightly less rounded card
gradient → darker gradient

is NOT a redesign.

A redesign means reconsidering:

- Information architecture
- Layout
- Hierarchy
- Interaction model
- Component selection
- Content density
- Navigation
- Visual system

The final interface should look like a deliberate product design, not a generated template.

QUALITY OVER FLASH.

INFORMATION OVER DECORATION.

DESIGN SYSTEM OVER RANDOM STYLING.

PRODUCT TASK OVER TEMPLATE PATTERNS.

CONTRIBUTION EXPERIENCE OVER AI AESTHETICS.
