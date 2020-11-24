import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { animate, AnimationEvent, state, style, transition, trigger } from '@angular/animations';
import { HttpClient } from "@angular/common/http";
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule, MatFormFieldControl} from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { LoaderService } from '../loader/loader.service';
import { ThemePalette } from '@angular/material/core';

export interface box_info {
  No: number, 
  group_id: string, 
  group_name: string, 
  display_name: string, 
  box_name: string,  
  address: string, 
  site_refer: string, 
}
export interface checkbox {
  name: string,
  checked: boolean,
  color: ThemePalette,
}
export interface metric {
  data: string, 
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
  constructor(private httpClient: HttpClient) { }
  @Output() seleted_information_event: EventEmitter<Array<string>> = new EventEmitter();
  _show: boolean = false;
  _show_graph_available:boolean = false;
  displayedColumns: string[] = ['group_id','display_name', 'box_name', 'address'];
  BOX_DATA: any = [];
  JSON_data: any = [];
  dataSource =  new MatTableDataSource(this.BOX_DATA);
  selection: box_info;
  state: FadeState;
  prometheus_metrics_available: any;
  graphs_available_checkbox: checkbox[] = [];
  allComplete: boolean = false;

  ngOnInit(): void {
    this.httpClient.get("assets/json/map_devices.json").subscribe(json_data =>{
      this.JSON_data = json_data;
      this.data_formating();
    });
    console.log(this.BOX_DATA);
  }
 
  data_formating(){
    let index = 0;
    for (let group of this.JSON_data.groups){
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

  checkbox_creator(metrics_available){
    this.graphs_available_checkbox = [];
    metrics_available.forEach(metric_name => {
      let checkbox_properties = {} as checkbox ;
      checkbox_properties.name = metric_name;
      checkbox_properties.checked = false;
      checkbox_properties.color = "primary";
      this.graphs_available_checkbox.push(checkbox_properties);
    });
  }

  getRecord(row){
    this.httpClient.get("http://192.168.1.138:12333/prometheus/api/v1/label/__name__/values").subscribe(prometheus_metrics =>{
      this.prometheus_metrics_available = prometheus_metrics;
      this.checkbox_creator(this.prometheus_metrics_available.data);
      this.selection = row;
      this._show = true;
      this._show_graph_available = false;
      this.state = 'visible';
    });
  }

  select_box(selected_box:string, selected_group:string){
    this._show_graph_available = true;
    console.log (selected_box);
    console.log (selected_group);

  }

  select_group(selected_group:string){
    this._show_graph_available = true;
    console.log (selected_group);
  }

  clearSelection(){
    this._show = false;
    this._show_graph_available = false;
    this.selection = <box_info>{};
    this.state = 'hidden';
  }

  Visualize(){
    let checked = this.graphs_available_checkbox.filter(opt => opt.checked).map(opt => opt.name);
    console.log('visualize');
    console.log(this.graphs_available_checkbox);
    console.log(checked);
    this.seleted_information_event.emit(checked);

  }
  
  updateAllComplete() {
    this.allComplete = this.graphs_available_checkbox != null && this.graphs_available_checkbox.every(t => t.checked);
    console.log('update all');
    console.log(this.graphs_available_checkbox);
  }

  someComplete(): boolean {
    if (this.graphs_available_checkbox == null) {
      console.log(this.graphs_available_checkbox);
      return false;
    }
    console.log('Some complete');
    return this.graphs_available_checkbox.filter(t => t.checked).length > 0 && !this.allComplete;
  }

  setAll(completed: boolean) {
    this.allComplete = completed;
    console.log('Set all');
    if (this.graphs_available_checkbox == null) {
      console.log(this.graphs_available_checkbox);
      return;
    }
    this.graphs_available_checkbox.forEach(t => t.checked = completed);
  }
}