
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Upload, Film, Database, Check, Loader2, Monitor, LayoutGrid } from "lucide-react";
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
import { useUpload } from "@/firebase/storage/use-upload";
import { Progress } from "@/components/ui/progress";

export const AdminPanel = () => {
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedQuality = watch("quality", "4K ULTRA HDR");
  const { uploadFile: uploadPoster, progress: posterProgress, isUploading: isPosterUploading } = useUpload();
  const { uploadFile: uploadVideo, progress: videoProgress, isUploading: isVideoUploading } = useUpload();

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
    if (!firestore) return;
    setIsSubmitting(true);

    const id = Math.random().toString(36).substring(2, 9);
    const contentRef = doc(firestore, "content", id);
    
    const payload = {
      ...data,
      id,
      type: data.type || 'movie',
      rating: (Math.random() * 2 + 7.5).toFixed(1),
      releaseYear: data.releaseYear || new Date().getFullYear().toString(),
      duration: data.duration || (data.type === 'show' ? "Season 1" : "2h 00m"),
      genres: [data.genre || "Action"],
      isTrending: true,
      isNew: true,
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
        title: "Integration Failed",
        description: e.message,
      });
    } finally {
      setIsSubmitting(false);
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
        title: "Sync Gate Error",
        description: e.message,
      });
    } finally {
      setIsSeeding(false);
    }
  };

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
              Content <span className="text-primary text-glow">Manager</span>
            </h1>
            <p className="text-white/40 text-xl font-medium max-w-2xl">Broadcast new cinematic experiences to the decentralized Replica matrix.</p>
          </div>
          <div className="flex gap-4">
            <Button 
              onClick={seedDatabase} 
              disabled={isSeeding}
              variant="outline" 
              className="h-14 px-8 rounded-2xl border-white/5 glass hover:border-primary/50 text-white/60 hover:text-white transition-all font-bold"
            >
              {isSeeding ? <Loader2 className="w-4 h-4 animate-spin mr-3" /> : <Database className="w-4 h-4 mr-3" />}
              Seed Database
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <Card className="glass border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden rounded-[2.5rem]">
              <CardHeader className="p-8 pb-0">
                <CardTitle className="text-2xl font-headline font-bold text-white flex items-center gap-3">
                  <Film className="w-6 h-6 text-primary" /> Cinematic Metadata
                </CardTitle>
                <CardDescription className="text-white/40">Core parameters for the media protocol.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Title</Label>
                    <Input {...register("title")} className="h-14 bg-white/5 border-white/10 text-white rounded-2xl focus:border-primary transition-all text-lg font-medium px-6" placeholder="Neural Protocol" required />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Genre</Label>
                    <Input {...register("genre")} className="h-14 bg-white/5 border-white/10 text-white rounded-2xl focus:border-primary transition-all text-lg font-medium px-6" placeholder="Cyberpunk" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Type</Label>
                    <select 
                      {...register("type")} 
                      className="w-full h-14 bg-white/5 border border-white/10 text-white rounded-2xl px-6 focus:border-primary focus:outline-none transition-all text-lg font-medium appearance-none"
                    >
                      <option value="movie" className="bg-[#0B0B0F]">Cinematic Movie</option>
                      <option value="show" className="bg-[#0B0B0F]">TV Series Protocol</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Release Year</Label>
                    <Input {...register("releaseYear")} className="h-14 bg-white/5 border-white/10 text-white rounded-2xl focus:border-primary transition-all text-lg font-medium px-6" placeholder="2024" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Duration</Label>
                    <Input {...register("duration")} className="h-14 bg-white/5 border-white/10 text-white rounded-2xl focus:border-primary transition-all text-lg font-medium px-6" placeholder="2h 15m" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Synopsis</Label>
                  <Textarea {...register("description")} className="min-h-[160px] bg-white/5 border-white/10 text-white rounded-[2rem] p-6 focus:border-primary transition-all text-lg font-medium resize-none" placeholder="Synchronize plot overview..." required />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="glass border-white/10 rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-8 pb-0">
                <CardTitle className="text-xl font-headline font-bold text-white flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-accent" /> Quality & Assets
                </CardTitle>
                <CardDescription className="text-white/40">Upload high-fidelity protocols.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Stream Quality</Label>
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

                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Poster Image</Label>
                  <div className="relative group/upload">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'poster')}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      disabled={isPosterUploading}
                    />
                    <div className={`h-32 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-3 transition-all ${isPosterUploading ? 'border-primary bg-primary/5' : 'border-white/10 group-hover/upload:border-primary/50 bg-white/2'}`}>
                      {isPosterUploading ? (
                        <div className="flex flex-col items-center gap-2 px-6 w-full">
                          <span className="text-[10px] font-black text-primary uppercase">Synchronizing Asset...</span>
                          <Progress value={posterProgress} className="h-1 bg-white/5" indicatorClassName="bg-primary shadow-[0_0_10px_#FF2E63]" />
                        </div>
                      ) : (
                        <>
                          <LayoutGrid className="w-6 h-6 text-white/20 group-hover/upload:text-primary transition-colors" />
                          <span className="text-xs font-bold text-white/40 group-hover/upload:text-white transition-colors">Select Poster File</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Video Protocol</Label>
                  <div className="relative group/upload">
                    <input 
                      type="file" 
                      accept="video/*"
                      onChange={(e) => handleFileChange(e, 'video')}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      disabled={isVideoUploading}
                    />
                    <div className={`h-32 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-3 transition-all ${isVideoUploading ? 'border-accent bg-accent/5' : 'border-white/10 group-hover/upload:border-accent/50 bg-white/2'}`}>
                      {isVideoUploading ? (
                        <div className="flex flex-col items-center gap-2 px-6 w-full">
                          <span className="text-[10px] font-black text-accent uppercase">Uploading Protocol...</span>
                          <Progress value={videoProgress} className="h-1 bg-white/5" indicatorClassName="bg-accent shadow-[0_0_10px_#00F5FF]" />
                        </div>
                      ) : (
                        <>
                          <Film className="w-6 h-6 text-white/20 group-hover/upload:text-accent transition-colors" />
                          <span className="text-xs font-bold text-white/40 group-hover/upload:text-white transition-colors">Select Video Stream</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || isPosterUploading || isVideoUploading}
                    className="w-full h-16 bg-primary text-white font-black rounded-2xl text-lg hover:neon-glow-primary active:scale-95 transition-all shadow-[0_20px_50px_rgba(255,46,99,0.2)] disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Check className="w-5 h-5 mr-3" />}
                    Broadcast Content
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
};
