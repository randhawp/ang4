import { Component, OnInit } from '@angular/core';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    console.log("init")
  }

  onLogin(form: NgForm){
    const loginname = form.value.loginname;
    const password  = form.value.password;
    console.log("dsd"+loginname)


  }

}
