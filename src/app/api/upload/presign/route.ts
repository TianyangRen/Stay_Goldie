import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const schema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  petId: z.string().optional(),
});

function publicUrlForKey(key: string): string | undefined {
  const base = process.env.S3_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (!base) return undefined;
  return `${base}/${key}`;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bucket = process.env.S3_BUCKET;
  const endpoint = process.env.S3_ENDPOINT;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  const region = process.env.S3_REGION ?? "auto";

  if (!bucket || !endpoint || !accessKeyId || !secretAccessKey) {
    return NextResponse.json({ error: "Object storage not configured" }, { status: 503 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!parsed.data.contentType.startsWith("image/")) {
    return NextResponse.json({ error: "Only image uploads are allowed" }, { status: 400 });
  }

  let keyPrefix = `private/${session.user.id}`;

  if (parsed.data.petId) {
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const pet = await prisma.pet.findUnique({ where: { id: parsed.data.petId } });
    if (!pet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 });
    }
    keyPrefix = `pet-posts/${parsed.data.petId}`;
  }

  const client = new S3Client({
    region,
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true,
  });

  const safeName = parsed.data.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${keyPrefix}/${Date.now()}-${safeName}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: parsed.data.contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 60 * 5 });

  const publicUrl = publicUrlForKey(key);

  return NextResponse.json({
    uploadUrl,
    key,
    ...(publicUrl ? { publicUrl } : {}),
  });
}
