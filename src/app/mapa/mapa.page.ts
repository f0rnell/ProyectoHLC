import { Component, OnInit } from '@angular/core';
//import * as L from 'leaflet';
const L = require('leaflet');
const Routing = require('leaflet-routing-machine');

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
})
export class MapaPage implements OnInit {
  map: any;

  locationMarker: any;
  travelMarkersGroup: any;
  travelList: any;
  latitudActual: any;
  longitudActual: any;
  constructor() { }

  ngOnInit() {
  }

  ionViewDidEnter(){
    this.loadMap();
  }

  loadMap() {
    let latitud = 36.84022819646473;
    let longitud = -5.391387011548766;
    let zoom = 17;
    this.map = L.map("mapId").setView([latitud, longitud], zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
        .addTo(this.map);
    
        // this.map.eachLayer((layer) => {
        //   if (!(layer instanceof L.TileLayer)) {
        //       this.map.removeLayer(layer);
        //   }
        // });
    
        this.map.locate({ setView: true }).on("locationfound", (event: any) => {
          this.latitudActual = event.latitude;
          this.longitudActual = event.longitude;
          this.locationMarker = L.marker([event.latitude, event.longitude], {
              draggable: true
          }).addTo(this.map);
    
      
          this.locationMarker.bindPopup("Estas aquí!").openPopup();
        });    
    
    L.Routing.control({
        waypoints: [
            L.latLng(36.84022819646473, -5.391387011548766),
            L.latLng(this.latitudActual, this.longitudActual)
        ]
    }).addTo(this.map);
      
  }

  // clearMap(){
  //   this.map.eachLayer((layer) => {
  //     if (!(layer instanceof L.TileLayer)) {
  //         this.map.removeLayer(layer);
  //     }
  //   });

  //   this.map.locate({ setView: true }).on("locationfound", (event: any) => {
  //     this.clearMap();
  //     this.latitudActual = event.latitude;
  //     this.longitudActual = event.longitude;
  //     this.locationMarker = L.marker([event.latitude, event.longitude], {
  //         draggable: true
  //     }).addTo(this.map);

  
  //     this.locationMarker.bindPopup("Estas aquí!").openPopup();
  //   });
  // }


}
