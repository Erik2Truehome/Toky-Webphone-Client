import { APP_ID, Injectable, OnInit } from '@angular/core';

//Toky
//const TokySDK = require('toky-phone-js-sdk');
import { OptionUI } from '../classes/OptionUI';

import {
  IPort,
  Agent,
  BusinessTarget,
  CurrentInfoPort,
  Lead,
  PortRegistrationStatus,
  PortStatus,
  Telephone,
  Country,
} from '../interfaces/IPort';
import { CreatePortService } from './create-port.service';

import { TokenService } from './token.service';
import { RealTimeService } from '../../real-time-communication/services/real-time.service';

@Injectable({
  providedIn: 'root',
})
export class PortService {
  public ports: any[];

  private APP_ID: string = '8cb5c73194b59381bc8da3380c502d25';
  private APP_KEY: string =
    'f63da3431de5ae0360d6d37d8865cad2f579fc558c43dbca8c122949af282f5b';

  private agentIdEmail = 'misael@truehome.com.mx'; //'erik.montes+demo@truehome.com.mx'; ////'dessire.pena@truehome.com.mx' //'misael@truehome.com.mx'

  constructor(
    private tokenService: TokenService,
    private createPortService: CreatePortService,
    private realTimeService: RealTimeService
  ) {
    this.ports = [];

    this.Initialize();
  }

  async Initialize(): Promise<void> {
    await this.generateToken();
    await this.createTokyClients();
  }

  private async generateToken() {
    try {
      await this.tokenService.requestToken(
        this.agentIdEmail,
        this.APP_ID,
        this.APP_KEY
      );
    } catch (err) {
      console.error(err);
    }
  }

  private async createTokyClients() {
    let mexico: Country = {
      code: '1545',
      name: 'México',
    };

    try {
      let port1 = await this.createPortService.create(
        this.agentIdEmail,
        'agent',
        true, //true-> para poder recibir el invite de una inbound call or false
        true,
        mexico
      );

      this.ports.push(port1);
      console.log('los puertos actuales', this.ports);
    } catch (e) {
      console.error(e);
    }
  }
}
