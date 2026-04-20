export type InquiryLatestAnswerResult = {
    breederName: string;
    answeredAt: string;
    content: string;
    profileImageUrl?: string;
};

export type InquiryListItemResult = {
    id: string;
    title: string;
    content: string;
    type: 'common' | 'direct';
    animalType: 'dog' | 'cat';
    viewCount: number;
    answerCount: number;
    latestAnswer?: InquiryLatestAnswerResult;
    createdAt: string;
};

export type InquiryListResult = {
    data: InquiryListItemResult[];
    hasMore: boolean;
};

export type InquiryAnswerResult = {
    id: string;
    breederName: string;
    answeredAt: string;
    content: string;
    profileImageUrl?: string;
    imageUrls: string[];
    helpfulCount: number;
    animalTypeName?: string;
    breed?: string;
};

export type InquiryDetailResult = {
    id: string;
    title: string;
    content: string;
    type: 'common' | 'direct';
    animalType: 'dog' | 'cat';
    viewCount: number;
    answerCount: number;
    createdAt: string;
    authorNickname: string;
    imageUrls: string[];
    answers: InquiryAnswerResult[];
    currentUserHasAnswered: boolean;
};
