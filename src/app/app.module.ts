import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MapComponent } from './map/map.component';
import { DevicesListComponent } from './devices-list/devices-list.component';
import { GraphComponent } from './graph/graph.component';
import { DevicesTableComponent } from './devices-table/devices-table.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; 

import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule, MatFormFieldControl} from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InterceptorService } from './loader/interceptor.service';


@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    DevicesListComponent,
    GraphComponent,
    DevicesTableComponent,    
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
  ],
  exports:[

  ],
  providers: [
    {provide:HTTP_INTERCEPTORS,useClass:InterceptorService,multi:true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
