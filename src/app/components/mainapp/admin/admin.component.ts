import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {Observable} from 'rxjs/Observable';
import {merge} from 'rxjs/observable/merge';
import {of as observableOf} from 'rxjs/observable/of';
import {catchError} from 'rxjs/operators/catchError';
import {map} from 'rxjs/operators/map';
import {startWith} from 'rxjs/operators/startWith';
import {switchMap} from 'rxjs/operators/switchMap';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})

export class AdminComponent  implements OnInit {
  //displayedColumns = ['created', 'state', 'number', 'title'];
  displayedColumns = ['username', 'access', 'email', 'timestamp'];
  exampleDatabase: ExampleHttpDao1 | null;
  dataSource = new MatTableDataSource();

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.exampleDatabase = new ExampleHttpDao1(this.http);

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          //return this.exampleDatabase!.getRepoIssues(this.sort.active, this.sort.direction, this.paginator.pageIndex);
          return this.exampleDatabase!.getRepoIssues();
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
}

export interface GithubApi {
  //items: GithubIssue[];
  items:users[]
  total_count: number;
}

export interface GithubIssue {
  created_at: string;
  number: string;
  state: string;
  title: string;
}

export interface users{
  useranme:string;
  access:string;
  email:string;
  datetiem:string;

}

/** An example database that the data source uses to retrieve data for the table. */
export class ExampleHttpDao {
  constructor(private http: HttpClient) {}

  getRepoIssues(sort: string, order: string, page: number): Observable<GithubApi> {
    const href = 'https://api.github.com/search/issues';
    const requestUrl =
        `${href}?q=repo:angular/material2&sort=${sort}&order=${order}&page=${page + 1}`;

    return this.http.get<GithubApi>(requestUrl);
  }
}

export class ExampleHttpDao1 {
  constructor(private http: HttpClient) {}

  getRepoIssues(): Observable<users[]> {
    const href = 'https://tyyzqr1pd0.execute-api.us-east-1.amazonaws.com/alpha/admin?function=list_all';
    const requestUrl = href;
        //`${href}?q=repo:angular/material2&sort=${sort}&order=${order}&page=${page + 1}`;
    console.log("called")
    return this.http.get<users[]>(requestUrl);
  }
}