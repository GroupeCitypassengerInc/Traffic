import { HttpClient } from '@angular/common/http';
import { Component, Output, EventEmitter, HostListener, OnInit  } from '@angular/core';
import { GraphComponent } from './graph/graph.component';
import { LoaderService } from './loader/loader.service';
import { environment } from '../environments/environment';
import { AuthService } from './auth_services/auth.service';
import { LanguageService } from './lingual_service/language.service'
import { Observable, Subject, Subscription } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from "@angular/platform-browser";
import { local } from 'd3';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  _show_graph: boolean = false;
  is_logged: boolean = false;
  currentApplicationVersion = environment.appVersion;
  _subscription : Subscription;

  site_locale: string;
  language_list = [
    { 
      code: 'en', 
      label: 'English' 
    },
    { 
      code: 'fr', 
      label: 'Français' 
    }
  ];

  constructor(private auth: AuthService, private language: LanguageService, private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
    this.matIconRegistry.addSvgIcon(
      'fr_flag',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/images/fr.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'gb_flag',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/images/gb.svg')
    );
  }

  ngOnInit(): void {
    this.is_logged = this.auth.is_auth;
    this._subscription = this.auth.log_status_change.subscribe((status) => {
      this.is_logged = status;
    });
    this.site_locale = this.language.get_language();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  logout(): void {
    console.log (this.is_logged );
    this.auth.logout();
  }

  debug(): void {
    console.log (this.is_logged );
  }

}
