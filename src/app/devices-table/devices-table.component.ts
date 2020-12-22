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
  password: string ,
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
  constructor(private httpClient: HttpClient, private _snackBar: MatSnackBar) {
    this._disabled_visualize = true;
  }
  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  login_information: user_informations;

  information_dad: Array<string> = [];
  _show_graph: boolean = false;

  base_api_url: string = environment.city_url_api;
  prometheus_api: string = environment.base_url ;
  columnsToDisplay: string[] = ['address','group_name', 'box_name'];
  BOX_DATA: box_info[] = [];
  JSON_data: any = [];

  selection: box_info;
  graphs_available_list: string[] = [];
  expandedElement: box_info | null;
  _disabled_visualize: boolean = true;
  http_request_ok: boolean = false
  option: 'group'|'box' = "group";
  password: string = '';

  dataSource = new MatTableDataSource(this.BOX_DATA);
  graphs_form = new FormControl();


  ngOnInit(): void {
    console.log(history.state);
    this.login_information = history.state;
    if ( !isDevMode() ) {
      this.get_devices();
    } else {
      this.httpClient.get("assets/json/map_devices.json").subscribe(json_data =>{
        this.JSON_data = json_data;
        this.data_formating();
      });
    }
  }
 
  ngAfterViewInit(): void {
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
  }

  onChange (event : Event): void {
    console.log (event);
    if ( this.graphs_form.value.length > 0 && this.http_request_ok == true ) {
      this._disabled_visualize = false;
    } else {
      this._disabled_visualize = true;
    }
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
  }

  getRecord(row:any, password:string): void {
    let selected  = row;
    let api_prometheus : string = '';
    console.log(selected)
    if ( !isDevMode() ) {
      console.log ('prod mode detected')
      api_prometheus = this.prometheus_api + '/' + password + '/prometheus/'  + selected.group_name + '/api/v1/label/__name__/values';
    } else {
      api_prometheus = this.prometheus_api + '/api/v1/label/__name__/values';
      console.log ('dev mode detected')
    }
    this.graphs_form = new FormControl();
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
        this._disabled_visualize = true; // enable visualize button if any error has been catched
      },err => {
        this._disabled_visualize = true; // disable visualize button on http error
        this.http_request_ok = false;
        console.log(err);
        this.openSnackBar(err);
      });
    row.highlighted = !row.highlighted;
  }

  Visualize(): void {
    let informations: Array<any> = [];
    let checked = this.graphs_form.value;
    let selected = this.selection;
    selected.password = this.password;
    
    if ( this.option == 'group' ) {
      informations.push([selected.group_name, selected.password]);
      console.log(informations);
    } else {
      informations.push([selected.group_name, selected.password, selected.box_name]);
      console.log(informations);
    }

    checked.forEach(metric => {
      informations.push(metric);
    });
    
    this._show_graph = true;
    this.information_dad = informations;
  }

  radioChange(event:any): void {
    this.option = event.value;
  }

  openSnackBar(message: string): void {
    this._snackBar.open(message,'ok',{
      duration: 10000,
    });
  }

  get_devices(){
    let url = this.base_api_url + '/ws/Map/Devices';
    let headers = new HttpHeaders();
    //headers = headers.set('Accept-Encoding:', 'application/json');
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
      console.log('map -> ok');
      console.log(response);
      this.JSON_data = response;
      this.data_formating();
    });
  }

  get_group_info (selection) : void {
    if ( isDevMode() ){
      this.getRecord(selection, '')
    } else {
      let group_id = selection.group_id;
      let url = this.base_api_url + '/ws/Group/Info/' + group_id;
      let headers = new HttpHeaders();
      headers = headers.set('accept', 'application/json');
      this.httpClient.request('GET', url, {headers})
        .toPromise()
        .then(response => {
          console.log(response);
          let password = response['group']['ienaDevices'][selection.box_name]['localinterface_passwords']['user'];
          console.log(password);
          this.password = password;
          this.getRecord(selection, password)
        });
    }
    
  }
}