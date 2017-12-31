import { Component, OnInit, Injectable , OnDestroy} from '@angular/core';
import {NgForm} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Callback } from '../../services/aws.service';

import {Router} from '@angular/router'
import {Observable} from 'rxjs/Observable'
import 'rxjs/add/observable/timer'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/take'
import { Subscription } from 'rxjs/Subscription';
import { MessageService} from '../../services/message.service'

import {  Input, Output, EventEmitter } from '@angular/core';
@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.css']
})
export class ForgotpasswordComponent implements OnInit, OnDestroy  {

   message:string;
   countDown;
   counter = 60;
   subscription: Subscription;

  constructor( public auth:AuthService, private router:Router,private messageService: MessageService) { 
    this.subscription = this.messageService.getMessage().subscribe(message => { this.message = message; });
  }
  

  ngOnInit() {
  }
  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.subscription.unsubscribe();
  }
  mywait(){

  }
  sleep(delay) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
  }
  myEvent(event){
    this.sleep(3000)
    console.log("called...."+event)
    this.updateMsg()
  }
  
  requestCode(form: NgForm){
    //this.provider="cup"
    console.log(form.value.loginname)
    const loginname = form.value.loginname
   
    //this.auth.loginUser(loginname,password)
    this.auth.forgotPassword(loginname)
    console.log (">>> 2 ")

  }

  
  updateMsg(){
    console.log("calling updateMg")
    this.message = this.auth.getVerificationMsgResult()
  }

}
