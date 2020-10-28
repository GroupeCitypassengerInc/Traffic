import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { MapComponent } from './map/map.component';
import { DevicesListComponent } from './devices-list/devices-list.component';
import { SelectedDeviceComponent } from './selected-device/selected-device.component';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    DevicesListComponent,
    SelectedDeviceComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
