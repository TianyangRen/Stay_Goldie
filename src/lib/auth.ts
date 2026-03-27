import { auth } from "@/auth";

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return session;
}

export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
