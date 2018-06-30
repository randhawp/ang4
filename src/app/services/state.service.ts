import { Injectable } from '@angular/core';
import {Router} from '@angular/router';
@Injectable()
export class StateService {

  constructor(private router:Router) { 
    console.log(">>>>>>>>>>>>> STATE SERVICE STARTED <<<<<<<<<<<<<<")
    if ( this.user == null){
      console.log("Illegal attemp to log in")
      this.router.navigate(['login']);
    }

  }

  user:string=null;
  access:string=null;
  token:string=null;
  tokenage:number=0;
  office:string=null;
  receiptCount:number=0;
  lastPayType:string=null;
  lastRcvdFrom:string=null;
  lastReceiptAmount:number=0.00;
  

  getUserSecurityLevel( level):number {
    if (level == null ) return 0;
    if (level == 'AGENT' ) return 1;
    if (level == 'BADMIN' ) return 2;
    if (level == 'HADMIN' ) return 3;
    if (level == 'SADMIN' ) return 4;

  }

  
}
