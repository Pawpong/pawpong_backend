import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { AlimtalkService } from '../../../../../common/alimtalk/alimtalk.service';
import { StorageService } from '../../../../../common/storage/storage.service';
import { closeTestingApp, createTestingApp, ensureActiveTerms } from '../../../../../common/testing/test-utils';

export type AuthE2eContext = {
    app: INestApplication;
    uploadTestFileBuffer: Buffer;
    uploadTestFileName: string;
    capturedVerificationCodes: Map<string, string>;
};

function createBase64JpegBuffer(): Buffer {
    return Buffer.from(
        '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=',
        'base64',
    );
}

export async function createAuthE2eContext(): Promise<AuthE2eContext> {
    const app = await createTestingApp();
    // 입양자 가입은 활성 약관이 있어야 통과한다. 컨텍스트 생성 시 한 번 심어둔다.
    await ensureActiveTerms(app);
    const uploadTestFileBuffer = createBase64JpegBuffer();
    const uploadTestFileName = 'auth-upload-test.jpg';
    const capturedVerificationCodes = new Map<string, string>();

    const storageService = app.get(StorageService);
    jest.spyOn(storageService, 'uploadFile').mockImplementation(async (file: Express.Multer.File, folder?: string) => {
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.originalname}`;
        return {
            fileName,
            cdnUrl: `https://cdn.test/${fileName}`,
            storageUrl: `https://cdn.test/${fileName}`,
        };
    });

    const alimtalkService = app.get(AlimtalkService);
    jest.spyOn(alimtalkService, 'sendVerificationCode').mockImplementation(async (phone: string, code: string) => {
        capturedVerificationCodes.set(phone, code);
        return {
            success: true,
            messageId: `alimtalk-${phone}`,
        };
    });

    return {
        app,
        uploadTestFileBuffer,
        uploadTestFileName,
        capturedVerificationCodes,
    };
}

export async function closeAuthE2eContext(context: AuthE2eContext): Promise<void> {
    await closeTestingApp(context.app);
}

export function createAdopterRegisterData(overrides: Record<string, unknown> = {}) {
    const timestamp = Date.now();
    const providerId = Math.random().toString().slice(2, 12);

    return {
        tempId: `temp_kakao_${providerId}_${timestamp}`,
        email: `adopter_${timestamp}_${providerId}@test.com`,
        nickname: `테스트입양자${timestamp}`.slice(0, 20),
        realName: '테스트입양자',
        phone: '010-1234-5678',
        profileImage: 'https://example.com/profile.jpg',
        // ensureActiveTerms 가 심는 필수 약관 3종 (버전 고정)
        termsAgreements: [
            { code: 'service', version: '1.0.0' },
            { code: 'privacy', version: '1.0.0' },
            { code: 'age_14plus', version: '1.0.0' },
        ],
        ...overrides,
    };
}

export function createBreederRegisterData(overrides: Record<string, unknown> = {}) {
    const timestamp = Date.now();

    return {
        email: `breeder_${timestamp}@test.com`,
        phoneNumber: '010-5555-5555',
        breederName: `테스트 브리더 ${timestamp}`,
        breederLocation: {
            city: '서울특별시',
            district: '강남구',
        },
        animal: 'dog',
        breeds: ['포메라니안', '말티즈'],
        plan: 'basic',
        agreements: {
            termsOfService: true,
            privacyPolicy: true,
            marketingConsent: false,
        },
        ...overrides,
    };
}

export function registerAdopter(app: INestApplication, overrides: Record<string, unknown> = {}) {
    return request(app.getHttpServer())
        .post('/api/v2/auth/register/adopter')
        .send(createAdopterRegisterData(overrides));
}

export function registerBreeder(app: INestApplication, overrides: Record<string, unknown> = {}) {
    return request(app.getHttpServer())
        .post('/api/v2/auth/register/breeder')
        .send(createBreederRegisterData(overrides));
}

export function createPhoneNumber(): string {
    return `01091${Date.now().toString().slice(-2)}${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0')}`;
}
