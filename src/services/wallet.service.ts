import { Injectable } from '@nestjs/common';
const Lamden = require('lamden-js');

@Injectable()
export class WalletService {
  constructor() {
    // console.log(this.create_lamden_wallet())
  }

  private create_lamden_wallet = () => Lamden.wallet.new_wallet();
}
