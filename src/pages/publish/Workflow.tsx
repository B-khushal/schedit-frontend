import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Send, Calendar as CalendarIcon, Search, Filter, Clock, CheckCircle2, AlertCircle, Eye, RefreshCw, X, ChevronRight, History, MessageSquare, ListTodo, ShieldAlert, Award, AlertTriangle, Check, LayoutGrid, Kanban, List, CalendarDays, SlidersHorizontal, User, Tag, Plus, CheckSquare, Settings, ArrowUpRight, ArrowDownRight, Layers, Users } from 'lucide-react';
import { cn, getPlatformColor, getPlatformLabel } from '../../lib/utils';
import { apiRequest } from '../../lib/api';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isSameDay } from 'date-fns';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useToast } from '../../components/ui/Toast';
import { Button, StatusPill, PlatformIcon, Avatar, KPICard, MiniStat, Badge } from '../../components/ui';

interface PostInfo {
  id: string;
  content: string;
  platforms: any[];
  overrides: any[];
  versions: any[];
  comments: any[];
  status: string;
  scheduledTime: string;
  date: string;
  project: string;
  priority: string;
  media: any[];
  approvalRequests: any[];
}

export function Workflow() {
  const navigate = useNavigate();
  const { currentProject } = useWorkspace();
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();

  const [posts, setPosts] = useState<PostInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'kanban' | 'list' | 'timeline' | 'calendar'>('grid');
  
  // Bulk selection state
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  
  // Active Keyboard focus index
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  // Search & Filter sidebar states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedContentType, setSelectedContentType] = useState<string>('all');

  // Collapsible Filters Sidebar State (default closed)
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const fetchWorkflowPosts = async () => {
    if (!currentProject) return;
    setRefreshing(true);
    try {
      const rawPosts = await apiRequest(`/api/v1/projects/${currentProject.id}/posts`);
      
      const mapped: PostInfo[] = rawPosts.map((post: any) => ({
        id: post.id,
        content: post.content,
        platforms: post.platforms || [],
        overrides: post.overrides || [],
        versions: post.versions || [],
        comments: post.comments || [],
        status: post.status,
        scheduledTime: post.scheduledTime,
        date: format(new Date(post.scheduledTime), 'MMM dd, yyyy h:mm a'),
        project: currentProject.name,
        priority: post.priority || 'MEDIUM',
        media: post.media || [],
        approvalRequests: post.approvalRequests || [],
      }));

      setPosts(mapped);
    } catch (err) {
      console.error('Error fetching workflow lists:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (currentProject) {
      fetchWorkflowPosts();
    }
  }, [currentProject]);

  // Keyboard Shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts if user is typing in inputs or textareas
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      const activePost = filteredPosts[focusedIndex];
      if (!activePost) return;

      switch (e.key.toLowerCase()) {
        case 'a':
          e.preventDefault();
          handleBulkAction('APPROVED', [activePost.id]);
          break;
        case 'r':
          e.preventDefault();
          handleBulkAction('REJECTED', [activePost.id]);
          break;
        case 'v':
          e.preventDefault();
          handleBulkAction('VERIFIED', [activePost.id]);
          break;
        case 's':
          e.preventDefault();
          navigate(`/app/workflow/post/${activePost.id}`);
          break;
        case 'arrowdown':
          e.preventDefault();
          setFocusedIndex(prev => Math.min(filteredPosts.length - 1, prev + 1));
          break;
        case 'arrowup':
          e.preventDefault();
          setFocusedIndex(prev => Math.max(0, prev - 1));
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [posts, focusedIndex]);

  // Bulk status update action
  const handleBulkAction = async (statusValue: string, postIds: string[] = selectedPostIds) => {
    if (postIds.length === 0) return toastWarning('No Selection', 'Please select at least one content card.');
    try {
      setRefreshing(true);
      await Promise.all(
        postIds.map(postId =>
          apiRequest(`/api/v1/posts/${postId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status: statusValue }),
          })
        )
      );
      toastSuccess('Success', `Bulk updated ${postIds.length} items to ${statusValue}.`);
      setSelectedPostIds([]);
      fetchWorkflowPosts();
    } catch (err: any) {
      toastError('Bulk Action Failed', err.message || 'Error occurred during bulk update.');
    } finally {
      setRefreshing(false);
    }
  };

  // KPI Calculations
  const metrics = useMemo(() => {
    const total = posts.length;
    const pending = posts.filter(p => p.status === 'UNDER_REVIEW' || p.status === 'REVIEW').length;
    const verified = posts.filter(p => p.status === 'VERIFIED').length;
    const approved = posts.filter(p => p.status === 'APPROVED').length;
    const scheduled = posts.filter(p => p.status === 'SCHEDULED').length;
    const rejected = posts.filter(p => p.status === 'REJECTED' || p.status === 'CHANGES_REQUESTED').length;
    const needsChanges = posts.filter(p => p.status === 'CLIENT_CHANGES_REQUESTED').length;
    const clientPending = posts.filter(p => p.status === 'CLIENT_REVIEW').length;

    return {
      pending,
      verified,
      approved,
      scheduled,
      rejected,
      needsChanges,
      clientPending,
      total,
    };
  }, [posts]);

  // Live sidebar filtration
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchPlatform = selectedPlatform === 'all' || 
        post.platforms.some(p => p.socialAccount?.platform === selectedPlatform);
      
      const matchPriority = selectedPriority === 'all' || post.priority === selectedPriority;
      
      const matchStatus = selectedStatus === 'all' || post.status === selectedStatus;
      
      let contentType = 'post';
      if (post.media && post.media.length > 0) {
        contentType = post.media[0].mediaType.toLowerCase();
      }
      const matchType = selectedContentType === 'all' || contentType === selectedContentType;

      return matchSearch && matchPlatform && matchPriority && matchStatus && matchType;
    });
  }, [posts, searchQuery, selectedPlatform, selectedPriority, selectedStatus, selectedContentType]);

  const toggleSelectPost = (postId: string) => {
    setSelectedPostIds(prev =>
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  };

  return (
    <div className="min-h-full flex flex-col md:flex-row max-w-[1600px] mx-auto w-full relative overflow-x-hidden md:overflow-hidden bg-transparent text-left font-sans select-none">
      
      {/* Filters Sidebar (Collapsible, default closed) */}
      {isFilterOpen && (
        <div className="fixed inset-x-0 bottom-0 z-40 max-h-[85dvh] rounded-t-2xl border-t border-gray-200 bg-white p-5 flex flex-col space-y-6 shrink-0 overflow-y-auto shadow-modal animate-slide-up duration-200 md:static md:w-64 md:max-h-none md:rounded-none md:border-t-0 md:border-r md:shadow-none md:animate-in">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-brand-500" /> Filter Criteria
            </h3>
            <div className="flex items-center gap-2">
              {(selectedPlatform !== 'all' || selectedPriority !== 'all' || selectedStatus !== 'all' || selectedContentType !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedPlatform('all');
                    setSelectedPriority('all');
                    setSelectedStatus('all');
                    setSelectedContentType('all');
                    setSearchQuery('');
                  }}
                  className="text-[10px] font-bold text-red-500 underline hover:text-red-600 cursor-pointer"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-600 cursor-pointer"
                title="Close sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

        {/* Filters Selectors */}
        <div className="space-y-4">
          <div className="space-y-1.5 text-xs text-gray-700 text-left">
            <label className="block font-semibold text-gray-600 uppercase tracking-wider">Search</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-gray-700 text-left">
            <label className="block font-semibold text-gray-600 uppercase tracking-wider">Platform</label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer transition-colors"
            >
              <option value="all">All Platforms</option>
              <option value="INSTAGRAM">Instagram</option>
              <option value="FACEBOOK">Facebook</option>
              <option value="LINKEDIN">LinkedIn</option>
              <option value="YOUTUBE">YouTube</option>
            </select>
          </div>

          <div className="space-y-1.5 text-xs text-gray-700 text-left">
            <label className="block font-semibold text-gray-600 uppercase tracking-wider">Priority</label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer transition-colors"
            >
              <option value="all">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div className="space-y-1.5 text-xs text-gray-700 text-left">
            <label className="block font-semibold text-gray-600 uppercase tracking-wider">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="VERIFIED">Verified</option>
              <option value="APPROVED">Approved</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="PUBLISHED">Published</option>
              <option value="CHANGES_REQUESTED">Changes Requested</option>
              <option value="CLIENT_REVIEW">Client Review</option>
            </select>
          </div>

          <div className="space-y-1.5 text-xs text-gray-700 text-left">
            <label className="block font-semibold text-gray-600 uppercase tracking-wider">Content Type</label>
            <select
              value={selectedContentType}
              onChange={(e) => setSelectedContentType(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer transition-colors"
            >
              <option value="all">All Types</option>
              <option value="image">Image Post</option>
              <option value="video">Video / Short / Reel</option>
              <option value="carousel">Carousel</option>
            </select>
          </div>
        </div>

        {/* Keyboard shortcut tips */}
        <div className="hidden md:block pt-6 border-t border-gray-150 text-[10px] text-gray-400 leading-relaxed font-mono text-left">
          <p className="font-bold text-gray-500 mb-1">Keyboard Shortcuts:</p>
          <div>[A] Approve Selected</div>
          <div>[R] Reject Selected</div>
          <div>[V] Verify Selected</div>
          <div>[S] Open Detail Studio</div>
          <div>[↑/↓] Navigate list</div>
        </div>
      </div>
    )}

      {/* Main Workspace Dashboard */}
      <div className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto min-h-0 relative text-left pb-bottom-nav md:pb-8">
        
        {/* Header section with layout switchers */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-display tracking-tight leading-none">Approvals & Workflow</h1>
            <p className="text-sm text-gray-500 mt-2 font-medium">Manage cross-channel publication workflows, annotations, and client feedback cycles.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            {/* Filter criteria toggle button */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer",
                isFilterOpen
                  ? "bg-brand-50 border-brand-200 text-brand-700 shadow-xs"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
              )}
            >
              <SlidersHorizontal className="w-4 h-4 text-brand-500" />
              <span>Filter Criteria</span>
              {(selectedPlatform !== 'all' || selectedPriority !== 'all' || selectedStatus !== 'all' || selectedContentType !== 'all' || searchQuery) && (
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              )}
            </button>
            {/* View Switching Tab bar */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl overflow-x-auto scrollbar-hide max-w-full">
              {(['grid', 'kanban', 'list', 'timeline', 'calendar'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    "p-1.5 rounded-lg text-gray-500 hover:text-gray-900 transition-all cursor-pointer",
                    viewMode === mode ? "bg-white text-brand-600 shadow-xs" : ""
                  )}
                >
                  {mode === 'grid' && <LayoutGrid className="w-4 h-4" />}
                  {mode === 'kanban' && <Kanban className="w-4 h-4" />}
                  {mode === 'list' && <List className="w-4 h-4" />}
                  {mode === 'timeline' && <Clock className="w-4 h-4" />}
                  {mode === 'calendar' && <CalendarDays className="w-4 h-4" />}
                </button>
              ))}
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={fetchWorkflowPosts}
              loading={refreshing}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Sync
            </Button>
          </div>
        </div>

        {/* Dashboard Top Row summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 mb-8 shrink-0">
          <KPICard label="Pending Reviews" value={metrics.pending} icon={<Clock className="w-4 h-4 text-amber-500" />} />
          <KPICard label="Verified" value={metrics.verified} icon={<Award className="w-4 h-4 text-purple-500" />} />
          <KPICard label="Approved" value={metrics.approved} icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />} />
          <KPICard label="Scheduled" value={metrics.scheduled} icon={<CalendarIcon className="w-4 h-4 text-teal-500" />} />
          <KPICard label="Client Pending" value={metrics.clientPending} icon={<Users className="w-4 h-4 text-blue-500" />} />
          <KPICard label="Needs Changes" value={metrics.needsChanges} icon={<AlertTriangle className="w-4 h-4 text-red-500" />} />
        </div>

        {/* Bulk Action Controls */}
        {selectedPostIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-brand-50 border border-brand-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 shrink-0 shadow-sm"
          >
            <span className="text-xs font-bold text-brand-700">{selectedPostIds.length} items selected</span>
            <div className="flex flex-wrap gap-2">
              <Button size="xs" variant="primary" onClick={() => handleBulkAction('APPROVED')}>Approve</Button>
              <Button size="xs" variant="secondary" onClick={() => handleBulkAction('VERIFIED')}>Verify</Button>
              <Button size="xs" variant="secondary" className="text-red-700 border-red-200 hover:bg-red-50 bg-white" onClick={() => handleBulkAction('REJECTED')}>Reject</Button>
              <Button size="xs" variant="secondary" onClick={() => setSelectedPostIds([])}>Cancel</Button>
            </div>
          </motion.div>
        )}

        {/* Render Layout Views */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 font-bold flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-brand-600" /> Loading approval list...
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl bg-white text-gray-500 text-xs">
            No posts match the current filter selection. Create new drafts in the Studio to begin.
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-x-auto">
            
            {/* GRID VIEW (Default) */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredPosts.map((post, index) => {
                  const mediaSource = post.media && post.media.length > 0 ? post.media[0] : null;
                  const isFocused = focusedIndex === index;
                  const isSelected = selectedPostIds.includes(post.id);

                  return (
                    <motion.div
                      whileHover={{ y: -4, scale: 1.01 }}
                      onClick={() => navigate(`/app/workflow/post/${post.id}`)}
                      key={post.id}
                      className={cn(
                        "bg-white border rounded-2xl overflow-hidden hover:shadow-lg transition-all flex flex-col relative cursor-pointer",
                        isFocused ? "ring-2 ring-brand-500" : "border-gray-200",
                        isSelected ? "border-brand-500" : ""
                      )}
                    >
                      {/* Checkbox trigger */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectPost(post.id);
                        }}
                        className="absolute top-3 left-3 z-20 p-1 bg-white/90 hover:bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer"
                      >
                        <CheckSquare className={cn("w-4 h-4", isSelected ? "text-brand-600 fill-brand-600/10" : "text-gray-300")} />
                      </div>

                      {/* Thumbnail section */}
                      <div className="h-40 bg-black/90 relative flex items-center justify-center shrink-0 border-b border-gray-100">
                        {mediaSource ? (
                          <img src={mediaSource.storagePath} alt="Asset media" className="w-full h-full object-cover opacity-80" />
                        ) : (
                          <FileText className="w-10 h-10 text-gray-500" />
                        )}
                        
                        {/* Platforms logo group */}
                        <div className="absolute bottom-3 right-3 flex gap-1 bg-black/40 backdrop-blur-xs p-1.5 rounded-lg border border-white/10">
                          {post.platforms.map(p => (
                            <PlatformIcon key={p.id} platform={p.socialAccount?.platform} size="xs" />
                          ))}
                        </div>
                      </div>

                      {/* Card Content parameters */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            <span>V{post.versions?.length || 1} Version</span>
                            <span>{post.priority} Priority</span>
                          </div>
                          <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-relaxed text-left">
                            {post.content}
                          </h4>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                          <StatusPill status={post.status} />
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
                            <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                            {post.comments?.length || 0} Comments
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-[10px] text-gray-400 font-mono">
                          <span>Due: {post.date.substring(0, 11)}</span>
                          <span className="font-semibold text-brand-600">Review details →</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* KANBAN BOARD VIEW */}
            {viewMode === 'kanban' && (
              <div className="flex gap-6 overflow-x-auto pb-4 h-full scrollbar-thin">
                {['DRAFT', 'UNDER_REVIEW', 'VERIFIED', 'APPROVED', 'SCHEDULED', 'PUBLISHED'].map(stage => {
                  const stagePosts = filteredPosts.filter(p => p.status === stage);
                  return (
                    <div key={stage} className="w-72 bg-gray-50 rounded-2xl p-4 flex flex-col gap-4 border border-gray-200 shrink-0 h-full overflow-y-auto">
                      <div className="flex justify-between items-center pb-2 border-b border-gray-250 shrink-0">
                        <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{stage.replace('_', ' ')}</span>
                        <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-800 text-[10px] font-bold">{stagePosts.length}</span>
                      </div>
                      
                      <div className="space-y-3 flex-1 overflow-y-auto">
                        {stagePosts.map(post => (
                          <div
                            key={post.id}
                            onClick={() => navigate(`/app/workflow/post/${post.id}`)}
                            className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow shadow-xs cursor-pointer text-left space-y-3 hover:border-brand-300 transition-colors"
                          >
                            <h5 className="font-semibold text-gray-900 text-xs line-clamp-2 leading-relaxed">{post.content}</h5>
                            <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                              <span>V{post.versions.length}</span>
                              <span>{post.priority}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* LIST TABULAR VIEW */}
            {viewMode === 'list' && (
              <div className="space-y-3 md:space-y-0 md:bg-white md:border md:border-gray-200 md:rounded-2xl md:overflow-hidden md:shadow-card">
                <div className="md:hidden space-y-3">
                  {filteredPosts.map(post => {
                    const isSelected = selectedPostIds.includes(post.id);
                    return (
                      <div
                        key={post.id}
                        onClick={() => navigate(`/app/workflow/post/${post.id}`)}
                        className="bg-white border border-gray-200 rounded-2xl p-4 shadow-card space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm line-clamp-2">{post.content}</p>
                            <p className="text-[10px] text-gray-400 font-mono mt-1">{post.date}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => toggleSelectPost(post.id)}
                            className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 w-5 h-5 cursor-pointer shrink-0"
                          />
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusPill status={post.status} />
                          <Badge variant="neutral" className="capitalize font-bold">{post.priority.toLowerCase()}</Badge>
                          <span className="text-[10px] font-bold text-gray-500">V{post.versions.length}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <table className="hidden md:table w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 font-bold text-gray-500 uppercase tracking-wider">
                      <th className="p-4 w-12">Select</th>
                      <th className="p-4">Post Content</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Priority</th>
                      <th className="p-4">Version</th>
                      <th className="p-4">Scheduled Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150">
                    {filteredPosts.map(post => {
                      const isSelected = selectedPostIds.includes(post.id);
                      return (
                        <tr
                          key={post.id}
                          onClick={() => navigate(`/app/workflow/post/${post.id}`)}
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <td className="p-4" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectPost(post.id)}
                              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                            />
                          </td>
                          <td className="p-4 font-semibold text-gray-900 truncate max-w-xs">{post.content}</td>
                          <td className="p-4"><StatusPill status={post.status} /></td>
                          <td className="p-4"><Badge variant="neutral" className="capitalize font-bold">{post.priority.toLowerCase()}</Badge></td>
                          <td className="p-4 font-bold text-gray-500">V{post.versions.length}</td>
                          <td className="p-4 font-mono text-gray-500">{post.date}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* TIMELINE / CHRONOLOGICAL VIEW */}
            {viewMode === 'timeline' && (
              <div className="space-y-4 bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-card">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2">Rescheduling Gantt Timeline Distribution</h3>
                <div className="space-y-3.5 max-h-[600px] overflow-y-auto">
                  {filteredPosts.map(post => (
                    <div
                      key={post.id}
                      onClick={() => navigate(`/app/workflow/post/${post.id}`)}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 border border-gray-150 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <span className="text-xs font-bold text-gray-500 font-mono w-24 shrink-0 truncate">{post.date.substring(0, 11)}</span>
                      <div className="w-full sm:flex-1 h-3 bg-gray-100 rounded-full relative overflow-hidden">
                        <div
                          style={{
                            left: '20%',
                            width: '40%',
                            backgroundColor: getPlatformColor(post.platforms[0]?.socialAccount?.platform || 'LINKEDIN'),
                          }}
                          className="h-full rounded-full absolute shadow-xs"
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-950 truncate max-w-xs">{post.content}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CALENDAR DISTRIBUTION VIEW */}
            {viewMode === 'calendar' && (
              <div className="min-w-[760px] grid grid-cols-7 gap-1 bg-gray-200 border border-gray-200 rounded-2xl overflow-hidden shadow-card text-xs">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="bg-gray-50 p-3 font-bold text-center border-b border-gray-250 text-gray-600">{day}</div>
                ))}
                {eachDayOfInterval({
                  start: startOfWeek(new Date()),
                  end: endOfWeek(addDays(new Date(), 21)),
                }).map((day, idx) => {
                  const dayPosts = filteredPosts.filter(p => isSameDay(new Date(p.scheduledTime), day));
                  return (
                    <div key={idx} className="bg-white min-h-24 p-2 border-r border-b border-gray-100 flex flex-col gap-1.5 text-left">
                      <span className="font-bold text-gray-400 font-mono">{day.getDate()}</span>
                      <div className="space-y-1">
                        {dayPosts.map(post => (
                          <div
                            key={post.id}
                            onClick={() => navigate(`/app/workflow/post/${post.id}`)}
                            className="px-1.5 py-0.5 rounded bg-brand-50 border border-brand-150 text-[10px] font-bold text-brand-700 truncate cursor-pointer hover:bg-brand-100"
                          >
                            {post.content}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
export default Workflow;
