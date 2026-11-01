import React, { useState, useEffect } from 'react';
import {
  Brain,
  Building2,
  Package,
  Palette,
  Target,
  Sparkles,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, Button, Badge, Tabs } from '../../components/ui';
import { apiRequest } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { cn } from '../../lib/utils';

interface BusinessMemoryViewProps {
  projectId: string;
  onRefreshDashboard: () => void;
}

export function BusinessMemoryView({ projectId, onRefreshDashboard }: BusinessMemoryViewProps) {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState('identity');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Memory state
  const [knowledge, setKnowledge] = useState<any>({});
  const [brand, setBrand] = useState<any>({});
  const [products, setProducts] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [memories, setMemories] = useState<any[]>([]);

  // Product form modal state
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState<number | ''>('');
  const [newProductOffer, setNewProductOffer] = useState('');

  // Learning memory item
  const [newMemoryKey, setNewMemoryKey] = useState('');
  const [newMemoryContent, setNewMemoryContent] = useState('');
  const [newMemoryType, setNewMemoryType] = useState('FACT');

  const fetchMemory = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<any>(`/api/v1/projects/${projectId}/ai/memory`);
      setKnowledge(data.knowledge || {});
      setBrand(data.brand || {});
      setProducts(data.products || []);
      setGoals(data.goals || []);
      setMemories(data.memories || []);
    } catch (err: any) {
      error('Failed to load business memory', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchMemory();
    }
  }, [projectId]);

  const handleSaveKnowledge = async () => {
    setIsSaving(true);
    try {
      await apiRequest(`/api/v1/projects/${projectId}/ai/memory/knowledge`, {
        method: 'PUT',
        body: JSON.stringify(knowledge),
      });
      success('Business Identity Updated', 'AI memory has been updated with verified business facts.');
      onRefreshDashboard();
    } catch (err: any) {
      error('Update Failed', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBrand = async () => {
    setIsSaving(true);
    try {
      await apiRequest(`/api/v1/projects/${projectId}/ai/memory/brand`, {
        method: 'PUT',
        body: JSON.stringify(brand),
      });
      success('Brand Guidelines Updated', 'AI will strictly adhere to updated tone and restrictions.');
      onRefreshDashboard();
    } catch (err: any) {
      error('Update Failed', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProductName.trim()) return;
    try {
      await apiRequest(`/api/v1/projects/${projectId}/ai/memory/products`, {
        method: 'POST',
        body: JSON.stringify({
          name: newProductName,
          price: newProductPrice ? Number(newProductPrice) : undefined,
          offerDetails: newProductOffer || undefined,
          isActive: true,
        }),
      });
      success('Product Added', 'Product catalog updated in memory.');
      setNewProductName('');
      setNewProductPrice('');
      setNewProductOffer('');
      await fetchMemory();
    } catch (err: any) {
      error('Failed to add product', err.message);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await apiRequest(`/api/v1/projects/${projectId}/ai/memory/products/${productId}`, {
        method: 'DELETE',
      });
      success('Product Removed', 'Product deleted from memory.');
      await fetchMemory();
    } catch (err: any) {
      error('Delete Failed', err.message);
    }
  };

  const handleAddMemory = async () => {
    if (!newMemoryKey.trim() || !newMemoryContent.trim()) return;
    try {
      await apiRequest(`/api/v1/projects/${projectId}/ai/memory/learnings`, {
        method: 'POST',
        body: JSON.stringify({
          memoryType: newMemoryType,
          key: newMemoryKey,
          content: newMemoryContent,
          confidence: 1.0,
          isVerified: true,
          sourceType: 'USER_CORRECTION',
          sourceTitle: 'Manual Admin Guidance',
        }),
      });
      success('Memory Recorded', 'Autonomous agents will prioritize this verified finding.');
      setNewMemoryKey('');
      setNewMemoryContent('');
      await fetchMemory();
    } catch (err: any) {
      error('Failed to save learning', err.message);
    }
  };

  const handleDeleteMemory = async (memoryId: string) => {
    try {
      await apiRequest(`/api/v1/projects/${projectId}/ai/memory/learnings/${memoryId}`, {
        method: 'DELETE',
      });
      success('Memory Deleted', 'Removed from business memory.');
      await fetchMemory();
    } catch (err: any) {
      error('Delete Failed', err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="neu-card p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--neu-text-primary)] font-display flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl neu-well flex items-center justify-center text-blue-600">
              <Brain className="w-4 h-4" />
            </div>
            Business Memory Engine
          </h2>
          <p className="text-xs text-[var(--neu-text-secondary)] mt-1">
            Persistent, isolated memory where you can inspect, verify, and correct how AI understands your business.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
          onClick={fetchMemory}
        >
          Reload Memory
        </Button>
      </div>

      {/* Tabs */}
      <div className="neu-well p-1.5 rounded-2xl inline-flex gap-1.5 overflow-x-auto max-w-full">
        {[
          { id: 'identity', label: 'Business Identity', icon: <Building2 className="w-4 h-4" /> },
          { id: 'brand', label: 'Brand Guidelines', icon: <Palette className="w-4 h-4" /> },
          { id: 'products', label: 'Products & Offers', icon: <Package className="w-4 h-4" /> },
          { id: 'learnings', label: 'Learning Memory', icon: <Sparkles className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer",
              activeTab === tab.id
                ? 'neu-button-primary text-white'
                : 'text-[var(--neu-text-secondary)] hover:text-[var(--neu-text-primary)]'
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Business Identity */}
      {activeTab === 'identity' && (
        <div className="neu-card p-6 rounded-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[var(--neu-text-primary)]">Business Identity & Target Audience</h3>
              <p className="text-xs text-[var(--neu-text-secondary)] mt-0.5">Verified facts about who you are, what you solve, and who you serve</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              loading={isSaving}
              icon={<Save className="w-4 h-4" />}
              onClick={handleSaveKnowledge}
            >
              Save Identity Facts
            </Button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--neu-text-secondary)] mb-1.5">Industry / Vertical</label>
                <input
                  type="text"
                  value={knowledge.industry || ''}
                  onChange={(e) => setKnowledge({ ...knowledge, industry: e.target.value })}
                  placeholder="e.g. SaaS, E-Commerce, Healthcare, Real Estate"
                  className="neu-input w-full px-3.5 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--neu-text-secondary)] mb-1.5">Geographic Market</label>
                <input
                  type="text"
                  value={knowledge.targetGeography || ''}
                  onChange={(e) => setKnowledge({ ...knowledge, targetGeography: e.target.value })}
                  placeholder="e.g. United States, North America, Global"
                  className="neu-input w-full px-3.5 py-2 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--neu-text-secondary)] mb-1.5">Value Proposition & Problem Solved</label>
              <textarea
                value={knowledge.valueProposition || ''}
                onChange={(e) => setKnowledge({ ...knowledge, valueProposition: e.target.value })}
                placeholder="What core problem do you solve for your customers?"
                rows={3}
                className="neu-input w-full p-3.5 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--neu-text-secondary)] mb-1.5">Target Audience Persona</label>
              <textarea
                value={knowledge.targetAudience || ''}
                onChange={(e) => setKnowledge({ ...knowledge, targetAudience: e.target.value })}
                placeholder="Describe your ideal customers (demographics, pain points, motivations)"
                rows={3}
                className="neu-input w-full p-3.5 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--neu-text-secondary)] mb-1.5">Key Competitors (comma separated)</label>
              <input
                type="text"
                value={Array.isArray(knowledge.competitors) ? knowledge.competitors.join(', ') : knowledge.competitors || ''}
                onChange={(e) =>
                  setKnowledge({
                    ...knowledge,
                    competitors: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                placeholder="e.g. CompetitorA, CompetitorB, CompetitorC"
                className="neu-input w-full px-3.5 py-2 text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Brand Guidelines */}
      {activeTab === 'brand' && (
        <div className="neu-card p-6 rounded-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[var(--neu-text-primary)]">Brand Tone, Voice & Safety Guardrails</h3>
              <p className="text-xs text-[var(--neu-text-secondary)] mt-0.5">Strict guardrails preventing hallucinated claims and establishing tone</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              loading={isSaving}
              icon={<Save className="w-4 h-4" />}
              onClick={handleSaveBrand}
            >
              Save Brand Policies
            </Button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--neu-text-secondary)] mb-1.5">Primary Tone of Voice</label>
                <input
                  type="text"
                  value={brand.tone || ''}
                  onChange={(e) => setBrand({ ...brand, tone: e.target.value })}
                  placeholder="e.g. Authoritative, Conversational, Playful, Professional"
                  className="neu-input w-full px-3.5 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--neu-text-secondary)] mb-1.5">Brand Keywords & Identity Tags</label>
                <input
                  type="text"
                  value={Array.isArray(brand.keywords) ? brand.keywords.join(', ') : brand.keywords || ''}
                  onChange={(e) =>
                    setBrand({
                      ...brand,
                      keywords: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="e.g. Autonomous, AI-driven, Reliable, Premium"
                  className="neu-input w-full px-3.5 py-2 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--neu-text-secondary)] mb-1.5">Writing Style & Guidelines</label>
              <textarea
                value={brand.guidelines || ''}
                onChange={(e) => setBrand({ ...brand, guidelines: e.target.value })}
                placeholder="Specific rules for punctuation, emoji usage, hook structures, calls to action..."
                rows={3}
                className="neu-input w-full p-3.5 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-red-500 mb-1.5">Strict Exclusions & Prohibited Topics</label>
              <textarea
                value={Array.isArray(brand.excludedTopics) ? brand.excludedTopics.join(', ') : brand.excludedTopics || ''}
                onChange={(e) =>
                  setBrand({
                    ...brand,
                    excludedTopics: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                placeholder="Topics, buzzwords, or controversial themes the AI must NEVER mention..."
                rows={2}
                className="neu-input w-full p-3.5 text-xs text-red-600 dark:text-red-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Products & Offers */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="neu-card p-6 rounded-2xl">
            <h3 className="text-base font-bold text-[var(--neu-text-primary)] mb-1">Add Product or Promotional Offer</h3>
            <p className="text-xs text-[var(--neu-text-secondary)] mb-4">
              AI Content Writer and Meta Ads agents only mention verified pricing and offers stored here.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Product / Service Name"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                className="neu-input px-3.5 py-2 text-xs"
              />
              <input
                type="number"
                placeholder="Price ($USD)"
                value={newProductPrice}
                onChange={(e) => setNewProductPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="neu-input px-3.5 py-2 text-xs"
              />
              <input
                type="text"
                placeholder="Promo / Offer Details (e.g. 20% off with CODE)"
                value={newProductOffer}
                onChange={(e) => setNewProductOffer(e.target.value)}
                className="neu-input px-3.5 py-2 text-xs"
              />
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={handleAddProduct}
                disabled={!newProductName.trim()}
              >
                Add Verified Product
              </Button>
            </div>
          </div>

          <div className="neu-card p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-[var(--neu-text-primary)] mb-4">Current Products & Offers Catalog ({products.length})</h3>

            {products.length === 0 ? (
              <p className="text-xs text-[var(--neu-text-secondary)] text-center py-8">
                No products recorded yet. Add your flagship products or services above.
              </p>
            ) : (
              <div className="divide-y divide-black/5 dark:divide-white/5">
                {products.map((p) => (
                  <div key={p.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-xs text-[var(--neu-text-primary)]">{p.name}</p>
                      <p className="text-xs text-[var(--neu-text-secondary)] mt-0.5">
                        {p.price != null ? `\$${p.price}` : 'Custom Pricing'} {p.offerDetails ? `• ${p.offerDetails}` : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="p-2 rounded-xl neu-raised hover:text-red-600 transition-colors cursor-pointer"
                      title="Remove product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Learning Memory */}
      {activeTab === 'learnings' && (
        <div className="space-y-6">
          <div className="neu-card p-6 rounded-2xl">
            <h3 className="text-base font-bold text-[var(--neu-text-primary)] mb-1">Inject Verified Feedback or Guidance</h3>
            <p className="text-xs text-[var(--neu-text-secondary)] mb-4">
              Add explicit learnings, historical corrections, or negative examples for the AI to retain.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <select
                value={newMemoryType}
                onChange={(e) => setNewMemoryType(e.target.value)}
                className="neu-input px-3.5 py-2 text-xs"
              >
                <option value="FACT">Verified Fact</option>
                <option value="PREFERENCE">Brand Preference</option>
                <option value="NEGATIVE_EXAMPLE">Negative Rule (Don't Do)</option>
                <option value="PERFORMANCE_INSIGHT">Performance Finding</option>
              </select>
              <input
                type="text"
                placeholder="Topic / Key (e.g. price_claim, tone_guide)"
                value={newMemoryKey}
                onChange={(e) => setNewMemoryKey(e.target.value)}
                className="neu-input px-3.5 py-2 text-xs"
              />
              <input
                type="text"
                placeholder="Explicit Rule or Learned Fact..."
                value={newMemoryContent}
                onChange={(e) => setNewMemoryContent(e.target.value)}
                className="neu-input sm:col-span-2 px-3.5 py-2 text-xs"
              />
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={handleAddMemory}
                disabled={!newMemoryKey.trim() || !newMemoryContent.trim()}
              >
                Record Into AI Memory
              </Button>
            </div>
          </div>

          <div className="neu-card p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-[var(--neu-text-primary)] mb-4">Active Memory Records ({memories.length})</h3>

            {memories.length === 0 ? (
              <p className="text-xs text-[var(--neu-text-secondary)] text-center py-8">
                No learned memories recorded yet. Rejection feedback and admin guidance are automatically logged here.
              </p>
            ) : (
              <div className="divide-y divide-black/5 dark:divide-white/5">
                {memories.map((m) => (
                  <div key={m.id} className="py-3.5 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg neu-inset text-blue-600">
                          {m.memoryType}
                        </span>
                        <span className="font-bold text-xs text-[var(--neu-text-primary)] font-mono">{m.key}</span>
                        {m.isVerified && (
                          <Badge variant="success" size="sm">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-[var(--neu-text-secondary)] leading-relaxed">{m.content}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteMemory(m.id)}
                      className="p-2 rounded-xl neu-raised hover:text-red-600 transition-colors cursor-pointer shrink-0"
                      title="Delete memory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
