import mongoose from 'mongoose';

/**
 * available_pets.petType 백필 마이그레이션.
 *
 * 탐색 페이지의 축종 탭(고양이 찾기 / 강아지 찾기)은 available_pets.petType 으로 필터링하는데,
 * 해당 필드가 스키마에 뒤늦게 optional 로 추가되면서 기존 분양글에는 채워지지 않았다.
 * 그 결과 축종 탭에서 분양글이 한 건도 보이지 않는다.
 *
 * 채우는 근거는 글쓴 브리더다 — breeders.petType 은 required 라 브리더 1명 = 1축종이 보장된다.
 * (breeds 컬렉션으로 품종명을 역추적하는 방식은 데이터가 적어 커버리지가 나오지 않는다)
 *
 * 브리더 문서가 없는 고아 분양글은 임의 기본값을 넣지 않고 건너뛰며, 스킵 목록으로 보고한다.
 * petType 이 이미 있는 문서는 대상에서 제외하므로 여러 번 실행해도 안전하다(멱등).
 */

const PET_TYPES = ['dog', 'cat', 'reptile'] as const;
type PetType = (typeof PET_TYPES)[number];

type AvailablePetRecord = {
    _id: mongoose.Types.ObjectId;
    breederId?: mongoose.Types.ObjectId | string;
};

type BreederRecord = {
    _id: mongoose.Types.ObjectId;
    petType?: string;
};

export type AvailablePetTypeMigrationSummary = {
    dryRun: boolean;
    /** petType 이 비어 있어 대상이 된 분양글 수 */
    scannedPets: number;
    /** 브리더로 축종을 유도해 채운(dry-run 이면 채울) 분양글 수 */
    migratedPets: number;
    /** 채운 축종별 분포 (예: { cat: 68, dog: 69 }) */
    migratedByPetType: Record<PetType, number>;
    /** 브리더를 찾을 수 없거나 브리더 축종이 유효하지 않아 건너뛴 분양글 id */
    skippedPetIds: string[];
    /** 위 스킵을 유발한 breederId 목록 (고아 데이터 추적용) */
    skippedBreederIds: string[];
};

/** enum 밖 값이 저장된 레거시 브리더 문서를 걸러낸다. */
function toPetType(value: unknown): PetType | undefined {
    return PET_TYPES.includes(value as PetType) ? (value as PetType) : undefined;
}

function toObjectId(value: AvailablePetRecord['breederId']): mongoose.Types.ObjectId | undefined {
    if (value instanceof mongoose.Types.ObjectId) return value;
    if (typeof value === 'string' && mongoose.Types.ObjectId.isValid(value)) {
        return new mongoose.Types.ObjectId(value);
    }
    return undefined;
}

export async function migrateAvailablePetType(
    db: mongoose.mongo.Db,
    isDryRun = true,
): Promise<AvailablePetTypeMigrationSummary> {
    const pets = db.collection<AvailablePetRecord>('available_pets');
    const breeders = db.collection<BreederRecord>('breeders');

    // petType 이 이미 있는 문서는 건드리지 않는다 → 재실행해도 결과가 같다.
    const targets = await pets
        .find({ $or: [{ petType: { $exists: false } }, { petType: null }] })
        .project<AvailablePetRecord>({ _id: 1, breederId: 1 })
        .toArray();

    const breederIds = [...new Set(targets.map((pet) => toObjectId(pet.breederId)?.toString()).filter(Boolean))];
    const breederDocs = await breeders
        .find({ _id: { $in: breederIds.map((id) => new mongoose.Types.ObjectId(id as string)) } })
        .project<BreederRecord>({ _id: 1, petType: 1 })
        .toArray();
    const petTypeByBreederId = new Map(
        breederDocs.map((breeder) => [breeder._id.toString(), toPetType(breeder.petType)]),
    );

    const idsByPetType = new Map<PetType, mongoose.Types.ObjectId[]>();
    const skippedPetIds: string[] = [];
    const skippedBreederIds = new Set<string>();

    for (const pet of targets) {
        const breederId = toObjectId(pet.breederId)?.toString();
        const petType = breederId ? petTypeByBreederId.get(breederId) : undefined;
        if (!petType) {
            skippedPetIds.push(pet._id.toString());
            skippedBreederIds.add(breederId ?? String(pet.breederId));
            continue;
        }
        idsByPetType.set(petType, [...(idsByPetType.get(petType) ?? []), pet._id]);
    }

    const migratedByPetType = { dog: 0, cat: 0, reptile: 0 } as Record<PetType, number>;
    let migratedPets = 0;

    for (const [petType, ids] of idsByPetType) {
        if (!isDryRun) {
            await pets.updateMany({ _id: { $in: ids } }, { $set: { petType } });
        }
        migratedByPetType[petType] = ids.length;
        migratedPets += ids.length;
    }

    return {
        dryRun: isDryRun,
        scannedPets: targets.length,
        migratedPets,
        migratedByPetType,
        skippedPetIds,
        skippedBreederIds: [...skippedBreederIds],
    };
}

async function runCli(): Promise<void> {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI가 필요합니다.');
    await mongoose.connect(mongoUri);
    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB 연결에 실패했습니다.');

    // 실수로 쓰기가 일어나지 않도록 기본은 dry-run 이고, --apply 를 준 경우에만 실제로 갱신한다.
    const isDryRun = !process.argv.includes('--apply');
    const summary = await migrateAvailablePetType(db, isDryRun);
    console.log(JSON.stringify(summary, null, 2));
    if (isDryRun) {
        console.log('[dry-run] 실제로 갱신하지 않았습니다. 적용하려면 --apply 를 붙여 다시 실행하세요.');
    }
}

if (require.main === module) {
    runCli()
        .catch((error) => {
            console.error(error);
            process.exitCode = 1;
        })
        .finally(async () => {
            await mongoose.disconnect();
        });
}
