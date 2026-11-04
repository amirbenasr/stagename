import type { Metadata } from "next";
import { brandKitRepository } from "../../../lib/repositories/brand-kit-repository";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const kit = await brandKitRepository.findBySlug(slug).catch(() => null);
  const name = kit?.names?.[0]?.name;

  if (!name) {
    return {
      title: "Debut Artist Kit | StageName Club",
      description: "3 stage names, 12 images and a First Take performance clip.",
    };
  }

  const title = `${name} — Debut Artist Kit | StageName Club`;
  const description = `Meet ${name}: 3 stage names, 12 images and a First Take performance clip.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      siteName: "stagename.club",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function BrandKitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
