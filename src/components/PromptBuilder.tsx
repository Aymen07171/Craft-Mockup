import React, { useState } from 'react';
import {
  Sparkles,
  Shuffle,
  Copy,
  Check,
  Plus,
  Trash2,
  Wand2,
  ArrowRight,
  RefreshCw,
  Lightbulb,
  Code2,
  Layers,
  Palette,
  Eye,
} from 'lucide-react';
import { NichePreset, PlaceholderField, GeneratedDesign } from '../types';
import { NICHE_PRESETS } from '../data/presets';
import { PhoneCaseRenderer } from './PhoneCaseRenderer';

interface PromptBuilderProps {
  onDesignGenerated: (design: GeneratedDesign) => void;
  activeDesign: GeneratedDesign | null;
  onNavigateToMockups: () => void;
}

export const PromptBuilder: React.FC<PromptBuilderProps> = ({
  onDesignGenerated,
  activeDesign,
  onNavigateToMockups,
}) => {
  const [selectedNicheId, setSelectedNicheId] = useState<string>(NICHE_PRESETS[0].id);
  const currentPreset: NichePreset =
    NICHE_PRESETS.find((n) => n.id === selectedNicheId) || NICHE_PRESETS[0];

  const [template, setTemplate] = useState<string>(currentPreset.template);
  const [placeholders, setPlaceholders] = useState<PlaceholderField[]>(
    currentPreset.defaultPlaceholders
  );
  const [showTemplateEditor, setShowTemplateEditor] = useState<boolean>(false);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // New tag modal/input state
  const [newTagInput, setNewTagInput] = useState<string>('');
  const [newTagLabel, setNewTagLabel] = useState<string>('');
  const [showAddTag, setShowAddTag] = useState<boolean>(false);

  // AI suggestions loading states per tag
  const [suggestingTag, setSuggestingTag] = useState<string | null>(null);

  // Assemble dynamic prompt by replacing {{TAG}} with corresponding placeholder value
  const assemblePrompt = (): string => {
    let result = template;
    placeholders.forEach((p) => {
      const regex = new RegExp(`{{\\s*${p.tag}\\s*}}`, 'g');
      result = result.replace(regex, p.value.trim() || `[${p.label}]`);
    });
    return result;
  };

  const dynamicPrompt = assemblePrompt();

  // Switch Niche Preset
  const handleSelectNiche = (nicheId: string) => {
    const niche = NICHE_PRESETS.find((n) => n.id === nicheId);
    if (!niche) return;
    setSelectedNicheId(nicheId);
    setTemplate(niche.template);
    setPlaceholders(niche.defaultPlaceholders);
    setGenerationError(null);
  };

  // Update a single placeholder value
  const handleUpdateValue = (tag: string, value: string) => {
    setPlaceholders((prev) =>
      prev.map((p) => (p.tag === tag ? { ...p, value } : p))
    );
  };

  // Randomize a single placeholder value from its options
  const handleRandomizeSingle = (tag: string) => {
    setPlaceholders((prev) =>
      prev.map((p) => {
        if (p.tag === tag && p.options.length > 0) {
          const filtered = p.options.filter((opt) => opt !== p.value);
          const pick =
            filtered.length > 0
              ? filtered[Math.floor(Math.random() * filtered.length)]
              : p.options[0];
          return { ...p, value: pick };
        }
        return p;
      })
    );
  };

  // Randomize ALL placeholders
  const handleRandomizeAll = () => {
    setPlaceholders((prev) =>
      prev.map((p) => {
        if (p.options.length > 0) {
          const randomIndex = Math.floor(Math.random() * p.options.length);
          return { ...p, value: p.options[randomIndex] };
        }
        return p;
      })
    );
  };

  // Reset to default values of preset
  const handleResetDefaults = () => {
    setTemplate(currentPreset.template);
    setPlaceholders(currentPreset.defaultPlaceholders);
  };

  // Copy Assembled Prompt to Clipboard
  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(dynamicPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  // Add Custom Placeholder Tag
  const handleAddCustomTag = () => {
    if (!newTagInput.trim()) return;
    const cleanTag = newTagInput.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_');
    const label = newTagLabel.trim() || cleanTag.replace(/_/g, ' ');

    if (placeholders.some((p) => p.tag === cleanTag)) {
      alert(`Placeholder {{${cleanTag}}} already exists!`);
      return;
    }

    const newField: PlaceholderField = {
      tag: cleanTag,
      label,
      description: 'Custom user defined placeholder',
      value: '',
      options: [],
    };

    setPlaceholders((prev) => [...prev, newField]);
    setTemplate((prev) => `${prev} {{${cleanTag}}}`);
    setNewTagInput('');
    setNewTagLabel('');
    setShowAddTag(false);
  };

  // Remove a placeholder tag
  const handleRemoveTag = (tag: string) => {
    setPlaceholders((prev) => prev.filter((p) => p.tag !== tag));
    const regex = new RegExp(`{{\\s*${tag}\\s*}}`, 'g');
    setTemplate((prev) => prev.replace(regex, '').replace(/\s+/g, ' ').trim());
  };

  // AI Suggestions for a tag
  const handleGetAiSuggestions = async (tag: string) => {
    setSuggestingTag(tag);
    try {
      const response = await fetch('/api/suggest-values', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placeholder: tag,
          niche: currentPreset.name,
          currentPrompt: dynamicPrompt,
        }),
      });
      const data = await response.json();
      if (data.suggestions && data.suggestions.length > 0) {
        setPlaceholders((prev) =>
          prev.map((p) => {
            if (p.tag === tag) {
              const merged = Array.from(new Set([...p.options, ...data.suggestions]));
              return {
                ...p,
                options: merged,
                value: data.suggestions[0] || p.value,
              };
            }
            return p;
          })
        );
      }
    } catch (err) {
      console.error('Failed to get suggestions', err);
    } finally {
      setSuggestingTag(null);
    }
  };

  // Trigger Design Generation
  const handleGenerateDesign = async () => {
    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response = await fetch('/api/generate-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: dynamicPrompt,
          aspectRatio: '9:16',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.imageUrl) {
        throw new Error(data.error || 'Failed to generate design');
      }

      const newDesign: GeneratedDesign = {
        id: `design-${Date.now()}`,
        title: `${currentPreset.name} Artwork`,
        prompt: dynamicPrompt,
        imageUrl: data.imageUrl,
        niche: currentPreset.name,
        createdAt: Date.now(),
        placeholders: placeholders.reduce((acc, p) => ({ ...acc, [p.tag]: p.value }), {}),
      };

      onDesignGenerated(newDesign);
    } catch (err: any) {
      console.error('Generation failed:', err);
      let errMsg = err.message || 'Image generation failed.';
      if (errMsg.includes('401') || errMsg.includes('UNAUTHENTICATED') || errMsg.includes('credentials') || errMsg.includes('API key')) {
        errMsg = 'Authentication error: Please ensure a valid Gemini API key is selected in the AI Studio Secrets panel, or use the pre-rendered high-res preset artwork below.';
      }
      setGenerationError(errMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  // Quick Apply Pre-rendered Sample (Zero-latency instant preview)
  const handleApplyPresetSample = () => {
    if (currentPreset.sampleImage) {
      const presetDesign: GeneratedDesign = {
        id: `preset-${currentPreset.id}`,
        title: `${currentPreset.name} Sample Artwork`,
        prompt: dynamicPrompt,
        imageUrl: currentPreset.sampleImage,
        niche: currentPreset.name,
        createdAt: Date.now(),
        placeholders: placeholders.reduce((acc, p) => ({ ...acc, [p.tag]: p.value }), {}),
        isPreset: true,
      };
      onDesignGenerated(presetDesign);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / Niche Selector */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Step 1: Choose Niche & Assemble Placeholders
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Design Prompt Customization Studio
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Select a niche to auto-load customizable placeholders (e.g.{' '}
              <code className="text-indigo-300 bg-indigo-950/60 px-1 py-0.5 rounded text-xs">
                &#123;&#123;SUBJECT_POSE&#125;&#125;
              </code>
              ,{' '}
              <code className="text-indigo-300 bg-indigo-950/60 px-1 py-0.5 rounded text-xs">
                &#123;&#123;BOTANICAL&#125;&#125;
              </code>
              ,{' '}
              <code className="text-indigo-300 bg-indigo-950/60 px-1 py-0.5 rounded text-xs">
                &#123;&#123;COMPANION&#125;&#125;
              </code>
              ,{' '}
              <code className="text-indigo-300 bg-indigo-950/60 px-1 py-0.5 rounded text-xs">
                (vitrail)
              </code>
              ), swap options freely, or add your own tags.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRandomizeAll}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition shadow-sm cursor-pointer"
              title="Shuffle all placeholder values"
            >
              <Shuffle className="w-3.5 h-3.5 text-indigo-400" />
              <span>Randomize All</span>
            </button>
            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 hover:text-slate-200 text-xs font-medium border border-slate-700/60 transition cursor-pointer"
              title="Reset to default preset values"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Niche Preset Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {NICHE_PRESETS.map((niche) => {
            const isSelected = niche.id === selectedNicheId;
            return (
              <button
                key={niche.id}
                onClick={() => handleSelectNiche(niche.id)}
                className={`text-left p-3.5 rounded-xl transition-all border relative cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-950/50 border-indigo-500/80 shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-500/40'
                    : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                      isSelected
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {niche.badge}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_6px_#818cf8]" />
                  )}
                </div>
                <h3 className="font-semibold text-sm text-white">{niche.name}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">{niche.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Placeholders Configuration (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <h2 className="text-base font-semibold text-white">
                  Placeholders for {currentPreset.name}
                </h2>
                <span className="text-xs text-slate-500 font-mono">
                  ({placeholders.length} active tags)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowTemplateEditor(!showTemplateEditor)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 cursor-pointer"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>{showTemplateEditor ? 'Hide Template' : 'Edit Template'}</span>
                </button>
                <button
                  onClick={() => setShowAddTag(!showAddTag)}
                  className="flex items-center gap-1.5 text-xs font-medium text-indigo-300 hover:text-white px-2.5 py-1 rounded-lg bg-indigo-900/40 hover:bg-indigo-800/50 border border-indigo-700/50 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Tag</span>
                </button>
              </div>
            </div>

            {/* Template Editor Box (Optional Toggle) */}
            {showTemplateEditor && (
              <div className="mb-6 p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                    Master Prompt Template Structure
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Use &#123;&#123;TAG&#125;&#125; for placeholders
                  </span>
                </div>
                <textarea
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  rows={4}
                  className="w-full text-xs font-mono bg-slate-900 text-slate-200 p-3 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* Add Custom Tag Form */}
            {showAddTag && (
              <div className="mb-6 p-4 rounded-xl bg-indigo-950/30 border border-indigo-700/40">
                <h4 className="text-xs font-semibold text-indigo-200 mb-3 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Define New Dynamic Placeholder
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Tag Key (e.g. LIGHTING)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. LIGHTING_EFFECT"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Display Label (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ambient Lighting"
                      value={newTagLabel}
                      onChange={(e) => setNewTagLabel(e.target.value)}
                      className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowAddTag(false)}
                    className="text-xs px-3 py-1 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCustomTag}
                    className="text-xs px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium cursor-pointer"
                  >
                    Insert Placeholder
                  </button>
                </div>
              </div>
            )}

            {/* Placeholder Input Cards */}
            <div className="space-y-4">
              {placeholders.map((placeholder) => {
                const isSuggesting = suggestingTag === placeholder.tag;

                return (
                  <div
                    key={placeholder.tag}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-all group"
                  >
                    {/* Header of placeholder card */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                          &#123;&#123;{placeholder.tag}&#125;&#125;
                        </span>
                        <span className="text-xs font-medium text-slate-300">
                          {placeholder.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* AI Suggestions Button */}
                        <button
                          onClick={() => handleGetAiSuggestions(placeholder.tag)}
                          disabled={isSuggesting}
                          className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/20 transition cursor-pointer"
                          title="Generate fresh AI ideas with Gemini"
                        >
                          <Lightbulb className="w-3 h-3" />
                          <span>{isSuggesting ? 'Thinking...' : 'AI Ideas'}</span>
                        </button>

                        {/* Randomize single placeholder */}
                        {placeholder.options.length > 0 && (
                          <button
                            onClick={() => handleRandomizeSingle(placeholder.tag)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
                            title="Pick random option"
                          >
                            <Shuffle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete custom tag */}
                        <button
                          onClick={() => handleRemoveTag(placeholder.tag)}
                          className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                          title="Remove placeholder"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Active Value Input */}
                    <div className="mb-2.5">
                      <textarea
                        rows={2}
                        value={placeholder.value}
                        onChange={(e) => handleUpdateValue(placeholder.tag, e.target.value)}
                        placeholder={`Enter value for {{${placeholder.tag}}}...`}
                        className="w-full text-xs bg-slate-900 text-slate-100 rounded-lg p-2.5 border border-slate-700/80 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
                      />
                    </div>

                    {/* Preset Option Quick Pills */}
                    {placeholder.options.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="text-[10px] uppercase font-semibold text-slate-500 mr-1">
                          Picks:
                        </span>
                        {placeholder.options.slice(0, 4).map((option, idx) => {
                          const isActive = placeholder.value === option;
                          return (
                            <button
                              key={idx}
                              onClick={() => handleUpdateValue(placeholder.tag, option)}
                              className={`text-[11px] px-2.5 py-1 rounded-full transition-all text-left truncate max-w-[260px] cursor-pointer ${
                                isActive
                                  ? 'bg-indigo-600 text-white font-medium shadow-sm'
                                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/50'
                              }`}
                              title={option}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Prompt Assembly & Generate Action (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Assembled Prompt Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">Dynamic Prompt Assembly</h3>
              </div>
              <button
                onClick={handleCopyPrompt}
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 transition cursor-pointer"
              >
                {copiedPrompt ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Assembled Prompt Text Box */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed font-mono relative">
              <div className="max-h-48 overflow-y-auto pr-1">
                {dynamicPrompt}
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>Aspect: 9:16 (Phone Case Backplate)</span>
                <span>{dynamicPrompt.length} characters</span>
              </div>
            </div>

            {/* Error Message if any with Instant Fallback Button */}
            {generationError && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 space-y-2">
                <p className="font-semibold text-rose-200">API Notice</p>
                <p>{generationError}</p>
                <div className="pt-1">
                  <button
                    onClick={handleApplyPresetSample}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition cursor-pointer"
                  >
                    <span>Load 2D Preset Artwork & Proceed to Mockups</span>
                  </button>
                </div>
              </div>
            )}

            {/* Main Generate Button */}
            <button
              onClick={handleGenerateDesign}
              disabled={isGenerating}
              className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-semibold transition-all shadow-lg cursor-pointer ${
                isGenerating
                  ? 'bg-indigo-800 text-indigo-200 cursor-wait'
                  : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/30'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Design with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Design Artwork</span>
                </>
              )}
            </button>

            {/* Instant Sample Preview Helper */}
            {currentPreset.sampleImage && (
              <div className="pt-2 text-center">
                <button
                  onClick={handleApplyPresetSample}
                  className="text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-4 cursor-pointer"
                >
                  ⚡ Instant Load High-Res Preset Artwork
                </button>
              </div>
            )}
          </div>

          {/* Active Design Preview: Pure 2D Flat-Lay Print Canvas (No Phone Mockup) */}
          {activeDesign && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    2D Art Canvas Print
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{activeDesign.title}</p>
                </div>
                <button
                  onClick={onNavigateToMockups}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-900/30 cursor-pointer"
                >
                  <span>Generate Phone Mockups</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Pure 2D Rectangular Art Canvas Display - NO PHONE / NO MOCKUP */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-950/80 rounded-xl border border-slate-800/80">
                <div className="relative aspect-[9/16] w-full max-w-[260px] rounded-lg overflow-hidden shadow-2xl border-2 border-slate-700/60 bg-black group">
                  <img
                    src={activeDesign.imageUrl}
                    alt={activeDesign.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover select-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <a
                      href={activeDesign.imageUrl}
                      download={`${activeDesign.title}-2d-print.png`}
                      className="w-full py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium text-center shadow-md transition"
                    >
                      Download Pure 2D Print (9:16)
                    </a>
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <span className="text-[11px] font-medium text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                    Pure 2D Flat-Lay Graphic • 9:16 Rectangular Canvas
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Isolated artwork without device or shadows — ready for mockup application.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
