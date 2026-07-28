import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ChevronLeft, ChevronRight, Loader2, CalendarClock } from 'lucide-react';
import { clientApiRequest } from '../../lib/api';
import { PageHeader, Card, StatusPill } from '../../components/ui';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

interface CalendarPost {
  id: string;
  content: string;
  status: string;
  scheduledTime: string;
  project: { id: string; name: string };
  media: any[];
}

export function ClientCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<CalendarPost[]>([]);
  const [loading, setLoading] = useState(true);

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const result = await clientApiRequest<CalendarPost[]>(
          `/api/v1/clients/me/calendar?month=${month}&year=${year}`
        );
        setPosts(result);
      } catch (err) {
        console.error('Failed to load calendar content:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [month, year]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1200px] mx-auto w-full space-y-6 animate-fade-in text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Content Calendar"
          description="Track approved and scheduled content across your assigned projects."
        />
        <div className="flex items-center gap-3 bg-white border border-gray-200/80 p-1.5 rounded-xl self-start sm:self-center shadow-xs">
          <button
            onClick={handlePrevMonth}
            className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-gray-800 text-sm font-display px-2 min-w-[120px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {days.map((day) => {
          const dayPosts = posts.filter((p) => isSameDay(new Date(p.scheduledTime), day));

          return (
            <Card
              key={day.toString()}
              className={`p-4 min-h-[140px] flex flex-col justify-between border border-gray-200/80 hover:shadow-xs transition-all ${
                dayPosts.length > 0 ? 'bg-brand-50/20 border-brand-100' : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-1.5 mb-2">
                <span className="text-sm font-bold text-gray-800">{format(day, 'd')}</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase">{format(day, 'EEE')}</span>
              </div>
              <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[120px] scrollbar-hide">
                {dayPosts.map((post) => (
                  <Link key={post.id} to={`/client/reviews/${post.id}`} className="block group">
                    <div className="p-1.5 bg-white border border-gray-200/80 rounded-lg shadow-xs hover:border-brand-300 transition-all text-left">
                      <p className="text-[10px] font-bold text-brand-600 leading-none truncate mb-1">
                        {post.project.name}
                      </p>
                      <p className="text-xs font-semibold text-gray-700 leading-normal line-clamp-2 group-hover:text-brand-700 transition-colors">
                        {post.content}
                      </p>
                      <div className="mt-1 flex items-center justify-between gap-1">
                        <span className="text-[9px] text-gray-400 font-mono">
                          {format(new Date(post.scheduledTime), 'h:mm a')}
                        </span>
                        <StatusPill status={post.status} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
export default ClientCalendar;
