import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';


import { Observable } from 'rxjs'
import { Injectable } from '@angular/core';

import { AuthService } from './auth.service';
@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    console.log("checking auth");
    console.log(this.authService.isAuthenticated());
    return this.authService.isAuthenticated()
    .then(
    (authenticated: boolean) => {
      if (authenticated) {
        return true;
      } else {
        return false;
      }
    }
    );
  }
}