import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import {StateService} from '../../../services/state.service'
@Component({
  selector: 'app-changepassword',
  templateUrl: './changepassword.component.html',
  styleUrls: ['./changepassword.component.css']
})
export class ChangepasswordComponent implements OnInit {

  oldpassword:string;
  newpassword:string;
  newpassword1:string;
  user:string;

  constructor(public auth:AuthService,private state:StateService) { }

  ngOnInit() {

  }

  updatePassword(){
    if (this.newpassword != this.newpassword1){
      alert("Passwords do not match ! Not chaning password.")
      return;
    }
    console.log(this.oldpassword)
    console.log(this.newpassword)
    console.log(this.newpassword1)
    this.user = this.state.user
    console.log(this.user)
    this.auth.changePassword(this.user,this.oldpassword,this.newpassword)

  }

}
