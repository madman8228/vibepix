import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import RootLayout from "./layout";

describe("RootLayout", () => {
  it("wraps children in the document shell", () => {
    const html = renderToStaticMarkup(
      <RootLayout>
        <main>bootstrap</main>
      </RootLayout>,
    );

    expect(html).toContain('<html lang="en">');
    expect(html).toContain("<body><main>bootstrap</main></body>");
  });
});
