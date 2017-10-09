import { Injectable } from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as AWS from 'aws-sdk';
import * as AWSCognito from 'amazon-cognito-identity-js';

//declare let AWS: any;
//declare let AWSCognito: any;
declare let apigClientFactory: any;

export interface Callback {
  cognitoCallback(message: string, result: any):void;
  cognitoCallbackWithCreds(message: string, result: any, creds: any, data:any):void;
  googleCallback(creds: any, profile: any);
  googleCallbackWithData(data: any);
  testCallback(result:any, err:any);
}

@Injectable()
export class AwsService {
  token:any;
  googleCreds:any;
  googleProfile:any;
  googleData:any;
  userData:any;

 /************ RESOURCE IDENTIFIERS *************/

  googleId:string = 'XXXXXXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com';
  poolData = { 
        UserPoolId : 'XXXXXXXXXXXXXXXXXXXXXXXXXXX', //CognitoUserPool
        ClientId : 'XXXXXXXXXXXXXXXXXXXXXXXXXXX', //CognitoUserPoolClient 
        Paranoia : 7
    };
  identityPool:string = 'XXXXXXXXXXXXXXXXXXXXXXXXXXX'; //CognitoIdentityPool 
  apiURL:string = 'XXXXXXXXXXXXXXXXXXXXXXXXXXX';  //ApiUrl
  region:string = 'us-east-1'; //Region Matching CognitoUserPool region

 /*********************************************/

  constructor(private _http:Http) {
    AWS.config.update({
      region: this.region,
      credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: ''
      })
    });
    AWS.config.region = this.region;
    AWS.config.update({accessKeyId: 'null', secretAccessKey: 'null'});
   }

  
  
}