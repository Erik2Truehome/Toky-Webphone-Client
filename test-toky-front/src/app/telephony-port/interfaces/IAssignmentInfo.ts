export interface IAssignmentInfo {
  Id: number;
  Status: string;
  BusinessTarget: BusinessTargetReceived;
}

export interface BusinessTargetReceived {
  Lead: Lead;
  Agent: Agent;
}

export interface Agent {
  IdIntern: number;
  IdAssignator: string;
  Email: string;
  Name: string;
  Lastname: string;
  IvrPhone: string;
  ImageUrl: string;
  TelephoneForwarding: any;
}

export interface Lead {
  IdIntern: number;
  IdAssignator: string;
  Email: string;
  Name: string;
  Lastname: string;
  UrlProperty: string;
  Telephone: Telephone;
}

export interface Telephone {
  CountryCode: string;
  Number: string;
}
