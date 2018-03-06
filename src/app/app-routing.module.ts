import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainComponent } from './components/mainapp/main/main.component';
import { LoginComponent } from './components/login/login.component';
import { LogoutComponent } from './components/logout/logout.component';
import { ForgotpasswordComponent} from './components/forgotpassword/forgotpassword.component';
import { ForgotpasswordvalidatecodeComponent } from './components/forgotpasswordvalidatecode/forgotpasswordvalidatecode.component';
import { SignupComponent } from './components/signup/signup.component'
import { MenuComponent } from './components/mainapp/menu/menu.component';
import { AdminComponent } from './components/mainapp/admin/admin.component';
import { ReceiptComponent } from './components/mainapp/receipt/receipts.component';
import { EditreceiptComponent } from './components/mainapp/editreceipt/editreceipt.component'
import { NewdepositsComponent } from './components/mainapp/newdeposits/newdeposits.component';
import { EditdepositsComponent } from './components/mainapp/editdeposits/editdeposits.component';
import { ChangepasswordComponent} from './components/mainapp/changepassword/changepassword.component';
import { NewsComponent} from './components/mainapp/news/news.component';
import { BankComponent } from './components/mainapp/bank/bank.component';
import { AuthGuard } from './services/authguard.service'

const appRoutes: Routes = [
  //{ path: '', redirectTo: '/logout', pathMatch: 'full' },
  { path: 'mainapp', canActivate:[AuthGuard],children: [
    { path: 'main', component: MainComponent },
    { path: 'menu', component: MenuComponent},
    { path: 'receipts', component: ReceiptComponent},
    { path: 'editreceipts', component: EditreceiptComponent},
    { path: 'admin', component: AdminComponent},
    { path: 'newdeposits', component: NewdepositsComponent},
    { path: 'editdeposits', component: EditdepositsComponent},
    { path: 'passwd', component: ChangepasswordComponent},
    { path: 'news', component: NewsComponent},
    { path: 'bank', component: BankComponent},

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
