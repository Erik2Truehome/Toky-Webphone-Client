import { Component, OnInit } from '@angular/core';
import { IPort } from 'src/app/telephony-port/interfaces/IPort';
import { TransferOptionsEnum } from 'src/app/toky-sdk/toky-sdk';
import { PortService } from '../../telephony-port/service/port.service';
import { PortStatus } from '../../telephony-port/interfaces/IPort';

@Component({
  selector: 'app-softphone-actions',
  templateUrl: './softphone-actions.component.html',
  styleUrls: ['./softphone-actions.component.css'],
})
export class SoftphoneActionsComponent implements OnInit {
  public transferringPhone: string = '5514837767';
  public transferringEmail: string = '';

  public get IsThereAnyActiveCall(): boolean {
    let port: IPort = [...this.portService.ports].find(
      (port) => port.idDatabase === 1
    );
    if (port) {
      return (
        port.currentInfo.status === PortStatus.CONNECTED ||
        port.currentInfo.status === PortStatus.HOLD
      ); // este ya no lo usas, borrarlo de la clase Port.ts->  port.isThereAnyActiveCall
    } else {
      return false;
    }
  }

  public get isOnHold(): boolean {
    let port: IPort = [...this.portService.ports].find(
      (port) => port.idDatabase === 1
    );
    if (port) {
      return port.isOnHold;
    } else {
      return false;
    }
  }

  constructor(private portService: PortService) {}

  ngOnInit(): void {
    /*this.port = this.portService.ports.find((port) => port.idDatabase === 1);
    if (!this.port) {
      console.error('El puerto telefonico del softphone es indefinido ');
    }*/
  }

  public hangUpCurrentCall(): void {
    const port = this.portService.ports.find((port) => port.idDatabase === 1);
    if (port) {
      port.hangUp();
    }
  }

  public tranferToNumber(): void {
    const port = this.portService.ports.find((port) => port.idDatabase === 1);
    if (port) {
      port.TransferToNumber(this.transferringPhone, TransferOptionsEnum.WARM); //blind or warm, la mejor es la warm, porque en blind el cliente final deja de escuchar el audio de espera
    }
  }

  public tranferToEmail(): void {
    const port = this.portService.ports.find((port) => port.idDatabase === 1);
    if (port) {
      port.TransferToEmail(this.transferringEmail, TransferOptionsEnum.WARM); //blind or warm, la mejor es la warm, porque en blind el cliente final deja de escuchar el audio de espera
    }
  }

  public AnswerInboundCall(): void {
    const port = this.portService.ports.find((port) => port.idDatabase === 1);
    if (port) {
      port.AnswerInboundCall(); //blind or warm, la mejor es la warm, porque en blind el cliente final deja de escuchar el audio de espera
    }
  }

  public holdCall(): void {
    console.log('que onda');
    const port = this.portService.ports.find((port) => port.idDatabase === 1);
    if (port) {
      if (this.isOnHold) {
        port.unhold();
      } else {
        port.hold();
      }
    }
  }
}
//      [ngModel]="isOnHold"
