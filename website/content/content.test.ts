import { describe, expect, it } from "vitest";
import { contentId } from "./id";
import type { Content } from "./types";

function assertAllStringsNonEmpty(obj: unknown, path = "content"): void {
  if (typeof obj === "string") {
    expect(obj.trim().length, `${path} kosong`).toBeGreaterThan(0);
    return;
  }
  if (Array.isArray(obj)) {
    expect(obj.length, `${path} tidak boleh array kosong`).toBeGreaterThan(0);
    obj.forEach((v, i) => assertAllStringsNonEmpty(v, `${path}[${i}]`));
    return;
  }
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) assertAllStringsNonEmpty(v, `${path}.${k}`);
  }
}

describe("konten Indonesia (sumber: NSG COMPRO.docx)", () => {
  it("3 divisi, masing-masing 10 item", () => {
    expect(contentId.divisions.items).toHaveLength(3);
    for (const d of contentId.divisions.items) expect(d.items).toHaveLength(10);
  });

  it("3 paragraf tentang, 5 misi, 5 nilai", () => {
    expect(contentId.about.paragraphs).toHaveLength(3);
    expect(contentId.about.missions).toHaveLength(5);
    expect(contentId.about.values).toHaveLength(5);
  });

  it("8 keunggulan, 4 poin K3, 2 paragraf komitmen", () => {
    expect(contentId.advantages.items).toHaveLength(8);
    expect(contentId.advantages.compliance.items).toHaveLength(4);
    expect(contentId.advantages.compliance.commitment).toHaveLength(2);
  });

  it("13 sektor target pelanggan", () => {
    expect(contentId.sectors.items).toHaveLength(13);
  });

  it("semua field teks terisi (non-kosong)", () => {
    assertAllStringsNonEmpty(contentId satisfies Content);
  });
});
