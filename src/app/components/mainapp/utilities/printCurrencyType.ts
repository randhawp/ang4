import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'printCurrencyType' })
export class PrintCurrencyType implements PipeTransform {
  transform(value: String) {
    
    if (value=="true") {
    
      return 'USD';
    }
    else {
      
      return ' ';
    }
    
  }
}
