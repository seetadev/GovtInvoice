import { InappPurchasePage } from "./../inapp-purchase/inapp-purchase.page";
import { ListPage } from "./../list/list.page";
import { MenuPage } from "./../menu/menu.page";
import { HomePage } from "./../home/home.page";
import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-tabs",
  templateUrl: "./tabs.page.html",
  styleUrls: ["./tabs.page.scss"],
})
export class TabsPage implements OnInit {
  tab1Root = HomePage;
  tab2Root = MenuPage;
  tab3Root = ListPage;
  tab4Root = InappPurchasePage;
  constructor() {}

  ngOnInit() {}
}
