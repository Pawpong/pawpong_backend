import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

import { USER_ADMIN_MANAGED_ROLE_VALUES } from '../../constants/user-admin-swagger.constants';

export class ManagedUserRoleQueryRequestDto {
    @ApiProperty({
        description: '대상 사용자 역할',
        enum: USER_ADMIN_MANAGED_ROLE_VALUES,
        example: 'adopter',
    })
    @IsIn(USER_ADMIN_MANAGED_ROLE_VALUES)
    role: 'adopter' | 'breeder';
}
