import { Brush, Camera, Code2, Cuboid, Gamepad2, Globe2, Pin, Wrench } from "lucide-react";

export type PortfolioFocusId =
  | "godot"
  | "blender"
  | "automotive"
  | "web"
  | "digital-art";

export const portfolioSocials = [
  {
    label: "Instagram",
    href: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM ?? "",
    icon: Camera,
  },
  {
    label: "Facebook",
    href: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK ?? "",
    icon: Globe2,
  },
  {
    label: "Pinterest",
    href: process.env.NEXT_PUBLIC_SOCIAL_PINTEREST ?? "",
    icon: Pin,
  },
];

export const portfolioFocuses = [
  {
    id: "godot",
    label: "Godot Game Development",
    eyebrow: "Interactive systems",
    icon: Gamepad2,
    summary:
      "Gameplay prototypes, systemic mechanics, scene architecture, UI flows, and compact interactive experiences built around feel first.",
    metrics: ["game loops", "tools", "prototypes"],
    works: [
      {
        year: "2023",
        title: "Prototype Mechanics",
        description: "Movement, interaction, and feedback loops for fast iteration in Godot.",
      },
      {
        year: "2024",
        title: "Game UI Systems",
        description: "Reusable menu, inventory, and state-driven interface patterns.",
      },
      {
        year: "2026",
        title: "Playable Worlds",
        description: "Small vertical slices where environment, input, and pacing work together.",
      },
    ],
  },
  {
    id: "blender",
    label: "Blender Asset Modeling",
    eyebrow: "Production-ready assets",
    icon: Cuboid,
    summary:
      "Hard-surface and stylized assets modeled with clean silhouettes, controlled topology, and portfolio-ready material presentation.",
    metrics: ["modeling", "materials", "render prep"],
    works: [
      {
        year: "2022",
        title: "Asset Studies",
        description: "Focused modeling exercises around proportion, material response, and detail density.",
      },
      {
        year: "2024",
        title: "Modular Props",
        description: "Reusable objects designed for scenes, games, and visual sets.",
      },
      {
        year: "2025",
        title: "Lookdev Sets",
        description: "Lighting and material passes tuned for black-background presentation.",
      },
    ],
  },
  {
    id: "automotive",
    label: "3D Environment & World Building",
    eyebrow: "Liminal spaces, dreamcore, architecture",
    icon: Wrench,
    summary:
      "3D environments and liminal space assets built in Blender with atmospheric lighting, controlled topology, and dreamcore aesthetic.",
    metrics: ["environments", "liminal spaces", "world building"],
    works: [
      {
        year: "2023",
        title: "Spatial Studies",
        description: "Explorations of interior volumes, lighting signatures, and architectural massing.",
      },
      {
        year: "2025",
        title: "Liminal Assets",
        description: "Modular environment props and level geometry designed for atmospheric games.",
      },
      {
        year: "2026",
        title: "Dreamcore Scenes",
        description: "Immersive 3D environments framing surreal and liminal game spaces.",
      },
    ],
  },
  {
    id: "web",
    label: "Web Development",
    eyebrow: "Interfaces and systems",
    icon: Code2,
    summary:
      "Full-stack interfaces, dashboards, marketplaces, forms, data flows, and polished frontends with practical product behavior.",
    metrics: ["PHP", "JavaScript", "SQL"],
    works: [
      {
        year: "2024",
        title: "Marketplace Foundations",
        description: "Listings, search, saved states, account flows, and media upload workflows.",
      },
      {
        year: "2025",
        title: "Operational UI",
        description: "Dense but readable tools for repeated action and fast comparison.",
      },
      {
        year: "2026",
        title: "Portfolio System",
        description: "A modular personal site with social feed and protected internal modules.",
      },
    ],
  },
  {
    id: "digital-art",
    label: "Digital Art",
    eyebrow: "Atmosphere and form",
    icon: Brush,
    summary:
      "Digital compositions that combine dark visual language, motion, depth, abstract texture, and cinematic object focus.",
    metrics: ["composition", "motion", "visual identity"],
    works: [
      {
        year: "2022",
        title: "Texture Experiments",
        description: "Studies in contrast, blur, glass, and high-black composition.",
      },
      {
        year: "2024",
        title: "Motion Loops",
        description: "Subtle animated pieces built for social and portfolio presentation.",
      },
      {
        year: "2026",
        title: "Liquid Panels",
        description: "Material-driven visual systems for identity and interface experiments.",
      },
    ],
  },
] satisfies {
  id: PortfolioFocusId;
  label: string;
  eyebrow: string;
  icon: typeof Gamepad2;
  summary: string;
  metrics: string[];
  works: { year: string; title: string; description: string }[];
}[];
