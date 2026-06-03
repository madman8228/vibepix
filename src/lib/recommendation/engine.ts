import { defaultPlays } from "../catalog/default-plays";
import type { PlayDescriptor, PlayRecommendationInput, PlayRecommendationResult } from "../types";

function scorePlay(play: PlayDescriptor, input: PlayRecommendationInput) {
  const normalizedTags = input.tags.map((tag) => tag.toLowerCase());

  return play.tags.reduce((score, tag) => {
    return score + (normalizedTags.includes(tag.toLowerCase()) ? 1 : 0);
  }, 0);
}

function rankPlays(category: "text" | "image", input: PlayRecommendationInput) {
  return defaultPlays
    .filter((play) => play.category === category)
    .map((play) => ({ play, score: scorePlay(play, input) }))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return defaultPlays.indexOf(left.play) - defaultPlays.indexOf(right.play);
    })
    .map(({ play }) => play);
}

export function buildPlayRecommendations(
  input: PlayRecommendationInput,
): PlayRecommendationResult {
  const textPlays = rankPlays("text", input);
  const imagePlays = rankPlays("image", input);

  return {
    recommendedPlays: [textPlays[0], ...imagePlays.slice(0, 4)],
    availablePlays: defaultPlays,
  };
}
