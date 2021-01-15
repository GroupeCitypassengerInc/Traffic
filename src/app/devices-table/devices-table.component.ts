import { Component, OnInit, EventEmitter, Output, ViewChild, isDevMode} from '@angular/core';
import { Location } from '@angular/common';
import { animate, AnimationEvent, group, state, style, transition, trigger } from '@angular/animations';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { SelectionModel } from '@angular/cdk/collections';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, throwError, TimeoutError, Subscription } from 'rxjs';
import { catchError, timeout, map, filter, take, takeUntil} from 'rxjs/operators';
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
import { MatExpansionModule } from '@angular/material/expansion';
import { LoaderService } from '../loader/loader.service';
import { LanguageService } from '../lingual_service/language.service'
import { ThemePalette } from '@angular/material/core';
import { CdkTableModule} from '@angular/cdk/table';
import { DataSource } from '@angular/cdk/table';
import { MatRadioModule } from '@angular/material/radio';
import { MatGridListModule } from '@angular/material/grid-list';
import { FormControl, SelectControlValueAccessor } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { environment } from '../../environments/environment';
import { GraphComponent } from '../graph/graph.component';
import { AuthService } from '../auth_services/auth.service';
import { NotificationServiceService } from '../notification/notification-service.service'
import { ThemeHandlerService } from '../theme_handler/theme-handler.service'
import * as devices_json from '../../assets/json/map_devices.json';

export interface boxes {
  [key: string]: any
}

export interface box_info {
  No: number, 
  group_id: string, 
  group_name: string, 
  display_name: string, 
  box_name: string,  
  address: string, 
  site_refer: string, 
  router: string,
  password: string
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
  constructor(private httpClient: HttpClient,
              private language: LanguageService, 
              private auth: AuthService,
              public theme_handler: ThemeHandlerService,
              private route: ActivatedRoute,
              private router:Router,
              private location:Location,
              private notification: NotificationServiceService,) {
    this.user_info_subscription = this.auth.log_user_info_change.subscribe((user_info:user_informations) => {
      this.login_information = user_info;
      this.user_role = user_info.role;
    });
    this.site_language = this.language.get_language();
    if (isDevMode()){
      this.user_role = 'Support'
    } else {
      this.user_role = this.auth.user_info.role;
    }
  }
  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  
  panelOpenState: boolean;

  site_language: string;
  metric_alternative_name: any = this.language.metric_alternative_name;
  user_role: string = 'Support';
  user_info_subscription : Subscription;
  login_information: user_informations;
  _is_dark_mode_enabled: boolean;
  theme_subscription : Subscription;

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
  box_info: boxes = {};
  JSON_data: any = [];
  filterNameBox = '';
  filterNameGroup = '';
  
  selection: box_info;
  graphs_available_list: string[] = [];
  graphs_available_list_backup: string[] = [];
  expandedElement: box_info | null;
  _disabled_visualize_box_form: boolean = true;
  _disabled_visualize_group_form: boolean = true;
  _disabled_metric_list: boolean = true;
  http_request_ok: boolean = false
  option: 'group'|'box' = "group";
  password: string = '';
  
  dataSource = new MatTableDataSource(this.BOX_DATA);
  graphs_group_form = new FormControl();
  graphs_box_form = new FormControl();

  graph_from_uri: boolean = false;
  group_name_from_uri: string;
  box_from_uri: string;
  metric_array_from_uri: Array<any>
  
  ngOnInit(): void {
    this._is_dark_mode_enabled = localStorage.getItem('theme') === 'Dark' ? true : false;
    this.theme_subscription = this.theme_handler.theme_changes.subscribe((theme) => {
      this._is_dark_mode_enabled = theme === 'Dark' ? true : false;
    });
    this.login_information = history.state;
    if ( this.route.snapshot.paramMap.get('group') && this.route.queryParams['_value']['metric'] ) {
      this.graph_from_uri = true;
      this.panelOpenState = false
    } else {
      this.panelOpenState = true;
    }
    if ( !isDevMode() ) {
      this.get_devices();
    } else {
      this.JSON_data = (devices_json as any).default;
      this.data_formating();
    }
    this.columnsToDisplayKeys = this.columnsToDisplay.map(col => col.key);
  }
 
  ngAfterViewInit(): void {
    if ( this.site_language == 'fr' ) {
      this.paginator = this.language.translate_paginator(this.paginator);
    }
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.user_info_subscription.unsubscribe();
    this.theme_subscription.unsubscribe();
  }

  navigation(group_name: string, box: string, metric: Array<string>): void{
    let group: box_info;

    let metric_array: Array<string>;
    if ( typeof metric == 'string' ) {
      metric_array = [metric]
    } else {
      metric_array = metric
    }

    this.BOX_DATA.forEach((device, index) => {
      if ( device.group_name == group_name ) {
        group = this.BOX_DATA[index];
        if ( isDevMode() ) console.log(group);
      }
    })

    this.group_name_from_uri = group_name;
    this.metric_array_from_uri = metric_array;
    this.box_from_uri = box;

    this.get_group_info(group);
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
          site_refer: sites.siteReferer,
          router: group.router,
          password: '',
        });
        this.box_info[sites.siteName] = {
          group_name: group.groupName, 
          metric: [],
          router: group.router,
          citynet_url: this.prometheus_api.replace('XXXX', group.router)
        }
        index ++;
      }
    }
    this.refresh();

    if ( this.route.snapshot.paramMap.get('group') && this.route.queryParams['_value']['metric'] )  {
      let group = this.route.snapshot.paramMap.get('group').toString();
      let metric = this.route.queryParams['_value']['metric'];
      let box: string;
      if (this.route.snapshot.paramMap.get('box')) {
        box = this.route.snapshot.paramMap.get('box').toString();
      }
      this.navigation(group, box, metric);
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if ( this.dataSource.paginator ) {
      this.dataSource.paginator.firstPage();
    }
  }

  graph_avialable_catcher(metrics_available, box_name: string): void {
    this.graphs_available_list = [];
    metrics_available.forEach(metric_name => {
      if ( metric_name in this.metric_alternative_name[this.user_role] ){
        this.graphs_available_list.push(metric_name); 
        this.box_info[box_name]['metric'].push(metric_name)
      }
    });
    this.graphs_available_list_backup = this.graphs_available_list;
  }

  getRecord(row:any, password:string): void {
    let selected  = row;
    let api_prometheus : string = '';
    this.box_info[selected.box_name]['password'] = password;
    this.box_info[selected.box_name]['citynet_url'] += '/' + password
    if ( !isDevMode() ) {
      api_prometheus = this.box_info[selected.box_name]['citynet_url'] + '/prombuffer/'  + selected.group_name + '/api/v1/label/__name__/values';
    } else {
      api_prometheus = this.prometheus_api + '/api/v1/label/__name__/values';
    }
    
    this.graphs_group_form = new FormControl();
    this.graphs_box_form = new FormControl();
    let headers = new HttpHeaders();

    let metric_array: Array<any> = this.box_info[selected.box_name]['metric']
    if (  metric_array.length == 0 ){
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
        )).pipe(take(1))
        .subscribe(prometheus_metrics =>{
          this.graph_avialable_catcher(prometheus_metrics['data'], selected.box_name);
          this.selection = row;
          this.http_request_ok = true;
        },err => {
          this.http_request_ok = false;
          console.log(err);
          if ( this.site_language == 'fr' ) {
            this.notification.show_notification('Une erreur est survenue lors de la communication avec prometheus, veuillez réessayer plus tard','Fermer','error');
          } else {
            this.notification.show_notification('An error occurred while communicating with prometheus, please try again later.','Close','error');
          }
        });
    }
  }

  get_group_info(group:any): void {
    this._disabled_visualize_group_form = true;
    this._disabled_visualize_box_form = true;
    if ( isDevMode() ) { //
      this.getRecord(group, '');
      if ( this.graph_from_uri ) {
        this.Visualize_url(group, this.group_name_from_uri, this.box_from_uri, this.metric_array_from_uri, '');
        this.graph_from_uri = false;
      }
    } else {
      this.get_password(group);
    }
  }

  Visualize(group_name:any, box_name:string, _box_mode:boolean): void {
    let informations: Array<any> = [];
    let checked;
    let url: Array<string> = ['graph/', group_name];
    let uri = '/graph/' + group_name +'/';
    if ( _box_mode == false ) {
      informations.push([group_name, this.box_info[box_name]['citynet_url']]);
      checked = this.graphs_group_form.value;

    } else {
      informations.push([group_name, this.box_info[box_name]['citynet_url'], box_name]);
      checked = this.graphs_box_form.value;
      url.push(box_name);
      uri = uri + box_name + '/'
    }

    url.push('metric');
    uri = uri + 'metric?'
    checked.forEach(metric => {
      informations.push(metric);
      uri = uri + 'metric=' + metric + '&';
    });
    uri = uri.slice(0, -1);
    
    this._show_graph = true;
    this.information_dad = informations;
    this.router.navigateByUrl(uri)
    this.location.replaceState(uri);
  }

  Visualize_url(group:any, group_name:string, box_name:string, metric: Array<any>, password:string): void {
    let informations: Array<any> = [];
    let citynet_url: string;
    
    if ( !isDevMode() ) {
      citynet_url = this.prometheus_api.replace('XXXX', group.router) + '/' + password;
    } else {
      citynet_url = this.prometheus_api
    }
    if ( box_name ) {
      informations.push([group_name, citynet_url, box_name]);
    } else {
      informations.push([group_name, citynet_url]);
    }
    metric.forEach(metric => {
      informations.push(metric);
    });

    if ( isDevMode() ) console.log(informations);

    this._show_graph = true;
    this.information_dad = informations;
  }

  radioChange(event:any): void {
    this.option = event.value;
  }

  get_devices(): void{
    let url = this.base_api_url + '/ws/Map/Devices';
    let headers = new HttpHeaders();
    if ( isDevMode() ) headers = headers.set('Accept-Encoding:', 'application/json');
    this.httpClient.request('GET', url, {headers})
      .toPromise()
      .then(response => {
        if ( isDevMode() ) {
          console.log('map -> ok');
          console.log(response);
        }
        this.JSON_data = response;
        this.data_formating();
    });
  }

  get_password(group): any {
    let group_id = group['group_id'];
    let box_name = group['box_name'];
    let url = this.base_api_url + '/ws/Group/Info/' + group_id;
    let headers = new HttpHeaders();
    headers = headers.set('accept', 'application/json');
    this.httpClient.request('GET', url, {headers})
      .toPromise()
      .then(response => {
        let password = response['group']['ienaDevices'][box_name]['localinterface_passwords']['user'];

        this.password = password;
        this.getRecord(group, password);
        if ( this.graph_from_uri ) {
          this.Visualize_url(group, this.group_name_from_uri, this.box_from_uri, this.metric_array_from_uri, password);
          this.graph_from_uri = false;
        }
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
    if ( isDevMode() ) console.log (event);

    if ( this.graphs_box_form.value.length > 0 && this.http_request_ok == true ) {
      this._disabled_visualize_box_form = false;
    } else {
      this._disabled_visualize_box_form = true;
    }
  }

  onChangeGroupForm (event: Event): void {
    if ( isDevMode() ) console.log (event);

    if ( this.graphs_group_form.value.length > 0 && this.http_request_ok == true ) {
      this._disabled_visualize_group_form = false;
    } else {
      this._disabled_visualize_group_form = true;
    }
  }
}