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
   imessage:string
   header:string;
   countDown;
   counter = 60;
   subscription: Subscription;
   index:number;

  constructor( public auth:AuthService, private router:Router,private messageService: MessageService) { 
    this.subscription = this.messageService.getMessage().subscribe(messagex => { this.update(messagex) });
  }
  

  ngOnInit() {
  }
  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.subscription.unsubscribe();
  }
  
  sleep(delay) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
  }
  
  myEvent(event){
    this.sleep(3000)
    console.log("called...."+event)
   
  }
  
  requestCode(form: NgForm){
    console.log(form.value.loginname)
    const loginname = form.value.loginname
    this.auth.forgotPassword(loginname)
  }

  update(msgobj){
  
    const msg1 = JSON.stringify(msgobj)
    var msg = JSON.parse(msg1)
    
    let  arr:string[] = msg.text.split(",")
    var header:string = arr[0]
    var fmsg:string = arr[1]

    if (header == 'ERR') {
      this.index = 1
      this.message = "Request code being processed, if you do not get an email/SMS try again later";
    }
    if (header == 'PASS') {
      
      this.router.navigate(['forgotpasswordvalidate']);    
    }
          
    
    //this.message = msg1; 
   
    console.log("do other things" + fmsg)
    console.log("success" + header)
    
  }
  
  

}
