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

function createDeferredUpload() {
  let resolve!: (value: Awaited<ReturnType<typeof uploadAvatar>>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<Awaited<ReturnType<typeof uploadAvatar>>>(
    (res, rej) => {
      resolve = res;
      reject = rej;
    },
  );

  return { promise, resolve, reject };
}

describe("AvatarUploadForm", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("ignores a second file selection while an upload is in flight", async () => {
    const pendingUpload = createDeferredUpload();
    vi.mocked(uploadAvatar).mockReturnValueOnce(pendingUpload.promise);

    render(<AvatarUploadForm />);

    const input = screen.getByLabelText("Avatar upload");
    const firstFile = new File(["first"], "first-avatar.jpg", {
      type: "image/jpeg",
    });
    const secondFile = new File(["second"], "second-avatar.jpg", {
      type: "image/jpeg",
    });

    fireEvent.change(input, { target: { files: [firstFile] } });

    await waitFor(() => {
      expect(input).toBeDisabled();
    });

    fireEvent.change(input, { target: { files: [secondFile] } });

    expect(uploadAvatar).toHaveBeenCalledTimes(1);
    expect(uploadAvatar).toHaveBeenCalledWith(firstFile);

    pendingUpload.resolve({
      uploadSessionId: "session-1",
      analysis: {
        summary: "summary",
        vibeTags: ["friendly"],
      },
    } as Awaited<ReturnType<typeof uploadAvatar>>);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(
        "/recommend?uploadSessionId=session-1&tierKey=free",
      );
    });
  });

  it("clears the selected file name after an upload error", async () => {
    vi.mocked(uploadAvatar).mockRejectedValueOnce(
      new Error("Upload failed. Please try another image."),
    );

    render(<AvatarUploadForm />);

    const input = screen.getByLabelText("Avatar upload");
    const file = new File(["broken"], "broken-avatar.jpg", {
      type: "image/jpeg",
    });

    fireEvent.change(input, { target: { files: [file] } });

    expect(
      await screen.findByText("Upload failed. Please try another image."),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText(/Selected file:/i)).not.toBeInTheDocument();
    });
  });
});
