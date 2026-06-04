import { describe, expect, it } from "vitest";

import manifest from "./manifest";

describe("app manifest", () => {
  it("defines installable desktop app metadata", () => {
    const result = manifest();

    expect(result.name).toBe("头像日签");
    expect(result.short_name).toBe("头像日签");
    expect(result.display).toBe("standalone");
    expect(result.start_url).toBe("/?source=pwa");
    expect(result.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          src: "/icons/icon-192.png",
          sizes: "192x192",
          type: "image/png",
        }),
        expect.objectContaining({
          src: "/icons/icon-512.png",
          sizes: "512x512",
          type: "image/png",
        }),
      ]),
    );
  });
});
