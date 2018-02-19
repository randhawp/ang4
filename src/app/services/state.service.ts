import { Injectable } from '@angular/core';

@Injectable()
export class StateService {

  constructor() { 
    console.log(">>>>>>>>>>>>> STATE SERVICE STARTED <<<<<<<<<<<<<<")

  }

  user:string=null;
  access:string=null;
  token:string=null;
  tokenage:number=0;
  office:string=null;

  getUserSecurityLevel( level):number {
    if (level == null ) return 0;
    if (level == 'AGENT' ) return 1;
    if (level == 'BADMIN' ) return 2;
    if (level == 'HADMIN' ) return 3;
    if (level == 'SADMIN' ) return 4;

  }

  
}
