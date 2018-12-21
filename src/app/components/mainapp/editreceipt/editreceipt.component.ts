import { Component, OnInit, ViewChild,Inject,ElementRef,ChangeDetectorRef  } from '@angular/core';
import { NgForm } from '@angular/forms';
import {MatPaginator, MatSort, MatTableDataSource, MatExpansionPanel} from '@angular/material';
import {StateService} from '../../../services/state.service'
import {WebapiService} from '../../../services/webapi.service'
import { MessageService} from '../../../services/message.service'

import {Observable, merge, of as observableOf} from 'rxjs';
import {catchError, map, startWith, switchMap, isEmpty} from 'rxjs/operators';
import {Receipt} from '../../../models/receipt'
import {MatDialog,MatDialogRef,MAT_DIALOG_DATA} from '@angular/material';
import {FormBuilder, Validators, FormGroup} from "@angular/forms";
import {SelectionModel} from '@angular/cdk/collections'
import {SetPayTypesPipe} from '../utilities/readablePayTypes'

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
  displayedColumns = ['id', 'office', 'amount', 'invoice','paytype','rcvdfrom','date','agentname','rstatus'];
  showEditButton:boolean = true;
  showVoidButton:boolean = false;
  showPostButton:boolean = false;
  showUnPostButton:boolean = false;
  showEditPostButton:boolean = false;
  listofagents:any;
  selectedAgent:string;
  
  
  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  paytypes = [
    {value: 'cheque', viewValue: 'Cheque'},
    {value: 'directdeposit', viewValue: 'Direct Deposit'},
    {value: 'debit', viewValue: 'Debit'},
    {value: 'credit', viewValue: 'Credit Card'},
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
  pagesize=5
  currentSearchResultPageNo = 0;

  current:Date = new Date()
  milliseconds = this.current.getTime()
  ninetydaysago = this.milliseconds - (3600*24*90*1000)

  search_datefrom:Date = new Date(this.ninetydaysago) 
  
  
  search_dateto:Date = new Date();
  constructor(public webapi: WebapiService ,public state:StateService,private messageService: MessageService,public dialog: MatDialog,private changeDetectorRefs: ChangeDetectorRef) { }

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

  onSearchClear(){
    console.log("SSEEAARRCCHH")
    this.receiptForm.resetForm()
    this.receiptForm.reset();
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
      this.showEditPostButton = true
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
    console.log(this.receiptForm.value.receiptFormData.rcvdfrom)


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
    let rcvdfrom = this.receiptForm.value.receiptFormData.rcvdfrom
    
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
    if (rcvdfrom == null || rcvdfrom ==""){
      rcvdfrom=""
    }
    //this.dataSource.disconnect
    //this.dataSource.data = null

    console.log("### Starting Search Phase 1 end ###")
    //this.url="receipt?function=search&datefrom=0&dateto=0&office=surrey"
    //console.log(this.url)
    this.getTableData(office,amtfrom,amtto,datefrom,dateto,role,user,receiptfrom,receiptto,forreason,filing_agent,paytype,rcvdfrom)
    //this.receiptForm.reset();
    this.panel1.close()
    this.panel2.open()
    this.selectedAgent=""
  }
  onPaginateChange(event){
    //alert(JSON.stringify("Current page index: " + event.pageIndex));
    console.log("current page " + event.pageIndex)
    this.currentSearchResultPageNo =  event.pageIndex
    
  }

  highlight(row,i){
    console.log(i);
    var currentrow = this.pagesize * this.currentSearchResultPageNo + i
    console.log("Actual row " + currentrow)
    this.tableSelectedRow = i
    this.selectedRowIndex = row.id
    this.rowdata = row
    console.log(this.rowdata.rstatus)
    var voidbtn = this.rowdata.rstatus
    var postbtn = this.rowdata.rstatus
    if  (voidbtn == "BD" || voidbtn == "PP" || voidbtn=="FP" || voidbtn=="void"){
      this.showVoidButton = false
    } else{
      this.showVoidButton = true
    }

    if (postbtn == "BD" || postbtn == "PP" || postbtn == "void"){
      this.showPostButton = true
    }else{
      this.showPostButton = false
    }
    if(postbtn == "PP" || postbtn == "FP"){
      this.showEditPostButton = true
    } else {
      this.showEditPostButton = false
    }
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

  selectRowToEditPost(){
    this.selectedReceipt = this.rowdata.id
    this.openDialogEditPost()
  }

  //not used as function not required
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

        if ( this.editedForm.paytype == 'directdeposit' && this.editedForm.usd == true) {
          alert("Direct deposit for USD not accepted. Receipt not saved. Please fix the problem to continue")
          return
        }
        this.rowdata.amount = this.editedForm.amount
        this.rowdata.paytype = this.editedForm.paytype
        this.rowdata.rcvdfrom = this.editedForm.rcvdfrom
        this.rowdata.remark = this.editedForm.remark
        this.rowdata.invoice = this.editedForm.invoice 
        this.rowdata.usd = this.editedForm.usd
        this.rowdata.for = this.editedForm.for
        this.mode="EDIT"
        this.editedForm.rcvdfrom = encodeURIComponent (this.editedForm.rcvdfrom)
        this.editedForm.remark   = encodeURIComponent(this.editedForm.remark)
        this.editedForm.invoice  = encodeURIComponent(this.editedForm.invoice)
        this.editedForm.fortrip = encodeURIComponent(this.editedForm.fortrip)
        this.url="receipt?function=edit_receipt&paytype="+this.editedForm.paytype+"&rcvdfrom="+this.editedForm.rcvdfrom+
    "&invoice="+this.editedForm.invoice+"&lockstate=x&remark="+this.editedForm.remark+"&fortrip="+this.editedForm.fortrip+
    "&usd="+this.editedForm.usd+"&agent="+this.state.user+"&status=na&amount="+this.editedForm.amount+"&office="+this.editedForm.office+"&date="+this.rowdata.date+
    "&updateon="+this.rowdata.updateon
    console.log("*********** " +this.url)
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
        console.log(this.rowdata.amount)
        console.log(this.rowdata.rcptbal)
        var amount = dialogRef.componentInstance.getRunningTotal()
        var status=""
        if ( amount == this.rowdata.amount){
          status = "FP"
        }
        if ( amount < this.rowdata.amount){
          status = "PP"
        }
        this.url="receipt?function=post_details&id="+this.rowdata.id+"&amount="+amount+"&status="+status+"&office="+this.rowdata.office+"&date="+this.rowdata.date+
        "&orignalamt="+this.rowdata.amount+"&rcptbal="+this.rowdata.rcptbal+"&updateon="+this.rowdata.updateon
        console.log(this.url)
        this.webapi.call('POST',this.url,this,data)
        this.mode="POST"
        console.log("############")
        
        }}
  );

  }

  openDialogEditPost() {
    let dialogRef = this.dialog.open(DialogEditPostReceipt, {
    
      data: {
        payload: this.rowdata
      }
    });
    dialogRef.afterClosed().subscribe(
      data =>  {
        console.log("Closed edit post 0")
        var currentrow = this.pagesize * this.currentSearchResultPageNo + this.tableSelectedRow
        console.log(currentrow)
        this.dataSource.data.splice(currentrow, 1);
        this.dataSource.paginator = this.paginator;
        
        if (data != null) {
      
        
        console.log("Closed edit post")
        
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
    let  arr:string[] = message.split("|")
    var status:string = arr[0]
    var servermsg:string = arr[1]
    var currentrow = this.pagesize * this.currentSearchResultPageNo + this.tableSelectedRow
    if ( this.mode == "DELETE"){
      console.log("mode is delete")
      //this.dataSource.data[this.selectedRowIndex] = null
      console.log(currentrow)
      this.dataSource.data.splice(currentrow, 1);
      this.dataSource.paginator = this.paginator;
      if (status == "1"){
        console.log("voided")
        alert("Receipt is now void")
      } else{
        alert("Failed to void, please refresh and try again. "+ servermsg)
      }

    

    }
     
    if (this.mode == "EDIT"){
      console.log("edited -- " + message)
      if (status == "1"){
        console.log("edit")
        alert("Receipt edited successfully")
      } else{
        alert("Failed to save, refresh and try again. "+ servermsg )
      }
    }

    if (this.mode == "BANK"){
      this.listofagents = null
      this.listofagents = result
      //this.selectedAgent = result[0].username
    }
    if (this.mode == "POST"){
      console.log("posted")
      this.dataSource.data.splice(currentrow, 1);
      this.dataSource.paginator = this.paginator;
      if (status == "1"){
        console.log("post")
        alert("Receipt posted successfully")
      } else{
        alert("Failed to post, refresh and try again." + servermsg)
      }
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
       
        this.mode="DELETE"
        this.url="receipt?function=edit_receipt&paytype="+"void"+"&rcvdfrom="+"void"+
    "&invoice="+"void"+"&lockstate=x&remark="+"void"+"&fortrip="+"void"+
    "&usd="+"false"+"&agent="+this.state.user+"&status=void&amount="+0+"&office="+this.rowdata.office+"&date="+this.rowdata.date+
    "&updateon="+this.rowdata.updateon
    console.log(this.url)
    this.webapi.call('POST',this.url,this,null)
    this.receiptForm.reset();
        }}
  );    
  }
  ngAfterViewInit() {
    this.paginator.pageIndex = 0
    this.dataSource.paginator = this.paginator;
  }
  getTableData(office,amtfrom,amtto,datefrom,dateto,role,user,receiptfrom,receiptto,forreason,filing_agent,paytype,rcvdfrom){
    console.log(">>>>>>>>>> DB <<<<<<<<<<<<<<")
    if (this.userDb != null){
      console.log("data exists")
    }
    
    this.userDb = new ReceiptDao(this.webapi);
    
    // If the user changes the sort order, reset back to the first page.
    
   // this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, )
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          //return this.userDb!.getUsers(this.sort.active, this.sort.direction, this.paginator.pageIndex);
          this.userDb.setData(office,amtfrom,amtto,datefrom,dateto,role,user,receiptfrom,receiptto,forreason,filing_agent,paytype,rcvdfrom)
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
  rcvdfrom:string;


  setData(office,amtfrom,amtto,datefrom,dateto,role,user,receiptfrom,receiptto,forreason,filing_agent,paytype,rcvdfrom){
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
    this.rcvdfrom = rcvdfrom
  }

  //connect(): Observable<Receipt[]> {
    //return this.webapi.getReceipts(this.office,this.datefrom,this.dateto,this.agent,this.amtfrom,this.amtto,this.role);
  //}

  getReceipts(): Observable<Receipt[]> {
    return this.webapi.getReceipts(this.office,this.datefrom,this.dateto,this.agent,this.amtfrom,this.amtto,this.role,this.receiptfrom,this.receiptto,this.forreason,this.filing_agent,this.paytype,this.rcvdfrom);
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
  showEditSaveButton:boolean;
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
      this.showEditSaveButton =true
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
      if(this.payload.rstatus != "na"){
        console.log("STATUS: "+this.payload.rstatus)
        this.showEditSaveButton = false
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

  print(){
    console.log("print")
    let printContents, popupWin;
    printContents = document.getElementById('print-section').innerHTML;
    popupWin = window.open('', '_blank', 'top=50,left=50,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <title>Print Receipt</title>
          <style>
          //........Customized style.......
          </style>
        </head>
    <body onload="window.print();window.close()">${printContents}</body>
      </html>`
    );
    popupWin.document.close();

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
  tableSelectedRow:number=-1;
  selectedRowIndex:number=-1;
  runningBalance:number=0;
  count=0;
  title = "app";
  displayedColumns = ["invoice", "payment", "amount"];
  dataSource = new MatTableDataSource<Element>(this.ELEMENT_DATA);
  selection = new SelectionModel<Element>(true, []);
  rowdata:any
  //constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
  
  constructor( public dialogRef: MatDialogRef<DialogPostReceipt>,  @Inject(MAT_DIALOG_DATA) public data: any) {
      this.payload = data.payload
      
  }

  deleteRow(){
    var rmvdamt=0
    console.log("removing row")
    console.log(this.selectedRowIndex - 1)
    console.log(this.tableSelectedRow)
    console.log(this.dataSource.data[this.tableSelectedRow].amount)
    rmvdamt = this.dataSource.data[this.tableSelectedRow].amount
    this.runningTotal = this.runningTotal - Number(rmvdamt)
    this.runningBalance = this.payload.amount - this.runningTotal

    this.dataSource.data.splice(this.tableSelectedRow , 1);
    this.selection = new SelectionModel<Element>(true, []);
    this.dataSource = new MatTableDataSource<Element>(this.dataSource.data);
    
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
  addRow() {
    console.log("amount is ")
    console.log(this.amountB)
    if ( Number(this.amountB) <= 0) {
      return
    }
    if (this.paymentB == null ){
      return
    }
    if (this.invoiceB == null){
      return
    }
    
    this.runningTotal = this.runningTotal + Number(this.amountB)
    this.runningBalance = this.payload.rcptbal - this.runningTotal
    console.log("amt is " + this.payload.rcptbal)
    console.log("running total is " + this.runningTotal )
    if (this.runningTotal > this.payload.rcptbal){
      alert("Not allowed, total amount is greater than invoice total");
      this.runningTotal = this.runningTotal -  Number(this.amountB)
      this.runningBalance = this.runningBalance + Number(this.amountB)
      return;
    }
    this.count+=1
    this.dataSource.data.push({
      id: this.count,
      invoice: this.invoiceB,
      payment: this.paymentB,
      amount: this.amountB
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

  highlight(row,i){
    console.log(i);
    //this.tableSelectedRow = i+1
    //this.selectedRowIndex = i+1
    //this.rowdata = row

    
    this.tableSelectedRow = i
    this.selectedRowIndex = row.id
  
  }
       
 

 connect() { }
 disconnect() { }
}

@Component({
  selector: 'editpost-receipt',
  templateUrl: 'editpost-receipt.html',
  styleUrls: ['./editreceipt.component.css']
})
export class DialogEditPostReceipt  {
     
  payload
  ELEMENT_DATA: Element[] = [];
  runningTotal:number = 0;
  @ViewChild('f') receiptForm: NgForm;
  invoiceB:string;
  paymentB:string;
  amountB:number = 0;
  tableSelectedRow:number=-1;
  selectedRowIndex:number=-1;
  runningBalance:number=0;
  originalamt:number=0;
  newbalance:number=0;
  selectedrow:any;
  count=0;
  error=0;
  excess=0;
  temptotal=0;
  errmsg:String=""
  title = "app";
  url:string=""
  mode:string=""
  postdata=[]
  Details=[]
  changedRows={}
  INVOICE_DATA=[]//{"balance":3650,"payment":"AAA","amountedit":"200","id":1,"invoice":"111"},{"balance":3650,"payment":"BBB","amountedit":"150","id":2,"invoice":"222"}]
  displayedColumns = ["date","invoice", "payment", "amount"];
  dataSource = new MatTableDataSource<Invoice>(this.INVOICE_DATA);
  selection = new SelectionModel<Invoice>(true, []);
  rowdata:any
  //constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
  
  constructor( public dialogRef: MatDialogRef<DialogPostReceipt>,  @Inject(MAT_DIALOG_DATA) public data: any,
              private webapi:WebapiService, public state:StateService) {
      this.payload = data.payload
      this.error=0;
      
  }

 
  ngOnInit() {
    
    this.runningTotal=0;
    var data;
    var url="receipt?function=listposting&id="+this.payload.id
    console.log(url)
    this.webapi.call('POST',url,this,this.data)
        
    console.log("init called ..." + this.payload.id)
  }

  getTotalCost() {
  
    this.temptotal = this.INVOICE_DATA.map(t => parseFloat(t.amount)).reduce((acc, value) => acc + (value), 0);
  
    return this.temptotal
  }
  
  webapiCallback(message: string, result: any){

    if (this.mode == "POST"){
      console.log(result)
      let  arr:string[] = message.split("|")
      var status:string = arr[0]
      var servermsg:string = arr[1]
      alert(servermsg)
      
      this.dialogRef.close();
      return
    }
     
    const msg2 = JSON.stringify(result)
    var json = JSON.parse(msg2)
   console.log(json)
    var objf={}
   
    for(var i = 0; i < json.length; i++) {
        var obj = json[i];
        this.originalamt = obj.orignalamt
        console.log("original amt is ")
        console.log(this.originalamt)
        console.log(obj.details.length)
        for(var k = 0; k < obj.details.length; k++) {
            console.log(obj.details[k]['payment'])
            var payment = obj.details[k]['payment']
            var amountx = parseFloat(obj.details[k]['amount'])
            var id = obj.details[k]['id']
            var invoice = obj.details[k]['invoice']

            objf = Object.assign({date:( obj.updateon * 1000)},{balance:obj.rcptbal}, {payment: payment},{amount:amountx},{id:id},{invoice:invoice});
            console.log(objf)
            this.Details.push(objf)
        }
   
    }
    console.log(this.Details.length)

    var j = JSON.stringify(this.Details)
    //j = j.replace(new RegExp(`[$\\[\\]]`, 'g'), '');
    console.log(j)
    this.INVOICE_DATA=JSON.parse(j)
    this.dataSource = new MatTableDataSource<Invoice>(this.INVOICE_DATA);
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  invoiceChange(){
    if ( (this.selectedrow.invoice.length == 0)){
      this.error=1
      console.log("empty invoice")
      this.errmsg = " Error: invoice details cannot be empty"
      return
    }

  }
 

  paymentChange(){
    if ( (this.selectedrow.payment.length == 0)){
      this.error=1
      console.log("empty payment")
      this.errmsg = " Error: payment details cannot be empty"
      return
    }

  }
 
  
  amtChange(){
    console.log(this.selectedrow)
    if ( isNaN(this.selectedrow.amount)){
      this.error=1
      console.log("not a number")
      this.errmsg = " Error: Not a valid currency amount"
      return
    }
    if (this.temptotal > this.originalamt){
      this.excess = this.temptotal - this.originalamt
      this.error=1
      this.errmsg = " Error: Total exceeds receipt total"
      return 0;
    } else{
      this.error=0
    }
    this.newbalance = this.originalamt - this.temptotal
  }
 
  
  saveChanges(){
  
    console.log(this.INVOICE_DATA)
    let status="PP"
    let office= this.state.office
    this.url="receipt?function=editpost_details&id="+this.payload.id+"&amount="+this.temptotal+"&status="+status+"&office="+office+"&date="+this.payload.date+
        "&orignalamt="+this.payload.amount+"&rcptbal="+this.payload.rcptbal+"&updateon="+this.payload.updateon
        console.log(this.url)
        this.webapi.call('POST',this.url,this,this.INVOICE_DATA)
        this.mode="POST"
  
  }

  highlight(row,i){
    console.log(i);
    this.tableSelectedRow = i
    this.selectedRowIndex = row.id
    this.selectedrow=row
  }
 connect() { }
 disconnect() { }
}

export interface Element {

  payment: string;
  amount: number;
  id:number;
  invoice: string;
 
 
}
export interface Invoice {

  date:string;
  balance:number;
  payment: string;
  amount: string;
  id:number;
  invoice: string;
 
 
}