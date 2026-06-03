import { z } from "zod";

export const recommendRequestSchema = z.object({
  uploadSessionId: z.string().trim().min(1),
});

export type RecommendRequest = z.infer<typeof recommendRequestSchema>;
