import { Component, OnInit } from '@angular/core';
import {NgForm} from '@angular/forms';
import { AwsService } from '../../services/aws.service';
import { Callback } from '../../services/aws.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  provider:string;
  
  constructor(public awsService:AwsService){
  }
  
  ngOnInit() {
    console.log("init login")
  }
  
  onLogin(form: NgForm){
    this.provider="cip"
    console.log(form.value.loginname)
    const loginname = form.value.loginname
    const password = form.value.password
    this.awsService.authenticateUserPool(loginname,password,this);
    

  }

  cognitoCallback(message:string, result:any) {
    if (message != null) { // error
      //this.errorMessage = message;
      console.log("error "+message)
    } else { // success
       console.log("logged in")
      // this.setToken(result.getIdToken().getJwtToken());
      // this.loggedInCreds.token=this.getToken();
      // this.googleConfirmed = null;
      // this.provider = "Cognito User Pools";
      // this.userDataFromUserPools();
    }
  }


}