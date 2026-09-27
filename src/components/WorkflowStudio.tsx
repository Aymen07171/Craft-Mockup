import React, { useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Download,
  Image as ImageIcon,
  LockKeyhole,
  Smartphone,
  Sparkles,
  Upload,
} from 'lucide-react';
import { PRINTIFY_TEMPLATES } from '../data/printifyReferences';
import { MockupWorkflowState, MockupWorkflowStep } from '../types';

interface WorkflowStudioProps {
  workflow: MockupWorkflowState;
  onSelectStep: (step: MockupWorkflowStep) => void;
  onUploadArtwork: (file: File) => void;
  onUploadProductReference: (file: File) => void;
  onGenerate: () => void;
  onSelectReference: (referenceId: string) => void;
  onChangeSceneDescription: (description: string) => void;
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
  onGenerate,
  onSelectReference,
  onChangeSceneDescription,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const referenceInputRef = useRef<HTMLInputElement>(null);
  const stepIndex = STEPS.findIndex((step) => step.id === workflow.activeStep);
  const activeStep = STEPS[stepIndex];
  const selectedReference = PRINTIFY_TEMPLATES.find(
    (reference) => reference.id === workflow.productReferenceId
  );
  const canContinue =
    (workflow.activeStep === 'upload-design' && Boolean(workflow.artwork)) ||
    (workflow.activeStep === 'product-reference' && Boolean(workflow.productReferenceImage)) ||
    (workflow.activeStep === 'scene-description' && Boolean(workflow.sceneDescription.trim()));
  const isStepComplete = (stepId: MockupWorkflowStep) => {
    if (stepId === 'upload-design') return Boolean(workflow.artwork);
    if (stepId === 'product-reference') return Boolean(workflow.productReferenceImage);
    if (stepId === 'scene-description') return Boolean(workflow.sceneDescription.trim());
    return Boolean(workflow.generatedImageUrl);
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
              <label htmlFor="product-reference" className="mb-2 block text-sm font-medium text-white">Printify phone case model</label>
              <p className="mb-3 text-sm text-slate-400">Upload the actual product mockup. A catalog model adds useful specifications, but cannot replace the visual reference.</p>
              <select
                id="product-reference"
                value={workflow.productReferenceId ?? ''}
                onChange={(event) => onSelectReference(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-indigo-400"
              >
                <option value="">Select a catalog model</option>
                {PRINTIFY_TEMPLATES.map((reference) => (
                  <option key={reference.id} value={reference.id}>{reference.modelName}</option>
                ))}
              </select>
              {selectedReference ? (
                <div className="mt-5 rounded-lg border border-indigo-400/30 bg-indigo-400/5 p-4">
                  <div className="flex items-start gap-3">
                    <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-indigo-300" />
                    <div>
                      <h2 className="font-medium text-white">{selectedReference.modelName}</h2>
                      <p className="mt-1 text-sm leading-5 text-slate-400">{selectedReference.cameraCutout.description}</p>
                      <p className="mt-3 text-xs text-indigo-200">This model and case geometry stay fixed during scene creation.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-5 text-sm text-slate-500">The selected reference defines the case shape, camera opening, and proportions.</p>
              )}
              <input
                ref={referenceInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) onUploadProductReference(file);
                  event.target.value = '';
                }}
              />
              <button
                type="button"
                onClick={() => referenceInputRef.current?.click()}
                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3.5 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
              >
                <Upload className="h-4 w-4" />
                {workflow.productReferenceImage ? 'Replace reference image' : 'Upload Printify mockup'}
              </button>
              {workflow.productReferenceImage && (
                <div className="mt-4 flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/70 p-3">
                  <img src={workflow.productReferenceImage.imageUrl} alt="Printify product reference" className="h-20 w-14 rounded object-cover" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-emerald-300">Product reference attached</p>
                    <p className="mt-1 truncate text-xs text-slate-400">{workflow.productReferenceImage.fileName}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {workflow.activeStep === 'scene-description' && (
            <div>
              <label htmlFor="scene-description" className="mb-2 block text-sm font-medium text-white">What should the lifestyle scene look like?</label>
              <textarea
                id="scene-description"
                value={workflow.sceneDescription}
                onChange={(event) => onChangeSceneDescription(event.target.value)}
                placeholder="Describe the person, setting, lighting, and composition..."
                rows={8}
                className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 p-4 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-indigo-400"
              />
              <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-400">
                <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                <p>Describe only the creative environment. The product reference and original artwork remain fixed.</p>
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
                The original artwork and uploaded product photo are sent as separate references. The scene prompt controls the environment only.
              </p>
              {workflow.generationError && (
                <p role="alert" className="mt-4 max-w-md rounded-lg border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-left text-sm text-rose-200">
                  {workflow.generationError}
                </p>
              )}
              {!workflow.productReferenceImage && (
                <p className="mt-4 text-xs text-amber-200">Upload a product mockup image in the reference step before generating.</p>
              )}
              <button
                type="button"
                onClick={onGenerate}
                disabled={!workflow.artwork || !workflow.productReferenceImage || !workflow.sceneDescription.trim() || workflow.isGenerating}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Sparkles className="h-4 w-4" />
                {workflow.isGenerating ? 'Generating mockup...' : 'Generate mockup'}
              </button>
            </div>
          )}

          {workflow.activeStep === 'preview-result' && (
            workflow.generatedImageUrl ? (
              <img src={workflow.generatedImageUrl} alt="Generated lifestyle mockup preview" className="mx-auto max-h-130 rounded-lg object-contain" />
            ) : (
              <IntegrationStage icon={ImageIcon} title="Mockup preview" detail="Generate a lifestyle mockup to review it here." />
            )
          )}

          {workflow.activeStep === 'download-result' && (
            workflow.generatedImageUrl ? (
              <div className="flex min-h-82.5 flex-col items-center justify-center text-center">
                <img src={workflow.generatedImageUrl} alt="Lifestyle mockup ready to download" className="mb-5 max-h-130 rounded-lg object-contain" />
                <a
                  href={workflow.generatedImageUrl}
                  download="casecraft-lifestyle-mockup.png"
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
                >
                  <Download className="h-4 w-4" /> Download PNG
                </a>
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
            <p className="text-xs font-semibold text-emerald-300">Product fixed</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">Artwork and case model are product inputs. Only the scene is creative.</p>
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
          <button
            type="button"
            onClick={() => onSelectStep('download-result')}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
            Continue to download <ArrowRight className="h-4 w-4" />
          </button>
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