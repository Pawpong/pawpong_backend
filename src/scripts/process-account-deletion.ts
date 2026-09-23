import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { createConnection } from 'mongoose';
import { WinstonModule } from 'nest-winston';
import { DatabaseModule } from '../common/database/database.module';
import { AccountDeletionModule } from '../api/service/account-deletion/account-deletion.module';
import { AccountDeletionRepository } from '../api/service/account-deletion/repository/account-deletion.repository';
import { ProcessAccountDeletionUseCase } from '../api/service/account-deletion/application/use-cases/process-account-deletion.use-case';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        WinstonModule.forRoot({ silent: true, transports: [] }),
        EventEmitterModule.forRoot(),
        DatabaseModule,
        AccountDeletionModule,
    ],
})
class AccountDeletionOperationsModule {}

export function parseDeletionOperationArgs(args: string[]) {
    let requestId: string | undefined;
    let apply = false;
    let approveFile: string | undefined;
    let listFiles = false;
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--job':
                requestId = args[++i];
                break;
            case '--apply':
                apply = true;
                break;
            case '--approve-file':
                approveFile = args[++i];
                break;
            case '--list-review-files':
                listFiles = true;
                break;
            default:
                throw new Error(
                    '지원하지 않는 옵션입니다. --job <UUID> [--list-review-files] [--apply [--approve-file <key>]]',
                );
        }
    }
    if (!requestId || !/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(requestId))
        throw new Error('반드시 하나의 --job UUID를 지정해야 합니다.');
    if (args.includes('--approve-file') && !approveFile) throw new Error('--approve-file 값이 필요합니다.');
    if (approveFile && !apply) throw new Error('파일 승인은 --apply를 명시해야 합니다.');
    if (args.filter((arg) => arg === '--job').length !== 1) throw new Error('한 번에 하나의 작업만 지정하세요.');
    return { requestId, apply, approveFile, listFiles };
}

async function main() {
    const options = parseDeletionOperationArgs(process.argv.slice(2));
    // 자동 worker/다른 account job은 이 CLI에서 절대 실행하지 않는다.
    process.env.ACCOUNT_DELETION_WORKER_DISABLED = 'true';
    if (!options.apply) {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI 환경변수가 필요합니다.');
        const connection = await createConnection(uri, { serverSelectionTimeoutMS: 3000 }).asPromise();
        try {
            const jobs = connection.db!.collection('account_deletion_jobs');
            const files = connection.db!.collection('account_deletion_files');
            const job = await jobs.findOne(
                { requestId: options.requestId },
                { projection: { _id: 0, requestId: 1, status: 1, dataErased: 1, providerCompleted: 1 } },
            );
            if (!job) throw new Error('작업을 찾을 수 없습니다.');
            console.log(
                JSON.stringify(
                    {
                        dryRun: true,
                        ...job,
                        pendingFiles: await files.countDocuments({ requestId: options.requestId, deleted: false }),
                        reviewFiles: await files.countDocuments({
                            requestId: options.requestId,
                            deleted: false,
                            approvalRequired: true,
                        }),
                    },
                    null,
                    2,
                ),
            );
            if (options.listFiles)
                console.log(
                    JSON.stringify(
                        await files
                            .find(
                                { requestId: options.requestId, deleted: false, approvalRequired: true },
                                { projection: { _id: 0, objectKey: 1, notBefore: 1 } },
                            )
                            .limit(100)
                            .toArray(),
                        null,
                        2,
                    ),
                );
        } finally {
            await connection.close();
        }
        return;
    }
    const app = await NestFactory.createApplicationContext(AccountDeletionOperationsModule, {
        logger: ['error', 'warn'],
    });
    try {
        const repository = app.get(AccountDeletionRepository);
        if (options.approveFile) await repository.approveFile(options.requestId, options.approveFile);
        await app.get(ProcessAccountDeletionUseCase).execute(options.requestId);
        console.log(JSON.stringify(await repository.inspect(options.requestId), null, 2));
    } finally {
        await app.close();
    }
}

if (require.main === module)
    main().catch(() => {
        console.error(
            '삭제 운영 명령을 완료하지 못했습니다. 작업 ID/상태/환경을 확인하세요. 원본 접속정보·오류는 출력하지 않습니다.',
        );
        process.exitCode = 1;
    });
