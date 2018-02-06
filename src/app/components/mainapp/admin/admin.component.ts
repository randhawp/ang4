import {Component, OnInit, ViewChild,Inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {Observable} from 'rxjs/Observable';
import {merge} from 'rxjs/observable/merge';
import {of as observableOf} from 'rxjs/observable/of';
import {catchError} from 'rxjs/operators/catchError';
import {map} from 'rxjs/operators/map';
import {startWith} from 'rxjs/operators/startWith';
import {switchMap} from 'rxjs/operators/switchMap';
import {User} from '../../../models/users'
import {WebapiService} from '../../../services/webapi.service'
import {MatDialog, MAT_DIALOG_DATA} from '@angular/material';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})

export class AdminComponent  implements OnInit {
  //displayedColumns = ['created', 'state', 'number', 'title'];
  displayedColumns = ['username', 'access', 'email', 'timestamp'];
  userDb: UserDao | null;
  dataSource = new MatTableDataSource();
  rowdata: any;

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private http: HttpClient, private webapi:WebapiService,public dialog: MatDialog) {}

  ngOnInit() {
    this.userDb = new UserDao(this.webapi);

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          //return this.userDb!.getUsers(this.sort.active, this.sort.direction, this.paginator.pageIndex);
          return this.userDb!.getUsers();
        }),
        map(data => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.isRateLimitReached = false;
          //this.resultsLength = data.total_count;
          
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

  selectRow(row){
    this.rowdata = row
    console.log(row)
    this.openDialog()
  }
  openDialog() {
    this.dialog.open(DialogEditUser, {
      data: {
        payload: this.rowdata
      }
    });
  }
}



export class UserDao {
  constructor(private webapi:WebapiService) {}

  getUsers(): Observable<User[]> {
    return this.webapi.getUser()
  }
}

@Component({
  selector: 'admin-edit-users',
  templateUrl: 'admin-edit-users.html',
})
export class DialogEditUser {
  roles = [
    {value: 'AGENT', viewValue: 'Agent'},
    {value: 'HADMIN', viewValue: 'Head Office Admin'},
    {value: 'BADMIN', viewValue: 'Branch Office Admin'},
    {value: 'SADMIN', viewValue: 'System Admin'}
  ];
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
export class SelectOverviewExample {
  
}
