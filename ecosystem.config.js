module.exports = {
  apps: [
    {
      name: 'oracle',
      script: 'npm run start',
      env: {
        block_service_urls: '78.141.225.103:3535',
        check_eth_price_frequency: 60000,
        etherscan_api_key: '2BVRWD5JD47WZDUY676ZJXJNUNHV6U69UR',
        network: 'mainnet',
        operator_sk: 'd142aebd014eb04b98b10873630fa20f75a622cd8aa886b849696f10ff5c062a',
        operator_vk: '486651536e1b361499742017485c882c18af2e49bdfe1975bc587ac913e3f8f2',
        amm_contract: 'con_rocketswap_official_v1_1',
        oracle_contract: 'con_test_oracle',
        vwap_period_seconds: 86400,
        vwap_submission_frequency: 60000,
        sync_trades_from_bs_frequency: 10000,
        submit_vwap_to_blockchain: 'true',
      },
    },
  ],
};
