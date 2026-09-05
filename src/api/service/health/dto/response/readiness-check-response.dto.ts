import { ApiProperty } from '@nestjs/swagger';

import { HealthCheckResponseDto } from './health-check-response.dto';

class DatabaseReadinessResponseDto {
    @ApiProperty({ enum: ['healthy', 'unhealthy'], example: 'healthy' })
    status: 'healthy' | 'unhealthy';

    @ApiProperty({
        enum: ['disconnected', 'connected', 'connecting', 'disconnecting', 'uninitialized', 'unknown'],
        example: 'connected',
    })
    connectionState: string;

    @ApiProperty({ description: 'MongoDB ping 왕복 시간(ms)', example: 12 })
    latencyMs: number;
}

class ReadinessDependenciesResponseDto {
    @ApiProperty({ type: () => DatabaseReadinessResponseDto })
    database: DatabaseReadinessResponseDto;
}

export class ReadinessCheckResponseDto extends HealthCheckResponseDto {
    @ApiProperty({ enum: ['healthy', 'unhealthy'], example: 'healthy' })
    declare status: 'healthy' | 'unhealthy';

    @ApiProperty({ type: () => ReadinessDependenciesResponseDto })
    dependencies: ReadinessDependenciesResponseDto;
}
