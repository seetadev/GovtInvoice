import { Router } from "@angular/router";
import { LoginModalPage } from "./../login-modal/login-modal.page";
import { async } from "@angular/core/testing";
import { InappPurchaseService } from "./../inapp-purchase.service";
import { CloudServiceService } from "./../cloud-service.service";
import { LocalServiceService, File } from "./../local-service.service";
import { AlertController, ModalController } from "@ionic/angular";
import { NavController, ToastController } from "@ionic/angular";
import { Component, OnInit } from "@angular/core";
import { Printer, PrintOptions } from "@ionic-native/printer/ngx";
import { EmailComposer } from "@ionic-native/email-composer/ngx";
import { SocialSharing } from "@ionic-native/social-sharing/ngx";
import { DATA, APP_NAME, LINK, LOGO } from "../app-data";
import * as AppGeneral from "socialcalc/AppGeneral";
import { InAppBrowser } from "@ionic-native/in-app-browser/ngx";
import { Camera, CameraOptions } from "@ionic-native/camera/ngx";

const IMG_LINK = "www/assets/img/icon.png";
@Component({
  selector: "app-menu",
  templateUrl: "./menu.page.html",
  styleUrls: ["./menu.page.scss"],
})
export class MenuPage implements OnInit {
  msc: any;
  request: any = {};
  applicationName: string;
  radioOpen: any;
  radioResult: any;
  setting: any = {};
  constructor(
    public navCtrl: NavController,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public localService: LocalServiceService,
    public printer: Printer,
    public emailComposer: EmailComposer,
    public cloudService: CloudServiceService,
    public socialSharing: SocialSharing,
    public modalCtrl: ModalController,
    public iab: InAppBrowser,
    public camera: Camera,
    public inapp: InappPurchaseService,
    private router: Router
  ) {
    this.msc = DATA["home"][AppGeneral.getDeviceType()]["msc"];
    this.request = {
      pdf: { done: true },
      allpdf: { done: true },
      save: { done: true },
      sharepdf: { done: true },
      logo: { done: true },
    };
    this.applicationName = APP_NAME;
    this.getSettingsForUser().then((setting) => {
      this.setting = setting;
    });
  }
  newFile() {
    AppGeneral.viewFile("default", JSON.stringify(this.msc));
    this.showToast("Loading new file....");
    this.router.navigateByUrl("/tabs/home");
    // console.log("Entering home");
    // var t: Tabs = this.navCtrl.parent;
    // setTimeout(() => {
    //   t.select(0);
    // }, 2000);
  }
  updateFile() {
    if (this.localService.selectedFile == "default") {
      this.showToast("Cannot update default file!");
      return false;
    }
    this.localService.getSelectedFile().then((selectedFile) => {
      let name = selectedFile;
      let content = encodeURIComponent(AppGeneral.getSpreadsheetContent());
      this.localService.getFile(name).then((data) => {
        let created = new Date(data.created).toString();
        this.localService.saveFile(
          new File(created, new Date().toString(), content, name)
        );
        this.localService.setSelectedFile(name);
        this.showToast(name + " successfully updated!");
      });
    });
  }
  saveAs() {
    /*let avail = false;
  		this.inapp.isSavePrintEmailAvailable().then(success =>{
  			avail = success;
  			console.log("Save as available ? "+success);
  			if(!avail){
	  			this.showAlert('Save As', 'Please purchase Save as, Print and Email from the In-app purchase tab to continue');
	  			return;
	  		}
		});*/
    AppGeneral.saveAs().then(
      (filename) => {
        console.log(filename);
        if (!this.validateName(filename)) return;
        filename = this.formatString(filename);
        console.log("continue saving " + filename);
        var content = encodeURIComponent(AppGeneral.getSpreadsheetContent());
        // console.log(content);
        this.localService.saveFile(
          new File(
            new Date().toString(),
            new Date().toString(),
            content,
            filename
          )
        );
        this.localService.setSelectedFile(filename);
        this.showToast(filename + " successfully saved!");

        /*this.inapp.updateSavePrintEmail().subscribe(units =>{
						console.log("updatePDF: "+units+" left");
						this.showToast("You have "+units+" units left");
						if(units <= 3){
							this.showAlert("Save as","You have limited number of times remaining for doing Save as ,Print and Email.Kindly buy from the In-app purchase tab");
						}
				});*/
      },
      (err) => JSON.stringify(err)
    );
  }

  /********* Save as Password protected file ******/
  saveAsPassword() {
    let alert = this.alertCtrl
      .create({
        header: "Save as Password Protected file",
        // title:
        inputs: [
          {
            name: "filename",
            placeholder: "Filename",
          },
          {
            name: "password",
            placeholder: "Password",
            type: "password",
          },
        ],
        buttons: [
          {
            text: "Cancel",
            role: "cancel",
            handler: (data) => {
              console.log("Cancel clicked");
            },
          },
          {
            text: "Save as",
            handler: (data) => {
              if (this.validateName(data.filename)) {
                if (this.validatePassword(data.password)) {
                  // console.log("Filename & Password valid"+data.filename+' & '+data.password);
                  data.filename = this.formatString(data.filename);
                  console.log("continue saving " + data.filename);
                  var content = encodeURIComponent(
                    AppGeneral.getSpreadsheetContent()
                  );
                  // console.log(content);
                  this.localService.saveFile(
                    new File(
                      new Date().toString(),
                      new Date().toString(),
                      content,
                      data.filename,
                      data.password
                    )
                  );
                  this.localService.setSelectedFile(data.filename);
                  this.showToast(data.filename + " successfully saved!");
                }
              } else {
                this.showToast("Filename or password is invalid");
              }
            },
          },
        ],
      })
      .then((alertEl) => {
        alertEl.present();
      });

    // alert.present();

    /*
		this.localService.saveFile(new File(new Date().toString(), new Date().toString(), content, filename));
		this.localService.setSelectedFile(filename);
		this.showToast(filename+' successfully saved!');
		 */
  }

  /********* Print starts here ********/
  print(option) {
    let that = this;
    let avail = false;
    this.inapp.isSavePrintEmailAvailable().then((success) => {
      avail = success;
      console.log("Print available ? " + success);
      /*if(!avail){
	  			this.showAlert('Print', 'Please purchase Save as, Print and Email from the In-app purchase tab to continue');
	  			return;
	  		}*/

      let content = "";
      if (option == "all") {
        content = AppGeneral.getAllHTMLContent(this.msc);
      } else {
        content = AppGeneral.getCurrentHTMLContent();
      }

      this.printer.isAvailable().then(
        (onsuccess: any) => {
          let options: PrintOptions = {
            name: APP_NAME + ".html",
            printer: "printer007",
            duplex: true,
            orientation: "landscape",
            monochrome: true,
            // landscape: true,
            // grayscale: true,
          };

          this.printer.print(content, options).then(
            (value: any) => {
              console.log("value:" + value);
              /*that.inapp.updateSavePrintEmail().subscribe(units =>{
						console.log("updatePDF: "+units+" left");
						that.showToast("You have "+units+" units left");
						if(units <= 3){
							that.showAlert("Print","You have limited number of times remaining for doing Save as ,Print and Email.Kindly buy from the In-app purchase tab");
						}
				  });*/
            },
            (error) => {
              console.log("error:", error);
            }
          );
        },
        (err) => {
          console.log("err:", err);
        }
      );
    });
  }

  email(option) {
    let that = this;
    let avail = false;
    this.inapp.isSavePrintEmailAvailable().then((success) => {
      avail = success;
      console.log("Email available ? " + success);
      /*if(!avail){
	  			this.showAlert('Email', 'Please purchase Save as, Print and Email from the In-app purchase tab to continue');
	  			return;
	  		}*/

      var content;
      var subject;
      if (option == "all") {
        content = AppGeneral.getAllHTMLContent(this.msc);
        subject = APP_NAME + " workbook attached";
      } else {
        content = AppGeneral.getCurrentHTMLContent();
        subject = APP_NAME + " attached";
      }

      let email = {
        to: "",
        cc: "",
        subject: subject,
        body: content,
        isHtml: true,
      };

      this.emailComposer.open(email).then(() => {
        console.log("Email sent!");
        /*that.inapp.updateSavePrintEmail().subscribe(units =>{
					console.log("updatePDF: "+units+" left");
					that.showToast("You have "+units+" units left");
					if(units <= 3){
						that.showAlert("Email","You have limited number of times remaining for doing Save as ,Print and Email.Kindly buy from the In-app purchase tab");
					}
				});*/
      });
    });
  }
  exportAsPDF(option) {
    let that = this;
    let avail = false;
    this.inapp.isPDFAvailable().then((success) => {
      avail = success;
      console.log("Export PDF available ? " + success);
      /*if(!avail){
	  			this.showAlert('Export as PDF', 'Please purchase Export as PDF from the In-app purchase tab to continue');
	  			return;
	  		}*/

      var content;
      if (option == "all") {
        content = AppGeneral.getAllHTMLContent(this.msc);
        this.request.allpdf.done = false;
      } else {
        content = AppGeneral.getCurrentHTMLContent();
        this.request.pdf.done = false;
      }

      this.cloudService.createPDF(content).subscribe(
        (data) => {
          var subject;
          if (option == "one") {
            this.request.pdf.done = true;
            subject = APP_NAME + " PDF link available";
          } else {
            this.request.allpdf.done = true;
            subject = APP_NAME + " workbook PDF link available";
          }
          let result = data.result;
          if (result == "ok") {
            let pdfurl = data.pdfurl;
            console.log(pdfurl);
            this.openEmailComposer(pdfurl, subject);
            /*this.inapp.updatePDF().subscribe(units =>{
							console.log("updatePDF: "+units+" left");
							that.showToast("You have "+units+" units left");
						});*/
          }
        },
        (error) => {
          if (option == "one") {
            this.request.pdf.done = true;
          } else {
            this.request.allpdf.done = true;
          }
          console.log(JSON.stringify(error));
        }
      ); //Cloudservice
    });
  }

  openEmailComposer(content, subject) {
    let email = {
      to: "",
      cc: "",
      subject: subject,
      body: content,
      isHtml: true,
    };

    this.emailComposer.open(email).then(() => {
      console.log("Email sent!");
    });
  }

  share() {
    let alert = this.alertCtrl
      .create({
        header: "Share PDF via",
        inputs: [
          {
            type: "radio",
            label: "Facebook",
            value: "facebook",
            checked: false,
          },
          {
            type: "radio",
            label: "Twitter",
            value: "twitter",
            checked: false,
          },
          {
            type: "radio",
            label: "WhatsApp",
            value: "whatsapp",
            checked: false,
          },
          {
            type: "radio",
            label: "SMS",
            value: "sms",
            checked: false,
          },
        ],
        buttons: [
          {
            text: "Cancel",
            role: "cancel",
          },
          {
            text: "Ok",
            handler: (shareVia) => {
              this.radioOpen = false;
              this.radioResult = shareVia;
              // console.log(shareVia);
              var content = AppGeneral.getCurrentHTMLContent();
              this.request.sharepdf.done = false;
              this.cloudService.createPDF(content).subscribe(
                (data) => {
                  let result = data.result;
                  this.request.sharepdf.done = true;
                  if (result == "ok") {
                    let pdfurl = data.pdfurl;
                    this.sharePDF(pdfurl, shareVia);
                  }
                },
                (error) => {
                  this.request.sharepdf.done = true;
                  console.log(JSON.stringify(error));
                }
              );
            },
          },
        ],
      })
      .then((alertEl) => {
        alertEl.present();
      });
    // alert.setTitle("Share PDF via");

    // alert.addInput({
    //   type: "radio",
    //   label: "Facebook",
    //   value: "facebook",
    //   checked: false,
    // });
    // alert.addInput({
    //   type: "radio",
    //   label: "Twitter",
    //   value: "twitter",
    //   checked: false,
    // });
    // alert.addInput({
    //   type: "radio",
    //   label: "WhatsApp",
    //   value: "whatsapp",
    //   checked: false,
    // });
    // alert.addInput({
    //   type: "radio",
    //   label: "SMS",
    //   value: "sms",
    //   checked: false,
    // });

    // alert.addButton("Cancel");
    // alert.addButton({
    //   text: "OK",
    //   handler: (shareVia) => {
    //     this.radioOpen = false;
    //     this.radioResult = shareVia;
    //     // console.log(shareVia);
    //     var content = AppGeneral.getCurrentHTMLContent();
    //     this.request.sharepdf.done = false;
    //     this.cloudService.createPDF(content).subscribe(
    //       (data) => {
    //         let result = data.result;
    //         this.request.sharepdf.done = true;
    //         if (result == "ok") {
    //           let pdfurl = data.pdfurl;
    //           this.sharePDF(pdfurl, shareVia);
    //         }
    //       },
    //       (error) => {
    //         this.request.sharepdf.done = true;
    //         console.log(JSON.stringify(error));
    //       }
    //     );
    //   },
    // });

    // alert.present();
  }

  sharePDF(pdfurl, shareVia) {
    var self = this;
    let avail = false;
    var fName = APP_NAME;

    switch (shareVia) {
      case "facebook":
        this.inapp.isFbSharePDFAvailable().then((success) => {
          avail = success;
          console.log("Share PDF available ? " + avail);
          /*if(!avail){
				this.showAlert('Share PDF', 'Please purchase Share PDF from the In-app purchase tab to continue');
				return;
			}*/

          this.socialSharing
            .shareViaFacebook(fName + " PDF link available", IMG_LINK, pdfurl)
            .then(() => {
              console.log("share via facebook done");

              /*self.inapp.updateFbSharePDF().subscribe(units =>{
		      	console.log("updateSharePDF: "+units+"  :left");
		      	self.showToast('You have '+units+' units remaining. ');
		      }); */
            })
            .catch(() => {
              this.showToast("Cannot share via Facebook!");
            });
        });

        break;

      case "twitter":
        this.inapp.isTwSharePDFAvailable().then((success) => {
          avail = success;
          console.log("Share PDF available ? " + avail);
          /*if(!avail){
				this.showAlert('Share PDF', 'Please purchase Share PDF from the In-app purchase tab to continue');
				return;
			}*/

          this.socialSharing
            .shareViaTwitter(fName + " PDF link available", IMG_LINK, pdfurl)
            .then(() => {
              console.log("Twitter done");

              /*self.inapp.updateTwSharePDF().subscribe(units =>{
			  	console.log("updateSharePDF: "+units+"  :left");
			  	self.showToast('You have '+units+' units remaining. ');
			  }); */
            })
            .catch(() => {
              this.showToast("Cannot share via Twitter!");
            });
        });
        break;

      case "whatsapp":
        this.inapp.isWaSharePDFAvailable().then((success) => {
          avail = success;
          console.log("Share PDF available ? " + avail);
          /*if(!avail){
				this.showAlert('Share PDF', 'Please purchase Share PDF from the In-app purchase tab to continue');
				return;
			}*/
          this.socialSharing
            .shareViaWhatsApp(fName + " PDF link available", IMG_LINK, pdfurl)
            .then(() => {
              console.log("WhatsApp done");

              /*self.inapp.updateWaSharePDF().subscribe(units =>{
			  	console.log("updateSharePDF: "+units+"  :left");
			  	self.showToast('You have '+units+' units remaining. ');
			  }); */
            })
            .catch(() => {
              this.showToast("Cannot share via WhatsApp!");
            });
        });
        break;

      case "sms":
        this.inapp.isSmsSharePDFAvailable().then((success) => {
          avail = success;
          console.log("Share PDF available ? " + avail);
          /*if(!avail){
				this.showAlert('Share PDF', 'Please purchase Share PDF from the In-app purchase tab to continue');
				return;
			}*/
          this.socialSharing
            .shareViaSMS(pdfurl, "")
            .then(() => {
              console.log("SMS done");
              /*self.inapp.updateSmsSharePDF().subscribe(units =>{
		      	console.log("updateSharePDF: "+units+"  :left");
		      	self.showToast('You have '+units+' units remaining. ');
		      }); */
            })
            .catch(() => {
              this.showToast("Cannot share via SMS!");
            });
        });
        break;

      default:
        console.log("Share via not mentioned");
        break;
    }
  }

  exportAsCsv() {
    let content = AppGeneral.getCSVContent();
    let email = {
      to: "",
      cc: "",
      subject: APP_NAME + " CSV attached",
      body: content,
      isHtml: true,
    };

    this.emailComposer.open(email).then(() => {
      console.log("Email sent!");
    });
  }

  /** Save to server */
  ionViewWillEnter() {
    this.getSettingsForUser().then((setting) => {
      this.setting = setting;
    });
  }

  getSettingsForUser() {
    return this.localService.getToken().then((token) => {
      if (token != null) {
        return { status: true, label: APP_NAME + " Web" };
      } else {
        return { status: false, label: "Login to Web" };
      }
    });
  }

  saveToServer() {
    let that = this;
    this.localService.getSelectedFile().then((selectedFile) => {
      let name = selectedFile;
      let content = encodeURIComponent(AppGeneral.getSpreadsheetContent());
      if (selectedFile == "Untitled" || selectedFile == "default") {
        let alert = this.alertCtrl
          .create({
            header: "Enter the filename",
            // title: "Enter the filename",
            inputs: [
              {
                name: "name",
                placeholder: "Filename",
              },
            ],
            buttons: [
              {
                text: "Cancel",
                role: "cancel",
                handler: (data) => {
                  console.log("Cancel clicked");
                },
              },
              {
                text: "Save",
                handler: (data) => {
                  if (!this.validateName(data.name)) return;
                  data.name = this.formatString(data.name);
                  console.log("continue saving " + data.name);

                  let args = {
                    appname: APP_NAME,
                    filename: data.name,
                    content: content,
                  };

                  this.request.save.done = false;
                  this.cloudService.saveToServer(args).subscribe(
                    (response) => {
                      this.request.save.done = true;
                      console.log(response);
                      if (response.result == "ok") {
                        that.showToast(data.name + " saved successfully!");
                      } else if (response.result == "fatal") {
                        this.catchFatalError();
                      }
                    },
                    (error) => {
                      this.request.save.done = true;
                      console.log(JSON.stringify(error));
                    }
                  );
                },
              },
            ],
          })
          .then((alertEl) => {
            alertEl.present();
          });
        // alert.present();
      } else {
        // Update File
        let args = {
          appname: APP_NAME,
          filename: name,
          content: content,
        };

        this.request.save.done = false;
        this.cloudService.saveToServer(args).subscribe(
          (response) => {
            this.request.save.done = true;
            console.log(response);
            if (response.result == "ok") {
              that.showToast(name + " saved successfully!");
            } else if (response.result == "fatal") {
              this.catchFatalError();
            }
          },
          (error) => {
            this.request.save.done = true;
            console.log(JSON.stringify(error));
          }
        );
      }
    });
  }

  async toggleSettings(setting) {
    console.log("Toggle: " + setting.status);

    switch (setting.status) {
      case true:
        this.localService.getToken().then((token) => {
          if (token === null) {
            this.modalCtrl
              .create({
                component: LoginModalPage,
              })
              .then((modalEl) => {
                modalEl.present();
                return modalEl.onDidDismiss();
              })
              .then((resultdata) => {
                let action = "";
                // console.log(resultdata.data);
                // console.log("ld");
                let data = resultdata.data;
                if (data.action == "login") action = "Login";
                else action = "Registration";
                if (data.status == "ok" && data.user) {
                  this.setting.label = APP_NAME + " Web";
                  this.setting.status = true;
                  this.showToast(action + " successful!");
                  this.localService.setToken(data.user);
                } else if (data.status == "exists") {
                  this.setting.label = "Login to Web";
                  this.setting.status = false;
                  this.showToast("User already exists.Log in to continue");
                } else if (data.status == "no") {
                  this.setting.label = "Login to Web";
                  this.setting.status = false;
                  this.showToast("User does not exists. Register to continue");
                } else {
                  this.setting.label = "Login to Web";
                  this.setting.status = false;
                  this.showToast(action + " failed.Try again");
                }
              });
          }
        });
        break;

      case false:
        this.localService.getToken().then((token) => {
          if (token == null) {
            this.setting.label = "Login to Web";
            this.setting.status = false;
            return;
          }
          let confirm = this.alertCtrl
            .create({
              header: "Log out?",
              subHeader: "Do you want to Log out?",
              buttons: [
                {
                  text: "Cancel",
                  handler: () => {
                    console.log("Cancel clicked");
                    this.setting.label = APP_NAME + " Web";
                    this.setting.status = true;
                  },
                },
                {
                  text: "Yes",
                  handler: () => {
                    console.log("Yes clicked");
                    this.cloudService.logout().subscribe(
                      (data) => {
                        if (data.result == "ok") {
                          this.showToast("Logout successful!");
                          this.setting.label = "Login to Web";
                          this.localService.deleteToken();
                          this.setting.status = false;
                        }
                      },
                      (error) => {
                        console.log(JSON.stringify(error));
                      }
                    );
                  },
                },
              ],
            })
            .then((alertEl) => {
              alertEl.present();
            });
          // confirm.present();
        });
        break;

      default:
        break;
    }
  }

  catchFatalError() {
    this.setting.label = "Login to Web";
    this.localService.deleteToken();
    this.setting.status = false;
    this.showToast("Session expired. Login to continue");
  }

  /* Logo and Signature */
  addLogo() {
    let alert = this.alertCtrl
      .create({
        header: "Logo",
        subHeader: "Do you want to add or remove logo?",
        // title: "Logo",
        // message: "Do you Add or Remove Logo?",
        buttons: [
          {
            text: "Remove",
            handler: () => {
              console.log("Remove clicked");
              AppGeneral.removeLogo(LOGO[AppGeneral.getDeviceType()]).then(
                (ok: any) => {
                  this.showToast("Logo removed successfully");
                }
              );
            },
          },
          {
            text: "Add",
            handler: () => {
              console.log("Add clicked");
              let confirm = this.alertCtrl
                .create({
                  header: "Complete action using",
                  // title: "Complete action using",
                  subHeader: "Do you want to add image from Camera or Photos?",
                  buttons: [
                    {
                      text: "Camera",
                      handler: () => {
                        console.log("Camera clicked");
                        let options = {
                          quality: 50,
                          destinationType: this.camera.DestinationType.DATA_URL,
                          sourceType: this.camera.PictureSourceType.CAMERA,
                        };
                        this.sendLogoToServer(options);
                      },
                    },
                    {
                      text: "Photos",
                      handler: () => {
                        console.log("Photos clicked");
                        let options = {
                          quality: 50,
                          destinationType: this.camera.DestinationType.DATA_URL,
                          sourceType: this.camera.PictureSourceType
                            .PHOTOLIBRARY,
                        };
                        this.sendLogoToServer(options);
                      },
                    },
                    {
                      text: "Cancel",
                      role: "cancel",
                      handler: () => {
                        console.log("Cancel clicked");
                      },
                    },
                  ],
                })
                .then((alertEl) => {
                  alertEl.present();
                });
              // confirm.present();
            },
          },
          {
            text: "Cancel",
            role: "cancel",
            handler: () => {
              console.log("Cancel clicked");
            },
          },
        ],
      })
      .then((alertEl) => {
        alertEl.present();
      });
    // alert.present();
  }

  sendLogoToServer(options) {
    this.camera.getPicture(options).then(
      (imageData) => {
        // imageData is either a base64 encoded string or a file URI
        // If it's base64:
        if (!imageData) return;
        let base64Image = "data:image/jpeg;base64," + imageData;
        // console.log(base64Image);
        this.request.logo.done = false;
        this.cloudService
          .putLogoURL(APP_NAME, base64Image)
          .subscribe((data) => {
            // console.log(JSON.stringify(data));
            this.request.logo.done = true;
            if (data.result == "ok") {
              this.addLogoToApp(data.imgurl);
            }
          });
      },
      (err) => {
        // Handle error
      }
    );
  }

  addLogoToApp(link) {
    // console.log(link);
    AppGeneral.addLogo(LOGO[AppGeneral.getDeviceType()], link).then((ok) => {
      this.showToast("Logo added successfully");
    });
  }

  /*** Supprt ***/
  write() {
    let email = {
      to: "",
      cc: "",
      subject: APP_NAME + ": Please share your feedback",
      body: "",
      isHtml: true,
    };

    this.emailComposer.open(email).then(() => {
      console.log("Email sent!");
    });
  }

  visit() {
    // window.open('http://aspiringapps.com','_blank');
    let browser = this.iab.create("https://aspiringapps.com");
    setTimeout(() => {
      browser.close();
    }, 3000);
  }

  refer() {
    let alert = this.alertCtrl
      .create({
        header: "Refer to a friend",
        inputs: [
          {
            type: "radio",
            label: "Facebook",
            value: "facebook",
            checked: false,
          },
          {
            type: "radio",
            label: "Twitter",
            value: "twitter",
            checked: false,
          },
          {
            type: "radio",
            label: "Email",
            value: "email",
            checked: false,
          },
        ],
        buttons: [
          {
            text: "Cancel",
            role: "cancel",
            // handler
          },
          {
            text: "Share",
            handler: (shareVia) => {
              this.radioOpen = false;
              this.radioResult = shareVia;
              let content = LINK;
              if (shareVia == "twitter") {
                this.socialSharing
                  .shareViaTwitter(
                    APP_NAME + " on the App Store",
                    "www/assets/img/icon.png",
                    content
                  )
                  .then(() => {
                    console.log("Twitter done");
                  })
                  .catch(() => {
                    // this.showToast('Cannot share via Twitter!');
                  });
              } else if (shareVia == "facebook") {
                this.socialSharing
                  .shareViaFacebook(
                    APP_NAME + " on the App Store",
                    "www/assets/img/icon.png",
                    content
                  )
                  .then(() => {
                    console.log("share via facebook done");
                  })
                  .catch(() => {
                    // this.showToast('Cannot share via Facebook!');
                  });
              } else {
                this.socialSharing
                  .canShareViaEmail()
                  .then(() => {
                    this.socialSharing
                      .shareViaEmail(
                        content,
                        APP_NAME + " on the App Store",
                        null,
                        null,
                        null,
                        null
                      )
                      .then(() => {})
                      .catch(() => {});
                  })
                  .catch(() => {
                    console.log("email failed");
                  });
              }
            },
          },
        ],
      })
      .then((alertEl) => {
        alertEl.present();
      });
    // alert.setTitle("Refer to a friend");

    // alert.addInput({
    //   type: "radio",
    //   label: "Facebook",
    //   value: "facebook",
    //   checked: false,
    // });
    // alert.addInput({
    //   type: "radio",
    //   label: "Twitter",
    //   value: "twitter",
    //   checked: false,
    // });
    // alert.addInput({
    //   type: "radio",
    //   label: "Email",
    //   value: "email",
    //   checked: false,
    // });

    // alert.addButton("Cancel");
    // alert.addButton({
    //   text: "OK",
    //   handler: (shareVia) => {
    //     this.radioOpen = false;
    //     this.radioResult = shareVia;
    //     let content = LINK;
    //     if (shareVia == "twitter") {
    //       this.socialSharing
    //         .shareViaTwitter(
    //           APP_NAME + " on the App Store",
    //           "www/assets/img/icon.png",
    //           content
    //         )
    //         .then(() => {
    //           console.log("Twitter done");
    //         })
    //         .catch(() => {
    //           // this.showToast('Cannot share via Twitter!');
    //         });
    //     } else if (shareVia == "facebook") {
    //       this.socialSharing
    //         .shareViaFacebook(
    //           APP_NAME + " on the App Store",
    //           "www/assets/img/icon.png",
    //           content
    //         )
    //         .then(() => {
    //           console.log("share via facebook done");
    //         })
    //         .catch(() => {
    //           // this.showToast('Cannot share via Facebook!');
    //         });
    //     } else {
    //       this.socialSharing
    //         .canShareViaEmail()
    //         .then(() => {
    //           this.socialSharing
    //             .shareViaEmail(
    //               content,
    //               APP_NAME + " on the App Store",
    //               null,
    //               null,
    //               null,
    //               null
    //             )
    //             .then(() => {})
    //             .catch(() => {});
    //         })
    //         .catch(() => {
    //           console.log("email failed");
    //         });
    //     }
    //   },
    // });
    // alert.present();
  }

  /* Utility functions */
  /********* Show toast starts here *********/
  async showToast(message: string) {
    let toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: "bottom",
    });

    toast.dismiss(() => {
      console.log("Dismissed toast");
    });
    //  toast.onDidDismiss(() => {
    //   console.log("Dismissed toast");
    // });

    toast.present();
  }

  validateName(filename: string) {
    /* Returns true if filename is valid */
    filename = filename.trim();
    if (filename == "default" || filename == "Untitled") {
      this.showToast("Cannot update default file!");
      return false;
    } else if (filename == "" || !filename) {
      this.showToast("Filename cannot be empty");
      return false;
    } else if (filename.length > 30) {
      this.showToast("Filename too long");
      return false;
    } else if (/^[a-zA-Z0-9- ]*$/.test(filename) == false) {
      this.showToast("Special Characters cannot be used");
      return false;
    }
    return true;
  }

  validatePassword(password) {
    password = password.trim();
    if (password == "" || !password) {
      this.showToast("Password cannot be empty");
      return false;
    } else if (password.length > 30) {
      this.showToast("Password too long");
      return false;
    }
    return true;
  }

  formatString(filename) {
    /* Remove whitespaces */
    while (filename.indexOf(" ") != -1) {
      filename = filename.replace(" ", "");
    }
    return filename;
  }

  showAlert(title: any, subtitle: any) {
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

  ngOnInit() {
    console.log("hello");
  }
}
