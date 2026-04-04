
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Upload, Film, FileText, LayoutGrid, Database, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFirestore } from "@/firebase";
import { doc, setDoc, collection } from "firebase/firestore";
import { MOCK_MOVIES } from "@/app/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

export const AdminPanel = () => {
  const { register, handleSubmit, reset } = useForm();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  const onSubmit = async (data: any) => {
    if (!firestore) return;

    const id = Math.random().toString(36).substring(2, 9);
    const contentRef = doc(firestore, "content", id);
    
    const payload = {
      ...data,
      id,
      type: 'movie',
      rating: (Math.random() * 2 + 7.5).toFixed(1),
      releaseYear: new Date().getFullYear().toString(),
      duration: "2h 00m",
      genres: [data.genre || "Action"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(contentRef, payload);
      toast({
        title: "Metadata Synchronized",
        description: `${data.title} has been added to the library.`,
      });
      reset();
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: e.message,
      });
    }
  };

  const seedDatabase = async () => {
    if (!firestore) return;
    setIsSeeding(true);

    try {
      for (const movie of MOCK_MOVIES) {
        const contentRef = doc(firestore, "content", movie.id);
        await setDoc(contentRef, {
          ...movie,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      toast({
        title: "Database Seeded",
        description: "Library has been populated with cinematic mock data.",
      });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Seeding Error",
        description: e.message,
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 px-6 md:px-12 pb-24 bg-background">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-white tracking-tighter">
              Content <span className="text-primary">Nexus</span>
            </h1>
            <p className="text-white/60">Upload and manage cinematic experiences for the Replica matrix.</p>
          </div>
          <div className="flex gap-4">
            <Button 
              onClick={seedDatabase} 
              disabled={isSeeding}
              variant="outline" 
              className="rounded-full border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
            >
              {isSeeding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Database className="w-4 h-4 mr-2" />}
              Seed Database
            </Button>
            <Button variant="outline" className="rounded-full border-white/10 glass">
              View Live Library
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card className="glass border-white/10 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Film className="w-5 h-5 text-primary" /> Core Metadata
              </CardTitle>
              <CardDescription>Essential details that identify the cinematic protocol.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white/40 uppercase tracking-widest text-[10px] font-black">Title</Label>
                  <Input id="title" {...register("title")} className="bg-white/5 border-white/10 text-white h-12" placeholder="e.g. Neon Protocol" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genre" className="text-white/40 uppercase tracking-widest text-[10px] font-black">Genre</Label>
                  <Input id="genre" {...register("genre")} className="bg-white/5 border-white/10 text-white h-12" placeholder="e.g. Sci-Fi" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-white/40 uppercase tracking-widest text-[10px] font-black">Synopsis</Label>
                <Textarea id="description" {...register("description")} className="bg-white/5 border-white/10 text-white min-h-[120px]" placeholder="Briefly describe the plot..." />
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-white/10 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <LayoutGrid className="w-5 h-5 text-accent" /> Media Assets
              </CardTitle>
              <CardDescription>High-fidelity assets for the immersive experience.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="thumbnailUrl" className="text-white/40 uppercase tracking-widest text-[10px] font-black">Poster URL</Label>
                  <Input id="thumbnailUrl" {...register("thumbnailUrl")} className="bg-white/5 border-white/10 text-white" placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="videoUrl" className="text-white/40 uppercase tracking-widest text-[10px] font-black">Stream URL</Label>
                  <Input id="videoUrl" {...register("videoUrl")} className="bg-white/5 border-white/10 text-white" placeholder="https://..." />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-4">
            <Button variant="ghost" className="text-white/40 hover:text-white uppercase tracking-widest text-xs font-black">Discard Changes</Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 rounded-full px-12 py-6 text-lg font-bold neon-glow-primary active:scale-95 transition-all">
              Synchronize Content
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
