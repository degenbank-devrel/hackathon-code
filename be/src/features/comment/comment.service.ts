import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import type { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';
import { Battle } from 'src/models/battle.model';
import { Comment } from 'src/models/comment.model';
import { Vault } from 'src/models/vault.model';
import { VaultAnalytic } from 'src/models/vaultanalytics.model';

interface Manager {
  name: string;
  apy: string;
  totalDeposit: string;
  currentPosition: string;
}

@Injectable()
export class CommentService {
  private readonly deepSeekApiUrl: string;
  private readonly deepSeekApiKey: string;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectModel(Battle) private readonly battleModel: typeof Battle,
    @InjectModel(Vault) private readonly vaultModel: typeof Vault,
    @InjectModel(Comment) private readonly commentModel: typeof Comment,
    @InjectModel(VaultAnalytic)
    private readonly vaultAnalyticModel: typeof VaultAnalytic,
  ) {
    this.deepSeekApiUrl =
      this.configService.get<string>('DEEPSEEK_API_URL') || '';
    this.deepSeekApiKey =
      this.configService.get<string>('DEEPSEEK_API_KEY') || '';
  }
  async getCommentsByBattleId(battleId: number): Promise<Comment[]> {
    return await this.cacheManager.wrap(`comments_${battleId}`, () =>
      this.commentModel.findAll({
        where: {
          battle_id: battleId,
        },
        order: [['comment_at', 'DESC']],
      }),
    );
  }

  async generateComment(managers: Manager[]): Promise<string> {
    const managersList = managers
      .map(
        (m) =>
          `${m.name} (APY: ${m.apy}, Total Deposit: ${m.totalDeposit}, Current Position: ${m.currentPosition})`,
      )
      .join(', ');
    const prompt = `Analyze the competition between investment managers: ${managersList}. Provide a detailed commentary focusing on:
    1. Each manager's strategy and performance metrics (APY, total deposits, current positions)
    2. Key performance indicators and competitive positioning
    3. Insights on their relative strengths and weaknesses
    4. Any notable trends or turning points in their performance
    Maintain a professional, analytical tone and use appropriate financial terminology. Maximum 500 characters.`;
    const systemMessage = {
      role: 'system',
      content: `You are a financial analyst specializing in investment manager performance analysis. Your task is to provide comprehensive commentary on the competition between these managers. Focus on:
      - Detailed performance metrics and strategy analysis
      - Comparative evaluation of each manager's position
      - Identification of key performance indicators
      - Insights into competitive positioning and market trends
      - Use of professional financial terminology
      - Neutral, objective analysis without bias or speculation`,
    };

    const response = await firstValueFrom(
      this.httpService.post(
        this.deepSeekApiUrl,
        {
          model: 'deepseek-chat',
          messages: [systemMessage, { role: 'user', content: prompt }],
          stream: false,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.deepSeekApiKey}`,
          },
        },
      ),
    );

    return response.data.choices[0].message.content;
  }

  @Cron('*/30 * * * *')
  async analyzeVault() {
    const today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);

    const ongoingBattles = await this.battleModel.findAll({
      where: {
        status: 'ongoing_battle',
      },
      include: [Vault],
    });

    await Promise.all(
      ongoingBattles.map(async (battleData) => {
        const battle = battleData.toJSON();

        const vaultApy = await this.vaultAnalyticModel.findAll({
          include: [
            {
              model: Vault,
              where: {
                battle_id: battle.battle_id,
              },
            },
          ],
          where: {
            va_date: today,
          },
        });

        const managers: Manager[] = vaultApy.map((vaData) => {
          const va = vaData.toJSON();

          return {
            name: va.vault.vault_name,
            apy: va.total_roi.toString(),
            totalDeposit: va.total_deposit.toString(),
            currentPosition: va.share_price.toString(),
          };
        });

        const generatedComment = await this.generateComment(managers);

        await this.commentModel.create({
          battle_id: battle.battle_id,
          commentator: 'System',
          comment: generatedComment,
          comment_at: new Date(),
        });
      }),
    );
  }
}
