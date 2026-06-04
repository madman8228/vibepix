// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AvatarWorkbench } from "./avatar-workbench";

describe("AvatarWorkbench", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders a single-page shell with titled upload, play, and result regions", () => {
    render(<AvatarWorkbench />);

    const workbench = screen.getByRole("main");
    expect(workbench).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "设计你的专属头像" })).toBeInTheDocument();

    const uploadRegion = screen.getByRole("region", { name: "上传头像" });
    expect(within(uploadRegion).getByRole("heading", { level: 2, name: "上传头像" })).toBeInTheDocument();

    const playsRegion = screen.getByRole("region", { name: "玩法选择" });
    expect(within(playsRegion).getByRole("heading", { level: 2, name: "玩法选择" })).toBeInTheDocument();

    const resultRegion = screen.getByRole("region", { name: "当前结果" });
    expect(within(resultRegion).getByRole("heading", { level: 2, name: "当前结果" })).toBeInTheDocument();

    expect(screen.getAllByRole("region")).toHaveLength(3);
  });

  it("shows the inline crop choices after selecting an avatar file", () => {
    render(<AvatarWorkbench />);

    fireEvent.change(screen.getByLabelText("Avatar upload"), {
      target: {
        files: [new File(["avatar"], "avatar.png", { type: "image/png" })],
      },
    });

    expect(
      screen.getByText("拖动头像，调整你想保留的画面范围。"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "跳过裁剪" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "使用裁剪结果" }),
    ).toBeInTheDocument();
  });
});
