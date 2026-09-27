import React from 'react';
import {
  Camera,
  Download,
  Image as ImageIcon,
  Smartphone,
  Sparkles,
  Upload,
} from 'lucide-react';
import { MockupWorkflowStep } from '../types';

interface HeaderProps {
  activeStep: MockupWorkflowStep;
  onSelectStep: (step: MockupWorkflowStep) => void;
}

const WORKFLOW_STEPS: { id: MockupWorkflowStep; label: string; icon: React.ElementType }[] = [
  { id: 'upload-design', label: 'Design', icon: Upload },
  { id: 'product-reference', label: 'Case', icon: Smartphone },
  { id: 'scene-description', label: 'Scene', icon: Camera },
  { id: 'generate-mockup', label: 'Generate', icon: Sparkles },
  { id: 'preview-result', label: 'Preview', icon: ImageIcon },
  { id: 'download-result', label: 'Download', icon: Download },
];

export const Header: React.FC<HeaderProps> = ({ activeStep, onSelectStep }) => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 text-slate-100 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-400/30 bg-indigo-500/10">
            <Smartphone className="h-5 w-5 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">CaseCraft</span>
              <span className="rounded border border-indigo-400/30 bg-indigo-400/10 px-2 py-0.5 text-[11px] font-semibold text-indigo-200">
                Studio
              </span>
            </div>
            <p className="hidden text-xs text-slate-400 sm:block">Lifestyle mockup workflow</p>
          </div>
        </div>

        <nav aria-label="Mockup workflow" className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/70 p-1">
          {WORKFLOW_STEPS.map(({ id, label, icon: Icon }, index) => {
            const isActive = activeStep === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectStep(id)}
                aria-current={isActive ? 'step' : undefined}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium transition sm:px-3 ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{index + 1}. </span>{label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
