import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import {StateService} from '../../../services/state.service'
import {WebapiService} from '../../../services/webapi.service'
import { MessageService} from '../../../services/message.service'
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  constructor(public webapi: WebapiService ,public auth:AuthService,private router:Router,public state:StateService,private messageService: MessageService) { }
  username:string;
  ngOnInit() {

    if(this.data == null){
      console.log("user not logged in")
      this.auth.logout(this.auth.getCurrentUser())
    }
       
   if (this.auth.isLogged() == false  ){
      console.log("user not logged in")
      this.router.navigate(['login']);
    }else{
      this.username = this.data;
      this.webapi.call('GET','access?username='+this.data,this)
     
      
    }
  
  }

  get data():string { 
    return this.state.user; 
  } 
  set data(value: string) { 
    this.state.user = value; 
  } 
  set userToken(value: string) { 
    console.log("setting value of token")
    this.state.token = value; 
  } 
  get userToken():string { 
    console.log("Reading value of token...")
    return this.state.token; 
  } 
  set userAccess(value:string){
    this.state.access = value
  }
  webapiCallback(message: string, result: any){

    console.log(message)
    this.userAccess = message;
    this.messageService.sendMessage("REFRESHMENU");
  
  }

}
