/** 운영 DB를 읽기 전용으로 백업한다. URI는 명령행/로그/백업에 남기지 않는다. */
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { parseEnv } = require('node:util');
const { spawn } = require('node:child_process');
const { createHash } = require('node:crypto');

async function main() {
    const env = parseEnv(fs.readFileSync(path.join(__dirname, '../.env.production'), 'utf8'));
    const uri = env.MONGODB_URI;
    if (!uri || new URL(uri).pathname !== '/prod') throw new Error('Expected production database prod');
    const root = path.join(os.homedir(), 'pawpong-backups');
    fs.mkdirSync(root, { recursive: true, mode: 0o700 });
    const directory = fs.mkdtempSync(path.join(root, `prod-${new Date().toISOString().replace(/[:.]/g, '-')}-`));
    fs.chmodSync(directory, 0o700);
    const archive = path.join(directory, 'prod.archive.gz');
    const startedAt = new Date().toISOString();
    // stdin config avoids exposing credentials in process arguments or on disk.
    const result = await new Promise((resolve) => {
        const child = spawn('mongodump', ['--config=/dev/stdin', '--db=prod', `--archive=${archive}`, '--gzip'], {
            stdio: ['pipe', 'ignore', 'pipe'],
        });
        let log = '';
        child.stderr.on('data', (chunk) => { log += chunk.toString(); });
        child.on('error', () => resolve({ code: -1, log: '' }));
        child.on('close', (code) => resolve({ code, log }));
        child.stdin.end(JSON.stringify({ uri }));
    });
    if (fs.existsSync(archive)) fs.chmodSync(archive, 0o600);
    if (result.code !== 0) throw new Error(`mongodump failed (${result.code}); incomplete backup: ${directory}`);
    const hash = createHash('sha256');
    for await (const chunk of fs.createReadStream(archive)) hash.update(chunk);
    const manifest = {
        database: 'prod', startedAt, completedAt: new Date().toISOString(),
        archive: 'prod.archive.gz', bytes: fs.statSync(archive).size, sha256: hash.digest('hex'),
        consistency: 'Live logical dump, not a point-in-time snapshot. Concurrent writes may span collections.',
        collections: result.log.split('\n').filter((line) => /done dumping prod\./.test(line)).map((line) => line.replace(/^.*done dumping /, '')),
    };
    fs.writeFileSync(path.join(directory, 'manifest.json'), JSON.stringify(manifest, null, 2), { mode: 0o600 });
    console.log(JSON.stringify({ directory, ...manifest }, null, 2));
}
main().catch((error) => { console.error(error.message.startsWith('mongodump') ? error.message : 'Backup configuration failed'); process.exitCode = 1; });
