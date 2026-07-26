import { GetAvailablePetsUseCase } from '../../../application/use-cases/get-available-pets.use-case';
import { HomeAvailablePetCatalogService } from '../../../domain/services/home-available-pet-catalog.service';
import { HomeContentReaderPort, HomeAvailablePetSnapshot } from '../../../application/ports/home-content-reader.port';
import { HomeAssetUrlPort } from '../../../application/ports/home-asset-url.port';

function makePetSnapshot(overrides: Partial<HomeAvailablePetSnapshot> = {}): HomeAvailablePetSnapshot {
    return {
        id: 'pet-1',
        name: '초코',
        breed: '포메라니안',
        price: 500000,
        photos: ['photo1.jpg'],
        breederId: 'breeder-1',
        breederName: '김브리더',
        breederCity: '서울특별시',
        breederDistrict: '강남구',
        ...overrides,
    };
}

function makeContentReader(pets: HomeAvailablePetSnapshot[] = []): HomeContentReaderPort {
    return {
        readActiveBanners: jest.fn().mockResolvedValue([]),
        readFaqsFor: jest.fn().mockResolvedValue([]),
        readAvailablePets: jest.fn().mockResolvedValue(pets),
    };
}

function makeAssetUrlPort(): HomeAssetUrlPort {
    return {
        generateSignedUrl: jest.fn().mockImplementation((fileName: string) => `https://cdn.example.com/${fileName}`),
    };
}

describe('입양 가능 반려동물 조회 유스케이스', () => {
    let useCase: GetAvailablePetsUseCase;
    let contentReader: HomeContentReaderPort;
    let assetUrlPort: HomeAssetUrlPort;
    const catalogService = new HomeAvailablePetCatalogService();

    beforeEach(() => {
        contentReader = makeContentReader();
        assetUrlPort = makeAssetUrlPort();
        useCase = new GetAvailablePetsUseCase(contentReader, catalogService, assetUrlPort);
    });

    it('반려동물이 없으면 빈 배열을 반환한다', async () => {
        const result = await useCase.execute();

        expect(result).toEqual([]);
    });

    it('기본 limit은 10으로 정규화된다', async () => {
        await useCase.execute();

        expect(contentReader.readAvailablePets).toHaveBeenCalledWith(10);
    });

    it('limit 50 초과는 50으로 제한된다', async () => {
        await useCase.execute(100);

        expect(contentReader.readAvailablePets).toHaveBeenCalledWith(50);
    });

    it('비인증 사용자는 price가 null로 반환된다', async () => {
        contentReader = makeContentReader([makePetSnapshot({ price: 500000 })]);
        useCase = new GetAvailablePetsUseCase(contentReader, catalogService, assetUrlPort);

        const result = await useCase.execute(10, false);

        expect(result[0].price).toBeNull();
    });

    it('인증 사용자는 실제 price가 반환된다', async () => {
        contentReader = makeContentReader([makePetSnapshot({ price: 500000 })]);
        useCase = new GetAvailablePetsUseCase(contentReader, catalogService, assetUrlPort);

        const result = await useCase.execute(10, true);

        expect(result[0].price).toBe(500000);
    });

    it('사진이 있으면 서명된 URL로 변환된다', async () => {
        contentReader = makeContentReader([makePetSnapshot({ photos: ['photo1.jpg'] })]);
        useCase = new GetAvailablePetsUseCase(contentReader, catalogService, assetUrlPort);

        const result = await useCase.execute();

        expect(result[0].mainPhoto).toContain('photo1.jpg');
    });

    it('사진이 없으면 placeholder URL이 설정된다', async () => {
        contentReader = makeContentReader([makePetSnapshot({ photos: [] })]);
        useCase = new GetAvailablePetsUseCase(contentReader, catalogService, assetUrlPort);

        const result = await useCase.execute();

        expect(result[0].mainPhoto).toContain('placeholder');
    });

    it('location 정보를 포함한다', async () => {
        contentReader = makeContentReader([
            makePetSnapshot({ breederCity: '부산광역시', breederDistrict: '해운대구' }),
        ]);
        useCase = new GetAvailablePetsUseCase(contentReader, catalogService, assetUrlPort);

        const result = await useCase.execute();

        expect(result[0].location).toEqual({ city: '부산광역시', district: '해운대구' });
    });
});
