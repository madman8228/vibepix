// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { uploadAvatar } from "../../lib/api";
import { AvatarUploadForm } from "./avatar-upload-form";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("../../lib/api", () => ({
  uploadAvatar: vi.fn(),
}));

describe("AvatarUploadForm", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("redirects successful uploads into the play lobby", async () => {
    vi.mocked(uploadAvatar).mockResolvedValueOnce({
      uploadSessionId: "upload_1",
      analysis: {
        summary: "Bright and upbeat portrait with a friendly social vibe.",
        tags: ["bright", "friendly", "upbeat"],
      },
    });

    render(<AvatarUploadForm />);

    fireEvent.change(screen.getByLabelText("Avatar upload"), {
      target: {
        files: [new File(["avatar"], "avatar.jpg", { type: "image/jpeg" })],
      },
    });

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(
        "/recommend?uploadSessionId=upload_1",
      );
    });
  });

  it("surfaces compliance failures from the upload API", async () => {
    vi.mocked(uploadAvatar).mockRejectedValueOnce(
      new Error("This image has a compliance issue and cannot be processed."),
    );

    render(<AvatarUploadForm />);

    fireEvent.change(screen.getByLabelText("Avatar upload"), {
      target: {
        files: [new File(["avatar"], "avatar-unsafe.jpg", { type: "image/jpeg" })],
      },
    });

    expect(
      await screen.findByText(
        "This image has a compliance issue and cannot be processed.",
      ),
    ).toBeInTheDocument();
  });
});
