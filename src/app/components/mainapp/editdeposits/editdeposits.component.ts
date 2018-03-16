import { Component, OnInit, ViewChild,Inject,ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import {MatPaginator, MatSort, MatTableDataSource, MatExpansionPanel} from '@angular/material';
import {StateService} from '../../../services/state.service'
import {WebapiService} from '../../../services/webapi.service'
import { MessageService} from '../../../services/message.service'

import {Observable} from 'rxjs/Observable';
import {merge} from 'rxjs/observable/merge';
import {of as observableOf} from 'rxjs/observable/of';
import {catchError} from 'rxjs/operators/catchError';
import {map} from 'rxjs/operators/map';
import {startWith} from 'rxjs/operators/startWith';
import {switchMap} from 'rxjs/operators/switchMap';
import {Receipt} from '../../../models/receipt'
import {MatDialog,MatDialogRef,MAT_DIALOG_DATA} from '@angular/material';
import {FormBuilder, Validators, FormGroup} from "@angular/forms";
import {SelectionModel} from '@angular/cdk/collections';

@Component({
  selector: 'app-editdeposits',
  templateUrl: './editdeposits.component.html',
  styleUrls: ['./editdeposits.component.css']
})
export class EditdepositsComponent implements OnInit {
  selectedBank:string;
  selectedBankName:string;
  mode:string="";
  url:string;
  rowdata: any;
  selectedRowIndex: number = -1;
  tableSelectedRow:number =-1;
  bankdata:any;
  startdate:string;
  enddate:string;
  dataSource = new MatTableDataSource();
  dataSourceDetail = new MatTableDataSource();
  displayedColumns = ['depositid', 'datecreated', 'depositamt','actions'];
  displayedColumnsDetail = ['date', 'amount', 'agentname','invoice','rcvdfrom','fortrip'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  resultsLength = 0;

  constructor(public webapi: WebapiService ,public state:StateService,private messageService: MessageService,public dialog: MatDialog) { }

  ngOnInit() {
    this.mode="BANKDATA"
    this.getBankList()
  }
  getBankList(){
    this.url="admin?function=list_bank"
    console.log(this.url)
    this.webapi.call('GET',this.url,this,null)
  }
  onClick(n,c){
    this.selectedBankName = n
    this.selectedBank =c
    console.log(n)
    console.log(this.selectedBank)
  }
  webapiCallback(message: string, result: any){

    console.log("in call back web")
   
    if (this.mode == "BANKDATA"){
      console.log("bank data")
      console.log(result[0])
      console.log(result[0].fullname)
      this.bankdata = result
      this.selectedBankName = result[0].fullname
      this.selectedBank = result[0].code
    }
    if (this.mode == "SEARCH"){
      console.log(result)
      console.log(result[0])
      this.dataSource.data = result
      this.dataSource.paginator = this.paginator;
    }
    
  }
  selectRow(row){
    this.rowdata = row
    console.log(row)
    console.log(row.details)
    let arr:Array<string> = row.details
    this.dataSourceDetail.data = arr
      //this.dataSource.paginator = this.paginator;
   
  }
  highlight(row,i){
    console.log(i);
    this.tableSelectedRow = i
    this.selectedRowIndex = row.username
    
  }

  onSubmitSearch(){
    console.log("submit search")
    console.log(this.startdate)
    console.log(this.enddate)
    console.log(this.selectedBank)
    this.url="receipt?function=search_deposit&bankac="+this.selectedBank+"&startdate="+this.startdate+"&enddate="+this.enddate
    console.log(this.url)
    this.webapi.call('GET',this.url,this,null)
    this.mode="SEARCH"

  }


}
