import { HttpClient } from '@angular/common/http';
import { Component, Output, EventEmitter, HostListener, OnInit  } from '@angular/core';
import { GraphComponent } from './graph/graph.component';
import { LoaderService } from './loader/loader.service';
import { environment } from '../environments/environment';
import { AuthService } from './auth_services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  _show_graph: boolean = false;
  is_logged: boolean = false;
  currentApplicationVersion = environment.appVersion;

  constructor(private auth: AuthService) {}

  ngOnInit():void {
    this.is_logged = this.auth.is_auth;
  }

  logout():void {
    console.log (this.is_logged );
    this.auth.logout();
  }
}
