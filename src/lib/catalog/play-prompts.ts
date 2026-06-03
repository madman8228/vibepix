import type { PlayType } from "../types";

export const playPrompts: Record<PlayType, string> = {
  personality_read:
    "Write an entertainment-only personality read from an avatar. Keep it warm, observational, and non-diagnostic.",
  daily_fortune:
    "Write a same-day-stable daily fortune from an avatar. Keep it light, playful, and non-prescriptive.",
  social_aura:
    "Write a social aura read from an avatar. Focus on vibe and first impressions, not diagnosis.",
  style_swap:
    "Generate one style-swapped avatar concept that preserves identity cues while changing visual flavor.",
  new_avatar:
    "Generate one fresh avatar concept inspired by the uploaded portrait with a more transformed look.",
  poster:
    "Generate one display-first poster composition based on the uploaded avatar with stronger presentation energy.",
  mood_mode:
    "Generate one image centered on the avatar's emotional atmosphere and visual mood.",
  story_mode:
    "Generate one image that feels like a snapshot from a story scene built around the avatar.",
};
