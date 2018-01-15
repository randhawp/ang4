import { Component, OnInit, Injectable } from '@angular/core';
import {NgForm} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Callback } from '../../services/aws.service';
import { Subscription } from 'rxjs';
import {Router} from '@angular/router'
import { MessageService} from '../../services/message.service'
import {StateService} from '../../services/state.service'



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
@Injectable()

export class LoginComponent implements OnInit {

  provider:string;
  subscription: Subscription;
  message:string;
  user:string;
 
  constructor(public auth:AuthService, private router:Router,private messageService: MessageService,private state:StateService){
   
    this.subscription = this.messageService.getMessage().subscribe(messagex => { this.update(messagex) });
    
  }

  get userdata():string { 
    return this.state.user; 
  } 
  set userdata(value: string) { 
    this.state.user = value; 
  } 

  get userToken():string { 
    return this.state.token; 
  } 
  set userToken(value: string) { 
    this.state.token = value; 
  } 
  
  ngOnInit() {
    console.log("init login")
    if (this.auth.isLogged() == true){
      console.log("will route to main")
      this.router.navigate(['/mainapp/receipts']);
    }
  }

 
  
  onLogin(form: NgForm){
    //this.provider="cup"
    this.userdata = (form.value.loginname)
    console.log(form.value.loginname)
    const loginname = form.value.loginname
    this.auth.setCurrentUser(loginname)
    const password = form.value.password
    this.auth.loginUser(loginname,password)
    //this.auth.refreshSession()
   
  }
  update(msgobj){
  
    const msg1 = JSON.stringify(msgobj)
    var msg = JSON.parse(msg1)
    
    let  arr:string[] = msg.text.split(",")
    var header:string = arr[0]
    var fmsg:string = arr[1]

    if (header == 'ERR') {

      this.message = fmsg;
    }
    if (header == 'PASS') {
      if (this.auth.isLogged() == true){
      console.log("token found in loging")  
      console.log(fmsg)
      this.userToken = fmsg
      this.router.navigate(['/mainapp/receipts']);
      }
    }
          
    
    //this.message = msg1; 
   
    console.log("do other things" + fmsg)
    console.log("success" + header)
    
  }


}