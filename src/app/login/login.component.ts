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
  isLoggedIn : boolean = false;
  base_api_url : string = environment.city_url_api;
  user_info : any;

  constructor(private form_builder: FormBuilder, private httpClient: HttpClient) { }
  
  ngOnInit(): void {
  }

  getError(field_name) {
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

  login(url:string) { 
    this.is_login_enable = false;
    this.httpClient.request('GET', url).pipe(
      timeout(10000), 
      map(res => {
        
        return res;
      }
    ),catchError(
      err => {
        console.error(err.error.message);
        this.is_login_enable = true;
        throw err;
      }
    )).subscribe(response  =>{
      console.log('Login -> ok');
      this.is_login_enable = true;
      console.log(response);
      this.user_info = response;
    });
  }
}
