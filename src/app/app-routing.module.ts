import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainComponent } from './components/mainapp/main/main.component';
import { LoginComponent } from './components/login/login.component';
import { LogoutComponent } from './components/logout/logout.component';
import { ForgotpasswordComponent} from './components/forgotpassword/forgotpassword.component';
import { ForgotpasswordvalidatecodeComponent } from './components/forgotpasswordvalidatecode/forgotpasswordvalidatecode.component';
import { SignupComponent } from './components/signup/signup.component'
import { MenuComponent } from './components/mainapp/menu/menu.component';
import { ReceiptComponent } from './components/mainapp/receipt/receipts.component';
import { AuthGuard } from './services/authguard.service'

const appRoutes: Routes = [
  //{ path: '', redirectTo: '/logout', pathMatch: 'full' },
  { path: 'mainapp', canActivate:[AuthGuard],children: [
    { path: 'main', component: MainComponent },
    { path: 'menu', component: MenuComponent},
    { path: 'receipts', component: ReceiptComponent}
  ]},
  { path: 'login', component: LoginComponent},
  { path: 'logout', component: LogoutComponent},
  { path: 'signup', component: SignupComponent},
  { path: 'forgotpassword', component: ForgotpasswordComponent},
  { path: 'forgotpasswordvalidate' , component: ForgotpasswordvalidatecodeComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
