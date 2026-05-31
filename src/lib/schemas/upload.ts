import { z } from "zod";

export const uploadRequestSchema = z
  .object({
    fileName: z.string().trim().min(1).optional(),
    sourceUrl: z.string().trim().min(1).optional(),
    mimeType: z.string().trim().min(1).optional(),
  })
  .refine((value) => Boolean(value.fileName || value.sourceUrl), {
    message: "At least one image reference is required.",
    path: ["sourceUrl"],
  });

export type UploadRequest = z.infer<typeof uploadRequestSchema>;
