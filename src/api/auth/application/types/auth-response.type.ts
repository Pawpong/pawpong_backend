export type SocialCheckUserResult =
    | {
          exists: false;
      }
    | {
          exists: true;
          userRole: string;
          userId: string;
          email: string;
          nickname: string;
          profileImageFileName?: string;
      };

export type PhoneVerificationResult = {
    success: boolean;
    message: string;
};

export type LogoutResult = {
    success: boolean;
    loggedOutAt: string;
    message: string;
};

export type UploadedVerificationDocumentResult = {
    type: string;
    url: string;
    filename: string;
    size: number;
    uploadedAt: Date;
};

export type VerificationDocumentsResult = {
    uploadedDocuments: UploadedVerificationDocumentResult[];
    allDocuments: UploadedVerificationDocumentResult[];
};

export type AuthenticatedUserResult = {
    userId: string;
    emailAddress: string;
    nickname: string;
    userRole: string;
    accountStatus: string;
    profileImageFileName?: string;
};

export type AuthResult = {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresIn: number;
    refreshTokenExpiresIn: number;
    userInfo: AuthenticatedUserResult;
    message: string;
};
