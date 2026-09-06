'use strict';
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { randomBytes, createCipheriv, createHash } = require('node:crypto');
const { Transform } = require('node:stream');
const { pipeline } = require('node:stream/promises');
const { S3Client, GetBucketAclCommand, GetBucketPolicyCommand, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');

/** Fail closed: prod 전용 URI/비공개 버킷/별도 키가 없으면 덤프 자체를 시작하지 않는다. */
function configuration(env) {
    if (env.NODE_ENV !== 'production' || env.PROD_BACKUP_ENABLED !== 'true') throw new Error('BACKUP_DISABLED');
    const uri = new URL(env.PROD_BACKUP_MONGODB_URI || '');
    if (!['mongodb:', 'mongodb+srv:'].includes(uri.protocol) || uri.pathname !== '/prod') throw new Error('PROD_DATABASE_REQUIRED');
    const bucket = env.PROD_BACKUP_S3_BUCKET;
    if (!bucket || bucket === env.SMILESERV_S3_BUCKET) throw new Error('SEPARATE_PRIVATE_BUCKET_REQUIRED');
    const key = Buffer.from(env.PROD_BACKUP_ENCRYPTION_KEY || '', 'base64');
    if (key.length !== 32 || !/^[A-Za-z0-9_-]{1,64}$/.test(env.PROD_BACKUP_KEY_ID || '')) throw new Error('BACKUP_KEY_REQUIRED');
    const endpoint = new URL(env.PROD_BACKUP_S3_ENDPOINT || '');
    if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password) throw new Error('HTTPS_ENDPOINT_REQUIRED');
    if (!env.PROD_BACKUP_S3_ACCESS_KEY || !env.PROD_BACKUP_S3_SECRET_KEY) throw new Error('BACKUP_STORAGE_CREDENTIALS_REQUIRED');
    return { uri: uri.toString(), bucket, key, keyId: env.PROD_BACKUP_KEY_ID, endpoint: endpoint.toString(),
        credentials: { accessKeyId: env.PROD_BACKUP_S3_ACCESS_KEY, secretAccessKey: env.PROD_BACKUP_S3_SECRET_KEY },
        region: env.PROD_BACKUP_S3_REGION || 'kr-standard' };
}

/** 공개 ACL 또는 공개 Allow 정책이 있거나 정책 검증을 지원하지 않으면 업로드를 거부한다. */
async function assertPrivate(client, bucket, signal) {
    const acl = await client.send(new GetBucketAclCommand({ Bucket: bucket }), { abortSignal: signal });
    if ((acl.Grants || []).some(g => g.Grantee?.URI)) throw new Error('PUBLIC_BUCKET');
    try {
        const response = await client.send(new GetBucketPolicyCommand({ Bucket: bucket }), { abortSignal: signal });
        const policy = JSON.parse(response.Policy || '{}');
        const statements = Array.isArray(policy.Statement) ? policy.Statement : [policy.Statement].filter(Boolean);
        if (statements.some(s => s.Effect === 'Allow' && (s.NotPrincipal || JSON.stringify(s.Principal).includes('*')))) {
            throw new Error('PUBLIC_BUCKET_POLICY');
        }
    } catch (error) {
        if (error.name !== 'NoSuchBucketPolicy') throw error;
    }
}

/** 주어진 스트림은 gzip archive다. 평문 파일을 만들지 않고 AES-256-GCM으로 암호화한다. */
async function encryptArchive(input, destination, key, signal, maxBytes = 2 * 1024 ** 3) {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const hash = createHash('sha256');
    let bytes = 0;
    const meter = new Transform({ transform(chunk, _encoding, callback) {
        bytes += chunk.length;
        if (bytes > maxBytes) return callback(new Error('BACKUP_SIZE_LIMIT'));
        hash.update(chunk); callback(null, chunk);
    } });
    await pipeline(input, cipher, meter, fs.createWriteStream(destination, { mode: 0o600, flags: 'wx' }), { signal });
    if (bytes === 0) throw new Error('EMPTY_BACKUP');
    return { bytes, sha256: hash.digest('hex'), cipher: 'aes-256-gcm', iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64') };
}

/** 자격 증명은 stdin 전용 설정으로 전달한다. stderr에는 사용자 데이터가 있을 수 있어 버린다. */
async function dumpEncrypted(config, destination, signal) {
    const child = spawn('mongodump', ['--config=/dev/stdin', '--db=prod', '--archive', '--gzip', '--numParallelCollections=1'], {
        stdio: ['pipe', 'pipe', 'ignore'], signal,
        env: { PATH: process.env.PATH, HOME: os.tmpdir() },
    });
    const completion = new Promise((resolve, reject) => {
        child.on('error', () => reject(new Error('DUMP_START_FAILED')));
        child.on('close', code => code === 0 ? resolve() : reject(new Error('DUMP_FAILED')));
    });
    child.stdin.on('error', () => {});
    child.stdin.end(JSON.stringify({ uri: config.uri }));
    try {
        const [result] = await Promise.all([encryptArchive(child.stdout, destination, config.key, signal), completion]);
        return result;
    } finally {
        if (child.exitCode === null) child.kill('SIGKILL');
        await completion.catch(() => {});
    }
}

async function runBackup(env, job, dependencies = {}) {
    const config = configuration(env);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60 * 60 * 1000);
    const client = dependencies.client || new S3Client({ endpoint: config.endpoint, region: config.region,
        credentials: config.credentials, forcePathStyle: true, maxAttempts: 2 });
    let directory;
    const startedAt = new Date().toISOString();
    try {
        await assertPrivate(client, config.bucket, controller.signal);
        directory = await fsp.mkdtemp(path.join(os.tmpdir(), 'pawpong-prod-backup-'));
        await fsp.chmod(directory, 0o700);
        const archive = path.join(directory, 'archive.enc');
        const encrypted = await (dependencies.dump || dumpEncrypted)(config, archive, controller.signal);
        const prefix = `mongodb/prod/${startedAt.slice(0, 10)}/${randomBytes(16).toString('hex')}`;
        const key = `${prefix}/archive.gz.enc`;
        await client.send(new PutObjectCommand({ Bucket: config.bucket, Key: key,
            Body: fs.createReadStream(archive), ContentLength: encrypted.bytes,
            ContentType: 'application/octet-stream', ACL: 'private',
            Metadata: { sha256: encrypted.sha256, 'key-id': config.keyId },
        }), { abortSignal: controller.signal });
        const uploaded = await client.send(new HeadObjectCommand({ Bucket: config.bucket, Key: key }), { abortSignal: controller.signal });
        if (uploaded.ContentLength !== encrypted.bytes || uploaded.Metadata?.sha256 !== encrypted.sha256) throw new Error('UPLOAD_CHECK_FAILED');
        const manifest = { formatVersion: 1, database: 'prod', startedAt, completedAt: new Date().toISOString(),
            ...encrypted, keyId: config.keyId, objectKey: key,
            trigger: job.trigger === 'scheduled' ? 'scheduled' : 'manual',
            requestedBy: job.requestedBy || 'scheduler',
            consistency: 'Live logical dump; not a point-in-time snapshot.', restoreVerified: false };
        await client.send(new PutObjectCommand({ Bucket: config.bucket, Key: `${prefix}/manifest.json`,
            Body: JSON.stringify(manifest), ContentType: 'application/json', ACL: 'private',
        }), { abortSignal: controller.signal });
        // 큐/API에는 IV/tag/자격 증명/직접 다운로드 URL을 반환하지 않는다.
        return { database: 'prod', objectKey: key, bytes: encrypted.bytes, sha256: encrypted.sha256,
            keyId: config.keyId, startedAt, completedAt: manifest.completedAt, restoreVerified: false };
    } catch {
        // SDK 오류에는 endpoint/서명, mongodump 오류에는 URI가 포함될 수 있다.
        throw new Error('BACKUP_FAILED');
    } finally {
        clearTimeout(timer);
        controller.abort();
        client.destroy?.();
        if (directory) await fsp.rm(directory, { recursive: true, force: true });
    }
}
module.exports = { configuration, assertPrivate, encryptArchive, runBackup };
