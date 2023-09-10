import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { MenuPageRoutingModule } from "./menu-routing.module";
// import { Printer } from '@ionic-native/printer/ngx';
import { MenuPage } from "./menu.page";

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, MenuPageRoutingModule],
  declarations: [MenuPage],
  // providers: [
  //   Printer
  // ]
})
export class MenuPageModule {}
