import { z } from "zod";

const selectedKeySchema = z.string().trim().min(1);

export const jobStatuses = ["PENDING", "RUNNING", "SUCCEEDED", "FAILED"] as const;

export const generateRequestSchema = z.object({
  recommendationId: z.string().trim().min(1),
  selectedStyleKey: selectedKeySchema,
  selectedModeKey: selectedKeySchema,
  selectedGameplayKey: selectedKeySchema,
});

export const generationAssetSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  imageUrl: z.string().trim().min(1),
  altText: z.string().trim().min(1),
  panelIndex: z.number().int().nullable(),
});

export const generationResultSchema = z.object({
  summary: z.string().trim().min(1),
  assets: z.array(generationAssetSchema),
  selection: z.object({
    styleTitle: z.string().trim().min(1).nullable(),
    modeTitle: z.string().trim().min(1).nullable(),
    gameplayTitle: z.string().trim().min(1).nullable(),
  }),
});

export const generationJobProgressSchema = z.object({
  label: z.string().trim().min(1),
  message: z.string().trim().min(1),
  percent: z.number().min(0).max(100),
});

export const startGenerationResponseSchema = z.object({
  jobId: z.string().trim().min(1),
  status: z.enum(jobStatuses),
  redirectTo: z.string().trim().min(1),
});

export const generationJobResponseSchema = z.object({
  jobId: z.string().trim().min(1),
  status: z.enum(jobStatuses),
  progress: generationJobProgressSchema,
  result: generationResultSchema.nullable(),
  errorMessage: z.string().nullable(),
  createdAt: z.string().trim().min(1),
  updatedAt: z.string().trim().min(1),
});

export type GenerateRequest = z.infer<typeof generateRequestSchema>;
export type GenerationAsset = z.infer<typeof generationAssetSchema>;
export type GenerationResult = z.infer<typeof generationResultSchema>;
export type GenerationJobProgress = z.infer<typeof generationJobProgressSchema>;
export type StartGenerationResponse = z.infer<
  typeof startGenerationResponseSchema
>;
export type GenerationJobResponse = z.infer<typeof generationJobResponseSchema>;
export type GenerationJobStatus = (typeof jobStatuses)[number];
