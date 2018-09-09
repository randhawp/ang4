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
import {SetPayTypesPipe} from '../utilities/readablePayTypes'

@Component({
  selector: 'app-newdeposits',
  templateUrl: './newdeposits.component.html',
  styleUrls: ['./newdeposits.component.css']
})

export class NewdepositsComponent implements OnInit {
  @ViewChild('f') receiptForm: NgForm;
  @ViewChild('panel1') panel1: MatExpansionPanel;
  @ViewChild('panel2') panel2: MatExpansionPanel;
  submitted = false;
  receiptData = {
    id:'',
    office:'',
    datefrom: '',
    dateto: '',
    agent: '',
    amount: 0,
    usd: false,
    invoice: '',
    paytype:'',
    remarks:''
  };
  displayedColumns = ['select','id', 'office', 'amount', 'invoice','paytype','rcvdfrom','date'];
  selection = new SelectionModel<Element>(true, []);

  banks = [
    {value: '1', viewValue: 'Bank of A'},
    {value: '2', viewValue: 'Bank of B'},
    {value: '3', viewValue: 'Bank of C'}
  ];

  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  paytypes = [
    {value: 'cheque', viewValue: 'Cheque'},
    {value: 'directdeposit', viewValue: 'Direct Deposit'},
    {value: 'debit', viewValue: 'Debit'},
    {value: 'credit', viewValue: 'Credit'},
    {value: 'cash', viewValue: 'Cash'}
    
  ];

  //offices = [
  //  {value: 'surrey', viewValue: 'Surrey'},
  //  {value: 'vancouver', viewValue: 'Vancouver'},
  //  {value: 'toronto', viewValue: 'Toronto'}

  //]
  role:number = 0;
  officeName:string='';
  url:string='';

  userDb: ReceiptDao | null;
  
  dataSource = new MatTableDataSource();
  rowdata: any;
  editedForm:any;
  selectedRowIndex: number = -1;
  previousrow:number = -1
  selectedReceipt:string;
  mode:string = "";
  tableSelectedRow:number =-1;
  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;
  canDeposit = false;

  totalcash:number=0;
  totaldebit:number=0;
  totalcredit:number=0;
  totalcheque:number=0;
  totaldirect:number=0;
  totalsum:number=0;

  depositcashtotal:number=0;
  depositdebittotal:number=0;
  depositcredittotal:number=0;
  depositchequetotal:number=0;
  depositdirecttotal:number=0;
  deposittotal:number=0;

  receiptslist:string;
  cashdata:string;


  bankdata:any;
  selectedBank:string;
  selectedBankName:string;
  newBankName:string;
  lastDepositId:string
  cashboxshown:number=0;

  constructor(public webapi: WebapiService ,public state:StateService,private messageService: MessageService,public dialog: MatDialog) { }

  ngOnInit() {
    this.officeName = this.state.office;

    if (this.state.access == "AGENT" || this.state.access == "BADMIN"){
      this.role =1;
    }
    if (this.state.access == "HADMIN" || this.state.access == "SADMIN"){
      this.role =2;
    }
   
    this.getTableData()
    this.mode="BANKDATA"
    this.getBankList()
  }

  

  onSubmitSearch() {
    this.submitted = true;
    var t1 =  this.receiptForm.value.receiptFormData.datefrom;
    t1 = t1.getTime()
    this.receiptData.datefrom =t1
    
    var t2 = this.receiptForm.value.receiptFormData.dateto;
    t2 = t2.getTime() + (24*60*60*1000)
    this.receiptData.dateto = t2
    console.log(this.receiptData.datefrom)
   
    console.log(this.panel1.id)
    //this.url="receipt?function=search&datefrom=0&dateto=0&office=surrey"
    //console.log(this.url)
    this.getTableData()
    this.receiptForm.reset();
    this.panel1.close()
    this.panel2.open()
  }

  highlight(row,i){
    console.log(i);
    this.tableSelectedRow = i
    this.selectedRowIndex = row.id
    this.rowdata = row
  }
  
  webapiCallback(message: string, result: any){

    console.log("in call back web : deposit")
    this.canDeposit = false;
    this.cashboxshown=0
    if (this.mode == "BANKDATA"){
      console.log("bank data")
      console.log(result[0])
      console.log(result[0].fullname)
      this.bankdata = result
      this.selectedBankName = result[0].fullname
      this.selectedBank = result[0].code
    }
    var res = message.split(",");
    var l:number = res.length
    var msg = res[0]
    if (this.mode == "DEPOSIT"){
      console.log(res[0])
      console.log(res[1])
      if (res[0] == "deposited"){
        this.selection.clear() 
        this.masterToggle()
        this.getTableData()
        alert("Deposit completed #")
        this.lastDepositId = res[1]

      } else{
        this.selection.clear()
        this.masterToggle()
        this.getTableData()
        alert("The deposit failed. Please check or contact technical support")
      }
    }
    
  }

  printDeposit(){

  }
  updateTotal(){
    this.totalsum = this.totalcash*1 + this.totalcheque*1 + this.totalcredit*1 + this.totaldebit*1 + this.totaldirect*1
    this.totalsum = Math.round(this.totalsum)
  }

  showCashBox(){
    console.log("showing cash dialog");
    this.openDialogCashBox();
  }

  openDialogCashBox() {
    let dialogRef = this.dialog.open(DialogCashBox, {
    
      data: {
        payload: this.totalcash
      }
    });
    dialogRef.afterClosed().subscribe(
      data =>  {
        if (data.status != null) {
       // this.url="receipt?function=unpost&id="+this.rowdata.id+"&office="+this.rowdata.office+"&date="+this.rowdata.date
        //console.log(this.url)
        //this.webapi.call('POST',this.url,this,null)
        console.log("in dailog return")
        console.log(data)
        //this.totalcash = data
        if (data.status == 0) {
          alert("Cannot deposit, cash total does not reconcile")
          this.cashboxshown = 0;
          this.canDeposit = false
          return
        }

        if (data.status == 1) {
          alert("Cash total reconciles ! Click on depoist to complete transaction")
          console.log(data.cashdata)
          this.cashdata = data.cashdata
          this.cashboxshown = 1
          this.canDeposit = true
          this.updateSelectTotal();
        }
        
        }}
  );
         
  }
  
  
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  getTableData(){
    this.userDb = new ReceiptDao(this.webapi);

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          //return this.userDb!.getUsers(this.sort.active, this.sort.direction, this.paginator.pageIndex);
          return this.userDb!.getReceipts()
        }),
        map(data => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.isRateLimitReached = false;
          //this.resultsLength = 5;
          //this.ref.markForCheck();
          console.log(data)
          return data;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          // Catch if the GitHub API has reached its rate limit. Return empty data.
          this.isRateLimitReached = true;
          return observableOf([]);
        })
      ).subscribe(data => this.dataSource.data = data );

  }

  getReceipts(): Observable<Receipt[]> {
    return this.webapi.getAllReceiptsForDeposit()
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    //this.isAllSelected() ?
        this.selection.clear() //:
        this.cashboxshown = 0
        this.canDeposit = false
        //this.dataSource.data.forEach(row => this.selection.select(row));
        this.updateSelectTotal();
  }


  getBankList(){
    this.url="admin?function=list_bank"
    console.log(this.url)
    
    this.webapi.call('GET',this.url,this,null)


  }

  onClick(n){
    this.selectedBankName = n
    console.log(n)
    console.log(this.selectedBank)
  }

  updateSelectTotal(){
    const numSelected = this.selection.selected.length;
    console.log(numSelected)
    console.log("xxx" +  numSelected.toString())
    //console.log(this.dataSource.data.forEach(row => this.selection.isSelected))
      console.log(this.selection.selected)
      var data = this.selection.selected
      this.depositcashtotal = 0
      this.depositchequetotal = 0
      this.depositdebittotal = 0
      this.depositcredittotal = 0
      this.depositdirecttotal =0
      this.deposittotal = 0 
      for(let e of data) {
        console.log("Speaker element",e['paytype']);// element is JSON 
        console.log("Speaker element",e['amount']);// element is JSON 
        
  
        if ( e['paytype'] == 'directdeposit') { this.depositdirecttotal = this.depositdirecttotal + e['amount']; this.deposittotal = this.deposittotal + e['amount']}

        if ( e['paytype'] == 'cash') { this.depositcashtotal = this.depositcashtotal + e['amount']; this.deposittotal = this.deposittotal + e['amount'] }

        if ( e['paytype'] == 'debit') { this.depositdebittotal = this.depositdebittotal + e['amount']; this.deposittotal = this.deposittotal + e['amount'] }

        if ( e['paytype'] == 'credit') { this.depositcredittotal = this.depositcredittotal + e['amount']; this.deposittotal = this.deposittotal + e['amount'] }

        if ( e['paytype'] == 'cheque') { this.depositchequetotal = this.depositchequetotal + e['amount']; this.deposittotal = this.deposittotal + e['amount'] }

       //this.receiptslist = this.receiptslist+","+e['id']
        //console.log(this.receiptslist)
      }
      this.totalcheque = this.depositchequetotal;
      this.totalcredit = this.depositcredittotal;
      this.totaldebit = this.depositdebittotal;
      this.totaldirect = this.depositdirecttotal;
      this.totalcash = this.depositcashtotal;
      this.totalsum = this.deposittotal;

      
  }

  makeDeposit(){

    if(this.totalsum==0 || this.selectedBank == null){
      alert("Select receipts and bank account to make a deposit")
      return;
    }

   
    this.receiptslist=""
    if(this.totalcash != 0 && this.cashboxshown == 0 ){ this.showCashBox();  return;}
    console.log(this.selection.selected) //details
    var data = this.selection.selected
    console.log(this.totalsum.toString()) //depositamt
    if (this.canDeposit == false && this.totalcash != 0){
      return;
    }
    for(let e of data) {
      this.receiptslist = this.receiptslist+","+e['id']+","+e['office']+","+e['date'] //WARNING do not change this format or else change on server too
    }
    console.log(this.receiptslist) //receiptsid
    console.log(this.selectedBank) //selected bank id

    this.url="receipt?function=deposit&depositamt="+this.totalsum.toString()+"&receiptsid="+this.receiptslist+"&bankac="+this.selectedBank+"&cashdata="+this.cashdata
    console.log(this.url)
    this.webapi.call('POST',this.url,this,this.selection.selected)
    this.mode="DEPOSIT"
  }

  
}

export class ReceiptDao {
  constructor(private webapi:WebapiService) {}

  connect(): Observable<Receipt[]> {
    return this.webapi.getAllReceiptsForDeposit();
  }

  getReceipts(): Observable<Receipt[]> {
    return this.webapi.getAllReceiptsForDeposit();
  }
}


@Component({
  selector: 'cashbix',
  templateUrl: 'cashbox.html',
  styleUrls: ['./newdeposits.component.css']
})

export class DialogCashBox  {
  payload
  cash100:number=0;
  cash100t:number=0;
  cash50:number=0;
  cash50t:number=0;
  cash20:number=0;
  cash20t:number=0;
  cash10:number=0;
  cash10t:number=0;
  cash5:number=0;
  cash5t:number=0;
  coins:number=0;
  actualdeposit=0;

  cashtotal:number=0;
  returnVal:any;

  //constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
  constructor(
    public dialogRef: MatDialogRef<DialogCashBox>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.payload = data.payload
     }

  updateTotal():number{

    console.log("here - update total")
    this.cash100t = this.cash100 * 100
    console.log(this.cash100t)
    this.cash50t  = this.cash50 * 50
    console.log(this.cash50t)
    this.cash20t  = this.cash20 * 20
    this.cash10t = this.cash10 * 10
    this.cash5t = this.cash5 * 5
    this.coins = this.coins * 1; 
    console.log("coins")
    console.log(this.coins)
    this.cashtotal = this.cash100t + this.cash50t + this.cash20t + this.cash10t + this.cash5t + this.coins;
    this.actualdeposit = this.cashtotal
    return this.cashtotal   


  }

  inputValidator(event: any) {
    console.log(event.target.value);
    const pattern = /^[0-9]*$/;   
    //let inputChar = String.fromCharCode(event.charCode)
    if (!pattern.test(event.target.value)) {
      event.target.value = event.target.value.replace(/[^0-9]/g, "");
      // invalid character, prevent input
      console.log("invalide char")
    }
  }

  onNoClick(): void {
    
    this.dialogRef.close(0);
  }
  save() {
    //this.dialogRef.close(this.payload.id);
    console.log("ready to add")
    this.cash100t = this.cash100 * 100
    console.log(this.cash100t)
    this.cash50t  = this.cash50 * 50
    console.log(this.cash50t)
    this.cash20t  = this.cash20 * 20
    this.cash10t = this.cash10 * 10
    this.cash5t = this.cash5 * 5
    this.coins = this.coins * 1;
    this.cashtotal = this.cash100t + this.cash50t + this.cash20t + this.cash10t + this.cash5t +this.coins
    console.log(this.cashtotal)

    console.log(this.actualdeposit)
    if (this.cashtotal != this.payload){
      alert("Cash total does not match")
      //this.dialogRef.close(0);
      return
    }
    var cashstr=this.cash100+","+this.cash50+","+this.cash20 +"," + this.cash10 +","+ this.cash5 +","+ this.coins
    this.returnVal ={
      status: [1],
      cashdata: cashstr,
         
  };
    console.log(this.returnVal)
    this.dialogRef.close(this.returnVal);
  }


}