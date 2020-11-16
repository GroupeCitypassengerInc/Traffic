import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { GroupedObservable } from 'rxjs';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';


@Component({
  selector: 'app-devices-list',
  templateUrl: './devices-list.component.html',
  styleUrls: ['./devices-list.component.css']
})
export class DevicesListComponent implements OnInit {

  @Output() seleted_information_event: EventEmitter<Array<string>> = new EventEmitter();

  groups: any = [];

  show_devices:boolean = true;

  constructor(private httpClient: HttpClient) { }
  
  ngOnInit(): void {
    this.httpClient.get("assets/json/map_devices.json").subscribe(data =>{
      console.log(data);
      this.groups = data;
    })
  }
  pass_information (group_name:string, box_name:string){
    console.log('Group name : ' + group_name);
    console.log('Box name : ' + box_name);
    this.seleted_information_event.emit([group_name, box_name]);

  }
  toogle_devices(){
    this.show_devices=!this.show_devices;
  }
}

