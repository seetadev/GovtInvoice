import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InappPurchasePage } from './inapp-purchase.page';

const routes: Routes = [
  {
    path: '',
    component: InappPurchasePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InappPurchasePageRoutingModule {}
