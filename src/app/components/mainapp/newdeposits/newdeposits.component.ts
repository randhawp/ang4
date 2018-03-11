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

    this.getTableData()
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

  showCashBox(){
    console.log("showing cash dialog");
    this.openDialogCashBox();
  }

  openDialogCashBox() {
    let dialogRef = this.dialog.open(DialogCashBox, {
    
      data: {
        payload: this.rowdata
      }
    });
    dialogRef.afterClosed().subscribe(
      data =>  {
        if (data != null) {
       // this.url="receipt?function=unpost&id="+this.rowdata.id+"&office="+this.rowdata.office+"&date="+this.rowdata.date
        //console.log(this.url)
        //this.webapi.call('POST',this.url,this,null)
        
        console.log("############")
        
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

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    //this.isAllSelected() ?
      //  this.selection.clear() :
        //this.dataSource.data.forEach(row => this.selection.select(row));
  }

  cl(row){
    const numSelected = this.selection.selected.length;
    console.log(numSelected)
    console.log("xxx" +  numSelected.toString())
    this.dataSource.data.forEach(row => this.selection.isSelected)

    console.log(this.selection.selected)
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

  cashtotal:number=0;

  //constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
  constructor(
    public dialogRef: MatDialogRef<DialogCashBox>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.payload = data.payload
     }

  updateTotal():number{

    console.log("here")
    this.cash100t = this.cash100 * 100
    console.log(this.cash100t)
    this.cash50t  = this.cash50 * 50
    console.log(this.cash50t)
    this.cash20t  = this.cash20 * 20
    this.cash10t = this.cash10 * 10
    this.cash5t = this.cash5 * 5
    this.cashtotal = this.cash100t + this.cash50t + this.cash20t + this.cash10t + this.cash5t;
    return this.cashtotal   


  }

  onNoClick(): void {
    this.dialogRef.close();
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
    this.cashtotal = this.cash100t + this.cash50t + this.cash20t + this.cash10t + this.cash5t;
    console.log(this.cashtotal)
  }


}