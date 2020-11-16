import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule, MatFormFieldControl} from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { SelectionModel } from '@angular/cdk/collections';


export interface box_info {
  No: number, 
  group_id: string, 
  group_name: string, 
  display_name: string, 
  box_name: string,  
  address: string, 
  site_refer: string, 
}

@Component({
  selector: 'app-devices-table',
  templateUrl: './devices-table.component.html',
  styleUrls: ['./devices-table.component.css']
})

export class DevicesTableComponent implements OnInit {
  displayedColumns: string[] = ['group_id','display_name','group_name', 'box_name', 'address'];
  BOX_DATA: any = [];
  data: any = [];
  dataSource =  new MatTableDataSource(this.BOX_DATA);

  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.httpClient.get("assets/json/map_devices.json").subscribe(json_data =>{
      this.data = json_data;
      this.data_formating();
    });
    console.log(this.BOX_DATA);
  }
 
  data_formating(){
    let index = 0;
    for (let group of this.data.groups){
      for (let sites of group.sites){
        this.BOX_DATA.push({
          No: index, 
          group_id: group.groupId, 
          group_name: group.groupName, 
          display_name: group.displayName, 
          box_name: sites.siteName, 
          address: sites.datas.address, 
          site_refer:sites.siteReferer,
        });
        index ++;
      }
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  getRecord(row){
    console.log(row);
  }
}
// Can't bind to 'matHeaderRowDef' since it isn't a known property of 'tr'
// Can't bind to 'matRowDefColumns' since it isn't a known property of 'tr'