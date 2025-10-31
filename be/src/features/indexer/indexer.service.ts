import { InjectQueue } from '@nestjs/bullmq';
import { InjectModel } from '@nestjs/sequelize';
import { Queue } from 'bullmq';
import { WebhookTx } from 'src/models/webhooktxs.model';
import { Price } from 'src/models/price.model';
import { Token } from 'src/models/token.model';
import { Cron } from '@nestjs/schedule';
import { Vault } from 'src/models/vault.model';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RaydiumPriceResponse } from 'src/type/raydium.type';
import { Injectable } from '@nestjs/common';
@Injectable()
export class IndexerService {
  private raydiumBaseUrl: string;
  private network: string;
  constructor(
    @InjectQueue('new-txs') private readonly newTxs: Queue,
    @InjectModel(Vault)
    private readonly vaultModel: typeof Vault,
    @InjectModel(WebhookTx) private readonly webHookModel: typeof WebhookTx,
    @InjectModel(Price) private readonly priceModel: typeof Price,
    @InjectModel(Token) private readonly tokenModel: typeof Token,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.raydiumBaseUrl =
      this.configService.get<string>('RAYDIUM_API_BASE_URL') || '';
    this.network = this.configService.get<string>('NETWORK') || 'devnet';
  }

  async saveNewTx(rawData: any[]) {
    const transactions = await Promise.all(
      rawData.map(async (tx) => {
        const signature = tx.signature as string;
        const data = tx;
        const timestampRaw = tx.timestamp as number;

        const newTx = await this.webHookModel.create({
          tx_id: signature,
          data: data,
          timestamp: new Date(timestampRaw * 1000),
          is_processed: false,
        });

        await this.newTxs.add('process-tx', {
          txId: newTx.tx_id,
          txData: newTx,
        });

        return newTx;
      }),
    );
    return transactions;
  }

  @Cron('*/5 * * * *')
  async fetchAndSavePrices() {
    const tokens = await this.tokenModel.findAll({
      where: {
        network: this.network,
      },
    });

    const mintKeys = tokens.map((token) => token.toJSON().token_mint);
    const minKeyString = mintKeys.join(',');

    const priceResponse = await firstValueFrom(
      this.httpService.get(
        `${this.raydiumBaseUrl}/mint/price?mints=${minKeyString}`,
      ),
    );

    const priceData: RaydiumPriceResponse =
      priceResponse.data as RaydiumPriceResponse;

    const priceUpdates = await Promise.all(
      tokens.map(async (token) => {
        const tokenMint = token.toJSON().token_mint;
        const tokenId = token.toJSON().token_id;
        const price = priceData.data[tokenMint];
        console.log(
          `Updating price for token ${tokenId} (${tokenMint}): ${price} USD`,
        );
        if (price) {
          const numericPrice = Number(price).toFixed(10);

          const today = new Date();
          today.setHours(0);
          today.setMinutes(0);
          today.setSeconds(0);
          today.setMilliseconds(0);
          let updatedPrice = await this.priceModel.findOne({
            where: {
              token_id: tokenId,
              fetch_date: today,
              network: this.network,
            },
          });

          if (updatedPrice) {
            await updatedPrice.update({
              price: String(numericPrice),
              currency: 'USD',
            });
          } else {
            updatedPrice = await this.priceModel.create({
              token_id: tokenId,
              fetch_date: today,
              network: this.network,
              price: String(numericPrice),
              currency: 'USD',
            });
          }
          return updatedPrice;
        }
        return null;
      }),
    );

    return priceUpdates.filter((price) => price !== null);
  }

  @Cron('*/10 * * * *')
  async processUnprocessedTransactions() {
    try {
      const unprocessedTxs = await this.webHookModel.findAll({
        where: {
          is_processed: false,
        },
      });

      for (const tx of unprocessedTxs) {
        await this.newTxs.add('process-tx', { txId: tx.tx_id, txData: tx });
      }

      return unprocessedTxs.map((tx) => tx.tx_id);
    } catch (error) {
      console.error('Error processing unprocessed transactions:', error);
    }

    return null;
  }

  // @Cron('*/5 * * * *')
  async balanceVaults() {
    const vaults = await this.vaultModel.findAll({});

    const balanceTasks = await Promise.all(
      vaults.map(async (vault) => {
        await this.newTxs.add('vault-balance', {
          vault_id: vault.vault_id,
          data: vault,
        });
      }),
    );

    return balanceTasks;
  }

  @Cron('*/12 * * * *')
  async analyzeVault() {
    const vaults = await this.vaultModel.findAll({});

    const balanceTasks = await Promise.all(
      vaults.map(async (vault) => {
        await this.newTxs.add('vault-analyze', {
          vault_id: vault.vault_id,
          data: vault,
        });
      }),
    );

    return balanceTasks;
  }
}
