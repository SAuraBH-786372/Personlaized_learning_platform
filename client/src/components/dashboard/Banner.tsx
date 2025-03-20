import { Button } from "@/components/ui/button";

interface BannerProps {
  user: {
    firstName: string;
  };
  weeklyProgress: number;
  onNewSession: () => void;
  onAskStudyBuddy: () => void;
}

export default function Banner({ user, weeklyProgress, onNewSession, onAskStudyBuddy }: BannerProps) {
  return (
    <div className="bg-gradient-to-r from-primary to-accent rounded-xl p-6 text-white mb-8 relative overflow-hidden">
      <div className="absolute right-0 top-0 w-48 h-48 opacity-10">
        <span className="material-icons text-[12rem]">psychology</span>
      </div>
      <div className="relative z-10">
        <h1 className="font-display font-bold text-2xl md:text-3xl mb-2">
          Welcome back, {user.firstName}!
        </h1>
        <p className="text-white/80 max-w-xl">
          You've completed <b>{weeklyProgress}%</b> of your weekly study goals. Keep it up!
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button 
            onClick={onNewSession}
            className="bg-white text-primary font-medium hover:bg-white/90 transition flex items-center space-x-2"
          >
            <span className="material-icons">add</span>
            <span>New Study Session</span>
          </Button>
          <Button 
            onClick={onAskStudyBuddy}
            variant="ghost" 
            className="bg-white/20 text-white font-medium hover:bg-white/30 transition flex items-center space-x-2"
          >
            <span className="material-icons">chat</span>
            <span>Ask Study Buddy</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
