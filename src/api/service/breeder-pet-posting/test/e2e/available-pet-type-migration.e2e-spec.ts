import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';

import { closeTestingApp, createTestingApp } from '../../../../../common/testing/test-utils';
import { migrateAvailablePetType } from '../../../../../scripts/migrate-available-pet-type';

/**
 * available_pets.petType 백필 마이그레이션 e2e.
 *
 * 탐색 페이지 축종 탭이 petType 으로 필터링하는데 기존 분양글에는 이 필드가 없다.
 * 브리더 계정 축종으로 채우되, 브리더가 없는 고아 분양글은 건너뛰는지 확인한다.
 */
describe('available_pets petType 백필 마이그레이션 E2E', () => {
    let app: INestApplication;
    let connection: Connection;

    const catBreederId = new Types.ObjectId();
    const dogBreederId = new Types.ObjectId();
    const legacyBreederId = new Types.ObjectId();
    const orphanBreederId = new Types.ObjectId();

    const petId = {
        cat1: new Types.ObjectId(),
        cat2: new Types.ObjectId(),
        dog1: new Types.ObjectId(),
        legacy: new Types.ObjectId(),
        orphan: new Types.ObjectId(),
        alreadyFilled: new Types.ObjectId(),
    };

    const breederSeed = (slug: string, petType: string) => ({
        emailAddress: `${slug}@pet-type-migration.test`,
        phoneNumber: `010-0000-${String(Math.abs(hash(slug)) % 10000).padStart(4, '0')}`,
        petType,
        role: 'breeder',
        accountStatus: 'active',
    });

    const petTypeOf = async (id: Types.ObjectId): Promise<unknown> =>
        (await connection.collection('available_pets').findOne({ _id: id }))?.petType;

    beforeAll(async () => {
        app = await createTestingApp();
        connection = app.get<Connection>(getConnectionToken());
    });

    afterAll(async () => {
        await closeTestingApp(app);
    });

    beforeEach(async () => {
        await connection.collection('available_pets').deleteMany({});
        await connection.collection('breeders').deleteMany({});

        // breeders 는 emailAddress/phoneNumber 에 unique index 가 있어 시드마다 값을 달리한다
        await connection.collection('breeders').insertMany([
            { _id: catBreederId, ...breederSeed('cat-breeder', 'cat'), name: '고양이 브리더' },
            { _id: dogBreederId, ...breederSeed('dog-breeder', 'dog'), name: '강아지 브리더' },
            // enum 밖 값이 저장된 레거시 브리더 — 임의 기본값을 넣으면 안 된다
            { _id: legacyBreederId, ...breederSeed('legacy-breeder', 'bird'), name: '레거시 브리더' },
        ] as any);

        await connection.collection('available_pets').insertMany([
            { _id: petId.cat1, breederId: catBreederId, name: '고양이1' },
            { _id: petId.cat2, breederId: catBreederId, name: '고양이2' },
            { _id: petId.dog1, breederId: dogBreederId, name: '강아지1' },
            { _id: petId.legacy, breederId: legacyBreederId, name: '축종불명' },
            { _id: petId.orphan, breederId: orphanBreederId, name: '고아글' },
            // 이미 채워진 문서는 대상에서 빠져야 한다
            { _id: petId.alreadyFilled, breederId: dogBreederId, name: '기존', petType: 'dog' },
        ] as any);
    });

    it('dry-run 은 집계만 하고 아무것도 쓰지 않는다', async () => {
        const summary = await migrateAvailablePetType(connection.db!, true);

        expect(summary.dryRun).toBe(true);
        expect(summary.scannedPets).toBe(5);
        expect(summary.migratedPets).toBe(3);
        expect(summary.migratedByPetType).toEqual({ cat: 2, dog: 1, reptile: 0 });

        // 실제 문서는 그대로여야 한다
        expect(await petTypeOf(petId.cat1)).toBeUndefined();
        expect(await petTypeOf(petId.dog1)).toBeUndefined();
    });

    it('--apply 상당의 실행은 브리더 축종으로 채운다', async () => {
        const summary = await migrateAvailablePetType(connection.db!, false);

        expect(summary.dryRun).toBe(false);
        expect(summary.migratedPets).toBe(3);
        expect(await petTypeOf(petId.cat1)).toBe('cat');
        expect(await petTypeOf(petId.cat2)).toBe('cat');
        expect(await petTypeOf(petId.dog1)).toBe('dog');
    });

    it('브리더가 없거나 축종이 유효하지 않은 분양글은 건너뛰고 보고한다', async () => {
        const summary = await migrateAvailablePetType(connection.db!, false);

        expect(summary.skippedPetIds.sort()).toEqual([petId.legacy.toString(), petId.orphan.toString()].sort());
        expect(summary.skippedBreederIds.sort()).toEqual(
            [legacyBreederId.toString(), orphanBreederId.toString()].sort(),
        );
        // 임의 기본값을 넣지 않는다
        expect(await petTypeOf(petId.orphan)).toBeUndefined();
        expect(await petTypeOf(petId.legacy)).toBeUndefined();
    });

    it('이미 petType 이 있는 문서는 건드리지 않는다', async () => {
        await connection
            .collection('available_pets')
            .updateOne({ _id: petId.alreadyFilled }, { $set: { petType: 'reptile' } });

        const summary = await migrateAvailablePetType(connection.db!, false);

        expect(summary.scannedPets).toBe(5);
        expect(await petTypeOf(petId.alreadyFilled)).toBe('reptile');
    });

    it('두 번 돌려도 안전하다 (멱등)', async () => {
        await migrateAvailablePetType(connection.db!, false);
        const second = await migrateAvailablePetType(connection.db!, false);

        // 1회차에서 채운 3건은 더 이상 대상이 아니고, 스킵된 2건만 남는다
        expect(second.scannedPets).toBe(2);
        expect(second.migratedPets).toBe(0);
        expect(await petTypeOf(petId.cat1)).toBe('cat');
    });
});

/** 시드 전화번호를 slug 마다 고정적으로 다르게 만들기 위한 간단한 해시 */
function hash(value: string): number {
    return [...value].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) | 0, 7);
}
