import { Component, OnInit, Injectable,ViewChild } from '@angular/core';
import {NgForm} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Callback } from '../../services/aws.service';
import { Subscription } from 'rxjs';
import {Router} from '@angular/router'
import { MessageService} from '../../services/message.service'

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  provider:string;
  subscription: Subscription;
  message:string;
  user:string;
  index:number = 0;
  @ViewChild('f') receiptForm: NgForm;
  selectedValue: string;

  offices = [
    {value: 'abbotsford', viewValue: 'Abbotsford'},
    {value: 'vancouver', viewValue: 'Vancouver'},
    {value: 'surrey', viewValue: 'Surrey'},
    {value: 'mississauga', viewValue: 'Mississauga'}
  ];

  constructor(public auth:AuthService, private router:Router,private messageService: MessageService){
    this.subscription = this.messageService.getMessage().subscribe(messagex => { this.update(messagex) });
  }

  ngOnInit() {
  }

  onSignup(form: NgForm){
    //this.provider="cup"
    console.log(form.value.loginname)
    const loginname = form.value.loginname
    const password = form.value.password
    const password2 = form.value.password
    if (password != password2){

      return;
    }
    const email = form.value.email
    const phone = form.value.phone
    console.log("username is" + loginname + "email is "+email+" phone is "+phone + "password id " +password)
    console.log(this.selectedValue)
    this.auth.signupUser(loginname,email,phone, password,this.selectedValue)
    

  }

  update(msgobj){
  console.log("############ callback")
    const msg1 = JSON.stringify(msgobj)
    var msg = JSON.parse(msg1)
    console.log(msg)
    let  arr:string[] = msg.text.split(",")
    var header:string = arr[0]
    var fmsg:string = arr[1]

    if (header == 'ERR') {
      this.index = 1
      this.message = fmsg;
      
    }
    if (header == 'PASS') {
      this.index = 2
      this.message = fmsg;
      this.receiptForm.reset(); 
  
    }
  }

}