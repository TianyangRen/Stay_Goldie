"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { springSnappy } from "@/lib/motion";

export type AccountPetCard = {
  id: string;
  name: string;
  breedLine: string;
  avatarUrl: string | null;
};

export function AccountPetsGrid({ pets }: { pets: AccountPetCard[] }) {
  const rd = useReducedMotion() ?? false;
  return (
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {pets.map((pet, index) => (
        <motion.article
          key={pet.id}
          initial={rd ? false : { opacity: 0, y: 20 }}
          whileInView={rd ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ ...springSnappy, delay: rd ? 0 : index * 0.07 }}
          whileHover={rd ? undefined : { y: -3 }}
          whileTap={rd ? undefined : { scale: 0.98 }}
          className="card-elevated rounded-3xl p-4"
        >
          <div className="relative h-48 overflow-hidden rounded-2xl">
            {pet.avatarUrl ? (
              <Image
                src={pet.avatarUrl}
                alt={pet.name}
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-[var(--sg-surface-alt)] text-xs text-zinc-500">
                无头像
              </div>
            )}
          </div>
          <h2 className="mt-3 font-semibold">{pet.name}</h2>
          <p className="text-sm text-zinc-600">{pet.breedLine}</p>
          <Link
            href={`/account/pets/${pet.id}/edit`}
            className="mt-4 inline-block text-sm font-medium text-[var(--sg-green)] underline underline-offset-4"
          >
            编辑档案
          </Link>
        </motion.article>
      ))}
    </div>
  );
}
