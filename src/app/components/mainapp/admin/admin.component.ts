import { Component, OnInit } from '@angular/core';
import {StateService} from '../../../services/state.service'
import {Router} from '@angular/router'
import {WebapiService} from '../../../services/webapi.service'

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
   tokenage:number;
   data:any;

  constructor(public state:StateService, private router:Router,public webapi: WebapiService ) { }

  ngOnInit() {
    //this.webapi.call('GET','test',this) //to test session refresh
  }

  DoWork(x){
    console.log("doing work")
    
    this.router.navigate(['/mainapp/receipts']);
  }

  webapiCallback(message: string, result: any){

    console.log(message)
    this.data = message
  
  }

}
