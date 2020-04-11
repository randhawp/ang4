import { Pipe, PipeTransform } from '@angular/core';
import { bool } from 'aws-sdk/clients/signer';

@Pipe({ name: 'printCurrencyType' })
export class PrintCurrencyType implements PipeTransform {
  transform(value: String | bool) {

    if (value == "true" || value == true) {
    
      return 'USD';
    }
    else {
      
      return ' ';
    }
    
  }
 
}
