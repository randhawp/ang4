import { Injectable } from '@angular/core';
import {  CognitoUser, CognitoAccessToken,CognitoIdToken,CognitoRefreshToken, CognitoUserSession } from 'amazon-cognito-identity-js';

@Injectable()
export class StateService {

  constructor() { 
    console.log(">>>>>>>>>>>>> STATE SERVICE STARTED <<<<<<<<<<<<<<")

  }

  user:string;
  access:string;
  token:string;

  
}
