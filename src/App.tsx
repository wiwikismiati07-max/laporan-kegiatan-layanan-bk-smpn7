/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Trash2, 
  ExternalLink, 
  Upload, 
  Download, 
  Globe, 
  Settings, 
  Menu, 
  X,
  ChevronRight,
  Monitor
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
}

const DEFAULT_LINKS: LinkItem[] = [
  { id: "1", title: "Gemini", url: "https://gemini.google.com" },
  { id: "2", title: "Google Search", url: "https://www.google.com" },
  { id: "3", title: "GitHub", url: "https://github.com" }
];

export default function App() {
  const [links, setLinks] = useState<LinkItem[]>(() => {
    const saved = localStorage.getItem("dashboard_links");
    return saved ? JSON.parse(saved) : DEFAULT_LINKS;
  });
  const [activeLinkId, setActiveLinkId] = useState<string | null>(links[0]?.id || null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLink, setNewLink] = useState({ title: "", url: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem("dashboard_links", JSON.stringify(links));
  }, [links]);

  const activeLink = links.find(l => l.id === activeLinkId);

  const handleAddLink = () => {
    if (newLink.title && newLink.url) {
      let url = newLink.url;
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }
      const id = Date.now().toString();
      setLinks([...links, { ...newLink, url, id }]);
      setNewLink({ title: "", url: "" });
      setIsModalOpen(false);
      if (!activeLinkId) setActiveLinkId(id);
    }
  };

  const handleDeleteLink = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = links.filter(l => l.id !== id);
    setLinks(filtered);
    if (activeLinkId === id) {
      setActiveLinkId(filtered[0]?.id || null);
    }
  };

  const handleBackup = () => {
    const dataStr = JSON.stringify(links, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'dashboard-backup.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          setLinks(json);
          if (json.length > 0) setActiveLinkId(json[0].id);
        }
      } catch (err) {
        alert("Invalid backup file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0c] text-slate-200 overflow-hidden font-sans">
      {/* 3D Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden overflow-x-hidden overflow-y-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        className="relative z-20 flex flex-col border-r border-white/5 bg-black/40 backdrop-blur-xl transition-all duration-300 overflow-hidden"
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-white/5 shadow-lg shadow-black/20">
              <img 
                src="https://iili.io/KDFk4fI.png" 
                alt="Logo SMPN 7" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="font-bold text-sm leading-tight tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Laporan Kegiatan<br/>Layanan BK SMPN 7
            </h1>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-full hover:bg-white/5 transition-colors text-slate-400"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 px-2">Navigation</div>
          
          <AnimatePresence mode="popLayout">
            {links.map((link) => (
              <motion.div
                key={link.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => setActiveLinkId(link.id)}
                className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-300 preserve-3d perspective-1000 ${
                  activeLinkId === link.id 
                    ? "bg-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-white/10" 
                    : "hover:bg-white/5 border border-transparent"
                }`}
                whileHover={{ 
                  translateZ: 10,
                  rotateX: -2,
                  rotateY: 5,
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-1 shadow transition-all duration-300 rounded-full h-4 ${activeLinkId === link.id ? "bg-blue-500" : "bg-transparent"}`} />
                  <Globe size={16} className={activeLinkId === link.id ? "text-blue-400" : "text-slate-500"} />
                  <span className={`text-sm font-medium truncate flex-1 transition-colors ${activeLinkId === link.id ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`}>
                    {link.title}
                  </span>
                  <button 
                    onClick={(e) => handleDeleteLink(link.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-all text-slate-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* 3D Shine Effect */}
                <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute -inset-[100%] bg-gradient-to-br from-white/10 via-transparent to-transparent rotate-[45deg] transition-transform duration-1000 group-hover:translate-x-full" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full mt-4 flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all text-slate-400 hover:text-blue-400"
          >
            <Plus size={16} />
            <span className="text-sm font-medium">Add New Link</span>
          </button>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/5 bg-black/20">
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={handleBackup}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-slate-300"
              title="Backup Links"
            >
              <Download size={16} />
              <span className="text-xs font-semibold">Backup</span>
            </button>
            <button 
              onClick={handleUploadClick}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-slate-300"
              title="Upload Backup"
            >
              <Upload size={16} />
              <span className="text-xs font-semibold">Upload</span>
            </button>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".json" 
            className="hidden" 
          />
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 px-6 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-md">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-slate-200"
              >
                <Menu size={20} />
              </button>
            )}
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="text-slate-500 capitalize tracking-wide">Laporan BK</span>
              <ChevronRight size={14} className="text-slate-700" />
              <span className="text-white">{activeLink?.title || "Welcome"}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeLink && (
              <a 
                href={activeLink.url} 
                target="_blank" 
                rel="no-referrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 transition-all text-white text-xs font-bold shadow-lg shadow-blue-500/20"
              >
                <ExternalLink size={14} />
                <span>Open External</span>
              </a>
            )}
            <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-slate-400">
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-6 relative">
          <div className="w-full h-full rounded-2xl overflow-hidden border border-white/10 bg-black/60 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] transition-all duration-700">
            {activeLink ? (
              <iframe
                id="portal-iframe"
                src={activeLink.url}
                className="w-full h-full border-none"
                title={activeLink.title}
                sandbox="allow-scripts allow-forms allow-popups allow-same-origin"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-12">
                <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                  <Plus size={32} className="text-slate-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">No Links Found</h2>
                <p className="text-slate-500 max-w-sm">
                  Add some items to your sidebar to start using your immersive 3D dashboard.
                </p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="mt-8 px-8 py-3 rounded-xl bg-white text-black font-bold hover:bg-slate-200 transition-all"
                >
                  Create Your First Link
                </button>
              </div>
            )}
          </div>
          
          {/* Subtle Ambient Glow below the iframe area */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent blur-sm" />
        </div>
      </main>

      {/* Add Link Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20, rotateX: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20, rotateX: 10 }}
              className="relative w-full max-w-md bg-[#16161a] border border-white/10 rounded-3xl shadow-2xl p-8 perspective-1000"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold">Add New Portal</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full hover:bg-white/5 transition-colors text-slate-500"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1">App Title</label>
                  <input 
                    type="text"
                    value={newLink.title}
                    onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                    placeholder="e.g. My Workspace"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-colors text-white placeholder:text-slate-600"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1">Application URL</label>
                  <input 
                    type="text"
                    value={newLink.url}
                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                    placeholder="e.g. workspace.google.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-colors text-white placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="mt-10 flex gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddLink}
                  disabled={!newLink.title || !newLink.url}
                  className="flex-[2] py-3 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-white shadow-lg shadow-blue-500/20"
                >
                  Confirm & Add
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}
