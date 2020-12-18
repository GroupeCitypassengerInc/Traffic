import { Component, OnInit, Input, SimpleChanges, ChangeDetectorRef, ApplicationRef, isDevMode } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators  } from '@angular/forms';
import { HttpClientModule, HttpClient, HttpHeaders }    from '@angular/common/http';
import { catchError, timeout, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

export interface user_informations {
  id : number,
  role : string,
  username : string,
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {

  is_login_enable: boolean = true;
  login_form_group: FormGroup = this.form_builder.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });
  is_logged_in : boolean = false;
  base_api_url : string = environment.city_url_api;
  user_info : user_informations;

  constructor(private form_builder: FormBuilder, private httpClient: HttpClient, private _snackBar: MatSnackBar, private router: Router) { }
  
  ngOnInit(): void {
  }

  getError(field_name): string {
    switch (field_name) {
      case 'user':
        if ( this.login_form_group.get('username').hasError('required') ) {
          return 'Username required';
        }
        break;
      case 'pass':
        if ( this.login_form_group.get('password').hasError('required') ) {
          return 'Password required';
        }
        break;
      default:
        return '';
    }
  }

  //need to disable btn when waiting server's answer.
  onSubmit(form : FormGroup) : void {
    console.log(form);
    let username = encodeURIComponent(form.controls['username'].value);
    let password = encodeURIComponent(form.controls['password'].value);
    let url_login = this.base_api_url + '/ws/User/Login?login=' + username + '&password=' + password;
    this.login(url_login);
  }

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
        console.error(err.error.message);
        this.openSnackBar(err.error.message);
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
      console.log(this.user_info);
      console.log('not secure at all');
      this.openSnackBar('Welcome back !');
      this.redirect();
    });
  }

  logout(): boolean{
    let is_logged : boolean = this.is_logged_in;

    if ( is_logged == false) {
      this.openSnackBar('Already logout');
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
      is_logged = false;
      this.openSnackBar('Successfully logged out')
    });
    return is_logged;
  }

  is_logged(): boolean {
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
      console.log('Logged ? -> yes');
      
      is_logged = true;
      this.is_login_enable = false;
      this.openSnackBar('Welcome back !');
      
    });
    return is_logged;
  }

  openSnackBar(message: string): void {
    this._snackBar.open(message,'ok',{
      duration: 10000,
    });
  }

  redirect() {
    //this.router.navigate(['/graph']);
    this.router.navigateByUrl('/graph', { state: this.user_info});
  }
}
