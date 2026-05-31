import { z } from "zod";

import { tierKeys } from "../types";

export const recommendRequestSchema = z.object({
  uploadSessionId: z.string().trim().min(1),
  tierKey: z.enum(tierKeys),
});

export type RecommendRequest = z.infer<typeof recommendRequestSchema>;
