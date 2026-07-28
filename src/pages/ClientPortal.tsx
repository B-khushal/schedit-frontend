import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Check, X, Send, Clock, MapPin, MousePointer, HelpCircle, Layers, Calendar, ChevronRight, Award, Lock, ExternalLink, RefreshCw } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { useToast } from '../components/ui/Toast';
import { Button, PageHeader, Avatar, StatusPill, PlatformIcon, Input, Badge } from '../components/ui';

interface Comment {
  id: string;
  comment: string;
  timestamp: number | null;
  annotations: any | null;
  user: { name: string; avatarUrl: string };
  createdAt: string;
}

export function ClientPortal() {
  const { success: toastSuccess, error: toastError } = useToast();

  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Video player controls
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [timestampMark, setTimestampMark] = useState<number | null>(null);

  // Canvas drawing controls
  const imageRef = useRef<HTMLImageElement>(null);
  const [drawMode, setDrawMode] = useState<'select' | 'pin' | 'rect' | 'arrow'>('select');
  const [shapes, setShapes] = useState<any[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [activeShape, setActiveShape] = useState<any>(null);

  async function loadClientData() {
    try {
      const orgs = await apiRequest('/api/v1/organizations');
      if (orgs && orgs.length > 0) {
        const firstProj = orgs[0].projects[0];
        const allPosts = await apiRequest(`/api/v1/projects/${firstProj.id}/posts`);
        
        // Load posts that require client reviews
        const clientQueue = allPosts.filter((p: any) => 
          p.status === 'CLIENT_REVIEW' || 
          p.status === 'CLIENT_CHANGES_REQUESTED' || 
          p.status === 'APPROVED'
        );
        setPosts(clientQueue);
        
        if (clientQueue.length > 0 && !selectedPost) {
          setSelectedPost(clientQueue[0]);
          loadPostComments(clientQueue[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading client workspace:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadPostComments(postId: string) {
    try {
      const comms = await apiRequest(`/api/v1/posts/${postId}/comments`);
      setComments(comms);
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  }

  useEffect(() => {
    loadClientData();
  }, []);

  const handleSelectPost = (post: any) => {
    setSelectedPost(post);
    setComments([]);
    setShapes([]);
    loadPostComments(post.id);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleVideoSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const getMousePos = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!imageRef.current) return { x: 0, y: 0 };
    const rect = imageRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (drawMode === 'select') return;
    const pos = getMousePos(e);
    setIsDrawing(true);
    setStartPos(pos);

    if (drawMode === 'pin') {
      const newPin = { type: 'pin', x: pos.x, y: pos.y, id: Date.now().toString() };
      setShapes([...shapes, newPin]);
      setIsDrawing(false);
    } else {
      setActiveShape({
        id: Date.now().toString(),
        type: drawMode,
        x: pos.x,
        y: pos.y,
        w: 0,
        h: 0,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing || !activeShape) return;
    const pos = getMousePos(e);
    const w = pos.x - startPos.x;
    const h = pos.y - startPos.y;

    setActiveShape({
      ...activeShape,
      w,
      h,
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (activeShape) {
      setShapes([...shapes, activeShape]);
      setActiveShape(null);
    }
  };

  const handleClientDecision = async (decision: 'APPROVED' | 'CHANGES_REQUESTED') => {
    if (!selectedPost) return;
    setSubmitting(true);
    try {
      const req = await apiRequest('/api/v1/approvals/requests', {
        method: 'POST',
        body: JSON.stringify({ scheduledPostId: selectedPost.id }),
      });

      await apiRequest(`/api/v1/approvals/requests/${req.id}/reviews`, {
        method: 'POST',
        body: JSON.stringify({
          status: decision,
          comments: `Client review decision: ${decision.toLowerCase().replace('_', ' ')}`,
        }),
      });

      toastSuccess('Decision submitted', `Successfully marked post as ${decision.toLowerCase().replace('_', ' ')}.`);
      loadClientData();
    } catch (err: any) {
      toastError('Decision Failed', err.message || 'Error submitting review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedPost) return;
    setSubmitting(true);
    try {
      const annotationsPayload = shapes.length > 0 ? shapes : null;
      const timestampPayload = timestampMark !== null ? timestampMark : null;

      await apiRequest(`/api/v1/posts/${selectedPost.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({
          comment: newComment,
          timestamp: timestampPayload,
          annotations: annotationsPayload,
        }),
      });

      setNewComment('');
      setTimestampMark(null);
      setShapes([]);
      toastSuccess('Comment added', 'Review feedback pinned to post timeline.');
      loadPostComments(selectedPost.id);
    } catch (err: any) {
      toastError('Comment Failed', err.message || 'Could not submit review comment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-dvh lg:h-screen w-full bg-gray-50 text-gray-900 overflow-x-hidden lg:overflow-hidden font-sans">
      {/* Client Header */}
      <header className="px-4 sm:px-6 py-4 bg-white border-b border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="px-3 py-1.5 bg-brand-600 text-white rounded-xl font-bold text-sm tracking-widest">SCHEDIT</div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2.5 py-1 bg-gray-100 rounded-full border border-gray-200 truncate">
            External Portal Review Board
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full w-fit">
          <Lock className="w-3.5 h-3.5" /> Isolated Client Session
        </div>
      </header>

      {/* Main Review Panels */}
      <div className="flex-1 flex flex-col xl:flex-row overflow-y-auto xl:overflow-hidden pb-bottom-nav sm:pb-0">
        {/* Left Side: Campaign list */}
        <aside className="w-full xl:w-80 border-b xl:border-b-0 xl:border-r border-gray-200 bg-white p-4 sm:p-6 flex flex-col shrink-0 overflow-visible xl:overflow-y-auto space-y-4 xl:space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider">Awaiting Approvals</h3>
            <Badge variant="brand">{posts.length} Pending</Badge>
          </div>

          <div className="flex xl:block gap-3 overflow-x-auto scrollbar-hide pb-1 xl:pb-0 xl:space-y-3">
            {posts.map((post) => {
              const isActive = selectedPost?.id === post.id;
              const hasVideo = post.media?.some((m: any) => m.mediaType === 'VIDEO');
              
              return (
                <div
                  key={post.id}
                  onClick={() => handleSelectPost(post)}
                  className={cn(
                    "min-w-[260px] xl:min-w-0 p-4 rounded-2xl border transition-all cursor-pointer text-left bg-white",
                    isActive 
                      ? "border-brand-500 ring-2 ring-brand-500/10 shadow-card bg-brand-50/[0.01]"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">Campaign queue item</p>
                  <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-relaxed mb-3">{post.content}</p>
                  <div className="flex justify-between items-center text-[10px] font-bold text-gray-400">
                    <span>{hasVideo ? '🎥 Video' : '🖼️ Image'} post</span>
                    <StatusPill status={post.status} size="sm" />
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Middle Panel: Visual Annotation and Media Canvas */}
        <main className="flex-1 p-4 md:p-8 flex flex-col overflow-visible xl:overflow-y-auto space-y-6 bg-gray-50/50 text-left">
          {selectedPost ? (
            <div className="flex-1 flex flex-col space-y-6 max-w-4xl mx-auto w-full">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 font-display">Annotation Review Canvas</h2>
                  <p className="text-xs text-gray-500 mt-1">Review override thumbnails, captions and draw markers directly.</p>
                </div>
                <div className="hidden sm:flex gap-2">
                  <Button
                    onClick={() => handleClientDecision('APPROVED')}
                    variant="success"
                    size="sm"
                    loading={submitting}
                    icon={<Check className="w-4 h-4" />}
                  >
                    Approve Post
                  </Button>
                  <Button
                    onClick={() => handleClientDecision('CHANGES_REQUESTED')}
                    variant="danger"
                    size="sm"
                    loading={submitting}
                    icon={<X className="w-4 h-4" />}
                  >
                    Request Revisions
                  </Button>
                </div>
              </div>

              {/* Interactive Canvas container */}
              <div className="flex-1 min-h-[260px] sm:min-h-[350px] bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden relative flex flex-col items-center justify-center p-3 sm:p-4">
                {selectedPost.media?.some((m: any) => m.mediaType === 'VIDEO') ? (
                  // Video Timeline Tracker
                  <div className="w-full h-full flex flex-col items-center justify-center relative">
                    <video
                      ref={videoRef}
                      src={selectedPost.media?.[0]?.secureUrl || selectedPost.media?.[0]?.storagePath || "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-his-laptop-computer-34283-large.mp4"}
                      className="max-h-[300px] rounded-xl shadow-card object-contain bg-black"
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                    />

                    {/* Timeline Controls */}
                    <div className="w-full mt-4 bg-gray-50 p-3 rounded-xl border border-gray-200 flex flex-wrap sm:items-center gap-3 sm:gap-4 text-xs font-semibold">
                      <button onClick={togglePlay} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-gray-900">
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <div className="flex-1 relative h-1.5 bg-gray-200 rounded-full cursor-pointer overflow-hidden" onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const percent = (e.clientX - rect.left) / rect.width;
                        handleVideoSeek(percent * duration);
                      }}>
                        <div className="absolute top-0 left-0 h-full bg-brand-600" style={{ width: `${(currentTime/duration)*100}%` }} />
                      </div>
                      <span className="font-mono text-gray-600">
                        {Math.floor(currentTime/60)}:{(Math.floor(currentTime)%60).toString().padStart(2, '0')} / 
                        {Math.floor(duration/60)}:{(Math.floor(duration)%60).toString().padStart(2, '0')}
                      </span>
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => setTimestampMark(currentTime)}
                      >
                        Pin Timestamp
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Image drawing canvas
                  <div className="relative max-h-[300px] w-full flex items-center justify-center">
                    <img
                      ref={imageRef}
                      src={selectedPost.media?.[0]?.storagePath || "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&fit=crop"}
                      alt="Review Item"
                      className="max-h-[300px] object-contain rounded-xl border border-gray-100 pointer-events-none select-none"
                    />
                    
                    <svg
                      className="absolute inset-0 w-full h-full cursor-crosshair"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                    >
                      {shapes.map((s) => (
                        <g key={s.id}>
                          {s.type === 'pin' && (
                            <circle cx={`${s.x}%`} cy={`${s.y}%`} r="6" fill="#8b5cf6" stroke="#fff" strokeWidth="2" className="shadow-md" />
                          )}
                          {s.type === 'rect' && (
                            <rect x={`${s.x}%`} y={`${s.y}%`} width={`${s.w}%`} height={`${s.h}%`} fill="rgba(139, 92, 246, 0.08)" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="3 3" />
                          )}
                          {s.type === 'arrow' && (
                            <line x1={`${s.x}%`} y1={`${s.y}%`} x2={`${s.x + s.w}%`} y2={`${s.y + s.h}%`} stroke="#8b5cf6" strokeWidth="3" />
                          )}
                        </g>
                      ))}

                      {activeShape && (
                        <g>
                          {activeShape.type === 'rect' && (
                            <rect x={`${activeShape.x}%`} y={`${activeShape.y}%`} width={`${activeShape.w}%`} height={`${activeShape.h}%`} fill="rgba(139, 92, 246, 0.05)" stroke="#8b5cf6" strokeWidth="2" />
                          )}
                        </g>
                      )}
                    </svg>

                    {/* Canvas Drawing tools toolbar */}
                    <div className="absolute top-3 left-3 bg-white/90 p-1 rounded-xl border border-gray-200/80 flex gap-1 z-10 shadow-sm">
                      {[
                        { id: 'select', label: 'Pointer', icon: MousePointer },
                        { id: 'pin', label: 'Pin Comment', icon: MapPin },
                        { id: 'rect', label: 'Box Selection', icon: Layers },
                      ].map(mode => (
                        <button
                          key={mode.id}
                          onClick={() => setDrawMode(mode.id as any)}
                          className={cn("p-1.5 rounded-lg text-gray-500 hover:text-gray-900 transition-colors cursor-pointer", drawMode === mode.id && "bg-brand-600 text-white hover:text-white")}
                          title={mode.label}
                        >
                          <mode.icon className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Feedback Comment inputs */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-card space-y-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Leave Feedback Comments</h3>
                
                <div className="flex gap-2 items-center flex-wrap">
                  {timestampMark !== null && (
                    <span className="px-2.5 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Stamp: {Math.floor(timestampMark / 60)}:{(Math.floor(timestampMark) % 60).toString().padStart(2, '0')}
                    </span>
                  )}
                  {shapes.length > 0 && (
                    <span className="px-2.5 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" /> {shapes.length} Annotations Drawn
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    placeholder="Provide specific feedback text..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1"
                    disabled={submitting}
                  />
                  <Button
                    variant="primary"
                    onClick={handleAddComment}
                    loading={submitting}
                    icon={<Send className="w-4 h-4" />}
                  >
                    Post Comment
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 font-semibold p-8 bg-white border border-gray-200 rounded-2xl shadow-card max-w-4xl mx-auto w-full">
              No content items require client verification right now.
            </div>
          )}
        </main>

        {/* Right Side: Discussions logs */}
        <aside className="w-full xl:w-96 border-t xl:border-t-0 xl:border-l border-gray-200 bg-white p-4 sm:p-6 flex flex-col shrink-0 overflow-visible xl:overflow-y-auto space-y-6">
          <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider text-left">Discussion Feed</h3>
          
          <div className="flex-1 space-y-4 text-left">
            {comments.map((c) => (
              <div key={c.id} className="p-4 bg-gray-50/50 border border-gray-150 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar name={c.user?.name} size="xs" />
                    <span className="text-xs font-bold text-gray-900">{c.user?.name}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold">{format(new Date(c.createdAt), 'MMM dd, h:mm a')}</span>
                </div>
                
                {c.timestamp !== null && (
                  <button
                    onClick={() => handleVideoSeek(c.timestamp!)}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-brand-50 border border-brand-100 text-brand-700 rounded text-[10px] font-mono hover:bg-brand-100 transition-all cursor-pointer"
                  >
                    ⏱️ timestamp {Math.floor(c.timestamp / 60)}:{(Math.floor(c.timestamp) % 60).toString().padStart(2, '0')}
                  </button>
                )}

                <p className="text-xs text-gray-600 leading-relaxed font-semibold">{c.comment}</p>

                {c.annotations && (
                  <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider pt-2 border-t border-gray-200/50">
                    🎨 Visual markup annotations saved
                  </div>
                )}
              </div>
            ))}

            {comments.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-8 font-semibold">No feedback reviews recorded yet.</p>
            )}
          </div>
        </aside>
      </div>
      {selectedPost && (
        <div className="sm:hidden fixed inset-x-0 bottom-0 z-30 bg-white/95 backdrop-blur border-t border-gray-200 p-3 safe-bottom shadow-modal">
          <div className="flex gap-2">
            <Button
              onClick={() => handleClientDecision('APPROVED')}
              variant="success"
              size="sm"
              loading={submitting}
              icon={<Check className="w-4 h-4" />}
              className="flex-1"
            >
              Approve
            </Button>
            <Button
              onClick={() => handleClientDecision('CHANGES_REQUESTED')}
              variant="danger"
              size="sm"
              loading={submitting}
              icon={<X className="w-4 h-4" />}
              className="flex-1"
            >
              Revisions
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
export default ClientPortal;
