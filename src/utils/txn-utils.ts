const Lamden = require('lamden-js');
import { config } from '../config';
import { log } from './logger'

export const create_lamden_wallet = () => Lamden.wallet.new_wallet();

export const create_transaction_info = (vwap: number) => {
  return {
    senderVk: config.operator_vk,
    contractName: `${config.oracle_contract}`,
    methodName: 'set_price',
    kwargs: {
      number: 0,
      new_price: { __fixed__: String(vwap) }, // fixed object required for float values
    },
    stampLimit: 500, //Max stamps to be used. Could use less, won't use more.
  };
};

export const submitVwap = async (vwap: number) => {
  try {
    let tx = new Lamden.TransactionBuilder(config.network, create_transaction_info(vwap));

    return await tx.send(config.operator_sk, undefined, async (res, err) => {
      if (err) {
        console.log({ err })
        throw new Error(err);
      }
      log.log(res.hash);
      return await tx.checkForTransactionResult();
    });
  } catch (err) {
    log.log({ err })
  }
};
