import { Injectable } from '@nestjs/common';

import { AlimtalkAdminService } from '../../alimtalk-admin.service';
import { TemplateActionResponseDto } from '../../dto/response/template-action-response.dto';

@Injectable()
export class RefreshAlimtalkTemplateCacheUseCase {
    constructor(private readonly alimtalkAdminService: AlimtalkAdminService) {}

    execute(): Promise<TemplateActionResponseDto> {
        return this.alimtalkAdminService.refreshCache();
    }
}
