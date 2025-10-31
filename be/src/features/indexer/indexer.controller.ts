import { Body, Controller, Post } from '@nestjs/common';
import { IndexerService } from './indexer.service';
import { ObjectResponse } from 'src/dto/response.dto';

@Controller('indexer')
export class IndexerController {
  constructor(private readonly indexerService: IndexerService) {}

  @Post('webhook')
  async saveNewTx(@Body() rawData: any[]): Promise<ObjectResponse<any[]>> {
    const transactions = await this.indexerService.saveNewTx(rawData);
    return new ObjectResponse(
      transactions,
      'Transactions saved successfully',
      201,
    );
  }

  @Post('process-unprocessed')
  async processUnprocessedTransactions(): Promise<
    ObjectResponse<any[] | null>
  > {
    const transactions =
      await this.indexerService.processUnprocessedTransactions();
    return new ObjectResponse(
      transactions,
      'Unprocessed transactions processed successfully',
      200,
    );
  }

  @Post('fetch-prices')
  async fetchAndSavePrices(): Promise<ObjectResponse<any>> {
    const prices = await this.indexerService.fetchAndSavePrices();
    return new ObjectResponse(
      prices,
      'Prices fetched and saved successfully',
      200,
    );
  }

  @Post('balance-vaults')
  async balanceVaults(): Promise<ObjectResponse<any>> {
    const result = await this.indexerService.balanceVaults();
    return new ObjectResponse(result, 'Vaults balanced successfully', 200);
  }

  @Post('balance-analyze')
  async analyzeVault(): Promise<ObjectResponse<any>> {
    const result = await this.indexerService.analyzeVault();
    return new ObjectResponse(result, 'Vaults balanced successfully', 200);
  }
}
