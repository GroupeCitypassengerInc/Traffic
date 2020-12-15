import { Component, OnInit, ChangeDetectionStrategy, isDevMode } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule  } from '@angular/forms';
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

  loginForm = this.fb.group({
    username: '',
    password: ''
  });
  isLogged : boolean = false;
  base_api_url : string = environment.city_url_api;
  constructor(private fb: FormBuilder, private httpClient: HttpClient) { }
  
  ngOnInit(): void {
  }
  
  onSubmit(){
    let username = this.loginForm.controls['username'].value;
    let password = this.loginForm.controls['password'].value;
    let url_login = this.base_api_url + 'User/Login?login=' + username + '&password=' + password;
    /*
    https://preprod.citypassenger.com/ws/User/Login?login=<LOGIN>&password=<PSWD>
      {
        "id": 180,
        "username": "rodolpheghio@gmail.com",
        "role": "Support"
      }
    */
    this.httpClient.get(url_login).pipe(
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
}
