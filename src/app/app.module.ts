import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { CheckCredentialsPage } from '../pages/check-credentials/check-credentials';
import { LoginPage } from '../pages/login/login';
import { HomePage, HomePagePopover } from '../pages/home/home';
import { ModalCommentsPage, CommentsPagePopover } from '../pages/modal-comments/modal-comments';
import { NewPostPage } from '../pages/new-post/new-post';
import { ProfilePage } from '../pages/profile/profile';

import { AuthService } from '../providers/auth-service';
import { PostsService } from '../providers/posts-service';
import { UsersService } from '../providers/users-service';
import { MiscService } from '../providers/misc-service';

// Image viewer
import { IonicImageViewerModule } from 'ionic-img-viewer';

@NgModule({
  declarations: [
    MyApp,
    CheckCredentialsPage,
    LoginPage,
    HomePage,
    HomePagePopover,
    ModalCommentsPage,
    CommentsPagePopover,
    NewPostPage,
    ProfilePage
  ],
  imports: [
    // IonicModule.forRoot(MyApp),
    IonicModule.forRoot(MyApp, {
      backButtonText: 'Retour'
     }),
    IonicImageViewerModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    CheckCredentialsPage,
    LoginPage,
    HomePage,
    HomePagePopover,
    ModalCommentsPage,
    CommentsPagePopover,
    NewPostPage,
    ProfilePage
  ],
  providers: [
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    InAppBrowser,
    HomePage,      // (to remove ?)
    AuthService,
    PostsService,
    UsersService,
    MiscService
  ]
})
export class AppModule {}
