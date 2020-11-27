import { Component, OnInit, EventEmitter, Output, ViewChild} from '@angular/core';
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
import { CdkTableModule} from '@angular/cdk/table';
import { DataSource } from '@angular/cdk/table';
import { MatRadioModule } from '@angular/material/radio';
import { MatGridListModule } from '@angular/material/grid-list';
import { FormControl } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { throwError, TimeoutError } from 'rxjs';
import { catchError, timeout, map } from 'rxjs/operators';

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
  name: string;
  checked: boolean;
  color: ThemePalette;
}

@Component({
  selector: 'app-devices-table',
  templateUrl: './devices-table.component.html',
  styleUrls: ['./devices-table.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

export class DevicesTableComponent implements OnInit {
  constructor(private httpClient: HttpClient) {
    this._disabled_visualize = true;
   }
  @Output() seleted_information_event: EventEmitter<Array<string>> = new EventEmitter();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  columnsToDisplay: string[] = ['group_id','display_name', 'box_name', 'address'];
  BOX_DATA: any = [];
  JSON_data: any = [];
  dataSource =  new MatTableDataSource(this.BOX_DATA);
  selection: box_info;
  prometheus_metrics_available: any;
  graphs_available_checkbox: checkbox[] = [];
  graphs_available_list: string[] = [];
  allComplete: boolean = false;
  expandedElement: box_info | null;
  graphs_form = new FormControl();
  _disabled_visualize : boolean = true;
  
  ngOnInit(): void {
    this.httpClient.get("assets/json/map_devices.json").subscribe(json_data =>{
      this.JSON_data = json_data;
      this.data_formating();
    });
  }
 
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  graph_avialable_catcher(metrics_available){
    this.graphs_available_list = [];
    console.log(metrics_available);
    metrics_available.forEach(metric_name => {
      this.graphs_available_list.push(metric_name);
    });
  }

  getRecord(row){
    console.log(row);
    this.httpClient.get("http://192.168.10.117:12333/prometheus/api/v1/label/__name__/values").pipe(
      timeout(5000), 
      map(res => {
        return res;
      }
    ),
    catchError(
      err => {
        throw err;
      }
    )).subscribe(prometheus_metrics =>{
      this.prometheus_metrics_available = prometheus_metrics;
      this.graph_avialable_catcher(this.prometheus_metrics_available.data);
      this.selection = row;
      this._disabled_visualize = false; // enable visualize button if any error has been catched
    },err => {
      this._disabled_visualize = true; // disable visualize button on http error
      console.log(err);
    });
    row.highlighted = !row.highlighted;
  }

  Visualize(){
    let checked = this.graphs_available_checkbox.filter(opt => opt.checked).map(opt => opt.name);
    this.seleted_information_event.emit(checked);
  }
  
  updateAllComplete() {
    this.allComplete = this.graphs_available_checkbox != null && this.graphs_available_checkbox.every(t => t.checked);
  }

  someComplete(): boolean {
    if (this.graphs_available_checkbox == null) {
      return false;
    }
    return this.graphs_available_checkbox.filter(t => t.checked).length > 0 && !this.allComplete;
  }

  setAll(completed: boolean) {
    this.allComplete = completed;
    if (this.graphs_available_checkbox == null) {
      return;
    }
    this.graphs_available_checkbox.forEach(t => t.checked = completed);
  }
}