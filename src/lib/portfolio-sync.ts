import { readdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

export interface PortfolioArticleWithImages {
  id: string;
  folderName: string;
  title: string;
  description: string | null;
  date: string;
  visible: boolean;
  category: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Robust folder name parser
export function parseFolderName(folderName: string): { title: string; date: string } {
  // Regex to match dates like _2026_11_17 or _2025_10_6 at the end of the folder name
  const dateRegex = /_(\d{4})_(\d{1,2})_(\d{1,2})$/;
  const match = folderName.match(dateRegex);

  let title = folderName;
  let date = "";

  if (match) {
    const [datePart, year, month, day] = match;
    // Extract title by removing the date suffix
    title = folderName.slice(0, -datePart.length);
    // Standardize date to YYYY-MM-DD
    date = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  } else {
    // Fallback if no date found
    date = "N/A";
  }

  // Format title: replace underscores with spaces, handle DONE prefix nicely
  let formattedTitle = title
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  // Beautify common prefixes
  if (formattedTitle.toUpperCase().startsWith("DONE ")) {
    formattedTitle = formattedTitle.slice(5) + " (Completed)";
  }

  return { title: formattedTitle, date };
}

export async function syncPortfolioArticles(): Promise<PortfolioArticleWithImages[]> {
  const portfolioRoot = path.join(process.cwd(), "Media", "Portfolio");
  
  let folders: string[] = [];
  try {
    const entries = await readdir(portfolioRoot, { withFileTypes: true });
    folders = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  } catch (error) {
    console.error("Failed to read Media/Portfolio directory:", error);
    return [];
  }

  const articles: PortfolioArticleWithImages[] = [];

  for (const folder of folders) {
    const { title: defaultTitle, date: parsedDate } = parseFolderName(folder);

    // Sync with database: find or create
    let dbArticle = await prisma.portfolioArticle.findUnique({
      where: { folderName: folder },
    });

    if (!dbArticle) {
      // Smart default categorization
      let defaultCategory = "CAR_DESIGN";
      const nameLower = folder.toLowerCase();
      if (
        nameLower.includes("poster") ||
        nameLower.includes("brosure") ||
        nameLower.includes("present")
      ) {
        defaultCategory = "OTHER";
      }

      dbArticle = await prisma.portfolioArticle.create({
        data: {
          folderName: folder,
          title: defaultTitle,
          date: parsedDate || "N/A",
          visible: true,
          category: defaultCategory,
          description: `Portfolio project: ${defaultTitle}. Automatically loaded from Media repository.`,
        },
      });
    }

    // Read images in the folder
    let images: string[] = [];
    try {
      const folderPath = path.join(portfolioRoot, folder);
      const files = await readdir(folderPath);
      images = files
        .filter((file) => {
          const ext = path.extname(file).toLowerCase();
          return [".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(ext);
        })
        // Sort numerically if filenames are numbers (e.g. 3.png, 10.png)
        .sort((a, b) => {
          const numA = parseInt(path.basename(a, path.extname(a)), 10);
          const numB = parseInt(path.basename(b, path.extname(b)), 10);
          if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
          }
          return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
        });
    } catch (err) {
      console.error(`Failed to read images from folder ${folder}:`, err);
    }

    articles.push({
      ...dbArticle,
      images,
    });
  }

  // Sort articles by date descending (Newest first), placing N/A at the end
  return articles.sort((a, b) => {
    if (a.date === "N/A" && b.date !== "N/A") return 1;
    if (a.date !== "N/A" && b.date === "N/A") return -1;
    if (a.date === "N/A" && b.date === "N/A") return a.title.localeCompare(b.title);
    return b.date.localeCompare(a.date);
  });
}
