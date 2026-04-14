/**
 * 관리자 계정 생성 스크립트
 *
 * 사용법: yarn create:admin
 *
 * .env의 MONGODB_URI에 연결하여 관리자 계정을 생성합니다.
 * dev DB 또는 로컬 DB 대상으로만 사용하세요.
 */
import * as readline from 'readline';
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

// .env 로드
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI가 .env에 없습니다.');
    process.exit(1);
}

const AdminSchema = new mongoose.Schema(
    {
        name: String,
        email: { type: String, unique: true },
        password: String,
        status: { type: String, default: 'active' },
        adminLevel: { type: String, default: 'super_admin' },
        permissions: {
            canManageUsers: { type: Boolean, default: true },
            canManageBreeders: { type: Boolean, default: true },
            canManageReports: { type: Boolean, default: true },
            canViewStatistics: { type: Boolean, default: true },
            canManageAdmins: { type: Boolean, default: true },
        },
        activityLogs: { type: Array, default: [] },
    },
    { timestamps: true },
);

function prompt(question: string): Promise<string> {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

async function main() {
    console.log('\n=== Pawpong 관리자 계정 생성 ===');
    console.log(`📦 DB: ${MONGODB_URI!.replace(/\/\/.*@/, '//****@')}\n`);

    const name = await prompt('이름: ');
    const email = await prompt('이메일: ');
    const password = await prompt('비밀번호: ');

    if (!name || !email || !password) {
        console.error('❌ 모든 항목을 입력해야 합니다.');
        process.exit(1);
    }

    await mongoose.connect(MONGODB_URI!);

    const AdminModel = mongoose.model('Admin', AdminSchema);

    const existing = await AdminModel.findOne({ email });
    if (existing) {
        console.error(`❌ ${email} 계정이 이미 존재합니다.`);
        await mongoose.disconnect();
        process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await AdminModel.create({
        name,
        email,
        password: hashedPassword,
    });

    console.log(`\n✅ 관리자 계정 생성 완료!`);
    console.log(`   이름: ${name}`);
    console.log(`   이메일: ${email}`);
    console.log(`   권한: super_admin (전체)\n`);

    await mongoose.disconnect();
    process.exit(0);
}

main().catch((err) => {
    console.error('❌ 오류 발생:', err.message);
    process.exit(1);
});
