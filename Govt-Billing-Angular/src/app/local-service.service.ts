import { Storage } from "@ionic/storage";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { DATA } from "./app-data";
// import { IonicStorageModule } from "@ionic/Storage";

@Injectable({
  providedIn: "root",
})
export class File {
  created: string;
  modified: string;
  name: string;
  content: string;
  password: string;
  constructor(
    created: string,
    modified: string,
    content: string,
    name: string,
    password?: string
  ) {
    this.created = created;
    this.modified = modified;
    this.content = content;
    this.name = name;
    this.password = password;
  }
}

@Injectable({
  providedIn: "root",
})
export class LocalServiceService {
  public selectedFile: string;
  public token: string;

  constructor(public http: HttpClient, public storage: Storage) {
    this.storage = storage;
    this.getSelectedFile().then((selectedFile) => {
      this.selectedFile = selectedFile;
    });
    this.token = null;
  }

  saveFile(file: File) {
    // console.log(file.password);
    let fileData = {
      created: file.created,
      modified: file.modified,
      content: file.content,
      password: file.password,
    };
    this.storage.set(file.name, fileData);
  }

  getAllFiles() {
    var files = new Array();

    this.storage.forEach((value, key, index) => {
      // console.log(JSON.stringify(value));
      switch (key) {
        case "selectedFile":
        case "choice":
        case "inapplocal":
        case "token":
        case "cloudInapp":
        case "cellArray":
        case "logoArray":
        case "inapp":
        case "imgs":
        case "didTutorial":
        case "share":
        case "flag":
        case "inappPurchase":
        case "cloudInapp":
        case "sk_receiptForProduct":
        case "sk_receiptForTransaction":
          // do nothing...
          break;

        default:
          if (!value.password) {
            files.push({
              name: key,
              created: value.created,
              modified: new Date(value.modified).toLocaleString(),
              content: decodeURIComponent(value.content),
              password: false,
            });
          } else {
            files.push({
              name: key,
              created: value.created,
              modified: new Date(value.modified).toLocaleString(),
              content: decodeURIComponent(value.content),
              password: value.password,
            });
          }
          break;
      }
    });

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // console.log(JSON.stringify(files));
        files.push({
          name: "default",
          created: new Date().toLocaleString(),
          modified: new Date().toLocaleString(),
          content: JSON.stringify(
            // DATA["home"][AppGeneral.getDeviceType()]["msc"]
            DATA["home"]["android"]["msc"]
          ),
        });
        resolve(files);
      }, 500);
    });
  }

  getFile(name: string) {
    return this.storage.get(name);
  }

  deleteFile(name: string) {
    this.storage.remove(name);
  }

  getPassword(name: string) {
    // console.log("filename is=> "+name);
    return this.storage.forEach((value, key, index) => {
      if (key == name) {
        // console.log("Key is=> " + key);
        // console.log(value.password === undefined);
        return value.password;
      }
    });
  }

  setSelectedFile(selectedFile) {
    this.storage.set("selectedFile", selectedFile);
    this.selectedFile = selectedFile;
    // console.log("selectedFile updated: "+selectedFile);
  }

  getSelectedFile() {
    return this.storage.get("selectedFile").then((name) => {
      if (!name) {
        this.storage.set("selectedFile", "default");
        name = "default";
      }
      this.selectedFile = name;
      return this.selectedFile;
    });
  }

  getToken() {
    return this.storage.get("token").then((token) => {
      if (!token) {
        this.token = null;
        return null;
      } else {
        this.token = token;
        return this.token;
      }
    });
  }

  setToken(token) {
    this.storage.set("token", token);
    this.token = token;
    console.log("token updated: " + token);
  }

  deleteToken() {
    this.storage.remove("token");
  }
}
