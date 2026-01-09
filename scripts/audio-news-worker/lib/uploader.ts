import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

const S3 = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID || '',
        secretAccessKey: R2_SECRET_ACCESS_KEY || '',
    },
});

export async function uploadFile(filePath: string, folder: string = 'daily-briefs'): Promise<string> {
    const fileName = path.basename(filePath);
    const fileStream = fs.createReadStream(filePath);
    const ext = path.extname(filePath).toLowerCase();

    let contentType = 'application/octet-stream';
    if (ext === '.mp3') contentType = 'audio/mpeg';
    else if (ext === '.mp4') contentType = 'video/mp4';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';

    console.log(`☁️ Uploading ${fileName} (${contentType}) to R2...`);

    try {
        await S3.send(new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: `${folder}/${fileName}`,
            Body: fileStream,
            ContentType: contentType,
            ACL: 'public-read',
        }));

        const publicUrl = process.env.R2_PUBLIC_DOMAIN
            ? `${process.env.R2_PUBLIC_DOMAIN}/${folder}/${fileName}`
            : `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${folder}/${fileName}`;

        console.log('✅ Upload successful:', publicUrl);
        return publicUrl;
    } catch (err) {
        console.error('Error uploading to R2:', err);
        throw err;
    }
}
