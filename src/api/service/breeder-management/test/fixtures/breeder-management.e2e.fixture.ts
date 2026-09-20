import { jest } from '@jest/globals';
import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Connection } from 'mongoose';
import request from 'supertest';

import { DiscordWebhookService } from '../../../../../common/discord/discord-webhook.service';
import { StorageService } from '../../../../../common/storage/storage.service';
import { closeTestingApp, createTestingApp, agreeAllActiveTerms } from '../../../../../common/testing/test-utils';

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
    jest.spyOn(storageService, 'uploadFile').mockImplementation(async (file, folder?: string) => {
        const fileName = `${folder}/${Date.now()}-${file.originalname}`;
        return {
            fileName,
            cdnUrl: `https://cdn.test/${fileName}`,
            storageUrl: `https://cdn.test/${fileName}`,
        };
    });
    jest.spyOn(storageService, 'generateSignedUrl').mockImplementation(
        (fileName: string) => `https://signed.test/${fileName}`,
    );

    const discordWebhookService = app.get(DiscordWebhookService);
    jest.spyOn(discordWebhookService, 'notifyBreederVerificationSubmission').mockResolvedValue();

    const timestamp = Date.now();
    const breederResponse = await request(app.getHttpServer())
        .post('/api/v2/auth/register/breeder')
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
        .post('/api/v2/auth/register/adopter')
        .send({
            tempId: `temp_kakao_${adopterProviderId}_${timestamp}`,
            email: adopterEmail,
            nickname: adopterName,
            realName: '테스트입양자',
            termsAgreements: await agreeAllActiveTerms(app),
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

/**
 * 브리더 소유의 분양중(available) 펫 한 마리를 심는다.
 * 예약 전이 테스트는 실제 펫 문서가 있어야 status 변화를 검증할 수 있다
 * (기존 seedBreederManagementApplication 은 존재하지 않는 petId 를 쓴다).
 */
export async function seedBreederManagementPet(context: BreederManagementE2eContext, name = '예약 테스트 반려동물') {
    const connection = context.app.get<Connection>(getConnectionToken());
    const result = await connection.collection('available_pets').insertOne({
        breederId: new ObjectId(context.breederId),
        name,
        breed: '포메라니안',
        gender: 'female',
        birthDate: new Date('2025-01-01'),
        price: 1500000,
        status: 'available',
        photos: [],
        isActive: true,
        inquiryCount: 0,
        favoriteCount: 0,
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    return result.insertedId.toString();
}

/**
 * 지정한 펫에 걸린 상담대기 신청 한 건을 심는다.
 * adopterId 를 넘기면 그 입양자로, 없으면 컨텍스트의 입양자로 만든다
 * (한 펫에 상담완료가 여러 건인 상황을 재현할 때 서로 다른 입양자가 필요하다).
 */
export async function seedBreederManagementApplicationForPet(
    context: BreederManagementE2eContext,
    petId: string,
    adopterId: string = context.adopterId,
): Promise<string> {
    const connection = context.app.get<Connection>(getConnectionToken());
    const result = await connection.collection('adoption_applications').insertOne({
        breederId: new ObjectId(context.breederId),
        adopterId: new ObjectId(adopterId),
        adopterName: context.adopterName,
        adopterEmail: context.adopterEmail,
        adopterPhone: '010-7777-6666',
        petId: new ObjectId(petId),
        petName: '예약 테스트 반려동물',
        status: 'consultation_pending',
        standardResponses: { privacyConsent: true },
        customResponses: [],
        appliedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    return result.insertedId.toString();
}

/**
 * 펫의 현재 분양 상태를 읽는다. 예약 전이 검증용.
 */
export async function readBreederManagementPetStatus(
    context: BreederManagementE2eContext,
    petId: string,
): Promise<string | undefined> {
    const connection = context.app.get<Connection>(getConnectionToken());
    const pet = await connection.collection('available_pets').findOne({ _id: new ObjectId(petId) });
    return pet?.status as string | undefined;
}

/**
 * 신청서의 현재 상태를 읽는다. 일괄 거절·전이 가드 검증용.
 */
export async function readBreederManagementApplicationStatus(
    context: BreederManagementE2eContext,
    applicationId: string,
): Promise<string | undefined> {
    const connection = context.app.get<Connection>(getConnectionToken());
    const application = await connection
        .collection('adoption_applications')
        .findOne({ _id: new ObjectId(applicationId) });
    return application?.status as string | undefined;
}

/**
 * 특정 입양자에게 쌓인 인앱 알림을 타입으로 걸러 읽는다.
 * 자동 거절된 신청자가 알림을 실제로 받았는지 검증할 때 쓴다 —
 * 예전엔 상태만 조용히 바뀌어 당사자가 목록을 직접 열어야 알 수 있었다.
 */
export async function readBreederManagementNotifications(
    context: BreederManagementE2eContext,
    userId: string,
    type: string,
): Promise<Array<{ targetUrl?: string; metadata?: Record<string, unknown> }>> {
    const connection = context.app.get<Connection>(getConnectionToken());
    return connection.collection('notifications').find({ userId, type }).toArray() as Promise<
        Array<{ targetUrl?: string; metadata?: Record<string, unknown> }>
    >;
}

/**
 * 컨텍스트와 별개인 입양자 계정을 하나 더 만든다.
 * 한 펫에 서로 다른 사람이 신청한 상황(일괄 거절 대상)을 재현하려면 필요하다.
 */
export async function registerBreederManagementExtraAdopter(
    context: BreederManagementE2eContext,
): Promise<{ adopterId: string }> {
    const timestamp = `${Date.now()}_${Math.random().toString().slice(2, 8)}`;
    const response = await request(context.app.getHttpServer())
        .post('/api/v2/auth/register/adopter')
        .send({
            tempId: `temp_kakao_${Math.random().toString().slice(2, 12)}_${timestamp}`,
            email: `adopter_extra_${timestamp}@test.com`,
            nickname: `추가입양자${timestamp}`,
            realName: '추가입양자',
            termsAgreements: await agreeAllActiveTerms(context.app),
            phone: '010-5555-4444',
            profileImage: 'https://example.com/adopter-extra.jpg',
        })
        .expect(200);

    return { adopterId: response.body.data.adopterId };
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
