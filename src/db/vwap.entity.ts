import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, MoreThan, MoreThanOrEqual } from 'typeorm';
import { log } from '../utils/logger';
import { config } from '../config';
import { findMostRecentTradeFromDb, ITrade, TradeEntity } from './trade-entity';
import * as vwap from 'vwap';

@Entity()
export class VwapEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  vwap: string;

  @Column()
  price: string;

  @Column()
  periods: string;

  @Column()
  timestamp: number;

  @Column()
  submitted: boolean;

  @Column()
  last_tx_uid: string;
}

export const addVwap = async (vwap: number, last_tx_uid: string, price: number) => {
  let entity = new VwapEntity();

  entity.vwap = String(vwap);
  entity.price = String(price);
  entity.periods = String(config.vwap_period_seconds);
  entity.timestamp = Date.now();
  entity.submitted = false;
  entity.last_tx_uid = last_tx_uid;

  await entity.save();
};

export type IPriceVolumeData = [number, number]; // [volume, price]

export const parseAndSaveVwap = async (trades: ITrade[]) => {
  const formatted: IPriceVolumeData[] = trades.map((t) => [t.dollar_volume, t.dollar_price]);
  const vwap_value = vwap(formatted);
  const last_trade = trades[trades.length - 1];
  await addVwap(vwap_value, last_trade.tx_uid, last_trade.dollar_price);
  log.log(`new vwap created using ${trades.length} values @ ${new Date(Date.now())}`);
};

export const makeVwap = async () => {
  const trades = await TradeEntity.find({
    timestamp: MoreThanOrEqual(Date.now() - config.vwap_period_seconds * 1000),
  });
  if (trades.length) {
    await parseAndSaveVwap(trades);
  } else {
    const most_recent_vwap = await VwapEntity.findOne({ order: { id: 'DESC' } });
    if (most_recent_vwap) {
      await addVwap(Number(most_recent_vwap.vwap), most_recent_vwap.last_tx_uid, Number(most_recent_vwap.price));
    }
  }
};
