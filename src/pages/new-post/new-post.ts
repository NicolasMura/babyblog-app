import { Component } from '@angular/core';
import { ActionSheetController, AlertController, ToastController, LoadingController, NavController, Platform, Loading } from 'ionic-angular';
import { Camera, File, Transfer, FilePath, BackgroundMode, YoutubeVideoPlayer } from 'ionic-native';
import { DomSanitizer } from '@angular/platform-browser';

import { User } from '../../models/user';
import { Post } from '../../models/post';
import { HomePage } from '../../pages/home/home';
import { AuthService } from '../../providers/auth-service';
import { UsersService } from '../../providers/users-service';
import { PostsService } from '../../providers/posts-service';

declare var cordova: any;

@Component({
  selector: 'page-new-post',
  templateUrl: 'new-post.html'
})
export class NewPostPage {
  loading: Loading;

  posts;
  loggedUser: User;

  // Test
  public base64Image: string = null;
  public videoUrl: string = null;
  public videoIframe = null;

  constructor(
    public actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public navCtrl: NavController,
    public platform: Platform,
    public loadingCtrl: LoadingController,
    private authService: AuthService,
    private usersService: UsersService,
    private postsService: PostsService,
    private sanitizer: DomSanitizer
  ) {
    // Check token validity, refresh if needed
    this.authService.checkTokenValidity('NewPostPage');

    // Retrieve current profile
    var username = this.authService.loggedUserUsername;
    this.loggedUser = this.usersService.getLoggedUser(username);
  }

  ionViewDidLoad() {
    console.log('Hello New Post Page !');
  }

  public presentActionSheet() {
    let actionSheet;
    if(this.loggedUser.is_superuser) {
      actionSheet = this.actionSheetCtrl.create({
        title: 'Ajouter un média',
        buttons: [
          {
            text: 'Farfouiller dans ma bibliothèque',
            handler: () => {
              // Activate background mode (workaround for app crash)
              BackgroundMode.enable();
              this.takePicture(Camera.PictureSourceType.PHOTOLIBRARY);
            }
          },
          {
            text: 'Prendre une photo inoubliable',
            handler: () => {
              // Activate background mode (workaround for app crash)
              BackgroundMode.enable();
              this.takePicture(Camera.PictureSourceType.CAMERA);
            }
          },
          {
            text: 'Récupérer une vidéo Youtube',
            handler: () => {
              // Activate background mode (workaround for app crash)
              BackgroundMode.enable();
              this.presentVideoPromptAlert();
            }
          },
          {
            text: 'Annuler',
            role: 'cancel'
          }
        ]
      });
    } else {
      actionSheet = this.actionSheetCtrl.create({
        title: 'Ajouter un média',
        buttons: [
          {
            text: 'Farfouiller dans ma bibliothèque',
            handler: () => {
              // Activate background mode (workaround for app crash)
              BackgroundMode.enable();
              this.takePicture(Camera.PictureSourceType.PHOTOLIBRARY);
            }
          },
          {
            text: 'Prendre une photo inoubliable',
            handler: () => {
              // Activate background mode (workaround for app crash)
              BackgroundMode.enable();
              this.takePicture(Camera.PictureSourceType.CAMERA);
            }
          }
        ]
      });
    }
    actionSheet.present();
  }

  public takePicture(sourceType) {
    // Save picture only if taken with camera
    var saveToPhotoAlbum = (sourceType === 1) ? true : false;

    // Create options for the Camera Dialog
    var options = {
      quality: 80,
      sourceType: sourceType,
      saveToPhotoAlbum: saveToPhotoAlbum,
      correctOrientation: true,
      destinationType: Camera.DestinationType.DATA_URL,
      targetWidth: 1000,
      targetHeight: 1000
    };

    // Get the data of an image
    Camera.getPicture(options).then((imageData) => {
      // imageData is a base64 encoded string
      this.base64Image = "data:image/jpeg;base64," + imageData;
      // Disable background mode in case of success by camera plugin
      BackgroundMode.disable();
    }, (err) => {
      this.presentToast('Oups... petite erreur lors de la récupération de l\'image. Retentez votre chance.');
    });
  }

  public presentVideoPromptAlert() {
    let prompt = this.alertCtrl.create({
      title: 'A vous de jouer !',
      message: "Saisissez l'ID de votre vidéo Youtube",
      inputs: [
        {
          name: 'text',
          placeholder: 'Ex. : https://youtu.be/roD96FsYUAA'
        },
      ],
      buttons: [
        {
          text: 'Annuler'
        },
        {
          text: 'Valider',
          handler: data => {
            // Get video id
            var videoId = data.text.replace('https://youtu.be/', '');

            // Construct video url + iframe
            this.videoUrl = 'https://www.youtube.com/embed/' + videoId + '?wmode=opaque&amp;rel=0&amp;autohide=1&amp;showinfo=0&amp;wmode=transparent&amp;modestbranding=1';
            this.videoIframe = this.sanitizer.bypassSecurityTrustHtml(
              '<ion-item>' +
                '<div class="video-container">' +
                  '<iframe width="560" height="315" src="' + this.videoUrl + '" frameborder="0" allowfullscreen>' +
                  '</iframe>' +
                '</div>' +
              '</ion-item>'
            );
            // Disable background mode
            BackgroundMode.disable();
          }
        }
      ]
    });
    prompt.present();
    prompt.onDidDismiss(data => {
      return data.text;
    })
  }

  private presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 5000,
      position: 'top'
    });
    toast.present();
  }

  addHttpToUrl(url) {
    var link = url;
    var regexUrlHttp = /^(http|https):\/\/./;
    if(url !== '') {
      if(!regexUrlHttp.test(link)) {
        link = "http://" + link;
      }
    }
    return link;
  }

  // Method that checks HTTP status of an URL
  checkUrl(url) {
    // TODO...
  }

  // Send data to server
  publishPost(content: string, link: string, image: string) {
    content = content.trim();
    link = link.trim();

    if(content === '') {
      console.log('Erreur : il faut au moins du texte...');
      if(image != null) {
        this.presentAlert("Hum !", "Merci d'accompagner votre photo d'un petit message :)");
      }
      else {
        this.presentAlert("Hum !", "Il semblerait que votre message soit un peu vide :)");
      }
      return;
    }

    // Add prefix http:// to link if http:// (or https://) not present
    link = this.addHttpToUrl(link);

    // Send data
    console.log('Sending post to server');
    // Show loader
    this.defineLoading('Work in progress...');
    this.loading.present()
    .then(() => {
      console.log("C'est parti !");
      // Get current username
      var username = this.authService.loggedUserUsername;

      // If no image
      if(image == null) {
        image = "";
      }

      // If no video
      if(this.videoUrl == null) {
        this.videoUrl = "";
      }

      this.postsService.createPost(username, content, link, image, this.videoUrl)
        .then(() => {
          this.goToHome();
        }, error => {
          console.log(error);
          this.loading.dismiss();
          this.presentToast('Sorry... petite erreur lors de l\'envoi du message. Vérifiez vos données (notamment le lien) et retentez votre chance.');
        });
    });
  }

  removeMedia() {
    this.base64Image = null;
    this.videoIframe = null;
  }

  private defineLoading(text) {
    this.loading = this.loadingCtrl.create({
      content: text
    });
  }

  presentAlert(title: string, text: string) {
    let prompt = this.alertCtrl.create({
      title: title,
      message: text,
      buttons: [
        {
          text: 'OK'
        }
      ]
    });
    prompt.present();
  }

  goToHome() {
    this.loading.dismiss();
    this.navCtrl.setRoot(HomePage, {}, {animate: true, direction: 'forward'});
  }
}
