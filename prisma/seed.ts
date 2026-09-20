import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sizes = ["XS", "S", "M", "L", "XL"];

const products = [
  {
    slug: "manteau-arche",
    name: "Manteau Arche",
    category: "Manteaux",
    description:
      "Manteau long en laine mÃ©langÃ©e, Ã©paules structurÃ©es et doublure satin. Coupe droite pensÃ©e pour durer plusieurs saisons.",
    priceCents: 39000,
    lookNumber: 1,
    image: "https://picsum.photos/seed/nuee-arche/900/1150",
    colors: "Ink,Bone",
  },
  {
    slug: "veste-carre",
    name: "Veste CarrÃ©",
    category: "Vestes",
    description:
      "Veste courte en toile de coton dense, col officier et fermeture Ã  boutons cornÃ©s. Silhouette carrÃ©e, ni cintrÃ©e ni ample.",
    priceCents: 24500,
    lookNumber: 2,
    image: "https://picsum.photos/seed/nuee-carre/900/1150",
    colors: "Brick,Ink",
  },
  {
    slug: "pull-lisiere",
    name: "Pull LisiÃ¨re",
    category: "Pulls",
    description:
      "Maille cÃ´telÃ©e en laine mÃ©rinos, finitions bord-cÃ´te apparentes. Col rond bas, tombe lÃ©gÃ¨rement sous la ceinture.",
    priceCents: 15500,
    lookNumber: 3,
    image: "https://picsum.photos/seed/nuee-lisiere/900/1150",
    colors: "Bone,Muted",
  },
  {
    slug: "pantalon-plomb",
    name: "Pantalon Plomb",
    category: "Pantalons",
    description:
      "Pantalon droit en gabardine lourde, pinces simples et ourlet brut. Taille haute, une seule couture visible au dos.",
    priceCents: 19000,
    lookNumber: 4,
    image: "https://picsum.photos/seed/nuee-plomb/900/1150",
    colors: "Ink,Bone",
  },
  {
    slug: "chemise-verso",
    name: "Chemise Verso",
    category: "Chemises",
    description:
      "Chemise en popeline de coton Ã©gyptien, patte de boutonnage asymÃ©trique. Se porte devant comme derriÃ¨re.",
    priceCents: 14500,
    lookNumber: 5,
    image: "https://picsum.photos/seed/nuee-verso/900/1150",
    colors: "Bone,Brick",
  },
  {
    slug: "robe-monolithe",
    name: "Robe Monolithe",
    category: "Robes",
    description:
      "Robe longue en crÃªpe mat, une seule couture latÃ©rale. Tombe droite du buste Ã  l'ourlet, sans pince.",
    priceCents: 29500,
    lookNumber: 6,
    image: "https://picsum.photos/seed/nuee-monolithe/900/1150",
    colors: "Ink,Muted",
  },
  {
    slug: "echarpe-corde",
    name: "Ã‰charpe Corde",
    category: "Accessoires",
    description:
      "Ã‰charpe tricotÃ©e en grosse maille torsadÃ©e, laine brute non traitÃ©e. FrangÃ©e aux deux extrÃ©mitÃ©s.",
    priceCents: 8900,
    lookNumber: 7,
    image: "https://picsum.photos/seed/nuee-corde/900/1150",
    colors: "Muted,Bone",
  },
  {
    slug: "trench-versant",
    name: "Trench Versant",
    category: "Manteaux",
    description:
      "Trench en coton cirÃ© dÃ©perlant, ceinture amovible et martingale simplifiÃ©e. Longueur mi-mollet.",
    priceCents: 42500,
    lookNumber: 8,
    image: "https://picsum.photos/seed/nuee-versant/900/1150",
    colors: "Brick,Ink",
  },
].map((p) => ({
  ...p,
  // Deux vues supplÃ©mentaires (dÃ©tail, portÃ©) pour la galerie de la fiche
  // produit â€” dÃ©rivÃ©es du mÃªme slug pour rester stables entre les seeds.
  images: [
    `https://picsum.photos/seed/${p.slug}-detail/900/1150`,
    `https://picsum.photos/seed/${p.slug}-porte/900/1150`,
  ].join(","),
}));

async function main() {
  console.log("Nettoyage...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.stockAlert.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.coupon.deleteMany();

  await prisma.coupon.createMany({
    data: [
      { code: "BIENVENUE10", percentOff: 10 },
      { code: "NUEE20", percentOff: 20, maxUses: 50 },
      { code: "PORT5", amountOff: 500 },
    ],
  });

  const sampleReviews = [
    { authorName: "Camille D.", rating: 5, comment: "La matiÃ¨re est bien plus belle qu'en photo, coupe impeccable." },
    { authorName: "Yanis B.", rating: 4, comment: "TrÃ¨s belle piÃ¨ce, taille un peu grand, prendre une taille en dessous." },
    { authorName: "Sarah L.", rating: 5, comment: "Exactement ce que je cherchais, la finition est soignÃ©e." },
    { authorName: "Hugo M.", rating: 3, comment: "Joli mais le dÃ©lai de livraison a Ã©tÃ© un peu long." },
  ];

  for (const p of products) {
    const created = await prisma.product.create({ data: p });
    for (const size of sizes) {
      // Une taille sur six est volontairement en rupture, pour pouvoir
      // tester l'alerte de rÃ©assort.
      const stock = Math.random() < 0.15 ? 0 : Math.floor(Math.random() * 15) + 3;
      await prisma.variant.create({
        data: { size, stock, productId: created.id },
      });
    }

    const reviewCount = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < reviewCount; i++) {
      const r = sampleReviews[(i + created.lookNumber) % sampleReviews.length];
      await prisma.review.create({
        data: { ...r, productId: created.id, verified: true },
      });
    }

    console.log(`CrÃ©Ã©: ${created.name}`);
  }

  console.log("TerminÃ©.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


