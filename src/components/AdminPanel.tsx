
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { Upload, Film, FileText, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const AdminPanel = () => {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data: any) => {
    console.log("Saving movie metadata to Firestore:", data);
    alert("Metadata saved successfully!");
  };

  return (
    <div className="min-h-screen pt-24 px-6 md:px-12 pb-24 bg-background">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-headline font-bold text-white tracking-tighter">Content <span className="text-primary">Curator</span></h1>
            <p className="text-white/60">Upload and manage cinematic experiences for Replica.</p>
          </div>
          <Button variant="outline" className="rounded-full border-white/10 glass">
            View Live Library
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card className="glass border-white/10 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Film className="w-5 h-5 text-primary" /> Basic Metadata
              </CardTitle>
              <CardDescription>Essential details that identify the content.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white/60">Movie Title</Label>
                  <Input id="title" {...register("title")} className="bg-white/5 border-white/10 text-white" placeholder="e.g. Neon Protocol" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genre" className="text-white/60">Primary Genre</Label>
                  <Select>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent className="glass text-white border-white/10">
                      <SelectItem value="sci-fi">Sci-Fi</SelectItem>
                      <SelectItem value="action">Action</SelectItem>
                      <SelectItem value="thriller">Thriller</SelectItem>
                      <SelectItem value="documentary">Documentary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-white/60">Synopsis</Label>
                <Textarea id="description" {...register("description")} className="bg-white/5 border-white/10 text-white min-h-[120px]" placeholder="Briefly describe the plot..." />
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-white/10 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <LayoutGrid className="w-5 h-5 text-accent" /> Media Assets
              </CardTitle>
              <CardDescription>High-quality assets for the streaming experience.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:border-primary/50 transition-colors bg-white/5">
                  <Upload className="w-8 h-8 text-primary" />
                  <div className="text-center">
                    <p className="text-white font-medium">Thumbnail Poster</p>
                    <p className="text-white/40 text-xs">2:3 Aspect Ratio (e.g. 600x900)</p>
                  </div>
                  <Button size="sm" variant="secondary" className="rounded-full">Select Image</Button>
                </div>
                <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:border-accent/50 transition-colors bg-white/5">
                  <Upload className="w-8 h-8 text-accent" />
                  <div className="text-center">
                    <p className="text-white font-medium">Hero Video Stream</p>
                    <p className="text-white/40 text-xs">Direct MP4 URL or Storage Reference</p>
                  </div>
                  <Button size="sm" variant="secondary" className="rounded-full">Select Video</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="videoUrl" className="text-white/60">Direct Video URL (Fallback)</Label>
                <Input id="videoUrl" {...register("videoUrl")} className="bg-white/5 border-white/10 text-white" placeholder="https://storage.googleapis.com/..." />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-4">
            <Button variant="ghost" className="text-white/60 hover:text-white">Discard Changes</Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 rounded-full px-12 py-6 text-lg font-bold neon-glow-primary">
              Publish Content
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
