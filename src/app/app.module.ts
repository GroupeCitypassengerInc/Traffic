import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { GraphComponent } from './graph/graph.component';
import { DevicesTableComponent } from './devices-table/devices-table.component';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; 
import { throwError, TimeoutError } from 'rxjs';
import { catchError, timeout, map } from 'rxjs/operators';
import { SpinnerComponent } from './spinner/spinner.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule, MatFormFieldControl } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LoginComponent } from './login/login.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatetimepickerModule, MatNativeDatetimeModule } from "@mat-datetimepicker/core";
import { AppRoutingModule, routingComponents } from './app-routing/app-routing.module';
import { MatSliderModule } from '@angular/material/slider'; //
import { MatSlideToggleModule } from '@angular/material/slide-toggle'; //

import { InterceptorService } from './loader/interceptor.service';
import { AuthService } from './auth_services/auth.service';
import { GuardService } from './auth_services/guard.service';

@NgModule({
  declarations: [
    AppComponent,
    GraphComponent,
    DevicesTableComponent,
    SpinnerComponent,
    LoginComponent,
    routingComponents,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    MatTableModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatGridListModule,
    MatPaginatorModule,
    MatToolbarModule,
    MatIconModule,
    MatSnackBarModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDatetimepickerModule,
    MatNativeDatetimeModule,
    MatSliderModule,
    MatSlideToggleModule,
    AppRoutingModule,
  ],
  exports:[

  ],
  providers: [
    { provide:HTTP_INTERCEPTORS, useClass:InterceptorService, multi:true },
    AuthService,
    GuardService,
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
