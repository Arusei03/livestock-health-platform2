import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { fetchAuthSession } from "aws-amplify/auth";

export const uploadAnimalImage = async (file: File) => {
  const session = await fetchAuthSession();

  if (!session.credentials || !session.identityId) {
    throw new Error("AWS credentials or identity ID unavailable.");
  }

  const region = import.meta.env.VITE_AWS_REGION;
  const bucket = import.meta.env.VITE_S3_BUCKET_NAME;

  if (!region || !bucket) {
    throw new Error("AWS region or S3 bucket configuration is missing.");
  }

  const s3 = new S3Client({
    region,
    credentials: session.credentials,
  });

  try {
    const extension = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${extension}`;
    const key = `animals/${session.identityId}/${fileName}`;

    const fileBuffer = new Uint8Array(await file.arrayBuffer());

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: file.type,
      })
    );

    return key;
  } finally {
    s3.destroy();
  }
};