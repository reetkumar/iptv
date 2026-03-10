# Mobile Design Style Guide

## 🎨 Visual Design System

### Rounded Corners (Border Radius)

```
┌─ Card: rounded-3xl (30px) ──────────────────┐
│                                            │
│  ┌─ Image: rounded-t-3xl (30px top) ────┐ │
│  │ Rounded top corners only              │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  Info Section (square bottom corners)     │
│                                            │
└────────────────────────────────────────────┘

Badges: rounded-full (pill shape)
Tags: rounded-lg (8px)
Buttons: rounded-full (pill) or rounded-lg (8px)
```

### Color Palette

#### Primary Colors
- **Primary**: Used for active states, CTA buttons
- **Foreground**: Main text color
- **Background**: Page background
- **Card**: Card background

#### Secondary Colors
- **Muted**: Secondary UI elements
- **Border**: Borders and dividers
- **Destructive**: Live badges, alerts

#### Badge Colors
```
Trending:   #FF8C00 (Orange 500)
Favorites:  #F43F5E (Rose 500)
New:        #3B82F6 (Blue 500)
Live:       #DC2626 (Red 500)
```

#### Opacity Levels
- `90%` - Badge backgrounds
- `80%` - Text overlays
- `50%` - Secondary icons
- `20-30%` - Border colors
- `10%` - Subtle backgrounds

### Typography Scale

| Size | Example | Usage |
|------|---------|-------|
| 18px (text-lg) | "🔥 Trending Now" | Section headers |
| 14px (text-sm) | "Channel Name" | Card titles |
| 12px (text-xs) | "General" | Meta information |
| 10px (text-[10px]) | "English" | Tags |
| 9px (text-[9px]) | "TRENDING" | Badge text |

#### Font Weights
| Weight | Example | Usage |
|--------|---------|-------|
| Bold (700) | "Channel Name" | Card titles |
| Semibold (600) | "Your Favorites" | Important labels |
| Medium (500) | "General" | Tags |
| Black (900) | "CH" | Fallback initials |

### Spacing System

```
8px   → Used in component padding
12px  → Small gaps
16px  → Standard gaps (gap-4)
20px  → Medium spacing
24px  → Section spacing (space-y-6)
```

## 🎯 Component Specifications

### MobileChannelCard

```
Total Height: Auto (depends on content)
├── Image Area: 56.25% width (16:9 aspect ratio)
├── Info Section: Variable height
└── Total Width: 100% of container

Responsive:
Mobile (< 640px):   2 columns × card width
Tablet (640px+):    3 columns × card width
Desktop (768px+):   4 columns × card width

Padding:
- Card: 0
- Image area: 16px (p-4)
- Info section: 14px (p-3.5)
- Gap between cards: 16px (gap-4)
```

### Badge Placement

```
┌─ Card Image Area ─────────────┐
│  ┌─ LIVE ┐      ┌─ TRENDING ┐ │
│  │ Top-L │      │  Top-R    │ │
│  └───────┘      └───────────┘ │
│                                │
│   Channel Image                │
│                                │
│  ┌─────────────┌─ FAVORITE ┐  │
│  │             │ Bottom-R  │  │
│  │             └───────────┘  │
│  │                            │
│  └────────────────────────────┘
```

## 🎬 Animation Specifications

### Card Hover Animation
```
Timing: 300ms
Easing: ease-in-out

Changes:
- Shadow: shadow-sm → shadow-xl
- Transform: none → translate-y(-4px)
- Border: border-border/20 → border-primary/30
- Image: scale(1) → scale(1.05)
```

### Badge Appearance
```
Timing: 300ms
Easing: ease-in-out
Effect: Fade in + slide down

Starting state: opacity-0, translateY(-8px)
Final state: opacity-100, translateY(0)
```

### Favorite Animation
```
Name: heartbeat
Timing: 500ms
Effect: Scale pulse with color change
```

### Button Press
```
Active state: scale(0.97)
Timing: immediate (active state)
Creates tactile feedback on tap
```

## 📐 Layout Grids

### Mobile (360px - 480px)
```
┌─────────────────────────┐
│ ┌─────────┐ ┌─────────┐ │
│ │ Card 1  │ │ Card 2  │ │  2 columns
│ │ 180px   │ │ 180px   │ │  w = 47%
│ └─────────┘ └─────────┘ │
│ ┌─────────┐ ┌─────────┐ │
│ │ Card 3  │ │ Card 4  │ │
│ └─────────┘ └─────────┘ │
└─────────────────────────┘
```

### Tablet (640px - 1024px)
```
┌──────────────────────────────────┐
│ ┌────────┐ ┌────────┐ ┌────────┐ │
│ │ Card 1 │ │ Card 2 │ │ Card 3 │ │  3 columns
│ │ ~200px │ │ ~200px │ │ ~200px │ │  w = 32%
│ └────────┘ └────────┘ └────────┘ │
│ ┌────────┐ ┌────────┐ ┌────────┐ │
│ │ Card 4 │ │ Card 5 │ │ Card 6 │ │
│ └────────┘ └────────┘ └────────┘ │
└──────────────────────────────────┘
```

### Desktop (1024px+)
```
┌────────────────────────────────────────────┐
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ... │
│ │Card 1│ │Card 2│ │Card 3│ │Card 4│     │  4+ columns
│ │~196px│ │~196px│ │~196px│ │~196px│     │  w = ~22%
│ └──────┘ └──────┘ └──────┘ └──────┘ ... │
└────────────────────────────────────────────┘
```

## 🎪 Navigation Styles

### Bottom Navigation Bar (Mobile)

```
Height: 64px (h-16)
Position: Fixed bottom
Width: 100% (mobile only)

┌─────────────────────────────────┐
│ 🏠      📈    ❤️(3)   🌐    ⚙️   │
│ HOME  TREND  FAV   BROWSE SETT  │
│ │      │     │      │      │    │  Active indicator
└─────────────────────────────────┘

Button specs:
- Width: 20% (5 equal columns)
- Height: 64px
- Min tap: 44px
- Icons: 20px
- Text: 10px
```

### Section Headers (Expandable)

```
┌─ Section Header ─────────────────┐
│ [ICON] Title          [CHEVRON]   │
│        Subtitle                   │
└───────────────────────────────────┘

Icon: 20px
Title: 18px bold
Subtitle: 12px muted
Chevron: 20px (rotates 90° when expanded)
```

## 🎨 State Styles

### Card States

#### Default
```
Border: border-border/20
Shadow: shadow-sm
Scale: 1
```

#### Hover
```
Border: border-primary/30
Shadow: shadow-xl with primary/10 color
Scale: 1.02
Transform: translateY(-4px)
```

#### Active/Pressed
```
Scale: 0.97
Feedback: Immediate scale reduction
```

### Favorite Toggle

#### Unfavorited
```
Icon: Heart outline
Color: white/80
Background: black/40 with backdrop blur
```

#### Favorited
```
Icon: Heart filled (solid)
Color: red-400 (#f472b6)
Animation: heartbeat (pulse effect)
```

## 📱 Touch Target Guidelines

```
Minimum size: 44×44px (iOS, Android standard)
Recommended: 48×48px for optimal touch

Card: Full area tappable (minimum 120×120px)
Buttons: 44px height minimum
Badge: No tap target (info only)
Navigation: Full 64px height
```

## 🌗 Dark Mode Support

All colors use semantic tokens that automatically adapt:

```
Light Mode:
- background: #FFFFFF
- foreground: #000000
- card: #F5F5F5
- muted: #CCCCCC

Dark Mode:
- background: #1A1A1A
- foreground: #FFFFFF
- card: #2A2A2A
- muted: #666666

Badges maintain consistent colors across modes
```

## 🔄 Transition Patterns

### Standard Transitions
```
Property: all
Duration: 300ms
Easing: ease-in-out
```

### Quick Interactions
```
Property: colors, opacity
Duration: 200ms
Easing: ease-in-out
```

### Slow Animations
```
Property: transform
Duration: 500ms
Easing: ease-in-out
(Image zoom effects)
```

## 🎯 Focus & Accessibility

### Keyboard Focus
```
Visible focus ring: 2px
Color: primary color
Offset: 2px outside element
Shape: rounded (matches element)
```

### High Contrast Mode
```
Borders: Darker, more visible
Text: Stronger contrast ratio
Badges: Solid colors (no opacity)
```

## 📊 Density

### Compact Spacing
- Mobile default (maximize content)
- Gap: 16px
- Padding: 14px

### Comfortable Spacing
- Tablet/Desktop
- Gap: 20px
- Padding: 16px

### Spacious Spacing
- Wide screens (> 1200px)
- Gap: 24px
- Padding: 20px

---

**Design System Version**: 1.0  
**Last Updated**: 2026-03-10  
**Status**: Active
