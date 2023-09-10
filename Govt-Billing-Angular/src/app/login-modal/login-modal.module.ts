import { FormBuilder } from "@angular/forms";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { LoginModalPageRoutingModule } from "./login-modal-routing.module";

import { LoginModalPage } from "./login-modal.page";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FormBuilder,
    LoginModalPageRoutingModule,
  ],
  declarations: [LoginModalPage],
})
export class LoginModalPageModule {}
