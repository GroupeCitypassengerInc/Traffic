import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { GroupedObservable } from 'rxjs';


@Component({
  selector: 'app-devices-list',
  templateUrl: './devices-list.component.html',
  styleUrls: ['./devices-list.component.css']
})
export class DevicesListComponent implements OnInit {

  @Output() seleted_name_event: EventEmitter<string> = new EventEmitter();

  groups: any = [];

  show_devices:boolean = true;

  constructor(private httpClient: HttpClient) { }
  
  ngOnInit(): void {
    this.httpClient.get("assets/json/map_devices.json").subscribe(data =>{
      console.log(data);
      this.groups = data;
    })
  }
  pass_name (str:string){
    console.log('child : ' + str);
    this.seleted_name_event.emit(str);
  }
  toogle_devices(){
    this.show_devices=!this.show_devices;
  }

}

