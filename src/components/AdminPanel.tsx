
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Upload, Film, FileText, LayoutGrid, Database, Check, Loader2, Sparkles, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFirestore } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { MOCK_MOVIES } from "@/app/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

export const AdminPanel = () => {
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const selectedQuality = watch("quality", "4K ULTRA HDR");

  const onSubmit = async (data: any) => {
    if (!firestore) return;

    setIsUploading(true);
    const id = Math.random().toString(36).substring(2, 9);
    const contentRef = doc(firestore, "content", id);
    
    const payload = {
      ...data,
      id,
      type: data.type || 'movie',
      rating: (Math.random() * 2 + 7.5).toFixed(1),
      releaseYear: data.releaseYear || new Date().getFullYear().toString(),
      duration: data.duration || "2h 00m",
      genres: [data.genre || "Action"],
      isTrending: true,
      quality: selectedQuality,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(contentRef, payload);
      toast({
        title: "Metadata Synchronized",
        description: `${data.title} has been added to the library at ${selectedQuality}.`,
      });
      reset();
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: e.message,
      });
    } finally {
      setIsUploading(false);
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
          quality: "4K ULTRA HDR",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      toast({
        title: "Neural Sync Complete",
        description: `${MOCK_MOVIES.length} cinematic protocols synchronized to live matrix.`,
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
    <div className="min-h-screen pt-36 px-6 md:px-12 pb-24 bg-background">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-[0.4em] text-[10px]">
              <div className="w-8 h-[1px] bg-primary" />
              Administrative Protocol 1.4
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold text-white tracking-tighter">
              Content <span className="text-primary text-glow">Nexus</span>
            </h1>
            <p className="text-white/40 text-lg">Seperate content by quality and manage cinematic protocols.</p>
          </div>
          <div className="flex gap-4">
            <Button 
              onClick={seedDatabase} 
              disabled={isSeeding}
              className="rounded-full px-8 h-14 bg-primary hover:bg-primary/90 text-white font-bold neon-glow-primary active:scale-95 transition-all"
            >
              {isSeeding ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Database className="w-5 h-5 mr-2" />}
              Seed Database
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <Card className="glass border-white/10 shadow-2xl overflow-hidden rounded-[3rem]">
            <CardHeader className="p-10">
              <CardTitle className="flex items-center gap-4 text-3xl font-headline font-bold text-white">
                <Film className="w-8 h-8 text-primary" /> Core Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-white/40 uppercase tracking-widest text-[10px] font-black">Title</Label>
                  <Input {...register("title")} className="bg-white/5 border-white/10 text-white h-14 rounded-2xl px-6" placeholder="e.g. Neon Protocol" required />
                </div>
                <div className="space-y-3">
                  <Label className="text-white/40 uppercase tracking-widest text-[10px] font-black">Genre</Label>
                  <Input {...register("genre")} className="bg-white/5 border-white/10 text-white h-14 rounded-2xl px-6" placeholder="e.g. Sci-Fi" required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label className="text-white/40 uppercase tracking-widest text-[10px] font-black">Type</Label>
                  <Select onValueChange={(v) => setValue("type", v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-14 rounded-2xl">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent className="glass text-white">
                      <SelectItem value="movie">Cinematic (Movie)</SelectItem>
                      <SelectItem value="show">Series (Show)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-white/40 uppercase tracking-widest text-[10px] font-black">Release Year</Label>
                  <Input {...register("releaseYear")} className="bg-white/5 border-white/10 text-white h-14 rounded-2xl px-6" placeholder="2024" />
                </div>
                <div className="space-y-3">
                  <Label className="text-white/40 uppercase tracking-widest text-[10px] font-black">Duration</Label>
                  <Input {...register("duration")} className="bg-white/5 border-white/10 text-white h-14 rounded-2xl px-6" placeholder="2h 15m" />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-white/40 uppercase tracking-widest text-[10px] font-black">Synopsis</Label>
                <Textarea {...register("description")} className="bg-white/5 border-white/10 text-white min-h-[120px] rounded-2xl p-6" placeholder="Neural plot description..." required />
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-white/10 shadow-2xl rounded-[3rem]">
            <CardHeader className="p-10">
              <CardTitle className="flex items-center gap-4 text-3xl font-headline font-bold text-white">
                <Monitor className="w-8 h-8 text-accent" /> Quality & Assets
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-white/40 uppercase tracking-widest text-[10px] font-black">Stream Quality</Label>
                  <Select onValueChange={(v) => setValue("quality", v)} defaultValue="4K ULTRA HDR">
                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-14 rounded-2xl">
                      <SelectValue placeholder="Select Quality" />
                    </SelectTrigger>
                    <SelectContent className="glass text-white">
                      <SelectItem value="4K ULTRA HDR">4K ULTRA HDR</SelectItem>
                      <SelectItem value="1080P FULL HD">1080P FULL HD</SelectItem>
                      <SelectItem value="720P HD">720P HD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-white/40 uppercase tracking-widest text-[10px] font-black">Poster URL</Label>
                  <Input {...register("thumbnailUrl")} className="bg-white/5 border-white/10 text-white h-14 rounded-2xl px-6" placeholder="https://..." required />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-white/40 uppercase tracking-widest text-[10px] font-black">Stream URL (Direct Video)</Label>
                <Input {...register("videoUrl")} className="bg-white/5 border-white/10 text-white h-14 rounded-2xl px-6" placeholder="https://..." required />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-8 pt-8">
            <Button variant="ghost" onClick={() => reset()} className="text-white/40 hover:text-white uppercase tracking-widest text-[10px] font-black">Discard</Button>
            <Button type="submit" disabled={isUploading} className="bg-primary hover:bg-primary/90 rounded-full px-16 h-16 text-xl font-bold neon-glow-primary active:scale-95 transition-all">
              {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Synchronize Content"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
