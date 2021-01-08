import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar'
import { NotificationComponent } from './notification.component'

@Injectable({
  providedIn: 'root'
})
export class NotificationServiceService {
  constructor(private snackBar: MatSnackBar) { }

  show_notification(display_message: string, button_text: string, message_type:'error' | 'success') {
    this.snackBar.openFromComponent(NotificationComponent,{
      data: {
        message: display_message,
        buttonText: button_text,
        type: message_type
      },
      duration: 10000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: message_type
    })
  }

}
