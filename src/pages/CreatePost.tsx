import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Image as ImageIcon, Video, Sparkles, Calendar as CalendarIcon, Hash, Check, Clock, Globe,
  Smile, ChevronDown, ChevronRight, RefreshCw, Layers, ShieldCheck, AlertCircle, Upload, X,
  Eye, MapPin, MessageSquare, Tags, Users, PlaySquare, Search, Filter, PanelLeftClose,
  PanelLeftOpen, CheckSquare, Square, Heart, MessageCircle, Send, Bookmark, Share2,
  ThumbsUp, MoreHorizontal, Zap, Type, AtSign, Link2, Undo2, Redo2, Smartphone, Monitor,
  AlignLeft, Trash2, FolderOpen, Film, ExternalLink, Camera, Music
} from 'lucide-react';
import { Platform } from '../types';
import { cn, getPlatformColor, getPlatformGradient, getAccountAvatar } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { useCloudinaryUpload } from '../hooks/useCloudinaryUpload';
import { addHours, format } from 'date-fns';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useToast } from '../components/ui/Toast';
import { Button, PlatformIcon, Avatar } from '../components/ui';

// ─── Types ───────────────────────────────────────────────────────
interface AccountOverride {
  socialAccountId: string;
  caption: string;
  hashtags: string;
  thumbnail: string;
  settings: any;
}

// ─── Platform character limits ───────────────────────────────────
const PLATFORM_LIMITS: Record<string, number> = {
  INSTAGRAM: 2200,
  FACEBOOK: 63206,
  LINKEDIN: 3000,
  YOUTUBE: 5000,
};

// ─── Content type definitions ────────────────────────────────────
const ALL_CONTENT_TYPES = [
  { value: 'FEED_POST', label: 'Feed Post', platforms: ['INSTAGRAM', 'FACEBOOK'], icon: ImageIcon },
  { value: 'REEL', label: 'Reel', platforms: ['INSTAGRAM', 'FACEBOOK'], icon: PlaySquare },
  { value: 'STORY', label: 'Story', platforms: ['INSTAGRAM', 'FACEBOOK'], icon: Layers },
  { value: 'COMPANY_POST', label: 'Company Post', platforms: ['LINKEDIN'], icon: AlignLeft },
  { value: 'VIDEO', label: 'Video', platforms: ['YOUTUBE'], icon: Video },
  { value: 'SHORT', label: 'Short', platforms: ['YOUTUBE'], icon: PlaySquare },
  { value: 'COMMUNITY', label: 'Community Post', platforms: ['YOUTUBE'], icon: MessageCircle },
];

// ─── Emoji data (subset) ─────────────────────────────────────────
const EMOJI_LIST = ['😀','😂','🔥','❤️','👏','🚀','💡','✨','🎯','💪','👀','🎉','📈','💰','🧠','⚡','🌟','👋','🤝','💎','🏆','📣','🎬','💼','🎨','📱','💻','🌍','🤖','🧵'];

// ═════════════════════════════════════════════════════════════════
export function CreatePost() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentProject } = useWorkspace();
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();

  // ── Core content state ──────────────────────────────────────────
  const [content, setContent] = useState('');
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [contentType, setContentType] = useState<string>('FEED_POST');
  const [scheduledTime, setScheduledTime] = useState(format(addHours(new Date(), 2), "yyyy-MM-dd'T'HH:mm"));
  const [timezone, setTimezone] = useState('UTC');
  const [priority, setPriority] = useState('MEDIUM');
  const [publishMode, setPublishMode] = useState<'schedule' | 'now'>('schedule');

  // ── Media state ─────────────────────────────────────────────────
  const [mediaFiles, setMediaFiles] = useState<{
    id: string;
    url: string;
    type: 'IMAGE' | 'VIDEO';
    name: string;
    size: number;
    publicId?: string;
    secureUrl?: string;
    resourceType?: string;
    width?: number;
    height?: number;
    duration?: number;
    format?: string;
  }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    uploadQueue,
    uploadFiles,
    pauseUpload,
    resumeUpload,
    cancelUpload,
    retryUpload,
  } = useCloudinaryUpload();

  // Watch uploadQueue to sync completed items into mediaFiles
  useEffect(() => {
    uploadQueue.forEach(item => {
      if (item.status === 'completed' && !mediaFiles.some(m => m.id === item.id)) {
        setMediaFiles(prev => [...prev, {
          id: item.id,
          url: item.secureUrl!,
          type: item.resourceType === 'video' ? 'VIDEO' : 'IMAGE',
          name: item.name,
          size: item.size,
          publicId: item.publicId,
          secureUrl: item.secureUrl,
          resourceType: item.resourceType,
          width: item.width,
          height: item.height,
          duration: item.duration,
          format: item.format,
        }]);
      }
    });
  }, [uploadQueue, mediaFiles]);

  // ── Override state ──────────────────────────────────────────────
  const [overrides, setOverrides] = useState<AccountOverride[]>([]);
  const [activeTab, setActiveTab] = useState<string>('default');

  // ── AI / Autosave ───────────────────────────────────────────────
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<'saved' | 'saving' | 'recovered' | null>(null);

  // ── Left sidebar state ──────────────────────────────────────────
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [accountSearch, setAccountSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // ── Right sidebar / preview state ───────────────────────────────
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('mobile');
  const [activePreviewPlatform, setActivePreviewPlatform] = useState<string>('');
  const [mobileStudioView, setMobileStudioView] = useState<'editor' | 'preview'>('editor');

  // ── Emoji picker state ──────────────────────────────────────────
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // ── Caption ref for cursor position ─────────────────────────────
  const captionRef = useRef<HTMLTextAreaElement>(null);

  // ═══════════════════════════════════════════════════════════════
  // EFFECTS
  // ═══════════════════════════════════════════════════════════════

  // Calendar date passthrough
  useEffect(() => {
    if (location.state && (location.state as any).defaultDate) {
      try {
        const date = new Date((location.state as any).defaultDate);
        setScheduledTime(format(addHours(date, 2), "yyyy-MM-dd'T'HH:mm"));
      } catch {}
    }
  }, [location.state]);

  // Auto-select first active account
  const socialAccounts: any[] = useMemo(() => {
    return (currentProject?.socialAccounts || []).filter((acc: any) => acc.status === 'ACTIVE');
  }, [currentProject]);

  useEffect(() => {
    if (socialAccounts.length > 0) {
      setSelectedAccountIds([socialAccounts[0].id]);
    }
  }, [socialAccounts]);

  // Derive selected platforms
  const selectedPlatforms = useMemo(() => {
    return socialAccounts
      .filter((acc: any) => selectedAccountIds.includes(acc.id))
      .map((acc: any) => acc.platform.toUpperCase());
  }, [selectedAccountIds, socialAccounts]);

  // Valid content types
  const validContentTypes = useMemo(() => {
    if (selectedPlatforms.length === 0) return ALL_CONTENT_TYPES;
    return ALL_CONTENT_TYPES.filter(t => t.platforms.some(p => selectedPlatforms.includes(p)));
  }, [selectedPlatforms]);

  // Auto-fix invalid content type
  useEffect(() => {
    if (validContentTypes.length > 0 && !validContentTypes.some(t => t.value === contentType)) {
      setContentType(validContentTypes[0].value);
    }
  }, [validContentTypes, contentType]);

  // Set default preview platform
  useEffect(() => {
    if (selectedPlatforms.length > 0 && !selectedPlatforms.includes(activePreviewPlatform)) {
      setActivePreviewPlatform(selectedPlatforms[0]);
    }
  }, [selectedPlatforms, activePreviewPlatform]);

  // Autosave recovery
  useEffect(() => {
    const savedContent = localStorage.getItem('schedit_draft_content');
    const savedOverrides = localStorage.getItem('schedit_draft_overrides');
    const savedAccounts = localStorage.getItem('schedit_draft_accounts');
    if (savedContent) {
      setContent(savedContent);
      setAutosaveStatus('recovered');
      if (savedOverrides) { try { setOverrides(JSON.parse(savedOverrides)); } catch {} }
      if (savedAccounts) { try { setSelectedAccountIds(JSON.parse(savedAccounts)); } catch {} }
    }
  }, [currentProject]);

  // Autosave trigger
  useEffect(() => {
    if (!content) return;
    setAutosaveStatus('saving');
    const timer = setTimeout(() => {
      localStorage.setItem('schedit_draft_content', content);
      localStorage.setItem('schedit_draft_overrides', JSON.stringify(overrides));
      localStorage.setItem('schedit_draft_accounts', JSON.stringify(selectedAccountIds));
      setAutosaveStatus('saved');
    }, 1200);
    return () => clearTimeout(timer);
  }, [content, overrides, selectedAccountIds]);

  // Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (content.trim()) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [content]);

  // Media Picker States
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [pickerAssets, setPickerAssets] = useState<any[]>([]);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerType, setPickerType] = useState('all');
  const [pickerSelectedIds, setPickerSelectedIds] = useState<string[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);

  // Fetch Picker Assets
  const fetchPickerAssets = async () => {
    if (!currentProject || !isMediaPickerOpen) return;
    setPickerLoading(true);
    try {
      const url = `/api/v1/projects/${currentProject.id}/assets?limit=50&isArchived=false&type=${pickerType}&search=${pickerSearch}`;
      const res = await apiRequest(url);
      setPickerAssets(res.assets || []);
    } catch (err) {
      console.error('Failed to load library assets for picker:', err);
    } finally {
      setPickerLoading(false);
    }
  };

  useEffect(() => {
    fetchPickerAssets();
  }, [isMediaPickerOpen, pickerType, pickerSearch, currentProject]);

  // ═══════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════

  const toggleAccountSelection = (accountId: string) => {
    setSelectedAccountIds(prev =>
      prev.includes(accountId) ? prev.filter(id => id !== accountId) : [...prev, accountId]
    );
  };

  const selectAllAccounts = () => {
    const filteredIds = filteredAccounts.map(a => a.id);
    setSelectedAccountIds(filteredIds);
  };

  const deselectAllAccounts = () => setSelectedAccountIds([]);

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupName)) next.delete(groupName); else next.add(groupName);
      return next;
    });
  };

  const getOverrideForAccount = (accountId: string) => {
    return overrides.find(o => o.socialAccountId === accountId) || {
      socialAccountId: accountId, caption: '', hashtags: '', thumbnail: '',
      settings: { audience: 'public', category: 'People & Blogs', visibility: 'public' }
    };
  };

  const updateOverrideValue = (accountId: string, key: keyof AccountOverride, val: any) => {
    setOverrides(prev => {
      const idx = prev.findIndex(o => o.socialAccountId === accountId);
      const updated = { ...getOverrideForAccount(accountId), [key]: val };
      if (idx > -1) { const copy = [...prev]; copy[idx] = updated; return copy; }
      return [...prev, updated];
    });
  };

  const updateOverrideSetting = (accountId: string, settingKey: string, val: any) => {
    const current = getOverrideForAccount(accountId);
    updateOverrideValue(accountId, 'settings', { ...current.settings, [settingKey]: val });
  };

  // ── Media Upload ────────────────────────────────────────────────
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !currentProject) return;
    uploadFiles(files, currentProject.id);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    if (!currentProject) return;
    uploadFiles(e.dataTransfer.files, currentProject.id);
  };

  const removeMedia = (idx: number) => setMediaFiles(prev => prev.filter((_, i) => i !== idx));

  const clearAutosave = () => {
    localStorage.removeItem('schedit_draft_content');
    localStorage.removeItem('schedit_draft_overrides');
    localStorage.removeItem('schedit_draft_accounts');
    setContent(''); setOverrides([]); setSelectedAccountIds([]); setMediaFiles([]);
    setAutosaveStatus(null);
  };

  const insertEmoji = (emoji: string) => {
    if (captionRef.current) {
      const start = captionRef.current.selectionStart;
      const end = captionRef.current.selectionEnd;
      const newContent = content.substring(0, start) + emoji + content.substring(end);
      setContent(newContent);
      setTimeout(() => {
        captionRef.current?.focus();
        captionRef.current?.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    } else {
      setContent(prev => prev + emoji);
    }
    setShowEmojiPicker(false);
  };

  // ── Validation ──────────────────────────────────────────────────
  const validateLocalSubmission = () => {
    if (!content.trim()) { toastWarning('Required', 'Please enter post content.'); return false; }
    if (selectedAccountIds.length === 0) { toastWarning('Required', 'Select at least one publishing account.'); return false; }
    if (publishMode === 'schedule') {
      const timeVal = new Date(scheduledTime);
      if (timeVal <= new Date()) { toastWarning('Invalid Date', 'Scheduled time must be in the future.'); return false; }
    }
    const accountsData = socialAccounts.filter((acc: any) => selectedAccountIds.includes(acc.id));
    for (const acc of accountsData) {
      const override = getOverrideForAccount(acc.id);
      const caption = override.caption || content;
      const hashtags = override.hashtags || '';
      const finalText = hashtags ? `${caption} ${hashtags}` : caption;
      if (acc.platform === 'INSTAGRAM') {
        if (finalText.length > 2200) { toastWarning('Validation', `Instagram exceeds 2200 chars for @${acc.username}`); return false; }
        if ((finalText.match(/#/g) || []).length > 30) { toastWarning('Validation', `Instagram exceeds 30 hashtags for @${acc.username}`); return false; }
      }
      if (acc.platform === 'LINKEDIN' && finalText.length > 3000) { toastWarning('Validation', `LinkedIn exceeds 3000 chars for @${acc.username}`); return false; }
      if (acc.platform === 'YOUTUBE') {
        const title = override.settings?.title || '';
        if (!title.trim()) { toastWarning('Validation', `YouTube @${acc.username} requires a title.`); return false; }
        if (contentType !== 'COMMUNITY' && !mediaFiles.some(m => m.type === 'VIDEO')) { toastWarning('Validation', `YouTube @${acc.username} requires a video.`); return false; }
      }
    }
    return true;
  };

  // ── Submit ──────────────────────────────────────────────────────
  const handleSubmit = async (submitType: 'draft' | 'review' | 'schedule') => {
    if (!validateLocalSubmission()) return;
    const timeVal = publishMode === 'now' ? new Date(Date.now() + 3000) : new Date(scheduledTime);
    let postStatus = 'DRAFT';
    if (submitType === 'review') postStatus = 'UNDER_REVIEW';
    if (submitType === 'schedule') postStatus = 'SCHEDULED';

    const formattedOverrides = selectedAccountIds.map(accId => {
      const existing = overrides.find(o => o.socialAccountId === accId);
      return {
        socialAccountId: accId,
        caption: existing?.caption || undefined,
        hashtags: existing?.hashtags || undefined,
        thumbnail: existing?.thumbnail || undefined,
        settings: { ...(existing?.settings || {}), contentType },
      };
    });
    try {
      await apiRequest(`/api/v1/projects/${currentProject!.id}/posts`, {
        method: 'POST',
        body: JSON.stringify({
          content, scheduledTime: timeVal.toISOString(), socialAccountIds: selectedAccountIds,
          timezone, priority, status: postStatus, overrides: formattedOverrides,
          media: mediaFiles.map(m => ({
            mediaType: m.type,
            storagePath: m.url,
            size: m.size,
            mimeType: m.type === 'VIDEO' ? 'video/mp4' : 'image/jpeg',
            publicId: m.publicId,
            secureUrl: m.secureUrl,
            resourceType: m.resourceType,
            width: m.width,
            height: m.height,
            duration: m.duration,
            format: m.format,
          })),
        }),
      });
      localStorage.removeItem('schedit_draft_content');
      localStorage.removeItem('schedit_draft_overrides');
      localStorage.removeItem('schedit_draft_accounts');
      toastSuccess('Success', submitType === 'schedule' ? 'Post scheduled successfully!' : submitType === 'review' ? 'Post submitted for review.' : 'Post saved as draft.');
      navigate(submitType === 'schedule' ? '/app/calendar' : '/app/workflow');
    } catch (err: any) { toastError('Failed', err.message || 'Submission failed.'); }
  };

  // ═══════════════════════════════════════════════════════════════
  // DERIVED DATA
  // ═══════════════════════════════════════════════════════════════

  // Filter accounts by search + platform
  const filteredAccounts = useMemo(() => {
    return socialAccounts.filter((acc: any) => {
      const matchSearch = !accountSearch ||
        acc.displayName?.toLowerCase().includes(accountSearch.toLowerCase()) ||
        acc.username?.toLowerCase().includes(accountSearch.toLowerCase());
      const matchPlatform = platformFilter === 'all' || acc.platform?.toUpperCase() === platformFilter;
      return matchSearch && matchPlatform;
    });
  }, [socialAccounts, accountSearch, platformFilter]);

  // Group accounts by project (all belong to currentProject)
  const groupedAccounts = useMemo(() => {
    const groups: Record<string, any[]> = {};
    const projectName = currentProject?.name || 'Default Workspace';
    // Group by platform for visual clarity
    filteredAccounts.forEach((acc: any) => {
      const groupKey = projectName;
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(acc);
    });
    return groups;
  }, [filteredAccounts, currentProject]);

  const selectedAccountsData = socialAccounts.filter((acc: any) => selectedAccountIds.includes(acc.id));
  const activeOverride = activeTab !== 'default' ? getOverrideForAccount(activeTab) : null;
  const activeAccount = activeTab !== 'default' ? socialAccounts.find((a: any) => a.id === activeTab) : null;

  // Character count and limit
  const charCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Get the strictest character limit for selected platforms
  const activeLimit = useMemo(() => {
    if (selectedPlatforms.length === 0) return null;
    const limits = selectedPlatforms.map(p => PLATFORM_LIMITS[p]).filter(Boolean);
    return limits.length > 0 ? Math.min(...limits) : null;
  }, [selectedPlatforms]);

  const charPercentage = activeLimit ? Math.min(100, (charCount / activeLimit) * 100) : 0;

  // Unique platforms for filter pills
  const availablePlatforms = useMemo(() => {
    const set = new Set(socialAccounts.map((a: any) => a.platform?.toUpperCase()));
    return Array.from(set);
  }, [socialAccounts]);

  // ═══════════════════════════════════════════════════════════════
  // GUARDS
  // ═══════════════════════════════════════════════════════════════

  if (!currentProject) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center text-brand-600 shadow-sm border border-brand-100">
          <AlertCircle className="w-8 h-8 animate-bounce" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 font-display">Select a Project</h3>
        <p className="text-sm text-gray-500 leading-relaxed font-medium">Please select a workspace project from the sidebar to begin creating content.</p>
      </div>
    );
  }

  if (socialAccounts.length === 0) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center text-brand-600 shadow-sm border border-brand-100">
          <Globe className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 font-display">No Connected Accounts</h3>
        <p className="text-sm text-gray-500 leading-relaxed font-medium">Link at least one social media channel before scheduling posts.</p>
        <Link to={`/app/projects/${currentProject.id}/apps`} className="inline-flex px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-500 transition-all shadow-md">
          Manage Connections
        </Link>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="min-h-[calc(100dvh-3.5rem)] lg:h-[calc(100vh-3.5rem)] flex flex-col lg:flex-row w-full overflow-x-hidden lg:overflow-hidden bg-gray-50/30 font-sans select-none">

      {/* ╔═══════════════════════════════════════════════════════╗ */}
      {/* ║  LEFT SIDEBAR – Publishing Accounts                  ║ */}
      {/* ╚═══════════════════════════════════════════════════════╝ */}
      <AnimatePresence mode="wait">
        {!sidebarCollapsed ? (
          <motion.div
            key="sidebar-open"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="hidden lg:flex h-full bg-white border-r border-gray-200 flex-col shrink-0 overflow-hidden"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-100 space-y-3 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Accounts</h3>
                  <span className="px-1.5 py-0.5 bg-brand-50 border border-brand-200 text-brand-700 text-[10px] font-bold rounded-full">
                    {selectedAccountIds.length}/{socialAccounts.length}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setSidebarCollapsed(true)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors cursor-pointer" title="Collapse">
                    <PanelLeftClose className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search accounts..."
                  value={accountSearch}
                  onChange={(e) => setAccountSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-500/30 focus:border-brand-400 transition-colors"
                />
              </div>

              {/* Platform filter pills */}
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setPlatformFilter('all')}
                  className={cn("px-2 py-0.5 text-[10px] font-bold rounded-md border transition-colors cursor-pointer",
                    platformFilter === 'all' ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                  )}
                >All</button>
                {availablePlatforms.map(p => (
                  <button
                    key={p}
                    onClick={() => setPlatformFilter(p)}
                    className={cn("px-2 py-0.5 text-[10px] font-bold rounded-md border transition-colors cursor-pointer flex items-center gap-1",
                      platformFilter === p ? "text-white border-transparent" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                    )}
                    style={platformFilter === p ? { backgroundColor: getPlatformColor(p) } : {}}
                  >
                    <PlatformIcon platform={p} size="xs" className="w-3 h-3" />
                    {p.charAt(0) + p.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>

              {/* Select All / Deselect */}
              <div className="flex items-center gap-2">
                <button onClick={selectAllAccounts} className="text-[10px] font-bold text-brand-600 hover:text-brand-700 cursor-pointer">Select All</button>
                <span className="text-gray-300">|</span>
                <button onClick={deselectAllAccounts} className="text-[10px] font-bold text-gray-500 hover:text-gray-700 cursor-pointer">Deselect</button>
              </div>
            </div>

            {/* Account List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
              {Object.entries(groupedAccounts).map(([groupName, accounts]) => (
                <div key={groupName}>
                  {/* Group Header */}
                  <button
                    onClick={() => toggleGroup(groupName)}
                    className="flex items-center gap-1.5 w-full px-1 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 cursor-pointer"
                  >
                    <ChevronRight className={cn("w-3 h-3 transition-transform", !collapsedGroups.has(groupName) && "rotate-90")} />
                    {groupName}
                    <span className="text-gray-300 ml-auto">{accounts.length}</span>
                  </button>

                  <AnimatePresence>
                    {!collapsedGroups.has(groupName) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-1.5 overflow-hidden"
                      >
                        {accounts.map((acc: any) => {
                          const isSelected = selectedAccountIds.includes(acc.id);
                          const isHealthy = acc.status === 'ACTIVE';

                          return (
                            <motion.div
                              key={acc.id}
                              whileHover={{ x: 2 }}
                              onClick={() => toggleAccountSelection(acc.id)}
                              className={cn(
                                "flex items-center gap-2.5 px-2.5 py-2 rounded-xl cursor-pointer transition-all relative group",
                                isSelected
                                  ? "bg-brand-50/60 border border-brand-200 shadow-sm"
                                  : "hover:bg-gray-50 border border-transparent"
                              )}
                            >
                              {/* Selection indicator */}
                              {isSelected && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-brand-500 rounded-full" />
                              )}

                              {/* Avatar + Platform badge */}
                              <div className="relative shrink-0">
                                <Avatar src={acc.profileImage || acc.avatar} name={acc.displayName || acc.username} size="sm" />
                                <span className="absolute -bottom-0.5 -right-0.5">
                                  <PlatformIcon platform={acc.platform} size="xs" className="w-3.5 h-3.5" />
                                </span>
                              </div>

                              {/* Name + meta */}
                              <div className="flex-1 min-w-0 text-left">
                                <h4 className="text-xs font-semibold text-gray-900 truncate leading-tight">{acc.displayName}</h4>
                                <p className="text-[10px] text-gray-400 truncate">@{acc.username}</p>
                              </div>

                              {/* Status + check */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                <div className={cn("w-1.5 h-1.5 rounded-full", isHealthy ? "bg-emerald-500" : "bg-red-400")} />
                                {isSelected && (
                                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-4 h-4 bg-brand-600 rounded-md flex items-center justify-center">
                                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                  </motion.div>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {filteredAccounts.length === 0 && (
                <div className="text-center py-8 text-xs text-gray-400 font-medium">No accounts match your filters.</div>
              )}
            </div>
          </motion.div>
        ) : (
          /* Collapsed sidebar rail */
          <motion.div
            key="sidebar-collapsed"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 48, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="hidden lg:flex h-full bg-white border-r border-gray-200 flex-col items-center py-3 gap-2 shrink-0"
          >
            <button onClick={() => setSidebarCollapsed(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors cursor-pointer" title="Expand">
              <PanelLeftOpen className="w-4 h-4" />
            </button>
            <div className="w-6 h-px bg-gray-200 my-1" />
            {socialAccounts.slice(0, 8).map((acc: any) => {
              const isSelected = selectedAccountIds.includes(acc.id);
              return (
                <button
                  key={acc.id}
                  onClick={() => toggleAccountSelection(acc.id)}
                  className={cn("w-8 h-8 rounded-lg overflow-hidden border-2 transition-all cursor-pointer",
                    isSelected ? "border-brand-500 shadow-sm shadow-brand-500/20" : "border-transparent opacity-50 hover:opacity-100"
                  )}
                  title={`${acc.displayName} (@${acc.username})`}
                >
                  <img src={acc.profileImage || acc.avatar || `https://i.pravatar.cc/80?u=${acc.id}`} alt="" className="w-full h-full object-cover" />
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ╔═══════════════════════════════════════════════════════╗ */}
      {/* ║  CENTER PANEL – Content Composer                     ║ */}
      {/* ╚═══════════════════════════════════════════════════════╝ */}
      <div className={cn("flex-1 flex flex-col overflow-y-auto min-w-0", mobileStudioView === 'preview' && "hidden lg:flex")}>

        {/* Sticky Sub-Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shrink-0">
          <div className="flex items-center justify-between gap-4 w-full sm:w-auto">
            <div>
              <h1 className="text-lg font-bold text-gray-900 font-display tracking-tight leading-none">Create Studio</h1>
              <div className="lg:hidden flex items-center gap-1 p-1 bg-gray-100 rounded-xl mt-3">
                <button
                  type="button"
                  onClick={() => setMobileStudioView('editor')}
                  className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-all", mobileStudioView === 'editor' ? "bg-white text-brand-700 shadow-xs" : "text-gray-500")}
                >
                  Editor
                </button>
                <button
                  type="button"
                  onClick={() => setMobileStudioView('preview')}
                  className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-all", mobileStudioView === 'preview' ? "bg-white text-brand-700 shadow-xs" : "text-gray-500")}
                >
                  Preview
                </button>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5 font-medium">{currentProject.name} · {selectedAccountIds.length} account{selectedAccountIds.length !== 1 ? 's' : ''} selected</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto overflow-x-auto scrollbar-hide pb-1 sm:pb-0">
            {/* Autosave indicator */}
            {autosaveStatus && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-700">
                  {autosaveStatus === 'recovered' ? 'Recovered' : autosaveStatus === 'saving' ? 'Saving...' : 'Saved'}
                </span>
                {autosaveStatus === 'recovered' && (
                  <button onClick={clearAutosave} className="text-[9px] font-bold underline text-emerald-600 hover:text-emerald-800 cursor-pointer ml-0.5">Reset</button>
                )}
              </div>
            )}

            <Button variant="ghost" size="sm" onClick={clearAutosave} className="text-gray-400 hover:text-red-500 shrink-0" icon={<Trash2 className="w-3.5 h-3.5" />}>
              Clear
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleSubmit('draft')} className="shrink-0" icon={<AlignLeft className="w-3.5 h-3.5" />}>
              Save Draft
            </Button>
            <Button variant="primary" size="sm" onClick={() => handleSubmit('review')} className="shrink-0" icon={<Send className="w-3.5 h-3.5" />}>
              Submit for Review
            </Button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6 pb-bottom-nav lg:pb-6">
          <div className="lg:hidden space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider text-left">Publishing Accounts</label>
              <span className="text-[10px] font-bold text-brand-700 bg-brand-50 border border-brand-100 rounded-full px-2 py-1">
                {selectedAccountIds.length}/{socialAccounts.length}
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {socialAccounts.map((acc: any) => {
                const isSelected = selectedAccountIds.includes(acc.id);
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => toggleAccountSelection(acc.id)}
                    className={cn(
                      "min-w-[150px] flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition-all",
                      isSelected ? "border-brand-300 bg-brand-50 text-gray-900" : "border-gray-200 bg-white text-gray-600"
                    )}
                  >
                    <Avatar src={acc.profileImage || acc.avatar} name={acc.displayName || acc.username} size="xs" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold">{acc.displayName || acc.username}</p>
                      <p className="truncate text-[10px] text-gray-400">@{acc.username}</p>
                    </div>
                    <PlatformIcon platform={acc.platform} size="xs" className="w-3.5 h-3.5 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Media Upload Zone ──────────────────────────────── */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider text-left">Media Assets</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Local Upload */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-all group min-h-[140px]",
                  dragOver ? "border-brand-500 bg-brand-50/50" : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                )}
              >
                <input ref={fileInputRef} type="file" onChange={(e) => handleFileUpload(e.target.files)} className="hidden" accept="image/*,video/*" multiple />
                <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-500 flex items-center justify-center transition-colors">
                  {uploading ? <RefreshCw className="w-4.5 h-4.5 animate-spin" /> : <Upload className="w-4.5 h-4.5" />}
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-700">Upload New Media</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Drag & drop or browse local files</p>
                </div>
              </div>

              {/* Option 2: Schedit Assets */}
              <div
                onClick={() => setIsMediaPickerOpen(true)}
                className="border-2 border-dashed border-gray-200 bg-white hover:border-brand-300 hover:bg-brand-50/20 rounded-2xl p-6 flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-all group min-h-[140px]"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-500 group-hover:bg-brand-100 flex items-center justify-center transition-colors">
                  <FolderOpen className="w-4.5 h-4.5" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-700">Choose From Schedit Assets</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Select existing files from Media Library</p>
                </div>
              </div>
            </div>

            {/* Upload Queue Section */}
            {uploadQueue.length > 0 && (
              <div className="space-y-2 border border-gray-150 bg-gray-50/50 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-left">Upload Queue</p>
                <div className="space-y-2">
                  {uploadQueue.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
                      <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                        {item.type.startsWith('video/') ? (
                          <Video className="w-4 h-4 text-brand-500" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-indigo-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-gray-700 truncate">{item.name}</p>
                          <span className="text-[10px] font-bold text-gray-500">
                            {item.status === 'completed' ? 'Uploaded' : item.status === 'failed' ? 'Failed' : `${item.progress}%`}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-300",
                              item.status === 'failed' ? "bg-red-500" : item.status === 'completed' ? "bg-emerald-500" : "bg-brand-500"
                            )}
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        {item.error && <p className="text-[9px] text-red-500 font-medium mt-1 truncate">{item.error}</p>}
                      </div>
                      <div className="flex items-center gap-1">
                        {item.status === 'uploading' && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); pauseUpload(item.id); }}
                            className="p-1 hover:bg-gray-100 rounded-md text-gray-500 hover:text-gray-700 cursor-pointer"
                            title="Pause"
                          >
                            <span className="text-xs font-bold font-mono">||</span>
                          </button>
                        )}
                        {item.status === 'paused' && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); resumeUpload(item.id); }}
                            className="p-1 hover:bg-gray-100 rounded-md text-gray-500 hover:text-gray-700 cursor-pointer"
                            title="Resume"
                          >
                            <PlaySquare className="w-4 h-4" />
                          </button>
                        )}
                        {item.status === 'failed' && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); retryUpload(item.id); }}
                            className="p-1 hover:bg-gray-100 rounded-md text-gray-500 hover:text-gray-700 cursor-pointer"
                            title="Retry"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {item.status !== 'completed' && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); cancelUpload(item.id); }}
                            className="p-1 hover:bg-gray-100 rounded-md text-red-500 hover:text-red-700 cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Uploaded media gallery */}
            {mediaFiles.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {mediaFiles.map((m, idx) => (
                  <div key={m.id || idx} className="w-24 h-24 rounded-xl border border-gray-200 bg-gray-50 relative overflow-hidden shrink-0 group shadow-xs">
                    {m.type === 'VIDEO' ? (
                      <video src={m.url} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={m.url} alt="" className="w-full h-full object-cover" />
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeMedia(idx); }}
                      className="absolute top-1 right-1 p-0.5 bg-black/60 hover:bg-black/80 rounded-md text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 bg-black/50 px-1.5 py-0.5 text-[9px] text-white font-mono truncate">{m.name}</div>
                  </div>
                ))}

                {/* Add more button */}
                <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 bg-white hover:border-brand-300 flex flex-col items-center justify-center cursor-pointer shrink-0 transition-colors">
                  <input type="file" onChange={(e) => handleFileUpload(e.target.files)} className="hidden" accept="image/*,video/*" multiple />
                  <Upload className="w-4 h-4 text-gray-400" />
                  <span className="text-[9px] font-bold text-gray-400 mt-1">Add More</span>
                </label>
              </div>
            )}
          </div>

          {/* ── Content Type Selector ──────────────────────────── */}
          <div className="flex items-center gap-2 flex-wrap">
            {validContentTypes.map(type => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => setContentType(type.value)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer",
                    contentType === type.value
                      ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {type.label}
                </button>
              );
            })}
          </div>

          {/* ── Caption Editor Card ────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-card overflow-hidden text-left">
            {/* Story / Reel Format Info Banner */}
            {contentType === 'STORY' && (
              <div className="p-4 bg-purple-50 border-b border-purple-150 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-purple-900">Instagram & Facebook Story Mode</p>
                  <p className="text-[11px] text-purple-700 mt-0.5 leading-normal">
                    Meta Graph API does not support text captions on Stories. Story visual media will be published full-screen. Add optional sticker link below.
                  </p>
                </div>
              </div>
            )}

            {contentType === 'REEL' && (
              <div className="p-3.5 bg-indigo-50/60 border-b border-indigo-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-900">
                  <Film className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold">Reel Sound Track & Caption</span>
                </div>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">Vertical 9:16</span>
              </div>
            )}

            {/* Override Tabs */}
            <div className="flex items-center gap-1.5 p-2.5 border-b border-gray-100 bg-gray-50/50 overflow-x-auto scrollbar-thin">
              <button
                onClick={() => setActiveTab('default')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer shrink-0",
                  activeTab === 'default'
                    ? "bg-white border-gray-300 text-gray-900 shadow-xs"
                    : "bg-transparent border-transparent text-gray-500 hover:bg-white hover:border-gray-200"
                )}
              >
                Default Content
              </button>
              {selectedAccountsData.map((acc: any) => (
                <button
                  key={acc.id}
                  onClick={() => setActiveTab(acc.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 shrink-0",
                    activeTab === acc.id
                      ? "bg-white border-gray-300 text-gray-900 shadow-xs"
                      : "bg-transparent border-transparent text-gray-500 hover:bg-white hover:border-gray-200"
                  )}
                >
                  <PlatformIcon platform={acc.platform} size="xs" className="w-3.5 h-3.5" />
                  {acc.displayName?.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Textarea / Override Fields */}
            {activeTab === 'default' ? (
              <div className="flex flex-col">
                <textarea
                  ref={captionRef}
                  rows={7}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your caption here. Use emojis, hashtags, and mentions to boost engagement..."
                  className="w-full p-5 text-sm text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none border-0 leading-relaxed"
                />

                {/* Toolbar */}
                <div className="px-4 py-2.5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="relative">
                      <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition-colors cursor-pointer" title="Emoji">
                        <Smile className="w-4 h-4" />
                      </button>
                      {showEmojiPicker && (
                        <div className="absolute bottom-full left-0 mb-1 bg-white border border-gray-200 rounded-xl shadow-xl p-2 grid grid-cols-10 gap-0.5 z-30 w-64">
                          {EMOJI_LIST.map(e => (
                            <button key={e} onClick={() => insertEmoji(e)} className="p-1 hover:bg-gray-100 rounded text-base cursor-pointer">{e}</button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button onClick={() => setContent(prev => prev + ' #')} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition-colors cursor-pointer" title="Hashtag"><Hash className="w-4 h-4" /></button>
                    <button onClick={() => setContent(prev => prev + ' @')} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition-colors cursor-pointer" title="Mention"><AtSign className="w-4 h-4" /></button>
                    <div className="w-px h-4 bg-gray-200 mx-1" />
                    <button onClick={() => setIsAIOpen(!isAIOpen)} className="p-1.5 hover:bg-brand-50 rounded-lg text-brand-500 hover:text-brand-600 transition-colors cursor-pointer" title="AI Assist"><Sparkles className="w-4 h-4" /></button>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] font-semibold text-gray-400 font-mono">
                    <span>{wordCount} words · {readingTime} min read</span>
                    <div className="flex items-center gap-1.5">
                      <span className={cn(activeLimit && charCount > activeLimit ? "text-red-500 font-bold" : "")}>
                        {charCount}{activeLimit ? `/${activeLimit}` : ''}
                      </span>
                      {activeLimit && (
                        <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all", charPercentage > 90 ? "bg-red-500" : charPercentage > 70 ? "bg-amber-500" : "bg-brand-500")}
                            style={{ width: `${charPercentage}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Platform-specific Override Fields */
              <div className="p-5 space-y-4 text-left">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <div>
                    <span className="text-xs font-bold text-gray-800">{activeAccount?.platform} Override</span>
                    <p className="text-[10px] text-gray-400 mt-0.5">Custom values for @{activeAccount?.username}</p>
                  </div>
                  <button onClick={() => updateOverrideValue(activeTab, 'caption', content)} className="text-[10px] font-bold text-brand-600 hover:text-brand-700 cursor-pointer px-2 py-1 bg-brand-50 rounded-md border border-brand-100">
                    Clone Default
                  </button>
                </div>

                {/* Instagram */}
                {activeAccount?.platform === 'INSTAGRAM' && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-gray-600">Caption Override</label>
                      <textarea rows={4} value={activeOverride?.caption || ''} onChange={(e) => updateOverrideValue(activeTab, 'caption', e.target.value)} placeholder="Instagram caption..." className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-gray-600">Hashtags</label>
                        <input type="text" placeholder="#brand #marketing" value={activeOverride?.hashtags || ''} onChange={(e) => updateOverrideValue(activeTab, 'hashtags', e.target.value)} className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-gray-600">Location</label>
                        <input type="text" placeholder="San Francisco, CA" value={activeOverride?.settings?.location || ''} onChange={(e) => updateOverrideSetting(activeTab, 'location', e.target.value)} className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-gray-600">First Comment</label>
                      <input type="text" placeholder="First comment after posting..." value={activeOverride?.settings?.firstComment || ''} onChange={(e) => updateOverrideSetting(activeTab, 'firstComment', e.target.value)} className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400" />
                    </div>
                  </div>
                )}

                {/* Facebook */}
                {activeAccount?.platform === 'FACEBOOK' && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-gray-600">Caption Override</label>
                      <textarea rows={4} value={activeOverride?.caption || ''} onChange={(e) => updateOverrideValue(activeTab, 'caption', e.target.value)} placeholder="Facebook caption..." className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 resize-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-gray-600">Tags / Keywords</label>
                      <input type="text" placeholder="comma,separated,tags" value={activeOverride?.settings?.tags || ''} onChange={(e) => updateOverrideSetting(activeTab, 'tags', e.target.value)} className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400" />
                    </div>
                  </div>
                )}

                {/* LinkedIn */}
                {activeAccount?.platform === 'LINKEDIN' && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-gray-600">Professional Caption</label>
                      <textarea rows={4} value={activeOverride?.caption || ''} onChange={(e) => updateOverrideValue(activeTab, 'caption', e.target.value)} placeholder="Professional LinkedIn caption..." className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 resize-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-gray-600">Mentions</label>
                      <input type="text" placeholder="@CompanyProfile" value={activeOverride?.settings?.mentions || ''} onChange={(e) => updateOverrideSetting(activeTab, 'mentions', e.target.value)} className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400" />
                    </div>
                  </div>
                )}

                {/* YouTube */}
                {activeAccount?.platform === 'YOUTUBE' && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-gray-600">Video Title <span className="text-red-500">*</span></label>
                      <input type="text" maxLength={100} value={activeOverride?.settings?.title || ''} onChange={(e) => updateOverrideSetting(activeTab, 'title', e.target.value)} placeholder="Enter YouTube title..." className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-gray-600">Description</label>
                      <textarea rows={4} value={activeOverride?.caption || ''} onChange={(e) => updateOverrideValue(activeTab, 'caption', e.target.value)} placeholder="Video description..." className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-gray-600">Tags</label>
                        <input type="text" value={activeOverride?.hashtags || ''} onChange={(e) => updateOverrideValue(activeTab, 'hashtags', e.target.value)} placeholder="youtube,tags" className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-gray-600">Thumbnail URL</label>
                        <input type="text" value={activeOverride?.thumbnail || ''} onChange={(e) => updateOverrideValue(activeTab, 'thumbnail', e.target.value)} placeholder="https://..." className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Playlist</label>
                        <input type="text" placeholder="Tutorials" value={activeOverride?.settings?.playlist || ''} onChange={(e) => updateOverrideSetting(activeTab, 'playlist', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none text-gray-700 font-semibold focus:ring-1 focus:ring-brand-500/30 focus:border-brand-400" />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</label>
                        <select value={activeOverride?.settings?.category || 'People & Blogs'} onChange={(e) => updateOverrideSetting(activeTab, 'category', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none text-gray-700 font-semibold cursor-pointer">
                          <option>Entertainment</option><option>Education</option><option>People & Blogs</option><option>Howto & Style</option><option>Science & Technology</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Audience</label>
                        <select value={activeOverride?.settings?.audience || 'Not Made for Kids'} onChange={(e) => updateOverrideSetting(activeTab, 'audience', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none text-gray-700 font-semibold cursor-pointer">
                          <option>Not Made for Kids</option><option>Made for Kids</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Visibility</label>
                        <select value={activeOverride?.settings?.visibility || 'public'} onChange={(e) => updateOverrideSetting(activeTab, 'visibility', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-none text-gray-700 font-semibold cursor-pointer">
                          <option value="public">Public</option><option value="private">Private</option><option value="unlisted">Unlisted</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI Assist Panel */}
          <AnimatePresence>
            {isAIOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-card space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-brand-500" /> AI Caption Templates</h4>
                    <button onClick={() => setIsAIOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: '🚀 Feature Launch', text: "Ready to elevate your workflow? Launching our brand new collaboration suite today! 🚀✨" },
                      { label: '📊 Marketing Tips', text: "5 essential strategies for building production-ready social content pipelines. A full breakdown 👇🧵" },
                      { label: '💼 Professional', text: "Excited to share our latest milestone. Our team has been working tirelessly to deliver this innovation. #growth #leadership" },
                      { label: '🎯 Engagement', text: "Drop a 🔥 if you agree! What's your take on this approach? Let us know in the comments below 👇" },
                    ].map(t => (
                      <button
                        key={t.label}
                        onClick={() => { setContent(t.text); setIsAIOpen(false); }}
                        className="p-3 bg-gray-50 hover:bg-brand-50 border border-gray-200 hover:border-brand-200 rounded-xl text-left transition-colors cursor-pointer"
                      >
                        <span className="text-xs font-bold text-gray-700 block">{t.label}</span>
                        <span className="text-[10px] text-gray-400 mt-1 block line-clamp-2">{t.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Scheduling Card ─────────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-card p-5 space-y-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 text-left">
              <CalendarIcon className="w-4 h-4 text-brand-500" /> Scheduling & Publishing
            </h4>

            <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl w-full sm:w-fit overflow-x-auto scrollbar-hide">
              <button onClick={() => setPublishMode('schedule')} className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer", publishMode === 'schedule' ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-700")}>
                <Clock className="w-3.5 h-3.5 inline mr-1" /> Schedule
              </button>
              <button onClick={() => setPublishMode('now')} className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer", publishMode === 'now' ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-700")}>
                <Zap className="w-3.5 h-3.5 inline mr-1" /> Publish Now
              </button>
            </div>

            {publishMode === 'schedule' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-600">Date & Time</label>
                  <input type="datetime-local" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 cursor-pointer" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-600">Timezone</label>
                  <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 font-semibold focus:outline-none cursor-pointer">
                    <option value="UTC">UTC</option><option value="EST">EST</option><option value="PST">PST</option><option value="IST">IST</option><option value="CET">CET</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-600">Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 font-semibold focus:outline-none cursor-pointer">
                    <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ╔═══════════════════════════════════════════════════════╗ */}
      {/* ║  RIGHT SIDEBAR – Live Preview                        ║ */}
      {/* ╚═══════════════════════════════════════════════════════╝ */}
      <div className={cn(
        "flex flex-col w-full lg:w-[400px] bg-white border-t lg:border-t-0 lg:border-l border-gray-200 shrink-0 overflow-hidden min-h-[calc(100dvh-3.5rem)] lg:min-h-0 lg:h-full",
        mobileStudioView === 'editor' && "hidden lg:flex"
      )}>
        {/* Preview Header */}
        <div className="p-4 border-b border-gray-100 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-brand-500" /> Live Preview
            </h3>
            <div className="flex items-center gap-1 p-0.5 bg-gray-100 rounded-lg">
              <button onClick={() => setPreviewDevice('mobile')} className={cn("p-1 rounded-md transition-colors cursor-pointer", previewDevice === 'mobile' ? "bg-white shadow-xs text-gray-900" : "text-gray-400")}>
                <Smartphone className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setPreviewDevice('desktop')} className={cn("p-1 rounded-md transition-colors cursor-pointer", previewDevice === 'desktop' ? "bg-white shadow-xs text-gray-900" : "text-gray-400")}>
                <Monitor className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Platform preview tabs */}
          {selectedPlatforms.length > 0 && (
            <div className="flex gap-1">
              {[...new Set(selectedPlatforms)].map(p => (
                <button
                  key={p}
                  onClick={() => setActivePreviewPlatform(p)}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer",
                    activePreviewPlatform === p
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                  )}
                >
                  <PlatformIcon platform={p} size="xs" className="w-3 h-3" />
                  {p.charAt(0) + p.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto p-4 pb-bottom-nav lg:pb-4">
          {selectedAccountIds.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                <Eye className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-500">No accounts selected</p>
              <p className="text-xs text-gray-400 mt-1">Select publishing targets to see live previews</p>
            </div>
          ) : (
            <div className={cn("mx-auto space-y-5", previewDevice === 'mobile' ? "max-w-[320px]" : "max-w-full")}>
              {selectedAccountsData
                .filter((acc: any) => acc.platform?.toUpperCase() === activePreviewPlatform)
                .map((acc: any) => {
                  const override = getOverrideForAccount(acc.id);
                  let previewCaption = override.caption || content || 'Start typing to see a live preview...';
                  const previewTags = override.hashtags || '';
                  if (acc.platform === 'YOUTUBE') {
                    const title = override.settings?.title || 'Untitled Video';
                    previewCaption = `${title}\n\n${previewCaption}`;
                  }
                  const previewMedia = mediaFiles.length > 0 ? mediaFiles[0].url : null;

                  // 1. STORY Mockup
                  if (contentType === 'STORY') {
                    return (
                      <div key={acc.id} className="bg-gray-950 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl relative aspect-[9/16] flex flex-col justify-between p-4 text-white text-left">
                        {/* Top Segmented Progress Bar & Creator info */}
                        <div className="z-10 space-y-2">
                          <div className="flex gap-1 w-full">
                            <div className="h-0.5 bg-white/90 rounded-full flex-1" />
                            <div className="h-0.5 bg-white/30 rounded-full flex-1" />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar name={acc.displayName || acc.username || acc.accountName} src={acc.profileImage || acc.avatar} size="sm" />
                              <div>
                                <p className="text-xs font-bold leading-tight drop-shadow-sm">{acc.username || acc.displayName}</p>
                                <p className="text-[9px] text-gray-300">Your Story · Just now</p>
                              </div>
                            </div>
                            <X className="w-4 h-4 text-white/70" />
                          </div>
                        </div>

                        {/* Media Background */}
                        {previewMedia ? (
                          mediaFiles[0]?.type === 'VIDEO' ? (
                            <video src={previewMedia} className="absolute inset-0 w-full h-full object-cover z-0" autoPlay loop muted />
                          ) : (
                            <img src={previewMedia} className="absolute inset-0 w-full h-full object-cover z-0" alt="" />
                          )
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 bg-gradient-to-b from-indigo-900 via-purple-900 to-black z-0">
                            <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                            <p className="text-xs font-semibold">Attach Story Media</p>
                          </div>
                        )}

                        {/* Optional Link Sticker Overlay */}
                        {override.settings?.linkUrl && (
                          <div className="z-10 self-center bg-white text-gray-900 px-3 py-1.5 rounded-full shadow-lg text-xs font-extrabold flex items-center gap-1.5 animate-bounce">
                            <ExternalLink className="w-3.5 h-3.5 text-brand-600" />
                            <span>{override.settings?.stickerText || 'Visit Link'}</span>
                          </div>
                        )}

                        {/* Bottom Message Input Bar */}
                        <div className="z-10 flex items-center gap-2 pt-2">
                          <div className="flex-1 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/20 text-xs text-white/80">
                            Send message...
                          </div>
                          <Heart className="w-5 h-5 text-white stroke-[2]" />
                          <Send className="w-5 h-5 text-white stroke-[2]" />
                        </div>
                      </div>
                    );
                  }

                  // 2. REEL Mockup
                  if (contentType === 'REEL') {
                    return (
                      <div key={acc.id} className="bg-black border border-gray-800 rounded-3xl overflow-hidden shadow-2xl relative aspect-[9/16] flex flex-col justify-between p-4 text-white text-left">
                        {/* Media Background */}
                        {previewMedia ? (
                          mediaFiles[0]?.type === 'VIDEO' ? (
                            <video src={previewMedia} className="absolute inset-0 w-full h-full object-cover z-0" autoPlay loop muted />
                          ) : (
                            <img src={previewMedia} className="absolute inset-0 w-full h-full object-cover z-0" alt="" />
                          )
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 bg-gradient-to-br from-gray-900 to-black z-0">
                            <Film className="w-10 h-10 mb-2 text-brand-400 opacity-60" />
                            <p className="text-xs font-semibold">Attach Reel Video File</p>
                          </div>
                        )}

                        {/* Reel Header */}
                        <div className="z-10 flex items-center justify-between text-xs font-bold drop-shadow-md">
                          <span>Reels</span>
                          <Camera className="w-5 h-5" />
                        </div>

                        {/* Right Floating Actions */}
                        <div className="absolute right-3 bottom-16 z-10 flex flex-col items-center gap-5 text-white">
                          <div className="flex flex-col items-center gap-1 cursor-pointer">
                            <Heart className="w-6 h-6 stroke-[2]" />
                            <span className="text-[10px] font-bold">12.4k</span>
                          </div>
                          <div className="flex flex-col items-center gap-1 cursor-pointer">
                            <MessageCircle className="w-6 h-6 stroke-[2]" />
                            <span className="text-[10px] font-bold">482</span>
                          </div>
                          <div className="flex flex-col items-center gap-1 cursor-pointer">
                            <Send className="w-6 h-6 stroke-[2]" />
                            <span className="text-[10px] font-bold">Share</span>
                          </div>
                          <Avatar name={acc.displayName || acc.username || acc.accountName} src={acc.profileImage || acc.avatar} size="xs" className="animate-spin-slow border-2 border-white" />
                        </div>

                        {/* Bottom Creator Info & Caption */}
                        <div className="z-10 space-y-2 pr-12 text-left bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 -mx-4 -mb-4 rounded-b-3xl">
                          <div className="flex items-center gap-2">
                            <Avatar name={acc.displayName || acc.username || acc.accountName} src={acc.profileImage || acc.avatar} size="xs" className="border border-white/40" />
                            <span className="text-xs font-extrabold">{acc.username || acc.displayName}</span>
                            <button className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-bold border border-white/30">Follow</button>
                          </div>
                          <p className="text-xs text-white/90 line-clamp-2 leading-relaxed">
                            {previewCaption} {previewTags}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-white/80 font-medium">
                            <Music className="w-3 h-3 animate-pulse" />
                            <span className="truncate">{override.settings?.audioTrack || `Original Audio - ${acc.username || acc.displayName}`}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // 3. CAROUSEL Mockup
                  if (contentType === 'CAROUSEL') {
                    return (
                      <div key={acc.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-card text-left">
                        <div className="px-3.5 py-2.5 border-b border-gray-100 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <PlatformIcon platform={acc.platform} size="xs" className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{acc.platform} · Carousel</span>
                          </div>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                            {mediaFiles.length || 1} Cards
                          </span>
                        </div>

                        <div className="p-4 space-y-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={acc.displayName || acc.username || acc.accountName} src={acc.profileImage || acc.avatar} size="sm" />
                            <div className="min-w-0 text-left">
                              <p className="text-xs font-bold text-gray-900 truncate">{acc.displayName}</p>
                              <p className="text-[10px] text-gray-400">@{acc.username}</p>
                            </div>
                          </div>

                          <div className="relative rounded-xl overflow-hidden bg-gray-100 border border-gray-100 aspect-square">
                            {previewMedia ? (
                              <img src={previewMedia} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                <Layers className="w-8 h-8 mb-1 text-brand-300" />
                                <span className="text-xs font-bold">Add 2+ Media Cards</span>
                              </div>
                            )}
                            <div className="absolute top-2.5 right-2.5 bg-black/70 text-white px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-xs">
                              1/{mediaFiles.length || 1}
                            </div>
                            <div className="absolute bottom-2.5 inset-x-0 flex justify-center gap-1">
                              {(mediaFiles.length > 0 ? mediaFiles : [1, 2, 3]).map((_, idx) => (
                                <div key={idx} className={cn("w-1.5 h-1.5 rounded-full transition-all", idx === 0 ? "bg-brand-500 w-3" : "bg-white/60")} />
                              ))}
                            </div>
                          </div>

                          <p className="text-[13px] text-gray-800 whitespace-pre-wrap leading-relaxed text-left">
                            {previewCaption} {previewTags && <span className="text-blue-500 font-medium"> {previewTags}</span>}
                          </p>

                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-4 text-gray-400">
                              <Heart className="w-4 h-4" /><MessageCircle className="w-4 h-4" /><Send className="w-4 h-4" />
                            </div>
                            <Bookmark className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // 4. Standard FEED_POST Mockup
                  return (
                    <div key={acc.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-card text-left">
                      {/* Platform header bar */}
                      <div className="px-3.5 py-2.5 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <PlatformIcon platform={acc.platform} size="xs" className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{acc.platform} · Feed Post</span>
                        </div>
                        {override.caption && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">Override</span>
                        )}
                      </div>

                      {/* Post mockup */}
                      <div className="p-4 space-y-3">
                        {/* Author */}
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                            <img src={acc.profileImage || acc.avatar || `https://i.pravatar.cc/80?u=${acc.id}`} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0 text-left">
                            <p className="text-xs font-bold text-gray-900 truncate">{acc.displayName}</p>
                            <p className="text-[10px] text-gray-400">@{acc.username} · Just now</p>
                          </div>
                          <MoreHorizontal className="w-4 h-4 text-gray-300 ml-auto shrink-0" />
                        </div>

                        {/* Caption */}
                        <p className="text-[13px] text-gray-800 whitespace-pre-wrap leading-relaxed text-left">
                          {previewCaption}
                          {previewTags && <span className="text-blue-500 font-medium"> {previewTags}</span>}
                        </p>

                        {/* Media */}
                        {previewMedia && (
                          <div className="rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                            {mediaFiles[0]?.type === 'VIDEO' ? (
                              <video src={previewMedia} className="w-full aspect-video object-cover" controls />
                            ) : (
                              <img src={previewMedia} alt="" className="w-full aspect-square object-cover" />
                            )}
                          </div>
                        )}

                        {!previewMedia && (
                          <div className="rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 aspect-square flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-gray-300" />
                          </div>
                        )}

                        {/* Engagement mock */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-4">
                            <Heart className="w-4 h-4 text-gray-400" />
                            <MessageCircle className="w-4 h-4 text-gray-400" />
                            <Send className="w-4 h-4 text-gray-400" />
                          </div>
                          <Bookmark className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  );
                })}

              {selectedAccountsData.filter((acc: any) => acc.platform?.toUpperCase() === activePreviewPlatform).length === 0 && (
                <div className="text-center py-12 text-xs text-gray-400">No accounts on this platform selected.</div>
              )}
            </div>
          )}
          {/* ── Schedit Assets Picker Modal ── */}
          <AnimatePresence>
            {isMediaPickerOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="w-full h-full sm:h-auto sm:max-w-4xl bg-white p-4 sm:p-6 rounded-none sm:rounded-2xl shadow-2xl text-left border border-gray-200 flex flex-col max-h-[100dvh] sm:max-h-[85vh] overflow-hidden sm:mx-4"
                >
                  {/* Modal Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-gray-150 shrink-0">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 font-display">Choose From Schedit Assets</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Select pre-uploaded library assets to link directly to this post.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setIsMediaPickerOpen(false); setPickerSelectedIds([]); }}
                      className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Filters & Search */}
                  <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 shrink-0 bg-white">
                    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
                      {['all', 'image', 'video'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setPickerType(type)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer",
                            pickerType === type
                              ? "bg-brand-50 text-brand-700 border border-brand-100 font-bold"
                              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                          )}
                        >
                          {type === 'all' ? 'All Assets' : type + 's'}
                        </button>
                      ))}
                    </div>
                    
                    <div className="relative w-full sm:max-w-xs sm:flex-1">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={pickerSearch}
                        onChange={(e) => setPickerSearch(e.target.value)}
                        placeholder="Search asset catalog..."
                        className="pl-9 pr-4 py-1.5 w-full bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 shadow-sm transition-all"
                      />
                    </div>
                  </div>

                  {/* Assets Grid */}
                  <div className="flex-1 overflow-y-auto py-4 min-h-[300px] bg-gray-50/50 rounded-xl p-4 my-3 border border-gray-100">
                    {pickerLoading ? (
                      <div className="flex items-center justify-center h-full min-h-[250px]">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-7 h-7 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
                          <span className="text-xs text-gray-500">Querying Schedit media catalog...</span>
                        </div>
                      </div>
                    ) : pickerAssets.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full min-h-[250px] text-center">
                        <ImageIcon className="w-8 h-8 text-gray-300 mb-2" />
                        <p className="text-xs font-bold text-gray-700">No assets matching criteria</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Upload new files to Schedit Assets page first.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {pickerAssets.map((asset) => {
                          const isSelected = pickerSelectedIds.includes(asset.id);
                          const isVideo = asset.assetType === 'VIDEO' || asset.resourceType === 'video';

                          return (
                            <div
                              key={asset.id}
                              onClick={() => {
                                setPickerSelectedIds((prev) =>
                                  isSelected ? prev.filter((id) => id !== asset.id) : [...prev, asset.id]
                                );
                              }}
                              className={cn(
                                "relative aspect-square rounded-xl overflow-hidden bg-white border shadow-2xs transition-all duration-200 cursor-pointer flex flex-col justify-between group",
                                isSelected ? "border-brand-500 ring-2 ring-brand-500/20" : "border-gray-200 hover:border-gray-300"
                              )}
                            >
                              <div className="flex-1 bg-gray-50 relative overflow-hidden flex items-center justify-center">
                                {isVideo ? (
                                  <div className="w-full h-full relative">
                                    <img 
                                      src={asset.secureUrl.replace(/\.[^/.]+$/, '.jpg')} 
                                      alt="" 
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as any).src = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150';
                                      }}
                                    />
                                    <div className="absolute inset-0 m-auto w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white border border-white/20">
                                      <span className="text-[8px] pl-0.5">▶</span>
                                    </div>
                                  </div>
                                ) : (
                                  <img
                                    src={asset.secureUrl.replace('/upload/', '/upload/w_180,h_180,c_fill/')}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                )}

                                {/* Checkbox Overlay */}
                                <div className="absolute top-2 left-2 z-10">
                                  <span className={cn(
                                    "w-4.5 h-4.5 rounded-md flex items-center justify-center border transition-all text-white",
                                    isSelected ? "bg-brand-600 border-brand-600" : "bg-white/80 border-gray-300 group-hover:bg-white"
                                  )}>
                                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                  </span>
                                </div>

                                {/* Details Overlay on hover */}
                                <div className="absolute bottom-0 inset-x-0 bg-black/60 p-1.5 text-left opacity-0 group-hover:opacity-100 transition-opacity">
                                  <p className="text-white text-[9px] font-bold truncate">{asset.publicId.split('/').pop()}</p>
                                  <p className="text-gray-300 text-[8px] mt-0.5">{Math.round(asset.bytes / 1024)} KB · {asset.format.toUpperCase()}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3 pt-4 border-t border-gray-150 shrink-0">
                    <span className="text-xs font-semibold text-gray-500 sm:mr-auto">{pickerSelectedIds.length} assets selected</span>
                    <button
                      type="button"
                      onClick={() => { setIsMediaPickerOpen(false); setPickerSelectedIds([]); }}
                      className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 cursor-pointer min-h-[44px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={pickerSelectedIds.length === 0}
                      onClick={() => {
                        const selectedAssets = pickerAssets.filter(a => pickerSelectedIds.includes(a.id));
                        selectedAssets.forEach(asset => {
                          if (!mediaFiles.some(m => m.id === asset.id || m.publicId === asset.publicId)) {
                            setMediaFiles(prev => [...prev, {
                              id: asset.id,
                              url: asset.secureUrl,
                              type: asset.assetType === 'VIDEO' ? 'VIDEO' : 'IMAGE',
                              name: asset.publicId.split('/').pop() || 'asset',
                              size: asset.bytes,
                              publicId: asset.publicId,
                              secureUrl: asset.secureUrl,
                              resourceType: asset.resourceType,
                              width: asset.width,
                              height: asset.height,
                              duration: asset.duration,
                              format: asset.format,
                            }]);
                          }
                        });
                        setIsMediaPickerOpen(false);
                        setPickerSelectedIds([]);
                        toastSuccess('Assets Attached', `${selectedAssets.length} library assets successfully linked.`);
                      }}
                      className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                    >
                      Add Selected Assets
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
export default CreatePost;
