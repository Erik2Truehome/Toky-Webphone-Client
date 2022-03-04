import { Injectable } from '@angular/core';

//signalr
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import { PortService } from 'src/app/telephony-port/service/port.service';

@Injectable({
  providedIn: 'root',
})
export class RealTimeService {
  public hubConnGral: HubConnection | undefined;
  public portService: PortService;

  private urlHubGral: string = 'https://localhost:7292/hub/Telephony';
  private idenfierLog: string = 'RealTime';

  constructor(portService: PortService) {
    this.portService = portService;
    console.log(`[${this.idenfierLog}]-el Servicio de signalR ha sido creado`);

    this.initializeSignalR();
  }

  private initializeSignalR(): void {
    try {
      const builder = new HubConnectionBuilder();
      this.hubConnGral = builder.withUrl(this.urlHubGral).build();

      this.addListenersFromBackend();

      this.hubConnGral.start();
    } catch (err) {
      console.error(
        `[${this.idenfierLog}]-error al realizar la conexion con el backend por signalR`,
        err
      );
    }
  }

  private addListenersFromBackend() {
    this.hubConnGral!.on('CallLeadOnFront', (objectReceived) => {
      try {
        console.log(
          `[${this.idenfierLog}]-object received-> ${objectReceived}`
        );

        const businessTarget = JSON.parse(objectReceived); //el string recibido lo pasamos a un objeto
        console.log(businessTarget.Lead); //este ya es un objeto
        this.portService.MakeCall(
          businessTarget.Lead.Telephone.Number,
          businessTarget.Lead.Telephone.CountryCode
        );
      } catch (err) {
        console.error(err);
      }
    });
  }
}
