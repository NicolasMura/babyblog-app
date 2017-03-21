import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';

import { User } from '../../models/user';
import { ModalProfilePage } from '../../pages/modal-profile/modal-profile'
import { LoginPage } from '../../pages/login/login';
import { AuthService } from '../../providers/auth-service';
import { UsersService } from '../../providers/users-service';
import { MiscService } from '../../providers/misc-service';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {
  loggedUser: User;
  user: User;
  isLoggedUser: boolean;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    private usersService: UsersService,
    private authService: AuthService,
    private miscService: MiscService
  ) {
    // Check token validity, refresh if needed
    this.authService.checkTokenValidity('ProfilePage');

    // Retrieve loggedUser
    var username = this.authService.loggedUserUsername;
    this.loggedUser = this.usersService.getLoggedUser(username);

    // Retrieve user
    this.isLoggedUser = false;
    this.user = this.navParams.get('user');

    // Get human dates and time
    // this.user['humanDate'] = this.miscService.getHumanDate(this.user.date_joined);

    // if there is no retrieved user (eg. we come from Profile link on menu), or if user is loggedUser
    if(typeof(this.user) === 'undefined' || this.user.id === this.loggedUser.id) {
      this.user = this.loggedUser;
      this.isLoggedUser = true;
    }

    // Test
    if(this.user.email === '') {
      this.user.email = 'Non renseigné';
    }
  }

  ionViewDidLoad() {
    console.log('Hello ProfilePage !');
  }

  edit(event, user) {
    let modal = this.modalCtrl.create(ModalProfilePage, user);
    modal.dismiss((data) => {
      this.usersService.update(data).subscribe();
    });

    modal.present();
  }

  openModal(user) {
    let modal = this.modalCtrl.create(ModalProfilePage, user);
    modal.present();
  }

  logoutApp() {
    this.authService.logout();
    this.navCtrl.setRoot(LoginPage, {}, {animate: true, direction: 'up'});
  }
}
