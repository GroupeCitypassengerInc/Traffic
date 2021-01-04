import { HttpClient } from '@angular/common/http';
import { Component, Output, EventEmitter, HostListener, OnInit, Inject } from '@angular/core';
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
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  _show_graph: boolean = false;
  is_logged: boolean = false;
  currentApplicationVersion = environment.appVersion;
  auth_status_subscription : Subscription;

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

  constructor(private auth: AuthService, public dialog: MatDialog, private language: LanguageService, private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
    this.matIconRegistry.addSvgIcon(
      'fr_flag',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/fr.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'gb_flag',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/gb.svg')
    );
  }

  ngOnInit(): void {
    this.is_logged = this.auth.is_auth;
    this.auth_status_subscription = this.auth.log_status_change.subscribe((status) => {
      this.is_logged = status;
    });
    this.site_locale = this.language.get_language();
  }

  ngOnDestroy(): void {
    this.auth_status_subscription.unsubscribe();
  }

  logout() {
    const dialogRef = this.dialog.open(LogOutDialog, {
      width: '250px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  debug(): void {
    console.log (this.is_logged );
  }
}


@Component({
  selector: 'log_out_confirmation_popup',
  templateUrl: 'confirmation_popup.html',
})

export class LogOutDialog {
  constructor(
    private auth: AuthService, 
    public dialogRef: MatDialogRef<LogOutDialog>, 
    @Inject(MAT_DIALOG_DATA) public data: string) {
    
  }

  logout(): void {
    this.dialogRef.close();
    this.auth.logout();
  }

  close(): void {
    this.dialogRef.close();
  }
}