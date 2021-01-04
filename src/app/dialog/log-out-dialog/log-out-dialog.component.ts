import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'; 
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../auth_services/auth.service';

@Component({
  selector: 'app-log-out-dialog',
  templateUrl: './log-out-dialog.component.html',
  styleUrls: ['./log-out-dialog.component.css']
})
export class LogOutDialogComponent implements OnInit {

  constructor(
    private auth: AuthService, 
    public dialogRef: MatDialogRef<LogOutDialogComponent>) {
  }

  ngOnInit(): void {
  }

  logout(): void {
    this.dialogRef.close();
    this.auth.logout();
  }

  close(): void {
    this.dialogRef.close();
  }
}
