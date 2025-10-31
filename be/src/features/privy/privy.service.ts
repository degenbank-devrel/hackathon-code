import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrivyClient } from '@privy-io/node';

@Injectable()
export class PrivyService {
  private privyClient: PrivyClient;

  constructor(private configService: ConfigService) {
    const appId = this.configService.get<string>('PRIVY_APP_ID');
    const secret = this.configService.get<string>('PRIVY_SECRET');

    this.privyClient = new PrivyClient({
      appId: appId || '',
      appSecret: secret || '',
    });
  }

  async verifyAccessToken(accessToken: string): Promise<any> {
    try {
      const response = await this.privyClient
        .utils()
        .auth()
        .verifyAuthToken(accessToken);
      return {
        user_id: response.user_id,
      };
    } catch (error) {
      console.error('Error verifying access token:', error);
      throw new UnauthorizedException('Failed to verify access token');
    }
  }
}
