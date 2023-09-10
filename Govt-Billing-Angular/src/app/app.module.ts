import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HomePage } from "./home/home.page";
import { TabsPage } from "./tabs/tabs.page";
import { InappPurchasePage } from "./inapp-purchase/inapp-purchase.page";
// import { HomePage } from "./home.page_20200702204333";
import { MenuPage } from "./menu/menu.page";
import { ListPage } from "./list/list.page";
import { LoginModalPage } from "./login-modal/login-modal.page";
import { InappPurchaseService } from "./inapp-purchase.service";
import { CloudServiceService } from "./cloud-service.service";
import { LocalServiceService } from "./local-service.service";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouteReuseStrategy } from "@angular/router";

import { IonicModule, IonicRouteStrategy } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { HttpClientModule } from "@angular/common/http";
import { IonicStorageModule } from "@ionic/storage";
import { Storage } from "@ionic/storage";
import { Printer } from "@ionic-native/printer/ngx";
import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";
import { EmailComposer } from "@ionic-native/email-composer/ngx";
import { SocialSharing } from "@ionic-native/social-sharing/ngx";
import { Camera } from "@ionic-native/camera/ngx";
import { Network } from "@ionic-native/network/ngx";
import { InAppPurchase } from "@ionic-native/in-app-purchase/ngx";
import { InAppBrowser } from "@ionic-native/in-app-browser/ngx";

@NgModule({
  declarations: [
    AppComponent,
    LoginModalPage,
    // ListPage,
    // MenuPage,
    // HomePage,
    // LoginModalPage,
    // InappPurchasePage,
    // TabsPage,
  ],
  entryComponents: [
    AppComponent,
    // ListPage,
    // MenuPage,
    // HomePage,
    LoginModalPage,
    // InappPurchasePage,
    // TabsPage,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    IonicStorageModule.forRoot(),
  ],
  providers: [
    Printer,
    InAppPurchase,
    Network,
    InAppBrowser,
    Camera,
    SocialSharing,
    EmailComposer,
    StatusBar,
    LocalServiceService,
    CloudServiceService,
    InappPurchaseService,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
