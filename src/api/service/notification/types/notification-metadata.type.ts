export type NotificationMetadataValue = string | number | boolean | null | undefined;

export type NotificationMetadata = {
    breederId?: string;
    breederName?: string;
    petId?: string;
    petName?: string;
    applicationId?: string;
    reviewId?: string;
    [key: string]: NotificationMetadataValue;
};
