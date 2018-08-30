
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'readablePayTypes'})
export class SetPayTypesPipe implements PipeTransform {
  transform(value: string, exponent: string): string {
    console.log(value)
    if (value=='credit') return "Credit Card";
    if (value=='directdeposit') return "Direct Deposit";
    if (value=='cash') return "Cash";
    if (value=='cheque') return "Cheque";
    if (value=='debit') return "Debit";

    
  }
}
