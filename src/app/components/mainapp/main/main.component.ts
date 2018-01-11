import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  constructor(public auth:AuthService,private router:Router) { }

  ngOnInit() {
   if (this.auth.isLogged() == false){
      console.log("user not logged in")
      this.router.navigate(['login']);
    }
  
  }

  

}
