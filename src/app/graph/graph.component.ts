import { Component, OnInit, Input, SimpleChanges, ChangeDetectorRef, ApplicationRef } from '@angular/core';
import { HttpClientModule, HttpClient, HttpHeaders }    from '@angular/common/http';
import { MatGridListModule } from '@angular/material/grid-list';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, LOCALE_ID } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatetimepickerModule, MatNativeDatetimeModule } from '@mat-datetimepicker/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Chart } from 'chart.js';
import * as ChartDatasourcePrometheusPlugin from 'chartjs-plugin-datasource-prometheus';
import { throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Graph_records {
  [ metric_name : string ] : {
    chart : Chart,
    t_value : number,
    t_unit : 'minute' | 'hour' | 'day',
    t_date : any, // Have to change this
    t_now : boolean,
  }
}

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
  endpoint : string = environment.base_url;
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

  constructor(private appRef: ChangeDetectorRef,  private _formBuilder: FormBuilder) {
    this.form_group = this._formBuilder.group({
      default_date: [{ value: '', disabled: true }, Validators.required]
    });
    
  }
  
  ngOnInit(): void {
    console.log('init graph component');
    this.default_date.setHours(this.default_date.getHours());
    this.options = this.information.shift();
    if ( this.options.length == 1 ) {
      this.base_url = '/' + this.options[0] + '/api/v1';
      this.box_selected = '';
    } else {
      this.base_url = '/' + this.options[0] + '/api/v1';
      this.box_selected = this.options[1]
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
      console.log('changes catch: ');
      console.log(this.information);
      this.destroy_all()
      this.ngOnInit();
      this.get_records();
      this.appRef.detectChanges();
      this.generate_all_graph();
    } 
  }

  get_records (): void {
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
        console.log(this.graphs_records);
      }
    );
  }

  set_charts (): void {
    this.query_list.forEach(
      query => {
        let chart = this.chart_builder(query);
        this.graphs_records[query]['m_chart'] = chart;
      }
    );
  }

  // Generate all graph
  generate_all_graph(): void {
    this.get_records (); 
    this.set_charts ();
  }

  // Destroy all graph
  destroy_all(): void {
    Object.keys(this.graphs_records).forEach(graph => {
      let chart = this.graphs_records[graph]['m_chart'];
      chart.destroy();
    } );
  }

  // Regenerate all graph
  regenerate_all_graph(): void {
    this.destroy_all();
    this.generate_all_graph();
  }

  // Re-generate graph
  regenerate(id:string): void {
    //console.log ('destroying ' + id + ' chart');
    this.graphs_records[id]['m_chart'].destroy();
    //console.log ('re-building ' + id + ' chart');
    this.graphs_records[id]['m_chart'] = this.chart_builder(id);
  }
  
  // Build chart
  chart_builder(id:string) {
    console.log('building : ' + id + ' chart');
    var ctx = document.getElementById(id);
    if ( ctx === null ) {
      throw new Error('An error as occured. An get id of : ' + id);
    }
    let query = id;
    var chart = new Chart(ctx, {
      type: 'line',
      plugins: [ChartDatasourcePrometheusPlugin],
      options: {
        responsive : true,
        //devicePixelRatio : 1,
        tension : 0,
        animation: {
          duration: 0
        }, 
        legend: {
          position: 'bottom',
          align: 'start'
        },
        label: {
        },
        plugins: {
          'datasource-prometheus': {
            prometheus: {
              endpoint: this.endpoint,
              //baseURL: "/api/v1",
            },
            query: query,
            stepped: true,
            timeRange: {
              type: 'relative',
              // from 12 hours ago to now
              start: this.up_start_time,
              end: this.end_time,
              step: 10,
              // refresh every 10s
              msUpdateInterval: 10 * 1000,
            },
          },
        },
      },
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

  // not implemented yet
  shouldDisableDecrement(inputValue: number): boolean {
    return !this._wrap && inputValue <= this._min;
  }

  // not implemented yet
  shouldDisableIncrement(inputValue: number): boolean {
    return !this._wrap && inputValue >= this._max;
  }

  unit_selection_changes(query: string){
    let t_value = this.graphs_records[query]['t_value'];
    let t_unit = this.graphs_records[query]['t_unit'];
    this.up_start_time = -1 * t_value * this._unit[t_unit] + this.end_time;
    this.regenerate(query);
  }

  time_value_changes(query: string){
    let t_value = this.graphs_records[query]['t_value'];
    let t_unit = this.graphs_records[query]['t_unit'];
    this.up_start_time = -1 * t_value * this._unit[t_unit] + this.end_time;
    this.regenerate(query);
  }

  date_changes(date){
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

  on_checkbox_change($event:Event, query:string){
    if ( $event['checked'] ) {
      let t_value = this.graphs_records[query]['t_value'];
      let t_unit = this.graphs_records[query]['t_unit'];
      this.up_start_time = -1 * t_value * this._unit[t_unit] + this.end_time;
      this.end_time = 0;
      this.regenerate(query);
    }
  }

  set_default_settings(query:string){
    this.up_start_time = this.default_up_start_time;
    this.end_time = this.default_end_time;
    this.regenerate(query);
  }
}
