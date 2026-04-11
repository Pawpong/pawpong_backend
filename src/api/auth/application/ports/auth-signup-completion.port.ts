import {
    type RegisterAdopterAuthSignupCommand,
    type RegisterAdopterAuthSignupResult,
    type RegisterBreederAuthSignupCommand,
    type RegisterBreederAuthSignupResult,
} from '../types/auth-signup.type';

export interface RegisterAdopterAuthSignupPort {
    execute(command: RegisterAdopterAuthSignupCommand): Promise<RegisterAdopterAuthSignupResult>;
}

export interface RegisterBreederAuthSignupPort {
    execute(command: RegisterBreederAuthSignupCommand): Promise<RegisterBreederAuthSignupResult>;
}
