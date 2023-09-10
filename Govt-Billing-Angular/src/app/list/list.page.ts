import { Router } from "@angular/router";
import { AlertController } from "@ionic/angular";
import { ToastController } from "@ionic/angular";
import { CloudServiceService } from "./../cloud-service.service";
import { LocalServiceService, File } from "./../local-service.service";
import { NavController, ActionSheetController } from "@ionic/angular";
import { Component, OnInit } from "@angular/core";
import { DATA, APP_NAME } from "./../app-data";
import * as AppGeneral from "socialcalc/AppGeneral";

@Component({
  selector: "app-list",
  templateUrl: "./list.page.html",
  styleUrls: ["./list.page.scss"],
})
export class ListPage implements OnInit {
  deviceFiles: any = [];
  filesSegment: any;
  selectClicked: any;
  activeSegment: any;
  cachedList: any = [];
  msc: any;
  request: any = {};
  cloudFiles: any = [];

  constructor(
    public navCtrl: NavController,
    public localService: LocalServiceService,
    public cloudService: CloudServiceService,
    public actionSheetCtrl: ActionSheetController,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    private router: Router
  ) {
    this.filesSegment = "local";
    this.activeSegment = "local";
    this.request.done = true;
    this.selectClicked = false;
    this.msc = DATA["home"][AppGeneral.getDeviceType()]["msc"];
  }

  ngOnInit() {}

  loadLocalFiles() {
    this.activeSegment = "local";
    this.localService.getAllFiles().then(
      (data) => {
        // console.log(JSON.stringify(data));
        this.deviceFiles = data;
      },
      (err) => console.log(err)
    );
  }

  loadServerFiles() {
    this.activeSegment = "server";

    if (this.cloudFiles != "") {
      // alert(JSON.stringify(this.cloudFiles));
      this.cachedList = this.cloudFiles;
      return this.cloudFiles;
    }

    this.request.done = false;
    this.cloudService.listFiles(APP_NAME).subscribe(
      (data) => {
        this.request.done = true;
        // console.log(data);
        if (data.result == "ok") {
          let serverFiles = data.data;
          // console.log(JSON.stringify(serverFiles));
          for (var i in data.data) {
            // console.log(i);
            let name = i;
            console.log(name);
            let res = decodeURIComponent(serverFiles[i]);
            // console.log(res);
            var fileobj = JSON.parse(res);
            var timestamp = new Date().toLocaleString();
            if (fileobj["timestamp"]) {
              timestamp = new Date(fileobj["timestamp"]).toLocaleString();
            }
            this.cloudFiles.push({
              name: name,
              timestamp: timestamp,
              checked: false,
              data: serverFiles[i],
            });
            // console.log("cloud: "+JSON.stringify(this.cloudFiles));
          }
          // console.log("cloud: "+JSON.stringify(this.cloudFiles));
          this.cachedList = this.cloudFiles;
          return this.cloudFiles;
        } else if (data.result == "fatal") {
          // return data.result;
          this.catchFatalError();
        }
      },
      (error) => {
        this.request.done = true;
        console.log(JSON.stringify(error));
      }
    );
  }

  ionViewWillEnter() {
    this.loadLocalFiles();
  }

  selectTab(index: number) {
    // var t: Tabs = this.navCtrl.parent;
    // setTimeout(() => {
    //   t.select(index);
    // }, 2000);
    this.router.navigateByUrl("/tabs/home");
  }

  editFile(file) {
    if (this.filesSegment == "local") {
      if (file == "default") {
        AppGeneral.viewFile("default", JSON.stringify(this.msc));
        this.localService.setSelectedFile(file);
        this.showToast("Loading file " + file + "...");
        this.router.navigateByUrl("/tabs/home");

        // this.selectTab(0);
      } else {
        this.localService.getPassword(file).then((hasPassword) => {
          if (hasPassword === undefined) {
            console.log("Is not password protected");
            this.localService.getFile(file).then((data) => {
              AppGeneral.viewFile(file, decodeURIComponent(data.content));
              this.localService.setSelectedFile(file);
              this.showToast("Loading file " + file + "...");
              this.router.navigateByUrl("/tabs/home");

              // this.selectTab(0);
            });
          } else {
            let alert = this.alertCtrl
              .create({
                header: "Enter password",
                inputs: [
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
                    text: "Ok",
                    handler: (data) => {
                      if (data.password == hasPassword) {
                        console.log("Password is correct");
                        this.localService.getFile(file).then((data) => {
                          AppGeneral.viewFile(
                            file,
                            decodeURIComponent(data.content)
                          );
                          this.localService.setSelectedFile(file);
                          this.showToast("Loading file " + file + "...");
                          this.router.navigateByUrl("/tabs/home");

                          // this.selectTab(0);
                        });
                      } else {
                        console.log("Password is incorrect");
                        this.showToast("Incorrect password. Try again! ");
                      }
                    },
                  },
                ],
              })
              .then((alertEl) => {
                alertEl.present();
              });
            // alert.present();
          }
        });
      }
    } else {
      this.showToast("Move file to local to edit");
    }
  }
  deleteFile(file) {
    if (this.filesSegment == "local") {
      if (file == "default") {
        this.showToast("Cannot delete default file!");
        return false;
      }

      let alert = this.alertCtrl
        .create({
          header: "Cofirm delete",
          // title: "Confirm delete",
          message: "Do you want to delete this file?",
          buttons: [
            {
              text: "Cancel",
              role: "cancel",
              handler: () => {
                console.log("Cancel clicked");
              },
            },
            {
              text: "Delete",
              handler: () => {
                console.log("Delete clicked");
                this.localService.getPassword(file).then((hasPassword) => {
                  if (hasPassword === undefined) {
                    console.log("Is not password protected");
                    this.localService.deleteFile(file);
                    setTimeout(() => {
                      this.loadLocalFiles();
                    }, 1000);
                    this.showToast(file + " deleted successfully!");
                    AppGeneral.viewFile("default", JSON.stringify(this.msc));
                    this.localService.setSelectedFile("default");
                  } else {
                    let alert = this.alertCtrl
                      .create({
                        header: "Enter password",
                        inputs: [
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
                            text: "Ok",
                            handler: (data) => {
                              if (data.password == hasPassword) {
                                console.log("Password is correct");
                                this.localService.deleteFile(file);
                                setTimeout(() => {
                                  this.loadLocalFiles();
                                }, 1000);
                                this.showToast(file + " deleted successfully!");
                                AppGeneral.viewFile(
                                  "default",
                                  JSON.stringify(this.msc)
                                );
                                this.localService.setSelectedFile("default");
                              } else {
                                console.log("Password is incorrect");
                                this.showToast(
                                  "Incorrect password. Try again! "
                                );
                              }
                            },
                          },
                        ],
                      })
                      .then((alertEl) => {
                        alertEl.present();
                      });
                    // alert.present();
                  }
                });
              },
            },
          ],
        })
        .then((alertEl) => {
          alertEl.present();
        });
      // alert.present();
    } else {
      let alert = this.alertCtrl
        .create({
          header: "Confirm delete",
          message: "Do you want to delete this file?",
          buttons: [
            {
              text: "Cancel",
              role: "cancel",
              handler: () => {
                console.log("Cancel clicked");
              },
            },
            {
              text: "Delete",
              handler: () => {
                console.log("Delete clicked");
                this.request.done = false;
                this.cloudService.deleteFile(file, APP_NAME).subscribe(
                  (data) => {
                    this.request.done = true;
                    console.log(data.result);
                    if (data.result == "ok") {
                      this.showToast("Delete successful");
                      let index = 0;
                      for (var i in this.cloudFiles) {
                        if (this.cloudFiles[i].name == file) {
                          console.log("Found " + file);
                          this.cloudFiles.splice(index, 1);
                        }
                        index++;
                      }
                      // this.loadServerFiles();
                    }
                    if (data.result == "fatal") {
                      this.catchFatalError();
                    }
                  },
                  (error) => {
                    this.request.done = true;
                    console.log(JSON.stringify(error));
                  }
                );
              },
            },
          ],
        })
        .then((alterEl) => {
          alterEl.present();
        });
      // alert.present();
    }
  }

  showActionForFile(file) {
    let actionSheet = this.actionSheetCtrl
      .create({
        header: "More Options",
        buttons: [
          {
            text: "Delete",
            role: "destructive",
            handler: () => {
              console.log("delete clicked");
              this.deleteFile(file.name);
            },
          },
          {
            text: "Edit",
            handler: () => {
              console.log("edit clicked");
              this.editFile(file.name);
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
      .then((actionEl) => {
        actionEl.present();
      });
    // actionSheet.present();
  }

  getResults(ev: any) {
    if (this.filesSegment == "local") {
      this.localService.getAllFiles().then(
        (data) => {
          // console.log(JSON.stringify(data));
          this.deviceFiles = data;
          let val = ev.target.value;
          // if the value is an empty string don't filter the items
          if (val && val.trim() != "") {
            this.deviceFiles = this.deviceFiles.filter((item) => {
              return item.name.toLowerCase().indexOf(val.toLowerCase()) > -1;
            });
          }
        },
        (err) => console.log(err)
      );
    } else {
      this.cloudFiles = this.cachedList;
      let val = ev.target.value;
      // if the value is an empty string don't filter the items
      if (val && val.trim() != "") {
        this.cloudFiles = this.cloudFiles.filter((item) => {
          return item.name.toLowerCase().indexOf(val.toLowerCase()) > -1;
        });
      }
    }
  }

  doRefresh(refresher) {
    let action = this.filesSegment;

    console.log("Begin async operation for ", action);

    if (action == "local") {
      this.localService.getAllFiles().then(
        (data) => {
          // console.log(JSON.stringify(data));
          this.deviceFiles = data;
          refresher.complete();
        },
        (err) => console.log(err)
      );
    } else {
      this.cloudFiles = [];
      this.loadServerFiles();
      setTimeout(() => {
        // console.log('Async operation has ended');
        refresher.complete();
      }, 2000);
    }
  }

  moveToServer() {
    let that = this;
    let oldList = this.deviceFiles;
    let fileNames = [];
    for (var i in oldList) {
      if (oldList[i].checked == true && oldList[i].name != "default") {
        fileNames.push(oldList[i].name);
      }
    }
    let filesData: any = {};
    for (let i in fileNames) {
      this.localService.getFile(fileNames[i]).then((data) => {
        // console.log(JSON.stringify(data));
        filesData[fileNames[i]] = data.content;
      });
    }
    setTimeout(() => {
      // console.log(filesData);
      this.request.done = false;
      this.cloudService.saveMultiple(APP_NAME, filesData).subscribe(
        (data) => {
          that.request.done = true;
          console.log(data.length);
          if (data.result == "fatal") {
            that.catchFatalError();
          }
          that.showToast("Files successfully saved!");
        },
        (error) => {
          this.request.done = true;
          console.log(JSON.stringify(error));
        }
      );
    }, 1000);
  }

  moveToLocal() {
    let that = this;
    let oldList = this.cloudFiles;
    let fileNames = [];
    for (let i in oldList) {
      if (oldList[i].checked == true && oldList[i].name != "default") {
        fileNames.push(oldList[i].name);
      }
    }

    (function saveFilesToLocal(fileNames) {
      if (fileNames.length != 0) {
        let filename = fileNames.pop(); // file to copy
        //console.log(filename);
        var isExistsInLocal = function (filename) {
          for (let i in that.deviceFiles) {
            if (filename == that.deviceFiles[i].name) {
              return true;
            }
          }
          return false;
        };

        var doSave = function (filename) {
          for (let i in that.cloudFiles) {
            if (filename == that.cloudFiles[i].name) {
              console.log("saving " + filename + " to local");
              let content = that.cloudFiles[i].data;
              let modified = new Date(
                JSON.parse(decodeURIComponent(content))["timestamp"]
              ).toString();
              that.localService.saveFile(
                new File(new Date().toString(), modified, content, filename)
              );
              that.showToast(filename + " saved successfully");
              saveFilesToLocal(fileNames);
            }
          }
        };

        if (isExistsInLocal(filename)) {
          console.log(filename + " exists in local.Overwrite?");
          let confirm = that.alertCtrl
            .create({
              header: "Overwrite",
              message:
                filename +
                " exists in local. Do you want to overwrite this file?",
              buttons: [
                {
                  text: "No",
                  role: "cancel",
                  handler: () => {
                    console.log("No clicked. Moving on...");
                    saveFilesToLocal(fileNames);
                  },
                },
                {
                  text: "Yes",
                  handler: () => {
                    console.log("Yes clicked. Carry on...");
                    doSave(filename);
                  },
                },
              ],
            })
            .then((alertEl) => {
              alertEl.present();
            });
          // confirm.present();
        } else {
          doSave(filename);
        }
      }
    })(fileNames);
  }

  async showToast(message) {
    let toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: "bottom",
    });

    toast.dismiss(() => {
      console.log("Dismissed toast");
    });

    toast.present();
  }

  catchFatalError() {
    this.localService.deleteToken();
    this.showToast("Session expired. Login to continue");
  }
}
