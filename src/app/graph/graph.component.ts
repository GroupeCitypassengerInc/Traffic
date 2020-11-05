import { Component, OnInit } from '@angular/core';
import { HttpClientModule, HttpClient, HttpHeaders }    from '@angular/common/http';
import { Chart } from 'chart.js';
import * as ChartDatasourcePrometheusPlugin from "chartjs-plugin-datasource-prometheus";
import { ITS_JUST_ANGULAR } from '@angular/core/src/r3_symbols';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit {
  up_chart : Chart;
  up_start_time : number = -24 * 60 * 60 * 1000; //12 hours from now
  end_time : number = 0; //now
  start_date : Date;
  query_list : any = [
    {query:'up'},
    {query:'Devices_on_lan_gauge'},
    {query:'cpustats_cpu_usage_percent'},
    {query:'memstats_memory_usage_percent'},
    {query:'memstats_total_memory_bytes'},
    {query:'memstats_used_memory_bytes'},
  ];

  constructor() { 
  }
  
  ngOnInit(): void {
  }

  ngAfterViewInit(){
    this.query_list.forEach(query => this.chart_builder(query.query, "")); //{job=\"CityBox\"}
  }

  range_plus() {
    this.up_start_time = this.up_start_time -1 * 60 * 60 * 1000;
    
  }

  destroy(chart:Chart){
    chart.destroy();
  }

  chart_builder(id:string,job:string){
    console.log(this.up_start_time/60/60/1000);
    console.log(id);
    var ctx = document.getElementById(id);
    console.log(ctx);
    let query = id + job;
    console.log(query);
    this.up_chart = new Chart(ctx, {
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
              endpoint: "http://192.168.1.141:12333/prometheus/",
              baseURL: "/api/v1",   // default value
            },
            query: query,
            timeRange: {
              type: 'relative',

              // from 12 hours ago to now
              start: this.up_start_time,
              end: this.end_time,
          
              // refresh every 10s
              msUpdateInterval: 10 * 1000,
            },
          },
        },
      },
    });
  }
}
