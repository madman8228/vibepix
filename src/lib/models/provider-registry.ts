import type { ImageUnderstandingProvider } from "./provider-types";
import { mockImageUnderstandingProvider } from "./mock-image-understanding";

export function getImageUnderstandingProvider(): ImageUnderstandingProvider {
  return mockImageUnderstandingProvider;
}
