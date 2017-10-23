import { Component, OnInit, Injectable } from '@angular/core';
import {NgForm} from '@angular/forms';
import { AwsService } from '../../services/aws.service';
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
  
  constructor(public awsService:AwsService, private router:Router){
  }
  
  ngOnInit() {
    console.log("init login")
  }
  
  onLogin(form: NgForm){
    this.provider="cup"
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
       console.log("logged in....")
       console.log("token in callback is")
       console.log(this.awsService.token)
       this.router.navigate(['/']);
      // this.setToken(result.getIdToken().getJwtToken());
      // this.loggedInCreds.token=this.getToken();
      // this.googleConfirmed = null;
      // this.provider = "Cognito User Pools";
      // this.userDataFromUserPools();
    }
  }


}