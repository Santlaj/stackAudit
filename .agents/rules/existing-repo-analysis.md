---
trigger: always_on
---

STACKAUDIT — UI / FRONTEND QUALITY RULE

The StackAudit frontend must look and feel like it was designed and implemented by an experienced professional UI/UX and frontend engineering team.

Do NOT produce an "AI-generated SaaS" aesthetic.

The interface must feel:

- Professional
- Classy
- Intentional
- Clean
- Mature
- Modern
- Technically credible
- Consistent
- Production-ready

The goal is not to make the UI flashy.

The goal is to make it feel exceptionally well-designed.

---

DESIGN QUALITY
--------------------------------------------------

Every UI decision must have a clear design reason.

Do not randomly add:

- Gradients
- Glows
- Neon colors
- Glassmorphism
- Excessive rounded cards
- Floating blobs
- Decorative backgrounds
- Animated particles
- Excessive shadows
- Huge typography
- Excessive icons
- Unnecessary animations
- AI-style "magic" visual effects

These patterns are frequently used in generic AI-generated interfaces and should NOT be used simply because they make a page look visually impressive.

Prefer:

- Strong typography
- Excellent spacing
- Clear hierarchy
- Restrained color usage
- Consistent alignment
- Purposeful whitespace
- Subtle borders
- Appropriate contrast
- Carefully designed states
- Strong information architecture

---

COLOR SYSTEM
--------------------------------------------------

Do NOT invent colors on a page-by-page basis.

Do NOT hallucinate color palettes.

Do NOT randomly introduce gradients or accent colors.

StackAudit must have a deliberate design system with:

- Primary color
- Secondary/accent color
- Background colors
- Surface colors
- Border colors
- Text colors
- Muted text colors
- Success
- Warning
- Error
- Informational states

Colors must be defined through design tokens and reused consistently.

If an existing StackAudit design system exists, use it.

If the design system does not yet define something, establish a restrained, professional token rather than inventing a new color locally.

Never use arbitrary values such as:

- text-[#random]
- bg-[#random]
- border-[#random]

unless there is a documented design reason.

Prefer semantic tokens.

---

TYPOGRAPHY
--------------------------------------------------

Typography must be treated as a core part of the design system.

Use a deliberate type scale.

Maintain clear hierarchy between:

- Display
- Heading
- Subheading
- Body
- Caption
- Metadata
- Labels

Do not make everything large and bold.

Do not use oversized hero text simply to fill space.

Typography should prioritize:

- Readability
- Hierarchy
- Density
- Consistency

---

LAYOUT
--------------------------------------------------

Layouts should be designed around information hierarchy rather than decorative cards.

Prefer:

- Strong grid systems
- Consistent containers
- Predictable spacing
- Proper alignment
- Balanced content density
- Responsive layouts

Avoid:

- Random card arrangements
- Excessive empty space
- Unnecessary centered content
- Every section being a separate rounded card
- Repeating the same visual pattern throughout the page

Not every piece of information needs a card.

---

COMPONENT DESIGN
--------------------------------------------------

Use reusable components and design patterns.

Do not create slightly different versions of the same component.

For example, do not create:

- Three different button styles for different pages
- Multiple inconsistent card styles
- Different border radii across the application
- Different spacing systems for different sections

Components should behave consistently across the product.

Use the existing shadcn/ui foundation where appropriate, but do not leave components looking like untouched default shadcn templates.

Customize them to fit the StackAudit design system.

---

DASHBOARDS
--------------------------------------------------

Do not build generic "AI dashboard" layouts.

Avoid the common pattern:

Hero
↓
4 statistic cards
↓
Large gradient chart
↓
3 cards
↓
AI insight card
↓
CTA

This pattern should not become the default StackAudit layout.

Instead, design dashboards around the actual user task.

For StackAudit, information should help users:

- Discover repositories
- Compare contribution opportunities
- Understand issues
- Evaluate suitability
- Understand relevant code
- Prepare for contribution

Information hierarchy must follow user intent.

---

CONTRIBUTION-FIRST UI
--------------------------------------------------

The UI must reinforce StackAudit's core product purpose:

DISCOVER
→ UNDERSTAND
→ MATCH
→ PREPARE
→ CONTRIBUTE

The primary interface should make contribution opportunities easy to discover and understand.

For example, an issue page should prioritize:

Issue
↓
Why this issue matches the developer
↓
Difficulty
↓
Required skills
↓
Estimated effort
↓
Relevant files/modules
↓
Repository context
↓
What the developer should understand
↓
Contribution guidance

Repository metrics should support this flow rather than dominate it.

---

AI UX
--------------------------------------------------

Do not visually label everything as "AI".

Avoid:

- Sparkle icons everywhere
- "AI magic" gradients
- Constant glowing buttons
- Generic "Powered by AI" badges
- AI-generated looking cards
- Excessive robot/magic imagery

AI should feel like an integrated engineering capability.

For example:

Instead of:

"✨ AI MAGIC — Here's what our AI thinks"

Prefer:

"Why this issue matches your profile"

or:

"Relevant code context"

or:

"Before you start"

The interface should communicate useful information, not advertise the fact that AI generated it.

---

ANIMATION
--------------------------------------------------

Animations must serve a purpose.

Use motion for:

- Navigation feedback
- Loading states
- State transitions
- Focus changes
- Progressive disclosure
- Interaction feedback

Do not animate elements simply to make the interface feel "AI-powered".

Avoid:

- Constant floating animations
- Excessive hover transformations
- Bouncing elements
- Decorative motion
- Large entrance animations on every section

Motion should be subtle and intentional.

---

RESPONSIVE DESIGN
--------------------------------------------------

The application must be designed responsively from the beginning.

Do not build desktop first and patch mobile later.

Consider:

- Desktop
- Laptop
- Tablet
- Mobile

Layouts should gracefully adapt rather than simply shrink.

---

ACCESSIBILITY
--------------------------------------------------

Accessibility is part of frontend quality.

Use:

- Semantic HTML
- Keyboard navigation
- Visible focus states
- Appropriate contrast
- Accessible labels
- Proper form semantics
- Meaningful error messages
- Screen-reader-friendly structure

Do not sacrifice accessibility for visual design.

---

LOADING / ERROR / EMPTY STATES
--------------------------------------------------

Every meaningful data-driven interface should consider:

- Loading
- Empty
- Error
- Success
- Partial data
- Network failure

Do not leave blank screens or generic browser errors.

These states should feel like intentional parts of the product.

---

DATA VISUALIZATION
--------------------------------------------------

Do not add charts simply because dashboards commonly contain charts.

A visualization must answer a meaningful user question.

Prefer:

- Clear labels
- Appropriate scales
- Minimal decoration
- Useful comparisons
- Accessible presentation

Avoid decorative charts whose only purpose is to make the dashboard look sophisticated.

---

FRONTEND ENGINEERING
--------------------------------------------------

The frontend must be engineered, not merely visually assembled.

Follow:

- TypeScript strictness
- Component composition
- Reusable components
- Clear feature boundaries
- Proper state management
- Proper loading/error handling
- Semantic HTML
- Accessibility
- Responsive design
- Maintainable CSS
- Consistent design tokens

Do not duplicate UI logic.

Do not create giant page components.

Do not put business logic directly into presentational components.

---

NO AI-SLOP RULE
--------------------------------------------------

Never optimize for "wow, AI made this quickly."

Optimize for:

"An experienced product designer and frontend engineering team clearly thought through every part of this interface."

If a design decision looks impressive but does not improve:

- usability
- hierarchy
- clarity
- accessibility
- contribution workflow
- consistency

remove it.

---

DESIGN REVIEW RULE
--------------------------------------------------

Before considering a UI feature complete, review it for:

1. Visual hierarchy
2. Typography
3. Spacing
4. Alignment
5. Color consistency
6. Component consistency
7. Responsive behavior
8. Accessibility
9. Loading state
10. Empty state
11. Error state
12. Interaction behavior
13. Contribution-focused UX
14. Overall visual restraint

The final result should look cohesive across the entire application, not like individually generated pages.

---

MOST IMPORTANT RULE
--------------------------------------------------

StackAudit should look like a serious developer product built by a strong product design and frontend engineering team.

Do not imitate the visual language of generic AI-generated SaaS websites.

Do not chase trends.

Do not add visual effects for decoration.

Build a restrained, coherent, highly usable interface where typography, spacing, hierarchy, information architecture, and interaction design do the heavy lifting.

QUALITY OVER FLASH.

CLARITY OVER DECORATION.

CONSISTENCY OVER NOVELTY.

PRODUCT EXPERIENCE OVER VISUAL EFFECTS.
