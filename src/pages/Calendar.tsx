import React, { useState, useEffect, useMemo } from 'react';
import { format, startOfWeek, addDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, addWeeks, subWeeks, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Filter, Clock, Eye, AlertCircle, RefreshCw } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useToast } from '../components/ui/Toast';
import { Button, PageHeader, StatusPill, PlatformIcon, Dropdown, DropdownItem, DropdownLabel, DropdownSeparator } from '../components/ui';

type CalendarView = 'month' | 'week' | 'day' | 'agenda';

export function Calendar() {
  const navigate = useNavigate();
  const { currentProject } = useWorkspace();
  const { success: toastSuccess, error: toastError } = useToast();

  const [view, setView] = useState<CalendarView>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters state
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchCalendarPosts = async () => {
    if (!currentProject) return;
    setRefreshing(true);
    try {
      const postsList = await apiRequest(`/api/v1/projects/${currentProject.id}/posts`);
      setPosts(postsList);
    } catch (err) {
      console.error('Failed to load calendar posts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (currentProject) {
      fetchCalendarPosts();
    }
  }, [currentProject]);

  // Navigate date intervals based on view
  const handlePrevDate = () => {
    if (view === 'month') setCurrentDate(prev => subMonths(prev, 1));
    else if (view === 'week') setCurrentDate(prev => subWeeks(prev, 1));
    else setCurrentDate(prev => addDays(prev, -1));
  };

  const handleNextDate = () => {
    if (view === 'month') setCurrentDate(prev => addMonths(prev, 1));
    else if (view === 'week') setCurrentDate(prev => addWeeks(prev, 1));
    else setCurrentDate(prev => addDays(prev, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Generate date array according to current calendar view
  const days = useMemo(() => {
    if (view === 'month') {
      const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
      const end = addDays(start, 41); // Fixed 6-week layout grid
      return eachDayOfInterval({ start, end });
    } else if (view === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
    } else {
      return [currentDate];
    }
  }, [currentDate, view]);

  // Filtered posts based on state
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // Platform filter
      if (platformFilter !== 'all') {
        const matchesPlatform = post.platforms?.some(
          (p: any) => p.socialAccount?.platform?.toLowerCase() === platformFilter.toLowerCase()
        );
        if (!matchesPlatform) return false;
      }
      // Status filter
      if (statusFilter !== 'all') {
        if (post.status?.toLowerCase() !== statusFilter.toLowerCase()) return false;
      }
      return true;
    });
  }, [posts, platformFilter, statusFilter]);

  // Reschedule post update handler via API PATCH
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropEvent = async (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    const postId = e.dataTransfer.getData('text/plain');
    if (!postId) return;

    const originalPost = posts.find(p => p.id === postId);
    if (!originalPost) return;

    const originalTime = new Date(originalPost.scheduledTime);
    const newScheduledTime = new Date(targetDate);
    newScheduledTime.setHours(originalTime.getHours());
    newScheduledTime.setMinutes(originalTime.getMinutes());

    const socialAccountIds = (originalPost.platforms || [])
      .map((p: any) => p.socialAccountId || p.socialAccount?.id)
      .filter(Boolean);

    try {
      setRefreshing(true);
      await apiRequest(`/api/v1/posts/${postId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          scheduledTime: newScheduledTime.toISOString(),
          content: originalPost.content || '',
          socialAccountIds: socialAccountIds.length > 0 ? socialAccountIds : undefined,
        }),
      });
      toastSuccess('Post Rescheduled', `Moved to ${format(newScheduledTime, 'MMM dd, yyyy h:mm a')}`);
      fetchCalendarPosts();
    } catch (err: any) {
      toastError('Reschedule Failed', err.message || 'Could not save date change.');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto flex flex-col h-[calc(100dvh-3.5rem)] lg:h-[calc(100dvh-3.5rem)] w-full bg-transparent overflow-hidden">
      {/* Calendar Header with navigators */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6 shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-display tracking-tight">Content Calendar</h2>
          <div className="flex items-center bg-white border border-gray-200 rounded-xl shadow-xs p-1">
            <button onClick={handlePrevDate} className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-600 hover:text-gray-900 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 text-xs font-bold text-gray-800 uppercase tracking-wide">
              {view === 'day' ? format(currentDate, 'MMMM dd, yyyy') : format(currentDate, 'MMMM yyyy')}
            </span>
            <button onClick={handleNextDate} className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-600 hover:text-gray-900 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <Button variant="secondary" size="sm" onClick={handleToday}>
            Today
          </Button>
        </div>
        </div>

        {/* View switch panel & actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <Dropdown
            align="right"
            trigger={
              <Button variant="secondary" size="sm" icon={<Filter className="w-4 h-4" />}>
                Filter
              </Button>
            }
          >
            <DropdownLabel>Platform</DropdownLabel>
            {['all', 'linkedin', 'instagram', 'facebook', 'youtube'].map(plat => (
              <DropdownItem key={plat} onClick={() => setPlatformFilter(plat)} className="capitalize">
                {plat === 'all' ? 'All Platforms' : plat}
              </DropdownItem>
            ))}
            <DropdownSeparator />
            <DropdownLabel>Status</DropdownLabel>
            {['all', 'draft', 'scheduled', 'published', 'failed'].map(status => (
              <DropdownItem key={status} onClick={() => setStatusFilter(status)} className="capitalize">
                {status === 'all' ? 'All Statuses' : status}
              </DropdownItem>
            ))}
          </Dropdown>

          <div className="flex bg-white border border-gray-200 p-1 rounded-xl shadow-xs overflow-x-auto scrollbar-hide">
            {(['month', 'week', 'day', 'agenda'] as CalendarView[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "px-3 sm:px-3.5 py-1.5 text-xs font-bold capitalize rounded-lg transition-all whitespace-nowrap shrink-0",
                  view === v ? "bg-brand-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-800"
                )}
              >
                {v}
              </button>
            ))}
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/app/studio', { state: { defaultDate: currentDate.toISOString() } })}
            icon={<Plus className="w-4 h-4" />}
          >
            New Post
          </Button>
        </div>
      </div>

      {/* Calendar body layout */}
      <div className="flex-1 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-card flex flex-col min-h-0 relative">
        {view === 'agenda' ? (
          // Agenda list view
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {filteredPosts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-12 font-medium">No posts found in calendar view filters.</p>
            ) : (
              filteredPosts.map(post => (
                <div key={post.id} onClick={() => navigate('/app/workflow')} className="p-3 sm:p-4 bg-gray-50/50 rounded-xl border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-gray-50 transition-all cursor-pointer">
                  <div className="flex gap-4 items-start">
                    <Clock className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{format(new Date(post.scheduledTime), 'MMM dd, h:mm a')}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{post.content}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-center">
                    <div className="flex gap-1">
                      {post.platforms?.map((p: any) => (
                        <PlatformIcon key={p.id} platform={p.socialAccount?.platform} size="xs" />
                      ))}
                    </div>
                    <StatusPill status={post.status} size="sm" />
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          // Standard Calendar grid layouts
          <div className="flex-1 flex flex-col min-h-0">
            {/* Day Header row */}
            <div className={cn("grid border-b border-gray-150 bg-gray-50/50 shrink-0", view === 'month' || view === 'week' ? "grid-cols-7" : "grid-cols-1")}>
              {view === 'day' ? (
                <div className="p-3 text-center text-xs font-bold text-gray-600 capitalize">
                  {format(currentDate, 'EEEE, MMMM dd')}
                </div>
              ) : (
                days.slice(0, 7).map((date, i) => (
                  <div key={i} className="p-3 text-center border-r border-gray-150 last:border-0 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    {format(date, 'EEE')}
                  </div>
                ))
              )}
            </div>

            {/* Grid days container */}
            <div className={cn("flex-1 grid overflow-y-auto min-h-0 divide-y divide-gray-150", view === 'month' ? "grid-cols-7 auto-rows-fr" : view === 'week' ? "grid-cols-7" : "grid-cols-1")}>
              {days.map((date, i) => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const dayPosts = filteredPosts.filter(p => format(new Date(p.scheduledTime), 'yyyy-MM-dd') === dateStr);
                const isToday = isSameDay(date, new Date());
                
                return (
                  <div
                    key={i}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDropEvent(e, date)}
                    className={cn(
                      "border-r border-gray-150 last:border-0 p-1.5 sm:p-2 min-h-[80px] sm:min-h-[120px] transition-colors relative flex flex-col justify-between",
                      isToday ? "bg-brand-50/20" : "hover:bg-gray-50/40"
                    )}
                  >
                    {/* Header info / Day number inside cell */}
                    <div className="flex justify-between items-center mb-1">
                      <span className={cn(
                        "text-xs font-bold font-display px-2 py-0.5 rounded-full",
                        isToday ? "bg-brand-600 text-white" : "text-gray-500"
                      )}>
                        {format(date, 'd')}
                      </span>
                    </div>

                    {/* Posts cell body */}
                    <div className="flex-1 space-y-1.5 overflow-y-auto scrollbar-hide py-1 max-h-[180px]">
                      {dayPosts.map(post => (
                        <div
                          key={post.id}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData('text/plain', post.id)}
                          onClick={() => navigate('/app/workflow')}
                          className="p-1.5 rounded-lg border border-gray-150 bg-white shadow-xs text-xs font-medium cursor-grab active:cursor-grabbing hover:border-brand-300 hover:shadow-sm transition-all"
                        >
                          <div className="flex justify-between items-center mb-1 gap-1">
                            <span className="text-[10px] text-gray-500 font-mono">
                              {format(new Date(post.scheduledTime), 'h:mm a')}
                            </span>
                            <div className="flex gap-0.5 shrink-0">
                              {post.platforms?.map((p: any) => (
                                <PlatformIcon key={p.id} platform={p.socialAccount?.platform} size="xs" className="w-3.5 h-3.5" />
                              ))}
                            </div>
                          </div>
                          <p className="text-[11px] text-gray-800 line-clamp-2 leading-normal">{post.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default Calendar;
