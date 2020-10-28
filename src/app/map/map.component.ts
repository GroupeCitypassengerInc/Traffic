import { Component, OnInit } from '@angular/core';
import * as groups from './json/map_devices.json';

declare const L:any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})

export class MapComponent implements OnInit {
  
  title = 'Citymap';
  markers: marker[];
  
  constructor() {
  }

  ngOnInit(): void {
    let mymap = L.map('map').setView([45, -20], 2.5);
    
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=sk.eyJ1Ijoicm9kb2xwaGVnaGlvIiwiYSI6ImNrZ3IxeHZrMzA5dm8zMG83eWx3bm45cnMifQ.hANaQ5_PG5Y5AExWWIljfQ', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
    }).addTo(mymap);

    for (let group of groups.groups){
      for (let sites of group.sites){
        let lat = sites.datas.mapInfo.latitude;
        let long = sites.datas.mapInfo.longitude;
        let marker = L.marker([lat, long], {title:sites.siteName.toString()}).addTo(mymap);
        let pop_up_info ='Group: ' + group.displayName.toString() + '<br>'+'Name: ' + sites.siteName.toString() + '<br>' + 'Address: ' + sites.datas.address.toString();
        marker.bindPopup(pop_up_info);
        marker.on('click', onClick);

        let container = L.DomUtil.create ('div');
      }
    }

    function onClick(e) {
      var popup = e.target.getPopup();
      var content = popup.getContent();
      
      if (popup.isOpen()){
        //Si ouverture du popup
        console.log(content);
      }else{
        
      }

    }
  }

  initialize_map_markers(){
    console.log(groups.groups);
  }
}

interface marker {
	lat: number;
	lng: number;
	label?: string;
	draggable: boolean;
}
