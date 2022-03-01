export interface InvitePkg {
    agentData: AgentData;
    callData:  CallData;
}

export interface AgentData {
    agentId:     string;//Es el mismo correo de nuestro perfilador "misael@truehome.com.mx"
    sipUsername: string;//"misael__truehome.com.mx"
    companyId:   string;
}

export interface CallData {
    remoteUserId:    string;
    remoteUserType:  string;
    userAgent:       string;//"call-queued" cuando viene del Dial Engine
                            //"telephone-network" cuando viene del IVR

    //Estas son opcionales y tienen un valor solo cuando es una llamada de transferencia desde Dial Engine                        
    transferredBy?:   string;
    transferredType?: string;//warm ó blind

    //Estas son opcionales y tiene valor solo es una llamada que llega desde un IVR
    remoteUserLocation?:string;//Para mi ejemplo Dice 'MX'
    did?:string;// Trae el numero del IVR, para el ejemplo es "+525585262096"
    ivrId?:string;//trae el id del IVR que Toky administra y asigna, para el ejemplo es "21768"
}


//Ejemplo de Invite cuando es de transferencia, es decir, que la llamada viene desde el Dial Engine
/*
{
    "agentData": {
      "agentId": "dessire.pena@truehome.com.mx",
      "sipUsername": "dessire.pena__truehome.com.mx",
      "companyId": "41441"
    },
    "callData": {
      "remoteUserId": "+525514837767",
      "remoteUserType": "contact",
      "userAgent": "call-queued",
      "transferredBy": "erik.montes+demo__truehome.com.mx",
      "transferredType": "warm"
    }
  }*/

  //Ejemplo de Invite cuando la llamada viene desde el IVR
/*
  {
    "agentData": {
      "agentId": "misael@truehome.com.mx",
      "sipUsername": "misael__truehome.com.mx",
      "companyId": "41441"
    },
    "callData": {
      "remoteUserId": "+525530396748",
      "remoteUserType": "contact",
      "remoteUserLocation": "MX",
      "did": "+525585262096",
      "ivrId": "21768",
      "userAgent": "telephone-network"
    }
  }
  */