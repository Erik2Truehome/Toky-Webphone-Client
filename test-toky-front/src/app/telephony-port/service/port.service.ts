import { APP_ID, Injectable, OnInit } from '@angular/core';

//Toky
//const TokySDK = require('toky-phone-js-sdk');
import { OptionUI } from '../classes/OptionUI';

import { Country } from '../interfaces/IPort';
import { CreatePortService } from './create-port.service';

import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class PortService {
  public ports: any[];

  private APP_ID: string = '8cb5c73194b59381bc8da3380c502d25';
  private APP_KEY: string =
    'f63da3431de5ae0360d6d37d8865cad2f579fc558c43dbca8c122949af282f5b';

  private readonly phoneNumberTEC: string = '+525585262096'; //numero por el que sacamos las llamadas a los leads
  private agentIdEmail = 'misael@truehome.com.mx'; //'erik.montes+demo@truehome.com.mx'; ////'dessire.pena@truehome.com.mx' //'misael@truehome.com.mx'

  constructor(
    private tokenService: TokenService,
    private createPortService: CreatePortService
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

  public MakeCall(phone: string, countryCode: string) {
    const port = this.ports.find((port) => port.idDatabase === 1);
    console.warn('chalu-Port.service.MakeCall()');
    if (port) {
      port.configureAgentAssigned('testEmail@truehome.com.mx'); //este ya no será necesario posiblemente
      port.launchCall(this.phoneNumberTEC, phone, countryCode);
    }
  }
}
