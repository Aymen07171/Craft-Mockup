import React, { useState } from 'react';
import { Header } from './components/Header';
import { WorkflowStudio } from './components/WorkflowStudio';
import { PRINTIFY_TEMPLATES } from './data/printifyReferences';
import { GeneratedWorkflowMockup, MockupWorkflowState } from './types';

const generateCaseScene = async (
  artworkImageUrl: string,
  sceneDescription: string,
  referenceId: string,
  variationIndex: number,
  productMockupUrl?: string,
  sceneReferenceImageUrls: string[] = []
) => {
  const reference = PRINTIFY_TEMPLATES.find((item) => item.id === referenceId);
  if (!reference) throw new Error('The selected Printify model is unavailable.');

  const featureDescription = [
    reference.caseFeatures.toughBumper ? 'reinforced tough bumper' : '',
    reference.caseFeatures.raisedBezel ? 'raised protective bezel' : '',
    reference.caseFeatures.wrapBleed ? 'full-bleed wrap print' : '',
  ].filter(Boolean).join(', ');
  const response = await fetch('/api/generate-lifestyle-scene', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      designImageUrl: artworkImageUrl,
      productMockupUrl,
      sceneReferenceImages: sceneReferenceImageUrls,
      userScenePrompt: sceneDescription,
      styleDirection: `Maintain this shared visual theme while making this case's composition distinct. Variation ${variationIndex}: vary camera angle, phone placement, lighting, environment, and props.`,
      modelName: reference.modelName,
      brand: reference.brand,
      dimensions: reference.dimensions,
      cameraCutoutDesc: `${reference.cameraCutout.description}; ${reference.cameraCutout.position}; ${reference.cameraCutout.cornerCurvature} corners`,
      caseShapeDesc: `${reference.dimensions.mmWidth}mm x ${reference.dimensions.mmHeight}mm case, ${reference.cameraCutout.aspectRatio.toFixed(4)} width-to-height ratio, ${reference.cameraCutout.cornerCurvature} corner curvature; ${featureDescription}`,
      variationIndex,
    }),
  });
  const data = (await response.json().catch(() => ({}))) as { imageUrl?: string; error?: string };
  if (!response.ok || !data.imageUrl) throw new Error(data.error || `Failed to generate ${reference.modelName}.`);
  return { reference, imageUrl: data.imageUrl };
};

export default function App() {
  const [workflow, setWorkflow] = useState<MockupWorkflowState>({
    activeStep: 'upload-design',
    artwork: null,
    productReferenceIds: [],
    productReferenceImages: {},
    sceneReferenceImages: [],
    sceneDescription: '',
    generatedMockups: [],
    generatedImageUrl: null,
    isGenerating: false,
    generationProgress: null,
    generationError: null,
  });

  const handleUploadArtwork = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      setWorkflow((current) => ({
        ...current,
        artwork: { fileName: file.name, imageUrl: reader.result as string },
        generatedMockups: [],
        generatedImageUrl: null,
        generationError: null,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleUploadProductReference = (modelId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      setWorkflow((current) => ({
        ...current,
        productReferenceImages: {
          ...current.productReferenceImages,
          [modelId]: { fileName: file.name, imageUrl: reader.result as string },
        },
        generatedMockups: [],
        generatedImageUrl: null,
        generationError: null,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSceneReference = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      setWorkflow((current) => ({
        ...current,
        sceneReferenceImages: [
          ...current.sceneReferenceImages,
          { id: crypto.randomUUID(), fileName: file.name, imageUrl: reader.result as string },
        ],
        generatedMockups: [],
        generatedImageUrl: null,
        generationError: null,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateMockup = async () => {
    const request = workflow;
    if (
      !request.artwork ||
      request.productReferenceIds.length === 0 ||
      !request.sceneDescription.trim()
    ) {
      setWorkflow((current) => ({
        ...current,
        generationError: 'Upload the artwork, select at least one case, and describe the shared scene theme.',
      }));
      return;
    }

    const references = request.productReferenceIds
      .map((id) => PRINTIFY_TEMPLATES.find((reference) => reference.id === id))
      .filter((reference) => reference !== undefined);
    const generatedMockups: GeneratedWorkflowMockup[] = references.map((reference) => ({
      modelId: reference.id,
      modelName: reference.modelName,
      sceneTitle: `${reference.modelName} scene`,
      prompt: request.sceneDescription,
      imageUrl: null,
      status: 'generating',
    }));
    setWorkflow((current) => ({
      ...current,
      generatedMockups,
      generatedImageUrl: null,
      isGenerating: true,
      generationProgress: `Preparing ${references.length} individual case scenes...`,
      generationError: null,
    }));

    try {
      for (const [index, reference] of references.entries()) {
        setWorkflow((current) => ({
          ...current,
          generationProgress: `Generating ${reference.modelName} scene (${index + 1} of ${references.length})...`,
        }));
        try {
          const { imageUrl } = await generateCaseScene(
            request.artwork.imageUrl,
            request.sceneDescription,
            reference.id,
            index + 1,
            request.productReferenceImages[reference.id]?.imageUrl,
            request.sceneReferenceImages.map((image) => image.imageUrl)
          );
          generatedMockups[index] = {
            ...generatedMockups[index],
            imageUrl,
            status: 'generated',
          };
        } catch (error) {
          generatedMockups[index] = {
            ...generatedMockups[index],
            status: 'failed',
            error: error instanceof Error ? error.message : 'Scene generation failed.',
          };
        }
        setWorkflow((current) => ({ ...current, generatedMockups: [...generatedMockups] }));
      }

      setWorkflow((current) => {
        const inputsChanged =
          current.artwork?.imageUrl !== request.artwork?.imageUrl ||
          current.productReferenceIds.join(',') !== request.productReferenceIds.join(',') ||
          Object.keys(current.productReferenceImages).length !== Object.keys(request.productReferenceImages).length ||
          Object.entries(request.productReferenceImages).some(
            ([modelId, image]) => current.productReferenceImages[modelId]?.imageUrl !== image.imageUrl
          ) ||
          current.sceneReferenceImages.length !== request.sceneReferenceImages.length ||
          request.sceneReferenceImages.some(
            (image, index) => current.sceneReferenceImages[index]?.imageUrl !== image.imageUrl
          ) ||
          current.sceneDescription !== request.sceneDescription;

        if (inputsChanged) {
          return {
            ...current,
            isGenerating: false,
            generationProgress: null,
            generationError: 'Inputs changed while generating. Run generation again to use the updated inputs.',
          };
        }

        return {
          ...current,
          activeStep: 'preview-result',
          generatedMockups,
          generatedImageUrl: generatedMockups.find((mockup) => mockup.imageUrl)?.imageUrl ?? null,
          isGenerating: false,
          generationProgress: null,
          generationError: generatedMockups.some((mockup) => mockup.status === 'failed')
            ? 'Some scenes could not be generated. Failed cases are marked in the gallery and can be retried.'
            : null,
        };
      });
    } catch (error) {
      setWorkflow((current) => ({
        ...current,
        isGenerating: false,
        generationProgress: null,
        generationError:
          error instanceof Error ? error.message : 'Lifestyle mockup generation failed.',
      }));
    }
  };

  const handleRegenerateMockup = async (modelId: string) => {
    if (!workflow.artwork) return;
    const index = workflow.generatedMockups.findIndex((item) => item.modelId === modelId);
    const currentMockup = workflow.generatedMockups[index];
    if (index < 0 || !currentMockup) return;
    setWorkflow((current) => ({
      ...current,
      generatedMockups: current.generatedMockups.map((item) =>
        item.modelId === modelId ? { ...item, status: 'generating', error: undefined } : item
      ),
      generationError: null,
    }));
    try {
      const { imageUrl } = await generateCaseScene(
        workflow.artwork.imageUrl,
        workflow.sceneDescription,
        modelId,
        index + 1,
        workflow.productReferenceImages[modelId]?.imageUrl,
        workflow.sceneReferenceImages.map((image) => image.imageUrl)
      );
      setWorkflow((current) => ({
        ...current,
        generatedMockups: current.generatedMockups.map((item) =>
          item.modelId === modelId ? { ...item, imageUrl, status: 'generated', error: undefined } : item
        ),
        generatedImageUrl: imageUrl,
      }));
    } catch (error) {
      setWorkflow((current) => ({
        ...current,
        generatedMockups: current.generatedMockups.map((item) =>
          item.modelId === modelId
            ? { ...item, status: 'failed', error: error instanceof Error ? error.message : 'Scene generation failed.' }
            : item
        ),
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
          onUploadSceneReference={handleUploadSceneReference}
          onRemoveSceneReference={(imageId) =>
            setWorkflow((current) => ({
              ...current,
              sceneReferenceImages: current.sceneReferenceImages.filter((image) => image.id !== imageId),
              generatedMockups: [],
              generatedImageUrl: null,
              generationError: null,
            }))
          }
          onGenerate={handleGenerateMockup}
          onToggleReference={(productReferenceId) =>
            setWorkflow((current) => ({
              ...current,
              productReferenceIds: current.productReferenceIds.includes(productReferenceId)
                ? current.productReferenceIds.filter((id) => id !== productReferenceId)
                : [...current.productReferenceIds, productReferenceId],
              generatedMockups: [],
              generatedImageUrl: null,
              generationError: null,
            }))
          }
          onSelectAllReferences={(productReferenceIds) =>
            setWorkflow((current) => ({
              ...current,
              productReferenceIds,
              generatedMockups: [],
              generatedImageUrl: null,
              generationError: null,
            }))
          }
          onChangeSceneDescription={(sceneDescription) =>
            setWorkflow((current) => ({
              ...current,
              sceneDescription,
              generationError: null,
            }))
          }
          onRemoveProductReference={(modelId) =>
            setWorkflow((current) => {
              const productReferenceImages = { ...current.productReferenceImages };
              delete productReferenceImages[modelId];
              return {
                ...current,
                productReferenceImages,
                generatedMockups: [],
                generatedImageUrl: null,
              };
            })
          }
          onRegenerateMockup={handleRegenerateMockup}
          onRemoveMockup={(modelId) =>
            setWorkflow((current) => {
              const generatedMockups = current.generatedMockups.filter((item) => item.modelId !== modelId);
              return {
                ...current,
                generatedMockups,
                generatedImageUrl: generatedMockups.find((item) => item.imageUrl)?.imageUrl ?? null,
              };
            })
          }
        />
      </main>
    </div>
  );
}
