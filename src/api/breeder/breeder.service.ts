import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { VerificationStatus, PetStatus, PriceDisplayType } from '../../common/enum/user.enum';
import { StorageService } from '../../common/storage/storage.service';

import { Breeder, BreederDocument } from '../../schema/breeder.schema';
import { Adopter, AdopterDocument } from '../../schema/adopter.schema';
import { ParentPet, ParentPetDocument } from '../../schema/parent-pet.schema';
import { AvailablePet, AvailablePetDocument } from '../../schema/available-pet.schema';
import { BreederReview, BreederReviewDocument } from '../../schema/breeder-review.schema';

import { PaginationBuilder } from '../../common/dto/pagination/pagination-builder.dto';
import { BreederSearchRequestDto } from './dto/request/breeder-search-request.dto';
import { BreederSearchResponseDto } from './dto/response/breeder-search-response.dto';
import { BreederProfileResponseDto } from './dto/response/breeder-profile-response.dto';
import { SearchBreedersUseCase } from './application/use-cases/search-breeders.use-case';
import { GetBreederProfileUseCase } from './application/use-cases/get-breeder-profile.use-case';
import { GetBreederReviewsUseCase } from './application/use-cases/get-breeder-reviews.use-case';
import { GetBreederPetsUseCase } from './application/use-cases/get-breeder-pets.use-case';
import { GetBreederPetDetailUseCase } from './application/use-cases/get-breeder-pet-detail.use-case';
import { GetBreederParentPetsUseCase } from './application/use-cases/get-breeder-parent-pets.use-case';
import { GetBreederApplicationFormUseCase } from './application/use-cases/get-breeder-application-form.use-case';

@Injectable()
export class BreederService {
    constructor(
        @InjectModel(Breeder.name) private breederModel: Model<BreederDocument>,
        @InjectModel(Adopter.name) private adopterModel: Model<AdopterDocument>,
        @InjectModel(BreederReview.name) private breederReviewModel: Model<BreederReviewDocument>,
        @InjectModel(ParentPet.name) private parentPetModel: Model<ParentPetDocument>,
        @InjectModel(AvailablePet.name) private availablePetModel: Model<AvailablePetDocument>,
        private readonly storageService: StorageService,
        private readonly searchBreedersUseCase: SearchBreedersUseCase,
        private readonly getBreederProfileUseCase: GetBreederProfileUseCase,
        private readonly getBreederReviewsUseCase: GetBreederReviewsUseCase,
        private readonly getBreederPetsUseCase: GetBreederPetsUseCase,
        private readonly getBreederPetDetailUseCase: GetBreederPetDetailUseCase,
        private readonly getBreederParentPetsUseCase: GetBreederParentPetsUseCase,
        private readonly getBreederApplicationFormUseCase: GetBreederApplicationFormUseCase,
    ) {}

    async searchBreeders(searchDto: BreederSearchRequestDto): Promise<BreederSearchResponseDto> {
        return this.searchBreedersUseCase.execute(searchDto);
    }

    async getBreederProfile(breederId: string, userId?: string): Promise<BreederProfileResponseDto> {
        return this.getBreederProfileUseCase.execute(breederId, userId);
    }

    private transformToResponseDto(
        breeder: any,
        isFavorited: boolean = false,
        availablePets: any[] = [],
        parentPets: any[] = [],
    ): any {
        // 프로필 이미지 signed URL 생성 (User 스키마의 profileImageFileName 사용)
        const profileImageUrl = breeder.profileImageFileName
            ? this.storageService.generateSignedUrl(breeder.profileImageFileName, 60 * 24)
            : undefined;

        // 대표 사진들 signed URL 생성
        const representativePhotoUrls = (breeder.profile?.representativePhotos || []).map((photo: string) =>
            this.storageService.generateSignedUrl(photo, 60 * 24),
        );

        return {
            breederId: breeder._id.toString(),
            breederName: breeder.name,
            breederEmail: breeder.emailAddress,
            authProvider: breeder.socialAuthInfo?.authProvider || 'local',
            breederLevel: breeder.verification?.level || 'new',
            petType: breeder.petType || 'dog',
            detailBreed: breeder.detailBreed,
            breeds: breeder.breeds || [],
            location: breeder.profile?.location
                ? `${breeder.profile.location.city} ${breeder.profile.location.district}`
                : '',
            priceRange: (() => {
                const profilePrice = breeder.profile?.priceRange || { min: 0, max: 0, display: 'not_set' };

                // display 값 결정: 명시적으로 설정된 값이 있으면 사용, 없으면 값에 따라 자동 결정
                let finalDisplay: string;
                if (profilePrice.display) {
                    finalDisplay = profilePrice.display;
                } else {
                    // display가 없는 경우 (마이그레이션 전 데이터) 값에 따라 자동 결정
                    if (profilePrice.min > 0 || profilePrice.max > 0) {
                        finalDisplay = 'range';
                    } else {
                        finalDisplay = 'not_set';
                    }
                }

                return {
                    min: profilePrice.min,
                    max: profilePrice.max,
                    display: finalDisplay as PriceDisplayType,
                };
            })(),
            profileImage: profileImageUrl,
            favoriteCount: breeder.stats?.totalFavorites || 0,
            isFavorited: isFavorited,
            description: breeder.profile?.description || '',
            representativePhotos: representativePhotoUrls,
            availablePets: availablePets.map((pet: any) => {
                const petPhotos = (pet.photos || []).map((photo: string) =>
                    this.storageService.generateSignedUrl(photo, 60 * 24),
                );

                // 부모 정보 변환
                const parents: any[] = [];
                if (pet.parentInfo?.mother) {
                    const mother = pet.parentInfo.mother;
                    const motherPhotos = (mother.photos || []).map((photo: string) =>
                        this.storageService.generateSignedUrl(photo, 60 * 24),
                    );
                    // avatarUrl: photos 배열 우선, 없으면 photoFileName 사용
                    const motherAvatarUrl =
                        motherPhotos[0] ||
                        (mother.photoFileName
                            ? this.storageService.generateSignedUrl(mother.photoFileName, 60 * 24)
                            : '');
                    parents.push({
                        id: mother._id.toString(),
                        avatarUrl: motherAvatarUrl,
                        name: mother.name,
                        sex: mother.gender,
                        birth: this.formatBirthDateToKorean(mother.birthDate),
                        breed: mother.breed,
                        photos: motherPhotos,
                    });
                }
                if (pet.parentInfo?.father) {
                    const father = pet.parentInfo.father;
                    const fatherPhotos = (father.photos || []).map((photo: string) =>
                        this.storageService.generateSignedUrl(photo, 60 * 24),
                    );
                    // avatarUrl: photos 배열 우선, 없으면 photoFileName 사용
                    const fatherAvatarUrl =
                        fatherPhotos[0] ||
                        (father.photoFileName
                            ? this.storageService.generateSignedUrl(father.photoFileName, 60 * 24)
                            : '');
                    parents.push({
                        id: father._id.toString(),
                        avatarUrl: fatherAvatarUrl,
                        name: father.name,
                        sex: father.gender,
                        birth: this.formatBirthDateToKorean(father.birthDate),
                        breed: father.breed,
                        photos: fatherPhotos,
                    });
                }

                return {
                    petId: pet._id.toString(),
                    name: pet.name,
                    breed: pet.breed,
                    gender: pet.gender,
                    birthDate: pet.birthDate,
                    price: pet.price,
                    status: pet.status,
                    description: pet.description || '',
                    photo: petPhotos[0] || '',
                    photos: petPhotos,
                    parents, // 부모 정보 추가
                };
            }),
            parentPets: parentPets.map((pet: any) => {
                const petPhotos = (pet.photos || []).map((photo: string) =>
                    this.storageService.generateSignedUrl(photo, 60 * 24),
                );
                return {
                    petId: pet._id.toString(),
                    name: pet.name,
                    breed: pet.breed,
                    gender: pet.gender,
                    birthDate: pet.birthDate,
                    photo: petPhotos[0] || '',
                    photos: petPhotos,
                };
            }),
            reviews: (breeder.reviews?.filter((review: any) => review.isVisible) || [])
                .slice(-5)
                .map((review: any) => ({
                    reviewId: review.reviewId,
                    writtenAt: review.writtenAt,
                    type: review.type,
                    adopterName: review.adopterName,
                    rating: review.rating,
                    content: review.content,
                    photo: review.photos?.[0] || undefined, // 첫 번째 사진만
                })),
            reviewStats: {
                totalReviews: breeder.stats?.totalReviews || 0,
                averageRating: breeder.stats?.averageRating || 0,
            },
            createdAt: breeder.createdAt,
        };
    }

    private calculateBirthDateFromAge(age: number): Date {
        const now = new Date();
        return new Date(now.getFullYear() - age, now.getMonth(), now.getDate());
    }

    private formatBirthDateToKorean(date: Date | string | undefined): string {
        if (!date) return '';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');

        return `${year}년 ${month}월 ${day}일 생`;
    }

    /**
     * 브리더 후기 목록 조회 (페이지네이션)
     *
     * @param breederId 브리더 ID
     * @param page 페이지 번호
     * @param limit 페이지당 항목 수
     * @returns 페이지네이션된 후기 목록
     */
    /**
     * 브리더 후기 목록 조회 (참조 방식으로 재설계)
     *
     * 변경사항:
     * - BreederReview 컬렉션에서 직접 조회 (임베디드 제거)
     * - populate로 입양자 정보 자동 조회
     * - 페이지네이션 및 최신순 정렬
     *
     * @param breederId 브리더 ID
     * @param page 페이지 번호
     * @param limit 페이지당 항목 수
     * @returns 후기 목록과 페이지네이션 정보
     */
    async getBreederReviews(breederId: string, page: number = 1, limit: number = 10): Promise<any> {
        return this.getBreederReviewsUseCase.execute(breederId, page, limit);
    }

    /**
     * 개체 상세 정보 조회
     *
     * @param breederId 브리더 ID
     * @param petId 개체 ID
     * @returns 개체 상세 정보
     */
    async getPetDetail(breederId: string, petId: string): Promise<any> {
        return this.getBreederPetDetailUseCase.execute(breederId, petId);
    }

    /**
     * 부모견/부모묘 목록 조회
     *
     * 특정 브리더의 활성화된 부모견/부모묘 목록을 조회합니다.
     * ParentPet은 별도 컬렉션으로 관리되며, 사진은 Signed URL로 변환합니다.
     *
     * @param breederId 브리더 ID
     * @param page 페이지 번호 (기본값: 1)
     * @param limit 페이지당 개수 (기본값: 전체)
     * @returns 부모견/부모묘 목록
     * @throws BadRequestException 존재하지 않는 브리더
     */
    async getParentPets(breederId: string, page?: number, limit?: number): Promise<any> {
        return this.getBreederParentPetsUseCase.execute(breederId, page, limit);
    }

    /**
     * 브리더 개체 목록 조회 (필터링)
     *
     * @param breederId 브리더 ID
     * @param status 상태 필터 (available, reserved, adopted)
     * @param page 페이지 번호
     * @param limit 페이지당 항목 수
     * @returns 페이지네이션된 개체 목록
     */
    async getBreederPets(breederId: string, status?: string, page: number = 1, limit: number = 20): Promise<any> {
        return this.getBreederPetsUseCase.execute(breederId, status, page, limit);
    }

    /**
     * 표준 입양 신청 폼 질문 13개 (Figma 디자인 기반 - 수정 불가)
     *
     * 모든 브리더에게 자동으로 포함되는 필수 질문들입니다.
     */
    private getStandardQuestions() {
        return [
            {
                id: 'privacyConsent',
                type: 'checkbox',
                label: '개인정보 수집 및 이용에 동의하시나요?',
                required: true,
                order: 1,
                isStandard: true,
            },
            {
                id: 'selfIntroduction',
                type: 'textarea',
                label: '간단하게 자기소개 부탁드려요 (성별, 연령대, 거주지, 생활 패턴 등)',
                required: true,
                order: 2,
                isStandard: true,
            },
            {
                id: 'familyMembers',
                type: 'text',
                label: '함께 거주하는 가족 구성원을 알려주세요',
                required: true,
                order: 3,
                isStandard: true,
            },
            {
                id: 'allFamilyConsent',
                type: 'checkbox',
                label: '모든 가족 구성원들이 입양에 동의하셨나요?',
                required: true,
                order: 4,
                isStandard: true,
            },
            {
                id: 'allergyTestInfo',
                type: 'text',
                label: '본인을 포함한 모든 가족 구성원분들께서 알러지 검사를 마치셨나요?',
                required: true,
                order: 5,
                isStandard: true,
            },
            {
                id: 'timeAwayFromHome',
                type: 'text',
                label: '평균적으로 집을 비우는 시간은 얼마나 되나요?',
                required: true,
                order: 6,
                isStandard: true,
            },
            {
                id: 'livingSpaceDescription',
                type: 'textarea',
                label: '아이와 함께 지내게 될 공간을 소개해 주세요',
                required: true,
                order: 7,
                isStandard: true,
            },
            {
                id: 'previousPetExperience',
                type: 'textarea',
                label: '현재 함께하는, 또는 이전에 함께했던 반려동물에 대해 알려주세요',
                required: true,
                order: 8,
                isStandard: true,
            },
            {
                id: 'canProvideBasicCare',
                type: 'checkbox',
                label: '정기 예방접종·건강검진·훈련 등 기본 케어를 책임지고 해주실 수 있나요?',
                required: true,
                order: 9,
                isStandard: true,
            },
            {
                id: 'canAffordMedicalExpenses',
                type: 'checkbox',
                label: '예상치 못한 질병이나 사고 등으로 치료비가 발생할 경우 감당 가능하신가요?',
                required: true,
                order: 10,
                isStandard: true,
            },
            {
                id: 'preferredPetDescription',
                type: 'textarea',
                label: '마음에 두신 아이가 있으신가요? (특징: 성별, 타입, 외모, 컬러패턴, 성격 등)',
                required: false,
                order: 11,
                isStandard: true,
            },
            {
                id: 'desiredAdoptionTiming',
                type: 'text',
                label: '원하시는 입양 시기가 있나요?',
                required: false,
                order: 12,
                isStandard: true,
            },
            {
                id: 'additionalNotes',
                type: 'textarea',
                label: '마지막으로 궁금하신 점이나 남기시고 싶으신 말씀이 있나요?',
                required: false,
                order: 13,
                isStandard: true,
            },
        ];
    }

    /**
     * 입양 신청 폼 조회 (표준 + 커스텀 질문) - 공개 API
     *
     * 입양자가 특정 브리더의 입양 신청 폼 구조를 조회합니다.
     * 표준 13개 질문은 자동으로 포함되며, 브리더가 추가한 커스텀 질문도 함께 반환합니다.
     *
     * @param breederId 브리더 ID
     * @returns 전체 폼 구조 (표준 + 커스텀 질문)
     */
    async getApplicationForm(breederId: string): Promise<any> {
        return this.getBreederApplicationFormUseCase.execute(breederId);
    }
}
