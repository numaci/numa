import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Confidentialité – Newsletter NUMA",
  description:
    "Cette politique explique comment NUMA collecte, utilise et protège vos informations lorsque vous vous inscrivez à la newsletter.",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-10 bg-white">
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-6">
        Politique de Confidentialité – Newsletter NUMA
      </h1>
      <p className="text-gray-700 mb-6">
        Chez NUMA, nous respectons votre vie privée. Cette politique explique comment nous
        collectons, utilisons et protégeons vos informations lorsque vous vous inscrivez à
        notre newsletter.
      </p>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">1. Collecte des données</h2>
        <p className="text-gray-700">
          Lorsque vous entrez votre email pour vous inscrire, nous collectons :
        </p>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Votre adresse email – afin de vous envoyer nos communications.</li>
        </ul>
        <p className="text-gray-700">
          Aucune autre donnée personnelle n’est collectée sans votre consentement.
        </p>
      </section>

      <hr className="my-8 border-gray-200" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">2. Utilisation des données</h2>
        <p className="text-gray-700">Vos informations sont utilisées uniquement pour :</p>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Vous envoyer nos nouveautés, promotions et publicités concernant NUMA.</li>
          <li>Vous informer sur nos événements ou produits.</li>
        </ul>
        <p className="text-gray-700">
          Nous ne vendons ni ne louons vos informations à des tiers.
        </p>
      </section>

      <hr className="my-8 border-gray-200" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">3. Partage des données</h2>
        <p className="text-gray-700">
          Vos données peuvent être stockées dans un outil d’envoi d’emails sécurisé (ex. :
          Mailchimp, Brevo). Ces prestataires respectent les règles de confidentialité et
          protègent vos données.
        </p>
      </section>

      <hr className="my-8 border-gray-200" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">4. Durée de conservation</h2>
        <p className="text-gray-700">
          Vos données sont conservées tant que vous restez abonné à la newsletter. En cas de
          désinscription, vos données sont supprimées de notre base.
        </p>
      </section>

      <hr className="my-8 border-gray-200" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">5. Vos droits</h2>
        <p className="text-gray-700">Vous pouvez, à tout moment :</p>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Vous désabonner via le lien présent dans chaque email.</li>
          <li>
            Demander l’accès, la modification ou la suppression de vos données en nous écrivant à :
            <a href="mailto:numa7433@gmail.com" className="underline ml-1">numa7433@gmail.com</a>
          </li>
        </ul>
      </section>

      <hr className="my-8 border-gray-200" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">6. Sécurité</h2>
        <p className="text-gray-700">
          Nous mettons en place des mesures techniques et organisationnelles pour protéger vos
          données contre tout accès non autorisé.
        </p>
      </section>

      <hr className="my-8 border-gray-200" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">7. Mises à jour</h2>
        <p className="text-gray-700">
          Cette politique peut être modifiée pour rester conforme aux lois en vigueur. Toute
          modification importante sera communiquée via email.
        </p>
      </section>

      <hr className="my-8 border-gray-200" />

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">📧 Contact</h2>
        <p className="text-gray-700">
          Pour toute question sur cette politique, vous pouvez nous écrire à :
          <a href="mailto:numa7433@gmail.com" className="underline ml-1">numa7433@gmail.com</a>
        </p>
      </section>
    </main>
  );
}
