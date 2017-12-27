import { Component, OnInit, Injectable } from '@angular/core';
import {NgForm} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Callback } from '../../services/aws.service';
import { Subscription } from 'rxjs';
import {Router} from '@angular/router'


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  constructor(public auth:AuthService, private router:Router){
  }

  ngOnInit() {
  }

  onSignup(form: NgForm){
    //this.provider="cup"
    console.log(form.value.loginname)
    const loginname = form.value.loginname
    const password = form.value.password
    const email = form.value.email
    const phone = form.value.phone
    console.log("username is" + loginname + "email is "+email+" phone is "+phone + "password id " +password)
    this.auth.signupUser(loginname,email,phone, password)
    

  }

}
