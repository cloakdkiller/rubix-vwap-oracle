import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WsClient } from './ws-client';
import { PriceService } from './services/price.service';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { BlockService } from './services/block.service';
import { EthPriceEntity } from './db/eth-price.entity';
import { VwapEntity } from './db/vwap.entity';
import { TradeEntity } from './db/trade-entity';
import { UsdcPriceEntity } from './db/usdc-price.entity';

const db_options: TypeOrmModuleOptions = {
  name: 'default',
  type: 'sqlite',
  database: 'database.sqlite',
  entities: [EthPriceEntity, UsdcPriceEntity, VwapEntity, TradeEntity],
  synchronize: true,
  autoLoadEntities: true,
};

@Module({
  imports: [TypeOrmModule.forRoot(db_options)],
  controllers: [AppController],
  providers: [AppService, WsClient, PriceService, BlockService],
})
export class AppModule {}
