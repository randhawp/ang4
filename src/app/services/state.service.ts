import { Injectable } from '@angular/core';

@Injectable()
export class StateService {

  constructor() { 
    console.log(">>>>>>>>>>>>> STATE SERVICE STARTED <<<<<<<<<<<<<<")

  }

  user:string=null;
  access:string=null;
  token:string=null;
  tokenage:number=0

  
}
