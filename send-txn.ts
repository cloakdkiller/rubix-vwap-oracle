const Lamden = require('lamden-js');
import axios from 'axios';
import { config } from './src/config';

// const axiosDefaultConfig = {
//   proxy: false,
// };

axios.defaults.proxy = false;

// const axios = require('axios').create(this.axiosDefaultConfig);

export const create_lamden_wallet = () => Lamden.wallet.new_wallet();

export const create_transaction_info = () => {
  return {
    senderVk: config.operator_vk,
    contractName: 'currency',
    methodName: 'transfer',
    kwargs: {
      to: 'nowhere', // string
      amount: { __fixed__: '0.0001' }, // fixed object required for float values
    },
    stampLimit: 500, //Max stamps to be used. Could use less, won't use more.
  };
};

export const submit_transacton = async () => {
  let tx = new Lamden.TransactionBuilder(config.network, create_transaction_info());

  return await tx.send(config.operator_sk, undefined, async (res, err) => {
    if (err) throw new Error(err);
    console.log(res.hash);
    return await tx.checkForTransactionResult();
  });
};

export const go = async () => {
  const res = await submit_transacton();
  console.log(res);
};

let tx_num = 0;
setInterval(() => {
  if (tx_num < 20) {
    tx_num ++
    go();
  }
}, 2000);
