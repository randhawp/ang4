import {Component, OnInit, ViewChild,Inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {Observable, merge, of as observableOf} from 'rxjs';
import {catchError, map, startWith, switchMap} from 'rxjs/operators';
import {User} from '../../../models/users'
import {WebapiService} from '../../../services/webapi.service'
import {MatDialog,MatDialogRef,MAT_DIALOG_DATA} from '@angular/material';
import { Pipe, PipeTransform } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
//
import { AuthService } from '../../../services/auth.service';
import {Router} from '@angular/router'
@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})

export class AdminComponent  implements OnInit {
  //displayedColumns = ['created', 'state', 'number', 'title'];
  displayedColumns = ['username', 'access', 'email', 'timestamp','actions'];
  userDb: UserDao | null;
  dataSource = new MatTableDataSource();
  rowdata: any;
  selectedrole:any;
  selectedRowIndex: number = -1;
  previousrow:number = -1
  selectedUser:string;
  mode:string = "";
  tableSelectedRow:number =-1;
  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private http: HttpClient, private webapi:WebapiService,public dialog: MatDialog,private ref: ChangeDetectorRef,public auth:AuthService,private router:Router) {}

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
          this.ref.markForCheck();
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
    this.selectedUser = this.rowdata.username
    this.openDialog()
  }
  highlight(row,i){
    console.log(i);
    this.tableSelectedRow = i
    this.selectedRowIndex = row.username
    
  }
  webapiCallback(message: string, result: any){

    console.log(message)
    if ( this.mode == "DELETE"){
      console.log("mode is delete")
      //this.dataSource.data[this.selectedRowIndex] = null
      this.dataSource.data.splice(this.tableSelectedRow, 1);
      this.dataSource.paginator = this.paginator;
    }
     
  }

  deleteUser(row){ 
    this.rowdata = row
    
    console.log("delete user " + this.rowdata.username)
    this.openDeleteDialog();
  }

    
  openDialog() {
    let dialogRef = this.dialog.open(DialogEditUser, {
    
      data: {
        payload: this.rowdata
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
      this.selectedrole = result;
      console.log('The dialog was closed' + this.selectedrole);
      this.rowdata.access = this.selectedrole
      this.mode="EDIT"
      var url_param:string="admin?function=edit_user&key=" +this.selectedUser+"&role="+this.selectedrole+"&status=active"
      this.webapi.call('GET',url_param,this,null)
      }
    });
  }

  openDeleteDialog() {
    let dialogRef = this.dialog.open(DialogDeleteUser, {
    
      data: {
        payload: this.rowdata
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
      console.log(result)
      this.rowdata.access = this.selectedrole
      this.mode="DELETE";
      var url_param:string="admin?function=delete_user&key=" +this.rowdata.username
      console.log(url_param)
      this.webapi.call('GET',url_param,this,null)
      }
    });
  }

  addRow(){ 
    const data = {username: "sd", access: "dsfsd", email: 'test', timestamp: 291};
  
  }
  
  
}




export class UserDao {
  constructor(private webapi:WebapiService) {}

  connect(): Observable<User[]> {
    return this.webapi.getUser()
  }

  getUsers(): Observable<User[]> {
    return this.webapi.getUser()
  }
}

@Component({
  selector: 'admin-edit-users',
  templateUrl: 'admin-edit-users.html',
})
export class DialogEditUser {
  selected=''
  roles = [
    {value: 'AGENT', viewValue: 'Agent'},
    {value: 'HADMIN', viewValue: 'Head Office Admin'},
    {value: 'BADMIN', viewValue: 'Branch Office Admin'},
    {value: 'SADMIN', viewValue: 'System Admin'}
  ];
  //constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
  constructor(
    public dialogRef: MatDialogRef<DialogEditUser>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'admin-delete-user',
  templateUrl: 'admin-delete-user.html',
})
export class DialogDeleteUser {
  selected=''
  //constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
  constructor(
    public dialogRef: MatDialogRef<DialogDeleteUser>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

@Pipe({name: 'setRole'})
export class SetRolePipe implements PipeTransform {
  transform(value: string, exponent: string): string {
    
    if (value=='AGENT') return "Agent";
    if (value=='HADMIN') return "Head Office Admin";
    if (value=='BADMIN') return "Branch Office Admin";
    if (value=='SADMIN') return "System Manager";

    if (value=='Agent') return "AGENTr";
    if (value=='Head Office Admin') return "HADMIN";
    if (value=='Branch Office Admin') return "BADMIN";
    if (value=='System Manager') return "SADMIN";
    
  }
}

