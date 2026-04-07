import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type ActorType = 'Breeder' | 'Adopter';

export const CurrentActorType = createParamDecorator((_data: unknown, ctx: ExecutionContext): ActorType => {
    const request = ctx.switchToHttp().getRequest();
    const role = request.user?.role;

    return role === 'breeder' ? 'Breeder' : 'Adopter';
});
