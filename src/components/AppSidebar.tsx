import React, { useState } from 'react';
import {
  Home,
  Heart,
  Grid3X3,
  Settings,
  Keyboard,
  ChevronLeft,
  ChevronRight,
  Tv,
  TrendingUp,
  Clock,
  Flame,
} from 'lucide-react';

export type SidebarView = 'home' | 'favorites' | 'categories' | 'trending';

interface AppSidebarProps {
  activeView: SidebarView;
  onViewChange: (view: SidebarView) => void;
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
  favoritesCount: number;
}

const navItems: { id: SidebarView; label: string; icon: React.ElementType }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'trending', label: 'Trending', icon: Flame },
  { id: 'favorites', label: 'Favorites', icon: Heart },
  { id: 'categories', label: 'Categories', icon: Grid3X3 },
];

const AppSidebar: React.FC<AppSidebarProps> = ({
  activeView,
  onViewChange,
  onOpenSettings,
  onOpenShortcuts,
  favoritesCount,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`h-full flex flex-col bg-card/60 backdrop-blur-xl border-r border-border/30 transition-all duration-300 ease-out ${
        collapsed ? 'w-[72px]' : 'w-[220px]'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border/20 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Tv className="w-5 h-5 text-primary" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-base font-black tracking-tight text-foreground leading-none">REET TV</h1>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Stream</p>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = activeView === id;
          return (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
              }`}
              title={collapsed ? label : undefined}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
              )}
              <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-primary' : ''}`} />
              {!collapsed && (
                <span className="truncate">{label}</span>
              )}
              {!collapsed && id === 'favorites' && favoritesCount > 0 && (
                <span className="ml-auto text-[10px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded-md">
                  {favoritesCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-border/20 p-2 space-y-1 flex-shrink-0">
        <button
          onClick={onOpenShortcuts}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-colors"
          title={collapsed ? 'Shortcuts' : undefined}
        >
          <Keyboard className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span>Shortcuts</span>}
        </button>
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-colors"
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-muted-foreground/60 hover:bg-muted/20 hover:text-muted-foreground transition-colors"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 flex-shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
