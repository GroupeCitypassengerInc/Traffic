import { Injectable, isDevMode } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})

export class GuardService implements CanActivate {
  
  constructor(private auth: AuthService, private router: Router) { }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if ( isDevMode() ){
      return true;
    } else {
      if( this.auth.is_auth ) {
        return true;
      } else {
        this.router.navigateByUrl('/loggin')
      }
    }
  }
}
