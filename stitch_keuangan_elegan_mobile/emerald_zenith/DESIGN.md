# Design System Document: The Editorial Financial Experience

## 1. Overview & Creative North Star: "The Ethereal Vault"
This design system rejects the "spreadsheet" aesthetic of traditional finance. Our Creative North Star is **The Ethereal Vault**—a concept that balances the absolute security of a financial institution with the airy, breathable elegance of a high-end lifestyle journal. 

We break the "template" look by prioritizing **negative space as a functional element**. Rather than boxing data into rigid grids, we use intentional asymmetry and "breathing" margins to guide the eye. The interface should feel like a series of layered silk sheets—lightweight, premium, and calm. We move away from structural lines and move toward tonal depth.

---

## 2. Colors: Tonal Sophistication
Our palette is rooted in a "Soft Slate" foundation, using the sophisticated Teal/Emerald (`primary`) as a surgical accent rather than a blunt instrument.

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders to section content. Boundaries must be defined solely through background color shifts. Use `surface-container-low` for large sections sitting on a `surface` background to create natural separation.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of materials. 
- **Base Layer:** `surface` (#f8f9ff)
- **Secondary Sections:** `surface-container-low` (#eff4ff)
- **Elevated Content/Cards:** `surface-container-lowest` (#ffffff)
- **Active/Interaction Layers:** `surface-container-high` (#dce9ff)

### The Glass & Gradient Rule
To achieve a "bespoke" feel, floating navigation or modal overlays should utilize **Glassmorphism**. Use `surface` at 70% opacity with a `24px` backdrop blur. 
**Signature Texture:** For primary CTAs and hero data visualizations, use a subtle linear gradient from `primary` (#00685f) to `primary-container` (#008378). This adds "soul" and prevents the interface from feeling clinically flat.

---

## 3. Typography: Editorial Authority
We pair the geometric precision of **Manrope** for high-level data and headlines with the functional clarity of **Inter** for transactional body text.

*   **Display & Headlines (Manrope):** These are our "Editorial" voices. Use `display-lg` for primary balances and `headline-md` for section titles. The generous kerning and weight of Manrope convey a sense of curated wealth.
*   **Body & Labels (Inter):** Inter is our "Utility" voice. It handles the heavy lifting of legibility. Use `body-md` for all transactional data and `label-md` for micro-copy. 

**Hierarchy Strategy:** Use `on-surface-variant` (#3d4947) for secondary labels to create a soft contrast against the high-authority `on-surface` (#0b1c30) titles.

---

## 4. Elevation & Depth: Tonal Layering
Depth is achieved through "Tonal Stacking" rather than artificial shadows.

*   **The Layering Principle:** Place a `surface-container-lowest` card (Pure White) atop a `surface-container-low` (Soft Slate) background. This creates a "soft lift" that feels architectural.
*   **Ambient Shadows:** If a card requires a floating state (e.g., a dragged transaction), use an ultra-diffused shadow: `0px 20px 40px rgba(11, 28, 48, 0.06)`. The shadow color is derived from `on-surface`, ensuring it looks like natural light, not a "drop shadow."
*   **The "Ghost Border" Fallback:** If accessibility requires a border, use `outline-variant` (#bcc9c6) at **15% opacity**. Never use 100% opaque lines.
*   **Motion Depth:** When elements appear, they should fade and scale from 98% to 100%, mimicking the movement of a soft physical object being placed on a surface.

---

## 5. Components: Soft & Intentional

### Buttons
*   **Primary:** Solid `primary` with `on-primary` text. Radius: `DEFAULT` (0.5rem). Use a subtle inner-glow (1px white at 10% opacity) on the top edge for a "beveled" premium feel.
*   **Secondary:** `secondary-container` background with `on-secondary-container` text. No border.

### Input Fields
*   **Styling:** Fields use `surface-container-lowest` with a "Ghost Border." On focus, the border transitions to a 2px `primary` glow with a 4% `primary` background tint. 
*   **Rounding:** All inputs use `md` (0.75rem / 12px) rounding to match the "Soft" brand personality.

### Cards & Lists
*   **Forbid Dividers:** Never use lines to separate transactions. Use vertical white space (`spacing-4`) and alternating `surface-container` shifts.
*   **High-Value Cards:** For credit cards or portfolio summaries, use the `tertiary-container` (#b05e3d) as a "warm" counterpoint to the cool teal accents.

### Signature Component: The "Wealth Veil"
A custom chart component for this system: Use a `primary` stroke for line charts, but fill the area beneath with a gradient of `primary` at 20% opacity fading to 0% at the baseline. This creates a "fog" effect that feels expensive.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use `surface-container-highest` for hover states on list items.
*   **Do** maximize the use of `display-lg` for the user's total net worth; it is the "hero" of the experience.
*   **Do** use `9999px` (Full) rounding for chips and status tags to contrast against the `12px` cards.

### Don't
*   **Don't** use pure black (#000000) for text. Always use `on-surface` (#0b1c30) for better tonal harmony.
*   **Don't** use standard Material shadows. They are too aggressive for this "Soft & Elegant" system.
*   **Don't** use high-saturation red for errors. Use the `error` (#ba1a1a) and `error-container` (#ffdad6) tokens to keep the "Soft" feel even in negative states.