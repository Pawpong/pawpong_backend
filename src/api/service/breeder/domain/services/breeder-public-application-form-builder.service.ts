import { Injectable } from '@nestjs/common';
import type { BreederPublicApplicationFormFieldRecord } from '../../application/ports/breeder-public-reader.port';

@Injectable()
export class BreederPublicApplicationFormBuilderService {
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

    build(customQuestionsSource: BreederPublicApplicationFormFieldRecord[]) {
        const standardQuestions = this.getStandardQuestions();
        const customQuestions = (customQuestionsSource || []).map((q, index: number) => ({
            id: q.id,
            type: q.type,
            label: q.label,
            required: q.required,
            options: q.options,
            placeholder: q.placeholder,
            order: standardQuestions.length + index + 1,
            isStandard: false,
        }));

        return {
            standardQuestions,
            customQuestions,
            totalQuestions: standardQuestions.length + customQuestions.length,
        };
    }
}
