"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { 
  Upload, Film, Database, Check, Loader2, Monitor, Calendar, Zap, 
  ShieldAlert, Activity, Trash2, Users as UsersIcon, Link as LinkIcon,
  Sparkles, Info, Clock, AlertTriangle, Settings as SettingsIcon, Volume2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFirestore, useUser } from "@/firebase";
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc, addDoc, query, orderBy, limit } from "firebase/firestore";
import { MOCK_MOVIES } from "@/app/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@/firebase/storage/use-upload";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const AdminPanel = () => {
  const { user, isUserLoading } = useUser();
  const [activeTab, setActiveTab] = useState<'content' | 'library' | 'analytics' | 'settings' | 'users' | 'activity'>('content');
  const [userList, setUserList] = useState<any[]>([]);
  const [contentList, setContentList] = useState<any[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [statsData, setStatsData] = useState<any>(null);
  
  const [posterMode, setPosterMode] = useState<'upload' | 'link'>('upload');
  const [videoMode, setVideoMode] = useState<'upload' | 'link'>('link');

  const [searchQuery, setSearchQuery] = useState("");
  const [filterGenre, setFilterGenre] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [selectedContent, setSelectedContent] = useState<Set<string>>(new Set());
  
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(false);

  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      title: "",
      genre: "",
      type: "movie",
      releaseYear: "2024",
      duration: "2h 15m",
      publishDate: new Date().toISOString().slice(0, 16),
      description: "",
      quality: "4K ULTRA HDR",
      thumbnailUrl: "",
      videoUrl: "",
      audioUrl: "",
      trendingNumber: "",
      imdbRating: "",
      trailerUrl: "",
      languages: "English",
      director: "Nolan",
      cast: "Actor 1, Actor 2",
      crew: "Editor, DP"
    }
  });

  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);

  const thumbnailUrl = watch("thumbnailUrl");
  const videoUrl = watch("videoUrl");

  const { uploadFile: uploadPoster, progress: posterProgress, isUploading: isPosterUploading, status: posterStatus, processingMessage: posterMsg } = useUpload();
  const { uploadFile: uploadVideo, progress: videoProgress, isUploading: isVideoUploading, status: videoStatus, processingMessage: videoMsg } = useUpload();

  useEffect(() => {
    async function checkAdmin() {
      if (!firestore || !user) {
        setIsAdmin(false);
        return;
      }
      try {
        const adminRef = doc(firestore, "roles_admin", user.uid);
        const snap = await getDoc(adminRef);
        setIsAdmin(snap.exists());
      } catch (e) {
        console.error("Administrative Clearance Failure:", e);
        setIsAdmin(false);
      }
    }
    checkAdmin();
  }, [firestore, user]);

  const logActivity = async (action: string, detail: string) => {
    if (!firestore || !user) return;
    try {
      await addDoc(collection(firestore, "activity_logs"), {
        action,
        detail,
        adminId: user.uid,
        adminEmail: user.email || "Unknown",
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.error("Logging Activity Failed:", e);
    }
  };

  const handlePromote = async () => {
    if (!firestore || !user) return;
    setIsPromoting(true);
    try {
      const adminRef = doc(firestore, "roles_admin", user.uid);
      await setDoc(adminRef, {
        uid: user.uid,
        email: user.email || "admin@replica.com",
        promotedAt: new Date().toISOString()
      });
      setIsAdmin(true);
      toast({ title: "Neural Promotion Success", description: "Identity authorized for broadcast management." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Promotion Failed", description: e.message });
    } finally {
      setIsPromoting(false);
    }
  };

  const [episodes, setEpisodes] = useState<any[]>([]);

  const handleAddEpisode = () => {
    const id = "e-" + Math.random().toString(36).substring(7);
    setEpisodes([...episodes, {
      id,
      title: "",
      description: "",
      episodeNumber: episodes.length + 1,
      seasonNumber: 1,
      duration: "0m",
      thumbnailUrl: "",
      videoUrl: ""
    }]);
  };

  const handleUpdateEpisode = (index: number, field: string, value: any) => {
    const updated = [...episodes];
    updated[index] = { ...updated[index], [field]: value };
    setEpisodes(updated);
  };

  const handleEpisodeFileChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>, type: 'thumbnail' | 'video' | 'audio') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'video') {
       const video = document.createElement('video');
       video.preload = 'metadata';
       video.onloadedmetadata = () => {
         window.URL.revokeObjectURL(video.src);
         const duration = video.duration;
         const hours = Math.floor(duration / 3600);
         const minutes = Math.floor((duration % 3600) / 60);
         handleUpdateEpisode(index, 'duration', hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`);
       };
       video.src = URL.createObjectURL(file);
    }

    try {
      let url = "";
      if (type === 'thumbnail') url = await uploadPoster(file, `episodes/${Date.now()}_${file.name}`);
      else if (type === 'video') url = await uploadVideo(file, `episodes/${Date.now()}_${file.name}`);
      else url = await uploadVideo(file, `episodes/audio/${Date.now()}_${file.name}`); // Audio uses video uploader for large files
      
      handleUpdateEpisode(index, type === 'thumbnail' ? 'thumbnailUrl' : (type === 'video' ? 'videoUrl' : 'audioUrl'), url);
      toast({ title: `Episode ${type.toUpperCase()} Synchronized` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Upload Failed", description: e.message });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'poster' | 'video' | 'audio') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Autofill Duration and Simulate Language Detection for videos
    if (type === 'video') {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const duration = video.duration;
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const formatted = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
        setValue('duration', formatted);
        
        // Simulate Language Detection
        const detectedLangs = "English, Neural Sync Ready";
        setValue('languages', detectedLangs);
        
        toast({ 
          title: "Analysis Complete", 
          description: `Neural scan detected duration: ${formatted} and linguistics: ${detectedLangs}` 
        });
      };
      video.src = URL.createObjectURL(file);
    }

    try {
      const timestamp = Date.now();
      const path = type === 'audio' ? `audio/${timestamp}_${file.name}` : `broadcasts/${timestamp}_${file.name}`;
      
      const url = type === 'poster' 
        ? await uploadPoster(file, path) 
        : await uploadVideo(file, path);
      
      if (type === 'audio') setValue('audioUrl', url);
      else setValue(type === 'poster' ? 'thumbnailUrl' : 'videoUrl', url);
      
      toast({
        title: `${type.toUpperCase()} Protocol Synchronized`,
        description: "Media added to storage cluster.",
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
      toast({ variant: "destructive", title: "Access Denied", description: "Authorization required." });
      return;
    }

    if (!data.thumbnailUrl || !data.videoUrl) {
      toast({ variant: "destructive", title: "Missing Protocols", description: "Visual and stream assets required." });
      return;
    }

    setIsSubmitting(true);
    const id = "c-" + Math.random().toString(36).substring(2, 9);
    const contentRef = doc(firestore, "content", id);
    
    const payload = {
      ...data,
      id,
      uploaderId: user?.uid,
      rating: (Math.random() * 2 + 7.5).toFixed(1),
      genres: [data.genre || "Action"],
      isTrending: !!data.trendingNumber,
      trendingNumber: data.trendingNumber ? parseInt(data.trendingNumber) : null,
      imdbRating: data.imdbRating || null,
      trailerUrl: data.trailerUrl || null,
      director: data.director || null,
      cast: data.cast ? data.cast.split(",").map((s: string) => s.trim()) : [],
      crew: data.crew ? data.crew.split(",").map((s: string) => s.trim()) : [],
      languages: data.languages ? data.languages.split(",").map((s: string) => s.trim()) : [],
      isNew: true,
      status: "published",
      views: 0,
      weeklyViews: 0,
      trendingScore: 0,
      episodes: data.type === 'show' ? episodes : [],
      qualityOptions: ["1080p", "720p", "480p", "360p"],
      publishDate: new Date(data.publishDate).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(contentRef, payload);
      toast({
        title: "Broadcast Finalized",
        description: `${data.title} scheduled for launch.`,
      });
      await logActivity("CONTENT_CREATED", `Admin scheduled broadcast: ${data.title}`);
      reset();
      setEpisodes([]);
    } catch (e: any) {
      console.error("FIRESTORE ERROR:", e);
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
        description: `${MOCK_MOVIES.length} protocols synchronized.`,
      });
      await logActivity("DATABASE_SEEDED", `Admin seeded ${MOCK_MOVIES.length} cinematic loops.`);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Error", description: e.message });
    } finally {
      setIsSeeding(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users' && firestore) {
      const fetchUsers = async () => {
        setIsUsersLoading(true);
        try {
          const querySnapshot = await getDocs(collection(firestore, "userAccounts"));
          const usersData = querySnapshot.docs.map((doc: any) => ({
            ...doc.data(),
            id: doc.id
          }));
          setUserList(usersData);
        } catch (error: any) {
          toast({ variant: "destructive", title: "Retrieval Failed", description: error.message });
        } finally {
          setIsUsersLoading(false);
        }
      };
      fetchUsers();
    }

    if (activeTab === 'library' && firestore) {
      const fetchContent = async () => {
        setIsContentLoading(true);
        try {
          const querySnapshot = await getDocs(collection(firestore, "content"));
          const contentData = querySnapshot.docs.map((doc: any) => ({
            ...doc.data(),
            id: doc.id
          }));
          setContentList(contentData);
        } catch (error: any) {
          toast({ variant: "destructive", title: "Library Sync Failed", description: error.message });
        } finally {
          setIsContentLoading(false);
        }
      };
      fetchContent();
    }

    if (activeTab === 'analytics' && firestore) {
      const fetchStats = async () => {
        setIsStatsLoading(true);
        try {
          const docRef = doc(firestore, "stats", "main");
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            setStatsData(snap.data());
          }
        } catch (error: any) {
          toast({ variant: "destructive", title: "Stats Sync Failed", description: error.message });
        } finally {
          setIsStatsLoading(false);
        }
      };
      fetchStats();
    }

    if (activeTab === 'activity' && firestore) {
      const fetchLogs = async () => {
        setIsLogsLoading(true);
        try {
          const q = query(collection(firestore, "activity_logs"), orderBy("timestamp", "desc"), limit(50));
          const querySnapshot = await getDocs(q);
          setActivityLogs(querySnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (error: any) {
          toast({ variant: "destructive", title: "Logs Sync Failed", description: error.message });
        } finally {
          setIsLogsLoading(false);
        }
      };
      fetchLogs();
    }
  }, [activeTab, firestore, toast]);

  const handleDeleteContent = async (id: string) => {
    if (!firestore || !isAdmin) return;
    try {
      const itemToDelete = contentList.find((c: any) => c.id === id);
      await deleteDoc(doc(firestore, "content", id));
      setContentList((prev: any[]) => prev.filter((c: any) => c.id !== id));
      toast({ title: "Node Deinitialized", description: "Content removed from the matrix." });
      await logActivity("CONTENT_DELETED", `Admin scrubbed data trace: ${itemToDelete?.title || id}`);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Deletion Failed", description: e.message });
    }
  };

  const handleBulkDelete = async () => {
    if (!firestore || !isAdmin || selectedContent.size === 0) return;
    try {
      const promises = Array.from(selectedContent).map(id => deleteDoc(doc(firestore, "content", id)));
      await Promise.all(promises);
      const deletedCount = selectedContent.size;
      setContentList(prev => prev.filter(c => !selectedContent.has(c.id)));
      setSelectedContent(new Set());
      toast({ title: "Bulk Pruning Complete", description: `${deletedCount} nodes removed from the matrix.` });
      await logActivity("BULK_DELETE", `Admin bulk deleted ${deletedCount} content items.`);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Deletion Failed", description: e.message });
    }
  };

  const filteredContentList = contentList.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = filterGenre === "all" || item.genre?.toLowerCase().includes(filterGenre.toLowerCase());
    const matchesType = filterType === "all" || item.type === filterType;
    return matchesSearch && matchesGenre && matchesType;
  });

  const toggleSelectAll = () => {
    if (selectedContent.size === filteredContentList.length && filteredContentList.length > 0) {
      setSelectedContent(new Set());
    } else {
      setSelectedContent(new Set(filteredContentList.map(c => c.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedContent);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedContent(newSet);
  };

  const [isSettingsLoading, setIsSettingsLoading] = useState(false);
  const [siteSettings, setSiteSettings] = useState({
    title: "REPLICA | NEXUS",
    maintenance: "OFF"
  });

  useEffect(() => {
    async function loadSettings() {
      if (!firestore) return;
      try {
        const settingsRef = doc(firestore, "app_settings", "nexus_config");
        const snap = await getDoc(settingsRef);
        if (snap.exists()) {
          setSiteSettings(snap.data() as any);
        }
      } catch (e) {
        // This usually means rules are not deployed or the nexus_config node hasn't been initialized
        console.warn("Nexus Protocol: Configuration synchronization pending or unauthorized.", e);
      }
    }
    loadSettings();
  }, [firestore]);

  const handleSaveSettings = async () => {
    if (!firestore || !isAdmin) return;
    setIsSettingsLoading(true);
    try {
      await setDoc(doc(firestore, "app_settings", "nexus_config"), siteSettings);
      toast({ title: "Nexus Configuration Updated", description: "Global parameters successfully synchronized." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Config Sync Failed", description: e.message });
    } finally {
      setIsSettingsLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen pt-36 px-6 flex items-center justify-center bg-background text-white">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen pt-36 px-6 flex items-center justify-center bg-background">
        <Card className="glass border-white/5 w-full max-w-md p-12 rounded-[4rem] text-center space-y-8">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto border border-primary/20">
            <ShieldAlert className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-headline font-bold text-white tracking-tighter">Clearance Required</h2>
            <p className="text-white/40 font-medium">Your node requires administrative promotion.</p>
          </div>
          <Button onClick={handlePromote} disabled={isPromoting} className="w-full h-16 rounded-2xl bg-primary hover:neon-glow-primary text-white font-bold text-lg">
            {isPromoting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Authorize Node"}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-36 px-6 md:px-12 pb-24 bg-background">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.4em] text-[10px]">
              <div className="w-8 h-[1px] bg-primary" />
              Administrative Nexus 2.0
            </div>
            <h1 className="text-5xl md:text-7xl font-headline font-bold text-white tracking-tighter drop-shadow-2xl">
              Broadcast <span className="text-primary text-glow font-black border-b-4 border-primary/50 pb-2">Control</span>
            </h1>
            
            <div className="flex flex-wrap gap-2 p-1.5 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl w-fit mt-8 shadow-2xl">
              {[
                { id: 'content', icon: Upload, label: 'Broadcast' },
                { id: 'library', icon: Film, label: 'Library' },
                { id: 'users', icon: UsersIcon, label: 'Identities' },
                { id: 'analytics', icon: Zap, label: 'Stats' },
                { id: 'activity', icon: Clock, label: 'Activity' }
              ].map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 relative overflow-hidden group",
                    activeTab === tab.id 
                      ? "bg-primary text-white shadow-[0_0_30px_-5px_rgba(59,130,246,0.4)] border border-white/10" 
                      : "text-white/40 hover:text-white hover:bg-white/5 border border-transparent"
                  )}
                >
                  {activeTab === tab.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-shimmer" />
                  )}
                  <tab.icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", activeTab === tab.id ? "text-white" : "text-white/40 group-hover:text-primary")} /> {tab.label}
                </button>
              ))}
            </div>
          </div>
          
          {activeTab === 'content' && (
            <Button 
              onClick={seedDatabase} 
              disabled={isSeeding}
              variant="outline" 
              className="h-14 px-8 rounded-2xl border-white/5 glass hover:border-primary/50 text-white/60 hover:text-white transition-all font-bold"
            >
              {isSeeding ? <Loader2 className="w-4 h-4 animate-spin mr-3" /> : <Database className="w-4 h-4 mr-3" />}
              Seed Nexus Data
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'content' && (
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onSubmit={handleSubmit(onSubmit)} 
              className="grid grid-cols-1 lg:grid-cols-12 gap-12"
            >
              <div className="lg:col-span-7 space-y-8">
                <Card className="glass-panel border-white/5 bg-black/40 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                  <CardHeader className="p-10 pb-6 border-b border-white/5">
                    <CardTitle className="text-3xl font-headline font-black text-white flex items-center gap-4 uppercase tracking-tight">
                      <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                        <Sparkles className="w-6 h-6 text-primary" />
                      </div>
                      Core Protocol
                    </CardTitle>
                    <CardDescription className="text-white/40 uppercase tracking-widest text-[10px] font-bold mt-2">Define the metadata for the cinematic experience.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10 space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-[10px] uppercase tracking-widest text-primary font-black mb-1 block group-focus-within:text-glow-primary transition-all">Title</Label>
                        <Input {...register("title")} className="h-14 bg-black/40 border-white/10 focus:border-primary/50 text-white rounded-2xl px-6 font-bold shadow-inner" placeholder="Enter Movie Title" required />
                      </div>
                      <div className="space-y-1 group">
                        <Label className="text-[10px] uppercase tracking-widest text-primary font-black mb-1 block group-focus-within:text-glow-primary transition-all">Genre</Label>
                        <Input {...register("genre")} className="h-14 bg-black/40 border-white/10 focus:border-primary/50 text-white rounded-2xl px-6 font-bold shadow-inner" placeholder="e.g. Cyberpunk" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-1 group">
                        <Label className="text-[10px] uppercase tracking-widest text-primary font-black mb-1 block group-focus-within:text-glow-primary transition-all">Type</Label>
                        <select {...register("type")} className="w-full h-14 bg-black/40 border border-white/10 focus:border-primary/50 text-white rounded-2xl px-6 font-bold appearance-none outline-none shadow-inner transition-colors cursor-pointer">
                          <option value="movie" className="bg-[#0B0B0F] text-white">Movie</option>
                          <option value="show" className="bg-[#0B0B0F] text-white">Series</option>
                        </select>
                      </div>
                      <div className="space-y-1 group">
                        <Label className="text-[10px] uppercase tracking-widest text-primary font-black mb-1 block group-focus-within:text-glow-primary transition-all">Year</Label>
                        <Input {...register("releaseYear")} className="h-14 bg-black/40 border-white/10 focus:border-primary/50 text-white rounded-2xl px-6 font-bold shadow-inner" placeholder="2024" />
                      </div>
                      <div className="space-y-1 group">
                        <Label className="text-[10px] uppercase tracking-widest text-primary font-black mb-1 block group-focus-within:text-glow-primary transition-all">Duration</Label>
                        <Input {...register("duration")} className="h-14 bg-black/40 border-white/10 focus:border-primary/50 text-white rounded-2xl px-6 font-bold shadow-inner" placeholder="2h 15m" />
                      </div>
                    </div>
                    <div className="space-y-1 group">
                      <Label className="text-[10px] uppercase tracking-widest text-primary font-black flex items-center gap-2 mb-1 group-focus-within:text-glow-primary transition-all">
                        <Clock className="w-3.5 h-3.5" /> Scheduled Launch (Publish Date)
                      </Label>
                      <Input type="datetime-local" {...register("publishDate")} className="h-14 bg-black/40 border-white/10 focus:border-primary/50 text-white rounded-2xl px-6 font-bold shadow-inner custom-datetime" required />

                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-1 group">
                        <Label className="text-[10px] uppercase tracking-widest text-primary font-black mb-1 block group-focus-within:text-glow-primary transition-all">Director</Label>
                        <Input {...register("director")} className="h-14 bg-black/40 border-white/10 focus:border-primary/50 text-white rounded-2xl px-6 font-bold shadow-inner" placeholder="Director Name" />
                      </div>
                      <div className="space-y-1 group">
                        <Label className="text-[10px] uppercase tracking-widest text-primary font-black mb-1 block group-focus-within:text-glow-primary transition-all">Cast (comma separated)</Label>
                        <Input {...register("cast")} className="h-14 bg-black/40 border-white/10 focus:border-primary/50 text-white rounded-2xl px-6 font-bold shadow-inner" placeholder="Actor 1, Actor 2..." />
                      </div>
                      <div className="space-y-1 group">
                        <Label className="text-[10px] uppercase tracking-widest text-primary font-black mb-1 block group-focus-within:text-glow-primary transition-all">Crew (comma separated)</Label>
                        <Input {...register("crew")} className="h-14 bg-black/40 border-white/10 focus:border-primary/50 text-white rounded-2xl px-6 font-bold shadow-inner" placeholder="Writer, Producer..." />
                      </div>
                      <div className="space-y-1 group">
                        <Label className="text-[10px] uppercase tracking-widest text-primary font-black flex items-center gap-2 mb-1 group-focus-within:text-glow-primary transition-all">
                          Languages <Badge variant="outline" className="text-[8px] border-primary/30 text-primary">Neural Scan Active</Badge>
                        </Label>
                        <Input {...register("languages")} className="h-14 bg-black/40 border-white/10 focus:border-primary/50 text-white rounded-2xl px-6 font-bold shadow-inner" placeholder="English, Spanish" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-1 group">
                        <Label className="text-[10px] uppercase tracking-widest text-primary font-black mb-1 block group-focus-within:text-glow-primary transition-all">IMDb Rating</Label>
                        <Input {...register("imdbRating")} className="h-14 bg-black/40 border-white/10 focus:border-primary/50 text-white rounded-2xl px-6 font-bold shadow-inner" placeholder="e.g. 8.5" />
                      </div>
                      <div className="space-y-1 group">
                        <Label className="text-[10px] uppercase tracking-widest text-primary font-black mb-1 block group-focus-within:text-glow-primary transition-all">Trending Number</Label>
                        <Input type="number" {...register("trendingNumber")} className="h-14 bg-black/40 border-white/10 focus:border-primary/50 text-white rounded-2xl px-6 font-bold shadow-inner" placeholder="e.g. 1" />
                      </div>
                      <div className="space-y-1 group">
                        <Label className="text-[10px] uppercase tracking-widest text-primary font-black mb-1 block group-focus-within:text-glow-primary transition-all">Trailer URL</Label>
                        <Input {...register("trailerUrl")} className="h-14 bg-black/40 border-white/10 focus:border-primary/50 text-white rounded-2xl px-6 font-bold shadow-inner" placeholder="YouTube/Stream Link" />
                      </div>
                    </div>

                    <div className="p-8 rounded-3xl bg-primary/5 border border-primary/20 space-y-4">
                       <div className="flex items-center justify-between">
                         <div className="space-y-1">
                           <h4 className="text-white font-bold flex items-center gap-2 uppercase tracking-widest text-xs">
                             <Volume2 className="w-4 h-4 text-primary" /> Optional Audio Protocol
                           </h4>
                           <p className="text-[10px] text-white/40 uppercase tracking-widest">Add an external audio track for multi-language sync.</p>
                         </div>
                         <Input type="file" onChange={(e) => handleFileChange(e, 'audio')} className="hidden" id="main-audio-upload" />
                         <label htmlFor="main-audio-upload" className="cursor-pointer h-12 px-6 rounded-xl border border-primary/30 flex items-center justify-center text-primary font-bold text-xs hover:bg-primary/10 transition-all">
                            {watch("audioUrl") ? "Audio Synchronized" : "Upload Audio Protocol"}
                         </label>
                       </div>
                    </div>

                    <div className="space-y-1 group">
                      <Label className="text-[10px] uppercase tracking-widest text-primary font-black mb-1 block group-focus-within:text-glow-primary transition-all">Synopsis</Label>
                      <Textarea {...register("description")} className="min-h-[140px] bg-black/40 border-white/10 focus:border-primary/50 text-white rounded-[2rem] p-6 text-sm font-medium leading-relaxed resize-none shadow-inner" placeholder="Describe the cinematic journey..." required />
                    </div>
                  </CardContent>
                </Card>

                {watch("type") === 'show' && (
                  <Card className="glass-panel border-white/5 bg-black/40 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                    <CardHeader className="p-10 pb-6 border-b border-white/5">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-headline font-black text-white flex items-center gap-4 uppercase tracking-tight">
                          <Film className="w-5 h-5 text-primary" /> Episodic Hierarchy
                        </CardTitle>
                        <Button type="button" onClick={handleAddEpisode} variant="outline" className="rounded-xl border-primary/20 hover:bg-primary/10 text-primary uppercase text-[10px] font-black tracking-widest h-10 px-6">
                          Add Episode Node
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-10 space-y-6">
                      {episodes.map((ep, idx) => (
                        <div key={ep.id} className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-6">
                          <div className="flex items-center justify-between mb-2">
                             <div className="flex items-center gap-4">
                               <Badge className="bg-primary text-white font-black">EP {ep.episodeNumber}</Badge>
                               <span className="text-white font-bold opacity-40 uppercase tracking-widest text-[10px]">Neural Episode Component</span>
                             </div>
                             <button type="button" onClick={() => setEpisodes(episodes.filter(e => e.id !== ep.id))} className="text-destructive/40 hover:text-destructive transition-colors">
                               <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label className="text-[10px] text-white/40 uppercase font-black">Title</Label>
                              <Input value={ep.title} onChange={(e) => handleUpdateEpisode(idx, 'title', e.target.value)} className="bg-black/40 border-white/5 h-12 rounded-xl" placeholder="Episode Title" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-[10px] text-white/40 uppercase font-black">Season</Label>
                                <Input type="number" value={ep.seasonNumber} onChange={(e) => handleUpdateEpisode(idx, 'seasonNumber', parseInt(e.target.value))} className="bg-black/40 border-white/5 h-12 rounded-xl" />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] text-white/40 uppercase font-black">Duration</Label>
                                <Input value={ep.duration} onChange={(e) => handleUpdateEpisode(idx, 'duration', e.target.value)} className="bg-black/40 border-white/5 h-12 rounded-xl" placeholder="45m" />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                             <Label className="text-[10px] text-white/40 uppercase font-black">Sub-Topic Description</Label>
                             <Textarea value={ep.description} onChange={(e) => handleUpdateEpisode(idx, 'description', e.target.value)} className="bg-black/40 border-white/5 min-h-[80px] rounded-2xl resize-none" placeholder="What happens in this node?" />
                          </div>

                          <div className="grid grid-cols-3 gap-6 pt-4 border-t border-white/5">
                             <div className="space-y-3">
                               <Label className="text-[10px] text-white/40 uppercase font-black">Thumbnail</Label>
                               <Input type="file" onChange={(e) => handleEpisodeFileChange(idx, e, 'thumbnail')} className="hidden" id={`ep-thumb-${idx}`} />
                               <label htmlFor={`ep-thumb-${idx}`} className="cursor-pointer flex items-center justify-center gap-3 h-12 border-2 border-dashed border-white/10 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all">
                                 {ep.thumbnailUrl ? <Check className="w-4 h-4 text-emerald-500" /> : <Upload className="w-4 h-4 text-white/40" />}
                                 <span className="text-[8px] font-black uppercase text-white/40 tracking-widest">{ep.thumbnailUrl ? 'Thumbnail Sync' : 'Upload'}</span>
                               </label>
                             </div>
                             <div className="space-y-3">
                               <Label className="text-[10px] text-white/40 uppercase font-black">Video Stream</Label>
                               <Input type="file" onChange={(e) => handleEpisodeFileChange(idx, e, 'video')} className="hidden" id={`ep-video-${idx}`} />
                               <label htmlFor={`ep-video-${idx}`} className="cursor-pointer flex items-center justify-center gap-3 h-12 border-2 border-dashed border-white/10 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all">
                                 {ep.videoUrl ? <Check className="w-4 h-4 text-emerald-500" /> : <Monitor className="w-4 h-4 text-white/40" />}
                                 <span className="text-[8px] font-black uppercase text-white/40 tracking-widest">{ep.videoUrl ? 'Stream Sync' : 'Upload'}</span>
                               </label>
                             </div>
                             <div className="space-y-3">
                               <Label className="text-[10px] text-white/40 uppercase font-black">Audio Sync</Label>
                               <Input type="file" onChange={(e) => handleEpisodeFileChange(idx, e, 'audio')} className="hidden" id={`ep-audio-${idx}`} />
                               <label htmlFor={`ep-audio-${idx}`} className="cursor-pointer flex items-center justify-center gap-3 h-12 border-2 border-dashed border-white/10 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all">
                                 {ep.audioUrl ? <Check className="w-4 h-4 text-emerald-500" /> : <Volume2 className="w-4 h-4 text-white/40" />}
                                 <span className="text-[8px] font-black uppercase text-white/40 tracking-widest">{ep.audioUrl ? 'Audio Sync' : 'Optional'}</span>
                               </label>
                             </div>
                          </div>
                        </div>
                      ))}
                      {episodes.length === 0 && (
                        <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                           <AlertTriangle className="w-12 h-12 text-white/10 mx-auto mb-4" />
                           <p className="text-white/20 uppercase tracking-[0.3em] font-black text-[10px]">No episodic nodes detected for this broadcast.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="lg:col-span-5 space-y-8">
                <Card className="glass-panel border-white/5 bg-black/40 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
                  <CardHeader className="p-10 pb-6 border-b border-white/5">
                    <CardTitle className="text-2xl font-headline font-black text-white flex items-center gap-4 uppercase tracking-tight">
                      <div className="p-3 bg-accent/10 rounded-xl border border-accent/20">
                        <Zap className="w-6 h-6 text-accent" /> 
                      </div>
                      Media Uplink
                    </CardTitle>
                    <CardDescription className="text-white/40 uppercase tracking-widest text-[10px] font-bold mt-2">Manage visual assets and streaming protocols.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10 space-y-10">
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase tracking-widest text-white/50 font-black">Quality Tier</Label>
                      <Select onValueChange={(v: string) => setValue("quality", v)} defaultValue="4K ULTRA HDR">
                        <SelectTrigger className="bg-black/40 border-white/10 h-14 rounded-2xl px-6 text-white font-bold tracking-wide shadow-inner focus:ring-1 focus:ring-primary/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass text-white">
                          <SelectItem value="4K ULTRA HDR">4K ULTRA HDR</SelectItem>
                          <SelectItem value="1080P FULL HD">1080P FULL HD</SelectItem>
                          <SelectItem value="720P HD">720P HD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <Label className="text-[10px] uppercase tracking-widest text-white/60 font-black flex items-center gap-2">
                          <Film className="w-3.5 h-3.5 text-primary" /> Thumbnail Protocol
                        </Label>
                        <div className="flex p-1 bg-black/60 rounded-xl border border-white/10 shadow-inner">
                          <button type="button" onClick={() => setPosterMode('upload')} className={cn("px-5 py-2 text-[9px] font-black uppercase rounded-lg transition-all", posterMode === 'upload' ? 'bg-primary text-white shadow-lg' : 'text-white/40 hover:text-white')}>Upload</button>
                          <button type="button" onClick={() => setPosterMode('link')} className={cn("px-5 py-2 text-[9px] font-black uppercase rounded-lg transition-all", posterMode === 'link' ? 'bg-primary text-white shadow-lg' : 'text-white/40 hover:text-white')}>Link</button>
                        </div>
                      </div>

                      {posterMode === 'upload' ? (
                        <div className="relative">
                          <Input type="file" onChange={(e) => handleFileChange(e, 'poster')} className="hidden" id="poster-up" accept="image/*" />
                          <label htmlFor="poster-up" className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-white/10 rounded-3xl cursor-pointer hover:border-primary/50 transition-all bg-white/[0.02] overflow-hidden group">
                            {isPosterUploading ? (
                              <div className="w-full px-10 space-y-4 text-center">
                                {posterStatus === 'uploading' && <Progress value={posterProgress} className="h-1.5 bg-white/5" />}
                                <span className="text-[10px] uppercase tracking-[0.3em] text-primary font-black animate-pulse">
                                  {posterStatus === 'uploading' ? `Uploading ${posterProgress}%` : posterMsg || 'Processing...'}
                                </span>
                              </div>
                            ) : thumbnailUrl ? (
                              <div className="relative w-full h-full">
                                <img src={thumbnailUrl} className="w-full h-full object-cover opacity-60" alt="Thumbnail Preview" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                   <Check className="w-8 h-8 text-white" />
                                </div>
                              </div>
                            ) : (
                              <>
                                <Upload className="w-8 h-8 text-white/20 mb-3 group-hover:text-primary transition-colors" />
                                <span className="text-xs text-white/40 font-bold uppercase tracking-widest">Upload Static Asset</span>
                              </>
                            )}
                          </label>
                        </div>
                      ) : (
                        <div className="relative group">
                          <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary" />
                          <Input {...register("thumbnailUrl")} className="h-16 bg-white/5 border-white/10 text-white rounded-2xl pl-14" placeholder="Instant Link (https://...)" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <Label className="text-[10px] uppercase tracking-widest text-white/60 font-black flex items-center gap-2">
                          <Monitor className="w-3.5 h-3.5 text-accent" /> Stream Protocol <Badge variant="outline" className="text-[7px] py-0 px-1.5 border-accent/30 text-accent bg-accent/5 ml-2 font-black tracking-widest">FAST SYNC REC</Badge>
                        </Label>
                        <div className="flex p-1 bg-black/60 rounded-xl border border-white/10 shadow-inner">
                          <button type="button" onClick={() => setVideoMode('upload')} className={cn("px-5 py-2 text-[9px] font-black uppercase rounded-lg transition-all", videoMode === 'upload' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-white/40 hover:text-white')}>Upload</button>
                          <button type="button" onClick={() => setVideoMode('link')} className={cn("px-5 py-2 text-[9px] font-black uppercase rounded-lg transition-all", videoMode === 'link' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-white/40 hover:text-white')}>Link</button>
                        </div>
                      </div>

                      {videoMode === 'upload' ? (
                        <div className="space-y-4">
                          <Input type="file" onChange={(e) => handleFileChange(e, 'video')} className="hidden" id="video-up" accept="video/*" />
                          <label htmlFor="video-up" className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-white/10 rounded-3xl cursor-pointer hover:border-accent/50 transition-all bg-white/[0.02] group">
                            {isVideoUploading ? (
                              <div className="w-full px-10 space-y-4 text-center">
                                {videoStatus === 'uploading' && <Progress value={videoProgress} className="h-1.5 bg-white/5" />}
                                <span className="text-[10px] uppercase tracking-[0.3em] text-accent font-black animate-pulse">
                                  {videoStatus === 'uploading' ? `Uploading ${videoProgress}%` : videoMsg || 'Processing...'}
                                </span>
                              </div>
                            ) : videoUrl ? (
                              <div className="flex flex-col items-center gap-2">
                                <Check className="w-10 h-10 text-emerald-500" />
                                <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Protocol Stored</span>
                              </div>
                            ) : (
                              <>
                                <Film className="w-8 h-8 text-white/20 mb-3 group-hover:text-accent transition-colors" />
                                <span className="text-xs text-white/40 font-bold uppercase tracking-widest">Upload Dynamic Protocol</span>
                              </>
                            )}
                          </label>
                          <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                            <AlertTriangle className="w-5 h-5 flex-none" />
                            <p className="text-[10px] font-bold leading-relaxed uppercase tracking-tight">Large media may take several minutes to synchronize. Use Link for instant results.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="relative group">
                          <Monitor className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-accent" />
                          <Input {...register("videoUrl")} className="h-16 bg-white/5 border-white/10 text-white rounded-2xl pl-14" placeholder="Instant Link (https://...)" />
                        </div>
                      )}
                    </div>

                    <Button type="submit" disabled={isSubmitting || isPosterUploading || isVideoUploading} className="w-full h-20 bg-primary text-white font-black uppercase tracking-[0.2em] rounded-3xl text-lg hover:neon-glow-primary transition-all shadow-2xl">
                      {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 mr-3" />}
                      Establish Broadcast
                    </Button>
                  </CardContent>
                </Card>

                <Card className="glass border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/90 z-0" />
                  {thumbnailUrl && <img src={thumbnailUrl} className="absolute inset-0 w-full h-full object-cover opacity-20 blur-xl" alt="" />}
                  <div className="relative z-10 p-8 space-y-6">
                    <div className="flex items-center gap-3 text-white/50 text-[10px] uppercase font-black tracking-[0.2em] border-b border-white/10 pb-4">
                      <Monitor className="w-4 h-4 text-primary" /> Cinematic Preview Protocol
                    </div>
                    
                    <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black/60 border border-white/10 relative shadow-inner group">
                      {videoUrl ? (
                         <video src={videoUrl} className="w-full h-full object-cover" controls controlsList="nodownload" preload="metadata" />
                      ) : thumbnailUrl ? (
                         <img src={thumbnailUrl} className="w-full h-full object-cover" alt="Preview Placeholder" />
                      ) : (
                         <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20">
                           <Film className="w-8 h-8 mb-2 opacity-50" />
                           <span className="text-[10px] tracking-widest font-bold uppercase">Awaiting Media Link</span>
                         </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                       <h3 className="text-2xl font-headline font-black text-white leading-tight">
                         {watch("title") || "UNTITLED BROADCAST"}
                       </h3>
                       <div className="flex flex-wrap gap-2">
                         <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[9px] uppercase tracking-widest font-black">{watch("quality") || "QUALITY"}</Badge>
                         <Badge variant="outline" className="bg-white/5 text-white/60 border-white/10 text-[9px] uppercase tracking-widest font-black">{watch("genre") || "GENRE"}</Badge>
                         <Badge variant="outline" className="bg-white/5 text-white/60 border-white/10 text-[9px] uppercase tracking-widest font-black">{watch("releaseYear") || "YEAR"}</Badge>
                         <Badge variant="outline" className="bg-white/5 text-white/60 border-white/10 text-[9px] uppercase tracking-widest font-black">{watch("type") || "TYPE"}</Badge>
                       </div>
                       <p className="text-xs text-white/50 leading-relaxed font-medium line-clamp-3">
                         {watch("description") || "Synopsis protocol awaiting input sequence..."}
                       </p>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.form>
          )}

          {activeTab === 'library' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <Card className="glass border-white/10 rounded-[3rem] p-10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 border-b border-white/5 pb-8">
                  <div className="space-y-1">
                    <CardTitle className="text-3xl font-headline font-bold text-white">Synchronized Library</CardTitle>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">Content Hub Ecosystem</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                     <div className="relative">
                       <Input 
                          placeholder="Search broadcast..." 
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          className="bg-black/40 border-white/10 text-white rounded-2xl h-12 w-48 pl-10 focus:border-primary/50 text-xs font-bold"
                       />
                       <Film className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                     </div>
                     <Select value={filterGenre} onValueChange={setFilterGenre}>
                       <SelectTrigger className="w-[140px] h-12 bg-black/40 border-white/10 text-white rounded-2xl text-xs font-bold">
                         <SelectValue placeholder="Genre" />
                       </SelectTrigger>
                       <SelectContent className="glass text-white">
                         <SelectItem value="all">All Genres</SelectItem>
                         <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
                         <SelectItem value="action">Action</SelectItem>
                         <SelectItem value="sci-fi">Sci-Fi</SelectItem>
                         <SelectItem value="drama">Drama</SelectItem>
                       </SelectContent>
                     </Select>
                     <Select value={filterType} onValueChange={setFilterType}>
                       <SelectTrigger className="w-[120px] h-12 bg-black/40 border-white/10 text-white rounded-2xl text-xs font-bold">
                         <SelectValue placeholder="Type" />
                       </SelectTrigger>
                       <SelectContent className="glass text-white">
                         <SelectItem value="all">All Types</SelectItem>
                         <SelectItem value="movie">Movies</SelectItem>
                         <SelectItem value="show">Series</SelectItem>
                       </SelectContent>
                     </Select>
                     
                     <AnimatePresence>
                       {selectedContent.size > 0 && (
                         <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 'auto', opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="flex items-center gap-4 overflow-hidden border-l border-white/10 pl-4 ml-2">
                           <span className="text-[10px] uppercase font-black tracking-widest text-primary whitespace-nowrap hidden sm:block">{selectedContent.size} Engaged</span>
                           <Button onClick={handleBulkDelete} variant="destructive" className="h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] px-6 whitespace-nowrap hover:bg-destructive/80 shrink-0">
                             <Trash2 className="w-4 h-4 mr-2" /> Bulk Prune
                           </Button>
                         </motion.div>
                       )}
                     </AnimatePresence>
                  </div>
                </div>

                {isContentLoading ? (
                  <div className="flex justify-center p-20"><Loader2 className="w-12 h-12 text-primary animate-spin" /></div>
                ) : (
                  <div className="space-y-0">
                    <div className="flex items-center gap-6 px-6 text-[10px] uppercase font-black tracking-widest text-white/40 border-b border-white/5 pb-4 mb-4">
                       <button onClick={toggleSelectAll} className={cn("w-5 h-5 shrink-0 rounded border border-white/20 flex items-center justify-center transition-colors hover:border-primary/50", selectedContent.size === filteredContentList.length && filteredContentList.length > 0 ? "bg-primary border-primary" : "")}>
                         {selectedContent.size === filteredContentList.length && filteredContentList.length > 0 && <Check className="w-3 h-3 text-white" />}
                       </button>
                       <div className="w-14 pl-2 shrink-0">Asset</div>
                       <div className="flex-1 min-w-0">Metadata Protocol</div>
                       <div className="w-16 shrink-0 text-center">Action</div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {filteredContentList.map(item => (
                        <div key={item.id} className={cn("px-6 py-4 rounded-[1.5rem] glass border transition-all duration-300 flex items-center gap-6 group hover:border-primary/30", selectedContent.has(item.id) ? "border-primary/50 bg-primary/10 shadow-[0_0_20px_rgba(59,130,246,0.1)]" : "border-white/5 bg-black/40")}>
                          <button onClick={() => toggleSelect(item.id)} className={cn("w-5 h-5 rounded border border-white/20 flex shrink-0 items-center justify-center transition-colors hover:scale-110", selectedContent.has(item.id) ? "bg-primary border-primary text-white" : "")}>
                            {selectedContent.has(item.id) && <Check className="w-3 h-3" />}
                          </button>
                          
                          <div className="w-14 h-20 shrink-0 rounded-xl overflow-hidden bg-white/5 border border-white/10 shadow-inner group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all">
                            <img src={item.thumbnailUrl} className="w-full h-full object-cover" />
                          </div>
                          
                          <div className="flex-1 space-y-1.5 min-w-0">
                            <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors truncate">{item.title}</h3>
                            <div className="flex flex-wrap items-center gap-3">
                              <p className="text-[10px] text-white/40 uppercase tracking-widest font-black shrink-0">{item.genre} • {item.type} • {item.releaseYear}</p>
                              <Badge variant="outline" className="text-[8px] px-1.5 py-0 tracking-widest bg-white/5 border-white/10 text-white/60 uppercase shrink-0 font-black">{item.quality}</Badge>
                              {item.trendingNumber && <Badge variant="outline" className="text-[8px] px-1.5 py-0 tracking-widest bg-accent/10 border-accent/20 text-accent uppercase shrink-0 font-black">Trending Top {item.trendingNumber}</Badge>}
                            </div>
                          </div>
                          
                          <div className="shrink-0 flex items-center gap-2">
                            <Button onClick={() => handleDeleteContent(item.id)} variant="ghost" className="w-12 h-12 rounded-2xl text-white/40 hover:text-destructive hover:bg-destructive/10 transition-colors">
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      {filteredContentList.length === 0 && (
                        <div className="text-center p-20 border border-dashed border-white/10 rounded-[2rem] bg-white/[0.02]">
                          <Film className="w-10 h-10 text-white/20 mx-auto mb-4" />
                          <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">No records found matching heuristic parameters.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="glass border-white/10 rounded-[3rem] p-10">
                <CardTitle className="text-3xl font-headline font-bold text-white mb-8">Active Identity Nodes</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userList.map(u => (
                    <div key={u.id} className="p-8 rounded-[2rem] glass border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                          <UsersIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-xl">{u.email || u.phoneNumber || "Guest Node"}</p>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">ID: {u.id.slice(0, 12)}...</p>
                        </div>
                      </div>
                      <Badge className="bg-white/5 text-white/40 border-white/10 uppercase tracking-widest text-[9px] px-4 py-1.5 rounded-full">{u.role || 'user'}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              {isStatsLoading ? (
                <div className="flex justify-center p-20 glass border-white/10 rounded-[3rem]"><Loader2 className="w-12 h-12 text-primary animate-spin" /></div>
              ) : (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                      { label: 'Throughput', value: statsData?.throughput || '1.2 PB', icon: Activity, color: 'text-primary' },
                      { label: 'Neural Links', value: statsData?.neuralLinks || '42.1K', icon: UsersIcon, color: 'text-accent' },
                      { label: 'Matrix Credits', value: statsData?.credits || '₿ 4.8', icon: Zap, color: 'text-yellow-400' },
                      { label: 'Node Uptime', value: statsData?.uptime || '99.9%', icon: ShieldAlert, color: 'text-emerald-400' }
                    ].map((stat, i) => (
                      <Card key={i} className="glass border-white/5 p-10 space-y-6 rounded-[3rem]">
                        <div className={cn("w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10", stat.color)}>
                          <stat.icon className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-black">{stat.label}</p>
                          <p className="text-4xl font-headline font-bold text-white tracking-tighter mt-1">{stat.value}</p>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="glass border-white/5 rounded-[3rem] p-10 lg:col-span-2 space-y-8">
                      <CardTitle className="text-2xl font-headline font-black text-white flex items-center gap-4">
                        <Activity className="w-6 h-6 text-primary" /> Neural Engagement Matrix
                      </CardTitle>
                      <div className="space-y-4">
                        {[ 
                          { title: "Cyberpunk: Edgerunners", views: "1.2M", time: "840K hrs", dropoff: "12%", trend: "up" },
                          { title: "Interstellar Nexus", views: "980K", time: "2.1M hrs", dropoff: "8%", trend: "up" },
                          { title: "Neon Genesis", views: "750K", time: "450K hrs", dropoff: "25%", trend: "down" },
                        ].map((item, idx) => (
                          <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-[2rem] bg-black/40 border border-white/5 hover:border-primary/50 transition-colors cursor-default group">
                            <div className="space-y-1 mb-4 sm:mb-0">
                              <h4 className="text-white font-bold text-lg group-hover:text-primary transition-colors">{item.title}</h4>
                              <div className="flex items-center gap-3 text-[9px] uppercase font-black tracking-widest text-white/40">
                                <span>{item.views} Views</span>
                                <span className="w-1 h-1 rounded-full bg-white/20" />
                                <span>{item.time} Watch Time</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <p className="text-[9px] uppercase tracking-widest text-white/40 font-black mb-1">Drop-off</p>
                                <p className={cn("text-lg font-bold", parseInt(item.dropoff) > 15 ? "text-destructive" : "text-emerald-400")}>{item.dropoff}</p>
                              </div>
                              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border", item.trend === 'up' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-destructive/10 border-destructive/20 text-destructive")}>
                                <Activity className="w-5 h-5" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card className="glass border-white/5 rounded-[3rem] p-10 space-y-8">
                       <CardTitle className="text-2xl font-headline font-black text-white flex items-center gap-4">
                         <Zap className="w-6 h-6 text-yellow-400" /> Neural Vectors
                       </CardTitle>
                       <div className="space-y-6">
                         {[
                           { tag: "#cyberpunk", strength: 98 },
                           { tag: "#space-opera", strength: 85 },
                           { tag: "#dystopian", strength: 64 },
                           { tag: "#ai-ethics", strength: 51 },
                           { tag: "#matrix-theory", strength: 42 },
                         ].map((tag, idx) => (
                           <div key={idx} className="space-y-3">
                             <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                               <span className="text-white/80">{tag.tag}</span>
                               <span className={cn(tag.strength > 80 ? "text-yellow-400" : "text-white/40")}>{tag.strength}%</span>
                             </div>
                             <Progress value={tag.strength} className="h-1.5 bg-white/5 [&>div]:bg-gradient-to-r [&>div]:from-transparent [&>div]:to-yellow-400" />
                           </div>
                         ))}
                       </div>
                    </Card>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'settings' && (
            // (Leaving standard settings intact) ...
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <Card className="glass border-white/10 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8">
                  <CardTitle className="text-2xl font-headline font-bold text-white flex items-center gap-3">
                    <Monitor className="w-6 h-6 text-primary" /> General Config
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/30">Site Title</Label>
                    <Input 
                      value={siteSettings.title} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSiteSettings({...siteSettings, title: e.target.value})}
                      className="h-14 bg-white/5 border-white/10 text-white rounded-2xl px-6" 
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/30">Maintenance Mode</Label>
                    <Select 
                      value={siteSettings.maintenance} 
                      onValueChange={(v: string) => setSiteSettings({...siteSettings, maintenance: v})}
                    >
                      <SelectTrigger className="h-14 bg-white/5 border-white/10 text-white rounded-2xl px-6">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass text-white">
                        <SelectItem value="OFF">DEACTIVATED</SelectItem>
                        <SelectItem value="ON">ACTIVATED</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleSaveSettings}
                    disabled={isSettingsLoading}
                    className="w-full h-14 bg-primary text-white font-bold rounded-xl hover:neon-glow-primary transition-all"
                  >
                    {isSettingsLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                    Sync Nexus Parameters
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass border-white/10 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8">
                  <CardTitle className="text-2xl font-headline font-bold text-white flex items-center gap-3">
                    <Database className="w-6 h-6 text-accent" /> Infrastructure
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-6">
                  <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60">Firestore Cluster</p>
                      <p className="text-lg font-bold text-white">Operational</p>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_#10B981]" />
                  </div>
                  <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-500/60">Storage Nexus</p>
                      <p className="text-lg font-bold text-white">Synchronized</p>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse shadow-[0_0_15px_#3B82F6]" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="glass border-white/10 rounded-[3rem] p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Clock className="w-64 h-64" />
                </div>
                <div className="relative z-10">
                  <CardTitle className="text-3xl font-headline font-bold text-white mb-2">Audit Synchronization Logs</CardTitle>
                  <CardDescription className="text-white/40 font-black uppercase tracking-widest text-[10px] mb-10">Track decentralized matrix actions.</CardDescription>
                  
                  {isLogsLoading ? (
                    <div className="flex justify-center p-20"><Loader2 className="w-12 h-12 text-primary animate-spin" /></div>
                  ) : activityLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 text-white/20 space-y-4 bg-white/5 rounded-[2rem] border border-white/10">
                      <Clock className="w-12 h-12 mb-2 opacity-50" />
                      <p className="font-bold uppercase tracking-widest text-[10px]">Sys-log is completely vacant.</p>
                    </div>
                  ) : (
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[23px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                      {activityLogs.map((log, i) => (
                        <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-12 h-12 rounded-2xl border border-white/10 bg-black shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 text-primary z-20 transition-transform group-hover:scale-110">
                            <Activity className="w-5 h-5" />
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] glass bg-black/40 border-white/5 rounded-[2rem] p-6 hover:border-primary/30 transition-colors cursor-default shadow-lg hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] group-hover:-translate-y-1">
                            <div className="flex items-center justify-between space-x-2 mb-2">
                              <h4 className="font-bold text-white uppercase text-xs tracking-widest">{log.action.replace(/_/g, ' ')}</h4>
                              <time className="text-[10px] uppercase tracking-widest text-primary font-black bg-primary/10 px-2 py-0.5 rounded border border-primary/20 shrink-0">
                                {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </time>
                            </div>
                            <p className="text-white/60 text-sm font-medium leading-relaxed">{log.detail}</p>
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                               <UsersIcon className="w-3.5 h-3.5 text-white/30" />
                               <p className="text-[10px] uppercase tracking-widest text-white/30 font-black truncate">{log.adminEmail}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};