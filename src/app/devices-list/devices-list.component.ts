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

  user_information: user_informations;
  _lang: 'fr' | 'en' | string;
  _is_dark_mode_enabled: boolean;
  theme_subscription : Subscription;

  base_api_url: string = environment.city_url_api;

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
  
  constructor(private httpClient: HttpClient,
    private language: LanguageService, 
    private auth: AuthService,
    public theme_handler: ThemeHandlerService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private notification: NotificationServiceService)
  {
    if ( isDevMode() ) {
      this.user_information = {
        id : 222,
        role : 'Support',
        username : 'RodolpheG',
      }
    } else {
      this.user_information = this.auth.user_info;
    }
    this._lang = this.language.language;
    this._is_dark_mode_enabled = localStorage.getItem('theme') === 'Dark' ? true : false;
    this.theme_subscription = this.theme_handler.theme_changes.subscribe((theme) => {
      this._is_dark_mode_enabled = theme === 'Dark' ? true : false;
    });
  }

  ngOnInit(): void {
    let map_devices;    
    if ( isDevMode() ) {
      map_devices = (devices_json as any).default;
    } else {
      map_devices = this.get_map_devices();
    }
    this.devices_informations = this.parse_map_devices(map_devices);
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

  get_map_devices(): any {
    let map_devices_api_url = this.base_api_url + '/ws/Map/Devices';
    let map_device: any = this.httpClient.request('GET', map_devices_api_url, {})
      .toPromise()
      .then(response => {
        if ( 'groups' in response ) {
          return response;
        } else {
          throw new Error ('Can get map device. Requested URI : ' + map_devices_api_url);
        }
    });
    return map_device;
  }

  parse_map_devices(map_devices: any): devices_informations {
    let devices_informations: devices_informations = {};
    for ( let group of map_devices.groups ) {
      for ( let sites of group.sites ) {
        this.table_devices_informations.push({
          group_name: group.groupName, 
          display_name: group.displayName, 
          box_name: sites.siteName, 
          box_display_name: sites.datas.displayedName,
          address: sites.datas.address, 
        });
        devices_informations[group.groupName] = {
          group_id: group.groupId, 
          display_name: group.displayName,
          router: group.router,
          group_metric: []
        }
        devices_informations[group.groupName][sites.siteName] = {
          box_name: sites.siteName, 
          box_address: sites.datas.address, 
          site_refer: sites.siteReferer,
          box_password: null,
        }
      }
    }
    return devices_informations;
  }

  apply_filter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.datasource.filter = filterValue.trim().toLowerCase();
    if ( this.datasource.paginator ) {
      this.datasource.paginator.firstPage();
    }
  }

  on_row_click(row:table_devices_info): void {

  }

  get_metric_list(): void {
    
  }
  
  get_box_password(): void {

  }
  
}
