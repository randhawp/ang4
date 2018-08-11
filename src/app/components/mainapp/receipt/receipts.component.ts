import { OnInit } from '@angular/core';
import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams, HttpRequest } from '@angular/common/http';
import {WebapiService} from '../../../services/webapi.service'
import {StateService} from '../../../services/state.service'
import { Alert } from '../../../../../node_modules/@types/selenium-webdriver';

@Component({
  selector: 'app-receipts',
  templateUrl: './receipts.component.html',
  styleUrls: ['./receipts.component.css']
})
export class ReceiptComponent implements OnInit {
  @ViewChild('f') receiptForm: NgForm;
  submitted = false;
  url:string;
  paytypecontrol:string='credit'
  returnval:number =0;
  message:string;

  receiptCount:number = 0;

  lastReceiptAmount:number=0;
  lastPayType:string;
  lastRcvdFrom:string;
  formattedAmount:number=0;

  PayTypes = ['Debit', 'Visa', 'American','Cash'];
  constructor(public webapi: WebapiService,private state:StateService) { 

    this.receiptCount = this.state.receiptCount 
    this.lastPayType = this.state.lastPayType 
    this.lastRcvdFrom = this.state.lastRcvdFrom 
    this.lastReceiptAmount = this.state.lastReceiptAmount 


  }
  receiptData = {
    rcvdfrom: '',
    forreason: '',
    agent: '',
    amount: 0,
    usd: false,
    invoice: '',
    paytype:'',
    remarks:'',
    office:''
  };

 

  paytypes = [
    {value: 'cheque', viewValue: 'Cheque',selected:false},
    {value: 'directdeposit', viewValue: 'Direct Deposit',selected:false},
    {value: 'debit', viewValue: 'Debit',selected:false},
    {value: 'credit', viewValue: 'Credit',selected:false},
    {value: 'cash', viewValue: 'Cash',selected:true}
    
  ];

  lastReceiptData: any;
  ngOnInit() {
    console.log("the user permission is ===========")
    console.log(this.state.access)
    let l = this.state.getUserSecurityLevel(this.state.access)
    console.log(l.toString())
    console.log("the user permission is ===========")
    this.paytypecontrol='credit'
  }
  
  
  onSubmit() {
    this.submitted = true;
    this.receiptData.rcvdfrom = this.receiptForm.value.receiptFormData.rcvdfrom;
    this.receiptData.forreason = this.receiptForm.value.receiptFormData.forreason;
    this.receiptData.agent = this.state.user
    this.receiptData.amount = this.receiptForm.value.receiptFormData.amount;
    this.receiptData.usd = this.receiptForm.value.receiptFormData.usd;
    this.receiptData.invoice = this.receiptForm.value.receiptFormData.invoice;
    this.receiptData.paytype = this.receiptForm.value.receiptFormData.paytype;
    this.receiptData.remarks = this.receiptForm.value.receiptFormData.remarks;
    if ( this.receiptData.usd != true){
      this.receiptData.usd = false;
    }
    if (this.receiptData.remarks == "" ||  this.receiptData.remarks == null){
      this.receiptData.remarks="na"
    }
    console.log("submitting")
    console.log("1")
    console.log(this.receiptData.rcvdfrom)
    console.log("2")
    console.log(this.receiptData )
    this.lastReceiptData = this.receiptData
    if ( this.receiptData.paytype == 'directdeposit' && this.receiptData.usd == true) {
      alert("Direct deposit for USD not accepted. Receipt not saved. Please fix the problem to continue")
      return
    }
    this.url="receipt?function=add_new_receipt&paytype="+this.receiptData.paytype+"&rcvdfrom="+this.receiptData.rcvdfrom+
    "&invoice="+this.receiptData.invoice+"&lock=x&remark="+this.receiptData.remarks+"&fortrip="+this.receiptData.forreason+
    "&usd="+this.receiptData.usd+"&agent="+this.state.user+"&status=na&amount="+this.receiptData.amount+"&office="+this.state.office
    console.log(this.url)
    this.webapi.call('POST',this.url,this,null)
   
  }
  clearMessage(){
    this.returnval = 0
  }
  

  resetForm(){
    this.paytypecontrol='credit'
    console.log("reset...")
  }

  webapiCallback(message: string, result: any){

    console.log(message)
    if (message == "added"){
      this.returnval = 2
      this.receiptForm.reset()
      this.message="Receipt successfully entered"
      this.receiptCount += 1
      this.lastPayType = this.receiptData.paytype
      this.lastRcvdFrom = this.receiptData.rcvdfrom
      this.lastReceiptAmount = this.receiptData.amount
      
      this.state.receiptCount = this.receiptCount
      this.state.lastPayType = this.lastPayType
      this.state.lastRcvdFrom = this.lastRcvdFrom
      this.state.lastReceiptAmount = this.lastReceiptAmount
    } else {
      this.returnval = 1
      this.message="Failed to add receipt."
    }
   
  }

}
