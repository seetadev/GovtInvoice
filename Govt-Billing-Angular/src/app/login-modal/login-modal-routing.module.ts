import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginModalPage } from './login-modal.page';

const routes: Routes = [
  {
    path: '',
    component: LoginModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginModalPageRoutingModule {}
