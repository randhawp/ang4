import {Component, OnInit, ViewChild,Inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {Observable, merge, of as observableOf} from 'rxjs';
import {catchError, map, startWith, switchMap} from 'rxjs/operators';
import {User} from '../../../models/users'
import {WebapiService} from '../../../services/webapi.service'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Pipe, PipeTransform } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import {Router} from '@angular/router';
import {StateService} from '../../../services/state.service'
@Component({
  selector: 'app-bank',
  templateUrl: './bank.component.html',
  styleUrls: ['./bank.component.css']
})
export class BankComponent implements OnInit {

  url:string;
  bankdata:any;
  selectedBank:string;
  selectedBankName:string;
  newBankName:string;
  mode:number=0; 
  
  constructor(private http: HttpClient, private webapi:WebapiService,public dialog: MatDialog,public auth:AuthService, r:Router,public state:StateService) { }

  ngOnInit() {
   this.getBankList()
  }

  getBankList(){
    this.url="admin?function=list_bank"
    console.log(this.url)
    this.mode=0
    this.webapi.call('GET',this.url,this,null)


  }
  updateName(){
    console.log("name updated to " + this.newBankName)
  }

  updateBankDetails(){
    console.log("final " + this.newBankName + " for " + this.selectedBank)
    this.url="admin?function=edit_bank&name="+this.selectedBank+"&fullname="+this.newBankName
    this.mode=1
    this.webapi.call('GET',this.url,this,null)
  }
  
  
  onClick(n){
    this.selectedBankName = n
    console.log(n)
  }

  webapiCallback(message: string, result: any){

    console.log("$$$$$$$$$$$$$$$$$$$$$$$")
   if(this.mode == 0 ){
    console.log(result[0])
    console.log(result[0].fullname)
    this.bankdata = result
    this.selectedBank = result[0].fullname
  }
  if (this.mode == 1){
      this.getBankList()
      alert(message)
  }

  }
}
