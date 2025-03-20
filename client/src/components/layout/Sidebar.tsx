import { Link, useLocation } from "wouter";
import { AIServiceIndicator } from "@/components/shared/AIServiceIndicator";

type SidebarProps = {
  user?: {
    name: string;
    email: string;
    level: number;
    xp: number;
  };
  recentMaterials: Array<{
    id: number;
    title: string;
  }>;
  userBadges: Array<{
    id: number;
    name: string;
    icon: string;
  }>;
};

export default function Sidebar({ user, recentMaterials, userBadges }: SidebarProps) {
  const [location] = useLocation();

  return (
    <aside className="bg-white border-r border-neutral-200 w-full md:w-64 md:h-screen md:sticky md:top-0 flex-shrink-0">
      {/* Logo and app name */}
      <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-md bg-accent flex items-center justify-center">
            <span className="material-icons text-white text-xl">psychology</span>
          </div>
          <h1 className="font-display font-bold text-xl">StudyAI</h1>
        </div>
        <button className="md:hidden text-neutral-500 hover:text-neutral-700">
          <span className="material-icons">menu</span>
        </button>
      </div>
      
      {/* AI Service Indicator */}
      <div className="px-6 py-2 border-b border-neutral-200">
        <AIServiceIndicator />
      </div>
      
      {/* Navigation */}
      <nav className="p-4 space-y-6">
        {/* Main nav */}
        <div className="space-y-2">
          <Link href="/">
            <a className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${location === "/" ? "bg-primary/10 text-primary font-medium" : "text-neutral-700 hover:bg-neutral-100"} transition`}>
              <span className="material-icons">dashboard</span>
              <span>Dashboard</span>
            </a>
          </Link>
          <Link href="/study-planner">
            <a className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${location === "/study-planner" ? "bg-primary/10 text-primary font-medium" : "text-neutral-700 hover:bg-neutral-100"} transition`}>
              <span className="material-icons">event_note</span>
              <span>AI Study Planner</span>
            </a>
          </Link>
          <Link href="/textbook-analyzer">
            <a className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${location === "/textbook-analyzer" ? "bg-primary/10 text-primary font-medium" : "text-neutral-700 hover:bg-neutral-100"} transition`}>
              <span className="material-icons">description</span>
              <span>Textbook Analyzer</span>
            </a>
          </Link>
          <Link href="/study-buddy">
            <a className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${location === "/study-buddy" ? "bg-primary/10 text-primary font-medium" : "text-neutral-700 hover:bg-neutral-100"} transition`}>
              <span className="material-icons">chat</span>
              <span>AI Study Buddy</span>
            </a>
          </Link>
          <Link href="/progress-tracker">
            <a className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${location === "/progress-tracker" ? "bg-primary/10 text-primary font-medium" : "text-neutral-700 hover:bg-neutral-100"} transition`}>
              <span className="material-icons">insights</span>
              <span>Progress Tracker</span>
            </a>
          </Link>
        </div>
        
        {/* Recent materials */}
        {recentMaterials.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider px-3 mb-2">Recent Materials</h3>
            <ul className="space-y-1">
              {recentMaterials.map((material) => (
                <li key={material.id}>
                  <Link href={`/textbook-analyzer?id=${material.id}`}>
                    <a className="flex items-center space-x-3 px-3 py-2 rounded-lg text-neutral-700 hover:bg-neutral-100 transition text-sm">
                      <span className="material-icons text-neutral-400 text-sm">description</span>
                      <span className="truncate">{material.title}</span>
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* User stats */}
        {user && (
          <div className="bg-neutral-100 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Level {user.level}</span>
              <span className="text-xs text-neutral-500">{user.xp} XP</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div 
                className="bg-accent h-2 rounded-full" 
                style={{ width: `${(user.xp % 1000) / 10}%` }} 
              />
            </div>
            <div className="flex gap-1.5">
              {userBadges.slice(0, 3).map((badge) => (
                <div 
                  key={badge.id}
                  className="h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center" 
                  title={badge.name}
                >
                  <span className="material-icons text-accent text-sm">{badge.icon}</span>
                </div>
              ))}
              {userBadges.length > 3 && (
                <div 
                  className="h-6 w-6 rounded-full bg-neutral-200 flex items-center justify-center text-xs text-neutral-500" 
                  title="More badges"
                >
                  +{userBadges.length - 3}
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
      
      {/* User profile */}
      {user && (
        <div className="mt-auto border-t border-neutral-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="material-icons text-primary">person</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{user.name}</p>
              <p className="text-neutral-500 text-xs truncate">{user.email}</p>
            </div>
            <button className="text-neutral-400 hover:text-neutral-600">
              <span className="material-icons">more_vert</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
