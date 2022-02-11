import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Jugador } from '../jugador';
import { FirestoreService } from '../firestore.service';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { ImagePicker} from '@awesome-cordova-plugins/image-picker/ngx';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.page.html',
  styleUrls: ['./detalle.page.scss'],
})
export class DetallePage implements OnInit {

  id: string = "";
  nuevo: boolean = false;
  imagenActual: string = "";
  subirArchivoImagen: boolean = false;
  borrarArchivoImagen: boolean = false;
  // Nombre de la colección en Firestore Database
  coleccion: String = "EjemploImagenes";
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
    private imagePicker: ImagePicker,
    private socialSharing: SocialSharing,
    
    ) {}

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
      //Mostrar foto de la base de datos
      this.imagenActual = this.documentJugador.data.foto;
      
    }
  }

  clicBotonCompartir(){
    // Check if sharing via email is supported
    this.socialSharing.share(this.documentJugador.data.nombre,'adios').then(() => {
      // Sharing via email is possible
    }).catch(() => {
      // Sharing via email is not possible
    });
  }
  clicBotonInsertar(){
    this.uploadImagen();
    this.router.navigate(['/home']);

  }

  clicBotonBorrar() {
    console.log(this.documentJugador.data.foto);
    this.deleteFile();
    this.firestoreService.borrar("jugador", this.id).then(() => {
      // Limpiar datos de pantalla
      console.log(this.documentJugador.data.foto);
      //Tengo que sacar de aqui el delete por que elimina la foto despues del jugador entonces se 
      //queda siempre en la bd por que no sabe que url tiene que borrar, tengo que sacarlo antes del 
      // --- > this.firestoreService.borrar
      this.documentJugador.data = {} as Jugador;
      this.router.navigate(['/home']);
      
    })
  }

  clicBotonModificar() {
    
    //this.router.navigate(['/home']);
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
  
  async selecImage(){
    //Comprobar si la aplicacón tiene permisos de lectura
    this.imagePicker.hasReadPermission().then(
      (result) => {
        // Si no tiene permiso de lectura se solicita al usuario
        if(result == false){
          this.imagePicker.requestReadPermission();
        }else{
          //Abrir selecto de imágenes (ImagePicker)
          console.log("imagenes selecionadas");
          this.imagePicker.getPictures({
            maximumImagesCount: 1, //Permitir solo 1 imagen
            outputType: 1
          }).then(
            (results) => {//En la variable results se tiene las imágenes seleccionadas
                          this.imagenActual = "data:image/jpeg;base64," + results[0];
                          // Se informa que se ha cambiado para que se suba la imagen cuando se actualice la BD
                          this.subirArchivoImagen = true;
                          this.borrarArchivoImagen = false;
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
  public guardarDatos() {
    if(this.subirArchivoImagen) {
      console.log("subir archivo");
      // Borrar el archivo de la imagen antigua si la hubiera
      if(this.documentJugador.data.foto != null) {
        console.log("eliminar imagen antigua");
        this.deleteFile();        
      }
      // Si la imagen es nueva se sube como archivo y se actualiza la BD
      this.uploadImagen();
    } else {
      if(this.borrarArchivoImagen) {
        console.log("eliminar imagen y limpiar variable");
        this.deleteFile();      
        this.documentJugador.data.foto = null;
      }
      // Si no ha cambiado la imagen no se sube como archivo, sólo se actualiza la BD
      console.log("actualizar base de datos");
      this.actualizarBaseDatos();
      
    }
    console.log("redirige a home")
    this.router.navigate(['/home']);
  }

  async uploadImagen(){

    //Mensaje de espera mientras se sube la imagen
    const loading = await this.loadingController.create({
      message: 'Por favor espere...'
    });

    //Mensaje de finalización de subida de la imagen
    const toast = await this.toastController.create({
      message: 'La imagen se subio correctamente',
      duration: 3000
    });

    //Carpeta del Storage donde se alamacenará la imagen
    let nombreCarpeta = "imagenes";
    //Recorrer todas las imágenes que haya seleccionado el usuario
    //aunque realmente sólo será 1 como se ha indicado en las opciones 
    
    //Mostar el mensaje de espera
    loading.present();
    //Asignar el nombre de la imagen en función de la hora actuala para
    //evitar duplicidades de nombres
    let nombreImagen = `${new Date().getTime()}`;
    //Llamar al método que sube la imagen al Storage
    console.log("Va a subir la imagen");
    this.firestoreService.uploadImage(nombreCarpeta,nombreImagen,this.imagenActual)
      .then(snapshot => {
        snapshot.ref.getDownloadURL()
          .then(downloadURL => {
            //En la varaible downloadURl se tiene la dirección de
            // descarga de la imagen
            console.log("downloadURL:" + downloadURL);
            //this.deleteFile();
            this.documentJugador.data.foto = downloadURL;
            console.log(this.id);
            if(!this.nuevo){
              console.log("entra cuando no es nuevo");
              this.actualizarBaseDatos();
            }else{
              this.firestoreService.insertar("jugador", this.documentJugador.data)
              .then(() => {
                  console.log("Jugador creado correctamente");
                  //Limpia el contenido del jugador que se estaba editando
                  this.documentJugador.data = {} as Jugador;
              }, (error) => {});
            }
            //Mostar el mensaje de finalización de la subida
            toast.present();
            //Ocultar mensaje de espera
            loading.dismiss();
          })
      });
  }
  private actualizarBaseDatos() {    
    this.firestoreService.actualizar("jugador", this.id, this.documentJugador.data).then(() => {
      // Limpiar datos de pantalla
      this.documentJugador.data = {} as Jugador;
    })
  }

  public borrarImagen() {
    console.log("inicio borrar imagen");
    // No mostrar ninguna imagen en la página
    this.imagenActual = null;
    // Se informa que no se debe subir ninguna imagen cuando se actualice la BD
    this.subirArchivoImagen = false;
    this.borrarArchivoImagen = true;
    console.log("final borrar imagen");
  }

  async deleteFile(){
    const toast = await this.toastController.create({
      message: 'La imagen a sido eliminado correctamente',
      duration: 3000
    });
    console.log("deletefile"+this.documentJugador.data.foto);
    this.firestoreService.deleteFileFromURL(this.documentJugador.data.foto)
      .then(() =>{
        toast.present();
        this.documentJugador.data.foto = null;
      }, (err) => {
        console.log(err);
      });
  }

}

