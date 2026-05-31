import { defaultGameplay } from "../catalog/default-gameplay";
import { defaultModes } from "../catalog/default-modes";
import { defaultStyles } from "../catalog/default-styles";
import type {
  RecommendationGroup,
  RecommendationInput,
  RecommendationResult,
} from "../types";

const MAX_GROUP_RESULTS = 3;

function rankCatalog(
  items: RecommendationGroup[],
  input: RecommendationInput,
): RecommendationGroup[] {
  const normalizedTags = input.vibeTags.map((tag) => tag.toLowerCase());

  return items
    .filter((item) => item.tierKeys.includes(input.tierKey))
    .map((item) => {
      const score = item.tags.reduce((total, tag) => {
        return total + (normalizedTags.includes(tag.toLowerCase()) ? 1 : 0);
      }, 0);

      return { item, score };
    })
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.item.sortOrder - right.item.sortOrder;
    })
    .slice(0, MAX_GROUP_RESULTS)
    .map(({ item }) => item);
}

export function buildRecommendations(
  input: RecommendationInput,
): RecommendationResult {
  return {
    styles: rankCatalog(defaultStyles, input),
    modes: rankCatalog(defaultModes, input),
    gameplay: rankCatalog(defaultGameplay, input),
  };
}
