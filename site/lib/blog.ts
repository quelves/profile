import postsData from "@/content/posts.json";

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  tags: string[];
  content: string;
  readingTime: number;
  lang: string;
}

const posts: BlogPost[] = postsData as BlogPost[];

export function getAllPosts(): BlogPost[] {
  return [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | null {
  return posts.find((p) => p.slug === slug) || null;
}

export function getPostsByCategory(category: string): BlogPost[] {
  return getAllPosts().filter((p) => p.category === category);
}

export function getAllCategories(): string[] {
  const categories = new Set(posts.map((p) => p.category));
  return Array.from(categories).sort();
}

export const categoryLabels: Record<string, { label: string; description: string }> = {
  "ai-autonomous-systems": {
    label: "AI & Autonomous Systems",
    description: "Inteligencia artificial, agentes autónomos, sistemas auto-reparables y la próxima generación de organizaciones impulsadas por IA.",
  },
  "media-digital-platforms": {
    label: "Media & Digital Platforms",
    description: "Transformación de empresas de medios tradicionales hacia plataformas digitales OTT, streaming y monetización multi-modal.",
  },
  "leadership": {
    label: "Leadership",
    description: "Liderazgo tecnológico, construcción de equipos de alto desempeño, gestión del cambio y cultura organizacional.",
  },
  "enterprise-architecture": {
    label: "Enterprise Architecture",
    description: "Arquitectura empresarial, process mining, BPM, diseño de sistemas distribuidos y gobernanza tecnológica.",
  },
};
