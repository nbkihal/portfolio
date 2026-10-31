import type { Metadata } from "next";
import GlassFolderCardsDemo from "@/components/glass-folder-cards-demo";

export const metadata: Metadata = {
  title: "Glass Folder Cards — Demo",
  robots: { index: false, follow: false },
};

export default function GlassFolderCardsPage() {
  return <GlassFolderCardsDemo />;
}
