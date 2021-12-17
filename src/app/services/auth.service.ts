import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  userLoggedIn: boolean;

  constructor(private router: Router,
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore) {
    this.userLoggedIn = false;

    this.afAuth.onAuthStateChanged((user) => {
      this.userLoggedIn = user ? true : false;
    });
  }

  loginUser(email: string, password: string): Promise<any> {
    return this.afAuth.signInWithEmailAndPassword(email, password)
      .then(() => {
        console.log('Login realizado com sucesso: ', email);
      })
      .catch((error) => {
        if (error.code) {
          return { isValid: false, message: error.message };
        }
        return false;
      });
  }

  signupUser(user: any) {
    return this.afAuth.createUserWithEmailAndPassword(user.email, user.password)
      .then((result) => {
        let emailLower = user.email.toLowerCase();

        this.afs.doc('/users/' + emailLower)
          .set({
            accountType: 'endUser',
            displayName: user.displayName,
            displayName_lower: user.displayName.toLowerCase(),
            email: user.email,
            email_lower: emailLower
          });

        result.user?.sendEmailVerification();
      })
      .catch(error => {
        console.log('Auth Service: signup error', error);
        // if (error.code)
          return { isValid: false, message: error.message };
      });
  }


  resetPassword(email: string): Promise<any> {
    return this.afAuth.sendPasswordResetEmail(email)
      .then(() => {
        console.log('Reset password success!');
        this.router.navigate(['/login']);
      })
      .catch(error => {

        console.log('Auth Service: resetPassword error...');
        console.log('error code: ', error.code);
        console.log('error: ', error);
        if (error.code) {
          return error;
        }
      });
  }

  async resendVerificationEmail(): Promise<any> {
    return (await this.afAuth.currentUser)?.sendEmailVerification()
      .then(() => {
        this.router.navigate(['/home']);
      })
      .catch((error) => {
        console.log('Auth Service: sendVerificationEmail error...');
        console.log('error code: ', error.code);
        console.log('error: ', error);

        if (error.code) {
          return error;
        }
      });
  }

  logoutUser(): Promise<void> {
    return this.afAuth.signOut()
      .then(() => {
        this.router.navigate(['/home']);
      })
      .catch((error) => {
        console.log('Auth Service: logout error...');
        console.log('error code: ', error.code);
        console.log('error: ', error);

        if (error.code) {
          return error;
        }
      });
  }

  serUserInfo(payload: object): void {
    console.log('Auth Service: save user info...');
    this.afs.collection('users')
      .add(payload).then((res) => {
        console.log('Auth Service: setUserInfo response...');
        console.log(res);
      });
  }
}
