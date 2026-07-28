import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Check, X, Send, Clock, MousePointer, Layers, Calendar, ChevronRight, ArrowLeft, RefreshCw, Loader2, Video, MessageSquare } from 'lucide-react';
import { clientApiRequest } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { Button, PageHeader, Avatar, StatusPill, PlatformIcon, Input, Badge, Card } from '../../components/ui';
import { format } from 'date-fns';

interface Comment {
  id: string;
  comment: string;
  timestamp: number | null;
  annotations: any | null;
  user: { name: string; avatarUrl?: string };
  createdAt: string;
  replies?: Comment[];
}

export function ClientReviewDetail() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Video player controls
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [timestampMark, setTimestampMark] = useState<number | null>(null);

  // Canvas / Image Annotation controls
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [shapes, setShapes] = useState<any[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState<'select' | 'pin'>('select');
  const [pins, setPins] = useState<{ x: number; y: number; text: string }[]>([]);

  useEffect(() => {
    async function loadPost() {
      if (!postId) return;
      try {
        const data = await clientApiRequest(`/api/v1/clients/me/reviews/${postId}`);
        setPost(data);
        setComments(data.comments || []);
      } catch (err: any) {
        toastError('Failed to load content details', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [postId]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
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

  const setVideoTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      setCurrentTime(seconds);
      if (!isPlaying) {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (drawMode !== 'pin' || !imageContainerRef.current) return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPins([...pins, { x, y, text: `Annotation ${pins.length + 1}` }]);
    setNewComment((prev) => `${prev} [Pin annotation: At position (${Math.round(x)}%, ${Math.round(y)}%)]`);
    setDrawMode('select');
    toastSuccess('Annotation Pin Placed', 'Type your comment to tie it to this annotation.');
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !postId) return;

    setSubmitting(true);
    try {
      const savedComment = await clientApiRequest(`/api/v1/clients/me/reviews/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({
          comment: newComment,
          timestamp: timestampMark ? parseFloat(timestampMark.toFixed(1)) : undefined,
          annotations: pins.length > 0 ? pins : undefined,
        }),
      });

      setComments([...comments, savedComment]);
      setNewComment('');
      setTimestampMark(null);
      setPins([]);
      toastSuccess('Comment Added', 'Your feedback was logged successfully.');
    } catch (err: any) {
      toastError('Failed to add comment', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecision = async (status: 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED') => {
    if (!postId) return;
    setActionLoading(true);
    try {
      const result = await clientApiRequest(`/api/v1/clients/me/reviews/${postId}/decision`, {
        method: 'POST',
        body: JSON.stringify({
          status,
          comments: `Decision submitted by client. Status set to ${status}.`,
        }),
      });

      setPost((prev: any) => ({ ...prev, status: result.newStatus }));
      toastSuccess('Review Submitted', `Status successfully updated to: ${status}`);
    } catch (err: any) {
      toastError('Submission failed', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-8 text-center text-left">
        <p className="text-red-500 font-semibold">Workspace item not found.</p>
        <Link to="/client/dashboard" className="text-brand-600 font-semibold mt-4 inline-block">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const activeMedia = post.media && post.media[0];
  const isVideo = activeMedia && (activeMedia.mediaType === 'VIDEO' || activeMedia.mediaType === 'REEL' || activeMedia.mediaType === 'SHORT');

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100dvh-3.5rem)] lg:h-[calc(100vh-3.5rem)] w-full overflow-x-hidden lg:overflow-hidden text-left bg-gray-50">
      {/* Left Area - Review & Media Workspace */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 pb-bottom-nav lg:pb-6">
        <div className="flex items-center gap-3">
          <Link to="/client/reviews" className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">{post.project.name}</span>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">{post.content?.substring(0, 80) || 'Review details'}</h2>
          </div>
        </div>

        {/* Media Preview Container */}
        <Card className="overflow-hidden border border-gray-200/80 bg-gray-950 flex flex-col items-center justify-center min-h-[260px] sm:min-h-[380px] max-h-[500px] relative">
          {isVideo ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              <video
                ref={videoRef}
                src={activeMedia.secureUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                className="max-h-[400px] max-w-full"
                onClick={handlePlayPause}
              />
              {/* Play controls overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap sm:items-center gap-3 sm:gap-4 bg-black/70 backdrop-blur-md py-2 px-4 rounded-xl text-white">
                <button onClick={handlePlayPause} className="hover:text-brand-400 transition-colors">
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <span className="text-xs font-mono">
                  {Math.round(currentTime)}s / {Math.round(duration)}s
                </span>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => setVideoTime(parseFloat(e.target.value))}
                  className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => setTimestampMark(currentTime)}
                  className="bg-gray-800 text-xs border-transparent hover:bg-gray-700 text-white"
                >
                  Mark Timestamp
                </Button>
              </div>
            </div>
          ) : activeMedia ? (
            <div
              ref={imageContainerRef}
              onClick={handleImageClick}
              className={`relative max-h-[440px] max-w-full overflow-hidden ${
                drawMode === 'pin' ? 'cursor-crosshair' : 'cursor-default'
              }`}
            >
              <img src={activeMedia.secureUrl} alt="Preview" className="max-h-[400px] w-auto object-contain" />
              {/* Annotation pins */}
              {pins.map((pin, i) => (
                <div
                  key={i}
                  style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                  className="absolute w-6 h-6 rounded-full bg-brand-600 border-2 border-white text-white flex items-center justify-center text-xs font-bold -translate-x-1/2 -translate-y-1/2 shadow-lg animate-pulse"
                >
                  {i + 1}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <p className="font-semibold">No media attached to this post.</p>
            </div>
          )}

          {/* Draw annotation controls for images */}
          {!isVideo && activeMedia && (
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/95 backdrop-blur shadow-lg border border-gray-200 p-1.5 rounded-xl">
              <button
                onClick={() => setDrawMode('select')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  drawMode === 'select' ? 'bg-brand-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Select
              </button>
              <button
                onClick={() => setDrawMode('pin')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  drawMode === 'pin' ? 'bg-brand-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <MousePointer className="w-3.5 h-3.5" /> Place Pin
              </button>
            </div>
          )}
        </Card>

        {/* Action Panel */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Workflow Status</p>
            <div className="mt-1 flex items-center gap-2">
              <StatusPill status={post.status} />
              <span className="text-xs text-gray-400 font-semibold font-mono">ID: {post.id.substring(0, 8)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
            <Button
              variant="secondary"
              className="border-red-200 hover:bg-red-50 text-red-700 font-bold"
              disabled={actionLoading}
              onClick={() => handleDecision('CHANGES_REQUESTED')}
            >
              Request Changes
            </Button>
            <Button
              variant="primary"
              className="bg-emerald-600 border-transparent hover:bg-emerald-700 text-white font-bold shadow-sm"
              disabled={actionLoading}
              onClick={() => handleDecision('APPROVED')}
              icon={<Check className="w-4 h-4" />}
            >
              Approve Post
            </Button>
          </div>
        </div>

        {/* Post Caption Details */}
        <Card className="p-5 space-y-4">
          <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-3">Post Details</h3>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Caption & Content</p>
            <p className="text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200/60 rounded-2xl p-4 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Scheduled Date</p>
              <p className="text-sm font-semibold text-gray-800">
                {format(new Date(post.scheduledTime), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Scheduled Time</p>
              <p className="text-sm font-semibold text-gray-800">
                {format(new Date(post.scheduledTime), 'h:mm a (z)')}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Right Area - Collaborative Feedback Sidebar */}
      <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-gray-200 bg-white flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
            <MessageSquare className="w-4.5 h-4.5 text-brand-600" />
            Client Feedback Portal
          </h3>
          <Badge variant="neutral">Client Visible Only</Badge>
        </div>

        {/* Comment Thread List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="space-y-2">
              <div className="flex items-start gap-2.5">
                <Avatar name={comment.user?.name || 'Client'} src={comment.user?.avatarUrl} size="sm" />
                <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <p className="font-bold text-xs text-gray-800 truncate">{comment.user?.name}</p>
                    <p className="text-[10px] text-gray-400 font-semibold shrink-0">
                      {format(new Date(comment.createdAt), 'MMM d · h:mm a')}
                    </p>
                  </div>
                  {comment.timestamp !== null && (
                    <button
                      onClick={() => setVideoTime(comment.timestamp!)}
                      className="inline-flex items-center gap-1 mb-1.5 px-2 py-0.5 bg-brand-50 border border-brand-100 text-brand-700 rounded-lg text-[10px] font-bold font-mono hover:bg-brand-100 transition-colors"
                    >
                      <Clock className="w-3 h-3 text-brand-500" />
                      {comment.timestamp}s
                    </button>
                  )}
                  <p className="text-xs font-semibold text-gray-700 leading-normal break-words">{comment.comment}</p>
                </div>
              </div>

              {/* Replies */}
              {comment.replies && comment.replies.map((reply) => (
                <div key={reply.id} className="flex items-start gap-2.5 ml-6">
                  <Avatar name={reply.user?.name || 'User'} src={reply.user?.avatarUrl} size="xs" />
                  <div className="bg-gray-50/50 rounded-2xl p-2.5 border border-gray-200/50 flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <p className="font-bold text-[11px] text-gray-800 truncate">{reply.user?.name}</p>
                      <p className="text-[9px] text-gray-400 font-semibold shrink-0">
                        {format(new Date(reply.createdAt), 'h:mm a')}
                      </p>
                    </div>
                    <p className="text-[11px] font-semibold text-gray-700 leading-normal break-words">{reply.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {comments.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs font-semibold">No feedback left on this post yet.</p>
            </div>
          )}
        </div>

        {/* New Comment Input */}
        <form onSubmit={handleAddComment} className="p-4 border-t border-gray-200 bg-gray-50 space-y-3">
          {timestampMark !== null && (
            <div className="flex items-center justify-between px-2.5 py-1.5 bg-brand-50 border border-brand-100 text-brand-700 rounded-xl text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-600" />
                Linked to timestamp: {timestampMark.toFixed(1)}s
              </span>
              <button
                type="button"
                onClick={() => setTimestampMark(null)}
                className="text-brand-600 hover:text-brand-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          {pins.length > 0 && (
            <div className="flex items-center justify-between px-2.5 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-bold animate-fade-in">
              <span>Annotation Pin Registered</span>
              <button
                type="button"
                onClick={() => setPins([])}
                className="text-emerald-600 hover:text-emerald-800 transition-colors"
              >
                Clear Pin
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Leave client feedback..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
              disabled={submitting}
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submitting}
              className="shadow-sm font-bold"
              iconRight={<Send className="w-3.5 h-3.5" />}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
export default ClientReviewDetail;
