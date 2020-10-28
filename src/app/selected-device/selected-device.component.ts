import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-selected-device',
  templateUrl: './selected-device.component.html',
  styleUrls: ['./selected-device.component.css']
})
export class SelectedDeviceComponent implements OnInit {
  informations = "Group: fiat lux Name: ignisAddress: Prometheusstraat 3, Rotterdam, Pays-Bas";
  group_name = 'fiat lux';
  device_name = 'ignis';
  address = 'Prometheusstraat 3, Rotterdam, Pays-Bas';
  
  constructor() {
  }

  ngOnInit(): void {
  }
  
}
