import React, { useState, useEffect } from 'react';
import { Download, FileBarChart2, RefreshCw, Sparkles, Users, Calendar, Award, TrendingUp, FileText, CheckCircle2, Share2 } from 'lucide-react';
import { Button, PageHeader, KPICard, DataTable, PlatformIcon } from '../components/ui';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useToast } from '../components/ui/Toast';
import { apiRequest } from '../lib/api';
import { format } from 'date-fns';
import { PlanGate } from '../components/plan/PlanGate';

export function Reports() {
  const { currentProject } = useWorkspace();
  const { success: toastSuccess, error: toastError } = useToast();

  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [dateRange, setDateRange] = useState<'30' | '90' | '365'>('30');

  const fetchRealReportData = async () => {
    if (!currentProject) return;
    setLoading(true);
    try {
      const startDate = new Date(Date.now() - parseInt(dateRange, 10) * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();
      
      const data = await apiRequest(`/api/v1/projects/${currentProject.id}/analytics/reports?startDate=${startDate}&endDate=${endDate}`);
      setReportData(data);
    } catch (err: any) {
      console.error('Failed to load executive report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentProject) {
      fetchRealReportData();
    }
  }, [currentProject, dateRange]);

  const handleGenerateFreshReport = async () => {
    if (!currentProject) return;
    setGenerating(true);
    try {
      await apiRequest(`/api/v1/projects/${currentProject.id}/analytics/sync`, { method: 'POST' });
      toastSuccess('Report Sync Completed', 'Latest social metrics aggregated from connected platform APIs.');
      await fetchRealReportData();
    } catch (err: any) {
      toastError('Sync Failed', err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleExportCSV = () => {
    if (!reportData) return;
    const summary = reportData.executiveSummary || {};
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Metric,Value\n';
    csvContent += `Total Reach,${summary.totalReach || 0}\n`;
    csvContent += `Total Impressions,${summary.totalImpressions || 0}\n`;
    csvContent += `Accounts Engaged,${summary.accountsEngaged || 0}\n`;
    csvContent += `Total Followers,${summary.totalFollowers || 0}\n`;
    csvContent += `Avg Engagement Rate,${summary.avgEngagementRate || 0}%\n`;
    csvContent += `Total Published Content,${summary.totalPublishedContent || 0}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Executive_Report_${currentProject?.name || 'Project'}_${dateRange}d.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toastSuccess('CSV Report Downloaded', 'Executive summary CSV saved to downloads.');
  };

  const handleExportJSON = () => {
    if (!reportData) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `Executive_Report_${currentProject?.name || 'Project'}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toastSuccess('JSON Report Exported', 'Full report data structure downloaded.');
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const summary = reportData?.executiveSummary || {};

  return (
    <PlanGate
      requiredPlan="PROFESSIONAL"
      fallbackTitle="Executive PDF & CSV Reports (Professional Plan)"
      fallbackDescription="Generate and export executive reports for client campaign reviews. Free tier users currently have no access."
    >
      <div className="p-4 md:p-8 max-w-[1400px] mx-auto w-full space-y-8 animate-fade-in bg-transparent text-left font-sans">
        <PageHeader
          title="Executive Performance Reports"
          description="Verified real analytics reports aggregated from connected social media accounts."
          actions={
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
              <select
                className="px-3 py-2 sm:py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 bg-white w-full sm:w-auto"
                value={dateRange}
                onChange={(e: any) => setDateRange(e.target.value)}
              >
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
                <option value="365">This Year (365d)</option>
              </select>

              <Button variant="secondary" size="sm" onClick={handleExportCSV} className="w-full sm:w-auto" icon={<Download className="w-4 h-4" />}>
                Export CSV
              </Button>
              <Button variant="secondary" size="sm" onClick={handleExportJSON} className="w-full sm:w-auto" icon={<FileText className="w-4 h-4" />}>
                Export JSON
              </Button>
              <Button variant="primary" size="sm" onClick={handleGenerateFreshReport} loading={generating} className="w-full sm:w-auto" icon={<Sparkles className="w-4 h-4" />}>
                Generate Fresh Sync Report
              </Button>
            </div>
          }
        />

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <KPICard label="Total Reach" value={(summary.totalReach || 0).toLocaleString()} icon={<FileBarChart2 className="w-4.5 h-4.5" />} trend="Real API Sync" trendUp={true} />
          <KPICard label="Total Impressions" value={(summary.totalImpressions || 0).toLocaleString()} icon={<FileBarChart2 className="w-4.5 h-4.5" />} trend="Real API Sync" trendUp={true} />
          <KPICard label="Accounts Engaged" value={(summary.accountsEngaged || 0).toLocaleString()} icon={<Users className="w-4.5 h-4.5" />} trend="Real API Sync" trendUp={true} />
          <KPICard label="Total Followers" value={(summary.totalFollowers || 0).toLocaleString()} icon={<Users className="w-4.5 h-4.5" />} trend="Real API Sync" trendUp={true} />
          <KPICard label="Avg Engagement Rate" value={`${summary.avgEngagementRate || 0}%`} icon={<TrendingUp className="w-4.5 h-4.5" />} trend="Real API Sync" trendUp={true} />
          <KPICard label="Published Media" value={`${summary.totalPublishedContent || 0} Posts`} icon={<CheckCircle2 className="w-4.5 h-4.5" />} trend="Real Records" trendUp={true} />
        </div>

        {/* Top Performers Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Best Performing Post */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
              <Award className="w-5 h-5" />
              <span>Best Performing Feed Post</span>
            </div>
            {reportData?.bestPerformingPost ? (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <PlatformIcon platform={reportData.bestPerformingPost.platform} size="xs" />
                  <span className="text-xs font-bold text-gray-700">{reportData.bestPerformingPost.platform}</span>
                </div>
                <p className="text-xs text-gray-800 line-clamp-3 leading-relaxed font-medium">
                  {reportData.bestPerformingPost.caption || 'No caption'}
                </p>
                <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-gray-100">
                  <span className="text-indigo-600">{(reportData.bestPerformingPost.metrics?.reach || 0).toLocaleString()} Reach</span>
                  <span className="text-emerald-600">{reportData.bestPerformingPost.metrics?.engagementRate || 0}% Rate</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 py-6">Analytics unavailable for this content.</p>
            )}
          </div>

          {/* Top Reel */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-purple-600 font-bold text-sm">
              <Award className="w-5 h-5" />
              <span>Top Performing Reel / Video</span>
            </div>
            {reportData?.topReel ? (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <PlatformIcon platform={reportData.topReel.platform} size="xs" />
                  <span className="text-xs font-bold text-gray-700">{reportData.topReel.platform}</span>
                </div>
                <p className="text-xs text-gray-800 line-clamp-3 leading-relaxed font-medium">
                  {reportData.topReel.caption || 'Video Reel'}
                </p>
                <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-gray-100">
                  <span className="text-purple-600">{(reportData.topReel.metrics?.videoViews || reportData.topReel.metrics?.reach || 0).toLocaleString()} Views</span>
                  <span className="text-gray-700">{reportData.topReel.metrics?.likes || 0} Likes</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 py-6">Analytics unavailable for this content.</p>
            )}
          </div>

          {/* Top Story */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
              <Award className="w-5 h-5" />
              <span>Top Story Impression</span>
            </div>
            {reportData?.topStory ? (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <PlatformIcon platform={reportData.topStory.platform} size="xs" />
                  <span className="text-xs font-bold text-gray-700">{reportData.topStory.platform}</span>
                </div>
                <p className="text-xs text-gray-800 line-clamp-3 leading-relaxed font-medium">
                  {reportData.topStory.caption || 'Story Media'}
                </p>
                <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-gray-100">
                  <span className="text-amber-600">{(reportData.topStory.storyMetric?.reach || 0).toLocaleString()} Reach</span>
                  <span className="text-gray-700">{reportData.topStory.storyMetric?.tapsForward || 0} Taps</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 py-6">Analytics unavailable for this content.</p>
            )}
          </div>
        </div>
      </div>
    </PlanGate>
  );
}

export default Reports;
