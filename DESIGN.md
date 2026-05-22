# Design System — Mark & Alyza

---

## Colours

| Token | Hex | Usage |
|---|---|---|
| `--maroon` | `#2E080E` | Hero/section backgrounds, navbar, footer |
| `--red` | `#7C1A2B` | Accent — labels, borders, buttons |
| `--off-white` | `#F4F0E8` | Primary page background |
| `--white` | `#FFFFFF` | Cards, form fields |
| `--sage` | `#6A7252` | Rule lines, dividers |
| `--green` | `#4A7C59` | Completed / success states |
| `--text` | `#1C0A0D` | Body copy |
| `--text-mid` | `#6B5A5D` | Secondary / caption text |

**Overlays on dark sections**
- Hero: `rgba(46,8,14,0.54)` · Venue: `rgba(46,8,14,0.68)`
- Navbar rest: `rgba(46,8,14,0.48)` · Navbar scrolled: `rgba(46,8,14,0.90)`
- Both navbar states: `backdrop-filter: blur(16px)`

---

## Typography

```
Serif:  Cormorant Garamond — 300, 400, 600 · regular + italic
Sans:   Raleway — 300, 400, 600, 700, 800
```

```css
@import url('https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;600;700;800&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
```

| Role | Font | Size | Weight |
|---|---|---|---|
| Hero name | Cormorant Garamond | `clamp(3.8rem, 14vw, 7.5rem)` | 300 |
| Section heading | Cormorant Garamond | `clamp(2rem, 7vw, 3.5rem)` | 300 |
| Eyebrow label | Raleway | `0.56rem` | 700 · uppercase · `letter-spacing: 0.38em` |
| Body copy | Raleway | `0.875rem` | 400 · `line-height: 1.85` |
| Button / nav | Raleway | `0.58rem` | 700 · uppercase · `letter-spacing: 0.22em` |

---

## Key Rules

- **No border-radius** — sharp corners throughout
- **No box-shadow** — use frosted glass instead: `backdrop-filter: blur(12px)`
- **Card accent:** `border-top: 3px solid var(--red)`
- **Rule line:** `1px × 2rem`, colour `--sage`, centred
- **Max widths:** `1100px` (page) · `640px` (narrow/form)
- **Sections:** `min-height: 100svh` · scroll-snap on homepage only

---

## CSS Custom Properties

```css
:root {
  --maroon:      #2E080E;
  --red:         #7C1A2B;
  --off-white:   #F4F0E8;
  --white:       #FFFFFF;
  --sage:        #6A7252;
  --green:       #4A7C59;
  --text:        #1C0A0D;
  --text-mid:    #6B5A5D;
  --font-serif:  'Cormorant Garamond', Georgia, serif;
  --font-sans:   'Raleway', system-ui, sans-serif;
  --max-w:       1100px;
  --max-w-narrow: 640px;
  --pad-x:       1.5rem;
}

@media (min-width: 768px) {
  :root { --pad-x: 2rem; }
}
```

