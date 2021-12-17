import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  isProgressVisible: boolean;
  signupForm!: FormGroup;
  firebaseErrorMessage: string;

  constructor(private authService: AuthService,
              private router: Router) {
    this.isProgressVisible = false;
    this.firebaseErrorMessage = '';
  }

  ngOnInit(): void {
    if (this.authService.userLoggedIn) {
      this.router.navigate(['/dashboard']);
    }

    this.signupForm = new FormGroup({
      displayName: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required)
    });
  }

  signup(): void {
    if (this.signupForm.invalid) {
      return;
    }

    this.isProgressVisible = true;
    this.authService.signupUser(this.signupForm.value).then((result) => {

      if (result == null) {
        this.router.navigate(['/dashboard']);
      } else if (result.isValid === false) {
        this.firebaseErrorMessage = result.message;
      }

      this.isProgressVisible = false;
    }).catch(() => {
      this.isProgressVisible = false;
    });
  }
}
