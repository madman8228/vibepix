import type { GenerationAsset, GenerationResult } from "../schemas/generate";
import type { CompiledProviderPrompt, GenerationIntent } from "../orchestration/prompt-compiler";

export type MockImageGenerationInput = {
  jobId: string;
  prompt: CompiledProviderPrompt;
  intent: GenerationIntent;
};

function hashToHue(input: string) {
  let value = 0;

  for (let index = 0; index < input.length; index += 1) {
    value = (value * 31 + input.charCodeAt(index)) % 360;
  }

  return value;
}

function buildSvgDataUrl({
  title,
  subtitle,
  accentHue,
}: {
  title: string;
  subtitle: string;
  accentHue: number;
}) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900" role="img" aria-label="${title}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="hsl(${accentHue} 82% 66%)" />
          <stop offset="100%" stop-color="hsl(${(accentHue + 80) % 360} 65% 22%)" />
        </linearGradient>
      </defs>
      <rect width="1200" height="900" fill="#08111f" />
      <rect x="56" y="56" width="1088" height="788" rx="48" fill="url(#bg)" opacity="0.92" />
      <circle cx="964" cy="214" r="148" fill="rgba(255,255,255,0.12)" />
      <circle cx="278" cy="692" r="188" fill="rgba(255,255,255,0.08)" />
      <text x="120" y="182" fill="white" font-size="38" font-family="Georgia, serif" opacity="0.85">NextPic Mock Render</text>
      <text x="120" y="318" fill="white" font-size="86" font-family="Georgia, serif" font-weight="700">${title}</text>
      <text x="120" y="408" fill="rgba(255,255,255,0.9)" font-size="34" font-family="Verdana, sans-serif">${subtitle}</text>
      <rect x="120" y="518" width="362" height="14" rx="7" fill="rgba(255,255,255,0.42)" />
      <rect x="120" y="562" width="514" height="14" rx="7" fill="rgba(255,255,255,0.28)" />
      <rect x="120" y="606" width="430" height="14" rx="7" fill="rgba(255,255,255,0.2)" />
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function buildAsset(
  jobId: string,
  intent: GenerationIntent,
  panelIndex: number,
): GenerationAsset {
  const title = `Panel ${panelIndex + 1}`;
  const subtitle = `${intent.selection.style.title} | ${intent.selection.mode.title}`;
  const accentHue = hashToHue(`${jobId}:${panelIndex}:${intent.selection.gameplay.key}`);

  return {
    id: `${jobId}_panel_${panelIndex + 1}`,
    title,
    imageUrl: buildSvgDataUrl({
      title,
      subtitle,
      accentHue,
    }),
    altText: `${title} from ${intent.selection.style.title} with ${intent.selection.gameplay.title}.`,
    panelIndex,
  };
}

export const mockImageGenerationProvider = {
  async generate(input: MockImageGenerationInput): Promise<GenerationResult> {
    return buildMockGenerationResult(input);
  },
};

export function buildMockGenerationResult({
  jobId,
  prompt,
  intent,
}: MockImageGenerationInput): GenerationResult {
  const assets = Array.from({ length: intent.panelCount }, (_, panelIndex) =>
    buildAsset(jobId, intent, panelIndex),
  );
  const summary = `${intent.selection.mode.title} scene package for ${intent.selection.gameplay.title}, rendered as a ${intent.selection.style.title} mock set.`;

  return {
    summary: `${summary} ${prompt.renderNotes[0]}`,
    assets,
    selection: {
      styleTitle: intent.selection.style.title,
      modeTitle: intent.selection.mode.title,
      gameplayTitle: intent.selection.gameplay.title,
    },
  };
}
