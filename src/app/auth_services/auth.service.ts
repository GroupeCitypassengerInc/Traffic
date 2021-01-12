import { Injectable } from '@angular/core';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, timeout, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

export interface user_informations {
  id : number,
  role : string,
  username : string,
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  is_auth : boolean = false;
  base_api_url : string = environment.city_url_api;
  public user_info : user_informations;
  log_status_change: Subject<boolean> = new Subject<boolean>();
  log_user_info_change: Subject<Object> = new Subject<Object>();

  constructor(private httpClient: HttpClient, private router: Router) { }
  
  login(url:string): void { 
    let headers = new HttpHeaders();
    headers = headers.set('accept', 'application/json');
    this.httpClient.request('GET', url, {headers}).pipe(
      timeout(10000), 
      map(res => {
        return res;
      }
    ),catchError(
      err => {
         if ( err.error.message == 'alreadyLogged' ) {
          this.redirect('/graph');
        } else {
          console.error(err.error.message);
        }
        throw err;
      }
    )).subscribe(response  =>{
      console.log('Login -> ok');
      //console.log(response);
      let user_info = {
        id : response['id'],
        role : response['role'],
        username : response['username']
      };
      this.update_user_info(user_info);
      this.update_log_status(true);
      this.redirect('/graph');
    });
  }

  logout(): boolean{
    let is_logged : boolean = this.is_auth;

    if ( is_logged == false) {
      return false;
    }
    
    let logged_api_url = this.base_api_url + '/ws/User/Logout';
    let headers = new HttpHeaders();
    
    headers = headers.set('accept', 'application/json');
    this.httpClient.request('GET', logged_api_url, {headers}).pipe(
      timeout(10000), 
      map(res => {
        return res;
      }
    ),catchError(
      err => {
        console.log('an error occured please try again');
        throw err;
      }
    )).subscribe(response  =>{
      console.log('Successfully logged out');
      this.redirect('/login')
      this.update_log_status(false);
    });
    return is_logged;
  }

  is_logged(): void | boolean {
    let is_logged : boolean = false;
    let logged_api_url = this.base_api_url + '/ws/User/Logged';
    let headers = new HttpHeaders();

    headers = headers.set('accept', 'application/json');
    this.httpClient.request('GET', logged_api_url, {headers}).pipe(
      timeout(10000), 
      map(res => {
        return res;
      }
    ),catchError(
      err => {
        console.log('user not logged');
        throw err;
      }
    )).subscribe(response  =>{
      //console.log(response);
      if ( response == null ) {
        this.update_log_status(false);
        is_logged = false;
        this.redirect('/login');
        return is_logged;
      }
      let user_info = {
        id : response['id'],
        role : response['role'],
        username : response['username']
      };
      is_logged = true;
      //console.log('Logged ? -> yes');
      this.update_user_info(user_info);
      this.update_log_status(true);
      if (window.location.pathname.split('/')[1] != 'graph'){
        this.redirect('/graph');
      } else {
        is_logged = true;
        return is_logged;
      }
    });
  }

  redirect(url:string) {
    this.router.navigateByUrl(url, { state: this.user_info});
  }

  update_log_status(status:boolean): void {
    this.is_auth = status;
    this.log_status_change.next(this.is_auth);
  }
  
  update_user_info(user_info:user_informations){
    this.user_info = user_info;
    this.log_user_info_change.next(this.user_info);
  }
}

