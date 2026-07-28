import React, { useState } from 'react';
import { Sparkles, ArrowRight, Wand2, Copy, Check } from 'lucide-react';
import { apiRequest } from '../lib/api';

import { PlanGate } from '../components/plan/PlanGate';

export function AIAssistant() {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    setResult('');
    try {
      const response = await apiRequest<{ optimizedContent: string }>('/api/v1/posts/ai-generate', {
        method: 'POST',
        body: JSON.stringify({ prompt: topic, tone }),
      });
      setResult(response.optimizedContent);
    } catch (error: any) {
      setResult(`Failed to generate AI copy: ${error.message || 'Server error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PlanGate
      requiredPlan="PROFESSIONAL"
      fallbackTitle="AI Copy Generator (Professional Plan)"
      fallbackDescription="Generate AI copy optimized for social networks. Free tier users currently have no access."
    >
      <div className="p-4 md:p-8 max-w-[1400px] mx-auto min-h-[calc(100dvh-3.5rem)] flex flex-col w-full">
      <div className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 font-display flex items-center gap-2 tracking-tight">
          <Sparkles className="w-6 h-6 text-brand-400" />
          AI Content Assistant
        </h2>
        <p className="text-sm text-gray-600 mt-1">Generate engaging posts optimized for any platform.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 flex-1">
        {/* Left: Inputs */}
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-6 h-fit">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">What should we write about?</label>
            <textarea
              rows={4}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Announce our new product launch, focusing on speed and design."
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all resize-none placeholder:text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Select Tone</label>
            <div className="flex flex-wrap gap-2">
              {['Professional', 'Casual', 'Luxury', 'Witty', 'Promotional'].map(t => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] ${
                    tone === t
                      ? 'bg-brand-500/10 text-brand-400 border border-brand-500/30 ring-1 ring-brand-500/20'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={!topic || isGenerating}
            className="w-full py-3 px-4 bg-brand-600 text-white rounded-xl font-semibold text-sm shadow-md hover:bg-brand-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </div>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Generate Content
              </>
            )}
          </button>
        </div>

        {/* Right: Output */}
        <div className="bg-gradient-to-br from-brand-950/20 to-gray-900 p-4 md:p-6 rounded-2xl border border-brand-500/10 shadow-sm flex flex-col relative overflow-hidden min-h-[320px]">
          <div className="absolute inset-0 bg-brand-500/5 backdrop-blur-3xl" />
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h3 className="text-sm font-semibold text-brand-400 uppercase tracking-wider">Generated Output</h3>
            {result && (
              <button 
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 backdrop-blur-sm text-brand-300 text-xs font-semibold rounded-lg shadow-sm border border-brand-500/20 hover:bg-gray-50 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Text'}
              </button>
            )}
          </div>
          
          <div className="relative z-10 flex-1 bg-white/40 backdrop-blur-sm border border-brand-500/10 rounded-xl p-4 md:p-6 overflow-y-auto">
            {isGenerating ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-white rounded w-3/4"></div>
                <div className="h-4 bg-white rounded w-full"></div>
                <div className="h-4 bg-white rounded w-5/6"></div>
                <div className="h-4 bg-white rounded w-1/2 mt-4"></div>
              </div>
            ) : result ? (
              <p className="text-[15px] leading-relaxed text-gray-800 whitespace-pre-wrap">
                {result}
              </p>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-brand-500/20 gap-3">
                <Sparkles className="w-10 h-10" />
                <p className="text-sm font-medium">Your AI generated content will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </PlanGate>
  );
}
