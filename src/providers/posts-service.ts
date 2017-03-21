import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/toPromise';  // Because Angular Observable doesn't have a toPromise operator

import { Post } from '../models/post';
import { AuthService } from '../providers/auth-service';

// use the 'environment-dev' as the default import(!)
// See https://github.com/driftyco/ionic-app-scripts/issues/760
import { ENV } from '../config/environment-dev';

let BABYBLOG_POSTS_URL_API = ENV.API_URL_API + 'posts';

@Injectable()
export class PostsService {
  // token;

  constructor(
    public http: Http,
    private authservice: AuthService
  ) {
    console.log('Hello PostsService Provider');
    // this.isLoggedin = this.authservice.isLoggedin;
    // this.token = this.authservice.token;
  }

  // Load all babyblog posts
  getAllPosts(): Observable<Post[]> {
    var headers = new Headers();
    this.authservice.loadUserCredentials();
    headers.append('Authorization', 'Bearer ' + this.authservice.token);
    return this.http
      .get(BABYBLOG_POSTS_URL_API, {headers: headers})
      .map(res => <Post[]>res.json());
  }
  // getAllPosts(): Promise<Post[]> {
  //   var headers = new Headers();
  //   this.authservice.loadUserCredentials();
  //   headers.append('Authorization', 'Bearer ' + this.authservice.token);
  //   return this.http
  //     .get(BABYBLOG_POSTS_URL_API, {headers: headers})
  //     .toPromise()
  //     .then(res => res.json().data as Post[])
  //     .catch(this.handleError);
  // }

  // Load a post
  getPost(id: number): Observable<Post> {
    var headers = new Headers();
    this.authservice.loadUserCredentials();
    headers.append('Authorization', 'Bearer ' + this.authservice.token);
    return this.http
      .get(`${BABYBLOG_POSTS_URL_API}/${id}/`, {headers: headers})
      .map(res => <Post>res.json());
  }
  // getPost(id: number): Promise<Post> {
  //   var headers = new Headers();
  //   this.authservice.loadUserCredentials();
  //   headers.append('Authorization', 'Bearer ' + this.authservice.token);
  //   return this.http
  //     .get(`${this.babyblogUrlApi}/posts/${id}/`, {headers: headers})
  //     .toPromise()
  //     .then(response => response.json().data as Post)
  //     .catch(this.handleError);
  // }

  // Create a post
  createPost(username: string, content: string, link: string, image: string, videoUrl: string): Promise<Post> {
    var headers = new Headers();
    this.authservice.loadUserCredentials();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', 'Bearer ' + this.authservice.token);
    // console.log(username);
    // console.log(content);
    // console.log(image);
    // console.log(videoUrl);
    console.log("Token used in create method (post) (PostsService) " + this.authservice.token);
    var data = {
      'user': {
        'username': username
      },
      'content': content,
      'link': link,
      'image': image,
      'videoUrl': videoUrl
    }

    return this.http
      .post(`${BABYBLOG_POSTS_URL_API}/create`, JSON.stringify(data), {headers: headers})
      .toPromise()
      .then(res => {
        console.log('Nouveau post :');
        console.log(res);
        <Post>res.json();
      })
      .catch(this.handleError);
  }

  // Create a comment
  createComment(username: string, content: string, relatedPostId: number): Observable<Post> {
    var headers = new Headers();
    this.authservice.loadUserCredentials();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', 'Bearer ' + this.authservice.token);
    // console.log(username);
    // console.log(content);
    // console.log(relatedPostId);
    console.log("Token used in createComment method (PostsService) " + this.authservice.token);
    var data = {
      'user': {
        'username': username
      },
      'content': content,
      'parent': relatedPostId,
      'videoUrl': ''
    }
    // return this.http
    //   .post(`${BABYBLOG_POSTS_URL_API}/create`, JSON.stringify(data), {headers: headers})
    //   .toPromise()
    //   .then(res => res.json().results)
    //   .catch(this.handleError);

    return this.http
      .post(`${BABYBLOG_POSTS_URL_API}/create`, JSON.stringify(data), {headers: headers})
      .map(res => <Post>res.json());
  }

  deletePost(id: number) {
    var headers = new Headers();
    this.authservice.loadUserCredentials();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', 'Bearer ' + this.authservice.token);
    console.log("On s'apprête à supprimer le post d'id : " + id);
    return this.http
      .delete(`${BABYBLOG_POSTS_URL_API}/${id}/`, {headers: headers});
  }

  addHeaders() {
    // To do...
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);  // for demo purpose only
    return Promise.reject(error.message || error);
  }

}
