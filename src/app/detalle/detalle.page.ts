import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Jugador } from '../jugador';
import { FirestoreService } from '../firestore.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.page.html',
  styleUrls: ['./detalle.page.scss'],
})
export class DetallePage implements OnInit {

  id: string = "";
  nuevo: boolean = false;
  documentJugador: any = {
    id: "",
    data: {} as Jugador
  };
  constructor(
    private activatedRoute: ActivatedRoute, 
    private firestoreService: FirestoreService, 
    private router : Router
    ) { }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    if (this.id == 'nuevo'){
      this.nuevo = true;
    }else{
      this.firestoreService.consultarPorId("jugador", this.id).subscribe((resultado) => {
        // Preguntar si se hay encontrado un document con ese ID
        if(resultado.payload.data() != null) {
          this.documentJugador.id = resultado.payload.id
          this.documentJugador.data = resultado.payload.data();
          // Como ejemplo, mostrar el título de la tarea en consola
          console.log(this.documentJugador.data.nombre);
        } else {
          // No se ha encontrado un document con ese ID. Vaciar los datos que hubiera
          this.documentJugador.data = {} as Jugador;
        } 
      });
    }
  }
  clicBotonInsertar(){
    this.firestoreService.insertar("jugador", this.documentJugador.data)
    .then(() => {
        console.log("Jugador creado correctamente");
        //Limpia el contenido del jugador que se estaba editando
        this.documentJugador.data = {} as Jugador;
    }, (error) => {

    });
    this.router.navigate(['/home']);

  }

  clicBotonBorrar() {
    this.firestoreService.borrar("jugador", this.id).then(() => {
      // Limpiar datos de pantalla
      this.documentJugador.data = {} as Jugador;
      this.router.navigate(['/home']);
    })
  }

  clicBotonModificar() {
    this.firestoreService.actualizar("jugador", this.id, this.documentJugador.data).then(() => {
      // Limpiar datos de pantalla
      this.documentJugador.data = {} as Jugador;
    })
    this.router.navigate(['/home']);
  }
  

}
