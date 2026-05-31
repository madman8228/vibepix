import { z } from "zod";

import { tierKeys } from "../types";

const selectedKeySchema = z.string().trim().min(1).nullable();

export const recommendRequestSchema = z.object({
  uploadSessionId: z.string().trim().min(1),
  tierKey: z.enum(tierKeys),
});

export const recommendSelectionUpdateSchema = z.object({
  recommendationId: z.string().trim().min(1),
  selectedStyleKey: selectedKeySchema,
  selectedModeKey: selectedKeySchema,
  selectedGameplayKey: selectedKeySchema,
});

export type RecommendRequest = z.infer<typeof recommendRequestSchema>;
export type RecommendSelectionUpdateRequest = z.infer<
  typeof recommendSelectionUpdateSchema
>;
