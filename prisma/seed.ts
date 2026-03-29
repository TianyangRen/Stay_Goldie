import { PrismaClient, Prisma, UserRole, BookingStatus, OrderStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const pool = new Pool({ connectionString: url });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  await prisma.processedStripeEvent.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.petPostMedia.deleteMany();
  await prisma.petPost.deleteMany();
  await prisma.petVaccineDocument.deleteMany();
  await prisma.petClinic.deleteMany();
  await prisma.petHealthProfile.deleteMany();
  await prisma.bookingPet.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.blogCategory.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  const passwordAdmin = await bcrypt.hash("Admin123!", 12);
  const passwordOwner = await bcrypt.hash("Owner123!", 12);

  const admin = await prisma.user.create({
    data: {
      email: "admin@staygoldie.local",
      name: "Stay Goldie Admin",
      role: UserRole.ADMIN,
      passwordHash: passwordAdmin,
    },
  });

  const owner = await prisma.user.create({
    data: {
      email: "owner@example.com",
      name: "Demo Owner",
      role: UserRole.OWNER,
      passwordHash: passwordOwner,
    },
  });

  const petMochi = await prisma.pet.create({
    data: {
      ownerId: owner.id,
      name: "Mochi",
      breed: "Corgi",
      sizeTier: "medium",
      avatarUrl:
        "https://images.unsplash.com/photo-1544568100-847a948585b9?q=80&w=800&auto=format&fit=crop",
    },
  });

  const petBao = await prisma.pet.create({
    data: {
      ownerId: owner.id,
      name: "Bao",
      breed: "Toy Poodle",
      sizeTier: "small",
      avatarUrl:
        "https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=800&auto=format&fit=crop",
    },
  });

  await prisma.petHealthProfile.create({
    data: {
      petId: petMochi.id,
      dietRestrictions: "Avoid chicken and high-lactose treats.",
      medications: "None",
      socialBehavior: "Friendly—needs ~10 minutes to warm up on first meetings.",
      emergencyContactName: "Emma",
      emergencyContactPhone: "+1 778-888-1234",
      vetName: "North Shore Vet",
      vetPhone: "+1 604-555-2200",
      preferredClinics: {
        create: [
          {
            clinicName: "Downtown Pet Hospital",
            phone: "+1 604-555-1314",
            address: "1028 Bay St, Vancouver",
          },
        ],
      },
      vaccineDocuments: {
        create: [
          {
            fileUrl: "https://example.com/private/vaccines/mochi.pdf",
            fileName: "mochi-vaccine-2026.pdf",
            mimeType: "application/pdf",
          },
        ],
      },
    },
  });

  const booking = await prisma.booking.create({
    data: {
      ownerId: owner.id,
      checkInDate: new Date("2026-04-03"),
      checkOutDate: new Date("2026-04-07"),
      nightlyRateCad: new Prisma.Decimal(78),
      estimatedTotalCad: new Prisma.Decimal(351),
      depositCad: new Prisma.Decimal(105.3),
      status: BookingStatus.CONFIRMED,
      pets: {
        create: [{ petId: petMochi.id }, { petId: petBao.id }],
      },
    },
  });

  const productFood = await prisma.product.create({
    data: {
      name: "Low-allergy kibble 2 kg",
      slug: "low-allergy-food-2kg",
      description: "Gentle recipe for pups with sensitive stomachs.",
      imageUrl:
        "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?q=80&w=900&auto=format&fit=crop",
      basePriceCad: new Prisma.Decimal(42),
      inventory: { create: { stock: 24, lowStockLevel: 5 } },
    },
  });

  await prisma.product.create({
    data: {
      name: "Calming slow-feed bowl",
      slug: "slow-feed-bowl",
      description: "Slows mealtime to support calmer eating and digestion.",
      imageUrl:
        "https://images.unsplash.com/photo-1601758064224-df6b7f0f0ec8?q=80&w=900&auto=format&fit=crop",
      basePriceCad: new Prisma.Decimal(28),
      inventory: { create: { stock: 16, lowStockLevel: 5 } },
    },
  });

  await prisma.order.create({
    data: {
      ownerId: owner.id,
      status: OrderStatus.PAID,
      subtotalCad: new Prisma.Decimal(42),
      totalCad: new Prisma.Decimal(42),
      items: {
        create: [
          {
            productId: productFood.id,
            quantity: 1,
            unitPriceCad: new Prisma.Decimal(42),
          },
        ],
      },
    },
  });

  const post1 = await prisma.petPost.create({
    data: {
      petId: petMochi.id,
      caption: "Chased the ball with a new buddy in the yard—best day!",
      media: {
        create: [
          {
            mediaUrl:
              "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=900&auto=format&fit=crop",
            altText: "Mochi playing",
          },
        ],
      },
    },
  });

  await prisma.petPost.create({
    data: {
      petId: petBao.id,
      caption: "Nap time with my favourite blanket.",
      media: {
        create: [
          {
            mediaUrl:
              "https://images.unsplash.com/photo-1517423568366-8b83523034fd?q=80&w=900&auto=format&fit=crop",
            altText: "Bao napping",
          },
        ],
      },
    },
  });

  const categoryPrep = await prisma.blogCategory.create({
    data: { name: "Boarding prep", slug: "boarding-prep" },
  });

  const categoryBehavior = await prisma.blogCategory.create({
    data: { name: "Training & behaviour", slug: "behavior" },
  });

  await prisma.blogPost.createMany({
    data: [
      {
        authorId: admin.id,
        categoryId: categoryPrep.id,
        title: "7-step boarding prep checklist for dogs",
        slug: "boarding-prep-checklist",
        excerpt: "Routine, meals, and mindset tweaks for a smoother stay away from home.",
        content:
          "Placeholder body copy. Swap in MDX or a CMS later, then add structured data and related posts.",
        coverImage:
          "https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=1000&auto=format&fit=crop",
        publishedAt: new Date("2026-03-10"),
      },
      {
        authorId: admin.id,
        categoryId: categoryBehavior.id,
        title: "Easing separation anxiety—for pups and humans",
        slug: "separation-anxiety-tips",
        excerpt: "Simple daily drills that lower stress before the first boarding night.",
        content:
          "Placeholder body copy. Add progressive training steps and short case notes for long-tail SEO.",
        coverImage:
          "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?q=80&w=1000&auto=format&fit=crop",
        publishedAt: new Date("2026-03-12"),
      },
    ],
  });

  console.log("Seed complete:", { admin: admin.email, owner: owner.email, booking: booking.id, post: post1.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
