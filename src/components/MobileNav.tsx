import React, { memo } from 'react';
import { Home, Zap, Heart, Compass, Settings } from 'lucide-react';

interface MobileNavProps {
  activeView: 'home' | 'trending' | 'favorites' | 'browse' | 'settings';
  onViewChange: (view: 'home' | 'trending' | 'favorites' | 'browse' | 'settings') => void;
  favoriteCount?: number;
}

const MobileNav: React.FC<MobileNavProps> = memo(({
  activeView,
  onViewChange,
  favoriteCount = 0,
}) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'trending', label: 'Trending', icon: Zap },
    { id: 'favorites', label: 'Favorites', icon: Heart, badge: favoriteCount },
    { id: 'browse', label: 'Browse', icon: Compass },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/10 bg-background/95 backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ id, label, icon: Icon, badge }) => (
          <button
            key={id}
            onClick={() => onViewChange(id as 'home' | 'trending' | 'favorites' | 'browse' | 'settings')}
            className={`flex flex-col items-center justify-center gap-1 px-4 py-2 transition-all relative ${
              activeView === id
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className={`relative ${activeView === id ? 'scale-110' : ''}`}>
              <Icon className="w-5 h-5" />
              {badge !== undefined && badge > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{label}</span>
            {activeView === id && (
              <div className="absolute bottom-0 w-8 h-1 rounded-t-full bg-primary" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
});

MobileNav.displayName = 'MobileNav';

export default MobileNav;
