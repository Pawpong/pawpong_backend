export type InquiryCreateCommand = {
    title: string;
    content: string;
    type: 'common' | 'direct';
    animalType: 'dog' | 'cat';
    targetBreederId?: string;
    imageUrls?: string[];
};

export type InquiryUpdateCommand = {
    title?: string;
    content?: string;
    imageUrls?: string[];
};

export type InquiryAnswerCreateCommand = {
    content: string;
    imageUrls?: string[];
};
