import 'rxjs/add/operator/switchMap';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, Loading, LoadingController, NavParams, Platform, ViewController, PopoverController, AlertController } from 'ionic-angular';

import { User } from '../../models/user';
import { Post } from '../../models/post';
import { ProfilePage } from '../../pages/profile/profile';
import { AuthService } from '../../providers/auth-service';
import { PostsService } from '../../providers/posts-service';
import { UsersService } from '../../providers/users-service';
import { MiscService } from '../../providers/misc-service';

@Component({
  selector: 'page-modal-comments',
  templateUrl: 'modal-comments.html'
})
export class ModalCommentsPage {
  @ViewChild('popoverTest', { read: ElementRef }) test: ElementRef;

  loading: Loading;
  post: Post;
  users: User[];
  loggedUser: User;
  // For pluralize purpose
  commentMessageMapping:
    {[k: string]: string} = {'=0': 'commentaire', '=1': 'commentaire', 'other': 'commentaires'};

  constructor(
    public navCtrl: NavController,
    public platform: Platform,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public loadingCtrl: LoadingController,
    private authService: AuthService,
    private postsService: PostsService,
    private miscService: MiscService,
    private usersService: UsersService,
    private popoverCtrl: PopoverController,
    private alertCtrl: AlertController,
  ) {
    // Check token validity, refresh if needed
    this.authService.checkTokenValidity('ModalCommentsPage');

    // Get post
    this.post = this.navParams.get('post');

    // Get users
    this.users = this.navParams.get('users');

    // Retrieve current profile
    var username = this.authService.loggedUserUsername;
    this.loggedUser = this.usersService.getLoggedUser(username);
  }

  ionViewDidLoad() {
    console.log('Hello ModalCommentsPage !');
  }

  // Send data to server
  publishComment(content: string, relatedPostId: number) {
    content = content.trim();
    console.log('Sending comment to server');
    this.defineLoading('Work in progress...');
    // Show loader
    this.loading.present()
    .then(() => {
      this.postsService.createComment(this.loggedUser.username, content, relatedPostId)
        .subscribe(comment => {
          console.log('Nouveau commentaire :');
          console.log(comment);

          // Get humanized date and time for this comment
          comment.date = 'le ' + this.miscService.getHumanDate(comment.date) + ', à ' + this.miscService.getHumanTime(comment.date);
          // comment.date = this.miscService.getHumanTime(comment.date);

          // Update post's comments
          this.post.reply_set.push(comment);
        });

      // Hide loader
      this.loading.dismiss();
    });
  }

  private defineLoading(text) {
    this.loading = this.loadingCtrl.create({
      content: text
    });
  }

  dismiss() {
    // Send (possibly updated) post back to home page
    this.viewCtrl.dismiss(this.post);
  }

  // Potential bug --> currently only first popover is selected !
  presentPopover(ev, commentId) {
    let popover = this.popoverCtrl.create(CommentsPagePopover, {
      testEle: this.test.nativeElement
    });

    popover.present({
      ev: ev
    });
    popover.onDidDismiss(data => {
      console.log('Event : fermeture popover !');
      if(data != null) {
        this.presentAlert("Olà !", "Vous êtes sur le point d'envoyer définitivement ce commentaire aux oubliettes.", commentId);
      }
    })
  }

  presentAlert(title: string, text: string, commentId: number) {
    let prompt = this.alertCtrl.create({
      title: title,
      message: text,
      buttons: [
        {
          text: 'J\'assume',
          handler: () => {
            console.log('on supprime le post id ' + commentId);
            this.defineLoading('Work in progress...');
            // Show loader
            this.loading.present()
              // Delete comment
              .then(() => {
                this.postsService
                .deletePost(commentId)
                .subscribe(response => {
                  // Update comments list
                  console.log(response);

                  // Find comment key in post.reply_set array
                  let commentKey = this.miscService.findObjectKey(commentId, this.post.reply_set);

                  // Update post
                  this.post.reply_set.splice(commentKey, 1);

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
    // Find user key in users array
    let userKey = this.miscService.findObjectKey(userId, this.users);
    // Get user
    let user = this.users[userKey];
    console.log(user);

    this.navCtrl.push(ProfilePage, {user: user})
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
          <button (click)="delComment()" ion-item detail-none class="text-button text-smaller">Supprimer</button>
        </ion-col>
      </ion-row>
    </ion-list>
  `
})
export class CommentsPagePopover {
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

  delComment() {
    this.viewCtrl.dismiss({ data: 'delete'});
  }
}
