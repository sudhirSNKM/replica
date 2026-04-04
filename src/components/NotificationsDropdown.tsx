
"use client";

import React from "react";
import { Bell, Sparkles, Film, Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    title: "New Arrival: Neon Protocol",
    description: "The highly anticipated sci-fi thriller is now streaming in 4K.",
    time: "2 hours ago",
    type: "new",
    icon: Film
  },
  {
    id: "2",
    title: "AI Suggestion for You",
    description: "Based on your watch history, we think you'll love Silicon Dreams.",
    time: "5 hours ago",
    type: "ai",
    icon: Sparkles
  },
  {
    id: "3",
    title: "System Update Complete",
    description: "Your Replica experience has been updated to node version 2.4.0.",
    time: "1 day ago",
    type: "system",
    icon: Info
  }
];

export const NotificationsDropdown = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full neon-glow-primary" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="glass border-white/10 text-white w-80 p-0" align="end">
        <div className="p-4 flex items-center justify-between">
          <h3 className="font-headline font-bold text-lg">Notifications</h3>
          <span className="text-[10px] uppercase tracking-widest text-primary font-bold">3 Unread</span>
        </div>
        <Separator className="bg-white/10" />
        <ScrollArea className="h-80">
          <div className="flex flex-col">
            {MOCK_NOTIFICATIONS.map((n) => (
              <div 
                key={n.id} 
                className="p-4 hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="flex gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-none",
                    n.type === 'new' ? 'bg-primary/20 text-primary' : 
                    n.type === 'ai' ? 'bg-accent/20 text-accent' : 'bg-white/10 text-white/60'
                  )}>
                    <n.icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold group-hover:text-primary transition-colors">{n.title}</p>
                    <p className="text-xs text-white/40 leading-relaxed">{n.description}</p>
                    <p className="text-[10px] text-white/20 font-medium pt-1">{n.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <Separator className="bg-white/10" />
        <div className="p-3 text-center">
          <button className="text-xs text-white/40 hover:text-white transition-colors uppercase tracking-widest font-bold">
            Clear all alerts
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Simple utility if cn is not imported correctly in this specific snippet
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
