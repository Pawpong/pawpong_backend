import { Injectable } from '@nestjs/common';

export const INQUIRY_RESPONSE_MESSAGE_EXAMPLES = {
    inquiryListRetrieved: '문의 목록이 조회되었습니다.',
    inquiryDetailRetrieved: '문의 상세가 조회되었습니다.',
    myInquiriesRetrieved: '내 질문 목록이 조회되었습니다.',
    breederInquiriesRetrieved: '브리더 문의 목록이 조회되었습니다.',
    inquiryCreated: '문의가 작성되었습니다.',
    inquiryUpdated: '문의가 수정되었습니다.',
    inquiryDeleted: '문의가 삭제되었습니다.',
    inquiryAnswerCreated: '답변이 작성되었습니다.',
} as const;

@Injectable()
export class InquiryResponseMessageService {
    inquiryListRetrieved(): string {
        return INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryListRetrieved;
    }

    inquiryDetailRetrieved(): string {
        return INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryDetailRetrieved;
    }

    myInquiriesRetrieved(): string {
        return INQUIRY_RESPONSE_MESSAGE_EXAMPLES.myInquiriesRetrieved;
    }

    breederInquiriesRetrieved(): string {
        return INQUIRY_RESPONSE_MESSAGE_EXAMPLES.breederInquiriesRetrieved;
    }

    inquiryCreated(): string {
        return INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryCreated;
    }

    inquiryUpdated(): string {
        return INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryUpdated;
    }

    inquiryDeleted(): string {
        return INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryDeleted;
    }

    inquiryAnswerCreated(): string {
        return INQUIRY_RESPONSE_MESSAGE_EXAMPLES.inquiryAnswerCreated;
    }
}
