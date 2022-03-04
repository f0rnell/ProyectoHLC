import { Component } from '@angular/core';
import { FirestoreService } from '../firestore.service';
import { Jugador } from '../jugador';
import { AuthService } from '../services/auth.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  estadistica: Jugador;
  userEmail: String = "";
  userUID: String = "";
  isLogged: boolean;

  constructor(
    private firestoreService: FirestoreService, 
    public loadingCtrl: LoadingController,
    private authService: AuthService,
    private router: Router,
    public afAuth: AngularFireAuth,
    private alertController: AlertController
    ) {
    
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

  async selecJugador(jugadorSelec) {
    if(this.isLogged){
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
    }else{
      
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: 'Alerta',
        subHeader: 'Logeo',
        message: 'Tiene que estar logeado para acceder',
        buttons: ['OK']
      });
    
      await alert.present();
    }
    
  }
  
  async nuevoJugador(){
    if(this.isLogged){
    this.router.navigate(['/detalle', 'nuevo']);
    }else{
      
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: 'Alerta',
        subHeader: 'Logeo',
        message: 'Tiene que estar logeado para acceder',
        buttons: ['OK']
      });
    
      await alert.present();
    }
  }

  ionViewDidEnter() {
    this.isLogged = false;
    this.afAuth.user.subscribe(user => {
      if(user){
        this.userEmail = user.email;
        this.userUID = user.uid;
        this.isLogged = true;
      }
    })
  }

  login() {
    this.router.navigate(["/login"]);
  }

  logout(){
    this.authService.doLogout()
    .then(res => {
      this.userEmail = "";
      this.userUID = "";
      this.isLogged = false;
      console.log(this.userEmail);
    }, err => console.log(err));
  }

}
