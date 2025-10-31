import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Job, Queue } from 'bullmq';
import { WebhookTx } from 'src/models/webhooktxs.model';
import { HeliusTxData } from 'src/type/helius.type';
import { ConfigService } from '@nestjs/config';
import { BN, BorshCoder, Idl } from '@coral-xyz/anchor';
import idl from '../../idl/idl.json';
import { Vault } from 'src/models/vault.model';
import { Token } from 'src/models/token.model';
import { VaultBalance } from 'src/models/vaultbalance.model';
import { Battle } from 'src/models/battle.model';
import { UserTxHistory } from 'src/models/usertxhistory.model';
import { User } from 'src/models/user.model';
import { BankService } from './degenbank.service';
import { PublicKey } from '@solana/web3.js';
import { VaultAnalytic } from 'src/models/vaultanalytics.model';
import { Sequelize } from 'sequelize-typescript';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
@Injectable()
@Processor('new-txs', {
  concurrency: 5,
  limiter: {
    max: 100,
    duration: 300000,
  },
})
export class NewTxsProcessor extends WorkerHost {
  private readonly programId: string;
  private readonly coder: BorshCoder;

  constructor(
    @InjectQueue('new-txs') private readonly newTxs: Queue,
    @InjectModel(VaultBalance)
    private readonly vaultBalanceModel: typeof VaultBalance,
    @InjectModel(VaultAnalytic)
    private readonly vaultAnalyticModel: typeof VaultAnalytic,
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Vault) private readonly vaultModel: typeof Vault,
    @InjectModel(Battle) private readonly battleModel: typeof Battle,
    @InjectModel(Token) private readonly tokenModel: typeof Token,
    @InjectModel(WebhookTx) private readonly webHookModel: typeof WebhookTx,
    private eventEmitter: EventEmitter2,
    @InjectModel(UserTxHistory)
    private readonly userTxModel: typeof UserTxHistory,
    private readonly configService: ConfigService,
    private readonly bankService: BankService,
  ) {
    super();
    this.programId = this.configService.get<string>('PROGRAM_ID') || '';
    this.coder = new BorshCoder(idl as Idl);
  }
  async process(job: Job): Promise<any> {
    if (job.name === 'process-tx') {
      await this.processNewTxs(job.data);
    } else if (job.name === 'vault-balance') {
      await this.fetchVaultBalance(job.data);
    } else if (job.name === 'vault-analyze') {
      await this.analyzeVault(job.data);
    } else if (job.name === 'update-participant') {
      await this.updateParticipant(job.data);
    }
  }

  async analyzeVault(jobData: any) {
    const data = jobData.data;
    const vaultId: string = data.vault_id;
    const battleId: number = data.battle_id;
    console.log(
      `Processing vault analytics for vault ID: ${vaultId} and battle ID: ${battleId}`,
    );

    const totalDeposit = await this.bankService.getSplTotalSupply(
      new PublicKey(data.vault_token_mint),
    );
    console.log(`Total deposit amount: ${totalDeposit?.uiAmount || 0}`);

    const currentValue = await this.bankService.getSplTokenBalanceFromAccount(
      new PublicKey(data.vault_token_address),
    );

    const depositedAmount = totalDeposit?.uiAmount || 0;
    const currentAmount = currentValue?.uiAmount || 0;

    let roi = 0;
    let pricePerShare = 0;

    if (depositedAmount != 0 && currentAmount != 0) {
      roi = (currentAmount / depositedAmount) * 100;
      pricePerShare = currentAmount / depositedAmount;
    }

    const profit = currentAmount - depositedAmount;
    const apy = profit > 0 ? profit / 100 : 0;
    const tvl = currentAmount;

    const today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);

    const existingAnalytic = await this.vaultAnalyticModel.findOne({
      where: { vault_id: vaultId, va_date: today },
    });

    if (existingAnalytic) {
      await this.vaultAnalyticModel.update(
        {
          total_deposit: depositedAmount,
          share_price: pricePerShare,
          total_roi: roi,
        },
        {
          where: { va_id: existingAnalytic.toJSON().va_id, va_date: today },
        },
      );
    } else {
      await this.vaultAnalyticModel.create({
        vault_id: vaultId,
        va_date: today,
        total_deposit: depositedAmount,
        share_price: pricePerShare,
        total_roi: roi,
      });
    }

    try {
      await this.vaultModel.update(
        {
          tvl: tvl,
          apy: apy,
        },
        {
          where: { vault_id: vaultId },
        },
      );

      const vaults = await this.vaultModel.findAll({
        where: { battle_id: battleId },
      });

      const totalTvl = vaults.reduce((sum, vault) => {
        const vaultData = vault.toJSON();
        return sum + (vaultData.tvl || 0);
      }, 0);

      await this.battleModel.update(
        { total_tvl: totalTvl },
        { where: { battle_id: battleId } },
      );
    } catch (error) {
      console.log(error);
    }
  }

  async fetchVaultBalance(jobData: any) {
    const data = jobData.data;
    console.log(`Fetching vault record for vault ID: ${data.vault_id}`);
    const vaultQuery = await this.vaultModel.findOne({
      where: { vault_id: data.vault_id },
    });

    if (!vaultQuery) {
      console.error('Vault not found');
      return;
    }
    const vaultRecord = vaultQuery.toJSON();
    const depositToken = vaultRecord.deposit_asset || 'USDC';
    console.log(`Fetching token record for deposit token: ${depositToken}`);
    const depositTokenQuery = await this.tokenModel.findOne({
      where: { token_name: depositToken },
    });
    const depositTokenRecord = depositTokenQuery?.toJSON();
    const tokenId = depositTokenRecord?.token_id || '';
    console.log(`Token ID found: ${tokenId}`);
    const tokenMint = depositTokenRecord?.token_mint || '';
    console.log(`Token mint address found: ${tokenMint}`);
    const vaultTokenAddress = vaultRecord.vault_token_address || '';
    console.log(`Vault token address found: ${vaultTokenAddress}`);

    console.log(
      `Checking vault balance record for vault ID: ${data.vault_id} and token ID: ${tokenId}`,
    );

    const vaultBalance = await this.vaultBalanceModel.findOne({
      where: {
        vault_id: data.vault_id,
        token_id: tokenId,
      },
    });

    console.log(
      `Fetching SPL token balance for vault token address: ${vaultTokenAddress}`,
    );
    const balance = await this.bankService.getSplTokenBalanceFromAccount(
      new PublicKey(vaultTokenAddress),
    );

    if (balance) {
      if (vaultBalance) {
        console.log(
          `Updating existing vault balance record with ID: ${vaultBalance.toJSON().vault_balance_id}`,
        );
        await this.vaultBalanceModel.update(
          { balance: balance?.uiAmount || 0 },
          {
            where: { vault_balance_id: vaultBalance.toJSON().vault_balance_id },
          },
        );
      } else {
        console.log(
          `Creating new vault balance record for vault ID: ${data.vault_id}`,
        );
        const result = await this.vaultBalanceModel.create({
          vault_id: data.vault_id,
          token_id: tokenId,
          mint_address: tokenMint,
          token_address: vaultTokenAddress,
          balance: balance?.uiAmount || 0,
        });

        console.log(result);
      }
    }
  }

  async processNewTxs(data: any) {
    try {
      const input = data as { txId: string; txData: WebhookTx };
      const transaction: HeliusTxData = input.txData.data as HeliusTxData;
      const relevantInstructions = transaction.instructions.filter(
        (instruction) => instruction.programId === this.programId,
      );

      const transfers = transaction.tokenTransfers;

      if (relevantInstructions.length > 0) {
        const decodedInstruction = this.coder.instruction.decode(
          relevantInstructions[0].data,
          'base58',
        );
        console.log('INSTRUCTION');
        console.log(decodedInstruction);
        console.log(transaction.type);

        if (!decodedInstruction) {
          return;
        }

        if (decodedInstruction.name === 'initialize') {
          const initData = decodedInstruction.data as any;
          console.log(Number(initData.start_at));
          console.log(Number(initData.end_at));
        }

        if (decodedInstruction.name === 'close_vault') {
          const accounts = relevantInstructions[0].accounts as string[];
          const battle = accounts[0];
          const vault = accounts[1];
          const vault_winner = accounts[2];

          // Find the battle using the battle account address
          const [battleRecord, vaultRecord, winnerVaultRecord] =
            await Promise.all([
              this.battleModel.findOne({ where: { pda_address: battle } }),
              this.vaultModel.findOne({ where: { vault_address: vault } }),
              this.vaultModel.findOne({
                where: { vault_address: vault_winner },
              }),
            ]);

          if (!battleRecord || !vaultRecord || !winnerVaultRecord) {
            console.error('Battle, Vault, or Winner Vault not found');
            return;
          }

          // Update the battle status to completed
          await this.battleModel.update(
            {
              current_phase: 'completed',
              winner_vault_id: winnerVaultRecord.vault_id,
            },
            { where: { pda_address: battle } },
          );
          // Update the vault status to completed
          await this.vaultModel.update(
            { battle_status: 'completed' },
            { where: { vault_address: vault } },
          );
          // Update the winner vault status to winner
          await this.vaultModel.update(
            { battle_status: 'winner' },
            { where: { vault_address: vault_winner } },
          );
        } else if (decodedInstruction.name === 'deposit') {
          const depositTokenMint = transfers[0].mint;
          const tokenAmount = transfers[0].tokenAmount;
          const accounts = relevantInstructions[0].accounts as string[];
          const battle = accounts[0];
          const vault = accounts[1];
          const depositor = accounts[2];

          const depositSignature = transaction.signature;

          const [battleRecord, vaultRecord, tokenRecord, userRecord] =
            await Promise.all([
              this.battleModel.findOne({ where: { pda_address: battle } }),
              this.vaultModel.findOne({ where: { vault_address: vault } }),
              this.tokenModel.findOne({
                where: { token_mint: depositTokenMint },
              }),
              this.userModel.findOne({
                where: { wallet_address: depositor },
              }),
            ]);
          const vaultRecordJSON = vaultRecord?.toJSON();
          const userRecordJSON = userRecord?.toJSON();
          const battleRecordJSON = battleRecord?.toJSON();

          if (!battleRecord || !vaultRecord || !tokenRecord || !userRecord) {
            console.error('Battle, Vault, User, or Token not found');
            return;
          }

          const fee = transaction.fee;
          const txDate = transaction.timestamp * 1000;

          const userTxHistory = await this.userTxModel.findOne({
            where: {
              tx_id: depositSignature,
              vault_id: vaultRecordJSON?.vault_id,
              user_id:
                userRecordJSON?.user_id ||
                '7236655f-eab9-4881-aa65-85181b8b1cd9',
            },
          });

          if (!userTxHistory) {
            await this.userTxModel.create({
              tx_id: depositSignature,
              vault_id: vaultRecordJSON?.vault_id,
              user_id: userRecordJSON?.user_id,
              tx_type: 'deposit',
              fee: fee,
              amount: tokenAmount,
              transaction_date: new Date(txDate),
            });
          }

          this.eventEmitter.emit('update.participant', {
            battleId: battleRecordJSON?.battle_id || 0,
          });
          this.eventEmitter.emit('new.deposit', {
            vault_id: vaultRecordJSON?.vault_id,
            user_id: userRecordJSON?.user_id,
            amount: tokenAmount,
            tx_hash: depositSignature,
            shares_received: tokenAmount,
          });
        } else if (decodedInstruction.name === 'disqualified') {
          const accounts = relevantInstructions[0].accounts as string[];
          const vault = accounts[0];
          const battle = accounts[1];

          // Find the battle using the battle account address
          const [battleRecord, vaultRecord] = await Promise.all([
            this.battleModel.findOne({ where: { pda_address: battle } }),
            this.vaultModel.findOne({ where: { vault_address: vault } }),
          ]);

          if (!battleRecord || !vaultRecord) {
            console.error('Battle or Vault not found');
            return;
          }

          // Update the vault battle status to disqualified
          await this.vaultModel.update(
            { battle_status: 'disqualified' },
            { where: { vault_address: vault } },
          );
        } else if (decodedInstruction.name === 'register_vault') {
          const accounts = relevantInstructions[0].accounts as string[];
          const vault = accounts[0];
          const battle = accounts[1];

          // Find the battle using the battle account address
          const [battleRecord, vaultRecord] = await Promise.all([
            this.battleModel.findOne({ where: { pda_address: battle } }),
            this.vaultModel.findOne({ where: { vault_address: vault } }),
          ]);

          if (!battleRecord || !vaultRecord) {
            console.error('Battle or Vault not found');
            return;
          }

          // Update the vault with the battle_id
          await this.vaultModel.update(
            { battle_id: battleRecord.battle_id, battle_status: 'active' },
            { where: { vault_address: vault } },
          );
        } else if (decodedInstruction.name === 'set_battle_period') {
          const accounts = relevantInstructions[0].accounts as string[];
          const battle = accounts[0];

          const decodedParams = decodedInstruction.data as {
            start_at: BN;
            end_at: BN;
          };

          const startAt = Number(decodedParams.start_at);
          const endAt = Number(decodedParams.end_at);

          // Find the battle using the battle account address
          const battleRecord = await this.battleModel.findOne({
            where: { pda_address: battle },
          });

          if (!battleRecord) {
            console.error('Battle not found');
            return;
          }

          // Update the battle start and end dates
          if (
            new Date(startAt * 1000) < new Date() &&
            new Date(endAt * 1000) > new Date()
          ) {
            await this.battleModel.update(
              {
                battle_start: new Date(startAt * 1000),
                battle_end: new Date(endAt * 1000),
                current_phase: 'battle_phase',
                status: 'ongoing_battle',
              },
              { where: { pda_address: battle } },
            );
          } else if (new Date(endAt * 1000) > new Date()) {
            await this.battleModel.update(
              {
                battle_start: new Date(startAt * 1000),
                battle_end: new Date(endAt * 1000),
                current_phase: 'completed',
                status: 'completed',
              },
              { where: { pda_address: battle } },
            );
          } else {
            await this.battleModel.update(
              {
                battle_start: new Date(startAt * 1000),
                battle_end: new Date(endAt * 1000),
                current_phase: 'stake_phase',
                status: 'open_deposit',
              },
              { where: { pda_address: battle } },
            );
          }
        } else if (decodedInstruction.name === 'set_winner') {
          const accounts = relevantInstructions[0].accounts as string[];
          const winner_vault = accounts[0];
          const battle = accounts[2];

          // Find the battle using the battle account address
          const [battleRecord, vaultRecord] = await Promise.all([
            this.battleModel.findOne({ where: { pda_address: battle } }),
            this.vaultModel.findOne({
              where: { vault_address: winner_vault },
            }),
          ]);

          if (!battleRecord || !vaultRecord) {
            console.error('Battle or Vault not found');
            return;
          }

          await this.battleModel.update(
            {
              winner_vault_id: vaultRecord.toJSON().vault_id,
              status: 'completed',
            },
            { where: { pda_address: battle } },
          );
          // Update the vault status to winner
          await this.vaultModel.update(
            { battle_status: 'winner' },
            { where: { vault_address: winner_vault } },
          );
        } else if (decodedInstruction.name === 'withdraw') {
          const accounts = relevantInstructions[0].accounts as string[];
          const battle = accounts[0];
          const vault = accounts[1];
          const depositor = accounts[3];

          const withdrawTokenMint = transfers[0].mint;
          const tokenAmount = transfers[0].tokenAmount;
          const withdrawSignature = transaction.signature;
          const fee = transaction.fee;
          const txDate = transaction.timestamp * 1000;

          const [battleRecord, vaultRecord, tokenRecord, userRecord] =
            await Promise.all([
              this.battleModel.findOne({ where: { pda_address: battle } }),
              this.vaultModel.findOne({ where: { vault_address: vault } }),
              this.tokenModel.findOne({
                where: { token_mint: withdrawTokenMint },
              }),
              this.userModel.findOne({
                where: { wallet_address: depositor },
              }),
            ]);

          if (!battleRecord || !vaultRecord || !tokenRecord || !userRecord) {
            console.error('Battle, Vault, User, or Token not found');
            return;
          }

          const vaultRecordJSON = vaultRecord.toJSON();
          const userRecordJSON = userRecord.toJSON();

          const userTxHistory = await this.userTxModel.findOne({
            where: {
              tx_id: withdrawSignature,
              vault_id: vaultRecord.vault_id,
              user_id: depositor,
            },
          });

          if (!userTxHistory) {
            await this.userTxModel.create({
              tx_id: withdrawSignature,
              vault_id: vaultRecord.vault_id,
              user_id: userRecord.user_id,
              tx_type: 'withdraw',
              fee: fee,
              amount: tokenAmount,
              transaction_date: new Date(txDate),
            });
          }

          this.eventEmitter.emit('new.withdrawal', {
            vault_id: vaultRecordJSON?.vault_id,
            user_id: userRecordJSON?.user_id,
            amount: tokenAmount,
            tx_hash: withdrawSignature,
            shares_received: tokenAmount,
          });
        }

        await this.webHookModel.update(
          { is_processed: true },
          { where: { tx_id: transaction.signature, is_processed: false } },
        );
      }
    } catch (error) {
      console.error(error);
    }
  }
  @OnEvent('update.participant')
  async updateParticipant(data: any) {
    const { battleId } = data as { battleId: number };
    const vaultParticipants = await this.userTxModel.findAll({
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('user_id')), 'participant_count'],
        'UserTxHistory.vault_id',
      ],
      include: [
        {
          model: Vault,
          where: { battle_id: battleId },
          attributes: [],
        },
      ],
      group: ['UserTxHistory.vault_id'],
      raw: true,
    });

    const battleParticipants = await this.userTxModel.findAll({
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('user_id')), 'participant_count'],
      ],
      include: [
        {
          model: Vault,
          where: { battle_id: battleId },
          attributes: [],
        },
      ],
      raw: true,
    });

    const totalParticipantBattle = battleParticipants.reduce(
      (sum, participant: any) => sum + participant.participant_count,
      0,
    );

    await this.battleModel.update(
      { total_participants: totalParticipantBattle },
      { where: { battle_id: battleId } },
    );

    const vaultUpdates = vaultParticipants.map((vault: any) =>
      this.vaultModel.update(
        { total_stakers: vault.participant_count },
        { where: { vault_id: vault.vault_id } },
      ),
    );

    await Promise.all(vaultUpdates);
  }
}
