import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { animate, AnimationEvent, state, style, transition, trigger } from '@angular/animations';
import { HttpClient } from "@angular/common/http";
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {MatCardModule} from '@angular/material/card';
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

export type FadeState = 'visible' | 'hidden';

@Component({
  selector: 'app-devices-table',
  templateUrl: './devices-table.component.html',
  styleUrls: ['./devices-table.component.css'],
  animations: [
    trigger('state', [
      state(
        'visible',
        style({
          opacity: '1'
        })
      ),
      state(
        'hidden',
        style({
          opacity: '0'
        })
      ),
      transition('* => visible', [animate('500ms ease-out')]),
      transition('visible => hidden', [animate('500ms ease-out')])
    ])
  ],
})

export class DevicesTableComponent implements OnInit {
  displayedColumns: string[] = ['group_id','display_name', 'box_name', 'address'];
  BOX_DATA: any = [];
  data: any = [];
  dataSource =  new MatTableDataSource(this.BOX_DATA);
  private _show: boolean = false;
  selection: box_info;
  state: FadeState;

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
    //console.log(row);
    this.selection = row;
    console.log(this.selection);
    this._show = true;
    this.state = 'visible';
  }

  clearSelection(){
    this._show = false;
    this.selection = <box_info>{};
    this.state = 'hidden';
    //console.log(this.selection);
  }
}
// Can't bind to 'matHeaderRowDef' since it isn't a known property of 'tr'
// Can't bind to 'matRowDefColumns' since it isn't a known property of 'tr'