import path from "node:path";

import { defineConfig } from "vitest/config";

// Run in a timezone ahead of UTC so date bugs (like the contribution graph
// off-by-one) actually show up in tests.
process.env.TZ = "Europe/Rome";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
