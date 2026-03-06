import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { timingSafeEqual } from 'crypto';

@Injectable()
export class PollAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['x-poll-token'] || request.query?.token;
    const expected = process.env.USEME_POLL_TOKEN;

    if (!expected) {
      throw new UnauthorizedException('USEME_POLL_TOKEN not configured');
    }

    if (!token || typeof token !== 'string') {
      throw new UnauthorizedException('Missing poll token');
    }

    const tokenBuf = Buffer.from(token);
    const expectedBuf = Buffer.from(expected);

    if (tokenBuf.length !== expectedBuf.length || !timingSafeEqual(tokenBuf, expectedBuf)) {
      throw new UnauthorizedException('Invalid poll token');
    }

    return true;
  }
}
