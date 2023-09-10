import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InappPurchasePageRoutingModule } from './inapp-purchase-routing.module';

import { InappPurchasePage } from './inapp-purchase.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InappPurchasePageRoutingModule
  ],
  declarations: [InappPurchasePage]
})
export class InappPurchasePageModule {}
