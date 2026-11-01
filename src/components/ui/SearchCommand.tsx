import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X, Calendar, FileText, User, Settings, Sparkles, FolderOpen, ArrowRight, CornerDownLeft, Bot, Megaphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

interface SearchItem {
  id: string;
  category: 'ai' | 'posts' | 'projects' | 'team' | 'settings' | 'workflow' | 'calendar';
  title: string;
  subtitle?: string;
  path: string;
  icon: React.ReactNode;
}

interface SearchCommandProps {
  open: boolean;
  onClose: () => void;
}

export function SearchCommand({ open, onClose }: SearchCommandProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const searchBank: SearchItem[] = [
    { id: 'dash', category: 'projects', title: 'Executive Overview Dashboard', subtitle: 'View performance metrics & KPIs', path: '/app', icon: <Sparkles className="w-4 h-4 text-blue-500" /> },
    { id: 'ai-center', category: 'ai', title: 'AI Command Center', subtitle: 'Autonomous AI orchestration & agent dispatch', path: '/app/ai', icon: <Bot className="w-4 h-4 text-cyan-500" /> },
    { id: 'ai-autonomy', category: 'ai', title: 'Autonomy Control Center', subtitle: 'Configure autonomous policies & approval rules', path: '/app/ai/automation', icon: <Bot className="w-4 h-4 text-blue-500" /> },
    { id: 'ai-approvals', category: 'ai', title: 'Approval Center', subtitle: 'Review & approve AI generated organic & ad drafts', path: '/app/ai/approvals', icon: <Sparkles className="w-4 h-4 text-amber-500" /> },
    { id: 'ads', category: 'ai', title: 'Meta Ads Command Center', subtitle: 'Multi-campaign oversight & budget guardrails', path: '/app/ads', icon: <Megaphone className="w-4 h-4 text-indigo-500" /> },
    { id: 'projects', category: 'projects', title: 'Workspace Projects', subtitle: 'Manage all campaigns & clients', path: '/app/projects', icon: <FolderOpen className="w-4 h-4 text-blue-500" /> },
    { id: 'studio', category: 'workflow', title: 'Content Studio & Composer', subtitle: 'Compose new posts & setup overrides', path: '/app/studio', icon: <FileText className="w-4 h-4 text-violet-500" /> },
    { id: 'calendar', category: 'calendar', title: 'Social Content Calendar', subtitle: 'Week & month drag-drop scheduler', path: '/app/calendar', icon: <Calendar className="w-4 h-4 text-emerald-500" /> },
    { id: 'workflow', category: 'workflow', title: 'Approvals & Review Pipeline', subtitle: 'HOD & Client annotation boards', path: '/app/workflow', icon: <FileText className="w-4 h-4 text-amber-500" /> },
    { id: 'team', category: 'team', title: 'Team Directory & Roles', subtitle: 'Invite organization members', path: '/app/team', icon: <User className="w-4 h-4 text-indigo-500" /> },
    { id: 'settings', category: 'settings', title: 'Workspace Settings', subtitle: 'Brand, billing, API keys, webhooks', path: '/app/settings', icon: <Settings className="w-4 h-4 text-slate-500" /> },
  ];

  const filteredItems = searchBank.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.subtitle?.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleSelect(filteredItems[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, selectedIndex, filteredItems, onClose]);

  const handleSelect = (item: SearchItem) => {
    navigate(item.path);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 sm:pt-[15vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Search Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.2 }}
            className="relative neu-card rounded-3xl w-full max-w-xl overflow-hidden flex flex-col max-h-[80vh] sm:max-h-[60vh] text-[var(--neu-text-primary)]"
          >
            {/* Input Bar */}
            <div className="flex items-center px-4 py-2 border-b border-[var(--neu-border-inset)] shrink-0">
              <SearchIcon className="w-5 h-5 text-[var(--neu-text-muted)] mr-3 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search anything or jump to command..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                className="w-full py-3 text-sm text-[var(--neu-text-primary)] placeholder:text-[var(--neu-text-muted)] focus:outline-none bg-transparent"
              />
              <button
                onClick={onClose}
                className="p-1.5 neu-button rounded-xl text-[var(--neu-text-muted)] hover:text-[var(--neu-text-primary)] transition-all ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {filteredItems.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={cn(
                      'flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer transition-all duration-150 select-none',
                      isSelected
                        ? 'neu-button-inset text-blue-500'
                        : 'text-[var(--neu-text-secondary)] hover:text-[var(--neu-text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 neu-inset-sm rounded-xl shrink-0">
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[var(--neu-text-primary)] truncate">{item.title}</p>
                        {item.subtitle && (
                          <p className="text-xs text-[var(--neu-text-muted)] truncate mt-0.5">{item.subtitle}</p>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <CornerDownLeft className="w-4 h-4 text-blue-500 shrink-0 ml-2" />
                    )}
                  </div>
                );
              })}
              {filteredItems.length === 0 && (
                <div className="py-12 text-center text-xs text-[var(--neu-text-muted)] font-medium">
                  No matching results found for "{query}"
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-2.5 neu-inset-sm border-t border-[var(--neu-border-inset)] flex items-center justify-between text-[11px] text-[var(--neu-text-muted)] font-medium">
              <span>Use <kbd className="font-bold">↑</kbd> <kbd className="font-bold">↓</kbd> to navigate</span>
              <span><kbd className="font-bold">Enter</kbd> to select • <kbd className="font-bold">Esc</kbd> to close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
