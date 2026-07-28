import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, RefreshCw, Send, CheckCircle2, AlertTriangle, Play, Pause, ChevronRight, 
  History, MessageSquare, ShieldAlert, Award, FileText, Check, Clock, Trash2, 
  GitCompare, ChevronDown, ListTodo, MapPin, Hash, User, MapPinned, PlaySquare, 
  Calendar as CalendarIcon, Sparkles, X, CheckSquare, Layers, Eye,
  Image as ImageIcon, Heart, Film, Camera, MessageCircle
} from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { cn } from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';
import { Button, Badge, StatusPill, PlatformIcon, Avatar, Input, Textarea, Select } from '../../components/ui';

interface Shape {
  type: 'pin' | 'arrow' | 'rect' | 'circle';
  startX: number;
  startY: number;
  endX?: number;
  endY?: number;
  color: string;
}

export function WorkflowDetail() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Reviewer and client dropdown choices (fetched from project team memberships)
  const [members, setMembers] = useState<any[]>([]);

  // Discussion & Comments state
  const [activeCommentTab, setActiveCommentTab] = useState<'internal' | 'client'>('internal');
  const [newComment, setNewComment] = useState('');
  
  // Checklist State
  const [checklist, setChecklist] = useState({
    brandGuidelines: true,
    grammarChecked: true,
    logoVerified: false,
    thumbnailApproved: false,
    captionApproved: true,
    linksVerified: false,
    hashtagsVerified: true,
    platformRulesPassed: true,
  });

  // Video timeline properties
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoCurrentTime, setVideoCurrentTime] = useState<number>(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [tagTimestamp, setTagTimestamp] = useState<boolean>(false);
  const [timestampValue, setTimestampValue] = useState<number | null>(null);

  // Canvas Image review properties
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [drawMode, setDrawMode] = useState<'pointer' | 'pin' | 'arrow' | 'rect' | 'circle'>('pointer');
  const [annotations, setAnnotations] = useState<Shape[]>([]);
  const [drawingStart, setDrawingStart] = useState<{ x: number; y: number } | null>(null);
  const [currentDragShape, setCurrentDragShape] = useState<Shape | null>(null);
  const [selectedCommentAnnotations, setSelectedCommentAnnotations] = useState<Shape[] | null>(null);

  // Version Control
  const [compV1, setCompV1] = useState<number>(1);
  const [compV2, setCompV2] = useState<number>(2);
  const [showCompare, setShowCompare] = useState(false);
  const [comparedData, setComparedData] = useState<any>(null);

  // Scheduling values
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const [timezone, setTimezone] = useState<string>('UTC');
  const [priority, setPriority] = useState<string>('MEDIUM');

  // Utility to format ISO dates into datetime-local input string YYYY-MM-DDTHH:mm
  const formatForDateTimeInput = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // Load post details and project members
  async function loadDetails() {
    try {
      setLoading(true);
      const data = await apiRequest<any>(`/api/v1/posts/${id}`);
      setPost(data);
      setScheduledTime(formatForDateTimeInput(data.scheduledTime));
      setTimezone(data.timezone || 'UTC');
      setPriority(data.priority || 'MEDIUM');

      // Load project members
      try {
        const membersData = await apiRequest<any[]>(`/api/v1/projects/${data.projectId}/members`);
        setMembers(membersData || []);
      } catch {
        const projectDetails = await apiRequest<any>(`/api/v1/projects/${data.projectId}`);
        setMembers(projectDetails?.members || []);
      }
    } catch (err: any) {
      toastError('Load Error', err.message || 'Failed to load post details.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      loadDetails();
    }
  }, [id]);

  // Media source resolution
  const mediaSource = useMemo(() => {
    if (post?.media && post.media.length > 0) return post.media[0];
    if (post?.versions && post.versions[0]?.media && post.versions[0].media.length > 0) return post.versions[0].media[0];
    return null;
  }, [post]);

  const mediaPath = mediaSource ? (mediaSource.secureUrl || mediaSource.storagePath) : null;
  const isVideoContent = mediaSource?.mediaType === 'VIDEO' || mediaSource?.mimeType?.startsWith('video/') || mediaPath?.match(/\.(mp4|mov|webm|m4v)/i);

  // Social account for preview
  const primaryAccount = useMemo(() => {
    if (post?.platforms && post.platforms.length > 0) {
      return post.platforms[0]?.socialAccount;
    }
    return null;
  }, [post]);

  // Video controller handlers
  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isVideoPlaying) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    } else {
      videoRef.current.play();
      setIsVideoPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setVideoCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setVideoDuration(videoRef.current.duration);
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || videoDuration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    videoRef.current.currentTime = percentage * videoDuration;
    if (tagTimestamp) {
      setTimestampValue(percentage * videoDuration);
    }
  };

  // Image annotations drawing handlers
  const getMouseCoords = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return { x: 0, y: 0 };
    const rect = imageContainerRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (drawMode === 'pointer') return;
    const coords = getMouseCoords(e);
    setDrawingStart(coords);
    
    if (drawMode === 'pin') {
      const newPin: Shape = { type: 'pin', startX: coords.x, startY: coords.y, color: '#f59e0b' };
      setAnnotations(prev => [...prev, newPin]);
      setDrawingStart(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (drawMode === 'pointer' || !drawingStart) return;
    const coords = getMouseCoords(e);
    
    setCurrentDragShape({
      type: drawMode as any,
      startX: drawingStart.x,
      startY: drawingStart.y,
      endX: coords.x,
      endY: coords.y,
      color: '#f59e0b',
    });
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (drawMode === 'pointer' || !drawingStart || !currentDragShape) return;
    setAnnotations(prev => [...prev, currentDragShape]);
    setDrawingStart(null);
    setCurrentDragShape(null);
  };

  // Submit Comments with Annotations and Timestamps
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const label = activeCommentTab === 'internal' ? '[INTERNAL] ' : '[CLIENT] ';
      const payloadComment = `${label}${newComment}`;
      
      const payloadAnnotations = annotations.length > 0 ? annotations : undefined;
      const payloadTimestamp = timestampValue !== null ? timestampValue : undefined;

      await apiRequest(`/api/v1/posts/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({
          comment: payloadComment,
          timestamp: payloadTimestamp,
          annotations: payloadAnnotations,
        }),
      });

      toastSuccess('Comment Added', 'Your feedback was logged in the review panel.');
      setNewComment('');
      setAnnotations([]);
      setTimestampValue(null);
      setTagTimestamp(false);
      loadDetails();
    } catch (err: any) {
      toastError('Comment Failed', err.message || 'Could not add review comment.');
    }
  };

  // Status transitions
  const handleTransitionStatus = async (statusValue: string) => {
    if (!window.confirm(`Are you sure you want to transition this content status to ${statusValue}?`)) return;
    try {
      await apiRequest(`/api/v1/posts/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: statusValue }),
      });
      toastSuccess('Status Updated', `Post status transitioned to ${statusValue}.`);
      loadDetails();
    } catch (err: any) {
      toastError('Update Failed', err.message || 'Could not transition status.');
    }
  };

  // Direct approval trigger
  const handleHODDecision = async (statusValue: 'APPROVED' | 'CHANGES_REQUESTED') => {
    try {
      const req = await apiRequest<any>('/api/v1/approvals/requests', {
        method: 'POST',
        body: JSON.stringify({ scheduledPostId: id }),
      });

      await apiRequest(`/api/v1/approvals/requests/${req.id}/reviews`, {
        method: 'POST',
        body: JSON.stringify({
          status: statusValue,
          comments: `Workflow decision submitted: ${statusValue}`,
        }),
      });

      toastSuccess('Decision Submitted', `Review logged successfully.`);
      loadDetails();
    } catch (err: any) {
      toastError('Review Failed', err.message || 'Could not submit decision.');
    }
  };

  // Reassignment handlers
  const handleAssignReviewer = async (reviewerId: string) => {
    if (!reviewerId) return;
    try {
      await apiRequest(`/api/v1/posts/${id}/reviewers`, {
        method: 'POST',
        body: JSON.stringify({ reviewerId }),
      });
      toastSuccess('Assigned', 'Reviewer successfully assigned.');
      loadDetails();
    } catch (err: any) {
      toastError('Assignment Failed', err.message || 'Could not assign reviewer.');
    }
  };

  const handleAssignClient = async (clientId: string) => {
    if (!clientId) return;
    try {
      await apiRequest(`/api/v1/posts/${id}/clients`, {
        method: 'POST',
        body: JSON.stringify({ clientId }),
      });
      toastSuccess('Assigned', 'Client reviewer successfully assigned.');
      loadDetails();
    } catch (err: any) {
      toastError('Assignment Failed', err.message || 'Could not assign client.');
    }
  };

  // Restore versions
  const handleRestoreVersion = async (versionId: string) => {
    if (!window.confirm('Are you sure you want to restore this post to this version?')) return;
    try {
      await apiRequest(`/api/v1/posts/${id}/versions/${versionId}/restore`, {
        method: 'POST',
      });
      toastSuccess('Version Restored', 'Content replaced with selected snapshot details.');
      loadDetails();
    } catch (err: any) {
      toastError('Failed Restore', err.message || 'Could not restore version.');
    }
  };

  // Side by Side comparison
  const handleCompareVersions = async () => {
    try {
      const data = await apiRequest(`/api/v1/posts/${id}/versions/compare?v1=${compV1}&v2=${compV2}`);
      setComparedData(data);
      setShowCompare(true);
    } catch (err: any) {
      toastError('Compare Failed', err.message || 'Could not load version details.');
    }
  };

  // Reschedule update submission
  const handleReschedule = async () => {
    if (!scheduledTime) {
      toastWarning('Missing Date', 'Please select a valid scheduled date and time.');
      return;
    }
    try {
      const targetDate = new Date(scheduledTime);
      await apiRequest(`/api/v1/posts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          scheduledTime: targetDate.toISOString(),
          timezone,
          priority,
        }),
      });
      toastSuccess('Rescheduled', `Updated publish time to ${targetDate.toLocaleString()}`);
      loadDetails();
    } catch (err: any) {
      toastError('Reschedule Failed', err.message || 'Failed to save date changes.');
    }
  };

  // Determine user login permissions and roles
  const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userRoleInProject = useMemo(() => {
    if (!members || !loggedInUser) return 'VIEWER';
    const found = members.find((m: any) => m.userId === loggedInUser.id);
    return found ? found.role : 'OWNER';
  }, [members, loggedInUser]);

  const isClientUser = userRoleInProject === 'CLIENT';

  // Format comments listing to hide internal details for clients
  const commentsFeed = useMemo(() => {
    if (!post?.comments) return [];
    return post.comments.filter((c: any) => {
      const isInternal = c.comment.startsWith('[INTERNAL] ');
      if (isClientUser && isInternal) return false;
      return true;
    }).map((c: any) => {
      let text = c.comment;
      let isInternal = false;
      if (text.startsWith('[INTERNAL] ')) {
        text = text.substring(11);
        isInternal = true;
      } else if (text.startsWith('[CLIENT] ')) {
        text = text.substring(9);
      }
      return { ...c, comment: text, isInternal };
    });
  }, [post, isClientUser]);

  // Extract active project assignment info
  const reviewerAssignments = useMemo(() => {
    if (!post?.approvalRequests || post.approvalRequests.length === 0) return [];
    return post.approvalRequests[0].reviewers || [];
  }, [post]);

  const clientAssignments = useMemo(() => {
    if (!post?.approvalRequests || post.approvalRequests.length === 0) return [];
    return post.approvalRequests[0].clients || [];
  }, [post]);

  const postTypeLabel = useMemo(() => {
    if (post?.overrides && post.overrides.length > 0) {
      for (const ov of post.overrides) {
        const ct = ov?.settings?.contentType;
        if (ct) {
          const upper = ct.toUpperCase();
          if (upper === 'REEL' || upper === 'REELS' || upper === 'SHORT') return 'Reel';
          if (upper === 'STORY' || upper === 'STORIES') return 'Story';
          if (upper === 'CAROUSEL') return 'Carousel';
          if (upper === 'FEED_POST') return 'Feed Post';
        }
      }
    }
    if (post?.media && post.media.length > 0) {
      const mt = (post.media[0]?.mediaType || '').toUpperCase();
      if (mt === 'VIDEO' || mt === 'REEL' || mt === 'SHORT') return 'Reel';
      if (mt === 'CAROUSEL') return 'Carousel';
      if (mt === 'IMAGE') return 'Post';
    }
    if (type && type !== 'post') return type.charAt(0).toUpperCase() + type.slice(1);
    return 'Post';
  }, [post, type]);

  if (loading && !post) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-brand-600" />
        <span className="text-sm font-bold text-gray-600 font-display">Loading Review Workspace...</span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-3 text-center p-6">
        <AlertTriangle className="w-10 h-10 text-amber-500" />
        <h3 className="text-lg font-bold text-gray-900">Post Not Found</h3>
        <p className="text-sm text-gray-500">The requested content item could not be retrieved.</p>
        <Link to="/app/workflow" className="px-4 py-2 bg-brand-600 text-white font-semibold text-xs rounded-xl shadow-xs hover:bg-brand-500 transition-all">
          Back to Workflows
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] xl:h-[calc(100vh-3.5rem)] flex flex-col bg-gray-50/50 w-full overflow-x-hidden xl:overflow-hidden text-left font-sans select-none">
      
      {/* ╔═══════════════════════════════════════════════════════╗ */}
      {/* ║  TOP HEADER NAV                                       ║ */}
      {/* ╚═══════════════════════════════════════════════════════╝ */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shrink-0 shadow-2xs">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Link to="/app/workflow" className="p-2 hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-gray-900 text-lg leading-tight font-display tracking-tight">Review Studio</h2>
              <StatusPill status={post.status} />
              {post.priority && (
                <span className={cn(
                  "px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full border",
                  post.priority === 'HIGH' ? "bg-red-50 text-red-600 border-red-200" : "bg-gray-100 text-gray-600 border-gray-200"
                )}>
                  {post.priority} Priority
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">
              ID: <span className="font-mono text-gray-700 font-bold">{post.id?.slice(0, 8)}</span> · Type: <span className="capitalize text-brand-700 font-extrabold bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-md text-[11px]">{postTypeLabel}</span>
            </p>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="hidden sm:flex items-center gap-2">
          {!isClientUser && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleHODDecision('CHANGES_REQUESTED')}
                icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
                className="text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100 font-bold"
              >
                Request Changes
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleHODDecision('APPROVED')}
                icon={<CheckCircle2 className="w-4 h-4" />}
                className="bg-emerald-600 hover:bg-emerald-500 font-bold shadow-xs"
              >
                Approve Post
              </Button>
            </>
          )}

          {isClientUser && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleHODDecision('APPROVED')}
              icon={<CheckCircle2 className="w-4 h-4" />}
              className="bg-emerald-600 hover:bg-emerald-500 font-bold shadow-xs"
            >
              Approve Client View
            </Button>
          )}
        </div>
      </div>

      {/* ╔═══════════════════════════════════════════════════════╗ */}
      {/* ║  MAIN 3-COLUMN WORKSPACE BODY                        ║ */}
      {/* ╚═══════════════════════════════════════════════════════╝ */}
      <div className="flex-1 flex flex-col xl:flex-row overflow-y-auto xl:overflow-hidden pb-bottom-nav sm:pb-0">

        {/* ── COLUMN 1: Visual Media Canvas & Live Render Mock ── */}
        <div className="w-full xl:w-[38%] border-b xl:border-b-0 xl:border-r border-gray-200 flex flex-col bg-white overflow-visible xl:overflow-y-auto pr-0 xl:pr-1">
          <div className="p-4 sm:p-6 space-y-6">
            
            {/* Visual Canvas Card */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-md space-y-4 text-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5 font-display">
                  <Layers className="w-4 h-4 text-brand-400" /> Visual Proofing Canvas
                </span>

                {!isVideoContent && mediaSource && (
                  <div className="flex items-center gap-1 bg-gray-800 p-1 rounded-xl border border-gray-700">
                    {(['pointer', 'pin', 'rect', 'circle', 'arrow'] as const).map(mode => (
                      <button
                        key={mode}
                        onClick={() => setDrawMode(mode)}
                        className={cn(
                          "px-2.5 py-1 text-[11px] font-bold rounded-lg capitalize transition-all cursor-pointer",
                          drawMode === mode ? "bg-brand-600 text-white shadow-xs" : "text-gray-400 hover:text-white"
                        )}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Media Player / Canvas Container */}
              <div className="rounded-xl overflow-hidden bg-black border border-gray-800 flex items-center justify-center relative min-h-[220px] sm:min-h-[300px]">
                {isVideoContent && mediaPath ? (
                  <div className="w-full relative flex flex-col">
                    <video
                      ref={videoRef}
                      src={mediaPath}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      className="w-full aspect-video object-contain bg-black"
                    />
                    
                    {/* Controls */}
                    <div className="p-3 bg-gray-900 border-t border-gray-800 flex items-center gap-3">
                      <button onClick={handlePlayPause} className="p-1.5 bg-brand-600 hover:bg-brand-500 rounded-lg text-white font-bold cursor-pointer">
                        {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                      </button>
                      
                      <span className="text-[11px] font-mono text-gray-300 font-bold">
                        {Math.floor(videoCurrentTime)}s / {Math.floor(videoDuration)}s
                      </span>

                      {/* Timeline bar with comments dots */}
                      <div
                        onClick={handleTimelineClick}
                        className="h-2 w-full bg-gray-800 rounded-full cursor-pointer relative flex-1"
                      >
                        <div
                          style={{ width: `${(videoCurrentTime / (videoDuration || 1)) * 100}%` }}
                          className="h-full bg-brand-500 rounded-full relative"
                        />
                      </div>
                    </div>
                  </div>
                ) : mediaPath ? (
                  <div
                    ref={imageContainerRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    className="w-full aspect-square relative select-none cursor-crosshair overflow-hidden"
                  >
                    <img src={mediaPath} alt="Asset media" className="w-full h-full object-cover pointer-events-none" />
                    
                    {/* SVG overlay to render visual annotations */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      {(selectedCommentAnnotations || annotations).map((shape, idx) => {
                        if (shape.type === 'pin') {
                          return (
                            <circle key={idx} cx={`${shape.startX}%`} cy={`${shape.startY}%`} r="8" fill={shape.color} stroke="#fff" strokeWidth="2" />
                          );
                        }
                        if (shape.type === 'rect' && shape.endX && shape.endY) {
                          return (
                            <rect key={idx} x={`${Math.min(shape.startX, shape.endX)}%`} y={`${Math.min(shape.startY, shape.endY)}%`} width={`${Math.abs(shape.startX - shape.endX)}%`} height={`${Math.abs(shape.startY - shape.endY)}%`} fill="none" stroke={shape.color} strokeWidth="2.5" />
                          );
                        }
                        if (shape.type === 'circle' && shape.endX && shape.endY) {
                          const r = Math.sqrt(Math.pow(shape.startX - shape.endX, 2) + Math.pow(shape.startY - shape.endY, 2));
                          return (
                            <circle key={idx} cx={`${shape.startX}%`} cy={`${shape.startY}%`} r={`${r}%`} fill="none" stroke={shape.color} strokeWidth="2.5" />
                          );
                        }
                        return null;
                      })}
                    </svg>
                  </div>
                ) : (
                  <div className="p-8 text-center space-y-3">
                    <FileText className="w-12 h-12 text-gray-600 mx-auto" />
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-gray-300">Text-Only Content</p>
                      <p className="text-xs text-gray-500 max-w-xs mx-auto">No image or video asset attached to this post version.</p>
                    </div>
                  </div>
                )}
              </div>

              {selectedCommentAnnotations && (
                <button
                  onClick={() => setSelectedCommentAnnotations(null)}
                  className="w-full text-center text-xs font-bold text-brand-400 hover:text-brand-300 py-1.5 bg-gray-800 border border-gray-700 rounded-xl cursor-pointer"
                >
                  Clear Visual Markup Filter
                </button>
              )}
            </div>

            {/* Platform Live Feed Preview */}
            <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <PlatformIcon platform={primaryAccount?.platform || 'INSTAGRAM'} size="xs" />
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider font-display">
                    {primaryAccount?.platform || 'INSTAGRAM'} · {postTypeLabel} Mockup
                  </span>
                </div>
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {postTypeLabel} Mode
                </span>
              </div>

              {/* Story Mockup */}
              {postTypeLabel === 'Story' ? (
                <div className="bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden shadow-xl relative aspect-[9/16] max-w-[280px] mx-auto flex flex-col justify-between p-3.5 text-white text-left">
                  <div className="z-10 space-y-2">
                    <div className="flex gap-1 w-full">
                      <div className="h-0.5 bg-white/90 rounded-full flex-1" />
                      <div className="h-0.5 bg-white/30 rounded-full flex-1" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar name={primaryAccount?.displayName || 'Brand'} src={primaryAccount?.profileImage} size="xs" />
                        <div>
                          <p className="text-xs font-bold leading-tight">{primaryAccount?.displayName || 'Story User'}</p>
                          <p className="text-[9px] text-gray-300">Your Story</p>
                        </div>
                      </div>
                      <X className="w-4 h-4 text-white/70" />
                    </div>
                  </div>
                  {mediaPath ? (
                    isVideoContent ? (
                      <video src={mediaPath} className="absolute inset-0 w-full h-full object-cover z-0" autoPlay loop muted />
                    ) : (
                      <img src={mediaPath} alt="" className="absolute inset-0 w-full h-full object-cover z-0" />
                    )
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 bg-gradient-to-b from-indigo-900 to-black z-0">
                      <ImageIcon className="w-8 h-8 opacity-50 mb-1" />
                      <span className="text-[10px] font-bold">Story Media</span>
                    </div>
                  )}
                  <div className="z-10 flex items-center gap-2 pt-2">
                    <div className="flex-1 bg-white/20 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/20 text-[10px] text-white/80">Send message...</div>
                    <Heart className="w-4 h-4 text-white stroke-[2]" />
                  </div>
                </div>
              ) : postTypeLabel === 'Reel' ? (
                /* Reel Mockup */
                <div className="bg-black border border-gray-800 rounded-2xl overflow-hidden shadow-xl relative aspect-[9/16] max-w-[280px] mx-auto flex flex-col justify-between p-3.5 text-white text-left">
                  {mediaPath ? (
                    isVideoContent ? (
                      <video src={mediaPath} className="absolute inset-0 w-full h-full object-cover z-0" autoPlay loop muted />
                    ) : (
                      <img src={mediaPath} alt="" className="absolute inset-0 w-full h-full object-cover z-0" />
                    )
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 bg-gradient-to-b from-gray-900 to-black z-0">
                      <Film className="w-8 h-8 opacity-50 mb-1 text-brand-400" />
                      <span className="text-[10px] font-bold">Reel Video</span>
                    </div>
                  )}
                  <div className="z-10 flex items-center justify-between text-[11px] font-bold">
                    <span>Reels</span><Camera className="w-4 h-4" />
                  </div>
                  <div className="absolute right-2.5 bottom-12 z-10 flex flex-col items-center gap-3 text-white">
                    <Heart className="w-5 h-5" /><MessageCircle className="w-5 h-5" /><Send className="w-5 h-5" />
                  </div>
                  <div className="z-10 space-y-1 pr-10 text-left bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2 -mx-3.5 -mb-3.5 rounded-b-2xl">
                    <div className="flex items-center gap-1.5">
                      <Avatar name={primaryAccount?.displayName || 'Brand'} src={primaryAccount?.profileImage} size="xs" />
                      <span className="text-[11px] font-bold">{primaryAccount?.displayName}</span>
                    </div>
                    <p className="text-[11px] text-white/90 line-clamp-2">{post.content}</p>
                  </div>
                </div>
              ) : (
                /* Post / Carousel Mockup */
                <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-200 shadow-2xs text-left">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={primaryAccount?.displayName || primaryAccount?.username || 'Social Workspace'}
                      src={primaryAccount?.profileImage}
                      size="sm"
                    />
                    <div className="text-left leading-none min-w-0 flex-1">
                      <span className="font-bold text-gray-900 text-sm block truncate">
                        {primaryAccount?.displayName || primaryAccount?.username || 'Social Workspace'}
                      </span>
                      <p className="text-[10px] text-gray-400 mt-1 font-medium">
                        @{primaryAccount?.username || 'schedit.brand'} · {postTypeLabel}
                      </p>
                    </div>
                  </div>

                  {mediaPath && (
                    <div className="rounded-xl overflow-hidden border border-gray-100 max-h-56 bg-black">
                      {isVideoContent ? (
                        <video src={mediaPath} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={mediaPath} alt="Feed mockup" className="w-full h-full object-cover" />
                      )}
                    </div>
                  )}

                  <p className="text-xs text-gray-800 leading-relaxed font-medium whitespace-pre-wrap text-left">
                    {post.content}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── COLUMN 2: Details, Captions & Rescheduling Controls ── */}
        <div className="w-full xl:w-[34%] border-b xl:border-b-0 xl:border-r border-gray-200 flex flex-col bg-white overflow-visible xl:overflow-y-auto pr-0 xl:pr-1">
          <div className="p-4 sm:p-6 space-y-6">
            
            {/* Main Content & Captions */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-display">Content Copy & Overrides</h3>
              <Textarea
                label="Primary Content Copy"
                rows={5}
                value={post.content}
                disabled
                className="bg-gray-50/70 border-gray-200 font-medium text-gray-800 text-xs leading-relaxed"
              />

              {post.overrides && post.overrides.map((over: any) => (
                <div key={over.id} className="p-4 border border-gray-200 bg-gray-50/50 rounded-2xl space-y-3 text-xs">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <PlatformIcon platform={over.socialAccount?.platform} size="xs" />
                    <span className="font-bold text-gray-900">@{over.socialAccount?.username}</span>
                  </div>
                  <Textarea rows={3} value={over.caption || ''} disabled className="bg-white text-xs" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px]">
                    <div className="bg-white p-2 border border-gray-200 rounded-xl">
                      <p className="font-semibold text-gray-400">Hashtags</p>
                      <p className="font-bold text-gray-700 mt-0.5 truncate">{over.hashtags || 'None'}</p>
                    </div>
                    <div className="bg-white p-2 border border-gray-200 rounded-xl">
                      <p className="font-semibold text-gray-400">First Comment</p>
                      <p className="font-bold text-gray-700 mt-0.5 truncate">{over.settings?.firstComment || 'None'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Rescheduling & Queue Parameters */}
            <div className="border-t border-gray-100 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 font-display">
                <Clock className="w-4 h-4 text-brand-600" /> Scheduling & Queue Parameters
              </h4>

              {scheduledTime && (
                <div className="p-3 bg-brand-50 border border-brand-150 rounded-xl flex items-center gap-2 text-xs font-bold text-brand-800">
                  <CalendarIcon className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>
                    Scheduled: {new Date(scheduledTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} ({timezone})
                  </span>
                </div>
              )}

              <div className="space-y-4 bg-gray-50/50 p-4 border border-gray-200 rounded-2xl">
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-bold text-gray-700">Publish Date & Time</label>
                  <input
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 outline-none text-gray-900 font-semibold text-xs cursor-pointer focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1.5 text-left">
                    <label className="block font-bold text-gray-700">Timezone</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 outline-none text-gray-900 font-semibold text-xs cursor-pointer"
                    >
                      <option value="UTC">UTC</option>
                      <option value="EST">EST (New York)</option>
                      <option value="PST">PST (Los Angeles)</option>
                      <option value="IST">IST (India)</option>
                      <option value="CET">CET (Central Europe)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="block font-bold text-gray-700">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 outline-none text-gray-900 font-semibold text-xs cursor-pointer"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                </div>

                <Button
                  onClick={handleReschedule}
                  variant="primary"
                  size="sm"
                  className="w-full bg-brand-600 hover:bg-brand-500 font-bold shadow-xs cursor-pointer text-xs py-2.5"
                >
                  Save Rescheduling Changes
                </Button>
              </div>
            </div>

            {/* Member Assignments */}
            {!isClientUser && (
              <div className="border-t border-gray-100 pt-6 space-y-4 text-xs">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 font-display">
                  <User className="w-4 h-4 text-brand-600" /> Member Assignments
                </h4>

                <div className="space-y-3 bg-gray-50/50 p-4 border border-gray-200 rounded-2xl">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Assign HOD Reviewer</label>
                    <select
                      onChange={(e) => handleAssignReviewer(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 outline-none text-gray-800 font-semibold text-xs"
                    >
                      <option value="">Select HOD...</option>
                      {members.filter((m: any) => m.role !== 'CLIENT').map((m: any) => (
                        <option key={m.id} value={m.userId || m.user?.id}>{m.user?.name || m.user?.email || m.userId}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Assign Client Approver</label>
                    <select
                      onChange={(e) => handleAssignClient(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 outline-none text-gray-800 font-semibold text-xs"
                    >
                      <option value="">Select Client...</option>
                      {members.filter((m: any) => m.role === 'CLIENT').map((m: any) => (
                        <option key={m.id} value={m.userId || m.user?.id}>{m.user?.name || m.user?.email || m.userId}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── COLUMN 3: Approval Checklists, Versions & Comments ── */}
        <div className="w-full xl:w-[28%] flex flex-col bg-white overflow-visible xl:overflow-y-auto pr-0 xl:pr-1">
          <div className="p-4 sm:p-6 space-y-6">
            
            {/* Approval Checklist */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 font-display">
                <CheckSquare className="w-4 h-4 text-brand-600" /> Quality Approval Checklist
              </h3>
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl bg-white p-4 space-y-2 text-xs text-gray-700 shadow-2xs">
                {Object.keys(checklist).map(key => (
                  <label key={key} className="flex items-center gap-2.5 font-semibold text-gray-700 leading-none cursor-pointer py-1.5 first:pt-0 last:pb-0">
                    <input
                      type="checkbox"
                      checked={(checklist as any)[key]}
                      onChange={(e) => setChecklist(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Version Control History */}
            <div className="border-t border-gray-100 pt-6 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 font-display">
                  <History className="w-4 h-4 text-brand-600" /> Version History
                </h3>
                {post.versions?.length > 1 && (
                  <button onClick={handleCompareVersions} className="text-[10px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 cursor-pointer">
                    <GitCompare className="w-3.5 h-3.5" /> Compare
                  </button>
                )}
              </div>

              {showCompare && comparedData && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs space-y-2 relative">
                  <button onClick={() => setShowCompare(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 font-bold">×</button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:divide-x divide-gray-200">
                    <div>
                      <p className="font-bold text-gray-500 mb-1.5">V{comparedData.v1?.versionNumber}</p>
                      <p className="text-gray-600 mt-1 font-medium leading-relaxed truncate">{comparedData.v1?.content}</p>
                    </div>
                    <div className="pl-3">
                      <p className="font-bold text-brand-600 mb-1.5">V{comparedData.v2?.versionNumber}</p>
                      <p className="text-brand-800 mt-1 font-semibold leading-relaxed truncate">{comparedData.v2?.content}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden bg-white text-xs shadow-2xs">
                {post.versions?.map((ver: any) => (
                  <div key={ver.id} className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div>
                      <span className="font-bold text-gray-900">Snapshot V{ver.versionNumber}</span>
                      <p className="text-[10px] text-gray-400 mt-0.5">By {ver.editor?.name || 'Editor'} · {new Date(ver.createdAt).toLocaleDateString()}</p>
                    </div>
                    {ver.versionNumber < post.versions.length && (
                      <Button variant="secondary" size="xs" onClick={() => handleRestoreVersion(ver.id)}>Restore</Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Comments Feed */}
            <div className="border-t border-gray-100 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 font-display">
                  <MessageSquare className="w-4 h-4 text-brand-600" /> Discussion Stream
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                  {commentsFeed.length} comments
                </span>
              </div>

              {/* Comment Tab Filters */}
              {!isClientUser && (
                <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setActiveCommentTab('internal')}
                    className={cn(
                      "flex-1 py-1 rounded-lg transition-all cursor-pointer",
                      activeCommentTab === 'internal' ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500"
                    )}
                  >
                    Internal Team
                  </button>
                  <button
                    onClick={() => setActiveCommentTab('client')}
                    className={cn(
                      "flex-1 py-1 rounded-lg transition-all cursor-pointer",
                      activeCommentTab === 'client' ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500"
                    )}
                  >
                    Client Facing
                  </button>
                </div>
              )}

              {/* Comments Feed */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {commentsFeed.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No comments logged yet.</p>
                ) : (
                  commentsFeed.map((c: any) => (
                    <div key={c.id} className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5 text-xs text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900">{c.user?.name || c.user?.email || 'User'}</span>
                        <span className="text-[10px] text-gray-400">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed font-medium">{c.comment}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <Textarea
                  placeholder="Type feedback or notes..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={2}
                  className="text-xs border-gray-200 focus:border-brand-400"
                />
                <Button
                  onClick={handleAddComment}
                  variant="primary"
                  size="sm"
                  className="w-full bg-brand-600 hover:bg-brand-500 font-bold shadow-xs cursor-pointer text-xs"
                  icon={<Send className="w-3.5 h-3.5" />}
                >
                  Post Comment
                </Button>
              </div>
            </div>

          </div>
        </div>

      </div>
      <div className="sm:hidden fixed inset-x-0 bottom-0 z-30 bg-white/95 backdrop-blur border-t border-gray-200 p-3 safe-bottom shadow-modal">
        <div className="flex gap-2">
          {!isClientUser ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleHODDecision('CHANGES_REQUESTED')}
                icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
                className="flex-1 text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100 font-bold"
              >
                Changes
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleHODDecision('APPROVED')}
                icon={<CheckCircle2 className="w-4 h-4" />}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 font-bold shadow-xs"
              >
                Approve
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleHODDecision('APPROVED')}
              icon={<CheckCircle2 className="w-4 h-4" />}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 font-bold shadow-xs"
            >
              Approve
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkflowDetail;
