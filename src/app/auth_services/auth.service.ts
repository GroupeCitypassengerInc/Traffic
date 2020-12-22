import { Injectable } from '@angular/core';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, timeout, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';


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
  user_info : user_informations;

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
          this.redirect();
        } else {
          console.error(err.error.message);
        }
        throw err;
      }
    )).subscribe(response  =>{
      console.log('Login -> ok');
      console.log(response);
      this.user_info = {
        id : response['id'],
        role : response['role'],
        username : response['username']
      };
      this.is_auth = true;
      this.redirect();
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
        console.log('an errer occured please try again');
        throw err;
      }
    )).subscribe(response  =>{
      console.log('Successfully logged out');
      this.is_auth = false;
    });
    return is_logged;
  }

  is_logged(): void {
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
      console.log(response);
      if ( response == null ) {
        is_logged = false;
        return is_logged;
      }
      this.user_info = {
        id : response['id'],
        role : response['role'],
        username : response['username']
      };
      console.log('Logged ? -> yes');
      
      this.is_auth = true;
      this.redirect();
    });
  }

  redirect() {
    this.router.navigateByUrl('/graph', { state: this.user_info});
  }
}

