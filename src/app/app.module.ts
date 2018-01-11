import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { MainComponent } from './components/mainapp/main/main.component';
import { MenuComponent } from './components/mainapp/menu/menu.component';
import { ReceiptComponent } from './components/mainapp/receipt/receipts.component';

import { LoginComponent } from './components/login/login.component';
import { LogoutComponent } from './components/logout/logout.component';
import { AppRoutingModule } from './app-routing.module';

import { AwsService } from './services/aws.service';
import {AuthService} from './services/auth.service';
import {AuthGuard} from './services/authguard.service';
import { GoogleSigninComponent } from './services/google-signin-components';
import { SignupComponent } from './components/signup/signup.component';
import { ForgotpasswordComponent } from './components/forgotpassword/forgotpassword.component';
import {MessageService} from './services/message.service';
import { ForgotpasswordvalidatecodeComponent } from './components/forgotpasswordvalidatecode/forgotpasswordvalidatecode.component';


@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    LoginComponent,
    LogoutComponent,
    MenuComponent,
    ReceiptComponent,
    SignupComponent,
    ForgotpasswordComponent,
    ForgotpasswordvalidatecodeComponent,
    
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [AwsService,AuthService,AuthGuard,MessageService],
  bootstrap: [AppComponent]
})
export class AppModule { }
