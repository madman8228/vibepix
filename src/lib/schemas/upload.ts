import { z } from "zod";

export const uploadRequestSchema = z.object({
  fileName: z.string().trim().min(1).optional(),
  sourceUrl: z.string().trim().min(1),
  mimeType: z.string().trim().min(1).optional(),
});

export type UploadRequest = z.infer<typeof uploadRequestSchema>;
