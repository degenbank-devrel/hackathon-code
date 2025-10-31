import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { PrivyService } from '../features/privy/privy.service';

@Injectable()
export class PrivyGuard implements CanActivate {
  constructor(private privyService: PrivyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return false;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return false;
    }

    try {
      const user = await this.privyService.verifyAccessToken(token);
      request.user = user;
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
