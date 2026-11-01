import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Upload, Filter, Search, Image as ImageIcon, MoreVertical, Folder, Tag, Star, Archive,
  Trash2, Copy, Download, Edit2, RotateCw, Sparkles, LayoutGrid, CheckSquare, Square,
  X, ChevronRight, Video, FileText, Music, Info, HelpCircle, Save, Sliders, ExternalLink
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useToast } from '../components/ui/Toast';
import { useCloudinaryUpload } from '../hooks/useCloudinaryUpload';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

// Preset Folder list based on Cloudinary Folder Structure
const PRESET_FOLDERS = [
  'all',
  'drafts',
  'published',
  'review-assets',
  'profiles',
  'logos',
  'thumbnails',
  'stories',
  'reels',
  'videos',
  'documents'
];

export function MediaLibrary() {
  const { currentProject } = useWorkspace();
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();
  
  // States
  const [assets, setAssets] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'favorites' | 'archived'>('all');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  
  // Selection & Queue States
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeAsset, setActiveAsset] = useState<any | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folders, setFolders] = useState<string[]>(PRESET_FOLDERS);

  // Rename States
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  // Asset Usage States
  const [usage, setUsage] = useState<{ posts: any[]; platforms: string[] } | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);
  
  // Upload hooks
  const { uploadQueue, uploadFiles, pauseUpload, resumeUpload, cancelUpload, retryUpload } = useCloudinaryUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  // Transformation Editor States
  const [transformPreset, setTransformPreset] = useState('none');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [blur, setBlur] = useState(0);
  const [rotate, setRotate] = useState(0);
  const [textOverlay, setTextOverlay] = useState('');
  const [watermark, setWatermark] = useState(false);
  const [aiEnhance, setAiEnhance] = useState(false);
  const [cropMode, setCropMode] = useState('fill');

  // Fetch usage details
  useEffect(() => {
    if (!activeAsset || !currentProject) {
      setUsage(null);
      return;
    }
    const fetchUsage = async () => {
      setUsageLoading(true);
      try {
        const res = await apiRequest(`/api/v1/projects/${currentProject.id}/assets/${activeAsset.id}/usage`);
        setUsage(res);
      } catch (err) {
        console.warn('Could not fetch asset usage:', err);
      } finally {
        setUsageLoading(false);
      }
    };
    fetchUsage();
    setRenameValue(activeAsset.publicId.split('/').pop() || '');
    setIsRenaming(false);
  }, [activeAsset, currentProject]);

  // Load assets
  const fetchAssets = async (pageNum = 1) => {
    if (!currentProject) return;
    setLoading(true);
    try {
      const isFav = selectedFilter === 'favorites' ? 'true' : undefined;
      const isArc = selectedFilter === 'archived' ? 'true' : 'false';
      const folderPath = selectedFolder === 'all' ? undefined : selectedFolder;

      let url = `/api/v1/projects/${currentProject.id}/assets?page=${pageNum}&limit=20&isArchived=${isArc}&type=${selectedType}&search=${search}&sortBy=${sortBy}`;
      if (isFav) url += `&isFavorite=${isFav}`;
      if (folderPath) url += `&folder=projects/${currentProject.id}/media/${folderPath}`;
      if (selectedTag) url += `&tag=${selectedTag}`;

      const res = await apiRequest(url);
      if (pageNum === 1) {
        setAssets(res.assets || []);
      } else {
        setAssets(prev => [...prev, ...(res.assets || [])]);
      }
      setTotal(res.total || 0);
    } catch (err: any) {
      toastError('Load Failed', err.message || 'Could not fetch content library assets.');
    } finally {
      setLoading(false);
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedFolder, selectedType, selectedFilter, selectedTag, search, sortBy]);

  // Fetch when page or parameters change
  useEffect(() => {
    fetchAssets(page);
  }, [currentProject, selectedFolder, selectedType, selectedFilter, selectedTag, search, sortBy, page]);

  // Sync upload queue completion to reload assets
  useEffect(() => {
    const hasCompleted = uploadQueue.some(item => item.status === 'completed');
    if (hasCompleted) {
      fetchAssets(page);
    }
  }, [uploadQueue]);

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (!currentProject) return;
    const uploadFolder = selectedFolder === 'all' ? `projects/${currentProject.id}/media` : `projects/${currentProject.id}/media/${selectedFolder}`;
    uploadFiles(e.dataTransfer.files, currentProject.id, uploadFolder);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !currentProject) return;
    const uploadFolder = selectedFolder === 'all' ? `projects/${currentProject.id}/media` : `projects/${currentProject.id}/media/${selectedFolder}`;
    uploadFiles(e.target.files, currentProject.id, uploadFolder);
  };

  // Bulk Actions
  const handleBulkAction = async (action: 'favorite' | 'archive' | 'restore' | 'delete', moveFolder?: string) => {
    if (!currentProject || selectedIds.length === 0) return;
    try {
      await apiRequest(`/api/v1/projects/${currentProject.id}/assets/bulk`, {
        method: 'POST',
        body: JSON.stringify({
          ids: selectedIds,
          action,
          payload: moveFolder ? { folder: `projects/${currentProject.id}/media/${moveFolder}` } : undefined
        }),
      });
      toastSuccess('Success', `Bulk action completed successfully.`);
      setSelectedIds([]);
      fetchAssets();
    } catch (err: any) {
      toastError('Bulk Action Failed', err.message);
    }
  };

  // Asset Specific Actions
  const toggleFavorite = async (asset: any) => {
    if (!currentProject) return;
    try {
      await apiRequest(`/api/v1/projects/${currentProject.id}/assets/${asset.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isFavorite: !asset.isFavorite }),
      });
      toastSuccess('Updated', asset.isFavorite ? 'Removed from Favorites' : 'Added to Favorites');
      fetchAssets();
      if (activeAsset?.id === asset.id) {
        setActiveAsset((prev: any) => ({ ...prev, isFavorite: !prev.isFavorite }));
      }
    } catch (err: any) {
      toastError('Update Failed', err.message);
    }
  };

  const toggleArchive = async (asset: any) => {
    if (!currentProject) return;
    try {
      await apiRequest(`/api/v1/projects/${currentProject.id}/assets/${asset.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isArchived: !asset.isArchived }),
      });
      toastSuccess('Updated', asset.isArchived ? 'Asset Restored' : 'Asset Archived');
      fetchAssets();
      setIsDetailsOpen(false);
    } catch (err: any) {
      toastError('Update Failed', err.message);
    }
  };

  const deleteSingleAsset = async (asset: any) => {
    if (!currentProject) return;
    try {
      await apiRequest(`/api/v1/projects/${currentProject.id}/assets/${asset.id}`, {
        method: 'DELETE',
      });
      toastSuccess('Deleted', 'Asset permanently deleted.');
      fetchAssets();
      setIsDetailsOpen(false);
    } catch (err: any) {
      toastError('Delete Failed', err.message);
    }
  };

  const handleRename = async (asset: any, newName: string) => {
    if (!currentProject || !newName.trim()) return;
    try {
      const newPublicId = asset.publicId.substring(0, asset.publicId.lastIndexOf('/') + 1) + newName.trim();
      await apiRequest(`/api/v1/projects/${currentProject.id}/assets/${asset.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ publicId: newPublicId }),
      });
      toastSuccess('Renamed', 'Asset name updated.');
      fetchAssets();
      setActiveAsset((prev: any) => ({ ...prev, publicId: newPublicId }));
    } catch (err: any) {
      toastError('Rename Failed', err.message);
    }
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const cleanFolder = newFolderName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    if (!folders.includes(cleanFolder)) {
      setFolders((prev) => [...prev, cleanFolder]);
      setSelectedFolder(cleanFolder);
    }
    setNewFolderName('');
    setIsCreateFolderOpen(false);
  };

  // Generate URL based on selected transformation choices
  const transformedUrl = useMemo(() => {
    if (!activeAsset) return '';
    
    // Check base URL
    const urlParts = activeAsset.secureUrl.split('/upload/');
    if (urlParts.length !== 2) return activeAsset.secureUrl;

    const transforms = [];

    // 1. Preset Aspect Ratios / Social Sizes
    if (transformPreset === 'instagram_feed') transforms.push('w_1080,h_1080,c_fill');
    else if (transformPreset === 'instagram_story') transforms.push('w_1080,h_1920,c_fill');
    else if (transformPreset === 'facebook_feed') transforms.push('w_1200,h_630,c_fill');
    else if (transformPreset === 'linkedin_post') transforms.push('w_1200,h_627,c_fill');
    else if (transformPreset === 'youtube_thumb') transforms.push('w_1280,h_720,c_fill');
    else if (cropMode !== 'fill') transforms.push(`c_${cropMode}`);

    // 2. Adjustments
    if (brightness !== 100) transforms.push(`e_brightness:${brightness - 100}`);
    if (contrast !== 100) transforms.push(`e_contrast:${contrast - 100}`);
    if (blur > 0) transforms.push(`e_blur:${blur * 10}`);
    if (rotate !== 0) transforms.push(`a_${rotate}`);
    if (aiEnhance) transforms.push('e_improve');

    // 3. Overlays
    if (textOverlay.trim()) {
      const escapedText = encodeURIComponent(textOverlay.trim()).replace(/%2C/g, '%252C');
      transforms.push(`l_text:Arial_30_bold:${escapedText},co_white,g_south,y_20`);
    }

    if (watermark) {
      transforms.push('l_lut,w_100,o_30,g_north_east,x_10,y_10');
    }

    // Auto quality & format
    transforms.push('f_auto,q_auto');

    return `${urlParts[0]}/upload/${transforms.join('/')}/${urlParts[1]}`;
  }, [activeAsset, transformPreset, brightness, contrast, blur, rotate, textOverlay, watermark, aiEnhance, cropMode]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toastSuccess('Copied', 'Secure URL copied to clipboard.');
  };

  const downloadAsset = async (asset: any) => {
    try {
      const link = document.createElement('a');
      link.href = asset.secureUrl;
      link.setAttribute('download', asset.publicId.split('/').pop() || 'download');
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      toastError('Download failed', 'Please copy URL and open in browser to download.');
    }
  };

  // Reset transformation controls
  const resetTransformations = () => {
    setTransformPreset('none');
    setBrightness(100);
    setContrast(100);
    setBlur(0);
    setRotate(0);
    setTextOverlay('');
    setWatermark(false);
    setAiEnhance(false);
    setCropMode('fill');
  };

  // Filter tags list from current assets to build Tag Cloud
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    assets.forEach(a => {
      if (Array.isArray(a.tags)) {
        a.tags.forEach((t: string) => tagsSet.add(t));
      }
    });
    return Array.from(tagsSet);
  }, [assets]);

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] lg:h-[calc(100vh-3.5rem)] flex flex-col lg:flex-row bg-[var(--neu-bg)] w-full overflow-x-hidden lg:overflow-hidden text-left font-sans select-none relative p-3 sm:p-4 gap-4">
      
      {/* ── SIDE PANEL ─────────────────────────────────────────── */}
      <div className="w-full lg:w-64 neu-card rounded-2xl flex flex-col shrink-0 max-h-72 lg:max-h-none overflow-hidden">
        <div className="p-4 shrink-0 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
          <span className="text-xs font-bold text-[var(--neu-text-secondary)] uppercase tracking-wider">Content Library</span>
          <button 
            onClick={() => setIsCreateFolderOpen(true)}
            className="p-1.5 neu-raised hover:neu-raised-lg rounded-xl text-blue-600 cursor-pointer"
            title="Create Folder"
          >
            <Folder className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3.5 space-y-4 lg:space-y-6">
          {/* Folders Navigation */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-[var(--neu-text-secondary)] uppercase tracking-wider pl-2.5">Folders</p>
            {folders.map((fold) => (
              <button
                key={fold}
                onClick={() => { setSelectedFolder(fold); setSelectedTag(''); }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer capitalize",
                  selectedFolder === fold 
                    ? "neu-button-primary text-white" 
                    : "text-[var(--neu-text-secondary)] hover:text-[var(--neu-text-primary)] hover:bg-black/5 dark:hover:bg-white/5"
                )}
              >
                <Folder className={cn("w-4 h-4 shrink-0", selectedFolder === fold ? "text-white" : "text-gray-400")} />
                <span className="truncate">{fold === 'all' ? 'All Workspace Assets' : fold}</span>
              </button>
            ))}
          </div>

          {/* Quick Filters */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-[var(--neu-text-secondary)] uppercase tracking-wider pl-2.5">Quick Filters</p>
            {[
              { id: 'all', label: 'All Library Assets', icon: LayoutGrid },
              { id: 'favorites', label: 'Favorites', icon: Star },
              { id: 'archived', label: 'Archived Assets', icon: Archive }
            ].map((filt) => (
              <button
                key={filt.id}
                onClick={() => setSelectedFilter(filt.id as any)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer",
                  selectedFilter === filt.id
                    ? "neu-button-primary text-white"
                    : "text-[var(--neu-text-secondary)] hover:text-[var(--neu-text-primary)] hover:bg-black/5 dark:hover:bg-white/5"
                )}
              >
                <filt.icon className={cn("w-4 h-4 shrink-0", selectedFilter === filt.id ? "text-white" : "text-gray-400")} />
                <span>{filt.label}</span>
              </button>
            ))}
          </div>

          {/* Asset Type */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-[var(--neu-text-secondary)] uppercase tracking-wider pl-2.5">Asset Type</p>
            {[
              { id: 'all', label: 'All Types', icon: LayoutGrid },
              { id: 'image', label: 'Images', icon: ImageIcon },
              { id: 'video', label: 'Videos', icon: Video },
              { id: 'raw', label: 'Documents', icon: FileText },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer",
                  selectedType === t.id
                    ? "neu-button-primary text-white"
                    : "text-[var(--neu-text-secondary)] hover:text-[var(--neu-text-primary)] hover:bg-black/5 dark:hover:bg-white/5"
                )}
              >
                <t.icon className={cn("w-4 h-4 shrink-0", selectedType === t.id ? "text-white" : "text-gray-400")} />
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Tags Cloud */}
          {allTags.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-[var(--neu-text-secondary)] uppercase tracking-wider pl-2.5">Tags</p>
              <div className="flex flex-wrap gap-1.5 pl-2.5">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer",
                      selectedTag === tag
                        ? "neu-button-primary text-white"
                        : "neu-inset text-[var(--neu-text-secondary)]"
                    )}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 neu-card rounded-2xl overflow-y-auto lg:overflow-hidden">
        
        {/* Sub-header controls */}
        <div className="p-4 border-b border-black/5 dark:border-white/5 flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[var(--neu-text-primary)] tracking-tight capitalize">
              {selectedFolder === 'all' ? 'All Assets' : selectedFolder}
            </h2>
            <span className="neu-inset text-blue-600 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
              {total} Assets
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="neu-input px-3 py-2 text-xs font-bold"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
              <option value="size_desc">Size (Large to Small)</option>
              <option value="size_asc">Size (Small to Large)</option>
            </select>

            <div className="relative w-full sm:max-w-xs sm:flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search assets..."
                className="neu-input pl-9 pr-4 py-2 w-full text-xs"
              />
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="neu-button-primary px-4 py-2 text-xs font-bold text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Asset
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              multiple
            />
          </div>
        </div>

        {/* Bulk action selection bar */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="fixed sm:static left-4 right-4 bottom-[calc(76px+env(safe-area-inset-bottom,0px))] sm:bottom-auto z-30 bg-brand-50 border border-brand-100 sm:border-x-0 px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 overflow-hidden rounded-2xl sm:rounded-none shadow-modal sm:shadow-none"
            >
              <div className="flex flex-wrap items-center gap-2">
                <CheckSquare className="w-4.5 h-4.5 text-brand-600" />
                <span className="text-xs font-bold text-brand-800">{selectedIds.length} Assets selected</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkAction('favorite')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-brand-700 bg-white border border-brand-200 rounded-lg hover:bg-brand-100 transition-all cursor-pointer"
                >
                  <Star className="w-3.5 h-3.5" /> Favorite
                </button>
                <button
                  onClick={() => handleBulkAction(selectedFilter === 'archived' ? 'restore' : 'archive')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-brand-700 bg-white border border-brand-200 rounded-lg hover:bg-brand-100 transition-all cursor-pointer"
                >
                  <Archive className="w-3.5 h-3.5" /> {selectedFilter === 'archived' ? 'Restore' : 'Archive'}
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-white bg-red-600 rounded-lg hover:bg-red-500 transition-all cursor-pointer border border-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Permanently
                </button>
                <button
                  onClick={() => setSelectedIds([])}
                  className="p-1 hover:bg-brand-100 rounded-md text-brand-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload progress queue */}
        {uploadQueue.length > 0 && (
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 max-h-36 overflow-y-auto">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-left mb-2">Upload Progress Queue</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {uploadQueue.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-gray-200 shadow-2xs">
                  <div className="w-8 h-8 rounded bg-gray-50 flex items-center justify-center shrink-0">
                    {item.type.startsWith('video/') ? (
                      <Video className="w-4 h-4 text-brand-500" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-indigo-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-gray-700 truncate">{item.name}</p>
                      <span className="text-[9px] font-bold text-gray-500">
                        {item.status === 'completed' ? 'Uploaded' : item.status === 'failed' ? 'Failed' : `${item.progress}%`}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 h-1 rounded-full mt-1 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          item.status === 'failed' ? "bg-red-500" : item.status === 'completed' ? "bg-emerald-500" : "bg-brand-500"
                        )}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {item.status === 'uploading' && (
                      <button
                        type="button"
                        onClick={() => pauseUpload(item.id)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-500"
                      >
                        ||
                      </button>
                    )}
                    {item.status === 'paused' && (
                      <button
                        type="button"
                        onClick={() => resumeUpload(item.id)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-500"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {item.status !== 'completed' && (
                      <button
                        type="button"
                        onClick={() => cancelUpload(item.id)}
                        className="p-1 hover:bg-gray-100 rounded text-red-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex-1 overflow-y-auto p-6 relative transition-all duration-300",
            dragOver ? "bg-brand-50/50 border-2 border-dashed border-brand-400" : ""
          )}
        >
          {loading && assets.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[300px]">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
                <p className="text-xs text-gray-500 font-medium">Fetching Cloudinary CDN assets...</p>
              </div>
            </div>
          ) : assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] border border-dashed border-gray-200 rounded-2xl p-8 bg-white max-w-lg mx-auto my-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mb-3.5">
                <ImageIcon className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-gray-700">No assets found</p>
              <p className="text-xs text-gray-400 mt-1.5 max-w-sm">Drag and drop files here, or use the Upload Asset button to import images, videos, and documents directly to Cloudinary.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
              
              {/* Media Items */}
              {assets.map((asset) => {
                const isSelected = selectedIds.includes(asset.id);
                const isVideo = asset.assetType === 'VIDEO' || asset.resourceType === 'video';
                const isDoc = asset.assetType === 'RAW' || asset.resourceType === 'raw';

                return (
                  <div
                    key={asset.id}
                    onClick={() => {
                      setActiveAsset(asset);
                      setIsDetailsOpen(true);
                      resetTransformations();
                    }}
                    className={cn(
                      "group relative aspect-square rounded-2xl overflow-hidden neu-card p-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between",
                      isSelected ? "ring-2 ring-blue-500/60 shadow-md" : "hover:neu-card-hover"
                    )}
                  >
                    {/* Thumbnail render */}
                    <div className="flex-1 bg-gray-50 relative overflow-hidden flex items-center justify-center">
                      {isDoc ? (
                        <FileText className="w-12 h-12 text-gray-400" />
                      ) : isVideo ? (
                        <div className="w-full h-full relative">
                          {/* Use Cloudinary video poster snapshot */}
                          <img 
                            src={asset.secureUrl.replace(/\.[^/.]+$/, '.jpg')} 
                            alt="" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as any).src = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150';
                            }}
                          />
                          <div className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white border border-white/20">
                            <span className="text-[10px] font-mono pl-0.5">▶</span>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={asset.secureUrl.replace('/upload/', '/upload/w_200,h_200,c_fill/')}
                          alt=""
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}

                      {/* Hover Controls Overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedIds((prev) =>
                                isSelected ? prev.filter((id) => id !== asset.id) : [...prev, asset.id]
                              );
                            }}
                            className="p-1.5 bg-white/95 backdrop-blur-md rounded-lg text-gray-700 hover:bg-white shadow-sm"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-brand-600" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-400" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(asset);
                            }}
                            className="p-1.5 bg-white/95 backdrop-blur-md rounded-lg text-gray-700 hover:bg-white shadow-sm"
                          >
                            <Star className={cn("w-4 h-4", asset.isFavorite ? "text-amber-500 fill-amber-500" : "text-gray-400")} />
                          </button>
                        </div>
                        
                        <div className="text-left">
                          <p className="text-white text-[10px] font-bold truncate pr-6">
                            {asset.publicId.split('/').pop()}
                          </p>
                          <p className="text-gray-200 text-[8px] font-medium mt-0.5">
                            {Math.round(asset.bytes / 1024)} KB • {asset.format.toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

            </div>
          )}
          
          {assets.length < total && (
            <div className="flex justify-center mt-8 pb-12">
              <button
                onClick={() => setPage(prev => prev + 1)}
                disabled={loading}
                className="px-6 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More Assets'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── ASSET DETAIL & DYNAMIC TRANSFORMATION SIDEBAR ────────── */}
      <AnimatePresence>
        {isDetailsOpen && activeAsset && (
          <motion.div
            initial={{ x: 380, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 380, opacity: 0 }}
            className="fixed inset-0 lg:relative lg:inset-auto w-full lg:w-96 border-l border-black/5 dark:border-white/5 neu-card rounded-2xl flex flex-col shrink-0 z-40 lg:z-10"
          >
            <div className="p-4 border-b border-gray-150 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Info className="w-4.5 h-4.5 text-gray-500" />
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Asset Details</span>
              </div>
              <button 
                onClick={() => setIsDetailsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              
              {/* Asset Preview */}
              <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-200 relative flex items-center justify-center">
                {activeAsset.assetType === 'RAW' ? (
                  <FileText className="w-16 h-16 text-gray-300" />
                ) : activeAsset.assetType === 'VIDEO' ? (
                  <video 
                    src={transformedUrl || activeAsset.secureUrl} 
                    className="w-full h-full object-contain" 
                    controls 
                    key={transformedUrl} // force reload video on transform change
                  />
                ) : (
                  <img
                    src={transformedUrl || activeAsset.secureUrl}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              {/* Dynamic Transformation Editor Tab */}
              {activeAsset.assetType === 'IMAGE' && (
                <div className="bg-gray-50 rounded-xl border border-gray-150 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5 text-brand-600" /> Cloudinary Transformation Editor
                    </span>
                    {(transformPreset !== 'none' || brightness !== 100 || contrast !== 100 || blur > 0 || rotate !== 0 || textOverlay || watermark || aiEnhance) && (
                      <button 
                        onClick={resetTransformations}
                        className="text-[9px] font-bold text-red-600 hover:underline"
                      >
                        Reset All
                      </button>
                    )}
                  </div>

                  {/* Preset Crops */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Social Presets</label>
                    <select
                      value={transformPreset}
                      onChange={(e) => setTransformPreset(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    >
                      <option value="none">No Preset (Original)</option>
                      <option value="instagram_feed">Instagram Feed (1080 x 1080 Fill)</option>
                      <option value="instagram_story">Instagram Story / Reels (1080 x 1920 Fill)</option>
                      <option value="facebook_feed">Facebook Post (1200 x 630 Fit)</option>
                      <option value="linkedin_post">LinkedIn Article (1200 x 627 Fill)</option>
                      <option value="youtube_thumb">YouTube Thumbnail (1280 x 720 Fill)</option>
                    </select>
                  </div>

                  {/* Manual Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-gray-500">Brightness ({brightness}%)</label>
                      <input 
                        type="range" min="50" max="150" value={brightness} 
                        onChange={(e) => setBrightness(parseInt(e.target.value))}
                        className="w-full accent-brand-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-gray-500">Contrast ({contrast}%)</label>
                      <input 
                        type="range" min="50" max="150" value={contrast} 
                        onChange={(e) => setContrast(parseInt(e.target.value))}
                        className="w-full accent-brand-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-gray-500">Blur ({blur})</label>
                      <input 
                        type="range" min="0" max="10" value={blur} 
                        onChange={(e) => setBlur(parseInt(e.target.value))}
                        className="w-full accent-brand-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-gray-500">Rotation ({rotate}°)</label>
                      <select
                        value={rotate}
                        onChange={(e) => setRotate(parseInt(e.target.value))}
                        className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-xs"
                      >
                        <option value={0}>0°</option>
                        <option value={90}>90° CW</option>
                        <option value={180}>180°</option>
                        <option value={270}>270° CW</option>
                      </select>
                    </div>
                  </div>

                  {/* Overlays */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Text Banner Overlay</label>
                    <input
                      type="text"
                      value={textOverlay}
                      onChange={(e) => setTextOverlay(e.target.value)}
                      placeholder="Add overlay text..."
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  </div>

                  {/* AI & Overlay Toggles */}
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                      <input 
                        type="checkbox" checked={aiEnhance} 
                        onChange={(e) => setAiEnhance(e.target.checked)}
                        className="rounded text-brand-600 border-gray-300"
                      />
                      <span>AI Enhance</span>
                    </label>

                    <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                      <input 
                        type="checkbox" checked={watermark} 
                        onChange={(e) => setWatermark(e.target.checked)}
                        className="rounded text-brand-600 border-gray-300"
                      />
                      <span>Watermark</span>
                    </label>
                  </div>

                  {/* Copy Transformed Action */}
                  <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                    <button
                      onClick={() => copyToClipboard(transformedUrl)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-500 transition-all cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy Transformed URL
                    </button>
                    <button
                      onClick={() => window.open(transformedUrl, '_blank')}
                      className="p-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 rounded-lg"
                      title="Open in new window"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Asset Metadata Info */}
              <div className="space-y-3.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block text-left">Information</span>
                <div className="space-y-2 text-xs divide-y divide-gray-100">
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-gray-400">File Name</span>
                    {isRenaming ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs w-32 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            handleRename(activeAsset, renameValue);
                            setIsRenaming(false);
                          }}
                          className="text-[10px] font-bold text-brand-600 hover:underline"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsRenaming(false)}
                          className="text-[10px] font-bold text-gray-400 hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-gray-700 truncate max-w-[150px]">{activeAsset.publicId.split('/').pop()}</span>
                        <button
                          type="button"
                          onClick={() => setIsRenaming(true)}
                          className="text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-gray-400">Format</span>
                    <span className="font-semibold text-gray-700 uppercase">{activeAsset.format}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-gray-400">File Size</span>
                    <span className="font-semibold text-gray-700">{Math.round(activeAsset.bytes / 1024)} KB</span>
                  </div>
                  {activeAsset.width && activeAsset.height && (
                    <div className="flex justify-between py-1.5">
                      <span className="text-gray-400">Dimensions</span>
                      <span className="font-semibold text-gray-700">{activeAsset.width} × {activeAsset.height} px</span>
                    </div>
                  )}
                  {activeAsset.duration && (
                    <div className="flex justify-between py-1.5">
                      <span className="text-gray-400">Duration</span>
                      <span className="font-semibold text-gray-700">{Math.round(activeAsset.duration)} seconds</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1.5">
                    <span className="text-gray-400">Folder</span>
                    <span className="font-semibold text-gray-700 truncate max-w-[200px]">{activeAsset.folder || 'Root'}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-gray-400">Asset Public ID</span>
                    <span className="font-mono text-[10px] text-gray-600 truncate max-w-[200px]">{activeAsset.publicId}</span>
                  </div>
                </div>
              </div>

              {/* Asset Usage section */}
              <div className="space-y-3.5 pt-4 border-t border-gray-150">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block text-left">Asset Usage</span>
                {usageLoading ? (
                  <p className="text-xs text-gray-400 text-left">Loading usage details...</p>
                ) : usage ? (
                  <div className="space-y-2.5 text-xs text-left">
                    <div>
                      <span className="text-gray-400 block mb-1">Platforms Where Used</span>
                      {usage.platforms.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {usage.platforms.map((plat) => (
                            <span key={plat} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md font-bold text-[10px] uppercase border border-gray-200">
                              {plat}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Not used on any platform yet</span>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-1">Scheduled Posts using this Asset</span>
                      {usage.posts.length > 0 ? (
                        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                          {usage.posts.map((post) => (
                            <div key={post.id} className="p-2 bg-gray-50 border border-gray-150 rounded-lg">
                              <p className="font-semibold text-gray-800 truncate">{post.content || '(No caption text)'}</p>
                              <p className="text-[9px] text-gray-400 mt-0.5">Status: <span className="font-bold uppercase text-brand-600">{post.status}</span></p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Not linked to any posts yet</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 text-left">No usage metadata found.</p>
                )}
              </div>

              {/* Operations */}
              <div className="space-y-2">
                <button
                  onClick={() => copyToClipboard(activeAsset.secureUrl)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 rounded-xl transition-all cursor-pointer shadow-2xs"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Cloudinary URL
                </button>
                <button
                  onClick={() => downloadAsset(activeAsset)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 rounded-xl transition-all cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" /> Download File
                </button>
                <button
                  onClick={() => toggleArchive(activeAsset)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 rounded-xl transition-all cursor-pointer shadow-2xs"
                >
                  <Archive className="w-3.5 h-3.5" /> {activeAsset.isArchived ? 'Restore Asset' : 'Archive Asset'}
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to permanently delete this asset from Cloudinary and the database?')) {
                      deleteSingleAsset(activeAsset);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Permanent Delete
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CREATE FOLDER MODAL ─────────────────────────────────── */}
      <AnimatePresence>
        {isCreateFolderOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full sm:w-80 bg-white p-5 rounded-t-2xl sm:rounded-2xl shadow-xl text-left border border-gray-200"
            >
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Create Media Folder</h3>
              <p className="text-xs text-gray-500 mt-1">Folders organize files dynamically on Cloudinary CDN.</p>
              
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g. campaigns, review-assets"
                className="mt-4 w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
              />

              <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5 mt-5">
                <button
                  onClick={() => { setIsCreateFolderOpen(false); setNewFolderName(''); }}
                  className="px-3.5 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFolder}
                  className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Create Folder
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
export default MediaLibrary;
