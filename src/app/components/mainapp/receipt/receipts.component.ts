import { OnInit } from '@angular/core';
import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams, HttpRequest } from '@angular/common/http';

@Component({
  selector: 'app-receipts',
  templateUrl: './receipts.component.html',
  styleUrls: ['./receipts.component.css']
})
export class ReceiptComponent implements OnInit {
  @ViewChild('f') receiptForm: NgForm;
  submitted = false;
  
  PayTypes = ['Debit', 'Visa', 'American','Cash'];
  constructor(private http: HttpClient) { }
  receiptData = {
    rcvdform: '',
    forreason: '',
    agent: ''
  };
  ngOnInit() {
    /*
      this.http.get('https://qhz4083ysl.execute-api.us-east-1.amazonaws.com/Stage/info', {
        headers: new HttpHeaders().set('Authorization', 'Bearer ' + "erewrw")
      }).subscribe(
        data => {
          console.log(data);
        },
        error => {
          console.log(error);
        }
      );*/
    
  }
   
  
  
  
  onSubmit() {
    this.submitted = true;
    this.receiptData.rcvdform = this.receiptForm.value.receiptFormData.rcvdfrom;
    this.receiptData.forreason = this.receiptForm.value.receiptFormData.forreason;
    console.log("submitting")
    console.log(this.receiptData.rcvdform )
    this.receiptForm.reset();
  }

}
