**************************************************************************************
A private & secured social blog for connected families, based on Angular 2 and Ionic 2
**************************************************************************************

History
=======

Babyblog App project was born with the wish to give families with new-born child a simple and direct way to keep in touch and stay connected to their relatives, sharing pictures, videos or links. As a newly daddy, I was the first (and happy !) user of this app. I hope you will enjoy using it too :)

This project currently runs with Angular 2 and Ionic 2.

Babyblog App is connected to a web-based blog available `here <http://entrepreneur-digital.com/>`_, through a REST Api.

You can see a live demo running `here <http://vps121400.ovh.net>`_.

.. image:: https://github.com/NicolasMura/babyblog-app-demo/blob/master/assets/img/projet-babyblog.png
    :alt: Babyblog App Preview
    :target: http://vps121400.ovh.net

Requirements
============

* `Node JS <https://nodejs.org/en/>`_ with NPM
* `Angular 2 <https://angular.io/>`_
* `Ionic 2 <http://ionic.io/2>`_

Setup
=====

Before you can test the Babyblog App locally, you will need to install and run the `Django based app server <https://github.com/NicolasMura/babyblog>`_, which comes with a REST Api.

Quick start
===========

With above requirements & setup statisfied, you can easily clone this project and start playing:

.. code-block:: shell

    npm install

You will also need to add a src/config/environment-dev.ts file with following content:

.. code-block:: typescript

    export const ENV = {
      PRODUCTION   : false,
      API_URL_API  : 'http://localhost:8000/api/',
      AUTH_URL     : 'http://localhost:8000/o',
      CLIENT_ID    : '<CLIENT_ID>',
      GRANT_TYPE_PASSWORD : 'password',
      GRANT_TYPE_REFRESH  : 'refresh_token'
    };

Finally, run the integrated ionic server with:

.. code-block:: shell

    ionic serve --browser "google chrome"

Improvments in the pipeline
===========================

* Signup
* Multiblogs
* Invitations from user
* App settings
* Update profile
* Infinite scroll for posts
* Remove account
* Pushs notif (Firebase ?)
* Sound notification when posting message / comment
* Off-line mode

Notes
=====

Any suggestion and / or improvment's idea is welcome !


