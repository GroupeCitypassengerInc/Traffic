import { Component, OnInit, Input, SimpleChanges, ChangeDetectorRef, ApplicationRef, isDevMode } from '@angular/core';
import { HttpClientModule, HttpClient, HttpHeaders }    from '@angular/common/http';
import { catchError, timeout, map } from 'rxjs/operators';
import { MatGridListModule } from '@angular/material/grid-list';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule, _countGroupLabelsBeforeOption } from '@angular/material/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, LOCALE_ID } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatetimepickerModule, MatNativeDatetimeModule } from '@mat-datetimepicker/core';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Chart } from 'chart.js';
import { throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { setPriority } from 'os';

export interface unit_conversion {
  minute : number,
  hour : number,
  day : number,
}

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})

export class GraphComponent implements OnInit {

  @Input() information: Array<string>;
  Object = Object;

  query_list : any = [];

  // Request : /prometheus/api/v1/query_range?query=up&start=1604584181.313&end=1604670581.313&step=9250
  prometheus_api_url : string = environment.prometheus_base_api_url;
  base_url : string = '';
  box_selected : string = '';

  default_up_start_time : number = -1 * 60 * 60 * 1000;
  default_end_time : any = 0;
  up_start_time : number = this.default_up_start_time;
  end_time : number = this.default_end_time;
  start_date : Date;
  options : any;

  form_group: FormGroup;
  graphs_records : any = {};
  default_value: number = 1;
  default_date: Date = new Date();

  _step: number = 1;
  _min: number = 0;
  _max: number = Infinity;
  _wrap: boolean = true;
  _now: boolean = true;
  color: string = 'primary';
  default_unit: 'minute' | 'hour' | 'day' = 'hour';
  _unit : unit_conversion = {
    minute : 60 * 1000,
    hour : 60 * 60 * 1000,
    day : 27 * 60 * 60 * 1000,
  }
  unit_select = new FormControl(false);

  constructor(private appRef: ChangeDetectorRef,  private _formBuilder: FormBuilder, private httpClient: HttpClient) {
    this.form_group = this._formBuilder.group({
      default_date: [{ value: '', disabled: true }, Validators.required]
    });
  }
  
  ngOnInit(): void {
    this.default_date.setHours(this.default_date.getHours());
    this.options = this.information.shift();
    if ( isDevMode() ) {
      console.log(this.options);
    }
    if ( this.options.length == 2 ) {
      this.base_url = '/' + this.options[1] + '/prometheus/' + this.options[0] + '/api/v1';
      this.box_selected = null;
    } else {
      this.base_url = '/' + this.options[1] + '/prometheus/' + this.options[0] + '/api/v1';
      this.box_selected = this.options[2]
    }
    this.query_list = this.information;
    this.get_records();
    this.form_group.valueChanges.subscribe(date => {
      this.date_changes(date);
    });
  }

  ngAfterViewInit(): void {
    this.set_charts();
  }

  ngOnChanges(changes: any): void {
    if ( !changes['information'].isFirstChange() ) {
      if ( isDevMode() ) {
        console.log('changes catch: ');
        console.log(this.information);
      }
      this.destroy_all()
      this.ngOnInit();
      this.get_records();
      this.appRef.detectChanges();
      this.generate_all_graph();
    } 
  }

  get_records(): void {
    this.graphs_records = {};
    this.query_list.forEach(
      query => {
        this.graphs_records[query] = {
          m_chart : "chart",
          t_value : this.default_value,
          t_unit : this.default_unit,
          t_date : this._formBuilder.control({
            value: this.default_date, disabled: false
          }),
          t_now : this._now,
        }
        this.form_group.addControl(query, this.graphs_records[query]['t_date']);
      }
    );
  }

  set_charts(): void {
    if ( isDevMode() ) {
      console.log('set charts')
      console.log(this.query_list)
    }
    this.query_list.forEach(
      query => {
        this.get_metric_from_prometheus(query);
      }
    );
  }

  generate_all_graph(): void {
    this.get_records (); 
    this.set_charts ();
  }

  destroy_all(): void {
    Object.keys(this.graphs_records).forEach(graph => {
      let chart = this.graphs_records[graph]['m_chart'];
      chart.destroy();
    } );
  }

  regenerate_all_graph(): void {
    this.destroy_all();
    this.generate_all_graph();
  }

  regenerate(id:string): void {
    this.graphs_records[id]['m_chart'].destroy();
    if ( isDevMode() ) {
      console.log ('destroying ' + id + ' chart');
      console.log(this.graphs_records);
      console.log ('re-building ' + id + ' chart');
    }
    this.graphs_records[id]['m_chart'] = this.get_metric_from_prometheus(id);
    if ( isDevMode() ) {
      console.log(this.graphs_records[id]['m_chart'])
    }
  }
  
  get_metric_from_prometheus( metric:string ): void {
    const currentDate = new Date();
    const timestamp = currentDate.getTime();
    let start_time = ( timestamp + this.up_start_time ) / 1000;
    let end_time = ( timestamp +  this.end_time ) / 1000;
    let step = 10; //max 11 000
    step = this.get_prometheus_step(start_time, end_time);
    let query = ''; 
    if ( this.box_selected != null ) {
      query = '/query_range?query=' + metric + '%7Bjob=~%22' + this.box_selected + '.*%22%7D&start=' + start_time + '&end=' + end_time + '&step=' + step;
    } else {
      query = '/query_range?query=' + metric + '&start=' + start_time + '&end=' + end_time + '&step=' + step;
    }
    if ( isDevMode() ) {
      console.log ('dev mode detected');
      this.base_url = '/api/v1';
    }
    let url = this.prometheus_api_url + this.base_url + query;
    let headers = new HttpHeaders();
    headers = headers.set('accept', 'application/json');
    this.httpClient.request('GET', url, {headers})
      .toPromise()
      .then(response => {
        if ( isDevMode() ) {
          console.log(response);
        }
        
        if ( response['status'] != 'success' ) {
          throw new Error ('Request to prom : not successful');
        }
        let parsed_data = this.parse_response(response['data']['result'], metric);
        this.graphs_records[metric]['m_chart'] = this.chart_builder(metric, parsed_data);
      });
  }

  get_extra_label(response:any): boolean | string {
    delete response['__name__'];
    delete response['instance'];
    delete response['job'];
    let extra_label = Object.keys(response).toString();
    if ( extra_label == null ) {
      return false;
    } else {
      return extra_label;
    }
  }

  parse_response(data_to_parse : any, metric:string): Object {
    if ( isDevMode() ) {
      console.log(data_to_parse);
    }
    let datasets = [];
    let metric_timestamp_list = [];
    for ( const key in data_to_parse ) {

      let instance;
      if ( isDevMode() ) {
        instance = data_to_parse[key]['metric']['instance'];
      } else {
        instance = data_to_parse[key]['metric']['job'];
      }

      let metric_value_list = [];
      data_to_parse[key]['values'].forEach(value=>{
        metric_timestamp_list.push(value[0] * 1000); //Chartjs need ms timestamp to work correctly
        metric_value_list.push(value[1]);
      });
      
      let extra_label: any = this.get_extra_label(data_to_parse[key]['metric']);
      let dataset;
      if ( extra_label == false ) {
        dataset = {
          label: metric + ' { instance : ' + instance + ' } ',
          data: metric_value_list,
          pointRadius: 1,
          borderColor : this.get_random_color()
        };
      } else {
        dataset = {
          label: metric + ' { ' + extra_label +' : '+ data_to_parse[key]['metric'][extra_label] +' } { instance : ' + instance + ' } ',
          data: metric_value_list,
          pointRadius: 1,
          borderColor : this.get_random_color()
        };
      }
      
      datasets.push(dataset);
    }
    let parsed_data = {
      labels: metric_timestamp_list,
      datasets: datasets
    };
    return parsed_data;
  }

  get_random_color(): string {
    var HEX = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += HEX[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  // Compute a step for range_query (interval between 2 points in second)
  // Min step: 1s
  // Default: 1 step every 10px
  get_prometheus_step( start: number, end: number ): number {
    const second_duration = ( end - start );
    let chart_width = window.innerWidth;
    let step = Math.floor( second_duration / chart_width ) * 10;
    if ( isDevMode() ) {
      console.log (end + ' ' + start + ' ' + second_duration + ' ' + chart_width)
      console.log(step);
    }
    if ( step == 0 ) {
      step = 1;
    }
    return step;
  }
  
  chart_builder(metric:string, data): Chart {
    if ( isDevMode() ) {
      console.log('building : ' + metric + ' chart');
      console.log(data);
    }
    let ctx = document.getElementById(metric);
    if ( ctx === null ) {
      throw new Error('An error as occured. Can\'t get id ok : ' + metric);
    }
    var chart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        responsive : true,
        tension : 0,
        animation: {
          duration: 1
        }, 
        legend: {
          position: 'bottom',
          align: 'start'
        },
        scales: {
          xAxes: [{
            type: 'time',
            time: {
              displayFormats: {
                second: 'YYYY MM D hh:mm:ss a'
              }
            }
          }]
        }
      }
    });
    return chart;
  }

  incrementValue(step: number = 1, query : string): void {
    let inputValue = this.graphs_records[query]['t_value'] + step;
    if ( this._wrap ) {
      inputValue = this.wrappedValue(inputValue);
    }
    this.graphs_records[query]['t_value'] = inputValue;
    this.time_value_changes(query);
  }

  setColor(color: string): void {
    this.color = color;
  }

  private wrappedValue(inputValue): number {
    if ( inputValue > this._max ) {
      return this._min + inputValue - this._max;
    }
    if ( inputValue < this._min ) {
      if ( this._max === Infinity ) {
        return 0;
      }
      return this._max + inputValue;
    }
    return inputValue;
  }

  unit_selection_changes(query: string): void {
    let t_value = this.graphs_records[query]['t_value'];
    let t_unit = this.graphs_records[query]['t_unit'];
    this.up_start_time = -1 * t_value * this._unit[t_unit] + this.end_time;
    this.regenerate(query);
  }

  time_value_changes(query: string): void {
    let t_value = this.graphs_records[query]['t_value'];
    let t_unit = this.graphs_records[query]['t_unit'];
    this.up_start_time = -1 * t_value * this._unit[t_unit] + this.end_time;
    this.regenerate(query);
  }

  date_changes(date): void {
    let query = Object.keys(date).toString();
    this.default_date = new Date();
    let current_timestamp = this.default_date.getTime();
    let selected_date_timestamp = date[query].getTime();
    this.end_time = (current_timestamp - selected_date_timestamp) * -1;
    let t_value = this.graphs_records[query]['t_value'];
    let t_unit = this.graphs_records[query]['t_unit'];
    this.up_start_time = -1 * t_value * this._unit[t_unit] + this.end_time;
    this.regenerate(query);
    if ( this.end_time < this.up_start_time ) {
      this.end_time = 0;
      throw new Error('the selected date must not be in the future. Selected date : ' + date[query].toTimeString() );
    } else {
      this.regenerate(query);
    }
  }
  
  shouldDisableDecrement(inputValue: number): boolean {
    return !this._wrap && inputValue <= this._min;
  }
  
  shouldDisableIncrement(inputValue: number): boolean {
    return !this._wrap && inputValue >= this._max;
  }

  on_checkbox_change($event:Event, query:string): void {
    if ( $event['checked'] ) {
      let t_value = this.graphs_records[query]['t_value'];
      let t_unit = this.graphs_records[query]['t_unit'];
      this.up_start_time = -1 * t_value * this._unit[t_unit] + this.end_time;
      this.end_time = 0;
      this.regenerate(query);
    }
  }

  set_default_settings(query:string): void {
    this.up_start_time = this.default_up_start_time;
    this.end_time = this.default_end_time;
    this.regenerate(query);
  }
}
