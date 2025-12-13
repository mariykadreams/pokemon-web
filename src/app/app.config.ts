import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(), provideFirebaseApp(() => initializeApp({"projectId":"pokemon-web-e0a13","appId":"1:833729070492:web:9ac8d4e60d155b2dbcb459","storageBucket":"pokemon-web-e0a13.firebasestorage.app","apiKey":"AIzaSyBveU5fqem6Uym8TC2dIwRY9wlv66rfXEc","authDomain":"pokemon-web-e0a13.firebaseapp.com","messagingSenderId":"833729070492","measurementId":"G-JMRGWKD40S"})), provideAuth(() => getAuth()), provideFirestore(() => getFirestore())
  ]
};
