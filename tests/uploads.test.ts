import { describe, it, expect, afterEach } from "vitest";
import path from "node:path";
import { getUploadDir, getUploadPath, getMaxUploadBytes } from "@/lib/uploads";

describe("uploads", () => {
  const originalDir = process.env.UPLOAD_DIR;
  const originalMax = process.env.MAX_UPLOAD_MB;

  afterEach(() => {
    if (originalDir === undefined) delete process.env.UPLOAD_DIR;
    else process.env.UPLOAD_DIR = originalDir;
    if (originalMax === undefined) delete process.env.MAX_UPLOAD_MB;
    else process.env.MAX_UPLOAD_MB = originalMax;
  });

  it("resolves the default directory under cwd", () => {
    delete process.env.UPLOAD_DIR;
    expect(getUploadDir()).toBe(path.resolve(process.cwd(), "./public/uploads"));
  });

  it("honours UPLOAD_DIR", () => {
    process.env.UPLOAD_DIR = "./custom/uploads";
    expect(getUploadDir()).toBe(path.resolve(process.cwd(), "./custom/uploads"));
  });

  it("joins a filename onto the directory", () => {
    delete process.env.UPLOAD_DIR;
    expect(getUploadPath("a.png")).toBe(
      path.resolve(process.cwd(), "./public/uploads", "a.png"),
    );
  });

  it("defaults the max upload size to 5MB", () => {
    delete process.env.MAX_UPLOAD_MB;
    expect(getMaxUploadBytes()).toBe(5 * 1024 * 1024);
  });

  it("honours MAX_UPLOAD_MB", () => {
    process.env.MAX_UPLOAD_MB = "10";
    expect(getMaxUploadBytes()).toBe(10 * 1024 * 1024);
  });

  it("falls back to 5MB on a non-numeric value", () => {
    process.env.MAX_UPLOAD_MB = "abc";
    expect(getMaxUploadBytes()).toBe(5 * 1024 * 1024);
  });

  it("falls back to 5MB on a non-positive value", () => {
    process.env.MAX_UPLOAD_MB = "0";
    expect(getMaxUploadBytes()).toBe(5 * 1024 * 1024);
  });
});
