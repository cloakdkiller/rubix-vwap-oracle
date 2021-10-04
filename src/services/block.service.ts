import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConnectionNotFoundError } from 'typeorm';
import { config } from '../config';
import { findMostRecentTradeFromDb, syncHistoryToDb } from '../db/trade-entity';
import { syncRecentHistory } from '../utils/block-service-utils';
import { log } from '../utils/logger';

@Injectable()
export class BlockService implements OnModuleInit {
  async onModuleInit() {
    await this.startOracle();
  }

  private static bs_index = 0;
  private static block_service_urls = config.block_service_urls;
  public static get_block_service_url = () => BlockService.block_service_urls[BlockService.bs_index];

  public static switchBlockServiceUrl = () => {
    if (config.block_service_urls.length === 1) return;
    if (BlockService.bs_index === BlockService.block_service_urls.length - 1) {
      BlockService.bs_index = 0;
      return;
    }
    BlockService.bs_index++;
  };

  startOracle = async () => {
    const starting_tx = await findMostRecentTradeFromDb();
    const starting_tx_uid = starting_tx ? starting_tx.tx_uid : '0';
    log.log({ starting_tx_uid });
    await syncRecentHistory();

    setInterval(async () => {
      await syncRecentHistory();
    }, config.sync_trades_from_bs_frequency);
  };
}
