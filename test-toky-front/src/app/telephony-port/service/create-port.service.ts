import { Injectable } from '@angular/core';
import { Port } from '../classes/Port';
import {
  Agent,
  BusinessTarget,
  Country,
  CurrentInfoPort,
  IPort,
  Lead,
  PortRegistrationStatus,
  PortStatus,
  Telephone,
} from '../interfaces/IPort';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class CreatePortService {
  constructor(private tokenService: TokenService) {}

  public async create(
    email: string,
    type: string,
    acceptInboundCalls: boolean,
    callRecordingEnabled: boolean,
    country: Country
  ): Promise<IPort | null | undefined> {
    try {
      let {
        agentLinkedPort,
        currentInfo,
      }: { agentLinkedPort: Agent; currentInfo: CurrentInfoPort } = dataTest();

      let newPort: IPort = new Port(1, agentLinkedPort, currentInfo, country);

      await newPort.createItsTokyClient(
        this.tokenService.accessToken,
        type,
        acceptInboundCalls,
        callRecordingEnabled
      );

      console.log('newPort', newPort);

      return newPort;
    } catch (e) {
      console.log(e);
      return null;
    }

    function dataTest() {
      let agentLinkedPort: Agent = {
        id: 1,
        email: email,
        name: 'Erik',
        lastName: 'Montes',
      };

      let phoneLead1: Telephone = {
        areaCode: '+52',
        number: '',
      };
      let lead1: Lead = {
        email: '',
        name: 'Fernando',
        lastName: 'Cervantes',
        telephone: phoneLead1,
      };

      let agentAssigned1: Agent = {
        id: 1,
        email: '',
        name: 'pedro',
        lastName: 'Peñaflores',
      };

      let businessTarget1: BusinessTarget = {
        lead: lead1,
        agentAssigned: agentAssigned1,
      };

      let currentInfo: CurrentInfoPort = {
        registrationStatus: PortRegistrationStatus.UNREGISTERED,
        status: PortStatus.CREATED,
        businessTarget: businessTarget1,
      };
      return { agentLinkedPort, currentInfo };
    }
  }
}
