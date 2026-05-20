import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Users } from './components/users/users';
import { authGuard } from './guards/auth.guard';
import { loginGuard } from './guards/login.guard';

export const routes: Routes = [
  { path: 'login', component: Login, canActivate: [loginGuard] },
  { path: 'users', component: Users, canActivate: [authGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];
