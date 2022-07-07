import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';
import { log } from '../utils/logger';
import { config } from '../config';
import { getNumberFromFixed, getRootKeyChanges } from '../utils/block-service-utils';
import { UsdcPriceEntity } from './usdc-price.entity';

@Entity()
export class TradeEntity extends BaseEntity implements ITrade {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ unique: true })
  tx_uid: string;

  @Column()
  action: 'buy' | 'sell';

  @Column()
  timestamp: number;

  @Column()
  dollar_volume: number;

  @Column()
  dollar_price: number;

  @Column()
  base_volume: number;

  @Column()
  base_price: number;

  @Column()
  base_reserves: number;
}

export interface ITrade {
  tx_uid: string;
  action: 'buy' | 'sell';
  timestamp: number;
  dollar_volume: number;
  dollar_price: number;
  base_volume: number;
  base_price: number;
  base_reserves: number;
}

export const saveTradesToDb = async (trades: ITrade[]) => {
  const proms = trades.map((trade) => {
    const trade_entity = new TradeEntity();
    for (let field in trade) {
      trade_entity[field] = trade[field];
    }
    return trade_entity;
  });
  for (let prom of proms) {
    await prom.save();
  }
};

/** This method does the following :
 * - Compares the state of each transaction to the previous state to determine :
 * - if it's a trade, if it is, what the volume of that trade is.
 * - returns an array of trades which implement ITrade
 */

export const parseTrades = async (history: any[], token_contract_name = 'con_lusd_lst001') => {
  try {
    let most_recent_trade = await findMostRecentTradeFromDb();
    const most_recent_trade_uid = most_recent_trade ? most_recent_trade.tx_uid : '0';

    let last_most_recent_trade;

    if (most_recent_trade) {
      last_most_recent_trade = await findLastMostRecentTradeFromDb(most_recent_trade);
    }

    const trade_transactions = history.filter((item) => {
      return (
        item.affectedRootKeysList.includes(`${config.amm_contract}.reserves:${token_contract_name}`) &&
        item.affectedRootKeysList.includes(`${config.amm_contract}.prices:${token_contract_name}`)
      );
    });

    const parsed_trades: ITrade[] = [];
    const usdc_price = await UsdcPriceEntity.findOne();

    trade_transactions.forEach((curr_value, index) => {
      const prev_value = trade_transactions[index - 1];

      let prev_reserves_base;

      if (most_recent_trade_uid === '0' && index === 0) {
        prev_reserves_base = 0;
      } else if (most_recent_trade_uid !== '0' && index === 0) {
        prev_reserves_base = last_most_recent_trade.base_reserves;
      } else {
        prev_reserves_base = getNumberFromFixed(prev_value.state_changes_obj[`${config.amm_contract}`].reserves[`${token_contract_name}`][0]);
      }
      const curr_reserves_base = getNumberFromFixed(curr_value.state_changes_obj[`${config.amm_contract}`].reserves[`${token_contract_name}`][0]);
      const action = prev_reserves_base > curr_reserves_base ? 'sell' : 'buy';
      const base_volume = action === 'buy' ? curr_reserves_base - prev_reserves_base : prev_reserves_base - curr_reserves_base;
      const tx_uid = curr_value.tx_uid;
      const timestamp = curr_value.timestamp;
      const base_price = getNumberFromFixed(curr_value.state_changes_obj[`${config.amm_contract}`].prices[`${token_contract_name}`]);
      const dollar_price = Number(usdc_price.last_price) / base_price;
      const dollar_volume = dollar_price * base_volume;

      const trade: ITrade = {
        tx_uid,
        action,
        dollar_volume,
        dollar_price,
        base_price,
        base_volume,
        timestamp,
        base_reserves: curr_reserves_base,
      };
      parsed_trades.push(trade);
    });

    return parsed_trades;
  } catch (err) {
    log.log(err);
  }
};

export const syncHistoryToDb = async (starting_tx_id = '0', batch_size = 1000, history = [], contractName: string = 'con_lusd_lst001') => {
  const res = await getRootKeyChanges({
    contractName,
    variableName: 'balances',
    root_key: config.amm_contract,
    last_tx_uid: starting_tx_id,
    limit: batch_size,
  });
  history.push(...res.history);
  const length = res.history.length;

  if (length === batch_size) {
    const tx_uid = res.history[res.history.length - 1].tx_uid;
    log.log('getting more blocks from tx_uid : ' + tx_uid);
    return await syncHistoryToDb(tx_uid, batch_size, history);
  }
  const trades = await parseTrades(history);
  await saveTradesToDb(trades);
};

/** This method does the following :
 * - take the more recent trade in the db for starting_tx_uid, if none exists start from 0
 * - returns the tx ID
 */

export const findMostRecentTradeFromDb = async (starting_tx_id: string = '0', batch_size = 10000) => {
  const most_recent_trade = await TradeEntity.findOne({
    order: {
      timestamp: 'DESC',
    },
  });
  return most_recent_trade;
};

export const findLastMostRecentTradeFromDb = async (most_recent_trade: TradeEntity) => {
  const id = most_recent_trade.id;
  const last_most_recent_trade = await TradeEntity.findOne(String(Number(id) - 1));
  return last_most_recent_trade;
};
