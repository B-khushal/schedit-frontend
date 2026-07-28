import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X, Calendar, FileText, User, Settings, Sparkles, FolderOpen, ArrowRight, CornerDownLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

interface SearchItem {
  id: string;
  category: 'posts' | 'projects' | 'team' | 'settings' | 'workflow' | 'calendar';
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

  // Mock static search bank for keyboard navigations
  const searchBank: SearchItem[] = [
    { id: 'dash', category: 'projects', title: 'Executive Overview Dashboard', subtitle: 'View performance metrics & KPIs', path: '/app', icon: <Sparkles className="w-4 h-4 text-brand-500" /> },
    { id: 'projects', category: 'projects', title: 'Workspace Projects list', subtitle: 'Manage all campaigns & clients', path: '/app/projects', icon: <FolderOpen className="w-4 h-4 text-blue-500" /> },
    { id: 'studio', category: 'workflow', title: 'Content Create Studio', subtitle: 'Compose new posts & setup overrides', path: '/app/studio', icon: <FileText className="w-4 h-4 text-violet-500" /> },
    { id: 'calendar', category: 'calendar', title: 'Social Content Calendar', subtitle: 'Week & month drag-drop scheduler', path: '/app/calendar', icon: <Calendar className="w-4 h-4 text-emerald-500" /> },
    { id: 'workflow', category: 'workflow', title: 'Approvals & Review Pipeline', subtitle: 'HOD & Client annotation boards', path: '/app/workflow', icon: <FileText className="w-4 h-4 text-amber-500" /> },
    { id: 'team', category: 'team', title: 'Team Directory & Roles', subtitle: 'Invite organization members', path: '/app/team', icon: <User className="w-4 h-4 text-indigo-500" /> },
    { id: 'settings', category: 'settings', title: 'Workspace settings', subtitle: 'Brand, billing, API keys, webhooks', path: '/app/settings', icon: <Settings className="w-4 h-4 text-gray-500" /> },
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

  // Keyboard navigation inside search panel
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
        <div className="fixed inset-0 z-50 flex items-start justify-center p-0 sm:p-4 sm:pt-[15vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Search Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white sm:rounded-2xl shadow-modal border-0 sm:border border-gray-200 w-full max-w-xl overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[50vh]"
          >
            {/* Input Bar */}
            <div className="flex items-center px-4 border-b border-gray-200 shrink-0">
              <SearchIcon className="w-5 h-5 text-gray-400 mr-3" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search anything or run quick commands..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                className="w-full py-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
              />
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredItems.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={cn(
                      'flex items-center justify-between px-3.5 py-3 sm:py-3 rounded-xl cursor-pointer transition-colors duration-150 touch-target',
                      isSelected ? 'bg-brand-50 text-brand-900' : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center border',
                        isSelected ? 'bg-white border-brand-200 shadow-xs' : 'bg-gray-50 border-gray-200'
                      )}>
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <p className={cn('text-sm font-semibold', isSelected ? 'text-brand-950' : 'text-gray-900')}>
                          {item.title}
                        </p>
                        {item.subtitle && (
                          <p className={cn('text-xs truncate', isSelected ? 'text-brand-700' : 'text-gray-500')}>
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-brand-500 bg-brand-100/50 px-2 py-0.5 rounded border border-brand-200">
                        <span>Select</span>
                        <CornerDownLeft className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredItems.length === 0 && (
                <div className="py-12 text-center text-gray-500">
                  <p className="text-sm font-semibold">No results found</p>
                  <p className="text-xs text-gray-400 mt-1">Try searching for workspace, calendar, or studio settings.</p>
                </div>
              )}
            </div>

            {/* Footer hints */}
            <div className="hidden sm:flex px-4 py-2.5 bg-gray-50 border-t border-gray-100 items-center justify-between text-[11px] text-gray-500 font-semibold shrink-0">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><kbd className="bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-xs">↑↓</kbd> Navigate</span>
                <span className="flex items-center gap-1"><kbd className="bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-xs">Enter</kbd> Open</span>
              </div>
              <span className="flex items-center gap-1"><kbd className="bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-xs">Esc</kbd> Close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
