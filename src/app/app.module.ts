import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { MainComponent } from './components/mainapp/main/main.component';
import { MenuComponent } from './components/mainapp/menu/menu.component';
import { ReceiptComponent } from './components/mainapp/receipt/receipts.component';
import { NewdepositsComponent, DialogCashBox } from './components/mainapp/newdeposits/newdeposits.component';
import { EditdepositsComponent } from './components/mainapp/editdeposits/editdeposits.component';
import { ChangepasswordComponent} from './components/mainapp/changepassword/changepassword.component';
import { NewsComponent} from './components/mainapp/news/news.component';
import { BankComponent } from './components/mainapp/bank/bank.component';

import { EditreceiptComponent,DialogReceiptEditor,DialogVoidReceipt, DialogPostReceipt, DialogUnPostReceipt,DialogEditPostReceipt } from './components/mainapp/editreceipt/editreceipt.component'

import {CdkTableModule} from '@angular/cdk/table';
import { AppMaterialModules } from './material.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { LoginComponent } from './components/login/login.component';
import { LogoutComponent } from './components/logout/logout.component';
import { AppRoutingModule } from './app-routing.module';

import { AwsService } from './services/aws.service';
import {AuthService} from './services/auth.service';
import {AuthGuard} from './services/authguard.service';

import { SignupComponent } from './components/signup/signup.component';
import { ForgotpasswordComponent } from './components/forgotpassword/forgotpassword.component';
import {MessageService} from './services/message.service';
import {StateService} from './services/state.service'
import {WebapiService} from './services/webapi.service'
import { ForgotpasswordvalidatecodeComponent } from './components/forgotpasswordvalidatecode/forgotpasswordvalidatecode.component';
import { AdminComponent,DialogEditUser,SetRolePipe,DialogDeleteUser } from './components/mainapp/admin/admin.component';

import { SetPayTypesPipe } from './components/mainapp/utilities/readablePayTypes'
import { NgxCurrencyModule } from "ngx-currency"; //https://github.com/nbfontana/ngx-currency
//import { CurrencyMaskModule } from "ng2-currency-mask"; //https://github.com/cesarrew/ng2-currency-mask (not ivy compatible)

//import { DataTableModule } from 'angular-4-data-table';
//import { DataFilterPipe } from './data-filter.pipe';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    LoginComponent,
    LogoutComponent,
    MenuComponent,
    ReceiptComponent,
    EditreceiptComponent,
    DialogEditPostReceipt,
    SignupComponent,
    ForgotpasswordComponent,
    ForgotpasswordvalidatecodeComponent,
    AdminComponent,
    DialogEditUser,
    DialogDeleteUser,
    DialogReceiptEditor,
    DialogVoidReceipt,
    DialogPostReceipt,
    DialogUnPostReceipt,
    SetRolePipe,
    NewdepositsComponent,
    EditdepositsComponent,
    ChangepasswordComponent,
    NewsComponent,
    BankComponent,
    DialogCashBox,
    SetPayTypesPipe

  //  DataFilterPipe
   
    
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    HttpClientModule,
    AppRoutingModule,
    //DataTableModule
    CdkTableModule, 
    AppMaterialModules,
    ReactiveFormsModule,
    NgxCurrencyModule
    //CurrencyMaskModule
    
   
  ],
  entryComponents: [DialogEditUser,DialogDeleteUser,DialogReceiptEditor,DialogVoidReceipt,DialogPostReceipt,DialogUnPostReceipt,DialogCashBox,DialogEditPostReceipt ],
  providers: [StateService,MessageService,WebapiService,AwsService,AuthService,AuthGuard,],
  bootstrap: [AppComponent]
})
export class AppModule { }
