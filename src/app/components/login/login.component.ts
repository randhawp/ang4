import { Component, OnInit, Injectable } from '@angular/core';
import {NgForm} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Callback } from '../../services/aws.service';
import { Subscription } from 'rxjs';
import {Router} from '@angular/router'


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
@Injectable()

export class LoginComponent implements OnInit {

  provider:string;
  
  constructor(public auth:AuthService, private router:Router){
  }
  
  ngOnInit() {
    console.log("init login")
  }
  
  onLogin(form: NgForm){
    //this.provider="cup"
    console.log(form.value.loginname)
    const loginname = form.value.loginname
    const password = form.value.password
    this.auth.loginUser(loginname,password)
    

  }


}