import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from 'typeorm';
import { log } from '../utils/logger';

@Entity()
export class EthPriceEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  last_price: string;

  @Column()
  timestamp: number;
}

export const updateEthPrice = async (eth_data: { ethusd: string; ethusd_timestamp: string }) => {
  let entity = await EthPriceEntity.findOne();
  if (!entity) {
    entity = new EthPriceEntity();
  }
  let { ethusd, ethusd_timestamp } = eth_data;
  entity.last_price = ethusd;
  entity.timestamp = Number(ethusd_timestamp) * 1000;
  await entity.save();
};
