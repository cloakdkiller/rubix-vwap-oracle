# Troubleshooting

Here well go over solutions to some of the most common issues which might pop up.

#### The oracle is not submitting entries to the blockchain

* Ensure that the operator wallet has sufficient TAU (Each vwap submission will cost 8 stamps, 0.175 TAU at current stamp value). Check tauhq.com for balance information.
* Ensure the Oracle server is reachable via SSH, if it is not you will need to restart the oracle instance from the provider management panel.
  * Once the server has rebooted, check the logs to see if there were errors reported by the process by running `pm2 logs` from the project root directory.
* Check that the Lamden masternode is reachable, visit https://masternode-01.lamden.io/latest_block
  * The possibility of this issue should go away when the Lamden network becomes properly decentralised, however for the moment this possibility remains.

#### The oracle is submitting stale values to the blockchain

* Ensure that your instance of the `lamden_block_service` is running correctly you can do this by :
* SSH'ing into the RBX hosted service
* in the project root folder do `pm2 logs` to view the verify that the process is running correctly and receiving blocks.
* create a copy of any relevant logs, and report the issue on the rbx-oracle github and notify @Duckfever on telegram.
* Restart the oracle service.


#### There's a problem with the block-service
* Any issues with the block-service, message @Duckfever or @LamdenJeff on telegram.
* Improvement suggestions / bug reports / pull-requests ? https://github.com/Lamden/lamden_block_service