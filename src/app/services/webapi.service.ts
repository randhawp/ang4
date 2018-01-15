import { Injectable } from '@angular/core';
import { HttpClient,HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { MessageService} from './message.service'
import { StateService } from './state.service';
import {AuthService} from './auth.service'
import {  CognitoUser, CognitoAccessToken,CognitoIdToken,CognitoRefreshToken, CognitoUserSession } from 'amazon-cognito-identity-js';


@Injectable()
export class WebapiService {

  access:string;
  token:string;
  url:string='https://tyyzqr1pd0.execute-api.us-east-1.amazonaws.com/alpha/test';

  constructor(private http: HttpClient,private messageService: MessageService, private state:StateService,private auth:AuthService) { 
    console.log("service init...")

  }

  
  set userToken(value: string) { 
    console.log("setting value of token")
    this.state.token = value; 
  } 
  get userToken():string { 
    console.log("Reading value of token")
    return this.state.token; 
  } 

  
  getUserAccessRights() {
    
    console.log("getUserAccessRights -- init")
   
    console.log(this.state.token)
    let headers = new HttpHeaders();
    let oh = headers.append('Content-Type', 'application/json');
    let oh1 = oh.append('Authorization',  this.state.token );
    console.log("getUserAccessRights -- calling http get")
    this.http.get('https://tyyzqr1pd0.execute-api.us-east-1.amazonaws.com/alpha/test',{headers: oh1}).subscribe(data => {
    console.log(data);
    });
    
    
  }

  get accessdata():string { 
    return this.state.user; 
  } 
 set accessdata(value: string) { 
   this.state.access = value; 
 } 
 
}



