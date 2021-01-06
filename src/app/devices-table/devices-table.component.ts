import { Component, OnInit, EventEmitter, Output, ViewChild, isDevMode} from '@angular/core';
import { animate, AnimationEvent, state, style, transition, trigger } from '@angular/animations';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoaderService } from '../loader/loader.service';
import { LanguageService } from '../lingual_service/language.service'
import { ThemePalette } from '@angular/material/core';
import { CdkTableModule} from '@angular/cdk/table';
import { DataSource } from '@angular/cdk/table';
import { MatRadioModule } from '@angular/material/radio';
import { MatGridListModule } from '@angular/material/grid-list';
import { FormControl, SelectControlValueAccessor } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { EMPTY, throwError, TimeoutError } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { catchError, timeout, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { GraphComponent } from '../graph/graph.component';


export interface box_info {
  No: number, 
  group_id: string, 
  group_name: string, 
  display_name: string, 
  box_name: string,  
  address: string, 
  site_refer: string, 
  password: string,
}
export interface checkbox {
  name: string;
  checked: boolean;
  color: ThemePalette;
}
export interface user_informations {
  id : number,
  role : string,
  username : string,
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
  constructor(private httpClient: HttpClient, private _snackBar: MatSnackBar, private language: LanguageService) {
  }
  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  site_language: string;

  login_information: user_informations;

  information_dad: Array<string> = [];
  _show_graph: boolean = false;

  base_api_url: string = environment.city_url_api;
  prometheus_api: string = environment.prometheus_base_api_url ;
  columnsToDisplay: Array<any> = [
    {
      'key':'address',
      'fr':'Adresse',
      'en':'Address'
    },
    {
      'key':'group_name',
      'fr':'Nom de groupe',
      'en':'Group name'
    },
    {
      'key':'box_name',
      'fr':'Nom de boitier',
      'en':'Box name'
    }
  ];
  columnsToDisplayKeys: string[];
  BOX_DATA: box_info[] = [];
  JSON_data: any = [];
  filterNameBox = '';
  filterNameGroup = '';
  
  selection: box_info;
  graphs_available_list: string[] = [];
  graphs_available_list_backup: string[] = [];
  expandedElement: box_info | null;
  _disabled_visualize_box_form: boolean = true;
  _disabled_visualize_group_form: boolean = true;
  http_request_ok: boolean = false
  option: 'group'|'box' = "group";
  password: string = '';

  dataSource = new MatTableDataSource(this.BOX_DATA);
  graphs_group_form = new FormControl();
  graphs_box_form = new FormControl();
  
  ngOnInit(): void {
    this.site_language = this.language.get_language();

    if ( isDevMode() ) {
      console.log(history.state);
    }
    this.login_information = history.state;
    if ( !isDevMode() ) {
      this.get_devices();
    } else {
      this.httpClient.get("assets/json/map_devices.json").subscribe(json_data =>{
        this.JSON_data = json_data;
        this.data_formating();
      });
    }
    this.columnsToDisplayKeys = this.columnsToDisplay.map(col => col.key);
    console.log(this.columnsToDisplayKeys);
  }
 
  ngAfterViewInit(): void {
    if ( this.site_language == 'fr' ) {
      this.paginator = this.language.translate_paginator(this.paginator);
    }
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  data_formating(): void {
    let index = 0;
    for ( let group of this.JSON_data.groups ) {
      for ( let sites of group.sites ) {
        this.BOX_DATA.push({
          No: index, 
          group_id: group.groupId, 
          group_name: group.groupName, 
          display_name: group.displayName, 
          box_name: sites.siteName, 
          address: sites.datas.address, 
          site_refer:sites.siteReferer,
          password:''
        });
        index ++;
      }
    }
    this.refresh();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if ( this.dataSource.paginator ) {
      this.dataSource.paginator.firstPage();
    }
  }

  graph_avialable_catcher(metrics_available): void {
    this.graphs_available_list = [];
    metrics_available.forEach(metric_name => {
      this.graphs_available_list.push(metric_name);
    });
    this.graphs_available_list_backup = this.graphs_available_list;
  }

  getRecord(row:any, password:string): void {
    console.log('getRecord');
    let selected  = row;
    let api_prometheus : string = '';

    if ( !isDevMode() ) {
      api_prometheus = this.prometheus_api + '/' + password + '/prometheus/'  + selected.group_name + '/api/v1/label/__name__/values';
    } else {
      console.log(selected)
      api_prometheus = this.prometheus_api + '/api/v1/label/__name__/values';
    }
    this.graphs_group_form = new FormControl();
    this.graphs_box_form = new FormControl();
    let headers = new HttpHeaders();
    headers = headers.set('accept', 'application/json');
    this.httpClient.request('GET', api_prometheus, {headers}).pipe(
      timeout(10000), 
      map(res => {
        return res;
      }
    ),catchError(
      err => {
        throw err;
      }
      )).subscribe(prometheus_metrics =>{
        this.graph_avialable_catcher(prometheus_metrics['data']);
        this.selection = row;
        this.http_request_ok = true;
      },err => {
        this.http_request_ok = false;
        console.log(err);
      });
    row.highlighted = !row.highlighted;
  }

  get_group_info(group:any): void {
    if ( isDevMode() ) { //
      this.getRecord(group, '');
    } else {
      this.get_password(group);
    }
  }

  Visualize(group_name:any, box_name:string, _box_mode:boolean): void {
    let informations: Array<any> = [];
    let selected = this.selection;
    let checked;
    if ( _box_mode == false ) {
      informations.push([group_name, selected.password]);
      checked = this.graphs_group_form.value;
    } else {
      informations.push([group_name, selected.password, box_name,]);
      checked = this.graphs_box_form.value;
    }
    checked.forEach(metric => {
      informations.push(metric);
    });

    if ( isDevMode() ) {
      console.log(informations);
    }
    this._show_graph = true;
    this.information_dad = informations;
  }

  radioChange(event:any): void {
    this.option = event.value;
  }

  get_devices(): void{
    let url = this.base_api_url + '/ws/Map/Devices';
    let headers = new HttpHeaders();
    if ( isDevMode() ) {
      headers = headers.set('Accept-Encoding:', 'application/json');
    }
    this.httpClient.request('GET', url, {headers}).pipe(
      timeout(10000), 
      map(res => {
        return res;
      }
    ),catchError(
      err => {
        throw err;
      }
    )).subscribe(response  =>{
      if ( isDevMode() ) {
        console.log('map -> ok');
        console.log(response);
      }
      this.JSON_data = response;
      this.data_formating();
    });
  }

  get_password(group): any {
    console.log('getting paswword');
    let group_id = group['group_id'];
    let box_name = group['box_name']
    let url = this.base_api_url + '/ws/Group/Info/' + group_id;
    let headers = new HttpHeaders();
    headers = headers.set('accept', 'application/json');
    this.httpClient.request('GET', url, {headers})
      .toPromise()
      .then(response => {
        let password: string = response['group']['ienaDevices'][box_name]['localinterface_passwords']['user'];
        if ( isDevMode() ) {
          console.log(response);
          console.log(password);
        }
        this.selection.password = password;
        this.getRecord(group, password);
      });
    }

  refresh(): void {
    this.dataSource.data = this.dataSource.data;
  }

  filterListCareUnit(val: any):void {
    this.graphs_available_list = this.graphs_available_list_backup.filter(unit => unit.indexOf(val) > -1);
  }

  clearfilterBoxForm():void {
    this.filterNameBox = '';
    this.filterListCareUnit(this.filterNameBox);
  }

  clearfilterGroupForm():void {
    this.filterNameGroup = '';
    this.filterListCareUnit(this.filterNameGroup);
  }
  
  onChangeBoxForm (event: Event): void {
    if ( isDevMode() ) {
      console.log (event);
    }
    if ( this.graphs_box_form.value.length > 0 && this.http_request_ok == true ) {
      this._disabled_visualize_box_form = false;
    } else {
      this._disabled_visualize_box_form = true;
    }
  }

  onChangeGroupForm (event: Event): void {
    if ( isDevMode() ) {
      console.log (event);
    }
    if ( this.graphs_group_form.value.length > 0 && this.http_request_ok == true ) {
      this._disabled_visualize_group_form = false;
    } else {
      this._disabled_visualize_group_form = true;
    }
    console.log(this._disabled_visualize_group_form)
  }
}