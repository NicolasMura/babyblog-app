import 'rxjs/add/operator/switchMap';
import { Component, ViewChild, ElementRef, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NavController, AlertController, Loading, LoadingController, ModalController, NavParams, Platform, ViewController, PopoverController, MenuController } from 'ionic-angular';
import { InAppBrowser } from 'ionic-native';

import { Post } from '../../models/post';
import { User } from '../../models/user';
import { ModalCommentsPage } from '../../pages/modal-comments/modal-comments';
import { LoginPage } from '../../pages/login/login';
import { NewPostPage } from '../../pages/new-post/new-post';
import { ProfilePage } from '../../pages/profile/profile';
import { AuthService } from '../../providers/auth-service';
import { PostsService } from '../../providers/posts-service';
import { UsersService } from '../../providers/users-service';
import { MiscService } from '../../providers/misc-service';

@Pipe({ name: 'safe' })
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  // directives: [ImageViewerDirective]
})
export class HomePage {
  @ViewChild('popoverTest', { read: ElementRef }) test: ElementRef;

  loading: Loading;
  posts: Post[] = [];
  users: User[];
  loggedUser: User;
  // For pluralize purpose
  postMessageMapping:
    {[k: string]: string} = {'=0': 'commentaire', '=1': 'commentaire', 'other': 'commentaires'};

  constructor(
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    public navCtrl: NavController,
    private authService: AuthService,
    private postsService: PostsService,
    private usersService: UsersService,
    private miscService: MiscService,
    public modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private menuCtrl: MenuController,
    public platform: Platform,
    private sanitizer: DomSanitizer
  ) {
    // Enable menu (used if no login step)
    this.menuCtrl.enable(true);

    // Check token validity, refresh if needed
    var check = this.authService.checkTokenValidity('HomePage');
    console.log('CHECK :');
    console.log(check);
    if(!check) {
      this.authService.getNewToken(this.authService.refreshToken)
        .then(success => {
          if(success) {
            console.log('getNewToken Success !');
          } else {
            console.log('getNewToken Failed !');
            // Workaround - TO BE TESTED
            let prompt = this.alertCtrl.create({
              title: 'Comme c\'est dommage !',
              message: 'Votre session a expiré, vous devez vous reconnecter.',
              buttons: [
                {
                  text: 'OK',
                  handler: () => {
                    console.log('Redirection to login page');
                    this.authService.logout();
                    this.navCtrl.setRoot(LoginPage, {}, {animate: true, direction: 'forward'});
                  }
                }
              ]
            });
            prompt.present();
          }
        });
    }

    // Get users & posts
    var refresher = false;
    this.getUsers();
    this.getPosts(refresher);
  }

  ionViewDidLoad() {
    console.log('Hello Home Page !');
  }

  ionViewWillEnter() {

  }

  getUsers() {
    this.users = [];

    // Retrieve all users
    this.usersService.getAllUsers().subscribe(
      retrievedUsers => {
        retrievedUsers.forEach((user, key) => {
          this.users.push(user);
          // Replace date_joined by humanized date
          this.users[key].date_joined = this.miscService.getHumanDate(this.users[key].date_joined);
        });

        console.log('Users :');
        console.log(this.users);

        // Retrieve loggedUser
        var username = this.authService.loggedUserUsername;
        this.usersService.users = this.users // Update users array
        this.loggedUser = this.usersService.getLoggedUser(username);
        // Replace date_joined by humanized date
        this.loggedUser.date_joined = this.miscService.getHumanDate(this.loggedUser.date_joined);
      });
  }

  getPosts(refresher) {
    this.posts = [];

    // If refresher call
    if(refresher) {
      console.log('Do refresh !');
      console.log('Begin async operation', refresher);
    }

    // Show loader
    this.defineLoading('Work in progress...');
    this.loading.present()
      .then(() => {
        // Get all posts
        // Version with Observable
        this.postsService.getAllPosts().subscribe(
          retrievedPosts => {
            // For each post, sanitize video URLs (if any) + get human dates and times
            retrievedPosts.forEach((post, key) => {
              // Sanitize post video URL (if any)
              if(post.videoUrl !== '') {
                console.log('POST ' + post.id + ' a une URL vidéo :');
                console.log(post.videoUrl);
                post.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(post.videoUrl);
                console.log('SANITIZED URL :');
                console.log(post.safeVideoUrl);
              }

              // Replace post date by humanized date and time
              post.date = 'le ' + this.miscService.getHumanDate(post.date) + ', à ' + this.miscService.getHumanTime(post.date);
              // post['humanTime'] = this.miscService.getHumanTime(post.date);

              // Replace post's comments dates by humanized dates and times
              post.reply_set.forEach((comment, key) => {
                post.reply_set[key].date = 'le ' + this.miscService.getHumanDate(post.reply_set[key].date) + ', à ' + this.miscService.getHumanTime(post.reply_set[key].date);
              });

              // Add post to posts list
              this.posts.push(post);
            });

            console.log('Posts :');
            console.log(this.posts);

            if(refresher) {
              console.log('End refresh !');
              refresher.complete();
            }

            // Hide loader
            this.loading.dismiss();
          },
          error => {
            console.log('Erreur :');
            console.log(error);
            this.loading.dismiss();
          }
        );
      });
  }

  private defineLoading(content) {
    this.loading = this.loadingCtrl.create({
      content: content
    });
  }

  goToNewPost() {
    this.navCtrl.push(NewPostPage);
  }

  openCommentsModal(postId) {
    // Find post key in posts array
    let postKey = this.miscService.findObjectKey(postId, this.posts);

    // Get post
    var post = this.posts[postKey];

    // let modal = this.modalCtrl.create(ModalContentPage, characterNum);
    let modal = this.modalCtrl.create(ModalCommentsPage, {post: post, users: this.users});
    modal.present();

    // On modal dismiss, get updated post
    modal.onDidDismiss(updatedPost => {
      console.log('Fermeture modal comments, get updated post :');
      console.log(updatedPost);

      // Update posts list
      this.posts.splice(postKey, 1, updatedPost);
    })
  }

  // To be finished --> actuellement seule la première popover est sélectionnée !
  presentPopover(ev, postId) {
    let popover = this.popoverCtrl.create(
      HomePagePopover,
      {
        testEle: this.test.nativeElement
      },
      {
        cssClass: 'comment-popover'
      }
    );

    popover.present({
      ev: ev
    });
    popover.onDidDismiss(data => {
      console.log('Event : fermeture popover !');
      if(data != null) {
        var confirm = this.presentAlert("Olà !", "Vous êtes sur le point d'envoyer définitivement ce message aux oubliettes.", postId);
      }
    })
  }

  presentAlert(title: string, text: string, postId: number) {
    let prompt = this.alertCtrl.create({
      title: title,
      message: text,
      buttons: [
        {
          text: 'J\'assume',
          handler: () => {
            console.log('on supprime le post id ' + postId);
            this.defineLoading('Work in progress...');
            // Show loader
            this.loading.present()
              // Delete post
              .then(() => {
                this.postsService
                .deletePost(postId)
                .subscribe(response => {
                  console.log(response);
                  this.posts.forEach((post, key) => {
                    if (post.id === postId) { this.posts.splice(key, 1); }
                  });
                  // Hide loader
                  this.loading.dismiss();
                });;
              });
          }
        },
        {
          text: 'Nooooon !',
          handler: () => {
            console.log('Suppression annulée');
          }
        }
      ]
    });
    prompt.present();
  }

  goToProfile(userId) {
    console.log('Go to user id = ' + userId + ' !');
    // Find user key in users array
    let userKey = this.miscService.findObjectKey(userId, this.users);
    console.log(userKey);
    // Get user
    let user = this.users[userKey];
    console.log(user);

    this.navCtrl.push(ProfilePage, {user: user})
  }

  // Open an URL via InAppBrowser
  openUrl(url) {
    this.platform.ready().then(() => {
      let browser = new InAppBrowser(url, '_system');
    });
  }

}

/* ************
 Test popover
 ************ */
@Component({
  template: `
    <ion-list radio-group class="popover-page">
      <ion-row>
        <ion-col>
          <button (click)="delPost()" ion-item detail-none class="text-button text-smaller">Supprimer</button>
        </ion-col>
      </ion-row>
    </ion-list>
  `
})
export class HomePagePopover {
  testEle: any;

  constructor(
    private navParams: NavParams,
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    private postsService: PostsService
  ) {}

  ngOnInit() {
    if (this.navParams.data) {
      this.testEle = this.navParams.data.testEle;
    }
  }

  delPost() {
    this.viewCtrl.dismiss({ data: 'delete'});
  }
}
