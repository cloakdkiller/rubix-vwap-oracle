import { Injectable } from '@nestjs/common';
import { config } from '../config';
import { updateEthPrice } from '../db/eth-price.entity';
import { log } from '../utils/logger';

const frequency: number = config.check_eth_price_frequency;

@Injectable()
export class EthPriceService {
  axiosDefaultConfig = {
    proxy: false,
  };

  axios = require('axios').create(this.axiosDefaultConfig);

  constructor() {
    this.syncEthPrice();

    setInterval(async () => {
      try {
        await this.syncEthPrice();
      } catch (err) {
        log.warn(err);
      }
    }, frequency);
  }

  syncEthPrice = async () => {
    try {
      const res = await this.axios.get(`https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${config.etherscan_api_key}`);
      if (res.data) {
        const data = res.data;
        const eth_data = data.result;
        if (eth_data) {
          await updateEthPrice(eth_data);
        }
      }
    } catch (err) {
      const err_response = err.response ? err.response.statusText || err.response : err;
      log.warn(`could not retrieve ETH price`);
      log.warn(err_response)
    }
  };
}
