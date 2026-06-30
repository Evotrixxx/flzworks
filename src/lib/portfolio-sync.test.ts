import { describe, expect, it, vi } from "vitest";
import { parseFolderName, syncPortfolioArticles } from "./portfolio-sync";
import { prisma } from "./prisma";
import { readdir } from "fs/promises";

vi.mock("fs/promises", () => ({
  readdir: vi.fn(),
}));

vi.mock("./prisma", () => ({
  prisma: {
    portfolioArticle: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("portfolio-sync", () => {
  it("parses folder name correctly", () => {
    const { title, date } = parseFolderName("mirsairen_concept_2026_11_17");
    expect(title).toBe("Mirsairen Concept");
    expect(date).toBe("2026-11-17");
  });

  it("assigns categories based on folder/title keywords", async () => {
    // Mock readdir to return some folders on first call, and string filenames on subsequent calls
    vi.mocked(readdir).mockImplementation(async (dirPath: any, options?: any) => {
      if (options && options.withFileTypes) {
        return [
          { name: "lego_technic_car_2026_11_17", isDirectory: () => true },
          { name: "godot_game_project_2026_11_18", isDirectory: () => true },
          { name: "poster_design_2026_11_19", isDirectory: () => true },
          { name: "mirsairen_hypercar_2026_11_20", isDirectory: () => true },
          { name: "unknown_project_2026_11_21", isDirectory: () => true },
        ] as any;
      }
      return ["1.png", "2.jpg"];
    });

    // Mock prisma findUnique to return null (force creation)
    vi.mocked(prisma.portfolioArticle.findUnique).mockResolvedValue(null);

    // Capture created categories
    const createdCategories: string[] = [];
    vi.mocked(prisma.portfolioArticle.create).mockImplementation(((args: any) => {
      createdCategories.push(args.data.category);
      return Promise.resolve({
        id: "mocked-id",
        folderName: args.data.folderName,
        title: args.data.title,
        date: args.data.date,
        visible: args.data.visible,
        category: args.data.category,
        description: args.data.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }) as any);

    const result = await syncPortfolioArticles();

    expect(createdCategories).toEqual([
      "BRICKWORKS",
      "GAMES",
      "MEDIA",
      "CAR_DESIGN",
      "OTHER",
    ]);

    // Check that images are correctly attached
    expect(result[0].images).toEqual(["1.png", "2.jpg"]);
  });
});
