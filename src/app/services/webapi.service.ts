import { Injectable } from '@angular/core';
import { HttpClient,HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { MessageService} from './message.service'
import { StateService } from './state.service';
import {AuthService} from './auth.service'
import {  CognitoUser, CognitoAccessToken,CognitoIdToken,CognitoRefreshToken, CognitoUserSession } from 'amazon-cognito-identity-js';
import { Observable }   from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {User} from '../models/users'
import {Receipt} from '../models/receipt'
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
    console.log("toekn ag is " + this.state.tokenage.toString() + " and time nos is " + n )
    var diff:number = n - this.state.tokenage
    diff = diff/(1000)
    console.log("time diff is " + diff.toString())
    if (diff > 3000){
      return true;
    }else{
      return false;
    }

  }

  
  call(method,name,callback,body) {
    
    if (this.isSessionStale() == true ){
      this.auth.refreshSession();
    }
    
    let headers = new HttpHeaders();
    let oh = headers.append('Content-Type', 'application/json');
    let oh1 = oh.append('Authorization',  this.state.token );
 console.log(this.state.token)
    var finalurl = this.url+'/'+name
    
    if(method == "GET"){
      this.http.get(finalurl,{headers: oh1}).subscribe(data => {
      
      if (data == null || data == "" ){
        callback.webapiCallback("void")
      } else {
        callback.webapiCallback( data.toString() , data)
      }
      });
    }
    
    if(method == "POST"){
      //let body = {}
      this.http.post(finalurl,JSON.stringify(body),{headers: oh1}).subscribe(data => {
      
      if (data == null || data == "" ){
        callback.webapiCallback("void")
      } else {
        callback.webapiCallback( data.toString() , data)
      }
      });
    }
    
  }
  
  getUser(): Observable<User[]> {

    var name:string="admin?function=list_all"
    let headers = new HttpHeaders();
    let oh = headers.append('Content-Type', 'application/json');
    let oh1 = oh.append('Authorization',  this.state.token );
    var finalurl = this.url+'/'+name
    return this.http.get<User[]>(finalurl,{headers: oh1});
  }

  
  getReceipts(office,datefrom,dateto,agent,amtfrom,amtto,role): Observable<Receipt[]> {

    var name:string="receipt?function=search&office="+office+"&datefrom="+datefrom+"&dateto="+dateto+"&agent="+agent
    +"&amtfrom="+amtfrom+"&amtto="+amtto+"&role="+role
    console.log(name)
    let headers = new HttpHeaders();
    let oh = headers.append('Content-Type', 'application/json');
    let oh1 = oh.append('Authorization',  this.state.token );
    var finalurl = this.url+'/'+name
    return this.http.get<Receipt[]>(finalurl,{headers: oh1});
  }
 
  getAllReceipts(): Observable<Receipt[]> {

    var office="surrey"
    var datefrom = 0
    var dateto = 0
    var agent ="jai2"
    var amtfrom =5
    var amtto = 5
    var role =2
    var name:string="receipt?function=search&office="+office+"&datefrom="+datefrom+"&dateto="+dateto+"&agent="+agent
    +"&amtfrom="+amtfrom+"&amtto="+amtto+"&role="+role
    console.log(name)
    let headers = new HttpHeaders();
    let oh = headers.append('Content-Type', 'application/json');
    let oh1 = oh.append('Authorization',  this.state.token );
    var finalurl = this.url+'/'+name
    return this.http.get<Receipt[]>(finalurl,{headers: oh1});
  }
  
 
 
}



