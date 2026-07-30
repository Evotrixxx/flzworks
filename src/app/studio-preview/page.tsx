// TEMP local-only visual check for the studio rework. Delete before committing.
import { StudioEditor } from "@/components/studio-editor";
import { GRADIENT_PRESETS } from "@/components/studio/types";

const now = new Date("2026-07-29T10:00:00Z");

export default function StudioPreviewPage() {
  return (
    <StudioEditor
      userEmail="floszbeni@gmail.com"
      flzSettings={{
        hero_headline: "Games and 3D,\nbuilt in public.",
        building_start_date: "2023-09-01",
        followers_count: "soon",
        wishlists_count: "soon",
        discord_url: "https://discord.gg",
      }}
      flzProjects={[
        {
          id: "1",
          title: "Ronin — swordsman",
          tools: "Blender · ZBrush",
          category: "Characters",
          age: "2 days ago",
          gradient: GRADIENT_PRESETS[0].value,
          description: "Hand-painted, 24k tris, game-ready character breakdown from block-out to pose.",
          featured: true,
          visible: true,
          sortOrder: 1,
          linkUrl: "https://sketchfab.com/models/example",
          imageUrl: null,
        },
        {
          id: "2",
          title: "Kessler R-7 coupe",
          tools: "Blender · Substance",
          category: "Automotive",
          age: "1 week ago",
          gradient: GRADIENT_PRESETS[1].value,
          description: "Cyberpunk retro-futuristic automotive model with PBR material breakdown.",
          featured: false,
          visible: true,
          sortOrder: 2,
          linkUrl: null,
          imageUrl: null,
        },
        {
          id: "3",
          title: "Dust Runner demo",
          tools: "Unity · Godot",
          category: "Gameplay",
          age: "2 weeks ago",
          gradient: GRADIENT_PRESETS[2].value,
          description: "High-octane desert hovering mechanics built with custom physics controllers.",
          featured: false,
          visible: false,
          sortOrder: 3,
          linkUrl: null,
          imageUrl: null,
        },
        {
          id: "4",
          title: "Impact VFX pack",
          tools: "HLSL · Niagara",
          category: "Assets",
          age: "3 weeks ago",
          gradient: GRADIENT_PRESETS[3].value,
          description: "Stylized explosion and impact visual effects with customizable shaders.",
          featured: false,
          visible: true,
          sortOrder: 4,
          linkUrl: null,
          imageUrl: null,
        },
      ]}
      articles={[
        {
          id: "a1",
          folderName: "Mirsairen_2025_08_09",
          title: "Mirsairen",
          description: "Portfolio project: Mirsairen. Automatically loaded from Media repository.",
          date: "2025-08-09",
          visible: true,
          category: "CAR_DESIGN",
          images: ["10.png", "11.png", "12.png", "13.png", "14.png"],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: "a2",
          folderName: "HYDRA_2026_02_11",
          title: "Hydra",
          description: "Hard-surface study.",
          date: "2026-02-11",
          visible: false,
          category: "OTHER",
          images: ["0001.jpg", "0002.jpg", "0003.jpg"],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: "a3",
          folderName: "Mirsairen_Posters",
          title: "Mirsairen Posters",
          description: null,
          date: "N/A",
          visible: true,
          category: "MEDIA",
          images: [],
          createdAt: now,
          updatedAt: now,
        },
      ]}
      social={[
        { platform: "x", label: "X — @FLZWORKS", postUrl: "https://x.com/flzworks", imageUrl: "" },
        { platform: "instagram", label: "IG — @FLZWORKS", postUrl: "", imageUrl: "" },
        { platform: "tiktok", label: "TIKTOK", postUrl: "", imageUrl: "" },
        { platform: "linkedin", label: "LINKEDIN", postUrl: "", imageUrl: "" },
      ]}
    />
  );
}
