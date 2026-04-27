/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Tag as TagIcon, 
  X, 
  StickyNote, 
  Calendar,
  Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Note = {
  id: number;
  title: string;
  body: string;
  tags: string[];
  updatedAt: string;
};

const STORAGE_KEY = "mymemo.notes";

const INITIAL_NOTES: Note[] = [
  { 
    id: 1, 
    title: "시안 작업 가이드", 
    body: "UI/UX 시안 작업 시 레이아웃과 컬러 시스템을 준수하세요. 일관된 그리드와 타이포그래피 시스템을 사용하는 것이 중요합니다.", 
    tags: ["디자인", "가이드"], 
    updatedAt: new Date().toISOString() 
  },
  { 
    id: 2, 
    title: "읽어야 할 책 리스트", 
    body: "클린 코드, 리팩터링, 디자인 패턴 필수. 개발자로서 성장하기 위해 고전을 읽는 습관을 들입시다.", 
    tags: ["독서", "자기개발"], 
    updatedAt: new Date().toISOString() 
  },
  { 
    id: 3, 
    title: "프로젝트 아이디어", 
    body: "가계부 앱과 메모 앱 연동 기능. 사용자가 지출 내역을 메모로 남기면 자동으로 분류해주는 AI 기능 추가 제안.", 
    tags: ["업무", "개발"], 
    updatedAt: new Date().toISOString() 
  }
];

export default function App() {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_NOTES;
      }
    }
    return INITIAL_NOTES;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Modal states
  const [modalTitle, setModalTitle] = useState('');
  const [modalBody, setModalBody] = useState('');
  const [modalTags, setModalTags] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  // Derived states
  const tagsWithCount = useMemo(() => {
    const counts: Record<string, number> = {};
    notes.forEach(note => {
      note.tags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return counts;
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = !query || 
        note.title.toLowerCase().includes(query) || 
        note.body.toLowerCase().includes(query) || 
        note.tags.some(tag => tag.toLowerCase().includes(query));
      
      const matchesTag = selectedTag === 'All' || note.tags.includes(selectedTag);
      
      return matchesSearch && matchesTag;
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [notes, searchQuery, selectedTag]);

  // Actions
  const handleOpenModal = (note?: Note) => {
    if (note) {
      setEditingId(note.id);
      setModalTitle(note.title);
      setModalBody(note.body);
      setModalTags(note.tags.join(', '));
    } else {
      setEditingId(null);
      setModalTitle('');
      setModalBody('');
      setModalTags('');
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!modalTitle.trim()) return;

    const tags = modalTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t !== '');

    if (editingId) {
      setNotes(prev => prev.map(n => n.id === editingId ? {
        ...n,
        title: modalTitle,
        body: modalBody,
        tags,
        updatedAt: new Date().toISOString()
      } : n));
    } else {
      const newNote: Note = {
        id: Date.now(),
        title: modalTitle,
        body: modalBody,
        tags,
        updatedAt: new Date().toISOString()
      };
      setNotes(prev => [newNote, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (window.confirm('이 메모를 삭제할까요?')) {
      setNotes(prev => prev.filter(n => n.id !== id));
      if (filteredNotes.length <= 1 && selectedTag !== 'All') {
        setSelectedTag('All');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E0E0E0] font-sans flex flex-col md:flex-row overflow-hidden selection:bg-indigo-500/30">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#0F0F0F] border-r border-[#262626] flex flex-col flex-shrink-0">
        <div className="p-6 md:p-8 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-10 group cursor-default">
            <div className="w-3 h-3 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] group-hover:scale-125 transition-transform" />
            <h1 className="text-xl font-bold tracking-tight text-white">MyMemo</h1>
          </div>

          <nav className="flex-1">
            <div className="mb-10">
              <h2 className="text-[10px] font-bold text-[#525252] uppercase tracking-[0.2em] mb-4">Library</h2>
              <button 
                onClick={() => setSelectedTag('All')}
                className={`w-full flex items-center justify-between py-2 px-3 rounded-lg text-sm mb-1 transition-all group ${selectedTag === 'All' ? 'bg-[#1A1A1A] text-indigo-400 shadow-sm' : 'text-[#A3A3A3] hover:text-white hover:bg-[#1A1A1A]/50'}`}
              >
                <span className="flex items-center gap-3">
                  <Hash size={16} className={selectedTag === 'All' ? 'text-indigo-400' : 'text-[#525252] group-hover:text-[#A3A3A3]'} />
                  All Notes
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${selectedTag === 'All' ? 'bg-indigo-500/20' : 'bg-[#1A1A1A]'}`}>{notes.length}</span>
              </button>
            </div>

            <div>
              <h2 className="text-[10px] font-bold text-[#525252] uppercase tracking-[0.2em] mb-4">Tags</h2>
              <ul className="space-y-1">
                {Object.entries(tagsWithCount).map(([tag, count]) => (
                  <li 
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`flex items-center justify-between py-2 px-3 rounded-lg text-sm cursor-pointer transition-all group ${selectedTag === tag ? 'bg-[#1A1A1A] text-indigo-400 shadow-sm' : 'text-[#A3A3A3] hover:text-white hover:bg-[#1A1A1A]/50'}`}
                  >
                    <span className="flex items-center gap-3 truncate">
                      <TagIcon size={16} className={selectedTag === tag ? 'text-indigo-400' : 'text-[#525252] group-hover:text-[#A3A3A3]'} />
                      {tag}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${selectedTag === tag ? 'bg-indigo-500/20' : 'bg-[#1A1A1A]'}`}>{count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div className="mt-auto pt-6 border-t border-[#262626]">
            <div className="bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-xl">
              <p className="text-[11px] text-indigo-300/70 leading-relaxed italic">"Capture ideas at the speed of thought."</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full bg-[#0A0A0A] overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-[#262626] flex items-center justify-between px-6 md:px-8 bg-[#0A0A0A]/80 backdrop-blur-md shrink-0">
          <div className="relative w-full max-w-sm group">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#525252] group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search notes, tags..." 
              className="w-full bg-[#171717] border border-[#262626] rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 text-[#E5E5E5] transition-all placeholder:text-[#525252]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="ml-4 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/10 active:scale-95"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">New Memo</span>
          </button>
        </header>

        {/* Content Body */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar">
          {filteredNotes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 max-w-6xl">
              <AnimatePresence mode="popLayout">
                {filteredNotes.map(note => (
                  <motion.div 
                    layout
                    key={note.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => handleOpenModal(note)}
                    className="group relative bg-[#171717] border border-[#262626] rounded-2xl p-6 hover:border-indigo-500/50 transition-all cursor-pointer flex flex-col h-[280px]"
                  >
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <h3 className="text-lg font-semibold text-white leading-tight line-clamp-2 group-hover:text-indigo-400 transition-colors">
                        {note.title}
                      </h3>
                      <button 
                        onClick={(e) => handleDelete(e, note.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-full"
                        title="Delete memo"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="text-[#A3A3A3] text-sm line-clamp-5 mb-6 leading-relaxed flex-1">
                      {note.body}
                    </p>
                    <div className="flex items-center gap-1.5 mt-auto flex-wrap overflow-hidden h-6">
                      {note.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-[#262626] text-[#737373] text-[9px] rounded uppercase font-bold tracking-widest whitespace-nowrap">
                          {tag}
                        </span>
                      ))}
                      <span className="ml-auto text-[10px] text-[#525252] font-mono">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
                
                {/* Empty State Card Action */}
                <motion.div 
                  layout
                  onClick={() => handleOpenModal()}
                  className="border-2 border-dashed border-[#262626] rounded-2xl flex flex-col items-center justify-center p-6 text-[#525252] group hover:border-[#404040] hover:text-[#737373] transition-all cursor-pointer h-[280px]"
                >
                   <Plus size={32} className="mb-2 opacity-50 group-hover:scale-110 transition-transform" />
                   <span className="text-sm font-medium">Add New Memo</span>
                </motion.div>
              </AnimatePresence>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-20 text-[#525252]">
              <div className="w-20 h-20 bg-[#171717] rounded-3xl flex items-center justify-center mb-6 border border-[#262626]">
                <Search size={32} className="opacity-20" />
              </div>
              <p className="text-lg font-medium">No notes match your search</p>
              <p className="text-sm">Try using different keywords or clearing filters</p>
              <button 
                onClick={() => {setSearchQuery(''); setSelectedTag('All');}}
                className="mt-6 text-indigo-400 hover:text-indigo-300 text-sm font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Status Bar / Footer */}
        <footer className="h-8 shrink-0 px-8 border-t border-[#262626] flex items-center justify-between text-[10px] text-[#525252] bg-[#0F0F0F] font-mono tracking-wider">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
              {filteredNotes.length} notes found
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden sm:inline uppercase">UTF-8</span>
            <span className="flex items-center gap-2">
              <StickyNote size={10} />
              SYNCED TO LOCALSTORAGE
            </span>
          </div>
        </footer>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-[#171717] border border-[#262626] rounded-3xl shadow-2xl p-8 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {editingId ? 'Edit Memo' : 'Create New Memo'}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-[#262626] rounded-full text-[#525252] hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-[#525252] uppercase tracking-[0.2em] mb-2 px-1">Concept Title</label>
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="E.g. Project Idea, Design Guide..."
                    className="w-full bg-transparent border-b border-[#262626] py-3 text-2xl font-bold focus:outline-none focus:border-indigo-500 text-white placeholder:text-[#262626] transition-colors"
                    value={modalTitle}
                    onChange={(e) => setModalTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#525252] uppercase tracking-[0.2em] mb-2 px-1">Thoughts & Content</label>
                  <textarea 
                    rows={8}
                    placeholder="Write your thoughts..."
                    className="w-full bg-transparent border border-[#262626] rounded-2xl p-4 focus:outline-none focus:border-indigo-500 text-[#E0E0E0] placeholder:text-[#262626] transition-colors resize-none leading-relaxed"
                    value={modalBody}
                    onChange={(e) => setModalBody(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#525252] uppercase tracking-[0.2em] mb-2 px-1">Classification Tags</label>
                  <div className="relative group">
                    <Hash className="absolute left-0 top-1/2 -translate-y-1/2 text-[#525252]" size={16} />
                    <input 
                      type="text" 
                      placeholder="design, dev, personal (comma separated)"
                      className="w-full bg-transparent border-b border-[#262626] py-3 pl-7 text-sm focus:outline-none focus:border-indigo-500 text-indigo-300 placeholder:text-[#262626] transition-all"
                      value={modalTags}
                      onChange={(e) => setModalTags(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-12 flex gap-4">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-[#737373] hover:text-white transition-all"
                >
                  Discard
                </button>
                <button 
                  onClick={handleSave}
                  disabled={!modalTitle.trim()}
                  className="flex-1 px-6 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-30 disabled:shadow-none"
                >
                  Save Memo
                </button>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -ml-16 -mb-16 pointer-events-none" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

}

