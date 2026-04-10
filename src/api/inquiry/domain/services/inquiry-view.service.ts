import { BadRequestException, Injectable } from '@nestjs/common';

import type {
    InquiryAnswerResult,
    InquiryDetailResult,
    InquiryLatestAnswerResult,
    InquiryListItemResult,
    InquiryListResult,
} from '../../application/types/inquiry-result.type';
import { InquiryListSnapshot } from '../../application/ports/inquiry-reader.port';

type SignedUrlGenerator = (fileName: string, expirationMinutes?: number) => string;

@Injectable()
export class InquiryViewService {
    buildListResponse(
        inquiries: InquiryListSnapshot[],
        limit: number,
        generateSignedUrl: SignedUrlGenerator,
    ): InquiryListResult {
        const hasMore = inquiries.length > limit;
        const pagedItems = hasMore ? inquiries.slice(0, limit) : inquiries;
        const data = pagedItems.map((inquiry) => this.toListItem(inquiry, generateSignedUrl));

        return { data, hasMore };
    }

    buildDetailResponse(
        inquiry: InquiryListSnapshot,
        userId: string | undefined,
        generateSignedUrl: SignedUrlGenerator,
    ): InquiryDetailResult {
        const answers: InquiryAnswerResult[] = inquiry.answers.map((answer) => ({
            id: answer.id,
            breederName: answer.breederName,
            answeredAt: this.formatDetailDate(answer.answeredAt),
            content: answer.content,
            profileImageUrl: answer.profileImageUrl ? generateSignedUrl(answer.profileImageUrl, 60) : undefined,
            imageUrls: answer.imageUrls
                .filter((url) => url && url.trim() !== '')
                .map((url) => generateSignedUrl(url, 60)),
            helpfulCount: answer.helpfulCount ?? 0,
            animalTypeName: answer.animalTypeName,
            breed: answer.breed,
        }));

        const imageUrls = inquiry.imageUrls
            .filter((url) => url && url.trim() !== '')
            .map((url) => generateSignedUrl(url, 60));

        const currentUserHasAnswered = userId
            ? inquiry.answers.some((answer) => answer.breederId === userId)
            : false;

        return {
            id: inquiry.id,
            title: inquiry.title,
            content: inquiry.content,
            type: inquiry.type,
            animalType: inquiry.animalType,
            viewCount: inquiry.viewCount + 1,
            answerCount: inquiry.answers.length,
            createdAt: this.formatDetailDate(inquiry.createdAt),
            authorNickname: inquiry.authorNickname,
            imageUrls,
            answers,
            currentUserHasAnswered,
        };
    }

    ensureReadableByUser(inquiry: InquiryListSnapshot, userId?: string): void {
        if (inquiry.type !== 'direct') {
            return;
        }

        if (userId !== inquiry.authorId && userId !== inquiry.targetBreederId) {
            throw new BadRequestException('해당 문의에 대한 열람 권한이 없습니다.');
        }
    }

    private toListItem(inquiry: InquiryListSnapshot, generateSignedUrl: SignedUrlGenerator): InquiryListItemResult {
        let latestAnswer: InquiryLatestAnswerResult | undefined;

        if (inquiry.answers.length > 0) {
            const latest = inquiry.answers[inquiry.answers.length - 1];
            latestAnswer = {
                breederName: latest.breederName,
                answeredAt: this.formatAnsweredAt(latest.answeredAt),
                content: latest.content,
                profileImageUrl: latest.profileImageUrl ? generateSignedUrl(latest.profileImageUrl, 60) : undefined,
            };
        }

        return {
            id: inquiry.id,
            title: inquiry.title,
            content: inquiry.content,
            type: inquiry.type,
            animalType: inquiry.animalType,
            viewCount: inquiry.viewCount,
            answerCount: inquiry.answers.length,
            latestAnswer,
            createdAt: this.formatDate(inquiry.createdAt),
        };
    }

    private formatDate(date: Date): string {
        const value = new Date(date);
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, '0');
        const day = String(value.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    private formatDetailDate(date: Date): string {
        const value = new Date(date);
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, '0');
        const day = String(value.getDate()).padStart(2, '0');

        return `${year}. ${month}. ${day}.`;
    }

    private formatAnsweredAt(date: Date): string {
        return this.formatDetailDate(date);
    }
}
