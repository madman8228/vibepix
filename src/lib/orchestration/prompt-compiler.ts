import type {
  CharacterBible,
  GenerationSelection,
} from "./character-bible";

export type GenerationIntent = {
  providerKey: "mock-image-generator";
  modelKey: "mock-storyboard-v1";
  seed: string;
  panelCount: number;
  selection: GenerationSelection;
  characterBible: CharacterBible;
};

export type CompiledProviderPrompt = {
  providerKey: GenerationIntent["providerKey"];
  modelKey: GenerationIntent["modelKey"];
  systemPrompt: string;
  imagePrompt: string;
  negativePrompt: string;
  renderNotes: string[];
};

type BuildGenerationIntentInput = {
  jobId: string;
  panelCount: number;
  selection: GenerationSelection;
  characterBible: CharacterBible;
};

export function buildGenerationIntent({
  jobId,
  panelCount,
  selection,
  characterBible,
}: BuildGenerationIntentInput): GenerationIntent {
  return {
    providerKey: "mock-image-generator",
    modelKey: "mock-storyboard-v1",
    seed: jobId,
    panelCount,
    selection,
    characterBible,
  };
}

export function compileProviderPrompt(
  intent: GenerationIntent,
): CompiledProviderPrompt {
  const { selection, characterBible } = intent;

  return {
    providerKey: intent.providerKey,
    modelKey: intent.modelKey,
    systemPrompt:
      "You are compiling a clean mock generation prompt for a deterministic storyboard renderer.",
    imagePrompt: [
      `Style: ${selection.style.title}.`,
      `Mode: ${selection.mode.title}.`,
      `Gameplay: ${selection.gameplay.title}.`,
      `Character brief: ${characterBible.coreSummary}.`,
      `Traits: ${characterBible.signatureTraits.join(", ")}.`,
      `Direction: ${characterBible.storyHook}`,
    ].join(" "),
    negativePrompt:
      "Avoid blur, broken anatomy, duplicate faces, clipped framing, and noisy backgrounds.",
    renderNotes: [
      `Use ${intent.panelCount} panel slot${intent.panelCount === 1 ? "" : "s"}.`,
      `Keep the mood aligned with ${selection.gameplay.title}.`,
      `Seed output with ${intent.seed}.`,
    ],
  };
}
