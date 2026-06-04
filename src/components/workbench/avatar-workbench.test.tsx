// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AvatarWorkbench } from "./avatar-workbench";

describe("AvatarWorkbench", () => {
  it("renders one single-page flow with upload, plays, and result region", () => {
    render(<AvatarWorkbench />);

    expect(screen.getByRole("heading", { name: "设计你的专属头像" })).toBeInTheDocument();
    expect(screen.getByText("上传头像")).toBeInTheDocument();
    expect(screen.getByText("玩法选择")).toBeInTheDocument();
    expect(screen.getByText("当前结果")).toBeInTheDocument();
  });
});
