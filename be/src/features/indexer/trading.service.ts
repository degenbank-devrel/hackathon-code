import { Injectable } from '@nestjs/common';
import { BankService } from './degenbank.service';
import { InjectModel } from '@nestjs/sequelize';
import { Vault } from 'src/models/vault.model';
import { Cron } from '@nestjs/schedule';
import { PublicKey } from '@solana/web3.js';
import { Battle } from 'src/models/battle.model';

@Injectable()
export class TradingService {
  constructor(
    private readonly bankService: BankService,
    @InjectModel(Vault) private readonly vaultModel: typeof Vault,
  ) {}

  @Cron('*/10 * * * *')
  async distributeInterest() {
    const vaults = await this.vaultModel.findAll({
      include: [
        {
          model: Battle,
          where: {
            status: 'ongoing_battle',
          },
        },
      ],
      where: {
        battle_status: 'active',
      },
    });

    for (const vault of vaults) {
      const vaultJSON = vault.toJSON();
      const depositToken = vaultJSON.token_address;
      const vaultDepositTokenAddress = vaultJSON.vault_token_address;
      const vaultTokenMint = vaultJSON.vault_token_mint;
      const vaultSupply =
        await this.bankService.getSplTotalSupply(vaultTokenMint);
      const supplyAmount = vaultSupply?.uiAmount || 0;

      const interestAmount = Math.random() * 100 + 1;

      await this.bankService.sendInterestToken(
        new PublicKey(vaultDepositTokenAddress),
        Number((interestAmount * 10 ** 4).toFixed(0)),
        new PublicKey(depositToken),
      );

      if (supplyAmount > 0) {
        await this.vaultModel.sequelize?.query(`
            UPDATE user_vault_positions
            SET current_value = current_value + (vault_shares * ${interestAmount} / ${supplyAmount}),
                updated_at = NOW()
            WHERE vault_id = '${vaultJSON.vault_id}'
          `);
      }
    }
  }
}
