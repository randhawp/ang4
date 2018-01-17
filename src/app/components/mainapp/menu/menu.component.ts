import { Component, OnInit } from '@angular/core';
import {StateService} from '../../../services/state.service'
import { MessageService} from '../../../services/message.service'
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
 
  access:number;
  adminaccess:boolean=false;
  subscription: Subscription;

  constructor(private state:StateService,private messageService: MessageService) {
    this.subscription = this.messageService.getMessage().subscribe(messagex => { this.update(messagex) });
   }

  ngOnInit() {
    console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++ ngoninit+++++")
   
  }

  set userAccess(value:string){
    this.state.access = value
  }

  get userAccess():string{
    return this.state.access;
  }

  renderMenu(){
    if( this.state.access == "AGENT" ) {
      console.log("this is agent")
      this.access = 0
    }else if (this.state.access =="BADMIN"){
      console.log("this is B admin")
      this.access = 1
    }else if (this.state.access == "HADMIN"){
      console.log("this is H admin")
      this.access = 2
    }else if( this.state.access == "SADMIN"){
      this.access = 3
      console.log("systed admin")
    }

  }

  update(msgobj){
    console.log("message rcvd")
    const msg1 = JSON.stringify(msgobj)
    var msg = JSON.parse(msg1)
    
    let  arr:string[] = msg.text.split(",")
    var header:string = arr[0]
    if (header == 'REFRESHMENU') {
      console.log("rendering menu")
      this.renderMenu()
    }
    
  }

}
