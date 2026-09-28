import React, { useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Download,
  Image as ImageIcon,
  LockKeyhole,
  Pencil,
  RefreshCw,
  Smartphone,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { PRINTIFY_TEMPLATES } from '../data/printifyReferences';
import { LIFESTYLE_SCENARIOS } from '../data/lifestyleScenarios';
import { MockupWorkflowState, MockupWorkflowStep } from '../types';

interface WorkflowStudioProps {
  workflow: MockupWorkflowState;
  onSelectStep: (step: MockupWorkflowStep) => void;
  onUploadArtwork: (file: File) => void;
  onUploadProductReference: (modelId: string, file: File) => void;
  onUploadSceneReference: (file: File) => void;
  onRemoveSceneReference: (imageId: string) => void;
  onGenerate: () => void;
  onToggleReference: (referenceId: string) => void;
  onSelectAllReferences: (referenceIds: string[]) => void;
  onChangeSceneDescription: (description: string) => void;
  onRemoveProductReference: (modelId: string) => void;
  onRegenerateMockup: (modelId: string) => void;
  onRemoveMockup: (modelId: string) => void;
  onContinueToDrive?: () => void;
}

const STEPS: { id: MockupWorkflowStep; title: string; description: string }[] = [
  { id: 'upload-design', title: 'Upload design', description: 'Start with your original case artwork.' },
  { id: 'product-reference', title: 'Select product reference', description: 'Choose the exact Printify case model to preserve.' },
  { id: 'scene-description', title: 'Describe the scene', description: 'Set the person, place, lighting, and composition.' },
  { id: 'generate-mockup', title: 'Generate mockup', description: 'Generation will use the artwork and case reference as fixed inputs.' },
  { id: 'preview-result', title: 'Preview result', description: 'Review the generated lifestyle image.' },
  { id: 'download-result', title: 'Download result', description: 'Export the approved mockup.' },
];

const STEP_ICONS = [Upload, Smartphone, Camera, Sparkles, ImageIcon, Download];

export const WorkflowStudio: React.FC<WorkflowStudioProps> = ({
  workflow,
  onSelectStep,
  onUploadArtwork,
  onUploadProductReference,
  onUploadSceneReference,
  onRemoveSceneReference,
  onGenerate,
  onToggleReference,
  onSelectAllReferences,
  onChangeSceneDescription,
  onRemoveProductReference,
  onRegenerateMockup,
  onRemoveMockup,
  onContinueToDrive,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sceneReferenceInputRef = useRef<HTMLInputElement>(null);
  const stepIndex = STEPS.findIndex((step) => step.id === workflow.activeStep);
  const activeStep = STEPS[stepIndex];
  const selectedReferences = PRINTIFY_TEMPLATES.filter((reference) =>
    workflow.productReferenceIds.includes(reference.id)
  );
  const allReferencesSelected = workflow.productReferenceIds.length === PRINTIFY_TEMPLATES.length;
  const canContinue =
    (workflow.activeStep === 'upload-design' && Boolean(workflow.artwork)) ||
    (workflow.activeStep === 'product-reference' && selectedReferences.length > 0) ||
    (workflow.activeStep === 'scene-description' && Boolean(workflow.sceneDescription.trim()));
  const isStepComplete = (stepId: MockupWorkflowStep) => {
    if (stepId === 'upload-design') return Boolean(workflow.artwork);
    if (stepId === 'product-reference') return selectedReferences.length > 0;
    if (stepId === 'scene-description') return Boolean(workflow.sceneDescription.trim());
    return workflow.generatedMockups.length > 0;
  };

  const goNext = () => {
    if (canContinue && stepIndex < STEPS.length - 1) {
      onSelectStep(STEPS[stepIndex + 1].id);
    }
  };

  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="mb-8 border-b border-slate-800 pb-6">
        <p className="mb-2 text-xs font-semibold uppercase text-indigo-300">Step {stepIndex + 1} of {STEPS.length}</p>
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">{activeStep.title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">{activeStep.description}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-h-97.5 rounded-xl border border-slate-800 bg-slate-900/60 p-5 sm:p-8">
          {workflow.activeStep === 'upload-design' && (
            <div className="grid gap-8 md:grid-cols-[1fr_220px] md:items-center">
              <div>
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-indigo-400/30 bg-indigo-400/10 text-indigo-200">
                  <Upload className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold text-white">Bring your case artwork</h2>
                <p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">
                  Your uploaded image is the source artwork. The lifestyle scene must not redraw, restyle, or replace it.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) onUploadArtwork(file);
                    event.target.value = '';
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400"
                >
                  <Upload className="h-4 w-4" />
                  {workflow.artwork ? 'Replace artwork' : 'Choose artwork'}
                </button>
                <p className="mt-3 text-xs text-slate-500">PNG, JPG, or WebP</p>
              </div>
              {workflow.artwork ? (
                <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-950">
                  <img src={workflow.artwork.imageUrl} alt="Uploaded case artwork" className="aspect-3/4 w-full object-contain" />
                  <p className="truncate border-t border-slate-800 px-3 py-2 text-xs text-slate-300">{workflow.artwork.fileName}</p>
                </div>
              ) : (
                <div className="flex aspect-3/4 items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-950/50 text-slate-600">
                  <ImageIcon className="h-9 w-9" />
                </div>
              )}
            </div>
          )}

          {workflow.activeStep === 'product-reference' && (
            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-medium text-white">Printify phone cases</h2>
                  <p className="mt-1 text-sm text-slate-400">Each selected model gets its own scene using its catalog geometry.</p>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectAllReferences(allReferencesSelected ? [] : PRINTIFY_TEMPLATES.map((item) => item.id))}
                  className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-800"
                >
                  {allReferencesSelected ? 'Clear all' : 'Select all'}
                </button>
              </div>
              <div className="grid max-h-80 gap-2 overflow-y-auto sm:grid-cols-2">
                {PRINTIFY_TEMPLATES.map((reference) => {
                  const isSelected = workflow.productReferenceIds.includes(reference.id);
                  return (
                    <button
                      key={reference.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => onToggleReference(reference.id)}
                      className={`flex min-w-0 items-start gap-3 rounded-lg border p-3 text-left transition ${isSelected ? 'border-indigo-300 bg-indigo-400/10' : 'border-slate-800 bg-slate-950/60 hover:border-slate-600'}`}
                    >
                      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${isSelected ? 'border-indigo-300 bg-indigo-400 text-slate-950' : 'border-slate-600 text-transparent'}`}>
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-white">{reference.modelName}</span>
                        <span className="mt-1 block text-xs leading-5 text-slate-400">{reference.category} · {reference.dimensions.mmWidth} × {reference.dimensions.mmHeight} mm</span>
                        <span className="block text-xs leading-5 text-slate-500">{reference.cameraCutout.description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <section className="mt-5 border-t border-slate-800 pt-4" aria-label="Selected phone cases">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-medium text-white">Selected cases</h3>
                  <span className="text-xs text-slate-400">{selectedReferences.length} selected</span>
                </div>
                {selectedReferences.length > 0 ? (
                  <ul className="flex flex-wrap gap-2">
                    {selectedReferences.map((reference) => (
                      <li key={reference.id} className="flex min-w-0 flex-col gap-3 rounded-lg border border-indigo-400/30 bg-indigo-400/5 p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                          {workflow.productReferenceImages[reference.id] ? (
                            <img src={workflow.productReferenceImages[reference.id].imageUrl} alt={`${reference.modelName} product reference`} className="h-16 w-12 shrink-0 rounded border border-slate-700 object-cover" />
                          ) : (
                            <span className="flex h-16 w-12 shrink-0 items-center justify-center rounded border border-dashed border-slate-700 text-slate-500">
                              <Smartphone className="h-5 w-5" />
                            </span>
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white">{reference.modelName}</p>
                            <p className="mt-1 truncate text-xs text-slate-400">{workflow.productReferenceImages[reference.id]?.fileName ?? 'No product reference image'}</p>
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-700 px-2.5 py-2 text-xs text-slate-200 transition hover:bg-slate-800">
                            <Upload className="h-3.5 w-3.5" />
                            {workflow.productReferenceImages[reference.id] ? 'Replace image' : 'Add reference image'}
                            <input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (file) onUploadProductReference(reference.id, file);
                                event.target.value = '';
                              }}
                            />
                          </label>
                          {workflow.productReferenceImages[reference.id] && (
                            <button type="button" aria-label={`Remove ${reference.modelName} reference image`} onClick={() => onRemoveProductReference(reference.id)} className="rounded-md border border-slate-700 p-2 text-slate-300 hover:border-rose-400/50 hover:text-rose-200">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button type="button" aria-label={`Remove ${reference.modelName}`} onClick={() => onToggleReference(reference.id)} className="rounded-md border border-slate-700 p-2 text-slate-300 hover:border-rose-400/50 hover:text-rose-200">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">Choose one or more models above.</p>
                )}
              </section>
            </div>
          )}

          {workflow.activeStep === 'scene-description' && (
            <div>
              <label htmlFor="scene-description" className="mb-2 block text-sm font-medium text-white">Shared design theme and scene</label>
              <textarea
                id="scene-description"
                value={workflow.sceneDescription}
                onChange={(event) => onChangeSceneDescription(event.target.value)}
                placeholder="Enchanted autumn woodland with a sleeping red fox, mushrooms, stained glass, and warm amber lighting..."
                rows={6}
                className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 p-4 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-indigo-400"
              />
              <section className="mt-5" aria-label="Scene reference images">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-medium text-white">Scene reference images</h2>
                    <p className="mt-1 text-xs text-slate-400">Guide the setting, props, or mood for every selected case.</p>
                  </div>
                  <input
                    ref={sceneReferenceInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(event) => {
                      Array.from(event.target.files ?? []).forEach(onUploadSceneReference);
                      event.target.value = '';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => sceneReferenceInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-800"
                  >
                    <Upload className="h-4 w-4" /> Add references
                  </button>
                </div>
                {workflow.sceneReferenceImages.length > 0 && (
                  <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {workflow.sceneReferenceImages.map((image) => (
                      <li key={image.id} className="relative overflow-hidden rounded-md border border-slate-800 bg-slate-950">
                        <img src={image.imageUrl} alt={`Scene reference: ${image.fileName}`} className="aspect-4/3 w-full object-cover" />
                        <p className="truncate px-2 py-1.5 pr-9 text-xs text-slate-300">{image.fileName}</p>
                        <button
                          type="button"
                          aria-label={`Remove scene reference ${image.fileName}`}
                          onClick={() => onRemoveSceneReference(image.id)}
                          className="absolute right-1.5 bottom-1.5 rounded border border-slate-700 bg-slate-950 p-1 text-slate-300 hover:text-rose-200"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              <section className="mt-5" aria-label="Scene presets">
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-sm font-medium text-white">Scene presets</h2>
                  <p className="text-xs text-slate-400">Choose a starting composition for the shared theme.</p>
                </div>
                <div className="grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">
                  {LIFESTYLE_SCENARIOS.map((concept) => {
                    const isSelected = workflow.sceneDescription === concept.prompt;
                    return (
                      <button
                        key={concept.title}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => onChangeSceneDescription(concept.prompt)}
                        className={`rounded-lg border p-3 text-left transition ${isSelected ? 'border-indigo-300 bg-indigo-400/10' : 'border-slate-800 bg-slate-950/60 hover:border-slate-600'}`}
                      >
                        <span className="block text-sm font-medium text-white">{concept.title}</span>
                        <span className="mt-1 block line-clamp-2 text-xs leading-5 text-slate-400">{concept.prompt}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
              <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-400">
                <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                <p>The theme stays consistent across all {selectedReferences.length} selected cases; each scene varies its composition and uses that model's own dimensions and camera cutout.</p>
              </div>
            </div>
          )}

          {workflow.activeStep === 'generate-mockup' && (
            <div className="flex min-h-82.5 flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-400/30 bg-indigo-400/10 text-indigo-200">
                <Sparkles className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-white">Generate lifestyle mockup</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                One independent scene will be generated for each of the {selectedReferences.length} selected cases, with the same theme and model-specific geometry.
              </p>
              {workflow.generationError && (
                <p role="alert" className="mt-4 max-w-md rounded-lg border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-left text-sm text-rose-200">
                  {workflow.generationError}
                </p>
              )}
              <button
                type="button"
                onClick={onGenerate}
                disabled={!workflow.artwork || selectedReferences.length === 0 || !workflow.sceneDescription.trim() || workflow.isGenerating}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Sparkles className="h-4 w-4" />
                {workflow.isGenerating ? workflow.generationProgress ?? 'Generating scenes...' : `Generate Scenes (${selectedReferences.length})`}
              </button>
            </div>
          )}

          {workflow.activeStep === 'preview-result' && (
            workflow.generatedMockups.length > 0 ? (
              <div>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-white">Generated Scenes</h2>
                  <span className="text-sm text-slate-400">{workflow.generatedMockups.length} cases</span>
                </div>
                {workflow.generationError && <p role="status" className="mb-4 text-sm text-amber-200">{workflow.generationError}</p>}
                <div className="grid gap-4 sm:grid-cols-2">
                  {workflow.generatedMockups.map((mockup) => (
                    <article key={mockup.modelId} className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
                      {mockup.imageUrl ? (
                        <img src={mockup.imageUrl} alt={`${mockup.modelName} lifestyle scene`} className="aspect-4/3 w-full object-cover" />
                      ) : (
                        <div className="flex aspect-4/3 items-center justify-center bg-slate-900 text-sm text-slate-400">
                          {mockup.status === 'generating' ? 'Generating scene...' : 'Scene unavailable'}
                        </div>
                      )}
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-sm font-medium text-white">{mockup.modelName}</h3>
                          <span className={`shrink-0 text-xs ${mockup.status === 'generated' ? 'text-emerald-300' : mockup.status === 'failed' ? 'text-rose-300' : 'text-amber-200'}`}>
                            {mockup.status === 'generated' ? 'Generated' : mockup.status === 'failed' ? 'Failed' : 'Generating'}
                          </span>
                        </div>
                        {mockup.error && <p role="alert" className="mt-2 text-xs text-rose-300">{mockup.error}</p>}
                        <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-800 pt-3">
                          {mockup.imageUrl && (
                            <>
                              <a href={mockup.imageUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-800">
                                <ImageIcon className="h-3.5 w-3.5" /> Preview
                              </a>
                              <a href={mockup.imageUrl} download={`casecraft-${mockup.modelId}.png`} className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-800">
                                <Download className="h-3.5 w-3.5" /> Download
                              </a>
                            </>
                          )}
                          <button type="button" disabled={mockup.status === 'generating'} onClick={() => onRegenerateMockup(mockup.modelId)} className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-800 disabled:opacity-40">
                            <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                          </button>
                          <button type="button" onClick={() => onSelectStep('scene-description')} className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-800">
                            <Pencil className="h-3.5 w-3.5" /> Edit theme
                          </button>
                          <button type="button" onClick={() => onRemoveMockup(mockup.modelId)} aria-label={`Remove ${mockup.modelName} result`} className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 px-2.5 py-1.5 text-xs text-slate-200 hover:border-rose-400/50 hover:text-rose-200">
                            <Trash2 className="h-3.5 w-3.5" /> Remove
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : (
              <IntegrationStage icon={ImageIcon} title="Mockup preview" detail="Generate a lifestyle mockup collection to review it here." />
            )
          )}

          {workflow.activeStep === 'download-result' && (
            workflow.generatedMockups.some((mockup) => mockup.imageUrl) ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {workflow.generatedMockups.filter((mockup) => mockup.imageUrl).map((mockup, index) => (
                  <a
                    key={mockup.modelId}
                    href={mockup.imageUrl ?? undefined}
                    download={`casecraft-${mockup.modelId}.png`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm text-white transition hover:border-emerald-400/60"
                  >
                    <span className="truncate">{index + 1}. {mockup.sceneTitle}</span>
                    <Download className="h-4 w-4 shrink-0 text-emerald-300" />
                  </a>
                ))}
              </div>
            ) : (
              <IntegrationStage icon={Download} title="No mockup to download yet" detail="Generate and review a lifestyle mockup before exporting it." />
            )
          )}
        </div>

        <aside className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <h2 className="mb-3 text-xs font-semibold uppercase text-slate-400">Workflow</h2>
          <ol className="space-y-1">
            {STEPS.map(({ id, title }, index) => {
              const Icon = STEP_ICONS[index];
              const isActive = workflow.activeStep === id;
              const isComplete = isStepComplete(id);
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => onSelectStep(id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm ${isActive ? 'bg-indigo-500/15 text-white' : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'}`}
                  >
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${isActive ? 'border-indigo-300 text-indigo-200' : 'border-slate-700 text-slate-500'}`}>
                      {isComplete ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                    </span>
                    <span>{title}</span>
                  </button>
                </li>
              );
            })}
          </ol>
          <div className="mt-5 border-t border-slate-800 pt-4">
            <p className="text-xs font-semibold text-emerald-300">{selectedReferences.length} cases selected</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">Each selected model gets its own scene with model-specific dimensions and camera cutout.</p>
          </div>
        </aside>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-5">
        <button
          type="button"
          onClick={() => stepIndex > 0 && onSelectStep(STEPS[stepIndex - 1].id)}
          disabled={stepIndex === 0}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3.5 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        {stepIndex < 3 ? (
          <button
            type="button"
            onClick={goNext}
            disabled={!canContinue}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        ) : stepIndex === 4 && workflow.generatedImageUrl ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectStep('download-result')}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
            >
              <Download className="h-4 w-4" /> Download Local
            </button>
            {onContinueToDrive && (
              <button
                type="button"
                onClick={onContinueToDrive}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-400 shadow-md shadow-indigo-950 cursor-pointer"
              >
                <span>Continue to Google Drive Assets</span> <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : stepIndex === 5 ? (
          onContinueToDrive ? (
            <button
              type="button"
              onClick={onContinueToDrive}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-400 shadow-md shadow-indigo-950 cursor-pointer"
            >
              <span>Proceed to Google Drive Storage</span> <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <span className="text-xs text-slate-500">Download complete</span>
          )
        ) : (
          <span className="text-xs text-slate-500">
            {workflow.isGenerating ? 'Generation in progress' : stepIndex === 3 ? 'Ready when inputs are complete' : 'Review the result before downloading'}
          </span>
        )}
      </div>
    </section>
  );
};

const IntegrationStage: React.FC<{
  icon: React.ElementType;
  title: string;
  detail: string;
}> = ({ icon: Icon, title, detail }) => (
  <div className="flex min-h-82.5 flex-col items-center justify-center text-center">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 text-indigo-300">
      <Icon className="h-5 w-5" />
    </div>
    <h2 className="text-lg font-semibold text-white">{title}</h2>
    <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">{detail}</p>
  </div>
);