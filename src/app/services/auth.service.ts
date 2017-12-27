import { Router } from '@angular/router';
import { AwsService } from './aws.service';
import { Injectable } from '@angular/core';
import { HttpClient,HttpErrorResponse, HttpHeaders } from '@angular/common/http';


@Injectable()
export class AuthService {
  token: string;

  constructor(public awsService:AwsService,private router: Router,private http: HttpClient) {}

  loginUser(loginname: string, password: string) {
    console.log("calling")
    //this.awsService.provider="cup"
    this.awsService.authenticateUserPool(loginname,password,this);
    //this.awsService.authenticateIdentityPool(loginname,password,'us-east-1',this)
  }

  signupUser(username,email,phone, password){
    console.log("username us" +username + "email is "+email+" phone is "+phone + "password id " +password)
    this.awsService.registerUser(username,email,phone, password)
  }

  refreshSession(){
    console.log("refreshing sesion")
    this.awsService.refresh()
     
  
 

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
       //result.getAccessToken().getJwtToken()
       //result.getIdToken().getJwtToken()
       console.log(result)
       this.token = result.getIdToken().getJwtToken()
       
       let headers = new HttpHeaders();
       let oh = headers.append('Content-Type', 'application/json');
       let oh1 = oh.append('Authorization',  result.getIdToken().getJwtToken());
    //   headers.append( 'Access-Control-Allow-Origin', '*');
       //let x = this.awsService.getInfoApiUserPools(this.token)
       //console.log("print iuser info")
      //console.log(x)
       this.http.get('https://tyyzqr1pd0.execute-api.us-east-1.amazonaws.com/alpha/test',{headers: oh1} ).subscribe(data => {
        console.log(data);
      });
    
       
       
      // this.loggedInCreds.token=this.getToken();
      // this.googleConfirmed = null;
      // this.provider = "Cognito User Pools";
      // this.userDataFromUserPools();

      this.router.navigate(['/mainapp/main']);
    }
  }
}