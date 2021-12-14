import { Component } from '@angular/core';
import { FirestoreService } from '../firestore.service';
import { Jugador } from '../jugador';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  estadistica: Jugador;

  constructor(private firestoreService: FirestoreService, private router : Router) {

    //Crear una jugador vacía al empezar
    this.estadistica = {} as Jugador;
    this.obtenerListaJugadores();


  }

  arrayColeccionJugadores: any = [{
    id: "",
    data: {} as Jugador
   }];

  obtenerListaJugadores(){
    this.firestoreService.consultar("jugador").subscribe((resultadoConsultaJugadores) => {
      this.arrayColeccionJugadores = [];
      resultadoConsultaJugadores.forEach((datosJugador: any) => {
        this.arrayColeccionJugadores.push({
          id: datosJugador.payload.doc.id,
          data: datosJugador.payload.doc.data()
        });
      })
    });
  }

  idJugadorSelec: string;

  selecJugador(jugadorSelec) {
    console.log("Jugador seleccionado: ");
    console.log(jugadorSelec);
    this.idJugadorSelec = jugadorSelec.id;
    this.router.navigate(['/detalle', this.idJugadorSelec]);
    this.estadistica.nombre = jugadorSelec.data.nombre;
    this.estadistica.apellidos = jugadorSelec.data.apellidos;
    this.estadistica.posicion = jugadorSelec.data.posicion;
    this.estadistica.equipo = jugadorSelec.data.equipo;
    this.estadistica.dorsal = jugadorSelec.data.dorsal;
    this.estadistica.golesTemporada = jugadorSelec.data.golesTemporada;
    this.estadistica.asistencias = jugadorSelec.data.asistencias;
    this.estadistica.partidosJugados = jugadorSelec.data.partidosJugados;
    this.estadistica.foto = jugadorSelec.data.foto;
  }
  
  nuevoJugador(){
    this.router.navigate(['/detalle', 'nuevo']);
  }

}
