import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
})
export class MapaPage implements OnInit {
  map: L.Map;

  locationMarker: any;
  travelMarkersGroup: any;
  travelList: any;
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
  }

  clearMap(){
    this.map.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) {
          this.map.removeLayer(layer);
      }
    });

    this.map.locate({ setView: true }).on("locationfound", (event: any) => {
      this.clearMap();
      
      this.locationMarker = L.marker([event.latitude, event.longitude], {
          draggable: true
      }).addTo(this.map);
  
      this.locationMarker.bindPopup("Estas aquí!").openPopup();
    });
  }

  bandera(){
    this.clearMap();
    this.travelMarkersGroup = L.featureGroup();

    this.travelList.forEach(item => {
        const newMarker = L.marker([item.lat, item.lng]);
        newMarker.bindPopup(item.title);
        
        this.travelMarkersGroup.addLayer(newMarker);
        this.map.addLayer(this.travelMarkersGroup);
    });

    this.map.fitBounds(this.travelMarkersGroup.getBounds());
  }

}
