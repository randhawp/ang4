
import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
    name: "dataFilter"
})
export class DataFilterPipe implements PipeTransform {

    transform(array: any[], query: string): any {
        if (query) {
           // return this.transform(array, row=>row.name.indexOf(query) > -1);
        }
        return array;
    }
}