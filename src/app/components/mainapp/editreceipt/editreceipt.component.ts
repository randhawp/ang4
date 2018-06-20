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
  panelOpenState: boolean = false;
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
  showEditButton:boolean = true;
  showVoidButton:boolean = false;
  showPostButton:boolean = false;
  showUnPostButton:boolean = false;
  listofagents:any;
  selectedAgent:string;
  
  
  
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
    {value: 'abbotsford', viewValue: 'Abbotsford'},
    {value: 'surrey', viewValue: 'Surrey'},
    {value: 'vancouver', viewValue: 'Vancouver'},
    {value: 'mississauga', viewValue: 'Mississauga'}

  ]
  role:number = 0;
  officeName:string='';
  url:string='';
  selectedOffice:string='';

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

    if (this.state.access == "AGENT") {
      this.role = 0;
    }
    if ( this.state.access == "BADMIN"){
      this.role = 1;
    }
    if (this.state.access == "HADMIN" ){
      this.role =2;
    }
    this.setAccessLevel()
    //this.getAgentList()
  }

  onClick(n){
    this.selectedAgent = n
    console.log(n)
  }
 
  setAccessLevel(){
    if( this.state.access == "AGENT" ) {
      console.log("this is agent")
      this.showEditButton = true
    }else if (this.state.access =="BADMIN"){
      console.log("this is B admin")
      this.showEditButton = true
      this.showVoidButton = true
    }else if (this.state.access == "HADMIN"){
      console.log("this is H admin")
      this.showEditButton = true
      this.showVoidButton = true
      this.showPostButton = true
      this.showUnPostButton = true
    }else if( this.state.access == "SADMIN"){
      
      console.log("systed admin")
      //this.router.navigate(['mainapp/admin']);
    }

  }

  getAgentList(){
    var office:string;

    if( this.state.access == "AGENT" || this.state.access == "BADMIN" ) {
      
      office = this.state.office
    }
    if (this.state.access == "HADMIN"){
      
      office = this.receiptForm.value.receiptFormData.office
    }
    if (office == null) {
      office="vancouver"
    }
    this.url="receipt?function=list_agents&office="+this.selectedOffice
    console.log(this.url)
    this.mode="BANK"
    this.webapi.call('GET',this.url,this,null)


  }

  officeChanged(n){
    this.selectedOffice = n
    console.log("office changed " + (this.selectedOffice))
    this.getAgentList()
  }
  
  onSubmitSearch() {
    this.submitted = true;
    this.receiptData.datefrom = this.receiptForm.value.receiptFormData.datefrom;
    this.receiptData.dateto = this.receiptForm.value.receiptFormData.dateto;
    console.log("### Starting Search ###")
    console.log(this.receiptForm.value.receiptFormData.amountfrom)
    console.log(this.receiptForm.value.receiptFormData.amountto)
    console.log( this.receiptForm.value.receiptFormData.datefrom)
    var t1 = (this.receiptForm.value.receiptFormData.datefrom.getTime())
    console.log(t1)
    console.log( this.receiptForm.value.receiptFormData.dateto)
    var t2 = this.receiptForm.value.receiptFormData.dateto.getTime()
    t2 = t2 + (24*60*60*1000)
    console.log(t2)
    console.log(this.receiptForm.value.receiptFormData.office)
    console.log(this.role)
    console.log(this.state.user)
    console.log(this.receiptForm.value.receiptFormData.receiptfrom)
    console.log(this.receiptForm.value.receiptFormData.receiptto)
    console.log(this.receiptForm.value.receiptFormData.for)
    console.log(this.selectedAgent)
    console.log(this.receiptForm.value.receiptFormData.paytype)


    var office:string;

    if( this.state.access == "AGENT" || this.state.access == "BADMIN" ) {
      
      office = this.state.office
    }
    if (this.state.access == "HADMIN"){
      
      office = this.selectedOffice
      if (office == "" || office == null) {
        console.log("office not selected")
        return

      }
    }
    
    

    //let 
    let amtfrom = this.receiptForm.value.receiptFormData.amountfrom
    let amtto = this.receiptForm.value.receiptFormData.amountto
    let datefrom = t1 
    let dateto = t2
    let role = this.role
    let user = this.state.user
    let receiptfrom = this.receiptForm.value.receiptFormData.receiptfrom
    let receiptto = this.receiptForm.value.receiptFormData.receiptto
    let forreason = this.receiptForm.value.receiptFormData.for
    let filing_agent = this.selectedAgent
    let paytype =  this.receiptForm.value.receiptFormData.paytype
    
    if (amtfrom == null || amtfrom == ""){
      amtfrom=0
    }
    if (amtto == null || amtto ==""){
      amtto=0
    }
    if (receiptfrom == null || receiptfrom == ""){
      receiptfrom=0
    }
    if ( receiptto == null || receiptto == "" ) {
      receiptto = 0
    }
    if ( forreason == null || forreason == ""){
      forreason = "0"
    }
    if ( filing_agent == null || filing_agent == ""){
      filing_agent ="0"
    }
    if ( paytype == null || paytype == "") {
      paytype = "0"
    }

    console.log("### Starting Search Phase 1 end ###")
    //this.url="receipt?function=search&datefrom=0&dateto=0&office=surrey"
    //console.log(this.url)
    this.getTableData(office,amtfrom,amtto,datefrom,dateto,role,user,receiptfrom,receiptto,forreason,filing_agent,paytype)
    //this.receiptForm.reset();
    this.panel1.close()
    this.panel2.open()
    this.selectedAgent=""
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
        console.log(this.editedForm.office)
        console.log(this.editedForm.usd)
        this.rowdata.amount = this.editedForm.amount
        this.rowdata.paytype = this.editedForm.paytype
        this.rowdata.rcvdfrom = this.editedForm.rcvdfrom
        this.rowdata.remark = this.editedForm.remark
        this.rowdata.invoice = this.editedForm.invoice
        this.rowdata.usd = this.editedForm.usd
        this.mode="EDIT"
        this.url="receipt?function=edit_receipt&paytype="+this.editedForm.paytype+"&rcvdfrom="+this.editedForm.rcvdfrom+
    "&invoice="+this.editedForm.invoice+"&lockstate=x&remark="+this.editedForm.remark+"&fortrip="+this.editedForm.fortrip+
    "&usd="+this.editedForm.usd+"&agent="+this.state.user+"&status=na&amount="+this.editedForm.amount+"&office="+this.editedForm .office+"&date="+this.rowdata.date
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

    if (this.mode == "BANK"){
      this.listofagents = null
      this.listofagents = result
      //this.selectedAgent = result[0].username
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
  getTableData(office,amtfrom,amtto,datefrom,dateto,role,user,receiptfrom,receiptto,forreason,filing_agent,paytype){
    this.userDb = new ReceiptDao(this.webapi);

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          //return this.userDb!.getUsers(this.sort.active, this.sort.direction, this.paginator.pageIndex);
          this.userDb.setData(office,amtfrom,amtto,datefrom,dateto,role,user,receiptfrom,receiptto,forreason,filing_agent,paytype)
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

  //getReceipts(): Observable<Receipt[]> {
    //return this.webapi.getReceipts(this.state.office,this.receiptData.datefrom,this.receiptData.dateto,agent,this.receiptData.,amtto,this.role)
  //}

  
}

export class ReceiptDao {
  constructor(private webapi:WebapiService) {}
  office:string;
  datefrom:string;
  dateto:string
  agent:string;
  amtfrom:number;
  amtto:number;
  role:number;

  receiptfrom: number;
  receiptto: number;
  forreason:string;
  filing_agent:string;
  paytype:string;


  setData(office,amtfrom,amtto,datefrom,dateto,role,user,receiptfrom,receiptto,forreason,filing_agent,paytype){
    this.office = office
    this.amtfrom = amtfrom
    this.amtto = amtto
    this.datefrom = datefrom
    this.dateto = dateto
    this.role = role
    this.agent = user;
    this.receiptfrom = receiptfrom;
    this.receiptto = receiptto;
    this.forreason = forreason;
    this.filing_agent = filing_agent;
    this.paytype = paytype
  }

  //connect(): Observable<Receipt[]> {
    //return this.webapi.getReceipts(this.office,this.datefrom,this.dateto,this.agent,this.amtfrom,this.amtto,this.role);
  //}

  getReceipts(): Observable<Receipt[]> {
    return this.webapi.getReceipts(this.office,this.datefrom,this.dateto,this.agent,this.amtfrom,this.amtto,this.role,this.receiptfrom,this.receiptto,this.forreason,this.filing_agent,this.paytype);
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
      console.log("=====usd value=========")
      console.log("["+this.payload.usd+"]")
      console.log("==============")
      
      if (this.payload.usd == true || this.payload.usd == "true" ){
        this.usdIsChecked = true;
        console.log("usd is false")
      }else{
        this.usdIsChecked = false;
        console.log("usd is true")
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
        paytype: [this.payload.paytype],
        office: [this.payload.office]

        
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