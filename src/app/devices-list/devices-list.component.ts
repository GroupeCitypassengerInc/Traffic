import { Component, OnInit, EventEmitter, Output, ViewChild, isDevMode} from '@angular/core';
import { Location } from '@angular/common';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { animate, AnimationEvent, group, state, style, transition, trigger } from '@angular/animations';

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
import { MatExpansionModule } from '@angular/material/expansion';

import { EMPTY, throwError, TimeoutError, Subscription } from 'rxjs';
import { catchError, timeout, map, filter, take, takeUntil} from 'rxjs/operators';

/* Services import */
import { AuthService } from '../auth_services/auth.service';
import { NotificationServiceService } from '../notification/notification-service.service';
import { ThemeHandlerService } from '../theme_handler/theme-handler.service';
import { LanguageService } from '../lingual_service/language.service';
import { LoaderService } from '../loader/loader.service';

/* Data import */
import * as devices_json from '../../assets/json/map_devices.json';
import * as metrics_config from '../../assets/json/config.metrics.json';
import { environment } from '../../environments/environment';
import { FormControl } from '@angular/forms';

/* Interfaces */
export interface user_informations {
  id : number,
  role : string,
  username : string,
}
export interface table_devices_info {
  group_name: string, 
  display_name: string, 
  box_name: string,
  box_display_name: string,
  address: string, 
}
export interface devices_informations {
  [key: string]: any
}

@Component({
  selector: 'app-devices-list',
  templateUrl: './devices-list.component.html',
  styleUrls: ['./devices-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class DevicesListComponent implements OnInit {
  metrics_config: any = (metrics_config as any).default;

  user_information: user_informations;
  _lang: 'fr' | 'en' | string;
  _is_dark_mode_enabled: boolean;
  theme_subscription : Subscription;
  metric_alternative_name: any = this.language.metric_alternative_name;

  prometheus_base_api_url = environment.prometheus_base_api_url;

  devices_informations: devices_informations = {};
  table_devices_informations: table_devices_info[] = [];

  datasource: MatTableDataSource<any>;
  expandedElement: table_devices_info | null;
  columnsToDisplay: Array<any> = [
    {
      'key':'address',
      'fr':'Adresse',
      'en':'Address'
    },
    {
      'key':'display_name',
      'fr':'Nom de groupe',
      'en':'Group name'
    },
    {
      'key':'box_display_name',
      'fr':'Nom de boitier',
      'en':'Box name'
    }
  ];
  columnsToDisplayKeys: string[] = [
    'address',
    'display_name',
    'box_display_name',
  ];
  graphs_group_form = new FormControl();
  _disabled_visualize_group_form: boolean = true;
  graphs_box_form = new FormControl();
  _disabled_visualize_box_form: boolean = true;
  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  
  constructor (private httpClient: HttpClient,
    private language: LanguageService, 
    private auth: AuthService,
    public theme_handler: ThemeHandlerService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private notification: NotificationServiceService)
  {
    this.user_information = this.auth.user_info;

    this._lang = this.language.language;
    this._is_dark_mode_enabled = localStorage.getItem('theme') === 'Dark' ? true : false;
    this.theme_subscription = this.theme_handler.theme_changes.subscribe((theme) => {
      this._is_dark_mode_enabled = theme === 'Dark' ? true : false;
    });
  }

  ngOnInit(): void {
    let map_devices;    
    this.get_map_devices();
    this.datasource = new MatTableDataSource<any>(this.table_devices_informations);
  }
  
  ngOnDestroy(): void {
    this.theme_subscription.unsubscribe();
  }

  ngAfterViewInit(): void {
    if ( this._lang == 'fr' ) {
      this.paginator = this.language.translate_paginator(this.paginator);
    }
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
  }

  get_map_devices(): void {
    let map_devices_api_url = '/ws/Map/Devices';
    this.httpClient.request('GET', map_devices_api_url, {})
      .pipe(timeout(10000))
      .toPromise()
      .then(response => {
        if ( 'groups' in response ) {
          let parsed_response = this.parse_map_devices(response);
          this.devices_informations = parsed_response;
          this.refresh_table();
        } else {
          throw new Error ('Can get map device. Requested URI : ' + map_devices_api_url);
        }
    });
  }

  parse_map_devices(map_devices: any): devices_informations {
    let devices_informations: devices_informations = {};

    for ( let group of map_devices.groups ) {
      devices_informations[group.groupName] = {
        group_id: group.groupId, 
        display_name: group.displayName,
        router: group.router,
        group_metric: new Array(),
        group_metric_backup: new Array(),
        citynet_url: this.prometheus_base_api_url.replace('XXXX', group.router),
        form_control: new FormControl(''),
        form_disabled: true,
        visualize_disabled: true,
      }
      for ( let sites of group.sites ) {
        this.table_devices_informations.push({
          group_name: group.groupName, 
          display_name: group.displayName, 
          box_name: sites.siteName, 
          box_display_name: sites.datas.displayedName,
          address: sites.datas.address, 
        });
        let group_name = group.groupName
        devices_informations[group_name][sites.siteName] = {
          box_name: sites.siteName, 
          box_address: sites.datas.address, 
          site_refer: sites.siteReferer,
          box_password: null,
          visualize_disabled: true,
          form_control: new FormControl(''),
        }
      }
    }
    if ( isDevMode() ) console.log(devices_informations);
    return devices_informations;
  }

  apply_filter(event :Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.datasource.filter = filterValue.trim().toLowerCase();
    if ( this.datasource.paginator ) {
      this.datasource.paginator.firstPage();
    }
  }

  on_row_click(row: table_devices_info): void {
    console.log(this.metric_alternative_name[this.user_information.role]["Dia"]);
    if ( this.devices_informations[row.group_name]['group_metric'] == 0 ) {
      this.devices_informations[row.group_name]['form_disabled'] = true;
    } else {
      this.devices_informations[row.group_name]['form_disabled'] = false;
    }

    if ( this.expandedElement != null ) {
      if ( this.devices_informations[row.group_name][row.box_name]['box_password'] == null) {
        this.get_box_password(row);
      } else if ( this.devices_informations[row.group_name]['group_metric'] == 0 ) {
        this.get_metric_list(row);
      } else {
        this.devices_informations[row.group_name]['form_disabled'] = false;
      }
    }
    if ( isDevMode() ) console.log(this.devices_informations);
  }

  get_metric_list(row: table_devices_info): void {
    let group_name: string = row.group_name;
    let box_name: string = row.box_name;
   
    let prometheus_api_url: string;

    let box_password: string = this.devices_informations[group_name][box_name]['box_password'];
    let citynet_url: string = this.devices_informations[group_name]['citynet_url']
    prometheus_api_url = citynet_url + '/' + box_password + '/prometheus/'  + group_name + '/api/v1/label/__name__/values';

    let headers = new HttpHeaders();
    headers = headers.set('accept', 'application/json');
    this.httpClient.request('GET', prometheus_api_url, {headers})
    .pipe(
      timeout(10000), 
      map(res => {
        return res;
      }
    ),catchError(
      err => {
        throw err;
      }
      )).pipe(take(1))
      .subscribe(response =>{
        let prometheus_metrics: Array<any> = response['data'];
        this.parse_get_metric(prometheus_metrics, group_name);
        this.devices_informations[row.group_name]['form_disabled'] = false;
      },err => {
        this.devices_informations[row.group_name]['form_disabled'] = true;
        if ( this._lang == 'fr' ) {
          this.notification.show_notification('Une erreur est survenue lors de la communication avec prometheus, veuillez réessayer plus tard.','Fermer','error');
        } else {
          this.notification.show_notification('An error occurred while communicating with prometheus, please try again later.','Close','error');
        }
        console.error(err);
      });
    let group_metric: Array<string>
  }

  parse_get_metric(prometheus_metrics: Array<any>, group_name: string): void {
    let metric_list: Array<string> = [];
    let custom_metric = this.metrics_config["custom_metric"];
    Object.keys(custom_metric["instant_vectors"]).forEach(metric =>{
      if ( custom_metric["instant_vectors"][metric]["role"].includes(this.user_information.role) ) {
        metric_list.push(metric);
      }
    });

    Object.keys(custom_metric["range_vectors"]).forEach(metric =>{
      if ( custom_metric["range_vectors"][metric]["role"].includes(this.user_information.role) ) {
        metric_list.push(metric);
      }
    });

    prometheus_metrics.forEach(metric_name => {
      if ( metric_name in this.metric_alternative_name[this.user_information.role] ) {
        metric_list.push(metric_name);
      }
    })
    
    this.devices_informations[group_name]['group_metric'] = metric_list;
    this.devices_informations[group_name]['group_metric_backup'] = metric_list;
  }
  
  get_box_password(row: table_devices_info): void {
    let group_id: number = this.devices_informations[row.group_name]['group_id'];
    let group_name: string = row.group_name;
    let group_info_api_url: string = '/ws/Group/Info/' + group_id;

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.set('accept', 'application/json');
    this.httpClient.request('GET', group_info_api_url, {headers})
      .pipe(timeout(10000))
      .toPromise()
      .then(response => {
        if ( !('group' in response) ) {
          throw new Error ('Can get group info Requested URI : ' + group_info_api_url);
        }
        Object.keys(response['group']['ienaDevices']).forEach(box_name => {
          this.devices_informations[group_name][box_name]['box_password'] = 
            response['group']['ienaDevices'][box_name]['localinterface_passwords']['user'];
        })
        this.get_metric_list(row);
      });
  }

  refresh_table(): void {
    this.datasource.data = this.datasource.data
  }

  onChangeGroupForm(event: Event, row: table_devices_info): void {
    if ( isDevMode() ) console.log (event);
    let group_name = row['group_name'];
    if ( this.devices_informations[group_name]['form_control'].value.length > 0 ) {
      this.devices_informations[group_name]['visualize_disabled'] = false;
    } else {
      this.devices_informations[group_name]['visualize_disabled'] = true;
    }
  }

  onChangeBoxForm(event: Event, row: table_devices_info): void {
    if ( isDevMode() ) console.log (event);
    let group_name = row['group_name'];
    let box_name = row['box_name'];
    if ( this.devices_informations[group_name][box_name]['form_control'].value.length > 0 ) {
      this.devices_informations[group_name][box_name]['visualize_disabled'] = false;
    } else {
      this.devices_informations[group_name][box_name]['visualize_disabled'] = true;
    }
  }

  filterListCareUnit(val: any, group_name: string):void {
    this.devices_informations[group_name]["group_metric"] = this.devices_informations[group_name]["group_metric_backup"].filter(unit => unit.indexOf(val) > -1);
  }

  visualize(group_name: string, box_name?: string): void  {
    
    let devices_informations = this.devices_informations;
    let graph_informations: Array<any> = [];
    let password: string;
    let metric_checked: Array<string>;
    let group_id: number = devices_informations[group_name]['group_id'];
    let router: string = devices_informations[group_name]['router'];
    let citynet_url: string = devices_informations[group_name]['citynet_url'];
    let redirect_url: string = '/graph/' + group_name + '/' + router + '/'; 

    if ( box_name == undefined ) {
      let key: string = Object.keys(devices_informations[group_name]).pop();
      password = devices_informations[group_name][key]['box_password'];
      metric_checked = devices_informations[group_name]['form_control'].value;
      graph_informations.push([group_name, citynet_url]);
      redirect_url = redirect_url + password + '/' +'metric?' ;
    } else {
      password = devices_informations[group_name][box_name]['box_password'];
      metric_checked = devices_informations[group_name][box_name]['form_control'].value;
      graph_informations.push([group_name, citynet_url, box_name]);
      redirect_url = redirect_url + password + '/' + box_name + '/metric?' ;
    }

    if( this.user_information.role == 'Support' || this.user_information.role == 'Admin' ) {
      metric_checked.forEach( (metric_name, index) =>{
        if ( metric_name in this.metrics_config ) {
          if (this.metrics_config[metric_name]['promql'] != "" ) {
            metric_checked.splice(index + 1, 0, metric_name + '_raw');
          }
        }
      })
    }

    let date = new Date();
    let date_string = date.toISOString();
    metric_checked.forEach((metric, index) =>{
      graph_informations.push(metric);
      if ( metric_checked.length - 1 == index ) {
        redirect_url = redirect_url + 'metric=' + metric + '&value=1&unit=hour&now=true&date='+ date_string; //
      } else {
        redirect_url = redirect_url + 'metric=' + metric + '&value=1&unit=hour&now=true&date=' + date_string + '&'; //
      }
    });
    this.router.navigateByUrl(redirect_url)
  }
}
