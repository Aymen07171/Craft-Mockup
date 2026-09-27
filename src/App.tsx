import React, { useState } from 'react';
import { Header } from './components/Header';
import { WorkflowStudio } from './components/WorkflowStudio';
import { PRINTIFY_TEMPLATES } from './data/printifyReferences';
import { MockupWorkflowState } from './types';

export default function App() {
  const [workflow, setWorkflow] = useState<MockupWorkflowState>({
    activeStep: 'upload-design',
    artwork: null,
    productReferenceId: null,
    productReferenceImage: null,
    sceneDescription: '',
    generatedImageUrl: null,
    isGenerating: false,
    generationError: null,
  });

  const handleUploadArtwork = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      setWorkflow((current) => ({
        ...current,
        artwork: { fileName: file.name, imageUrl: reader.result as string },
        generatedImageUrl: null,
        generationError: null,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleUploadProductReference = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      setWorkflow((current) => ({
        ...current,
        productReferenceImage: { fileName: file.name, imageUrl: reader.result as string },
        generatedImageUrl: null,
        generationError: null,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateMockup = async () => {
    const request = workflow;
    if (!request.artwork || !request.productReferenceImage || !request.sceneDescription.trim()) {
      setWorkflow((current) => ({
        ...current,
        generationError: 'Upload the artwork and a product reference image, then describe the scene.',
      }));
      return;
    }

    const selectedReference = PRINTIFY_TEMPLATES.find(
      (reference) => reference.id === request.productReferenceId
    );
    setWorkflow((current) => ({ ...current, isGenerating: true, generationError: null }));

    try {
      const response = await fetch('/api/generate-lifestyle-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designImageUrl: request.artwork.imageUrl,
          productMockupUrl: request.productReferenceImage.imageUrl,
          userScenePrompt: request.sceneDescription,
          modelName: selectedReference?.modelName ?? 'Model shown in supplied product reference',
          brand: selectedReference?.brand ?? 'unspecified',
          dimensions: selectedReference?.dimensions,
          cameraCutoutDesc:
            selectedReference?.cameraCutout.description ??
            'Match the exact camera opening visible in the supplied product reference image',
          caseType: 'Case construction shown in supplied product reference',
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        imageUrl?: string;
        error?: string;
      };

      if (!response.ok || !data.imageUrl) {
        throw new Error(data.error || 'Lifestyle mockup generation failed.');
      }
      const generatedImageUrl = data.imageUrl;

      setWorkflow((current) => {
        const inputsChanged =
          current.artwork?.imageUrl !== request.artwork?.imageUrl ||
          current.productReferenceImage?.imageUrl !== request.productReferenceImage?.imageUrl ||
          current.productReferenceId !== request.productReferenceId ||
          current.sceneDescription !== request.sceneDescription;

        if (inputsChanged) {
          return {
            ...current,
            isGenerating: false,
            generationError: 'Inputs changed while generating. Run generation again to use the updated inputs.',
          };
        }

        return {
          ...current,
          activeStep: 'preview-result',
          generatedImageUrl,
          isGenerating: false,
          generationError: null,
        };
      });
    } catch (error) {
      setWorkflow((current) => ({
        ...current,
        isGenerating: false,
        generationError:
          error instanceof Error ? error.message : 'Lifestyle mockup generation failed.',
      }));
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Header
        activeStep={workflow.activeStep}
        onSelectStep={(activeStep) => setWorkflow((current) => ({ ...current, activeStep }))}
      />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <WorkflowStudio
          workflow={workflow}
          onSelectStep={(activeStep) => setWorkflow((current) => ({ ...current, activeStep }))}
          onUploadArtwork={handleUploadArtwork}
          onUploadProductReference={handleUploadProductReference}
          onGenerate={handleGenerateMockup}
          onSelectReference={(productReferenceId) =>
            setWorkflow((current) => ({
              ...current,
              productReferenceId,
              generatedImageUrl: null,
              generationError: null,
            }))
          }
          onChangeSceneDescription={(sceneDescription) =>
            setWorkflow((current) => ({
              ...current,
              sceneDescription,
              generatedImageUrl: null,
              generationError: null,
            }))
          }
        />
      </main>
    </div>
  );
}
