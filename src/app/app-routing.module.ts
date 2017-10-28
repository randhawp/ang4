import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainComponent } from './components/main/main.component';
import { LoginComponent } from './components/login/login.component';
import { LogoutComponent } from './components/logout/logout.component';
import { AuthGuard} from './services/authguard.service'

const appRoutes: Routes = [
  { path: '', redirectTo: '/logout', pathMatch: 'full' },
  { path: 'main', component: MainComponent, canActivate:[AuthGuard]},
  { path: 'login', component: LoginComponent},
  { path: 'logout', component: LogoutComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
