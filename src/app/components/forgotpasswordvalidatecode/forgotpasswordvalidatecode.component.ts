import { Component, OnInit, Injectable , OnDestroy} from '@angular/core';
import {NgForm} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Callback } from '../../services/aws.service';
import {Router} from '@angular/router'
import {Observable} from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription';
import { MessageService} from '../../services/message.service'

@Component({
  selector: 'app-forgotpasswordvalidatecode',
  templateUrl: './forgotpasswordvalidatecode.component.html',
  styleUrls: ['./forgotpasswordvalidatecode.component.css']
})
export class ForgotpasswordvalidatecodeComponent implements OnInit {

  message:string;
  header:string;
  subscription: Subscription;
  index:number

  constructor(public auth:AuthService, private router:Router,private messageService: MessageService) {
    this.subscription = this.messageService.getMessage().subscribe(messagex => { this.update(messagex) });
   }

  ngOnInit() {
  }
  requestCode(form: NgForm){
    this.message=""
    console.log(form.value.vcode)
    const vcode = form.value.vcode
    const password1 = form.value.password1
    const password2 = form.value.password2
    if (password1 != password2  ){
      this.message = "passwords do not match";
      return;  
    }
    this.auth.forgotPasswordValidate(vcode,password1)
  }

  update(msgobj){
  
    const msg1 = JSON.stringify(msgobj)
    var msg = JSON.parse(msg1)
    
    let  arr:string[] = msg.text.split(",")
    var header:string = arr[0]
    var fmsg:string = arr[1]

    if (header == 'ERR') {
      this.index=1
      this.message = "Password could not be reset";
    }
    if (header == 'PASS') {
     this.index=2 
     this.message = "Password reset"    
    }
          
    
    //this.message = msg1; 
   
    console.log("do other things" + fmsg)
    console.log("success" + header)
    
  }

}
