import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: [
      {
        find: /^@sappy\/shared(.*)$/,
        replacement: path.resolve(__dirname, "../../packages/shared/src") + "$1",
      },
    ],
  },
});
