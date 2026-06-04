// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AvatarWorkbench } from "./avatar-workbench";

describe("AvatarWorkbench", () => {
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
});
