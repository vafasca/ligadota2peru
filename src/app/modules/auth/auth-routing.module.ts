import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { WaitingVerificationComponent } from './components/waiting-verification/waiting-verification.component';
import { authGuard } from './guards/auth.guard';
import { registrationGuard } from './guards/registration.guard';

const routes: Routes = [{ path: 'login', component: LoginComponent },
  { path: 'registro', component: RegisterComponent },
  { path: 'recuperar-contrasena', component: ForgotPasswordComponent },
  { path: '', component: LoginComponent },
  {
    path: 'verificacion',
    component: WaitingVerificationComponent,
    canActivate: [registrationGuard]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
