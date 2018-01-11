import { Component, OnInit, Injectable } from '@angular/core';
import {NgForm} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Callback } from '../../services/aws.service';
import { Subscription } from 'rxjs';
import {Router} from '@angular/router'
import { MessageService} from '../../services/message.service'


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
 
  constructor(public auth:AuthService, private router:Router,private messageService: MessageService){
   
    this.subscription = this.messageService.getMessage().subscribe(messagex => { this.update(messagex) });
    
  }
  
  ngOnInit() {
    console.log("init login")
    if (this.auth.isLogged() == true){
      console.log("will route to main")
      this.router.navigate(['/mainapp/recepits']);
    }
  }

 
  
  onLogin(form: NgForm){
    //this.provider="cup"
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
      console.log("++++++++++++++++++++++++++")
      this.router.navigate(['/mainapp/receipts']);
      }
    }
          
    
    //this.message = msg1; 
   
    console.log("do other things" + fmsg)
    console.log("success" + header)
    
  }


}