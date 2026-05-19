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
  Monitor,
  Users,
  Search,
  FileSpreadsheet,
  Save
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import * as XLSX from "xlsx";

interface LinkItem {
  id: string;
  title: string;
  url?: string;
  type: "external" | "internal";
  icon?: string;
}

interface Siswa {
  id: string;
  nis: string;
  nama: string;
  kelas: string;
  gender: "L" | "P";
  tahunMasuk: string;
  noUrut: string;
  noUnikBK: string;
}

interface MasterSiswa {
  id: string;
  nis: string;
  nama: string;
  kelas: string;
}

const DEFAULT_LINKS: LinkItem[] = [
  { id: "master-siswa", title: "Master Siswa", type: "internal" },
  { id: "siswa-asuh", title: "Siswa Asuh BK", type: "internal" }
];

export default function App() {
  const [links, setLinks] = useState<LinkItem[]>(() => {
    const saved = localStorage.getItem("dashboard_links");
    return saved ? JSON.parse(saved) : DEFAULT_LINKS;
  });
  const [siswaList, setSiswaList] = useState<Siswa[]>(() => {
    const saved = localStorage.getItem("siswa_asuh_data");
    return saved ? JSON.parse(saved) : [];
  });
  const [masterSiswaList, setMasterSiswaList] = useState<MasterSiswa[]>(() => {
    const saved = localStorage.getItem("master_siswa_data");
    return saved ? JSON.parse(saved) : [];
  });

  const [activeLinkId, setActiveLinkId] = useState<string | null>(links[0]?.id || null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSiswaModalOpen, setIsSiswaModalOpen] = useState(false);
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  
  const [newLink, setNewLink] = useState({ title: "", url: "" });
  const [newSiswa, setNewSiswa] = useState<Partial<Siswa>>({
    nis: "",
    nama: "",
    kelas: "",
    gender: "L",
    tahunMasuk: new Date().getFullYear().toString(),
    noUrut: "",
    noUnikBK: ""
  });
  const [newMasterSiswa, setNewMasterSiswa] = useState<Partial<MasterSiswa>>({
    nis: "",
    nama: "",
    kelas: ""
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const masterExcelInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem("dashboard_links", JSON.stringify(links));
  }, [links]);

  useEffect(() => {
    localStorage.setItem("siswa_asuh_data", JSON.stringify(siswaList));
  }, [siswaList]);

  useEffect(() => {
    localStorage.setItem("master_siswa_data", JSON.stringify(masterSiswaList));
  }, [masterSiswaList]);

  const activeLink = links.find(l => l.id === activeLinkId);

  const handleAddLink = () => {
    if (newLink.title && newLink.url) {
      let url = newLink.url;
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }
      const id = Date.now().toString();
      setLinks([...links, { title: newLink.title, url, id, type: "external" }]);
      setNewLink({ title: "", url: "" });
      setIsModalOpen(false);
      if (!activeLinkId) setActiveLinkId(id);
    }
  };

  const handleDeleteLink = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (id === "siswa-asuh") return; // Prevent deleting core module
    const filtered = links.filter(l => l.id !== id);
    setLinks(filtered);
    if (activeLinkId === id) {
      setActiveLinkId(filtered[0]?.id || null);
    }
  };

  const handleBackup = () => {
    const data = {
      links,
      siswa: siswaList,
      masterSiswa: masterSiswaList
    };
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'bk-dashboard-backup.json';

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
        if (json.links) setLinks(json.links);
        if (json.siswa) setSiswaList(json.siswa);
        if (json.masterSiswa) setMasterSiswaList(json.masterSiswa);
        if (json.links && json.links.length > 0) setActiveLinkId(json.links[0].id);
      } catch (err) {
        alert("Invalid backup file");
      }
    };
    reader.readAsText(file);
  };

  const handleMasterExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws) as any[];

      const importedMaster: MasterSiswa[] = data.map((item, index) => ({
        id: (Date.now() + index).toString(),
        nis: (item.NIS || item.nis || "").toString(),
        nama: (item.Nama || item.nama || item["Nama Siswa"] || "").toString(),
        kelas: (item.Kelas || item.kelas || "").toString()
      }));

      setMasterSiswaList([...masterSiswaList, ...importedMaster]);
    };
    reader.readAsBinaryString(file);
  };

  const handleAddMasterSiswa = () => {
    if (newMasterSiswa.nis && newMasterSiswa.nama) {
      const id = Date.now().toString();
      setMasterSiswaList([...masterSiswaList, { ...newMasterSiswa, id } as MasterSiswa]);
      setNewMasterSiswa({ nis: "", nama: "", kelas: "" });
      setIsMasterModalOpen(false);
    }
  };

  const handleDeleteMasterSiswa = (id: string) => {
    setMasterSiswaList(masterSiswaList.filter(s => s.id !== id));
  };

  const handleAddSiswa = () => {
    if (newSiswa.nis && newSiswa.nama) {
      const id = Date.now().toString();
      const calculatedNoUnik = newSiswa.noUnikBK || `${newSiswa.kelas}-${newSiswa.noUrut}-${newSiswa.tahunMasuk}`;
      setSiswaList([...siswaList, { ...newSiswa, id, noUnikBK: calculatedNoUnik } as Siswa]);
      setNewSiswa({ 
        nis: "", 
        nama: "", 
        kelas: "", 
        gender: "L", 
        tahunMasuk: new Date().getFullYear().toString(),
        noUrut: "",
        noUnikBK: "" 
      });
      setIsSiswaModalOpen(false);
    }
  };

  const handleDeleteSiswa = (id: string) => {
    setSiswaList(siswaList.filter(s => s.id !== id));
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0c] text-slate-200 overflow-hidden font-sans">
      {/* 3D Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
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
                  {link.id === "siswa-asuh" || link.id === "master-siswa" ? <Users size={16} className={activeLinkId === link.id ? "text-blue-400" : "text-slate-500"} /> : <Globe size={16} className={activeLinkId === link.id ? "text-blue-400" : "text-slate-500"} />}
                  <span className={`text-sm font-medium truncate flex-1 transition-colors ${activeLinkId === link.id ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`}>
                    {link.title}
                  </span>
                  {link.id !== "siswa-asuh" && link.id !== "master-siswa" && (
                    <button 
                      onClick={(e) => handleDeleteLink(link.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-all text-slate-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
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
              title="Backup Full Data"
            >
              <Download size={16} />
              <span className="text-xs font-semibold">Backup</span>
            </button>
            <button 
              onClick={handleUploadClick}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-slate-300"
              title="Restore Full Data"
            >
              <Upload size={16} />
              <span className="text-xs font-semibold">Restore</span>
            </button>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
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
            {activeLink?.type === "external" && activeLink.url && (
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
            {activeLink?.type === "external" ? (
              <iframe
                id="portal-iframe"
                src={activeLink.url}
                className="w-full h-full border-none"
                title={activeLink.title}
                sandbox="allow-scripts allow-forms allow-popups allow-same-origin"
                referrerPolicy="no-referrer"
              />
            ) : activeLink?.id === "siswa-asuh" ? (
              <div className="w-full h-full flex flex-col p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Siswa Asuh BK</h2>
                    <p className="text-sm text-slate-500">Manajemen data siswa asuh bimbingan konseling</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setIsSiswaModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-all text-xs font-bold shadow-lg shadow-blue-500/20"
                    >
                      <Plus size={16} />
                      <span>Tambah Siswa</span>
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-auto custom-scrollbar border border-white/5 rounded-xl bg-black/20">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-[#16161a] z-10 border-b border-white/5">
                      <tr>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Thn Masuk</th>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">No NIS</th>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Nama Siswa</th>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Kelas</th>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Gender</th>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">No Unik BK</th>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {siswaList.length > 0 ? siswaList.map((siswa) => (
                        <tr key={siswa.id} className="hover:bg-white/5 transition-colors group">
                          <td className="px-4 py-4 text-sm text-slate-400">{siswa.tahunMasuk}</td>
                          <td className="px-4 py-4 text-sm font-mono text-blue-400">{siswa.nis}</td>
                          <td className="px-4 py-4 text-sm font-medium text-white">{siswa.nama}</td>
                          <td className="px-4 py-4 text-sm text-slate-400">{siswa.kelas}</td>
                          <td className="px-4 py-4 text-sm">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${siswa.gender === 'L' ? 'bg-blue-500/10 text-blue-400' : 'bg-pink-500/10 text-pink-400'}`}>
                              {siswa.gender === 'L' ? 'LAKI-LAKI' : 'PEREMPUAN'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-500">{siswa.noUnikBK}</td>
                          <td className="px-4 py-4 text-sm">
                            <button 
                              onClick={() => handleDeleteSiswa(siswa.id)}
                              className="p-2 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-12 text-center text-slate-600 italic">
                            Belum ada data siswa asuh. Klik tambah atau import Excel.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : activeLink?.id === "master-siswa" ? (
              <div className="w-full h-full flex flex-col p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Master Siswa</h2>
                    <p className="text-sm text-slate-500">Database lengkap siswa SMPN 7</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => masterExcelInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-xs font-bold"
                    >
                      <FileSpreadsheet size={16} />
                      <span>Import Excel</span>
                    </button>
                    <input type="file" ref={masterExcelInputRef} onChange={handleMasterExcelImport} accept=".xls,.xlsx" className="hidden" />
                    <button 
                      onClick={() => setIsMasterModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-all text-xs font-bold shadow-lg shadow-blue-500/20"
                    >
                      <Plus size={16} />
                      <span>Tambah Master</span>
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-auto custom-scrollbar border border-white/5 rounded-xl bg-black/20">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-[#16161a] z-10 border-b border-white/5">
                      <tr>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">No NIS</th>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Nama Siswa</th>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Kelas</th>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {masterSiswaList.length > 0 ? masterSiswaList.map((siswa) => (
                        <tr key={siswa.id} className="hover:bg-white/5 transition-colors group">
                          <td className="px-4 py-4 text-sm font-mono text-blue-400">{siswa.nis}</td>
                          <td className="px-4 py-4 text-sm font-medium text-white">{siswa.nama}</td>
                          <td className="px-4 py-4 text-sm text-slate-400">{siswa.kelas}</td>
                          <td className="px-4 py-4 text-sm text-right">
                            <button 
                              onClick={() => handleDeleteMasterSiswa(siswa.id)}
                              className="p-2 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-12 text-center text-slate-600 italic">
                            Belum ada data master siswa. Klik tambah atau import Excel.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-12">
                <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                  <Monitor size={32} className="text-slate-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Welcome to BK Dashboard</h2>
                <p className="text-slate-500 max-w-sm">
                  Select a module from the sidebar to manage bimbingan konseling reports.
                </p>
              </div>
            )}
          </div>
          
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent blur-sm" />
        </div>
      </main>

      {/* Add Link Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md bg-[#16161a] border border-white/10 rounded-3xl shadow-2xl p-8">
              <h3 className="text-xl font-bold mb-8">Add New Portal</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1">App Title</label>
                  <input type="text" value={newLink.title} onChange={(e) => setNewLink({ ...newLink, title: e.target.value })} placeholder="e.g. My Workspace" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-colors text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1">Application URL</label>
                  <input type="text" value={newLink.url} onChange={(e) => setNewLink({ ...newLink, url: e.target.value })} placeholder="e.g. workspace.google.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-colors text-white" />
                </div>
              </div>
              <div className="mt-10 flex gap-3">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all font-bold text-slate-300">Cancel</button>
                <button onClick={handleAddLink} disabled={!newLink.title || !newLink.url} className="flex-[2] py-3 rounded-xl bg-blue-500 hover:bg-blue-600 transition-all font-bold text-white">Confirm & Add</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Siswa Modal */}
      <AnimatePresence>
        {isSiswaModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSiswaModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-lg bg-[#16161a] border border-white/10 rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Tambah Anak Asuh BK</h3>
                <button onClick={() => setIsSiswaModalOpen(false)} className="p-2 rounded-full hover:bg-white/5 text-slate-500 transition-colors"><X size={20} /></button>
              </div>
              
              <div className="space-y-6">
                {/* Step 1: Selection from Master */}
                {!newSiswa.nis ? (
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-blue-400 px-1">Langkah 1: Pilih Siswa dari Master</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input 
                        type="text" 
                        placeholder="Cari Nama atau NIS..." 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:border-blue-500/50 transition-colors text-white"
                        onChange={(e) => {
                          const val = e.target.value.toLowerCase();
                          const results = masterSiswaList.filter(s => s.nis.toLowerCase().includes(val) || s.nama.toLowerCase().includes(val)).slice(0, 5);
                          // We'll show results inline
                          (window as any)._searchResults = results;
                          const container = document.getElementById('search-results');
                          if (container) {
                            container.innerHTML = results.length > 0 ? results.map(s => `
                              <div class="p-3 hover:bg-white/10 cursor-pointer border-b border-white/5 flex justify-between items-center transition-colors" onclick="window.pickSiswa('${s.nis}', '${s.nama.replace(/'/g, "\\'")}', '${s.kelas}')">
                                <div>
                                  <div class="text-sm font-medium text-white">${s.nama}</div>
                                  <div class="text-xs text-slate-500">${s.nis} • ${s.kelas}</div>
                                </div>
                                <div class="text-[10px] font-bold text-blue-500">PILIH</div>
                              </div>
                            `).join('') : '<div class="p-4 text-center text-slate-600 italic">Siswa tidak ditemukan</div>';
                          }
                        }}
                      />
                    </div>
                    <div id="search-results" className="mt-2 border border-white/5 rounded-xl bg-black/20 overflow-hidden">
                      <div className="p-4 text-center text-slate-600 italic">Cari siswa untuk mulai...</div>
                    </div>
                    {masterSiswaList.length === 0 && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs text-center">
                        Data Master Siswa masih kosong. Silakan upload master data terlebih dahulu.
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex justify-between items-center">
                      <div>
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Siswa Terpilih</div>
                        <div className="text-white font-bold">{newSiswa.nama}</div>
                        <div className="text-xs text-blue-400 font-mono">{newSiswa.nis} • Kelas {newSiswa.kelas}</div>
                      </div>
                      <button onClick={() => setNewSiswa({ ...newSiswa, nis: "", nama: "", kelas: "" })} className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors">GANTI</button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1">Tahun Masuk</label>
                        <input type="text" value={newSiswa.tahunMasuk} onChange={(e) => setNewSiswa({ ...newSiswa, tahunMasuk: e.target.value })} placeholder="e.g. 2024" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-colors text-white" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1">No Urut (Formasi BK)</label>
                        <input type="text" value={newSiswa.noUrut} onChange={(e) => setNewSiswa({ ...newSiswa, noUrut: e.target.value })} placeholder="01" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-colors text-white" />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1">Gender</label>
                        <select value={newSiswa.gender} onChange={(e) => setNewSiswa({ ...newSiswa, gender: e.target.value as "L" | "P" })} className="w-full bg-[#1e1e24] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-colors text-white appearance-none cursor-pointer">
                          <option value="L">LAKI-LAKI</option>
                          <option value="P">PEREMPUAN</option>
                        </select>
                      </div>
                      <div className="col-span-2 space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1">Preview No Unik BK</label>
                        <div className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-4 font-mono text-center text-xl tracking-widest text-blue-400 shadow-inner">
                          {newSiswa.kelas}-{newSiswa.noUrut || '00'}-{newSiswa.tahunMasuk || '0000'}
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                      <button onClick={() => setIsSiswaModalOpen(false)} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all font-bold text-slate-300">Batal</button>
                      <button 
                        onClick={handleAddSiswa} 
                        disabled={!newSiswa.noUrut || !newSiswa.tahunMasuk} 
                        className="flex-[2] py-3 rounded-xl bg-blue-500 hover:bg-blue-600 transition-all font-bold text-white shadow-lg shadow-blue-500/20 disabled:opacity-50"
                      >
                        Simpan Data BK
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <script dangerouslySetInnerHTML={{ __html: `
        window.pickSiswa = (nis, nama, kelas) => {
          // This is a bridge between the injected HTML and React
          const event = new CustomEvent('pick-siswa', { detail: { nis, nama, kelas } });
          window.dispatchEvent(event);
        };
      `}} />

      {React.useEffect(() => {
        const handler = (e: any) => {
          setNewSiswa(prev => ({ 
            ...prev, 
            nis: e.detail.nis, 
            nama: e.detail.nama, 
            kelas: e.detail.kelas 
          }));
        };
        window.addEventListener('pick-siswa', handler);
        return () => window.removeEventListener('pick-siswa', handler);
      }, [])}

      {/* Add Master Siswa Modal */}
      <AnimatePresence>
        {isMasterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMasterModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md bg-[#16161a] border border-white/10 rounded-3xl shadow-2xl p-8">
              <h3 className="text-xl font-bold mb-8">Tambah Master Siswa</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1">No NIS</label>
                  <input type="text" value={newMasterSiswa.nis} onChange={(e) => setNewMasterSiswa({ ...newMasterSiswa, nis: e.target.value })} placeholder="NIS" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-colors text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1">Nama Lengkap</label>
                  <input type="text" value={newMasterSiswa.nama} onChange={(e) => setNewMasterSiswa({ ...newMasterSiswa, nama: e.target.value })} placeholder="Nama Lengkap" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-colors text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1">Kelas</label>
                  <input type="text" value={newMasterSiswa.kelas} onChange={(e) => setNewMasterSiswa({ ...newMasterSiswa, kelas: e.target.value })} placeholder="e.g. 7A" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-colors text-white" />
                </div>
              </div>
              <div className="mt-10 flex gap-3">
                <button onClick={() => setIsMasterModalOpen(false)} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all font-bold text-slate-300">Batal</button>
                <button onClick={handleAddMasterSiswa} disabled={!newMasterSiswa.nis || !newMasterSiswa.nama} className="flex-[2] py-3 rounded-xl bg-blue-500 hover:bg-blue-600 transition-all font-bold text-white">Simpan Master</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.1); }
        .preserve-3d { transform-style: preserve-3d; }
        .perspective-1000 { perspective: 1000px; }
      `}</style>
    </div>
  );
}
