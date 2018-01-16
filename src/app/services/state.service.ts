import { Injectable } from '@angular/core';

@Injectable()
export class StateService {

  constructor() { 
    console.log(">>>>>>>>>>>>> STATE SERVICE STARTED <<<<<<<<<<<<<<")

  }

  user:string;
  access:string;
  token:string;

  
}
