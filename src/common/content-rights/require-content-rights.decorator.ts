import { SetMetadata } from '@nestjs/common';

export const CONTENT_RIGHTS_REQUIRED = 'contentRightsRequired';
export const RequireContentRights = () => SetMetadata(CONTENT_RIGHTS_REQUIRED, true);
