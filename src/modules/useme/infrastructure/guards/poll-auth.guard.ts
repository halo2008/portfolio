import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { timingSafeEqual } from 'crypto';

@Injectable()
export class PollAuthGuard implements CanActivate {
  private readonly logger = new Logger(PollAuthGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Option 1: Cloud Scheduler sends OIDC token as Bearer
    const authHeader = request.headers['authorization'];
    if (authHeader?.startsWith('Bearer ')) {
      // Cloud Scheduler OIDC token - Cloud Run verifies it automatically
      // when the scheduler SA has roles/run.invoker
      this.logger.log('Poll authenticated via OIDC (Cloud Scheduler)');
      return true;
    }

    // Option 2: Manual trigger with custom poll token
    const token = request.headers['x-poll-token'];
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

    this.logger.log('Poll authenticated via custom token');
    return true;
  }
}
