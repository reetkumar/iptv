# Mobile Design Components

## Overview
This document outlines the new mobile-optimized design components for the REET TV application with enhanced rounded corner styling for card-based layouts.

## New Components

### 1. MobileChannelCard.tsx
Enhanced channel card component with rounded corners (rounded-3xl) optimized for mobile viewing.

**Features:**
- Rounded corners (30px) for modern appearance
- Aspect ratio: 16/9 video format
- Smooth animations and transitions
- Badge support for "Trending", "Favorite", and "New" channels
- Responsive image loading with fallback gradient
- Play button overlay on hover/mobile tap
- Favorite toggle button
- LIVE badge indicator

**Props:**
```typescript
interface MobileChannelCardProps {
  channel: IPTVChannel;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  index: number;
  badge?: 'trending' | 'favorite' | 'new';
}
```

**Styling Classes:**
- Card: `rounded-3xl` (30px border radius)
- Image area: `rounded-t-3xl` (rounded top corners)
- Badges: Multiple colors (orange for trending, rose for favorite, blue for new)
- Spacing: `p-3.5` for info section

### 2. MobileHome.tsx
Home screen component with expandable sections for Trending, Favorites, and Browse channels.

**Features:**
- Three main sections: Trending (🔥), Favorites (❤️), Browse (🌐)
- Collapsible section headers with smooth animations
- Color-coded badges and icons
- Responsive grid layout (2-3 columns depending on screen size)
- Empty state handling for favorites
- Badge icons with counts

**Usage:**
```typescript
<MobileHome
  channels={channels}
  favorites={favorites}
  onSelect={handleChannelSelect}
  onToggleFavorite={handleToggleFavorite}
/>
```

### 3. MobileChannelGrid.tsx
Reusable grid component for displaying channels in different views.

**Features:**
- Responsive grid (2 cols mobile, 3 cols tablet, 4+ cols desktop)
- Customizable section titles
- Badge support by section type
- Empty state messaging
- Works with MobileChannelCard

**Props:**
```typescript
interface MobileChannelGridProps {
  channels: IPTVChannel[];
  favorites: Set<string>;
  onSelect: (channel: IPTVChannel) => void;
  onToggleFavorite: (id: string) => void;
  title?: string;
  sectionType?: 'trending' | 'favorites' | 'browse';
  showBadges?: boolean;
}
```

### 4. MobileNav.tsx
Mobile bottom navigation bar for easy view switching.

**Features:**
- Fixed bottom navigation (hidden on desktop)
- 5 main navigation items: Home, Trending, Favorites, Browse, Settings
- Badge counter for favorites
- Smooth transitions and active state indicators
- Responsive touch targets (min-height: 44px for mobile)

**Props:**
```typescript
interface MobileNavProps {
  activeView: 'home' | 'trending' | 'favorites' | 'browse' | 'settings';
  onViewChange: (view: ...) => void;
  favoriteCount?: number;
}
```

## Design Specifications

### Colors & Badges
- **Trending Badge**: `bg-orange-500/90` with trending icon
- **Favorite Badge**: `bg-rose-500/90` with star icon
- **New Badge**: `bg-blue-500/90` with "NEW" text
- **Live Badge**: `bg-destructive/90` with pulse animation

### Spacing & Sizing
- Card padding: `p-3.5` (14px)
- Card gap: `gap-4` (16px between cards)
- Border radius: `rounded-3xl` (30px)
- Badge padding: `px-2.5 py-1` (compact design)

### Responsive Breakpoints
- Mobile: 2 columns (grid-cols-2)
- Tablet (sm:): 3 columns (sm:grid-cols-3)
- Desktop (md:+): 4-5 columns (md:grid-cols-4)

### Typography
- Card title: `text-sm font-bold`
- Info text: `text-[10px] font-medium`
- Badge text: `text-[9px] font-bold uppercase`

## Integration Guide

### Adding to Index.tsx
```typescript
import MobileHome from '../components/MobileHome';
import MobileNav from '../components/MobileNav';
import MobileChannelGrid from '../components/MobileChannelGrid';

// In render section
{viewMode === 'gallery' && (
  <>
    <MobileHome
      channels={channels}
      favorites={favorites}
      onSelect={handleSelectChannel}
      onToggleFavorite={toggleFavorite}
    />
    <MobileNav
      activeView={sidebarView}
      onViewChange={handleViewChange}
      favoriteCount={favorites.size}
    />
  </>
)}
```

## Usage Examples

### Basic Mobile Card
```typescript
<MobileChannelCard
  channel={channel}
  isFavorite={favorites.has(channel.id)}
  onSelect={() => selectChannel(channel)}
  onToggleFavorite={() => toggleFavorite(channel.id)}
  index={0}
  badge="trending"
/>
```

### Grid with Trending Channels
```typescript
<MobileChannelGrid
  channels={trendingChannels}
  favorites={favorites}
  onSelect={handleSelect}
  onToggleFavorite={toggleFavorite}
  title="🔥 Trending Now"
  sectionType="trending"
  showBadges={true}
/>
```

## Animations
- **Card hover**: Scale up slightly with shadow enhancement
- **Badge**: Smooth fade-in on section expand
- **Favorite toggle**: Heartbeat animation when added to favorites
- **Section expand**: Smooth height transition

## Mobile-First Approach
- Touch-friendly button sizes (minimum 44px height)
- Optimized for portrait orientation
- Bottom navigation for thumb-friendly controls
- Large tap targets for channel selection
- Swipe gestures for section navigation

## Accessibility
- Semantic HTML structure
- Proper ARIA labels on buttons
- Color contrast meets WCAG standards
- Keyboard navigation support
- Screen reader friendly badge descriptions
