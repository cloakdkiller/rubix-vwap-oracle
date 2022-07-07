import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from 'typeorm';
import { log } from '../utils/logger';

@Entity()
export class UsdcPriceEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  last_price: string;

  @Column()
  timestamp: number;
}

export const updateUsdcPrice = async (usdc_data: { last_price: string; timestamp: string }) => {
  let entity = await UsdcPriceEntity.findOne();
  if (!entity) {
    entity = new UsdcPriceEntity();
  }
  let { last_price, timestamp } = usdc_data;
  entity.last_price = last_price;
  entity.timestamp = new Date(timestamp).getTime()
  await entity.save();
};
