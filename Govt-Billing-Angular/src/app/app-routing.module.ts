import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  // {
  //   path: "",
  //   redirectTo: "tabs",
  //   pathMatch: "full",
  // },
  {
    path: '',
    redirectTo: 'tabs/home',
    pathMatch: 'full'
  },
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  }
  // {
  //   path: "home",
  //   loadChildren: () =>
  //     import("./home/home.module").then((m) => m.HomePageModule),
  // },
  
  // {
  //   path: "inapp-purchase",
  //   loadChildren: () =>
  //     import("./inapp-purchase/inapp-purchase.module").then(
  //       (m) => m.InappPurchasePageModule
  //     ),
  // },
  // {
  //   path: "list",
  //   loadChildren: () =>
  //     import("./list/list.module").then((m) => m.ListPageModule),
  // },
  // {
  //   path: "login-modal",
  //   loadChildren: () =>
  //     import("./login-modal/login-modal.module").then(
  //       (m) => m.LoginModalPageModule
  //     ),
  // },
  // {
  //   path: "menu",
  //   loadChildren: () =>
  //     import("./menu/menu.module").then((m) => m.MenuPageModule),
  // },
  // {
  //   path: "tabs",
  //   loadChildren: () =>
  //     import("./tabs/tabs.module").then((m) => m.TabsPageModule),
  // },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
