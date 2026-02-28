import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CaptchaGuard implements CanActivate {
  constructor(private readonly httpService: HttpService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.body.captcha; // Explaining: Captcha token from frontend.

    if (!token && process.env.NODE_ENV === 'production') {
       throw new HttpException('Captcha missing', HttpStatus.FORBIDDEN);
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) return true; // Explaining: Skip in dev if no key.

    // Explaining: Verifying with Google API before allowing request to proceed.
    const { data } = await firstValueFrom(
      this.httpService.post(`https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`)
    );

    if (!data.success || data.score < 0.5) {
      throw new HttpException('Bot detected', HttpStatus.FORBIDDEN);
    }

    return true;
  }
}