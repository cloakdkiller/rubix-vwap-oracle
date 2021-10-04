import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WsClient } from './ws-client';
import { EthPriceService } from './services/eth-price.service';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { BlockService } from './services/block.service';
import { EthPriceEntity } from './db/eth-price.entity';
import { WalletService } from './services/wallet.service';
import { VwapEntity } from './db/vwap.entity';
import { TradeEntity } from './db/trade-entity';

const db_options: TypeOrmModuleOptions = {
  name: 'default',
  type: 'sqlite',
  database: 'database.sqlite',
  entities: [EthPriceEntity, VwapEntity, TradeEntity],
  synchronize: true,
  autoLoadEntities: true,
};

@Module({
  imports: [TypeOrmModule.forRoot(db_options)],
  controllers: [AppController],
  providers: [AppService, WsClient, EthPriceService, BlockService, WalletService],
})
export class AppModule {}
