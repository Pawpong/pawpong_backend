import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { StorageService } from '../../common/storage/storage.service';

import { Breeder, BreederDocument } from '../../schema/breeder.schema';
import { Adopter, AdopterDocument } from '../../schema/adopter.schema';
import { AvailablePet, AvailablePetDocument } from '../../schema/available-pet.schema';

import { PaginationBuilder } from '../../common/dto/pagination/pagination-builder.dto';
import { SearchBreederRequestDto, BreederSortBy } from './dto/request/search-breeder-request.dto';
import { BreederCardResponseDto } from './dto/response/breeder-card-response.dto';
import { PaginationResponseDto } from '../../common/dto/pagination/pagination-response.dto';

/**
 * 브리더 탐색 서비스
 * 공개 브리더 검색 및 필터링 기능을 제공
 */
@Injectable()
export class BreederExploreService {
    private readonly logger = new Logger(BreederExploreService.name);

    constructor(
        @InjectModel(Breeder.name) private breederModel: Model<BreederDocument>,
        @InjectModel(Adopter.name) private adopterModel: Model<AdopterDocument>,
        @InjectModel(AvailablePet.name) private availablePetModel: Model<AvailablePetDocument>,
        private readonly storageService: StorageService,
    ) {}

    /**
     * 브리더 탐색/검색 기능
     */
    async searchBreeders(
        searchDto: SearchBreederRequestDto,
        userId?: string,
    ): Promise<PaginationResponseDto<BreederCardResponseDto>> {
        const {
            petType,
            breeds,
            dogSize,
            catFurLength,
            province,
            city,
            isAdoptionAvailable,
            breederLevel,
            sortBy,
            page = 1,
            limit = 20,
        } = searchDto;

        // 기본 필터 조건
        const filter: any = {
            'verification.status': 'approved', // 승인된 브리더만
            accountStatus: 'active', // 활성 상태만
            petType: petType, // 반려동물 타입
            isTestAccount: { $ne: true }, // 테스트 계정 제외
        };

        // 품종 필터
        if (breeds && breeds.length > 0) {
            filter['breeds'] = { $in: breeds };
        }

        // 강아지 크기 필터 (강아지일 때만)
        // TODO: availablePets는 별도 컬렉션이므로 추후 구현
        // if (petType === 'dog' && dogSize && dogSize.length > 0) {
        //     filter['availablePets.size'] = { $in: dogSize };
        // }

        // 고양이 털 길이 필터 (고양이일 때만)
        // TODO: availablePets는 별도 컬렉션이므로 추후 구현
        // if (petType === 'cat' && catFurLength && catFurLength.length > 0) {
        //     filter['availablePets.furLength'] = { $in: catFurLength };
        // }

        // 지역 필터
        if (province && province.length > 0 && city && city.length > 0) {
            filter['$and'] = [
                { 'profile.location.city': { $in: province } },
                { 'profile.location.district': { $in: city } },
            ];
        } else if (province && province.length > 0) {
            filter['profile.location.city'] = { $in: province };
        } else if (city && city.length > 0) {
            filter['profile.location.district'] = { $in: city };
        }

        // 입양 가능 여부 필터는 후처리로 수행 (별도 컬렉션이므로)
        // availablePets는 별도 컬렉션이므로 브리더 조회 후 필터링

        // 브리더 레벨 필터
        if (breederLevel && breederLevel.length > 0) {
            filter['verification.level'] = { $in: breederLevel };
        }

        // 정렬 옵션
        let sort: any = {};
        switch (sortBy) {
            case BreederSortBy.LATEST:
                sort = { createdAt: -1 };
                break;
            case BreederSortBy.FAVORITE:
                sort = { 'stats.totalFavorites': -1 };
                break;
            case BreederSortBy.REVIEW:
                sort = { 'stats.totalReviews': -1 };
                break;
            case BreederSortBy.PRICE_ASC:
                sort = { 'profile.priceRange.min': 1 };
                break;
            case BreederSortBy.PRICE_DESC:
                sort = { 'profile.priceRange.max': -1 };
                break;
            default:
                sort = { createdAt: -1 };
        }

        // 입양 가능한 개체가 있는 브리더 ID 목록 조회
        const breedersWithAvailablePets = await this.availablePetModel.distinct('breederId', {
            isActive: true,
            status: 'available',
        });
        const availableBreederIds = breedersWithAvailablePets.map((id) => id.toString());

        // 입양 가능 여부 필터 적용 (true일 때만 필터링)
        if (isAdoptionAvailable === true) {
            filter['_id'] = { $in: breedersWithAvailablePets };
        }

        // 페이지네이션 계산
        const skip = (page - 1) * limit;

        // 데이터 조회
        const [breeders, totalCount] = await Promise.all([
            this.breederModel.find(filter).sort(sort).skip(skip).limit(limit).lean().exec(),
            this.breederModel.countDocuments(filter),
        ]);
        let totalItems = totalCount;

        // 사용자의 찜 목록 가져오기 (입양자 또는 브리더 모두 지원)
        let favoritedBreederIds: string[] = [];
        if (userId) {
            console.log('[BreederExploreService] userId:', userId);
            // 먼저 입양자에서 조회
            const adopter = await this.adopterModel.findById(userId).lean();
            console.log('[BreederExploreService] adopter found:', !!adopter);
            if (adopter) {
                favoritedBreederIds = adopter.favoriteBreederList?.map((f) => f.favoriteBreederId) || [];
                console.log('[BreederExploreService] adopter favoriteBreederIds:', favoritedBreederIds);
            } else {
                // 입양자가 아니면 브리더에서 조회
                const breederUser = await this.breederModel.findById(userId).lean();
                console.log('[BreederExploreService] breederUser found:', !!breederUser);
                if (breederUser) {
                    console.log(
                        '[BreederExploreService] breederUser.favoriteBreederList:',
                        (breederUser as any).favoriteBreederList,
                    );
                    favoritedBreederIds =
                        (breederUser as any).favoriteBreederList?.map((f: any) => f.favoriteBreederId) || [];
                    console.log('[BreederExploreService] breeder favoriteBreederIds:', favoritedBreederIds);
                }
            }
        }

        // 브리더 ID 목록 추출 (이미 조회한 availableBreederIds 활용)
        const breederIds = breeders.map((b) => b._id);

        // 카드 데이터로 변환
        const cards: BreederCardResponseDto[] = breeders.map((breeder) => {
            // 이미지 URL을 Signed URL로 변환
            const representativePhotos = this.storageService.generateSignedUrls(
                breeder.profile?.representativePhotos || [],
                60, // 1시간 유효
            );
            const profileImage = this.storageService.generateSignedUrlSafe(breeder.profileImageFileName, 60);

            // 가격 정보 계산
            const statsMin = breeder.stats?.priceRange?.min || 0;
            const statsMax = breeder.stats?.priceRange?.max || 0;
            const profileMin = breeder.profile?.priceRange?.min || 0;
            const profileMax = breeder.profile?.priceRange?.max || 0;
            const finalMin = statsMin || profileMin;
            const finalMax = statsMax || profileMax;

            return {
                breederId: breeder._id.toString(),
                breederName: breeder.name,
                breederLevel: breeder.verification?.level || 'new',
                petType: breeder.petType || 'dog',
                location: breeder.profile?.location
                    ? `${breeder.profile.location.city} ${breeder.profile.location.district}`
                    : '',
                mainBreed: breeder.breeds?.[0] || '',
                isAdoptionAvailable: availableBreederIds.includes(breeder._id.toString()),
                priceRange: {
                    min: finalMin,
                    max: finalMax,
                    display: finalMin > 0 || finalMax > 0 ? 'range' : 'consultation',
                },
                favoriteCount: breeder.stats?.totalFavorites || 0,
                isFavorited: (() => {
                    const isFav = favoritedBreederIds.includes(breeder._id.toString());
                    if (isFav) {
                        console.log(`[BreederExploreService] Breeder ${breeder._id.toString()} is favorited!`);
                    }
                    return isFav;
                })(),
                representativePhotos: representativePhotos,
                profileImage: profileImage,
                totalReviews: breeder.stats?.totalReviews || 0,
                averageRating: breeder.stats?.averageRating || 0,
                createdAt: (breeder as any).createdAt || new Date(),
            };
        });

        // 페이지네이션 응답 생성
        return new PaginationBuilder<BreederCardResponseDto>()
            .setItems(cards)
            .setTotalCount(totalItems)
            .setPage(page)
            .setLimit(limit)
            .build();
    }

    /**
     * 인기 브리더 목록 조회
     */
    async getPopularBreeders(limit: number = 10): Promise<BreederCardResponseDto[]> {
        const breeders = await this.breederModel
            .find({
                'verification.status': 'approved',
                accountStatus: 'active',
                isTestAccount: { $ne: true }, // 테스트 계정 제외
            })
            .sort({ 'stats.totalFavorites': -1, 'stats.averageRating': -1 })
            .limit(limit)
            .lean()
            .exec();

        return Promise.all(
            breeders.map(async (breeder) => {
                // 이미지 URL을 Signed URL로 변환
                const representativePhotos = this.storageService.generateSignedUrls(
                    breeder.profile?.representativePhotos || [],
                    60, // 1시간 유효
                );
                const profileImage = this.storageService.generateSignedUrlSafe(breeder.profileImageFileName, 60);

                // 분양 가능 여부 확인
                const hasAvailable = await this.availablePetModel.exists({
                    breederId: breeder._id,
                    isActive: true,
                    status: 'available',
                });

                return {
                    breederId: breeder._id.toString(),
                    breederName: breeder.name,
                    breederLevel: breeder.verification?.level || 'new',
                    petType: breeder.petType || 'dog',
                    location: breeder.profile?.location
                        ? `${breeder.profile.location.city} ${breeder.profile.location.district}`
                        : '',
                    mainBreed: breeder.breeds?.[0] || '',
                    isAdoptionAvailable: !!hasAvailable,
                    priceRange: undefined, // 로그인 필요
                    favoriteCount: breeder.stats?.totalFavorites || 0,
                    isFavorited: false,
                    representativePhotos: representativePhotos,
                    profileImage: profileImage,
                    totalReviews: breeder.stats?.totalReviews || 0,
                    averageRating: breeder.stats?.averageRating || 0,
                    createdAt: (breeder as any).createdAt || new Date(),
                };
            }),
        );
    }
}
