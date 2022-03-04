import {
  ClientStatus,
  SessionStatus,
  TokyClient,
  TokyMedia,
  TransferEnum,
  TransferOptionsEnum,
} from 'src/app/toky-sdk/toky-sdk';
import { Client } from 'toky-phone-js-sdk/dist/types/src/client';

import {
  Agent,
  Country,
  CurrentInfoPort,
  IPort,
  PortRegistrationStatus,
  PortStatus,
} from '../interfaces/IPort';

import { OptionUI } from './OptionUI';
import { InvitePkg } from './SIP/Package/InvitePkg';

export class Port implements IPort {
  idDatabase: number;
  agentLinked: Agent;
  currentInfo: CurrentInfoPort;
  tokyClient: Client | undefined;
  country?: Country | undefined;

  public get isThereAnyActiveCall(): boolean {
    return this._isThereAnyActiveCall;
  }

  public get isOnHold(): boolean {
    return this._isOnHold;
  }

  private tokySession: any;
  private isWaitingTransfer: boolean = false;
  private _isThereAnyActiveCall = false;
  private _isOnHold = false;

  private IvrPhoneNumber: string = '+525585262096';
  private optionCallTypeUI: OptionUI = OptionUI.Op0_Undefined;
  transfiriendoAIvr: boolean;

  constructor(
    idDatabase: number,
    agentLinked: Agent,
    currentInfo: CurrentInfoPort,
    country?: Country | undefined
  ) {
    this.idDatabase = idDatabase;
    this.agentLinked = agentLinked;
    this.currentInfo = currentInfo;
    this.country = country;
    this.tokySession = null;
    this.transfiriendoAIvr = false;
  }

  public TransferToNumber(
    numberToTransfer: string,
    typeTransfer: typeof TransferOptionsEnum
  ): void {
    const objToTransfer = {
      type: TransferEnum.NUMBER,
      destination: `+52${numberToTransfer}`,
      option: typeTransfer,
    };
    console.log('Transfieriendo a un numero Externo', objToTransfer);
    this.tokySession.makeTransfer(objToTransfer);
  }

  public TransferToEmail(
    emailToTransfer: string,
    typeTransfer: typeof TransferOptionsEnum
  ): void {
    const objToTransfer = {
      type: TransferEnum.AGENT,
      destination: emailToTransfer, //'dessire.pena__truehome.com.mx' 'misael__truehome.com.mx'
      option: typeTransfer, //or TransferOptionsEnum.WARM OR TransferOptionsEnum.BLIND
    };
    console.log(
      'Transfieriendo a un Agente de Toky por su email',
      objToTransfer
    );
    this.tokySession.makeTransfer(objToTransfer);
  }

  public AnswerInboundCall(): void {
    if (this.tokySession) {
      this.tokySession.acceptCall();
      this.currentInfo.status = PortStatus.CONNECTED;
    }
  }

  public hold(): void {
    try {
      if (this.tokySession) {
        this.tokySession
          .hold()
          .then(() => {
            console.log('HOLD process Succesful');
          })
          .catch(() => {
            console.log('HOLD process Wrong');
          });
      }
    } catch (error) {
      console.log(error);
    }
  }

  public unhold(): void {
    try {
      if (this.tokySession) {
        this.tokySession
          .hold()
          .then(() => {
            console.log('UNHOLD process Succesful');
          })
          .catch(() => {
            console.log('UNHOLD process Wrong');
          });
      }
    } catch (error) {
      console.log(error);
    }
  }

  public async createItsTokyClient(
    accessToken: string,
    type: 'agent',
    acceptInboundCalls: boolean,
    callRecordingEnabled: boolean
  ): Promise<void> {
    const Client = new TokyClient({
      accessToken: accessToken,
      account: {
        user: this.agentLinked.email,
        type: type,
        acceptInboundCalls: acceptInboundCalls,
        callRecordingEnabled: callRecordingEnabled,
      },
      transportLib: 'sip.js',
      media: {
        errorAudio: '',
        incomingRingAudio: '',
        ringAudio: '',
      },
    });

    await Client.init();

    this.tokyClient = Client;
    console.log('ya creó el TokyClient');

    this.addEventListenersTokyClient();
    console.log('ya agregó los events listeners del tokyClient');
  }

  private addEventListenersTokyClient() {
    this.tokyClient!.on(ClientStatus.INVITE_REJECTED, (argRejected) => {
      console.log(
        `![${this.idDatabase}]-tokyClient-INVITE_REJECTED->${JSON.stringify(
          argRejected
        )}`
      );
      console.log(argRejected);
      this._isThereAnyActiveCall = false;
    });
    this.tokyClient!.on(ClientStatus.REGISTERING, () => {
      console.log(`![${this.idDatabase}]-tokyClient-REGISTERING`);
      this.currentInfo.registrationStatus = PortRegistrationStatus.REGISTERING;

      this.currentInfo.status = PortStatus.INITIALIZING;
      this._isThereAnyActiveCall = false;
    });
    this.tokyClient!.on(ClientStatus.ONLINE, () => {
      console.log(`![${this.idDatabase}]-tokyClient-ONLINE`);
      this.currentInfo.registrationStatus = PortRegistrationStatus.REGISTERED;

      this.currentInfo.status = PortStatus.READY;
      this._isThereAnyActiveCall = false;
    });
    this.tokyClient!.on(ClientStatus.OFFLINE, () => {
      console.log(`![${this.idDatabase}]-tokyClient-OFFLINE`);
      this.currentInfo.registrationStatus = PortRegistrationStatus.UNREGISTERED;

      this.currentInfo.status = PortStatus.CREATED;
      this._isThereAnyActiveCall = false;
    });
    this.tokyClient!.on(ClientStatus.REGISTRATION_FAILED, () => {
      console.log(`![${this.idDatabase}]-tokyClient-REGISTRATION_FAILED`);
      this.currentInfo.registrationStatus = PortRegistrationStatus.FAILED;

      this.currentInfo.status = PortStatus.REGISTRATION_ERROR;
      this._isThereAnyActiveCall = false;
    });
    this.tokyClient!.on(ClientStatus.DEFAULT, () => {
      console.log(`![${this.idDatabase}]-tokyClient-DEFAULT`);
    });
    this.tokyClient!.on(ClientStatus.READY, () => {
      console.log(`![${this.idDatabase}]-tokyClient-READY`);
      this.currentInfo.registrationStatus = PortRegistrationStatus.REGISTERED;

      this.currentInfo.status = PortStatus.READY;
      this._isThereAnyActiveCall = false;
    });
    this.tokyClient!.on(ClientStatus.DISCONNECTED, () => {
      console.log(`![${this.idDatabase}]-tokyClient-DISCONNECTED`);
      this.currentInfo.registrationStatus = PortRegistrationStatus.UNREGISTERED;

      this.currentInfo.status = PortStatus.REGISTRATION_ERROR;
      this._isThereAnyActiveCall = false;
    });
    this.tokyClient!.on(ClientStatus.SESSION_UPDATED, (args) => {
      console.log(`![${this.idDatabase}]-tokyClient-SESSION_UPDATED`);

      this.tokySession = args.session;
      console.log(this.tokySession);
      this.addEventListenersTokySession();
    });

    this.tokyClient!.on(ClientStatus.REGISTERED, () => {
      console.log(`![${this.idDatabase}]-tokyClient-REGISTERED`);
      this.currentInfo.registrationStatus = PortRegistrationStatus.REGISTERED;

      this.currentInfo.status = PortStatus.READY;
      this._isThereAnyActiveCall = false;
    });
    this.tokyClient!.on(ClientStatus.UNREGISTERED, () => {
      console.log(`![${this.idDatabase}]-tokyClient-UNREGISTERED`);
      this.currentInfo.registrationStatus = PortRegistrationStatus.UNREGISTERED;

      this.currentInfo.status = PortStatus.REGISTRATION_ERROR;
      this._isThereAnyActiveCall = false;
    });
    this.tokyClient!.on(ClientStatus.CONNECTING, () => {
      console.log(`![${this.idDatabase}]-tokyClient-CONNECTING`);
      console.log('CONNECTING... se va a lanzar una llamada outgoing');
      this.currentInfo.status = PortStatus.STARTING_OUTBOUND_CALL;
      this._isThereAnyActiveCall = true;
    });
    this.tokyClient!.on(ClientStatus.INVITE, (invite: InvitePkg) => {
      if (invite.callData.userAgent === 'call-queued') {
        //signifca que viene desde el Dial Engine
        console.log(
          `![${this.idDatabase}]-tokyClient-INVITE- to LEAD: ${invite.callData.remoteUserId} - from-${invite.callData.transferredBy} - TransferType:${invite.callData.transferredType}`
        );

        //Contestamos de inmediato porque ya trae un Cliente que si es para nosotros
        this.currentInfo.status = PortStatus.STARTING_INBOUND_CALL;
        TokyMedia.source.incomingRingAudio.play();
        this.currentInfo.status = PortStatus.RINGING;
        setTimeout(() => {
          this.tokySession.acceptCall();
          this._isThereAnyActiveCall = true;
        }, 1000);
      } else if (invite.callData.userAgent === 'telephone-network') {
        //Signifca que viene desde el IVR
        console.log(
          `![${this.idDatabase}]-tokyClient-INVITE- to LEAD: ${invite.callData.remoteUserId} - from IVr number-${invite.callData.did} - Ivr Id:${invite.callData.ivrId}`
        );
        //Enviamos por signalR el numero del lead que esta en invite.callData.remoteUserId
        //Para que el BackEnd .NET nos diga si ese Lead es para nosotros no NO
        //Si si es para nosotros entonces aceptamos la llamada this.tokySession.acceptCall()
        //Pero si no, entonces, la rechazamos this.hangUp();

        //Esto corrigelo pues Solo lo debes mandar a llamar si la llaamada entrante es del numero telefónico del Lead que te asignaron

        if (this.currentInfo.status === PortStatus.READY) {
          this.currentInfo.status = PortStatus.STARTING_INBOUND_CALL;
          TokyMedia.source.incomingRingAudio.play();
          this.currentInfo.status = PortStatus.RINGING;
          setTimeout(() => {
            this.tokySession.acceptCall();
            this._isThereAnyActiveCall = true;
          }, 1000);
        }
      }
      console.warn(invite);
      //
      // setTimeout(() => {
      //   if (this.tokySession) {
      //     this.tokySession.acceptCall();
      //   }
      // }, 5000);//automaticamente contestamos
    });
  }

  /*private AcceptInboundCall():void {
    this.currentInfo.status = PortStatus.STARTING_INBOUND_CALL;    
    this.currentInfo.status = PortStatus.RINGING;
    this.tokySession.acceptCall();
  }*/

  private addEventListenersTokySession() {
    this.tokySession.on(SessionStatus.MUTED, () => {
      console.log(`#[${this.idDatabase}]-tokySession-MUTED`);
      this._isThereAnyActiveCall = true;
    });
    this.tokySession.on(SessionStatus.UNMUTED, () => {
      console.log(`#[${this.idDatabase}]-tokySession-UNMUTED`);
      this._isThereAnyActiveCall = true;
    });
    this.tokySession.on(SessionStatus.HOLD, () => {
      console.log(`#[${this.idDatabase}]-tokySession-HOLD`);
      this.currentInfo.status = PortStatus.HOLD;
      this._isThereAnyActiveCall = true;
      this._isOnHold = true;
    });
    this.tokySession.on(SessionStatus.UNHOLD, () => {
      console.log(`#[${this.idDatabase}]-tokySession-UNHOLD`);
      this.currentInfo.status = PortStatus.CONNECTED;
      this._isThereAnyActiveCall = true;
      this._isOnHold = false;
    });
    this.tokySession.on(SessionStatus.HOLD_NOT_AVAILABLE, () => {
      console.log(`#[${this.idDatabase}]-tokySession-HOLD_NOT_AVAILABLE`);
    });
    this.tokySession.on(SessionStatus.RECORDING, () => {
      console.log(`#[${this.idDatabase}]-tokySession-RECORDING`);
      this._isThereAnyActiveCall = true;
    });
    this.tokySession.on(SessionStatus.NOT_RECORDING, () => {
      console.log(`#[${this.idDatabase}]-tokySession-NOT_RECORDING`);
      this._isThereAnyActiveCall = true;
    });
    this.tokySession.on(SessionStatus.RECORDING_NOT_AVAILABLE, () => {
      console.log(`#[${this.idDatabase}]-tokySession-RECORDING_NOT_AVAILABLE`);
    });

    this.tokySession.on(SessionStatus.TRYING, () => {
      console.log(`#[${this.idDatabase}]-tokySession-TRYING`);
    });
    this.tokySession.on(SessionStatus.RINGING, () => {
      console.log(`#[${this.idDatabase}]-tokySession-RINGING`);
      this.currentInfo.status = PortStatus.DIALING;
      this._isThereAnyActiveCall = true;
      setTimeout(() => {
        console.log('jaja');
        if (this.currentInfo.status === PortStatus.DIALING) {
          console.warn(
            'ya pasaron los 19 segundos de dialing o discado. Cancelaremos la marcacion y reagendaremos'
          );
          this.tokySession.endCall();
        }
      }, 23000);
    });

    this.tokySession.on(SessionStatus.CONNECTED, () => {
      console.log(`#[${this.idDatabase}]-tokySession-CONNECTED`);
      this.currentInfo.status = PortStatus.CONNECTED;
      //eomc 1 para la opcion 1 que si funciona y es la mejor simplemente comenta la llamada a la funcion makeTransfer de abajo,
      //pero el la media del perfilador permanecera en la app de Angular

      //eomc 2 opcion 2 si funciona pero usando un ivr, y la media permanecera en la app de Toky
      if (this.optionCallTypeUI === OptionUI.Op2_By_Ivr) {
        this.tokySession.makeTransfer({
          type: TransferEnum.NUMBER, // TransferEnum.GROUP or TransferEnum.NUMBER or TransferEnum.AGENT
          destination: this.IvrPhoneNumber, //  'TEC_CDMX'          or '+525535243238'    or 'dessire.pena@truehome.com.mx'
          option: TransferOptionsEnum.BLIND, //or TransferOptionsEnum.WARM OR TransferOptionsEnum.BLIND
        });
      }

      this._isThereAnyActiveCall = true;
    });

    this.tokySession.on(SessionStatus.REJECTED, () => {
      console.log(`#[${this.idDatabase}]-tokySession-REJECTED`);
      setTimeout(() => this.freePort(), 600);
    });
    this.tokySession.on(SessionStatus.FAILED, () => {
      console.log(`#[${this.idDatabase}]-tokySession-FAILED`);
      setTimeout(() => this.freePort(), 600);
    });
    this.tokySession.on(SessionStatus.BYE, () => {
      console.log(`#[${this.idDatabase}]-tokySession-BYE`);
      if (this.isWaitingTransfer) {
        this.currentInfo.status = PortStatus.TRANSFER_SUCCESS;
      } else {
        this.currentInfo.status = PortStatus.END_CALL;
      }

      setTimeout(() => this.freePort(), 600);
    });

    // para transferencias
    this.tokySession.on(SessionStatus.TRANSFER_FAILED, (argsTransError) => {
      console.log(
        `#[${this.idDatabase}]-tokySession-TRANSFER_FAILED->${JSON.stringify(
          argsTransError
        )}`
      );
      setTimeout(() => this.freePort(), 600);
    });
    this.tokySession.on(SessionStatus.TRANSFER_BLIND_INIT, () => {
      console.log(`#[${this.idDatabase}]-tokySession-TRANSFER_BLIND_INIT`);
      this.currentInfo.status = PortStatus.TRANSFERRING;
      this.isWaitingTransfer = true;
      if (this.transfiriendoAIvr === true) {
        //setTimeout(()=>this.tokySession.endCall(),2000);
        this.currentInfo.status = PortStatus.TRANSFERRING_IVR;
      }
    });
    this.tokySession.on(SessionStatus.TRANSFER_WARM_INIT, () => {
      console.log(`#[${this.idDatabase}]-tokySession-TRANSFER_WARM_INIT`);
      this.currentInfo.status = PortStatus.TRANSFERRING;
      this.isWaitingTransfer = true;
      this._isThereAnyActiveCall = true;
      //   setTimeout(()=>{
      //     if(this.currentInfo.status===PortStatus.TRANSFERRING){
      //       if(this.transfiriendoAIvr===false){
      //         this.tokySession.cancelTransfer()
      //                           .then(() => {
      //                             this.transfiriendoAIvr=true;
      //                             console.warn('--- Cancel Transfer action success')
      //                             this.tokySession.makeTransfer({
      //                               type: TransferEnum.NUMBER, // TransferEnum.GROUP or TransferEnum.NUMBER or TransferEnum.AGENT
      //                               destination: "+525585262096", //  'TEC_CDMX'          or '+525535243238'    or 'dessire.pena@truehome.com.mx'
      //                               option: TransferOptionsEnum.BLIND, //or TransferOptionsEnum.WARM OR TransferOptionsEnum.BLIND
      //                             })
      //                           })
      //                           .catch(() => {
      //                             console.warn('--- Cancel Transfer action unsuccess')
      //                           });

      //       }else{
      //         this.currentInfo.status = PortStatus.TRANSFERRING_IVR;
      //       }

      //     }
      // },3000);
    });
    this.tokySession.on(SessionStatus.TRANSFER_WARM_ANSWERED, () => {
      console.log(`#[${this.idDatabase}]-tokySession-TRANSFER_WARM_ANSWERED`);
    });
    this.tokySession.on(SessionStatus.TRANSFER_WARM_NOT_ANSWERED, () => {
      console.log(
        `#[${this.idDatabase}]-tokySession-TRANSFER_WARM_NOT_ANSWERED`
      );
      this._isThereAnyActiveCall = true;
    });
    this.tokySession.on(SessionStatus.TRANSFER_WARM_COMPLETED, () => {
      console.log(`#[${this.idDatabase}]-tokySession-TRANSFER_WARM_COMPLETED`);
    });
    this.tokySession.on(SessionStatus.TRANSFER_WARM_NOT_COMPLETED, () => {
      console.log(
        `#[${this.idDatabase}]-tokySession-TRANSFER_WARM_NOT_COMPLETED`
      );
      this._isThereAnyActiveCall = true;
    });
  }

  private freePort(): void {
    this.tokySession = null;
    this.optionCallTypeUI = OptionUI.Op0_Undefined;
    this.currentInfo.status = PortStatus.READY;
    this.isWaitingTransfer = false;
    this.currentInfo.businessTarget!.lead.telephone.number = '';
    this.currentInfo.businessTarget!.agentAssigned.email = '';
    this.transfiriendoAIvr = false;
    this._isThereAnyActiveCall = false;
    this._isOnHold = false;
  }

  public configureAgentAssigned(emailAgent: string): void {
    this.currentInfo.businessTarget!.agentAssigned.email = emailAgent;
  }

  public configureIvrOfAgentAssigned(ivrPhone: string): void {
    this.IvrPhoneNumber = ivrPhone;
  }

  public configureOptionCallType(opt: OptionUI): void {
    this.optionCallTypeUI = opt;
  }
  public hangUp(): void {
    try {
      if (this.tokySession) {
        this.tokySession.endCall();
      }
    } catch (e) {
      console.error(e);
    }
  }

  public launchCall(
    phoneOutCompany: string,
    leadPhone: string,
    countryCodePhoneLead: string
  ): void {
    try {
      const dataOutgoingCall = {
        phoneNumber: `${
          countryCodePhoneLead.startsWith('+') ? '' : '+'
        }${countryCodePhoneLead}${leadPhone}`, // example number lead ,
        callerId: phoneOutCompany, //'+525585262096' numero de truehome TEC, example caller id from the company ,
      };

      console.log(
        `[${this.idDatabase}]-trying to launch outgoing call to ${
          dataOutgoingCall.phoneNumber
        } from this number:${dataOutgoingCall.callerId}. Agent Assigned:${
          this.currentInfo.businessTarget!.agentAssigned.email
        }`
      );

      this.tokyClient!.startCall(dataOutgoingCall);
      this.currentInfo.businessTarget!.lead.telephone.number = leadPhone;
      console.log(
        `[${this.idDatabase}]-started launch outgoing call to ${
          dataOutgoingCall.phoneNumber
        } from this number:${dataOutgoingCall.callerId}. Agent Assigned:${
          this.currentInfo.businessTarget!.agentAssigned.email
        }`
      );
    } catch (e) {
      console.log('error lanzando llamada', e);
    }
  }
}
