import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos de NUMA",
  description:
    "Découvrez l'histoire, la vision et l'éthique de NUMA, marque ivoirienne ambitieuse de vêtements.",
};

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-10 bg-white">
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-6">À propos de NUMA</h1>
      <p className="text-gray-700 mb-4">
        NUMA est une marque de vêtements ambitieuse, née en Côte d’Ivoire, avec la vision de devenir une
        référence mondiale. Chaque pièce NUMA est authentique et soigneusement sélectionnée, provenant
        du monde entier.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Notre Éthique</h2>
      <p className="text-gray-700">
        Nous plaçons la valeur humaine, l’originalité et la rareté au cœur de notre démarche. NUMA existe
        pour offrir une touche personnelle et unique à la mode, en célébrant la beauté et l’élégance de
        chacun.
      </p>
    </main>
  );
}
