import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { HttpClientModule, HttpClient, HttpHeaders }    from '@angular/common/http';
import { Chart } from 'chart.js';
import * as ChartDatasourcePrometheusPlugin from 'chartjs-plugin-datasource-prometheus';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit {

  @Input() job: string;

  endpoint : string = 'http://192.168.1.141:12333/prometheus/';
  query_list : any = [
    {query:'up'},
    {query:'Devices_on_lan_gauge'},
    {query:'cpustats_cpu_usage_percent'},
    {query:'memstats_memory_usage_percent'},
    {query:'memstats_total_memory_bytes'},
    {query:'memstats_used_memory_bytes'},
  ];

  chart_list : Array<any> = [];
  up_start_time : number = -24 * 60 * 60 * 1000; //12 hours from now
  end_time : number = 0; //now
  start_date : Date;

  constructor() { 
  }
  
  ngOnInit(): void {
    //console.log('first : ' + this.query_list[0].query);
    console.log('init');
    console.log('changes : ' + this.job);

  }

  ngAfterViewInit(){
    this.generate_all(); //{job=\'CityBox\'}
    //this.chart_builder(this.query_list[0].query, ''); //{job=\'CityBox\'}
  }
  ngOnChanges(changes: any){
    console.log('changes : ' + this.job);
  }

  find_chart(id:string){
    var chart;
    this.chart_list.forEach(array => {
      if (array[0] === id){
        console.log('found : ' + array[0]);
        chart = array[1];
      }
    });
    return chart;
  }

  // Generate all graph
  generate_all(){
    this.chart_list=[];
    this.query_list.forEach(query => this.chart_list.push([query.query,this.chart_builder(query.query)]));
    console.log(this.query_list);
    console.log(this.chart_list);
  }

  // Destroy all graph
  destroy_all(){
    this.chart_list.forEach(chart=>{
      console.log ('destroying ' + chart[0] + ' chart');
      chart[1].destroy();
    })
  }

  // Regenerate all graph
  regenerate_all(){
    this.destroy_all();
    this.generate_all();
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
  
  chart_builder(id:string){
    //console.log(this.up_start_time/60/60/1000);
    console.log('building ' + id + ' chart');
    var ctx = document.getElementById(id);
    //console.log(ctx);
    let query = id;// + job;
    //console.log(query);
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
              baseURL: '/api/v1',   // default value
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
    //console.log(this.chart_list);
    return chart;
  }
}
