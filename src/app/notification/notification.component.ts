import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { LanguageService } from '../lingual_service/language.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {
  _lang: string;
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data:any, public snackBarRef:MatSnackBarRef<NotificationComponent>, private lang: LanguageService) { }

  ngOnInit(): void {
    this._lang = this.lang.get_language();
    if ( this._lang == 'fr' ){
      this.data.type = this.data.type === 'error' ? 'Erreur' : 'Succès';
    }
  }
}
