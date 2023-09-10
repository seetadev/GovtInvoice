import { DATA } from "./../app-data";
import { LocalServiceService, File } from "./../local-service.service";
import { Component, ViewChild, ElementRef, AfterViewInit } from "@angular/core";
import { Router } from "@angular/router";
import { NavController, AlertController } from "@ionic/angular";
import * as AppGeneral from "socialcalc/AppGeneral";

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"],
})
export class HomePage {
  @ViewChild("tableeditor") defaultContent: ElementRef;

  footers: any = [];
  msc: any;
  tableeditor: any;
  selectedFile: string;
  selectedFileInterval: any;
  saveInterval: any;

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private localService: LocalServiceService,
    private alertCtrl: AlertController
  ) {
    console.log("hello");
    // this.msc = DATA["home"][AppGeneral.getDeviceType()]["msc"];
    this.msc = DATA["home"]["android"]["msc"];
    // this.footers = DATA["home"][AppGeneral.getDeviceType()]["footers"];
    this.footers = DATA["home"]["android"]["footers"];
    this.localService.getSelectedFile().then((selectedFile) => {
      this.selectedFile = selectedFile;
    });
  }
  ionViewWillEnter() {
    console.log("home ion view will enter");
    this.selectedFileInterval = setInterval(() => {
      this.localService.getSelectedFile().then((selectedFile) => {
        this.selectedFile = selectedFile;
      });
    }, 2000);

    this.saveInterval = setInterval(() => {
      // console.log("Entering..")
      this.localService.getSelectedFile().then((selectedFile) => {
        if (selectedFile == "default") {
          selectedFile = "Untitled";
          let content = encodeURIComponent(AppGeneral.getSpreadsheetContent());
          this.localService.saveFile(
            new File(
              new Date().toString(),
              new Date().toString(),
              content,
              selectedFile
            )
          );
          this.localService.setSelectedFile(selectedFile);
          return;
        }
        let name = selectedFile;
        let content = encodeURIComponent(AppGeneral.getSpreadsheetContent());
        this.localService.getFile(name).then((data) => {
          let password = data.password;
          let created = new Date(data.created).toString();
          this.localService.saveFile(
            new File(created, new Date().toString(), content, name, password)
          );
          this.localService.setSelectedFile(name);
        });
      });
    }, 1000);
  }
  ionViewWillLeave() {
    clearInterval(this.selectedFileInterval);
    this.localService.getSelectedFile().then((selectedFile) => {
      if (selectedFile == "Untitled") {
        this.presentAlert(
          "Save file",
          "File temporary saved. Please click Save As in Menu to save file"
        );
      }
    });
    clearInterval(this.saveInterval);
  }
  ngAfterViewInit() {
    console.log("ngafterviewinint");
    var tableeditor: HTMLDivElement = this.defaultContent.nativeElement;
    this.tableeditor = tableeditor;
    console.log("ngafterviewinint1");

    this.localService.getSelectedFile().then((selectedFile) => {
      if (selectedFile == "default" || !selectedFile) {
        AppGeneral.initializeApp(tableeditor, JSON.stringify(this.msc));
        console.log("ngafterviewinint2");
      } else {
        this.localService.getFile(this.selectedFile).then((data) => {
          AppGeneral.initializeApp(
            tableeditor,
            decodeURIComponent(data.content)
          );
          console.log("ngafterviewinint3");
        });
      }
    });
  }

  activateFooter(footer: { index: any }) {
    AppGeneral.activateFooterButton(footer.index);
    // console.log("activating: "+footer.index+", name:"+footer.name);
    for (var i in this.footers) {
      if (this.footers[i].index == footer.index) {
        this.footers[i].isActive = true;
      } else {
        this.footers[i].isActive = false;
      }
    }
  }

  presentAlert(title: string, subtitle: string) {
    let alert = this.alertCtrl
      .create({
        header: title,
        message: subtitle,
        buttons: [
          {
            text: "Okay",
          },
        ],
      })
      .then((alertEl) => {
        alertEl.present();
      });
  }
}
