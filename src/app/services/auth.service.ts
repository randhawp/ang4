import { Router } from '@angular/router';
import { AwsService } from './aws.service';
import { Injectable } from '@angular/core';
import { HttpClient,HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { MessageService} from './message.service'


@Injectable()
export class AuthService {
  token: string;
  message:string;
  msg:string = "Hello";
  user:String="xxxx" ;
  
  constructor(public awsService:AwsService,private router: Router,private http: HttpClient,private messageService: MessageService) {}

  setCurrentUser(user){
    
    this.user = new String(user);
    console.log("current user set at " + this.user)
  }

  getCurrentUser(){
    console.log("returned user as ...." + this.user)
    return this.user
  }
  loginUser(loginname: string, password: string) {
    console.log("calling")
    //this.awsService.provider="cup"
   
    this.awsService.authenticateUserPool(loginname,password,this);
    //this.awsService.authenticateIdentityPool(loginname,password,'us-east-1',this)
  }

  signupUser(username,email,phone, password,office){
    console.log("username us" +username + "email is "+email+" phone is "+phone + "password id " +password)
    this.awsService.registerUser(username,email,phone, password,office,this)
  }

  refreshSession(){
    console.log("refreshing sesion")
    this.awsService.refresh()
  }
  
  
  forgotPassword(username){
    this.awsService.forgotPassword(username,this)
  
  }

  forgotPasswordValidate(code,newpassword){
    this.awsService.forgotPasswordValidate(code,newpassword,this);
  }


  getVerificationMsgResult():string{
    return this.message
  }
  logout(user) {
   console.log("logout called....")
    this.awsService.logout(user)
    //this.router.navigate(['logout']);
  }

  

  isLogged():boolean{
    
    if (this.awsService.isSessionValid() == true){
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
  forgotPasswordCallback(message:string, result:any){
    if (message != null) { // error
      //this.errorMessage = message;
      
      console.log("error >> "+message)
     
      this.message = message
      console.log("1 "+this.msg)
      console.log("2 "+this.message)
      this.messageService.sendMessage(message);
       
    } else {
      message="success"
      console.log("success  "+ message)
      this.message = result
      this.messageService.sendMessage(result);
      
    }
  }


  registerUserCallback(message:string, result:any){
    if (message != null) { // error
      //this.errorMessage = message;
      const msg1 = JSON.stringify(message)
      var msg2 = JSON.parse(msg1)
      
      console.log("auth >> "+ message)
     
      var msg ="ERR, Registeration failed." + message
     
      this.messageService.sendMessage(msg);
       
    } else {
      var msg="PASS, You will shortly get an email from no-reply@verificationemail.com with steps to complete the registeration process."
     
      this.messageService.sendMessage(msg);
      
    }


  }

    forgotPasswordValidateCallback(message:string, result:any){
      if (message != null) { // error
        //this.errorMessage = message;
        
        console.log("auth >> "+message)
       
        this.message = message
       
        this.messageService.sendMessage(message);
         
      } else {
        message="ERR, no route to service found"
       
        this.messageService.sendMessage(message);
        
      }
  

  }
  cognitoCallback(message:string, result:any) {
    if (result != null && message == "PASS") { // error
      //this.errorMessage = message;
      
      console.log("the token is -----------")
      console.log(result)
     
      message = "PASS," + result
      this.messageService.sendMessage(message);
       
    } else {
      
      
      this.messageService.sendMessage(message);
      
    }
  }

  cognitoCallbackx(message:string, result:any) {
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