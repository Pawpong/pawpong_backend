// Explicit release operation: back up both banner collections before applying new assets.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { parseEnv } = require('node:util');
const { createHash } = require('node:crypto');
const { MongoClient, ObjectId, BSON } = require('mongodb');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

async function main() {
    const [envDir, sourceDir, mode] = process.argv.slice(2);
    if (!envDir || !sourceDir || !['check', 'apply'].includes(mode)) throw Error('Usage: env-directory image-directory check|apply');
    const specs = [
        ['main', '/explore', '포퐁에서 반려동물을 만나요'],
        ['dog', '/explore?category=dog', '강아지 만나러 가기'],
        ['cat', '/explore?category=cat', '고양이 만나러 가기'],
        ['geko', '/explore?category=lizard', '도마뱀 만나러 가기'],
    ];
    const files = specs.map(([type]) => `type=${type}, size=md.png`);
    files.push(fs.readdirSync(sourceDir).find((name) => name.normalize('NFC') === '가입완료.png'));
    const images = files.map((file) => {
        const body = fs.readFileSync(path.join(sourceDir, file));
        if (body.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw Error('Expected PNG');
        return { body, file, hash: createHash('sha256').update(body).digest('hex') };
    });
    const root = path.join(os.homedir(), 'pawpong-backups');
    fs.mkdirSync(root, { recursive: true, mode: 0o700 });
    const backup = fs.mkdtempSync(path.join(root, 'banners-20260905-'));
    const connections = [];
    try {
        for (const dbName of ['dev', 'prod']) {
            const env = parseEnv(fs.readFileSync(path.join(envDir, dbName === 'dev' ? '.env' : '.env.production'), 'utf8'));
            if (new URL(env.MONGODB_URI).pathname !== `/${dbName}`) throw Error('Database mismatch');
            const client = await new MongoClient(env.MONGODB_URI).connect();
            const db = client.db(dbName);
            connections.push({ client, db, env, dbName });
            const rows = await db.collection('banners').find({}).toArray();
            const auth = await db.collection('auth_banners').find({}).toArray();
            fs.writeFileSync(path.join(backup, `${dbName}.json`), BSON.EJSON.stringify({ banners: rows, auth_banners: auth }), { mode: 0o600 });
        }
        console.log(JSON.stringify({ backup, mode, images: images.map(({file, hash}) => ({file, hash})) }));
        if (mode !== 'apply') return;
        for (const {client, db, env, dbName} of connections) {
            const s3 = new S3Client({endpoint: env.SMILESERV_S3_ENDPOINT, region: 'default', forcePathStyle: true,
                credentials: {accessKeyId: env.SMILESERV_S3_ACCESS_KEY, secretAccessKey: env.SMILESERV_S3_SECRET_KEY}});
            const keys = [];
            for (const [i, image] of images.entries()) {
                const key = `banners/release-20260905-${i === 4 ? 'signup-complete' : specs[i][0]}-${image.hash.slice(0,12)}.png`;
                await s3.send(new PutObjectCommand({Bucket: env.SMILESERV_S3_BUCKET, Key:key, Body:image.body,
                    ContentType:'image/png', CacheControl:'public, max-age=31536000, immutable'}));
                const url = `${env.SMILESERV_S3_ENDPOINT.replace(/\/$/,'')}/${env.SMILESERV_S3_BUCKET}/${key}`;
                const response = await fetch(url);
                const remote = Buffer.from(await response.arrayBuffer());
                if (!response.ok || createHash('sha256').update(remote).digest('hex') !== image.hash) throw Error('Uploaded asset verification failed');
                keys.push(key);
            }
            const ids = [dbName === 'dev' ? '691ddd82bc223c9e751c54cd' : '697ef9e0f56c3e95707fa74b', '691ddd82bc223c9e751c54ce', '6943bcf51017a51c578f9e07', '69aab0000000000000000004'];
            const session = client.startSession();
            try {
                await session.withTransaction(async () => {
                    for (const [i, [,linkUrl,title]] of specs.entries()) {
                        const result = await db.collection('banners').updateOne({_id: new ObjectId(ids[i])}, {
                            $set: {desktopImageFileName:keys[i], mobileImageFileName:keys[i], imageFileName:keys[i],
                                linkType:'internal', linkUrl, title, order:i+1, isActive:true, targetAudience:[], updatedAt:new Date()},
                            $setOnInsert:{createdAt:new Date(), __v:0},
                        }, {upsert:i === 3, session});
                        if (!result.matchedCount && !result.upsertedCount) throw Error('Expected banner missing');
                    }
                });
            } finally { await session.endSession(); s3.destroy(); }
            // Signup-completion art is uploaded but must not replace the login banner.
            console.log(JSON.stringify({db:dbName, updated:4, keys, signupCompletionKey:keys[4]}));
        }
    } finally { await Promise.all(connections.map(({client}) => client.close())); }
}
main().catch(() => { console.error('Banner refresh failed; inspect local backups before retrying. Credentials suppressed.'); process.exitCode=1; });
