import { Injectable } from '@angular/core';
import { HttpClient,HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { MessageService} from './message.service'
import { StateService } from './state.service';
import {AuthService} from './auth.service'
import {  CognitoUser, CognitoAccessToken,CognitoIdToken,CognitoRefreshToken, CognitoUserSession } from 'amazon-cognito-identity-js';
import { Observable }   from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {User} from '../models/users'
export interface Callback {
  webapiCallback(message: string, result: any):void;
 
}
@Injectable()
export class WebapiService {

  access:string;
  token:string;
  url:string='https://tyyzqr1pd0.execute-api.us-east-1.amazonaws.com/alpha';

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

  isSessionStale():boolean{
    var d = new Date();
    var n:number = d.getTime();
    var diff:number = n - this.state.tokenage
    diff = diff/(1000)
    if (diff > 3000){
      return true;
    }else{
      return false;
    }

  }

  
  call(method,name,callback) {
    
    if (this.isSessionStale){
      this.auth.refreshSession();
    }
    
    let headers = new HttpHeaders();
    let oh = headers.append('Content-Type', 'application/json');
    let oh1 = oh.append('Authorization',  this.state.token );
  
    var finalurl = this.url+'/'+name
    
 
    this.http.get(finalurl,{headers: oh1}).subscribe(data => {
  
    if (data == null || data == "" ){
      callback.webapiCallback("void")
    } else {
      callback.webapiCallback( data.toString() , data)
    }
    });
    
    
  }
  
  getUser(): Observable<User[]> {

    var name:string="admin?function=list_all"
    let headers = new HttpHeaders();
    let oh = headers.append('Content-Type', 'application/json');
    let oh1 = oh.append('Authorization',  this.state.token );
    var finalurl = this.url+'/'+name
    return this.http.get<User[]>(finalurl,{headers: oh1});
  }

 
 
 
 
}



