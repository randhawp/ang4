import { Component, OnInit, ViewChild,Inject,ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {StateService} from '../../../services/state.service'
import {WebapiService} from '../../../services/webapi.service'
import { MessageService} from '../../../services/message.service'

import {Observable, merge, of as observableOf} from 'rxjs';
import {catchError, map, startWith, switchMap} from 'rxjs/operators';
import {Receipt} from '../../../models/receipt'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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
  lastBank:string;
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
  selectedDepositId:number;
  selectedReceipts:string;
  selectedBankAc:string
  selectedDate:number
  panelOpenState:boolean;
  printReceiptList=[]
  receiptslist:string=""
  printrcpttotal:number=0;
  isCash:boolean=false;
  displayedColumns = ['depositid', 'datecreated', 'depositamt','actions'];
  displayedColumnsDetail = ['date', 'amount', 'agentname','invoice','rcvdfrom','fortrip'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('panel1') panel1: MatExpansionPanel;
  @ViewChild('panel2') panel2: MatExpansionPanel;
  @ViewChild('panel3') panel3: MatExpansionPanel;
  
  resultsLength = 0;

  constructor(public webapi: WebapiService ,public state:StateService,private messageService: MessageService,public dialog: MatDialog) { }

  ngOnInit() {
    this.mode="BANKDATA"
    this.getBankList()
    this.panel1.open()
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

    console.log("in call back web: deposit search")
   
    if (this.mode == "BANKDATA"){
      console.log("bank data")
      console.log(result[0])
      console.log(result[0].fullname)
      this.bankdata = result
      this.selectedBankName = result[0].fullname
      this.selectedBank = result[0].code
      this.lastBank = this.selectedBankName
    }
    if (this.mode == "SEARCH"){
      console.log(result)
      //console.log(result[0])
      this.dataSource.data = result
      this.dataSource.paginator = this.paginator;
      this.panel1.close()
      console.log("closing panel1")
      this.panel2.open()
    
      
    }
    if(this.mode == "UNDEPOSIT"){
      console.log("undeposit")
      let  arr:string[] = message.split("|")
      var status:string = arr[0]
      var servermsg:string = arr[1]
      
      if(status == "1"){
        alert("The deposit was rolled back")
      }else{
        alert("Rollaback of the deposit failed. Refresh and try again")
      }
     
      this.panel3.close()
      this.panel1.open()
    }
    
  }
  selectRow(row){
    let amt:number
    this.rowdata = row
    console.log(row)
    console.log(row.details)
    this.selectedDepositId = row.depositid
    this.selectedReceipts = row.receiptsid
    this.selectedBankAc = row.bankac
    this.selectedDate = row.datecreated
    let arr:Array<string> = row.details
    this.dataSourceDetail.data = arr
      //this.dataSource.paginator = this.paginator;
    this.panel2.close()
    this.panel3.open()
    var data = arr
    console.log("########")
    console.log(data)
    this.printReceiptList=[]
    this.receiptslist=""
    this.printrcpttotal=0
    var i = 0;
  for(let e of data) {
    this.receiptslist = this.receiptslist+","+e['id']+","+e['office']+","+e['date'] //WARNING do not change this format or else change on server too

    var v={"id": e["id"], "office": e['office'], "date": e['date'],"rcvdfrom": e['rcvdfrom'],"amount":e['amount'],"paytype":e['paytype']} 
    this.printReceiptList.push(v)
    amt = parseFloat(e['amount'] )
    console.log(amt)
    this.printrcpttotal = this.printrcpttotal + amt
    console.log(this.printrcpttotal)
    i+=1
  }
   
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
//incase of deposits the rstatus is not updated, that is only for posting, partial posting etc
//for deposits the depositid is used, when zero then the record is not deposited, and therfore on undeposit it is set back to zero - see lamda function
  unPost(){
    console.log(this.selectedDepositId)
    console.log(this.selectedReceipts)
    console.log(this.selectedBankAc)
    console.log(this.selectedDate) 
    console.log("unpost")
    this.url="receipt?function=undeposit&bankac="+this.selectedBankAc+"&datecreated="+this.selectedDate+"&receiptsid="+this.selectedReceipts+"&depositid="+this.selectedDepositId
    console.log(this.url)
    this.webapi.call('POST',this.url,this,null)
    this.mode="UNDEPOSIT"
  }

  printDeposit(){
    console.log("print")
    //console.log(this.printcah)
    let printContents, popupWin;
    //document.getElementById('print-section').innerHTML;
    //dummy = document.getElementById('print-section').innerHTML;
    printContents = document.getElementById('print-section').innerHTML;
    
    console.log(printContents)
    popupWin = window.open('', '_blank', 'top=50,left=50,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <title></title>
          <style>
          //........Customized style.......
          </style>
        </head>
    <body onload="window.print();window.close()">${printContents}</body>
      </html>`
    );
    
    popupWin.document.close();
    

  }


}
