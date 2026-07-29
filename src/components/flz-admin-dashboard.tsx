"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Save,
  ExternalLink,
  Sparkles,
  Layers,
  Settings as SettingsIcon,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  X,
  RefreshCw,
} from "lucide-react";

export interface FlzProjectData {
  id: string;
  title: string;
  tools: string;
  category: string;
  age?: string | null;
  gradient?: string | null;
  description?: string | null;
  featured: boolean;
  visible: boolean;
  sortOrder: number;
  linkUrl?: string | null;
  imageUrl?: string | null;
}

export interface FlzAdminDashboardProps {
  initialProjects: FlzProjectData[];
  initialSettings: Record<string, string>;
  userEmail: string;
}

const GRADIENT_PRESETS = [
  { label: "Ronin Warm Sand", value: "radial-gradient(120% 130% at 24% 6%,rgba(216,195,166,.62),rgba(120,96,72,.12) 55%,transparent 76%)" },
  { label: "Kessler Sage Green", value: "radial-gradient(120% 130% at 78% 6%,rgba(169,182,160,.58),rgba(95,107,82,.12) 55%,transparent 76%)" },
  { label: "Dust Runner Purple", value: "radial-gradient(120% 130% at 30% 82%,rgba(176,166,192,.55),rgba(95,86,112,.12) 55%,transparent 76%)" },
  { label: "Impact VFX Terracotta", value: "radial-gradient(120% 130% at 72% 24%,rgba(199,169,160,.58),rgba(122,90,80,.12) 55%,transparent 76%)" },
  { label: "Skybound Golden Amber", value: "radial-gradient(120% 130% at 20% 28%,rgba(201,183,154,.58),rgba(138,122,85,.12) 55%,transparent 76%)" },
  { label: "Modular Crate Steel Blue", value: "radial-gradient(120% 130% at 62% 72%,rgba(159,180,184,.55),rgba(86,108,112,.12) 55%,transparent 76%)" },
];

const CATEGORIES = ["Characters", "Automotive", "Gameplay", "Assets", "Environments", "Shaders/VFX", "Web Dev"];

export function FlzAdminDashboard({
  initialProjects,
  initialSettings,
  userEmail,
}: FlzAdminDashboardProps) {
  const [projects, setProjects] = useState<FlzProjectData[]>(initialProjects);
  const [settings, setSettings] = useState<Record<string, string>>(initialSettings);
  const [activeTab, setActiveTab] = useState<"projects" | "settings">("projects");

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Modal State
  const [editingProject, setEditingProject] = useState<Partial<FlzProjectData> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Toggle Project Visibility
  const toggleVisibility = async (id: string, currentVisible: boolean) => {
    try {
      const res = await fetch(`/api/flz/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible: !currentVisible }),
      });
      if (!res.ok) throw new Error("Failed to toggle visibility");
      const data = await res.json();
      setProjects((prev) => prev.map((p) => (p.id === id ? data.project : p)));
      showToast(`Project visibility set to ${!currentVisible ? "Visible" : "Hidden"}`);
    } catch {
      showToast("Error updating project visibility", "error");
    }
  };

  // Toggle Featured Status
  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const res = await fetch(`/api/flz/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !currentFeatured }),
      });
      if (!res.ok) throw new Error("Failed to toggle featured status");
      const data = await res.json();
      setProjects((prev) => prev.map((p) => (p.id === id ? data.project : p)));
      showToast(`Project ${!currentFeatured ? "marked as Featured" : "unmarked as Featured"}`);
    } catch {
      showToast("Error updating featured status", "error");
    }
  };

  // Delete Project
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/flz/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete project");
      setProjects((prev) => prev.filter((p) => p.id !== id));
      showToast(`Project "${title}" deleted.`);
    } catch {
      showToast("Failed to delete project", "error");
    }
  };

  // Save Project (Create or Edit)
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject?.title || !editingProject?.tools || !editingProject?.category) {
      showToast("Please fill in all required fields (Title, Tools, Category)", "error");
      return;
    }

    setIsSaving(true);
    try {
      const isEdit = Boolean(editingProject.id);
      const url = isEdit ? `/api/flz/projects/${editingProject.id}` : "/api/flz/projects";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingProject),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save project");
      }

      const data = await res.json();
      if (isEdit) {
        setProjects((prev) => prev.map((p) => (p.id === data.project.id ? data.project : p)));
        showToast("Project updated successfully!");
      } else {
        setProjects((prev) => [data.project, ...prev]);
        showToast("New project created successfully!");
      }

      setIsModalOpen(false);
      setEditingProject(null);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Error saving project", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Save Site Hero Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await fetch("/api/flz/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      showToast("Hero and Site Settings updated successfully!");
    } catch {
      showToast("Failed to update site settings", "error");
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Filtered list
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tools.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#100e0c] text-[#F4F2EF] font-sans antialiased pb-20 selection:bg-cyan-500 selection:text-black">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border transition-all animate-bounce ${
            toast.type === "success"
              ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-200"
              : "bg-rose-950/80 border-rose-500/40 text-rose-200"
          }`}
        >
          {toast.type === "success" ? <CheckCircle className="h-5 w-5 text-emerald-400" /> : <AlertCircle className="h-5 w-5 text-rose-400" />}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header bar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#100e0c]/80 border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition text-white"
              title="Return to FLZ Landing Page"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-cyan-400">FLZ.WORKS CMS EDITOR</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Content Management Dashboard
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-xs text-white/50 block">Logged in as Admin</span>
              <span className="text-xs font-mono font-semibold text-white/80">{userEmail}</span>
            </div>
            <Link
              href="/"
              target="_blank"
              className="inline-flex h-9 items-center gap-2 px-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition"
            >
              Live Site <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main container */}
      <main className="max-w-7xl mx-auto px-6 pt-8">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-8">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("projects")}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition ${
                activeTab === "projects"
                  ? "bg-white/20 text-white border border-white/30 shadow-lg"
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              <Layers className="h-4 w-4 text-cyan-400" />
              Projects ({projects.length})
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition ${
                activeTab === "settings"
                  ? "bg-white/20 text-white border border-white/30 shadow-lg"
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              <SettingsIcon className="h-4 w-4 text-amber-400" />
              Hero & Site Settings
            </button>
          </div>

          {activeTab === "projects" && (
            <button
              onClick={() => {
                setEditingProject({
                  title: "",
                  tools: "Blender · Unity",
                  category: "Characters",
                  age: "Just added",
                  gradient: GRADIENT_PRESETS[0].value,
                  description: "",
                  featured: false,
                  visible: true,
                  sortOrder: projects.length + 1,
                });
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition shadow-lg shadow-cyan-500/20"
            >
              <Plus className="h-4 w-4 stroke-[3]" /> Add New Project
            </button>
          )}
        </div>

        {/* TAB 1: PROJECTS MANAGER */}
        {activeTab === "projects" && (
          <div className="space-y-6">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <input
                type="text"
                placeholder="Search projects by title, tools, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-80 bg-white/5 border border-white/15 rounded-xl px-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 transition"
              />

              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
                <span className="text-xs font-mono text-white/40 uppercase whitespace-nowrap">Filter:</span>
                {["All", ...CATEGORIES].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-mono transition whitespace-nowrap ${
                      categoryFilter === cat
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                        : "bg-white/5 text-white/60 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((p) => (
                <div
                  key={p.id}
                  className={`group relative rounded-3xl p-5 border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                    p.visible
                      ? "bg-[#1c1a17] border-white/15 hover:border-white/35 shadow-xl"
                      : "bg-[#141210]/60 border-white/5 opacity-60"
                  }`}
                >
                  {/* Background Gradient Preview */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-80 transition group-hover:opacity-100"
                    style={{ background: p.gradient || "none" }}
                  />

                  <div className="relative z-10 space-y-3">
                    {/* Status badges */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/10 text-white/80 border border-white/15">
                        {p.tools}
                      </span>
                      <div className="flex items-center gap-2">
                        {p.featured && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            <Star className="h-3 w-3 fill-amber-400" /> Featured
                          </span>
                        )}
                        <button
                          onClick={() => toggleVisibility(p.id, p.visible)}
                          className={`p-1.5 rounded-lg border transition ${
                            p.visible
                              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30"
                              : "bg-rose-500/20 border-rose-500/40 text-rose-400 hover:bg-rose-500/30"
                          }`}
                          title={p.visible ? "Click to Hide" : "Click to Show"}
                        >
                          {p.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Title & info */}
                    <div>
                      <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-cyan-300 transition">
                        {p.title}
                      </h3>
                      <p className="text-xs text-white/60 mt-1 font-mono">
                        {p.category} {p.age ? `· ${p.age}` : ""}
                      </p>
                    </div>

                    {p.description && (
                      <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>
                    )}
                  </div>

                  {/* Actions bar */}
                  <div className="relative z-10 pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                    <button
                      onClick={() => toggleFeatured(p.id, p.featured)}
                      className={`text-xs font-mono font-medium flex items-center gap-1.5 transition ${
                        p.featured ? "text-amber-400 hover:text-amber-300" : "text-white/40 hover:text-amber-400"
                      }`}
                    >
                      <Star className={`h-3.5 w-3.5 ${p.featured ? "fill-amber-400" : ""}`} />
                      {p.featured ? "Featured" : "Set Featured"}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingProject(p);
                          setIsModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/15 transition"
                      >
                        <Edit2 className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-xs font-semibold text-rose-300 border border-rose-500/30 transition"
                        title="Delete project"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProjects.length === 0 && (
              <div className="text-center py-16 rounded-3xl bg-white/5 border border-white/10">
                <Sparkles className="h-10 w-10 text-white/30 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white">No projects found</h3>
                <p className="text-xs text-white/50 max-w-sm mx-auto mt-1">
                  Try adjusting your search query or filter, or add a new project to flz.works.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: HERO & SITE SETTINGS */}
        {activeTab === "settings" && (
          <form onSubmit={handleSaveSettings} className="max-w-3xl space-y-6">
            <div className="rounded-3xl p-8 bg-[#1c1a17] border border-white/15 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-400" /> Landing Page Hero & Metrics
                </h2>
                <p className="text-xs text-white/50 mt-1">
                  Customize the main headline, building duration start date, and follower metrics displayed on flz.works.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-white/70 uppercase mb-2">
                    Hero Headline (Use line breaks for layout)
                  </label>
                  <textarea
                    rows={3}
                    value={settings.hero_headline || ""}
                    onChange={(e) => setSettings({ ...settings, hero_headline: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 rounded-xl p-3 text-sm text-white font-display focus:outline-none focus:border-amber-400 transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-white/70 uppercase mb-2">
                      Building Start Date (YYYY-MM-DD)
                    </label>
                    <input
                      type="date"
                      value={settings.building_start_date || "2023-09-01"}
                      onChange={(e) => setSettings({ ...settings, building_start_date: e.target.value })}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-amber-400 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-white/70 uppercase mb-2">
                      Discord URL
                    </label>
                    <input
                      type="text"
                      value={settings.discord_url || ""}
                      onChange={(e) => setSettings({ ...settings, discord_url: e.target.value })}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-white/70 uppercase mb-2">
                      Followers Metric Text
                    </label>
                    <input
                      type="text"
                      value={settings.followers_count || "soon"}
                      onChange={(e) => setSettings({ ...settings, followers_count: e.target.value })}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-amber-400 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-white/70 uppercase mb-2">
                      Wishlists Metric Text
                    </label>
                    <input
                      type="text"
                      value={settings.wishlists_count || "soon"}
                      onChange={(e) => setSettings({ ...settings, wishlists_count: e.target.value })}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-amber-400 transition"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {isSavingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Site Settings
                </button>
              </div>
            </div>
          </form>
        )}
      </main>

      {/* PROJECT EDITOR MODAL */}
      {isModalOpen && editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#1c1a17] border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {editingProject.id ? "Edit Project" : "Create New FLZ Project"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-white/70 uppercase mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ronin — stylized swordsman"
                  value={editingProject.title || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-white/70 uppercase mb-1">
                    Tools / Tech Stack *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Blender · ZBrush"
                    value={editingProject.tools || ""}
                    onChange={(e) => setEditingProject({ ...editingProject, tools: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/70 uppercase mb-1">
                    Category *
                  </label>
                  <select
                    value={editingProject.category || "Characters"}
                    onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                    className="w-full bg-[#25221e] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-white/70 uppercase mb-1">
                    Age / Time Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2 days ago, 1 week ago"
                    value={editingProject.age || ""}
                    onChange={(e) => setEditingProject({ ...editingProject, age: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/70 uppercase mb-1">
                    Sort Order Index
                  </label>
                  <input
                    type="number"
                    value={editingProject.sortOrder ?? 0}
                    onChange={(e) => setEditingProject({ ...editingProject, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-white/70 uppercase mb-1">
                  Card Gradient Preset / CSS Style
                </label>
                <div className="space-y-2">
                  <select
                    value={editingProject.gradient || ""}
                    onChange={(e) => setEditingProject({ ...editingProject, gradient: e.target.value })}
                    className="w-full bg-[#25221e] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                  >
                    <option value="">-- Select Preset Gradient --</option>
                    {GRADIENT_PRESETS.map((preset) => (
                      <option key={preset.label} value={preset.value}>
                        {preset.label}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Or enter custom CSS background gradient..."
                    value={editingProject.gradient || ""}
                    onChange={(e) => setEditingProject({ ...editingProject, gradient: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-white/70 uppercase mb-1">
                  Description / Breakdown
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the asset, breakdown, polygon count, shader detail..."
                  value={editingProject.description || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/15 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProject.visible ?? true}
                    onChange={(e) => setEditingProject({ ...editingProject, visible: e.target.checked })}
                    className="h-4 w-4 rounded accent-cyan-500"
                  />
                  <span className="text-xs font-mono text-white">Visible on flz.works</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProject.featured ?? false}
                    onChange={(e) => setEditingProject({ ...editingProject, featured: e.target.checked })}
                    className="h-4 w-4 rounded accent-amber-500"
                  />
                  <span className="text-xs font-mono text-amber-300 flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400" /> Featured Project
                  </span>
                </label>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
