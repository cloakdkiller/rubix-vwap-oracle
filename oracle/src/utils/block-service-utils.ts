import { config } from '../config';
import { findMostRecentTradeFromDb, syncHistoryToDb } from '../db/trade-entity';
import { BlockService } from '../services/block.service';
import { log } from './logger';

const axiosDefaultConfig = {
  proxy: false,
};

const axios = require('axios').create(axiosDefaultConfig);

export const getStartTimestamp = () => Date.now() - Number(config.vwap_period_seconds) * 1000;

export const getStartTx = (history: any[]) => {
  const index = history.findIndex((tx) => {
    const start_timestamp = getStartTimestamp();
    const timestamp = tx.timestamp;
    return timestamp > start_timestamp;
  });
  return index - 1 >= 0 ? history[index - 1] : history[index];
};

export const examineTxState = (history: any[]) => {
  const price_affected = history.filter((hist) => hist.state_changes_obj?.con_rocketswap_official_v1_1?.prices);
  const methods = {};
  price_affected.forEach((hist) => {
    const tx_type = hist.txInfo.transaction.payload.function;
    if (!methods[tx_type]) {
      methods[tx_type] = 1;
    } else methods[tx_type]++;
  });
  const last_tx = price_affected[price_affected.length - 1];
  const last_tx_time = new Date(last_tx.txInfo.transaction.metadata.timestamp * 1000);
};

export const getVariableChanges = async (contractName: string, variableName: string, last_tx_uid: string | number, limit: number = 10) => {
  let endpoint = 'variable_history';
  let query = [`contract=${contractName}`, `variable=${variableName}`, `last_tx_uid=${last_tx_uid}`, `limit=${limit}`].join('&');
  let res = await axios.get(`http://${BlockService.get_block_service_url()}/${endpoint}?${query}`);
  return res.data;
};

export const getCurrentKeyValue = async (contractName: string, variableName: string, key: string) => {
  try {
    let endpoint = 'current/one';
    let res = await axios(`http://${BlockService.get_block_service_url()}/${endpoint}/${contractName}/${variableName}/${key}`);
    return res.data;
  } catch (e) {
    return e;
  }
};

export const getContractChanges = async (contractName: string, last_tx_uid: number, limit: number = 10) => {
  let endpoint = 'contract_history';
  let query = [`contract=${contractName}`, `last_tx_uid=${last_tx_uid}`, `limit=${limit}`].join('&');
  let res = await axios(`http://${BlockService.get_block_service_url()}/${endpoint}?${query}`).then((res) => res.data());
  return res.data;
};

export const getRootKeyChanges = async (args: {
  contractName: string;
  variableName: string;
  root_key: string;
  last_tx_uid: number | string;
  limit: number;
}) => {
  try {
    const { contractName, variableName, root_key, last_tx_uid, limit } = args;
    let endpoint = 'rootkey_history';
    let query = [`contract=${contractName}`, `variable=${variableName}`, `root_key=${root_key}`, `last_tx_uid=${last_tx_uid}`, `limit=${limit}`].join('&');
    let res = await axios.get(`http://${BlockService.get_block_service_url()}/${endpoint}?${query}`);
    return res.data;
  } catch (err) {
    log.warn(err);
  }
};

export const syncRecentHistory = async () => {
  try {
    const latest_tx = await findMostRecentTradeFromDb();
    const latest_tx_uid = latest_tx ? latest_tx.tx_uid : '0';

    await syncHistoryToDb(latest_tx_uid);
  } catch (err) {
    BlockService.switchBlockServiceUrl();
    log.warn(err);
    log.info(`switching block_service_url to ${BlockService.get_block_service_url()}`);
  }
};

export const getNumberFromFixed = (value: any) => (value.__fixed__ ? Number(value.__fixed__) : Number(value));
