import { Injectable } from '@nestjs/common';
import { BlockService } from './block.service';
import { config } from '../config';

@Injectable()
export class TradeHistoryService {
  constructor(private readonly blockService: BlockService) {}

  load_transactions = (starting_tx_uid = '000000000000.00000.00000', drop = false) => {
    let done;

    async function getUpdates(last_tx_uid) {
      return await this.blockService.getRootKeyChanges("con_weth_lst001", 'S', last_tx_uid, 1, 50);
    }

    async function processUpdates(updates) {
      let last_tx_uid;
      for (const update of updates) {
        last_tx_uid = update.tx_uid;
        // await processor.processUpdate(update, true);
      }
      load(last_tx_uid);
    }

    async function load(last_tx_uid) {
      let updates = await getUpdates(last_tx_uid);
      if (updates.history.length > 0) await processUpdates(updates.history);
      else done();
    }

    async function startLoading(resolver) {
    //   db = await getDatabase();
    //   processor.setDb(db);

      done = resolver;
      load(starting_tx_uid);
    }

    const finished = new Promise(startLoading);

    return {
      finished,
    };
  };
}
