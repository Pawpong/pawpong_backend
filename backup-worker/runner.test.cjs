const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { Readable } = require('node:stream');
const { createDecipheriv } = require('node:crypto');
const { configuration, assertPrivate, encryptArchive, runBackup } = require('./runner.cjs');
const env = { NODE_ENV: 'production', PROD_BACKUP_ENABLED: 'true', PROD_BACKUP_MONGODB_URI: 'mongodb://localhost/prod',
    PROD_BACKUP_S3_BUCKET: 'private-backups', SMILESERV_S3_BUCKET: 'public-images',
    PROD_BACKUP_ENCRYPTION_KEY: Buffer.alloc(32, 7).toString('base64'), PROD_BACKUP_KEY_ID: 'test-key',
    PROD_BACKUP_S3_ENDPOINT: 'https://storage.example.invalid', PROD_BACKUP_S3_ACCESS_KEY: 'fake', PROD_BACKUP_S3_SECRET_KEY: 'fake' };

test('prod only, separate bucket, encryption key and explicit enablement required', () => {
    assert.equal(configuration(env).bucket, 'private-backups');
    for (const patch of [{ NODE_ENV: 'development' }, { PROD_BACKUP_ENABLED: 'false' },
        { PROD_BACKUP_MONGODB_URI: 'mongodb://localhost/dev' }, { PROD_BACKUP_MONGODB_URI: 'mongodb://localhost/' },
        { PROD_BACKUP_S3_BUCKET: 'public-images' }, { PROD_BACKUP_ENCRYPTION_KEY: '' },
        { PROD_BACKUP_S3_ENDPOINT: 'http://storage.example.invalid' }]) assert.throws(() => configuration({ ...env, ...patch }));
});
test('public ACL and wildcard policy rejected', async () => {
    await assert.rejects(assertPrivate({ send: async () => ({ Grants: [{ Grantee: { URI: 'AllUsers' } }] }) }, 'bucket'));
    await assert.rejects(assertPrivate({ send: async command => command.constructor.name === 'GetBucketAclCommand'
        ? { Grants: [] } : { Policy: JSON.stringify({ Statement: [{ Effect: 'Allow', Principal: '*' }] }) } }, 'bucket'));
});
test('archive encrypts, authenticates, detects tampering and enforces size bound', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'backup-test-'));
    try {
        const key = configuration(env).key;
        const source = Buffer.from('test archive, not production data');
        const file = path.join(dir, 'archive');
        const result = await encryptArchive(Readable.from(source), file, key, undefined);
        const encrypted = await fs.readFile(file);
        assert.notDeepEqual(encrypted, source);
        const decrypt = bytes => {
            const cipher = createDecipheriv('aes-256-gcm', key, Buffer.from(result.iv, 'base64'));
            cipher.setAuthTag(Buffer.from(result.tag, 'base64'));
            return Buffer.concat([cipher.update(bytes), cipher.final()]);
        };
        assert.deepEqual(decrypt(encrypted), source);
        encrypted[0] ^= 1;
        assert.throws(() => decrypt(encrypted));
        await assert.rejects(encryptArchive(Readable.from(source), path.join(dir, 'limited'), key, undefined, 2));
    } finally { await fs.rm(dir, { recursive: true, force: true }); }
});
test('uploads ciphertext and private manifest, returns only safe metadata', async () => {
    const commands = [];
    let uploaded;
    const client = { destroy() {}, async send(command) {
        commands.push(command);
        switch (command.constructor.name) {
            case 'GetBucketAclCommand': return { Grants: [] };
            case 'GetBucketPolicyCommand': throw Object.assign(new Error(), { name: 'NoSuchBucketPolicy' });
            case 'PutObjectCommand':
                assert.equal(command.input.ACL, 'private');
                if (command.input.ContentLength) {
                    uploaded = command.input;
                    for await (const _chunk of uploaded.Body) { /* consume file like SDK */ }
                }
                return {};
            case 'HeadObjectCommand': return { ContentLength: uploaded.ContentLength, Metadata: uploaded.Metadata };
        }
    } };
    const result = await runBackup(env, { trigger: 'manual', requestedBy: 'admin-test' }, {
        client, dump: (config, file, signal) => encryptArchive(Readable.from('fixture'), file, config.key, signal),
    });
    assert.equal(result.database, 'prod');
    assert.equal(result.restoreVerified, false);
    assert.equal(result.iv, undefined);
    assert.equal(commands.filter(c => c.constructor.name === 'PutObjectCommand').length, 2);
});
test('storage failure occurs before dump and exposes no raw exception', async () => {
    let dumped = false;
    await assert.rejects(runBackup(env, {}, {
        client: { send: async () => { throw new Error('sensitive-provider-error'); } },
        dump: async () => { dumped = true; },
    }), /^Error: BACKUP_FAILED$/);
    assert.equal(dumped, false);
});
