import { Component, OnInit, Input, SimpleChanges, ChangeDetectorRef, ApplicationRef, isDevMode } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators  } from '@angular/forms';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, timeout, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '../auth_services/auth.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { BrowserModule } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';

export interface user_informations {
  id : number,
  role : string,
  username : string,
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})

export class LoginComponent implements OnInit {

  is_login_enable: boolean = true;
  login_form_group: FormGroup = this.form_builder.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });
  is_logged : boolean = this.auth.is_auth;
  user_info : user_informations;
  isChecked : boolean = true;
  return_url: string;

  constructor(private form_builder: FormBuilder, private auth: AuthService, private route: ActivatedRoute,
    private router: Router ) { }
  
  ngOnInit(): void {
    this.return_url = this.route.snapshot.queryParams['returnUrl'] || '/select';
    if ( isDevMode() ) console.log(this.return_url)
    this.auth.is_logged(this.return_url);
    this.is_logged = this.auth.is_auth;
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
  onSubmit(form : FormGroup): void {
    if ( isDevMode() ) {
      console.log(form);
    }
    let username = encodeURIComponent(form.controls['username'].value);
    let password = encodeURIComponent(form.controls['password'].value);
    let url_login = '/ws/User/Login?login=' + username + '&password=' + password;
    this.auth.login(url_login, this.return_url);
  }
}
