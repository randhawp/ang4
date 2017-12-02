import { OnInit } from '@angular/core';
import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
@Component({
  selector: 'app-recepits',
  templateUrl: './recepits.component.html',
  styleUrls: ['./recepits.component.css']
})
export class RecepitsComponent implements OnInit {
  @ViewChild('f') receiptForm: NgForm;
  submitted = false;
  
  PayTypes = ['Debit', 'Visa', 'American','Cash'];
  constructor() { }
  receiptData = {
    rcvdform: '',
    forreason: '',
    agent: ''
  };
  ngOnInit() {
  }
  
  onSubmit() {
    this.submitted = true;
    this.receiptData.rcvdform = this.receiptForm.value.receiptFormData.rcvdfrom;
    this.receiptData.forreason = this.receiptForm.value.forreason;
    console.log("submitting")
    console.log(this.receiptData.rcvdform )
    this.receiptForm.reset();
  }

}
