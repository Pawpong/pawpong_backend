import type { Request } from 'express';
import { nativeAuthClientAddress } from '../../presentation/services/auth-native-client-address';

function req(socketAddress: string, forwardedFor?: string): Request {
    return {
        socket: { remoteAddress: socketAddress },
        headers: forwardedFor ? { 'x-forwarded-for': forwardedFor } : {},
    } as Request;
}

describe('native auth trusted proxy boundary', () => {
    it('ignores spoofed XFF sent directly to a public backend socket', () => {
        expect(nativeAuthClientAddress(req('203.0.113.7', '1.1.1.1'))).toBe('203.0.113.7');
    });
    it('stops at nginx-appended public sender instead of attacker-prepended XFF', () => {
        expect(nativeAuthClientAddress(req('172.18.0.2', '1.1.1.1, 198.51.100.8'))).toBe('198.51.100.8');
        expect(nativeAuthClientAddress(req('172.18.0.2', '8.8.8.8, 198.51.100.8'))).toBe('198.51.100.8');
    });
    it('supports loopback/IPv6/private proxy hops', () => {
        expect(nativeAuthClientAddress(req('::1', '198.51.100.8, 10.0.0.2'))).toBe('198.51.100.8');
    });
    it('groups an unknown public reverse proxy instead of trusting its upstream client claim', () => {
        expect(nativeAuthClientAddress(req('192.0.2.9', '198.51.100.8'))).toBe('192.0.2.9');
    });
    it('uses the actual socket when there is no forwarded address', () => {
        expect(nativeAuthClientAddress(req('127.0.0.1'))).toBe('127.0.0.1');
    });
});
