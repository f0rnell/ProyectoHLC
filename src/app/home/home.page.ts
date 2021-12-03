import { Component } from '@angular/core';
import { FirestoreService } from '../firestore.service';
import { Jugador } from '../jugador';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  estadistica: Jugador;

  arrayColeccionJugadores: any = [{
    id: "",
    data: {} as Jugador
   }];

   
  idJugadorSelec: string;

  constructor(private firestoreService: FirestoreService) {

    //Crear una tarea vacía al empezar
    this.estadistica = {} as Jugador;
    this.obtenerListaJugadores();


  }

  clicBotonInsertar(){
    this.firestoreService.insertar("jugador", this.estadistica)
    .then(() => {
        console.log("Jugador creado correctamente");
        //Limpia el contenido del jugador que se estaba editando
        this.estadistica = {} as Jugador;
    }, (error) => {

    });

  }

  obtenerListaJugadores(){
    console.log("Obteniendo jugadores");
    this.firestoreService.consultar("jugador").subscribe((resultadoConsultaJugadores) => {
      this.arrayColeccionJugadores = [];
      resultadoConsultaJugadores.forEach((datosJugador: any) => {
        console.log(datosJugador);
        this.arrayColeccionJugadores.push({
          id: datosJugador.payload.doc.id,
          data: datosJugador.payload.doc.data()
        });
      })
    });
  }


  selecJugador(jugadorSelec) {
    console.log("Jugador seleccionado: ");
    console.log(jugadorSelec);
    this.idJugadorSelec = jugadorSelec.id;
    this.estadistica.nombre = jugadorSelec.data.nombre;
    this.estadistica.apellidos = jugadorSelec.data.apellidos;
    this.estadistica.posicion = jugadorSelec.data.posicion;
    this.estadistica.dorsal = jugadorSelec.data.dorsal;
  }

  clicBotonBorrar() {
    this.firestoreService.borrar("jugador", this.idJugadorSelec).then(() => {
      // Actualizar la lista completa
      this.obtenerListaJugadores();
      // Limpiar datos de pantalla
      this.estadistica = {} as Jugador;
    })
  }

  clicBotonModificar() {
    this.firestoreService.actualizar("jugador", this.idJugadorSelec, this.estadistica).then(() => {
      // Actualizar la lista completa
      this.obtenerListaJugadores();
      // Limpiar datos de pantalla
      this.estadistica = {} as Jugador;
    })
  }

}
