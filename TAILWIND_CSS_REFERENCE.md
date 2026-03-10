# Mobile Design - Tailwind CSS Classes Reference

## Border Radius Classes

### Card Containers
- `rounded-3xl` - 30px border radius (main card container)
- `rounded-t-3xl` - Rounded top corners only (image area)
- `rounded-full` - Pill-shaped (badges and buttons)
- `rounded-lg` - 8px border radius (tag badges)

## Grid & Spacing

### Grid Layouts
```
Mobile:   grid-cols-2        (2 columns)
Tablet:   sm:grid-cols-3     (3 columns)
Desktop:  md:grid-cols-4     (4 columns)
Wide:     lg:grid-cols-5     (5 columns)
```

### Gap & Padding
- `gap-4` - 16px gap between cards
- `gap-3` - 12px gap for section headers
- `p-3.5` - 14px padding inside cards
- `px-2.5 py-1` - Badge padding (10px horizontal, 4px vertical)
- `px-4` - Content area horizontal padding
- `py-6` - Section vertical spacing

### Margin & Space
- `space-y-6` - 24px vertical spacing between sections
- `mb-4` - 16px margin bottom (titles)
- `mt-1.5` - 6px margin top (meta info)
- `mt-4` - 16px margin top (buttons)

## Colors & Backgrounds

### Card Styling
```css
bg-card               /* Card background */
border-border/20      /* Card border (20% opacity) */
hover:border-primary/30  /* Hover border color */
bg-muted/20           /* Image area background */
```

### Badge Colors
```css
/* Trending Badge */
bg-orange-500/90      /* 90% opacity orange */
text-white            /* White text */

/* Favorite Badge */
bg-rose-500/90        /* 90% opacity rose/pink */
text-white

/* New Badge */
bg-blue-500/90        /* 90% opacity blue */
text-white

/* Live Badge */
bg-destructive/90     /* 90% opacity red */
text-destructive-foreground
```

### Text Colors
```css
text-foreground       /* Primary text */
text-muted-foreground /* Secondary text */
text-white/90         /* White with 90% opacity */
text-white/80         /* White with 80% opacity */
```

## Typography

### Font Sizes & Weights
- `text-lg` - 18px (section titles)
- `text-sm` - 14px (card title)
- `text-xs` - 12px (meta information)
- `text-[10px]` - 10px (badges, tags)
- `text-[9px]` - 9px (badge text)
- `text-[10px]` - Custom 10px (group/language tags)

### Font Weights
- `font-bold` - Section titles, channel names
- `font-semibold` - Important labels
- `font-black` - Extra bold for emphasis
- `font-medium` - Medium weight for tags
- `font-black` - Icon/initials in fallback

### Text Styling
- `truncate` - Single line with ellipsis
- `uppercase` - All caps (badges)
- `tracking-tight` - Tight letter spacing

## Animations & Transitions

### Transition Classes
```css
transition-all       /* All properties */
transition-colors    /* Color changes only */
transition-transform /* Transform properties */

duration-300         /* 300ms animation */
duration-200         /* 200ms animation */
duration-500         /* 500ms for image zoom */
```

### Transform Classes
```css
hover:scale-105      /* 105% scale on hover */
hover:-translate-y-1 /* Move up 4px on hover */
active:scale-[0.97]  /* 97% scale on click */
active:scale-90      /* 90% scale for buttons */

group-hover:scale-110 /* Image zoom on hover */
group-hover:opacity-100  /* Show overlays */
```

### Animation Classes
```css
animate-glow         /* Custom glow animation */
animate-pop          /* Button pop animation */
animate-heartbeat    /* Favorite toggle animation */
animate-fade-in      /* Fade in effect */
animate-spin-slow    /* Slow spinning loader */
animate-pulse        /* Live badge pulse */
```

## Opacity & Shadows

### Opacity Modifiers
```css
opacity-0            /* Hidden */
opacity-100          /* Fully visible */
/20, /30, /40, /50, /90  /* Opacity percentages */
```

### Shadows
```css
shadow-sm            /* Small shadow */
shadow-md            /* Medium shadow (on hover) */
shadow-lg            /* Large shadow */
shadow-xl            /* Extra large shadow */
hover:shadow-xl      /* Enhanced on hover */
hover:shadow-primary/10  /* Colored shadow */
```

## Positioning & Display

### Positioning
```css
absolute             /* Absolute positioning */
fixed                /* Fixed positioning (nav) */
relative             /* Relative positioning (cards) */

top-2.5 left-2.5     /* Badge positioning */
top-3 right-3        /* Badge positioning (larger) */
bottom-3 right-3     /* Favorite button */
bottom-20 lg:bottom-6 /* Scroll to top button */
```

### Z-Index
```css
z-20                 /* Badges, buttons (above image) */
z-40                 /* Navigation bar */
z-50                 /* Floating buttons */
```

### Flexbox
```css
flex items-center     /* Center items vertically */
flex items-center justify-center  /* Center both ways */
flex items-center justify-between /* Space between */
gap-2, gap-3, gap-4  /* Spacing between flex items */
```

### Display & Overflow
```css
hidden               /* Hide element */
overflow-hidden      /* Clip overflow */
overflow-x-auto      /* Horizontal scroll */
scrollbar-hide       /* Hide scrollbar */
min-h-[44px]         /* Minimum touch target */
aspect-video         /* 16:9 aspect ratio */
aspect-[4/3]         /* 4:3 aspect ratio */
```

## Responsive Utilities

### Breakpoints
```css
/* Base (mobile) */
grid-cols-2
px-4

/* Small (640px+) */
sm:grid-cols-3
sm:px-5

/* Medium (768px+) */
md:grid-cols-4
md:pb-0

/* Large (1024px+) */
lg:hidden            /* Hide sidebar on mobile */
lg:block              /* Show on desktop */
lg:grid-cols-5
```

### Mobile-First Approach
```css
/* Mobile first classes */
flex flex-col                    /* Stack vertically */
grid grid-cols-2                 /* 2 columns by default */
fixed bottom-0                   /* Fixed bottom nav */

/* Override on larger screens */
md:flex-row                      /* Horizontal on desktop */
md:grid-cols-4                   /* More columns */
md:hidden                        /* Hide on desktop */
```

## Utility Classes Combinations

### Card Container
```css
group relative rounded-3xl overflow-hidden 
cursor-pointer bg-card border border-border/20 
hover:border-primary/30 transition-all duration-300 
active:scale-[0.97] hover:-translate-y-1 
hover:shadow-xl hover:shadow-primary/10
```

### Image Area
```css
relative aspect-video bg-muted/20 
flex items-center justify-center 
overflow-hidden rounded-t-3xl
```

### Badge
```css
inline-flex items-center gap-1 
px-2.5 py-1 rounded-full 
text-[9px] font-bold uppercase 
bg-orange-500/90 text-white 
backdrop-blur-sm shadow-sm
```

### Bottom Nav Button
```css
flex flex-col items-center justify-center gap-1 
px-4 py-2 transition-all 
text-primary/90 hover:text-foreground
```

## Custom CSS Properties

### Aspect Ratios
- `aspect-video` - 16:9 ratio (channel cards)
- `aspect-[4/3]` - 4:3 ratio (alternative)

### Min-Height Touch Target
- `min-h-[44px]` - iOS recommended minimum
- Applied to bottom nav buttons for better UX

### Custom Text Sizes
- `text-[10px]` - Custom 10px size
- `text-[9px]` - Custom 9px badge text

### Gradient Text
- Used for section header icons
- `from-orange-500/20 to-red-500/20` gradient backgrounds

## Backdrop Effects

### Blur & Glass
```css
backdrop-blur-sm     /* Slight blur effect */
backdrop-blur        /* Medium blur */
backdrop-blur-xl     /* Heavy blur */

/* Used in: */
bg-background/80 backdrop-blur-xl  /* Top bar */
bg-black/30 backdrop-blur-sm        /* Overlay */
```

## Animation Timing

### Duration Values
- `duration-200` - Quick interactions (200ms)
- `duration-300` - Standard transitions (300ms)
- `duration-500` - Image zoom effects (500ms)

### Easing Functions
- Default: `ease-in-out`
- Used implicitly by Tailwind transitions

## Pseudo-Classes & States

### Hover States
```css
hover:border-primary/30
hover:scale-105
hover:-translate-y-1
hover:bg-muted/40
hover:text-foreground
group-hover:scale-110
group-hover:opacity-100
```

### Active/Focus States
```css
active:scale-[0.97]
active:scale-90
focus:outline-none
focus:ring-2
focus:ring-primary/30
```

### Group Hover
```css
group                    /* Parent container */
group-hover:opacity-100  /* Child on parent hover */
```

## Dark Mode Support

All components use semantic color tokens:
- `bg-background` - Adapts to light/dark mode
- `text-foreground` - Adapts to light/dark mode
- `border-border` - Adapts to light/dark mode

The design system automatically handles dark mode through the theme configuration.

## Performance Tips

- Use `overflow-hidden` with `rounded-3xl` for proper clipping
- Lazy load images with `loading="lazy"`
- Use `transform` transitions for GPU acceleration
- Memoize components to prevent unnecessary re-renders
- Use `will-change` utility for animated elements if needed
