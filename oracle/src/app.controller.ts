import { Body, Controller, Get, HttpException, Query } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Between } from 'typeorm';
import { AppService } from './app.service';
import { EthPriceEntity } from './db/eth-price.entity';
import { TradeEntity } from './db/trade-entity';
import { VwapEntity } from './db/vwap.entity';

export class GetTradeDataDTO {
  @ApiPropertyOptional()
  unix_start_time: number;

  @ApiPropertyOptional()
  unix_end_time: number;
}

export class GetVwapDataDTO {
  @ApiPropertyOptional()
  unix_start_time: number;

  @ApiPropertyOptional()
  unix_end_time: number;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('get_eth_price')
  @ApiOperation({ summary: 'Retrieves the latest ETH price, which as been synced to the API' })
  async getEthPrice() {
    try {
      return await EthPriceEntity.findOne();
    } catch (err) {
      return new HttpException(err, 500);
    }
  }

  @Get('get_vwap_data')
  @ApiOperation({ summary: 'Retrieve all the VWAP entries from the local DB. Leave unix_start_time and unix_end_time blank if you wish to retrieve ALL the values. may cause the process to choke if the value is extremely large.' })
  async getVwapData(@Query() params: GetVwapDataDTO) {
    try {
      const { unix_start_time, unix_end_time } = params;
      const find_query =
        unix_end_time && unix_start_time
          ? {
              timestamp: Between(unix_start_time, unix_end_time),
            }
          : {};
      const vwap_data = await VwapEntity.find(find_query);
      return vwap_data;
    } catch (err) {
      return new HttpException(err, 500);
    }
  }

  @Get('get_trade_data')
  @ApiOperation({ summary: 'Retrieves the list of trades for the watched pair. Leaving unix_start_time and unix_end_time blank will retrieve all values and cause the process to choke for a few seconds.' })
  async getTradeData(@Query() params: GetTradeDataDTO) {
    try {
      const { unix_start_time, unix_end_time } = params;
      const find_query =
        unix_end_time && unix_start_time
          ? {
              timestamp: Between(unix_start_time, unix_end_time),
            }
          : {};
      return await TradeEntity.find(find_query);
    } catch (err) {
      return new HttpException(err, 500);
    }
  }
}
