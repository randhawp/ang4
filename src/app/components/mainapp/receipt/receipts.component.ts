import { OnInit } from '@angular/core';
import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams, HttpRequest } from '@angular/common/http';
import {WebapiService} from '../../../services/webapi.service'
@Component({
  selector: 'app-receipts',
  templateUrl: './receipts.component.html',
  styleUrls: ['./receipts.component.css']
})
export class ReceiptComponent implements OnInit {
  @ViewChild('f') receiptForm: NgForm;
  submitted = false;
  url:string;
  
  PayTypes = ['Debit', 'Visa', 'American','Cash'];
  constructor(public webapi: WebapiService) { }
  receiptData = {
    rcvdfrom: '',
    forreason: '',
    agent: '',
    amount: 0,
    usd: false,
    invoice: '',
    paytype:'',
    remarks:''
  };

  lastReceiptData: any;
  ngOnInit() {
      
  }
  
  
  onSubmit() {
    this.submitted = true;
    this.receiptData.rcvdfrom = this.receiptForm.value.receiptFormData.rcvdfrom;
    this.receiptData.forreason = this.receiptForm.value.receiptFormData.forreason;
    this.receiptData.agent = this.receiptForm.value.receiptFormData.agent;
    this.receiptData.amount = this.receiptForm.value.receiptFormData.amount;
    this.receiptData.usd = this.receiptForm.value.receiptFormData.usd;
    this.receiptData.invoice = this.receiptForm.value.receiptFormData.invoice;
    this.receiptData.paytype = this.receiptForm.value.receiptFormData.paytype;
    this.receiptData.remarks = this.receiptForm.value.receiptFormData.remarks;
    console.log("submitting")
    console.log("1")
    console.log(this.receiptData.rcvdfrom)
    console.log("2")
    console.log(this.receiptData )
    this.lastReceiptData = this.receiptData
    this.url="receipt?function=add_new_receipt&paytype="+this.receiptData.paytype+"&rcvdfrom="+this.receiptData.rcvdfrom+
    "&invoice="+this.receiptData.invoice+"&lock=x&remark="+this.receiptData.remarks+"&fortrip="+this.receiptData.forreason+
    "&usd="+this.receiptData.usd+"&agent="+this.receiptData.agent+"&status=na&amount="+this.receiptData.amount
    
    this.webapi.call('POST',this.url,this)
    this.receiptForm.reset();
  }

  webapiCallback(message: string, result: any){

    console.log(message)
   
  }

}
