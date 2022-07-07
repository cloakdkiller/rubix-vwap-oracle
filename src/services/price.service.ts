import { Injectable } from '@nestjs/common';
import { config } from '../config';
import { updateEthPrice } from '../db/eth-price.entity';
import { updateUsdcPrice } from '../db/usdc-price.entity';
import { log } from '../utils/logger';

const frequency: number = config.check_eth_price_frequency;

@Injectable()
export class PriceService {
  axiosDefaultConfig = {
    proxy: false,
  };

  private coingecko_base_url = "https://api.coingecko.com/api/v3";
  // https://api.coingecko.com/api/v3/exchanges/binance/tickers?coin_ids=usdc

  axios = require('axios').create(this.axiosDefaultConfig);

  constructor() {
    this.syncEthPrice();
    this.syncUsdcPrice()

    setInterval(async () => {
      try {
        await this.syncEthPrice();
        await this.syncUsdcPrice()
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

  private syncUsdcPrice = async () => {
    try {
      let tickerData: any = await this.axios.get(`https://api.coingecko.com/api/v3/exchanges/kraken/tickers?coin_ids=usdc`);
      const usdc_usd_ticker = tickerData.data?.tickers?.find((ticker) => ticker.target === "USD" && ticker.base === "USDC");
      const last_price = usdc_usd_ticker.last;
      const timestamp = usdc_usd_ticker.timestamp
      if (last_price && timestamp) {
        await updateUsdcPrice({ last_price, timestamp })
      } else {
        throw ("could not retrieve last_price / timestamp")
      }
    } catch (err) {
      const err_response = err.response ? err.response.statusText || err.response : err;
      log.warn(`could not retrieve ETH price`);
      log.warn(err_response)
    }
  };
}
