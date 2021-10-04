# Rubix WVAP Oracle
* Implementation of a centralised Oracle which uses a VWAP (volume weighted average price) over a predefined period.
* Motivation for implimenting this is to minimise the risk of liquidations due to short-lived fluctuations in price.
* For more in depth information about the architecture see the `/docs` folder.

# Quick Start Guide

## Install and run the Lamden Block Service

Read more about the blockservice here : https://github.com/Lamden/lamden_block_service

For convenience I have packaged the same as a docker container here : https://github.com/cloakdkiller/lamden_block_service

### Minimum Specs
The blockservice is a lightweight application, it will need a 2 core machine, with at least 25gb space. As the Lamden blockchain grows it will be necessary to upgrade the disk space.

### Installation

#### Install Dependancies
1. [Mongo DB (latest)](https://docs.mongodb.com/manual/installation/)
2. [Nodejs and NPM](https://nodejs.org/en/)
3. [Docker](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-compose-on-ubuntu-20-04)
4. Clone https://github.com/cloakdkiller/lamden_block_service.git to your host machine.

#### Configure the firewall
I recommend you only allow connections from the machine which will be running the oracle process on ports 3535 & 3536

#### Running the app
1.  Ensure mongo is running.`sudo systemctl start mongod.service`
2.  From project root `docker-compose up --build`


## Install and run the Oracle

### Installation

#### Minimum Specs
The oracle is a lightweight application, it will need a 2 core machine, with at least 25gb space. This app does have a local DB which is it uses to store some state, as time goes on this may need to be upgraded.

#### Install Dependencies
1. [Nodejs and NPM](https://nodejs.org/en/)
2. [Docker](https://www.digitalocean.com/community/tutorials/
3. Clone this repository to your host machine.

#### Configure the application
Open `docker-compose.yml` edit required fields.

| variable                      | explanation                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------ |
| block_service_urls            | comma dilineated list of IP addresses e.g `0.0.0.0,78.4.2.3`                                     |
| check_eth_price_frequency     | how often the ETH price is synced to the local DB                                                |
| etherscan_api_key             | get one [here](https://info.etherscan.com/api-keys/)                                             |
| network                       | mainnet or testnet                                                                               |
| operator_sk                   | the SK which will be writing the value to the blockchain                                         |
| operator_vk                   | VK of above.                                                                                     |
| amm_contract                  | the rocketswap contract, don't change this                                                       |
| oracle_contract               | contract to call `set_price` on                                                                  |
| vwap_period_seconds           | How many seconds the VWAP is calculated over, default is `86400` (1 day)                         |
| vwap_submission_frequency     | How often the VWAP is calculated and submitted to the blockchain in milliseconds                 |
| sync_trades_from_bs_frequency | how often the API will sync new trades from the block-service, in milliseconds. default `10,000` |

#### Configure the firewall
It's recommended that you block all incoming connections, except for SSH connections from whitelisted IP addresses, and port 3000, again whitelisted IP's only. Your cloud provider should provide an interface for this.

If you wish to provide a data visualisation in the rubix application, a sensible approach might be to :
- create a data-vis microservice on a seperate machine (perhaps the rubix UI server), 
- microservice would forward api calls to the oracle process
- microservice IP would be whitelisted by the oracle firewall.

*if the UI is experiencing significant load, a seperate instance of the oracle process could be created, with blockchain submission functionality disabled.*

##### Running the app
- From the project root directory `docker-compose up --build`

# API
There is a basic REST API, which allows querying values in the local DB.
For convenience there is a swagger dashboard available at <server_ip>:3000/api, once the application is running.

This api could form the basis for basic data visualisations.
