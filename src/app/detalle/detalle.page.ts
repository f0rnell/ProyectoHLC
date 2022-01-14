import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Jugador } from '../jugador';
import { FirestoreService } from '../firestore.service';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { ImagePicker, OutputType } from '@awesome-cordova-plugins/image-picker/ngx';

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
    private router : Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private imagePicker: ImagePicker
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
  //Alerta que se muestra a la hora de eliminar uno de los jugadores.
  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Alerta',
      message: 'Vas a <strong>borrar</strong> un jugador.<br><br>¿Estas seguro?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Aceptar',
          handler: () => {
            console.log('Confirm Okay');
            this.clicBotonBorrar();
          }
        }
      ]
    });

    await alert.present();
  }
  
  async uploadImagePicker(){

    //Mensaje de espera mientras se sube la imagen
    const loading = await this.loadingController.create({
      message: 'Por favor espere...'
    });

    //Mensaje de finalización de subida de la imagen
    const toast = await this.toastController.create({
      message: 'La imagen se subio correctamente',
      duration: 3000
    });

    //Comprobar si la aplicacón tiene permisos de lectura
    this.imagePicker.hasReadPermission().then(
      (result) => {
        // Si no tiene permiso de lectura se solicita al usuario
        if(result == false){
          this.imagePicker.requestReadPermission();
        }else{
          //Abrir selecto de imágenes (ImagePicker)
          this.imagePicker.getPictures({
            maximumImagesCount:1, //Permitir solo 1 imagen
            outputType: 1
          }).then(
            (result) => {//En la variable results se tiene las imágenes seleccionadas
              
              //Carpeta del Storage donde se alamacenará la imagen
              let nombreCarpeta = "imagenes";
              //Recorrer todas las imágenes que haya seleccionado el usuario
              //aunque realmente sólo será 1 como se ha indicado en las opciones
              for (var i = 0; i < result.lenght; i++){
                //Mostar el mensaje de espera
                loading.present();
                //Asignar el nombre de la imagen en función de la hora actuala para
                //evitar duplicidades de nombres
                let nombreImagen = `${new Date().getTime()}`;
                //Llamar al método que sube la imagen al Storage
                this.firestoreService.uploadImage(nombreCarpeta,nombreImagen,result[i])
                  .then(snapshot => {
                    snapshot.ref.getDownloadURL()
                      .then(downloadURL => {
                        //En la varaible downloadURl se tiene la dirección de
                        // descarga de la imagen
                        console.log("downloadURL:" + downloadURL);
                        this.documentJugador.data.foto = downloadURL;
                        //Mostar el mensaje de finalización de la subida
                        toast.present();
                        //Ocultar mensaje de espera
                        loading.dismiss();
                      })
                  })

              }
            },
            (err) => {
              console.log(err)
            }
          );
        }
      }, (err) => {
        console.log(err);
      });
  }

  async deleteFile(fileURL){
    const toast = await this.toastController.create({
      message: 'La imagen a sido eliminado correctamente',
      duration: 3000
    });
    this.firestoreService.deleteFileFromURL(fileURL)
      .then(() =>{
        toast.present();
      }, (err) => {
        console.log(err);
      });
  }

}
