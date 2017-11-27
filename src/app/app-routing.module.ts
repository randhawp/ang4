import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainComponent } from './components/mainapp/main/main.component';
import { LoginComponent } from './components/login/login.component';
import { LogoutComponent } from './components/logout/logout.component';
import {MenuComponent} from './components/mainapp/menu/menu.component';
import {RecepitsComponent} from './components/mainapp/recepits/recepits.component';
import { AuthGuard} from './services/authguard.service'

const appRoutes: Routes = [
  { path: '', redirectTo: '/logout', pathMatch: 'full' },
  { path: 'mainapp', canActivate:[AuthGuard],children: [
    { path: 'main', component: MainComponent },
    { path: 'menu', component: MenuComponent},
    { path: 'recepits', component: RecepitsComponent}
  ]},
  { path: 'login', component: LoginComponent},
  { path: 'logout', component: LogoutComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
