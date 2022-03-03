import { Injectable } from '@angular/core';

//signalr
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class RealTimeService {
  public hubConnGral: HubConnection | undefined;

  private urlHubGral: string = 'https://localhost:7292/hub/Telephony';
  private idenfierLog: string = 'RealTime';
  constructor() {
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
    this.hubConnGral!.on('CallLeadOnFront', (someObject) => {
      //`[${this.idenfierLog}]-object received-> ${JSON.stringify(someObject)}`
      console.log(`[${this.idenfierLog}]-object received-> ${someObject}`);
    });
  }
}
