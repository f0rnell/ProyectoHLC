import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
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
  
  constructor(private geolocation: Geolocation) { }

  ngOnInit() {
  }

  ionViewDidEnter(){
    this.loadMap();
  }

  loadMap() {
    
        this.map = L.map("mapId");
        this.geolocation.getCurrentPosition().then((resp) => {
          this.latitudActual = resp.coords.latitude;
          this.longitudActual = resp.coords.longitude;
          //this.map.locate({ setView: true, maxZoom: 16}).on("locationfound", (event: any) => {

            //this.latitudActual = event.latitude;
            //this.longitudActual = event.longitude;
  
            L.tileLayer('https://a.tile.openstreetmap.de/{z}/{x}/{y}.png')
                .addTo(this.map);
            
            L.Routing.control({
              waypoints: [
                  L.latLng(36.84022819646473, -5.391387011548766),
                  L.latLng(this.latitudActual, this.longitudActual)
              ],
              lineOptions: {
                styles: [{color: 'green', opacity: 1, weight: 5}]
              },
              summaryTemplate: '<p>{name}</p><p style="text-align:right;">{distance}, {time}</p><style> .leaflet-right .leaflet-routing-container { padding: 5px; background-color: #383839; }.leaflet-routing-alt table {display:none!important;} </style>',
              
            }).addTo(this.map);
  
  
            L.marker([this.latitudActual, this.longitudActual],{title: 'Usted', draggable: false})
            .addTo(this.map).bindPopup('<b>Usted</b><br>Se encuentra aqui').openPopup();
  
            L.marker([36.84022819646473, -5.391387011548766],{title: 'Empresa', draggable: false})
            .addTo(this.map).bindPopup('<b>Empresa</b><br>Calle de la empresa').openPopup();
  
         //});      
         }).catch((error) => {
           console.log('Error getting location', error);
         });
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
