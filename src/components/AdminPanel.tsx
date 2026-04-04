
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Upload, Film, Database, Check, Loader2, Monitor, Calendar, Zap, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFirestore, useUser } from "@/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { MOCK_MOVIES } from "@/app/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/firebase/storage/use-upload";
import { Progress } from "@/components/ui/progress";

export const AdminPanel = () => {
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);

  const selectedQuality = watch("quality", "4K ULTRA HDR");
  const { uploadFile: uploadPoster, progress: posterProgress, isUploading: isPosterUploading } = useUpload();
  const { uploadFile: uploadVideo, progress: videoProgress, isUploading: isVideoUploading } = useUpload();

  useEffect(() => {
    async function checkAdmin() {
      if (!firestore || !user) return;
      const adminRef = doc(firestore, "roles_admin", user.uid);
      const snap = await getDoc(adminRef);
      setIsAdmin(snap.exists());
    }
    checkAdmin();
  }, [firestore, user]);

  const handlePromote = async () => {
    if (!firestore || !user) return;
    setIsPromoting(true);
    try {
      const adminRef = doc(firestore, "roles_admin", user.uid);
      await setDoc(adminRef, {
        uid: user.uid,
        email: user.email || "demo@replica.nexus",
        promotedAt: new Date().toISOString()
      });
      setIsAdmin(true);
      toast({ title: "Neural Promotion Success", description: "You are now an authorized Broadcast Admin." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Promotion Failed", description: e.message });
    } finally {
      setIsPromoting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'poster' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const path = `content/${Date.now()}_${file.name}`;
      const url = type === 'poster' 
        ? await uploadPoster(file, path) 
        : await uploadVideo(file, path);
      
      setValue(type === 'poster' ? 'thumbnailUrl' : 'videoUrl', url);
      
      toast({
        title: `${type === 'poster' ? 'Asset' : 'Protocol'} Synchronized`,
        description: "File has been uploaded to the media matrix.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Sync Error",
        description: err.message,
      });
    }
  };

  const onSubmit = async (data: any) => {
    if (!firestore || !isAdmin) {
      toast({ variant: "destructive", title: "Access Denied", description: "Only authorized admins can broadcast content." });
      return;
    }
    setIsSubmitting(true);

    const id = Math.random().toString(36).substring(2, 9);
    const contentRef = doc(firestore, "content", id);
    
    const payload = {
      ...data,
      id,
      type: data.type || 'movie',
      rating: (Math.random() * 2 + 7.5).toFixed(1),
      genres: [data.genre || "Action"],
      isTrending: true,
      isNew: true,
      quality: selectedQuality,
      publishDate: data.publishDate || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(contentRef, payload);
      toast({
        title: "Metadata Synchronized",
        description: `${data.title} has been scheduled for broadcast.`,
      });
      reset();
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Integration Failed",
        description: e.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const seedDatabase = async () => {
    if (!firestore || !isAdmin) return;
    setIsSeeding(true);

    try {
      for (const movie of MOCK_MOVIES) {
        const contentRef = doc(firestore, "content", movie.id);
        await setDoc(contentRef, {
          ...movie,
          quality: "4K ULTRA HDR",
          publishDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      toast({
        title: "Neural Sync Complete",
        description: `${MOCK_MOVIES.length} cinematic protocols synchronized.`,
      });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Error", description: e.message });
    } finally {
      setIsSeeding(false);
    }
  };

  if (isAdmin === false) {
    return (
      <div className="min-h-screen pt-36 px-6 flex items-center justify-center bg-background">
        <Card className="glass border-white/5 w-full max-w-md p-12 rounded-[4rem] text-center space-y-8">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto border border-primary/20">
            <ShieldAlert className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-headline font-bold text-white tracking-tighter">Neural Promotion</h2>
            <p className="text-white/40 font-medium leading-relaxed">Identity requires clearance to access broadcast controls.</p>
          </div>
          <Button onClick={handlePromote} disabled={isPromoting} className="w-full h-16 rounded-2xl bg-primary hover:neon-glow-primary text-white font-bold text-lg">
            {isPromoting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Request Admin Clearance"}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-36 px-6 md:px-12 pb-24 bg-background">
      <div className="max-w-5xl mx-auto space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.4em] text-[10px]">
              <div className="w-8 h-[1px] bg-primary" />
              Administrative Nexus 1.4
            </div>
            <h1 className="text-5xl md:text-7xl font-headline font-bold text-white tracking-tighter">
              Broadcast <span className="text-primary text-glow">Manager</span>
            </h1>
          </div>
          <Button onClick={seedDatabase} disabled={isSeeding} variant="outline" className="h-14 px-8 rounded-2xl glass border-white/5 text-white/60 hover:text-white transition-all font-bold">
            {isSeeding ? <Loader2 className="w-4 h-4 animate-spin mr-3" /> : <Database className="w-4 h-4 mr-3" />}
            Seed Data
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <Card className="glass border-white/10 rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-8 pb-0">
                <CardTitle className="text-2xl font-headline font-bold text-white flex items-center gap-3">
                  <Film className="w-6 h-6 text-primary" /> Content Protocol
                </CardTitle>
                <CardDescription className="text-white/40">Core parameters for the cinematic library.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-white/30">Title</Label>
                    <Input {...register("title")} className="h-14 bg-white/5 border-white/10 text-white rounded-2xl" placeholder="Neon Protocol" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-white/30">Genre</Label>
                    <Input {...register("genre")} className="h-14 bg-white/5 border-white/10 text-white rounded-2xl" placeholder="Cyberpunk" required />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-white/30">Type</Label>
                    <select {...register("type")} className="w-full h-14 bg-white/5 border border-white/10 text-white rounded-2xl px-4 appearance-none focus:outline-none">
                      <option value="movie" className="bg-[#0B0B0F]">Movie</option>
                      <option value="show" className="bg-[#0B0B0F]">Show</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-white/30">Year</Label>
                    <Input {...register("releaseYear")} className="h-14 bg-white/5 border-white/10 text-white rounded-2xl" placeholder="2024" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-white/30">Duration</Label>
                    <Input {...register("duration")} className="h-14 bg-white/5 border-white/10 text-white rounded-2xl" placeholder="2h 15m" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-white/30">Publish Protocol (Launch Date)</Label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                    <Input type="datetime-local" {...register("publishDate")} className="h-14 bg-white/5 border-white/10 text-white rounded-2xl pl-12" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-white/30">Synopsis</Label>
                  <Textarea {...register("description")} className="min-h-[120px] bg-white/5 border-white/10 text-white rounded-2xl" placeholder="Plot overview..." required />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="glass border-white/10 rounded-[2.5rem]">
              <CardHeader className="p-8">
                <CardTitle className="text-xl font-headline font-bold text-white flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-accent" /> Quality & Assets
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-white/30">Quality Tier</Label>
                  <Select onValueChange={(v) => setValue("quality", v)} defaultValue="4K ULTRA HDR">
                    <SelectTrigger className="bg-white/5 border-white/10 h-14 rounded-2xl">
                      <SelectValue placeholder="Select Quality" />
                    </SelectTrigger>
                    <SelectContent className="glass text-white">
                      <SelectItem value="4K ULTRA HDR">4K ULTRA HDR</SelectItem>
                      <SelectItem value="1080P FULL HD">1080P FULL HD</SelectItem>
                      <SelectItem value="720P HD">720P HD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  <Label className="text-[10px] uppercase tracking-widest text-white/30">Visual Protocol (Poster)</Label>
                  <Input type="file" onChange={(e) => handleFileChange(e, 'poster')} className="hidden" id="poster-up" />
                  <label htmlFor="poster-up" className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-primary/50 transition-all bg-white/2">
                    {isPosterUploading ? <Progress value={posterProgress} className="w-2/3 h-1" /> : <><Upload className="w-6 h-6 text-white/20 mb-2" /><span className="text-xs text-white/40">Upload Image</span></>}
                  </label>
                </div>
                <div className="space-y-4">
                  <Label className="text-[10px] uppercase tracking-widest text-white/30">Stream Protocol (Video)</Label>
                  <Input type="file" onChange={(e) => handleFileChange(e, 'video')} className="hidden" id="video-up" />
                  <label htmlFor="video-up" className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-accent/50 transition-all bg-white/2">
                    {isVideoUploading ? <Progress value={videoProgress} className="w-2/3 h-1" /> : <><Film className="w-6 h-6 text-white/20 mb-2" /><span className="text-xs text-white/40">Upload Video</span></>}
                  </label>
                </div>
                <Button type="submit" disabled={isSubmitting || isPosterUploading || isVideoUploading} className="w-full h-16 bg-primary text-white font-bold rounded-2xl text-lg hover:neon-glow-primary transition-all">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Check className="w-5 h-5 mr-2" />}
                  Finalize Broadcast
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
};
