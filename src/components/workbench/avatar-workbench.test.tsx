// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AvatarWorkbench } from "./avatar-workbench";
import {
  getPlayJob,
  getPlayLobby,
  ratePlayJob,
  startPlay,
  uploadAvatar,
} from "../../lib/api";

vi.mock("../../lib/api", () => ({
  uploadAvatar: vi.fn(),
  getPlayLobby: vi.fn(),
  startPlay: vi.fn(),
  getPlayJob: vi.fn(),
  ratePlayJob: vi.fn(),
}));

function selectAvatar() {
  fireEvent.change(screen.getByLabelText("Avatar upload"), {
    target: {
      files: [new File(["avatar"], "avatar.png", { type: "image/png" })],
    },
  });
}

describe("AvatarWorkbench", () => {
  beforeEach(() => {
    vi.mocked(uploadAvatar).mockResolvedValue({
      uploadSessionId: "upload_1",
      analysis: {
        summary: "这张头像偏明亮轻快，第一眼会让人觉得更亲近。",
        tags: ["明亮", "亲近", "轻快"],
      },
    });
    vi.mocked(getPlayLobby).mockResolvedValue({
      uploadSessionId: "upload_1",
      analysis: {
        summary: "这张头像偏明亮轻快，第一眼会让人觉得更亲近。",
        tags: ["明亮", "亲近", "轻快"],
      },
      recommendedPlays: [
        {
          playType: "personality_read",
          category: "text",
          title: "性格解读",
          description: "从头像的第一感觉出发，给你一段轻量性格侧写。",
          reason: "适合先用一句解读进入状态。",
          promptKey: "play.personality_read",
          tags: ["明亮"],
        },
        {
          playType: "mood_mode",
          category: "image",
          title: "心情模式",
          description: "把情绪和氛围放大，生成一张单图。",
          reason: "适合先从情绪氛围开始。",
          promptKey: "play.mood_mode",
          tags: ["轻快"],
        },
        {
          playType: "story_mode",
          category: "image",
          title: "剧情模式",
          description: "把头像放进像故事截图的场景里。",
          reason: "适合想要一点故事感。",
          promptKey: "play.story_mode",
          tags: ["主角感"],
        },
        {
          playType: "style_swap",
          category: "image",
          title: "换风格头像",
          description: "保留你的辨识度，只切换整体风格。",
          reason: "适合想换新鲜感。",
          promptKey: "play.style_swap",
          tags: ["时髦"],
        },
        {
          playType: "poster",
          category: "image",
          title: "海报生成",
          description: "把头像做成更有展示感的一张海报图。",
          reason: "适合更强视觉张力。",
          promptKey: "play.poster",
          tags: ["大胆"],
        },
      ],
      availablePlays: [
        {
          playType: "personality_read",
          category: "text",
          title: "性格解读",
          description: "从头像的第一感觉出发，给你一段轻量性格侧写。",
          reason: "适合先用一句解读进入状态。",
          promptKey: "play.personality_read",
          tags: ["明亮"],
        },
        {
          playType: "daily_fortune",
          category: "text",
          title: "今日运势",
          description: "给这张头像一张当天稳定的小运势卡。",
          reason: "适合快速看今天的氛围。",
          promptKey: "play.daily_fortune",
          tags: ["轻快"],
        },
        {
          playType: "social_aura",
          category: "text",
          title: "社交气场",
          description: "看看这张头像在别人眼里更像什么气场。",
          reason: "适合在意第一印象的人。",
          promptKey: "play.social_aura",
          tags: ["亲近"],
        },
        {
          playType: "style_swap",
          category: "image",
          title: "换风格头像",
          description: "保留你的辨识度，只切换整体风格。",
          reason: "适合想换新鲜感。",
          promptKey: "play.style_swap",
          tags: ["时髦"],
        },
        {
          playType: "new_avatar",
          category: "image",
          title: "新头像生成",
          description: "生成一张新的头像版本。",
          reason: "适合想看更明显变化。",
          promptKey: "play.new_avatar",
          tags: ["大胆"],
        },
        {
          playType: "poster",
          category: "image",
          title: "海报生成",
          description: "做成更完整的海报图。",
          reason: "适合更强视觉张力。",
          promptKey: "play.poster",
          tags: ["戏剧感"],
        },
        {
          playType: "mood_mode",
          category: "image",
          title: "心情模式",
          description: "把情绪和氛围放大，生成一张单图。",
          reason: "适合先从情绪氛围开始。",
          promptKey: "play.mood_mode",
          tags: ["轻快"],
        },
        {
          playType: "story_mode",
          category: "image",
          title: "剧情模式",
          description: "把头像放进像故事截图的场景里。",
          reason: "适合想要一点故事感。",
          promptKey: "play.story_mode",
          tags: ["主角感"],
        },
      ],
    });
    vi.mocked(startPlay).mockResolvedValue({
      jobId: "job_1",
      status: "RUNNING",
      redirectTo: "/generate/job_1",
    });
    vi.mocked(getPlayJob).mockResolvedValue({
      jobId: "job_1",
      uploadSessionId: "upload_1",
      playType: "personality_read",
      status: "SUCCEEDED",
      progress: {
        label: "Ready",
        message: "结果已经准备好了。",
        percent: 100,
      },
      result: {
        kind: "text",
        playType: "personality_read",
        title: "性格解读",
        summary: "这张头像让人感觉很舒服。",
        highlights: ["温和", "亲近", "轻快"],
        suggestion: "自然一点会更适合你。",
        disclaimer: "仅供轻娱乐体验参考。",
      },
      rating: {
        score: null,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    vi.mocked(ratePlayJob).mockResolvedValue({
      jobId: "job_1",
      rating: {
        score: 4.5,
      },
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders a single-page shell with titled upload, play, and result regions", () => {
    render(<AvatarWorkbench />);

    const workbench = screen.getByRole("main");
    expect(workbench).toBeInTheDocument();

    const uploadRegion = screen.getByRole("region", { name: "上传头像" });
    expect(uploadRegion).toBeInTheDocument();

    const playsRegion = screen.getByRole("region", { name: "玩法选择" });
    expect(within(playsRegion).getByRole("heading", { level: 2, name: /玩法选择/i })).toBeInTheDocument();

    const resultRegion = screen.getByRole("region", { name: "当前结果" });
    expect(within(resultRegion).getByRole("heading", { level: 2, name: /结果会在这里展开/i })).toBeInTheDocument();
  });

  it("keeps crop optional after selecting an avatar file", async () => {
    render(<AvatarWorkbench />);

    selectAvatar();

    expect(
      await screen.findByText("拖动裁剪框或四角控制点，保留你想让模型重点看到的画面。也可以直接跳过。"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "跳过裁剪" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "使用裁剪结果" })).toBeInTheDocument();
  });

  it("shows primary plays inline after upload prep finishes", async () => {
    render(<AvatarWorkbench />);

    selectAvatar();
    fireEvent.click(await screen.findByRole("button", { name: "跳过裁剪" }));

    expect(await screen.findByRole("tab", { name: /解读/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /心情/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /剧情/i })).toBeInTheDocument();
  });

  it("renders the selected play result under the same page and supports rating", async () => {
    render(<AvatarWorkbench />);

    selectAvatar();
    fireEvent.click(await screen.findByRole("button", { name: "跳过裁剪" }));
    fireEvent.click(await screen.findByRole("button", { name: "开始性格解读" }));

    expect(await screen.findByText("这张头像让人感觉很舒服。")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "4.5 stars" }));

    await waitFor(() => {
      expect(ratePlayJob).toHaveBeenCalledWith("job_1", 4.5);
    });
  });
});
