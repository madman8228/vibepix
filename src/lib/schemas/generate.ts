import { z } from "zod";

import { playTypes } from "../types";

const ratingValues = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5] as const;

export const playStatuses = ["PENDING", "RUNNING", "SUCCEEDED", "FAILED"] as const;

export const startPlayRequestSchema = z.object({
  uploadSessionId: z.string().trim().min(1),
  playType: z.enum(playTypes),
  variantKey: z.string().trim().min(1).optional(),
  variantLabel: z.string().trim().min(1).optional(),
});

export const playRatingUpdateSchema = z.object({
  score: z.union(ratingValues.map((value) => z.literal(value)) as [z.ZodLiteral<0.5>, ...z.ZodLiteral<number>[]]),
});

export const playDescriptorSchema = z.object({
  playType: z.enum(playTypes),
  category: z.enum(["text", "image"]),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  reason: z.string().trim().min(1),
});

export const textPlayResultSchema = z.object({
  kind: z.literal("text"),
  playType: z.enum(playTypes),
  title: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  highlights: z.tuple([
    z.string().trim().min(1),
    z.string().trim().min(1),
    z.string().trim().min(1),
  ]),
  suggestion: z.string().trim().min(1),
  disclaimer: z.string().trim().min(1),
});

export const imagePlayResultSchema = z.object({
  kind: z.literal("image"),
  playType: z.enum(playTypes),
  title: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  imageUrl: z.string().trim().min(1),
  altText: z.string().trim().min(1),
});

export const playResultSchema = z.union([
  textPlayResultSchema,
  imagePlayResultSchema,
]);

export const playJobProgressSchema = z.object({
  label: z.string().trim().min(1),
  message: z.string().trim().min(1),
  percent: z.number().min(0).max(100),
});

export const startPlayResponseSchema = z.object({
  jobId: z.string().trim().min(1),
  status: z.enum(playStatuses),
  redirectTo: z.string().trim().min(1),
});

export const playJobResponseSchema = z.object({
  jobId: z.string().trim().min(1),
  uploadSessionId: z.string().trim().min(1),
  playType: z.enum(playTypes),
  status: z.enum(playStatuses),
  progress: playJobProgressSchema,
  result: playResultSchema.nullable(),
  rating: z.object({
    score: z.number().nullable(),
  }),
  createdAt: z.string().trim().min(1),
  updatedAt: z.string().trim().min(1),
});

export const playRatingResponseSchema = z.object({
  jobId: z.string().trim().min(1),
  rating: z.object({
    score: z.number(),
  }),
});

export type StartPlayRequest = z.infer<typeof startPlayRequestSchema>;
export type StartPlayResponse = z.infer<typeof startPlayResponseSchema>;
export type PlayJobProgress = z.infer<typeof playJobProgressSchema>;
export type PlayJobResponse = z.infer<typeof playJobResponseSchema>;
export type PlayJobStatus = (typeof playStatuses)[number];
export type PlayRatingResponse = z.infer<typeof playRatingResponseSchema>;
export type TextPlayResult = z.infer<typeof textPlayResultSchema>;
export type ImagePlayResult = z.infer<typeof imagePlayResultSchema>;
