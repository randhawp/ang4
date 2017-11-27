import { Router } from '@angular/router';
import { AwsService } from './aws.service';
import { Injectable } from '@angular/core';

@Injectable()
export class AuthService {
  token: string;

  constructor(public awsService:AwsService,private router: Router) {}

  loginUser(loginname: string, password: string) {
    console.log("calling")
    //this.awsService.provider="cup"
    this.awsService.authenticateUserPool(loginname,password,this);
  }

  logout() {
   console.log("logout called....")
    this.token = null;
  }

  getToken() {
    return this.token;
  }

  isLogged():boolean{
    if (this.token != null){
      return true;
    }else{
      return false;
    }


  }

  isAuthenticated() {
    const promise = new Promise(
      (resolve,reject) => {
        resolve(this.isLogged);
        }   
          );
    return promise;
  }
  
  cognitoCallback(message:string, result:any) {
    if (message != null) { // error
      //this.errorMessage = message;
      console.log("error "+message)
    } else { // success
       console.log("logged in....")
       console.log("token in callback is")
       //console.log(this.awsService.token)
       
       this.token =result.getIdToken().getJwtToken();
      // this.loggedInCreds.token=this.getToken();
      // this.googleConfirmed = null;
      // this.provider = "Cognito User Pools";
      // this.userDataFromUserPools();

      this.router.navigate(['/mainapp/main']);
    }
  }
}