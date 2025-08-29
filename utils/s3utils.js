const { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { v4: uuid } = require("uuid");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.BUCKET;

const uploadToS3 = async (file, userId, name) => {
  const key = `${userId}/${name}`;
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  try {
    await s3.send(command);
    return { key };
  } catch (error) {
    console.error("Upload error:", error.message);
    return { error: "Failed to upload image to S3" };
  }
};

const uploadInvoice = async (fileBuffer, userId, key, contentType) => {
  const fullKey = `${userId}/${key}`;
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: fullKey,
    Body: fileBuffer,
    ContentType: contentType,
  });

  try {
    await s3.send(command);
    const fileUrl = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fullKey}`;
    return { key: fullKey, url: fileUrl };
  } catch (error) {
    console.error("Upload error:", error.message);
    return { error: "Failed to upload invoice to S3" };
  }
};

const getImageKeysByUser = async (userId) => {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET,
    Prefix: userId, 
  });

  try {
    const { Contents = [] } = await s3.send(command);
    return Contents.sort(
      (a, b) => new Date(b.LastModified) - new Date(a.LastModified)
    ).map((image) => image.Key);
  } catch (error) {
    console.error("ListObjects error:", error.message);
    return { error: "Failed to retrieve image keys" };
  }
};

const getUserPresignedUrls = async (userId, expiresIn = 900) => {
  try {
    const imageKeys = await getImageKeysByUser(userId);

    const presignedUrls = await Promise.all(
      imageKeys.map(async (key) => {
        const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
        return getSignedUrl(s3, command, { expiresIn });
      })
    );
    return { presignedUrls };
  } catch (error) {
    console.error("Presigned URL error:", error.message);
    return { error: "Failed to generate presigned URLs" };
  }
};

module.exports = { s3, uploadToS3, getUserPresignedUrls,uploadInvoice };