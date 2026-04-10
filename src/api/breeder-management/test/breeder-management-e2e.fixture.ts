import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Connection } from 'mongoose';
import request from 'supertest';

import { DiscordWebhookService } from '../../../common/discord/discord-webhook.service';
import { StorageService } from '../../../common/storage/storage.service';
import { closeTestingApp, createTestingApp } from '../../../common/test/test-utils';

export type BreederManagementE2eContext = {
    app: INestApplication;
    breederToken: string;
    breederId: string;
    adopterToken: string;
    adopterId: string;
    adopterName: string;
    adopterEmail: string;
    verificationUploadTestFileBuffer: Buffer;
    verificationUploadTestFileName: string;
};

function createBase64JpegBuffer(): Buffer {
    return Buffer.from(
        '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=',
        'base64',
    );
}

export async function createBreederManagementE2eContext(): Promise<BreederManagementE2eContext> {
    const app = await createTestingApp();
    const verificationUploadTestFileBuffer = createBase64JpegBuffer();
    const verificationUploadTestFileName = 'verification-upload-test.jpg';

    const storageService = app.get(StorageService);
    jest.spyOn(storageService, 'uploadFile').mockImplementation(async (file: Express.Multer.File, folder?: string) => {
        const fileName = `${folder}/${Date.now()}-${file.originalname}`;
        return {
            fileName,
            cdnUrl: `https://cdn.test/${fileName}`,
            storageUrl: `https://cdn.test/${fileName}`,
        };
    });
    jest.spyOn(storageService, 'generateSignedUrl').mockImplementation((fileName: string) => `https://signed.test/${fileName}`);

    const discordWebhookService = app.get(DiscordWebhookService);
    jest.spyOn(discordWebhookService, 'notifyBreederVerificationSubmission').mockResolvedValue();

    const timestamp = Date.now();
    const breederResponse = await request(app.getHttpServer())
        .post('/api/auth/register/breeder')
        .send({
            email: `breeder_mgmt_${timestamp}@test.com`,
            phoneNumber: '010-9999-8888',
            breederName: '관리 테스트 브리더',
            breederLocation: {
                city: '서울특별시',
                district: '강남구',
            },
            animal: 'dog',
            breeds: ['포메라니안', '말티즈'],
            plan: 'basic',
            level: 'new',
            agreements: {
                termsOfService: true,
                privacyPolicy: true,
                marketingConsent: false,
            },
        })
        .expect(200);

    const adopterProviderId = Math.random().toString().slice(2, 12);
    const adopterName = `테스트입양자${timestamp}`;
    const adopterEmail = `adopter_test_${timestamp}@test.com`;
    const adopterResponse = await request(app.getHttpServer())
        .post('/api/auth/register/adopter')
        .send({
            tempId: `temp_kakao_${adopterProviderId}_${timestamp}`,
            email: adopterEmail,
            nickname: adopterName,
            phone: '010-7777-6666',
            profileImage: 'https://example.com/adopter.jpg',
        })
        .expect(200);

    return {
        app,
        breederToken: breederResponse.body.data.accessToken,
        breederId: breederResponse.body.data.breederId,
        adopterToken: adopterResponse.body.data.accessToken,
        adopterId: adopterResponse.body.data.adopterId,
        adopterName,
        adopterEmail,
        verificationUploadTestFileBuffer,
        verificationUploadTestFileName,
    };
}

export async function closeBreederManagementE2eContext(context: BreederManagementE2eContext): Promise<void> {
    await closeTestingApp(context.app);
}

export async function seedBreederManagementApplication(context: BreederManagementE2eContext): Promise<string> {
    const connection = context.app.get<Connection>(getConnectionToken());
    const result = await connection.collection('adoption_applications').insertOne({
        breederId: new ObjectId(context.breederId),
        adopterId: new ObjectId(context.adopterId),
        adopterName: context.adopterName,
        adopterEmail: context.adopterEmail,
        adopterPhone: '010-7777-6666',
        petId: new ObjectId(),
        petName: '테스트 신청 반려동물',
        status: 'consultation_pending',
        standardResponses: {
            privacyConsent: true,
            selfIntroduction: '안녕하세요. 반려동물과 충분한 시간을 보낼 수 있습니다.',
            familyMembers: '본인 포함 2명',
            allFamilyConsent: true,
            allergyTestInfo: '알러지 검사 완료, 이상 없음',
            timeAwayFromHome: '평일 6시간 정도',
            livingSpaceDescription: '거실과 방을 자유롭게 사용할 수 있습니다.',
            previousPetExperience: '이전에 강아지를 5년간 키웠습니다.',
            canProvideBasicCare: true,
            canAffordMedicalExpenses: true,
            preferredPetDescription: '건강하고 사람을 잘 따르는 아이',
            desiredAdoptionTiming: '가능한 빨리',
            additionalNotes: '잘 부탁드립니다.',
        },
        customResponses: [
            {
                questionId: 'housing-type',
                questionLabel: '거주 형태를 알려주세요.',
                questionType: 'text',
                answer: '아파트',
            },
        ],
        appliedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    return result.insertedId.toString();
}

export async function seedBreederManagementReview(context: BreederManagementE2eContext): Promise<string> {
    const connection = context.app.get<Connection>(getConnectionToken());
    const result = await connection.collection('breeder_reviews').insertOne({
        applicationId: new ObjectId(),
        breederId: new ObjectId(context.breederId),
        adopterId: new ObjectId(),
        type: 'consultation',
        content: '브리더와의 상담이 정말 친절했어요.',
        writtenAt: new Date(),
        isVisible: true,
        isReported: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    return result.insertedId.toString();
}
