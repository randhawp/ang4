import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import {StateService} from '../../../services/state.service'
import {WebapiService} from '../../../services/webapi.service'

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  constructor(public webapi: WebapiService ,public auth:AuthService,private router:Router,public state:StateService) { }

  ngOnInit() {
       
   if (this.auth.isLogged() == false){
      console.log("user not logged in")
      this.router.navigate(['login']);
    }else{
    
      this.webapi.call('GET','access?username='+this.data)
     
      
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

  

}
