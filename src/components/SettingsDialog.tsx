
"use client";

import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { User, Shield, Video, BellRing } from "lucide-react";

interface SettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsDialog = ({ isOpen, onOpenChange }: SettingsDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-white/10 text-white max-w-2xl overflow-hidden rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-3xl font-headline font-bold tracking-tighter">
            Nexus <span className="text-primary">Settings</span>
          </DialogTitle>
          <DialogDescription className="text-white/40">
            Configure your immersive streaming protocols.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full mt-4">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl mb-6">
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary rounded-lg flex gap-2">
              <User className="w-4 h-4" /> Profile
            </TabsTrigger>
            <TabsTrigger value="playback" className="data-[state=active]:bg-primary rounded-lg flex gap-2">
              <Video className="w-4 h-4" /> Playback
            </TabsTrigger>
            <TabsTrigger value="privacy" className="data-[state=active]:bg-primary rounded-lg flex gap-2">
              <Shield className="w-4 h-4" /> Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-primary rounded-lg flex gap-2">
              <BellRing className="w-4 h-4" /> Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-white/60">Display Name</Label>
                <Input className="bg-white/5 border-white/10 text-white" placeholder="Cyberpunk_User_01" defaultValue="Guest User" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/60">Interface Language</Label>
                <Input className="bg-white/5 border-white/10 text-white" defaultValue="English (US)" readOnly />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-white/60">Bio Protocol</Label>
              <textarea className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-primary min-h-[100px]" placeholder="Tell the matrix about yourself..." />
            </div>
          </TabsContent>

          <TabsContent value="playback" className="space-y-6">
            <div className="flex items-center justify-between p-4 glass-card rounded-2xl">
              <div className="space-y-0.5">
                <Label className="text-base">Auto-Play Next Episode</Label>
                <p className="text-xs text-white/40">Automatically start the next episode in a series.</p>
              </div>
              <Switch defaultChecked className="data-[state=checked]:bg-primary" />
            </div>
            <div className="flex items-center justify-between p-4 glass-card rounded-2xl">
              <div className="space-y-0.5">
                <Label className="text-base">Streaming Quality</Label>
                <p className="text-xs text-white/40">Prefer 4K Ultra HD whenever available.</p>
              </div>
              <Switch defaultChecked className="data-[state=checked]:bg-primary" />
            </div>
            <div className="flex items-center justify-between p-4 glass-card rounded-2xl">
              <div className="space-y-0.5">
                <Label className="text-base">Immersive Audio</Label>
                <p className="text-xs text-white/40">Enable spatial audio and high-fidelity output.</p>
              </div>
              <Switch defaultChecked className="data-[state=checked]:bg-primary" />
            </div>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
             <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl space-y-2">
                <p className="text-primary font-bold text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Account Encryption Active
                </p>
                <p className="text-xs text-white/60">Your viewing data is end-to-end encrypted and decentralized across the Replica node network.</p>
             </div>
             <Button variant="outline" className="w-full rounded-full border-white/10 glass hover:bg-white/10">
                Download Neural Backup
             </Button>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
             {["New Arrivals", "Personalized Recommendations", "Account Security Alerts", "Newsletter Protocol"].map(label => (
                <div key={label} className="flex items-center justify-between py-2">
                   <Label className="text-white/80">{label}</Label>
                   <Switch defaultChecked className="data-[state=checked]:bg-primary" />
                </div>
             ))}
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-8">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-white/40 hover:text-white">Cancel</Button>
          <Button className="bg-primary hover:bg-primary/90 rounded-full px-8 py-6 font-bold neon-glow-primary">
            Update Protocols
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
