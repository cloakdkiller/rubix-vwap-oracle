import { Injectable, OnModuleInit } from '@nestjs/common';
import { makeVwap, VwapEntity } from './db/vwap.entity';
import { log } from './utils/logger';
import { submitVwap } from './utils/txn-utils';
import { config } from './config';

/**
 * TO DO :
 * - Test redundancy
 * - Dockerise the setup
 * - Test Docker on remote
 * - Documentation
 */

const submit_vwap_to_blockchain = config.submit_vwap_to_blockchain;

@Injectable()
export class AppService implements OnModuleInit {
  async onModuleInit() {
    if (submit_vwap_to_blockchain) {
      await makeVwap();
      setInterval(async () => {
        try {
          await makeVwap();
        } catch (err) {
          log.warn(err);
        }
      }, config.vwap_submission_frequency);

      setInterval(async () => {
        const vwap_to_submit = await VwapEntity.find({ where: { submitted: false } });
        for (let vwap of vwap_to_submit) {
          try {
            const submitted_res = await submitVwap(Number(vwap.vwap));
            log.log(submitted_res);
            vwap.submitted = true;
            await vwap.save();
          } catch (err) {
            log.log(err);
          }
        }
      }, 10000);
    }
  }
}
