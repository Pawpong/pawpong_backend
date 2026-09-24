import { constants } from 'node:fs';
import { open } from 'node:fs/promises';
import mongoose from 'mongoose';
import {
    parseReviewProvisionInput,
    provisionReviewAccounts,
} from '../api/service/auth/review/provisioning/provision-review-accounts';

/** stdin 또는 현재 사용자 소유의 0600 일반 파일만 읽는다. 비밀값은 인자/로그로 받지 않는다. */
async function readInput(path?: string): Promise<unknown> {
    let text: string;
    if (path) {
        const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
        try {
            const info = await file.stat();
            if (
                !info.isFile() ||
                (info.mode & 0o777) !== 0o600 ||
                info.uid !== process.getuid?.() ||
                info.size > 16384
            ) {
                throw new Error('Unsafe credential input file');
            }
            text = await file.readFile('utf8');
        } finally {
            await file.close();
        }
    } else {
        if (process.stdin.isTTY) throw new Error('Credentials require protected file or piped stdin');
        const chunks: Buffer[] = [];
        let length = 0;
        for await (const chunk of process.stdin) {
            const buffer = Buffer.from(chunk as Uint8Array);
            length += buffer.length;
            if (length > 16384) throw new Error('Input too large');
            chunks.push(buffer);
        }
        text = Buffer.concat(chunks).toString('utf8');
    }
    return JSON.parse(text) as unknown;
}

async function main() {
    const args = process.argv.slice(2);
    const allowed = new Set(['--apply', '--input-file', '--expected-database']);
    const options = new Map<string, string | true>();
    for (let index = 0; index < args.length; index++) {
        const key = args[index];
        if (!allowed.has(key) || options.has(key)) throw new Error('Invalid command options');
        const value = key === '--apply' ? true : args[++index];
        if (!value || (typeof value === 'string' && value.startsWith('--'))) throw new Error('Missing command option');
        options.set(key, value);
    }
    const input = parseReviewProvisionInput(await readInput(options.get('--input-file') as string | undefined));
    if (!options.has('--apply')) {
        process.stdout.write(
            JSON.stringify({
                dryRun: true,
                databaseAccessed: false,
                wouldCreate: 2,
                roles: ['adopter', 'breeder'],
                breederApproved: true,
                breederHiddenFromExplore: true,
            }) + '\n',
        );
        return;
    }
    const expectedDatabase = options.get('--expected-database');
    const uri = process.env.MONGODB_URI;
    if (!uri || typeof expectedDatabase !== 'string' || !expectedDatabase.trim())
        throw new Error('Explicit target database and MONGODB_URI are required');
    const connection = await mongoose
        .createConnection(uri, { autoIndex: false, autoCreate: false, serverSelectionTimeoutMS: 5000 })
        .asPromise();
    try {
        if (connection.name !== expectedDatabase) throw new Error('Target database mismatch');
        const result = await provisionReviewAccounts(connection, input);
        process.stdout.write(JSON.stringify({ applied: true, ...result }) + '\n');
    } finally {
        await connection.close();
    }
}

void main().catch(() => {
    // 드라이버/JSON/검증 예외 원문에는 URI, 입력 비밀번호 또는 해시가 들어갈 수 있다.
    process.stderr.write(
        'Review provisioning failed. No credentials are printed; verify input, database target, conflicts, active terms, and transaction support.\n',
    );
    process.exitCode = 1;
});
