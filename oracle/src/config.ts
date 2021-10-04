const Lamden = require('lamden-js');

const testnet = new Lamden.Network({
  hosts: ['https://testnet-master-1.lamden.io'],
  name: 'Lamden Testnet',
  type: 'testnet',
  lamden: true,
  currencySymbol: 'dTAU',
  blockExplorer: 'https://testnet.lamden.io',
});

const mainnet = new Lamden.Network({
  hosts: ['https://masternode-01.lamden.io'],
  name: 'Lamden Mainnet',
  type: 'mainnet',
  lamden: true,
  currencySymbol: 'TAU',
  blockExplorer: 'https://mainnet.lamden.io',
});

export const config = {
  block_service_urls: process.env.block_service_urls?.split(',') || ['78.141.225.103:3535'],
  check_eth_price_frequency: parseInt(process.env.check_eth_price_frequency) || 60000,
  etherscan_api_key: process.env.etherscan_api_key || '2BVRWD5JD47WZDUY676ZJXJNUNHV6U69UR',
  network: process.env.network === 'testnet' ? testnet : mainnet,
  operator_sk: process.env.operator_sk || 'd142aebd014eb04b98b10873630fa20f75a622cd8aa886b849696f10ff5c062a',
  operator_vk: process.env.operator_vk || '486651536e1b361499742017485c882c18af2e49bdfe1975bc587ac913e3f8f2',
  amm_contract: process.env.amm_contract || 'con_rocketswap_official_v1_1',
  oracle_contract: process.env.oracle_contract || 'con_test_oracle',
  vwap_period_seconds: Number(process.env.vwap_period_seconds) || 86400, // seconds - 24h
  vwap_submission_frequency: Number(process.env.vwap_submission_frequency) || 600000, // miliseconds - 10 minutes
  sync_trades_from_bs_frequency: Number(process.env.sync_trades_from_bs_frequency) || 10000,
  submit_vwap_to_blockchain: process.env.submit_vwap_to_blockchain === 'true' ? true : false || true,
};
