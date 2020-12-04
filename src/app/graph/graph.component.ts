import { Component, OnInit, Input, SimpleChanges, ChangeDetectorRef, ApplicationRef } from '@angular/core';
import { HttpClientModule, HttpClient, HttpHeaders }    from '@angular/common/http';
import { MatGridListModule } from '@angular/material/grid-list';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, LOCALE_ID } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatetimepickerModule, MatNativeDatetimeModule } from "@mat-datetimepicker/core";
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Chart } from 'chart.js';
import * as ChartDatasourcePrometheusPlugin from 'chartjs-plugin-datasource-prometheus';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit {

  @Input() information: Array<string>;

  // Request : /prometheus/api/v1/query_range?query=up&start=1604584181.313&end=1604670581.313&step=9250
  endpoint : string = 'http://10.0.0.68:12333/prometheus/';
  query_list : any = [];
  chart_list : Array<any> = [];
  up_start_time : number = -1 * 60 * 60 * 1000; //1 hours from now
  end_time : number = 0; //now
  start_date : Date;
  form: FormGroup;

  _value: number = 1;
  _step: number = 1;
  _min: number = 0;
  _max: number = Infinity;
  _wrap: boolean = false;
  color: string = 'primary';

  unit: string = 'hour';
  unit_select = new FormControl(false);

  constructor(private appRef: ChangeDetectorRef,  private _formBuilder: FormBuilder) {
    this.form = this._formBuilder.group({
      startDate: [{ value: '', disabled: true }, Validators.required]
    });
    //this.unit_select.setValue('hour');
  }
  
  ngOnInit(): void {
    console.log('init');
    this.form.get('startDate').setValue(new Date()),
    this.form.get('startDate').enable();
    console.log (this.information);
    this.query_list = this.information;
  }

  ngAfterViewInit(){
    this.generate_all_graph();
  }

  ngOnChanges(changes: any){
    if (!changes['information'].isFirstChange()){
      console.log('changes catch: ' + this.information);
      this.query_list = this.information;
      this.appRef.detectChanges();
      this.regenerate_all_graph();
    } 
  }

  // Find a chart using the metric name
  find_chart(id:string){
    var chart;
    this.query_list.forEach(query => {
      var regex = new RegExp("^("+ query +".*)$");
      if ((regex.exec(id)) !== null ){
        console.log('found : ' + query);
        chart = query;
      }
    });
    return chart;
  }

  // Generate all graph
  generate_all_graph(){
    this.chart_list=[];
    this.query_list.forEach(query => this.chart_list.push([query,this.chart_builder(query)]));
  }

  // Destroy all graph
  destroy_all(){
    this.chart_list.forEach(chart=>{
      console.log ('destroying ' + chart[0] + ' chart');
      chart[1].destroy();
    })
  }

  // Regenerate all graph
  regenerate_all_graph(){
    this.destroy_all();
    this.generate_all_graph();
  }

  // Re-generate all graph
  regenerate(id:string){
    console.log('regenerating ' + id + ' chart');
    var chart = this.find_chart(id);
    console.log ('destroying ' + id + ' chart');
    chart.destroy();
    console.log ('re-building ' + id + ' chart');
    this.chart_list.push([id,this.chart_builder(id)]);
  }
  
  // Build chart
  chart_builder(id:string){
    console.log('building : ' + id + ' chart');
    var ctx = document.getElementById(id);
    if (ctx === null){
      throw new Error("An error as occured. An get id of : " + id);
    }
    console.log(ctx);
    let query = id;
    var chart = new Chart(ctx, {
      type: 'line',
      plugins: [ChartDatasourcePrometheusPlugin],
      options: {
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
            },
            query: query,
            stepped:true,
            timeRange: {
              type: 'relative',
              // from 12 hours ago to now
              start: this.up_start_time,
              end: this.end_time,
              step:10,
              // refresh every 10s
              msUpdateInterval: 10 * 1000,
            },
          },
        },
      },
    });
    return chart;
  }

  select(id:any) {
    console.log(id);  
  }

  incrementValue(step: number = 1): void {
    let inputValue = this._value + step;
    if (this._wrap) {
      inputValue = this.wrappedValue(inputValue);
    }
    this._value = inputValue;
  }

  setColor(color: string): void {
    this.color = color;
  }

  private wrappedValue(inputValue): number {
    if (inputValue > this._max) {
      return this._min + inputValue - this._max;
    }

    if (inputValue < this._min) {
      if (this._max === Infinity) {
        return 0;
      }
      return this._max + inputValue;
    }
    return inputValue;
  }

  shouldDisableDecrement(inputValue: number): boolean {
    return !this._wrap && inputValue <= this._min;
  }

  shouldDisableIncrement(inputValue: number): boolean {
    return !this._wrap && inputValue >= this._max;
  }

}
