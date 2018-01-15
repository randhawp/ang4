import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import {StateService} from '../../services/state.service'


@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {

  constructor(public auth:AuthService, private state:StateService) { 
    var s = state.user
    console.log("############ current user is " + s)
    auth.logout(auth.getCurrentUser())
  }

  get data():string { 
    return this.state.user; 
  } 
  set data(value: string) { 
    this.state.user = value; 
  } 

  ngOnInit() {
  }

}
