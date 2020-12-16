import { Component, OnInit, ChangeDetectionStrategy, isDevMode } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators  } from '@angular/forms';
import { HttpClientModule, HttpClient, HttpHeaders }    from '@angular/common/http';
import { catchError, timeout, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {

  login_form_group: FormGroup = this.form_builder.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });
  isLoggedIn : boolean = false;
  base_api_url : string = environment.city_url_api;
  user_info : any;
  constructor(private form_builder: FormBuilder, private httpClient: HttpClient) { }
  
  ngOnInit(): void {
  }
  
  onSubmit(form : FormGroup) : void {
    console.log(form);
    let username = form.controls['username'].value;
    let password = form.controls['password'].value;
    let url_login = this.base_api_url + '/ws/User/Login?login=' + username + '&password=' + password;
    /*
    https://preprod.citypassenger.com/ws/User/Login?login=<LOGIN>&password=<PSWD>
      {
        "id": 180,
        "username": "rodolpheghio@gmail.com",
        "role": "Support"
      }
    */
   this.login(url_login);
  }

  is_logged_in () {
    // Check if the user is logged
    let url = this.base_api_url + '/ws/User/Logged';
    this.httpClient.get(url).pipe(
      timeout(10000), 
      map(res => {
        return res;
      }
    ),
    catchError(
      err => {
        throw err;
      }
    )).subscribe(response =>{
      console.log(response);
    },err => {
      throw new Error(err);
    });
  }

  login(url:string) { 
    this.httpClient.get(url).pipe(
      timeout(10000), 
      map(res => {
        return res;
      }
    ),
    catchError(
      err => {
        throw err;
      }
    )).subscribe(response =>{
      console.log(response);
    },err => {
      throw new Error(err);
    });
  }

  getError(field_name) {
    switch (field_name) {
      case 'user':
        if (this.login_form_group.get('username').hasError('required')) {
          return 'Username required';
        }
        break;
      case 'pass':
        if (this.login_form_group.get('password').hasError('required')) {
          return 'Password required';
        }
        break;
      default:
        return '';
    }
  }
}
