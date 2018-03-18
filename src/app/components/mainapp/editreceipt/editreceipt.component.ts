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



@Component({
  selector: 'app-editreceipt',
  templateUrl: './editreceipt.component.html',
  styleUrls: ['./editreceipt.component.css']
})
export class EditreceiptComponent implements OnInit {
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
  displayedColumns = ['id', 'office', 'amount', 'invoice','paytype','rcvdfrom','date','rstatus'];
  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  paytypes = [
    {value: 'cheque', viewValue: 'Cheque'},
    {value: 'directdeposit', viewValue: 'Direct Deposit'},
    {value: 'debit', viewValue: 'Debit'},
    {value: 'credit', viewValue: 'Credit'},
    {value: 'cash', viewValue: 'Cash'}
    
  ];

  offices = [
    {value: 'surrey', viewValue: 'Surrey'},
    {value: 'vancouver', viewValue: 'Vancouver'},
    {value: 'toronto', viewValue: 'Toronto'}

  ]
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


  constructor(public webapi: WebapiService ,public state:StateService,private messageService: MessageService,public dialog: MatDialog) { }

  ngOnInit() {
    this.officeName = this.state.office;

    if (this.state.access == "AGENT" || this.state.access == "BADMIN"){
      this.role =1;
    }
    if (this.state.access == "HADMIN" || this.state.access == "SADMIN"){
      this.role =2;
    }
  }

  onSubmitSearch() {
    this.submitted = true;
    this.receiptData.datefrom = this.receiptForm.value.receiptFormData.datefrom;
    this.receiptData.dateto = this.receiptForm.value.receiptFormData.dateto;
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
  selectRowToEdit(row){
    console.log(row)
    
    this.selectedReceipt = this.rowdata.id
    this.openDialogEdit()
  }

  selectRowToPost(){
    this.selectedReceipt = this.rowdata.id
    this.openDialogPost()
  }

  selectRowToUnPost(){
    this.selectedReceipt = this.rowdata.id
    this.openDialogUnPost()
  }
  openDialogEdit() {
    let dialogRef = this.dialog.open(DialogReceiptEditor, {
    
      data: {
        payload: this.rowdata
      }
    });
    dialogRef.afterClosed().subscribe(
      data =>  {
        if (data != null) {
        this.editedForm = data;
        console.log('The dialog was closed' + this.editedForm);
        console.log(this.editedForm.usd)
        console.log(this.editedForm.paytype)
        console.log(this.editedForm.date)
        this.rowdata.amount = this.editedForm.amount
        this.mode="EDIT"
        this.url="receipt?function=edit_receipt&paytype="+this.editedForm.paytype+"&rcvdfrom="+this.editedForm.rcvdfrom+
    "&invoice="+this.editedForm.invoice+"&lockstate=x&remark="+this.editedForm.remark+"&fortrip="+this.editedForm.fortrip+
    "&usd="+this.editedForm.usd+"&agent="+this.state.user+"&status=na&amount="+this.editedForm.amount+"&office="+this.state.office+"&date="+this.rowdata.date
    console.log(this.url)
    this.webapi.call('POST',this.url,this,null)
    this.receiptForm.reset();
        }}
  );    
  }

  openDialogPost() {
    let dialogRef = this.dialog.open(DialogPostReceipt, {
    
      data: {
        payload: this.rowdata
      }
    });
    dialogRef.afterClosed().subscribe(
      data =>  {
        if (data != null) {
        this.editedForm = data;
        console.log("############")
        var amount = dialogRef.componentInstance.getRunningTotal()
        var status=""
        if ( amount == this.rowdata.amount){
          status = "FULL-POSTED"
        }
        if ( amount < this.rowdata.amount){
          status = "PARTIAL-POSTED"
        }
        this.url="receipt?function=post_details&id="+this.rowdata.id+"&amount="+amount+"&status="+status+"&office="+this.rowdata.office+"&date="+this.rowdata.date+"&orignalamt="+this.rowdata.amount
        console.log(this.url)
        this.webapi.call('POST',this.url,this,data)
        
        console.log("############")
        
        }}
  );
       
  }

  
  openDialogUnPost() {
    let dialogRef = this.dialog.open(DialogUnPostReceipt, {
    
      data: {
        payload: this.rowdata
      }
    });
    dialogRef.afterClosed().subscribe(
      data =>  {
        if (data != null) {
        this.url="receipt?function=unpost&id="+this.rowdata.id+"&office="+this.rowdata.office+"&date="+this.rowdata.date
        console.log(this.url)
        this.webapi.call('POST',this.url,this,null)
        
        console.log("############")
        
        }}
  );
       
  }
  webapiCallback(message: string, result: any){

    console.log(message)
    if ( this.mode == "DELETE"){
      console.log("mode is delete")
      //this.dataSource.data[this.selectedRowIndex] = null
      this.dataSource.data.splice(this.tableSelectedRow, 1);
      this.dataSource.paginator = this.paginator;
    }
     
    if (this.mode == "EDIT"){
      console.log("edited" + message)
    }
  }

  selectRowToVoid(){
        
    this.selectedReceipt = this.rowdata.id
    this.openDialogVoidReceipt()
  }

  openDialogVoidReceipt() {
    let dialogRef = this.dialog.open(DialogVoidReceipt, {
    
      data: {
        payload: this.rowdata
      }
    });
    dialogRef.afterClosed().subscribe(
      data =>  {
        if (data != null) {
        this.editedForm = data;
        console.log('The dialog was closed' + this.editedForm);
        console.log(this.editedForm.id)
       
        this.mode="EDIT"
        this.url="receipt?function=edit_receipt&paytype="+"void"+"&rcvdfrom="+"void"+
    "&invoice="+"void"+"&lockstate=x&remark="+"void"+"&fortrip="+"void"+
    "&usd="+"false"+"&agent="+this.state.user+"&status=void&amount="+0+"&office="+this.state.office+"&date="+this.rowdata.date
    console.log(this.url)
    this.webapi.call('POST',this.url,this,null)
    this.receiptForm.reset();
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
    return this.webapi.getReceipts()
  }

  
}

export class ReceiptDao {
  constructor(private webapi:WebapiService) {}

  connect(): Observable<Receipt[]> {
    return this.webapi.getReceipts();
  }

  getReceipts(): Observable<Receipt[]> {
    return this.webapi.getReceipts();
  }
}


@Component({
  selector: 'edit-receipts',
  templateUrl: 'edit-receipts.html',
  styleUrls: ['./editreceipt.component.css']
})
export class DialogReceiptEditor {
 
  payload;
  form: FormGroup;
  usdIsChecked:boolean;
  isPayType:boolean;
  paytypes = [
    {value: 'cheque', viewValue: 'Cheque'},
    {value: 'directdeposit', viewValue: 'Direct Deposit'},
    {value: 'debit', viewValue: 'Debit'},
    {value: 'credit', viewValue: 'Credit'},
    {value: 'cash', viewValue: 'Cash'}
    
  ];

  //constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
  constructor( private fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogReceiptEditor>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.payload = data.payload
      
      if (this.payload.usd != 'true'){
        this.usdIsChecked = false;
      }else{
        this.usdIsChecked = true;
      }
      if(this.payload.paytype == "visa"){
        this.isPayType = true;
      }

      console.log(this.payload.paytype)
      this.form = fb.group({
        id: [this.payload.id],
        rcvdfrom: [this.payload.rcvdfrom, Validators.required],
        fortrip: [this.payload.fortrip, Validators.required],
        amount: [this.payload.amount, Validators.required],
        usd: [this.payload.usd],
        invoice: [this.payload.invoice, Validators.required],
        remark: [this.payload.remark],
        paytype: [this.payload.paytype]

        
    });
     }

  onNoClick(): void {
    this.dialogRef.close();
  }
  save() {
    this.dialogRef.close(this.form.value);
  }

  close() {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'void-receipt',
  templateUrl: 'void-receipt.html',
})

export class DialogVoidReceipt {
  payload
  //constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
  constructor(
    public dialogRef: MatDialogRef<DialogVoidReceipt>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.payload = data.payload
     }

  onNoClick(): void {
    this.dialogRef.close();
  }
  save() {
    this.dialogRef.close(this.payload.id);
  }
}

@Component({
  selector: 'unpost-receipt',
  templateUrl: 'unpost-receipt.html',
  styleUrls: ['./editreceipt.component.css']
})

export class DialogUnPostReceipt  {
  payload
  //constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
  constructor(
    public dialogRef: MatDialogRef<DialogUnPostReceipt>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.payload = data.payload
     }

  onNoClick(): void {
    this.dialogRef.close();
  }
  save() {
    this.dialogRef.close(this.payload.id);
  }


}

@Component({
  selector: 'post-receipt',
  templateUrl: 'post-receipt.html',
  styleUrls: ['./editreceipt.component.css']
})
export class DialogPostReceipt  {
     
  payload
  ELEMENT_DATA: Element[] = [];
  runningTotal:number = 0;
  @ViewChild('f') receiptForm: NgForm;
  invoiceB:string;
  paymentB:string;
  amountB:number = 0;

  title = "app";
  displayedColumns = ["invoice", "payment", "amount"];
  dataSource = new MatTableDataSource<Element>(this.ELEMENT_DATA);
  //constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
  
  constructor( public dialogRef: MatDialogRef<DialogPostReceipt>,  @Inject(MAT_DIALOG_DATA) public data: any) {
      this.payload = data.payload
      
  }

  getRunningTotal(){
    return this.runningTotal;
  }

  ngOnInit() {
   this.runningTotal=0;
  }
  searchElements(search: string = "") {
    console.log(search);
    this.dataSource.filter = search.toLowerCase().trim();
  }
  addRow(invoice,payment,amount) {
    
    this.runningTotal = this.runningTotal + Number(amount.value)
    console.log("amt is " + this.payload.amount)
    console.log("running total is " + this.runningTotal )
    if (this.runningTotal > this.payload.amount){
      alert("total problem");
      return;
    }
    this.dataSource.data.push({
      invoice: invoice.value,
      payment: payment.value,
      amount: amount.value
    });
    this.invoiceB="";
    this.paymentB="";
    this.amountB=0;
    this.dataSource.filter = "";
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  save() {
    this.dialogRef.close(this.dataSource.data);
   
  }
 

 connect() { }
 disconnect() { }
}
export interface Element {
  invoice: string;
  payment: string;
  amount: number;
}