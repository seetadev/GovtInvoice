import { ModalController } from "@ionic/angular";
import { CloudServiceService } from "./../cloud-service.service";
import { NavController } from "@ionic/angular";
import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { APP_NAME } from "../app-data";

@Component({
  selector: "app-login-modal",
  templateUrl: "./login-modal.page.html",
  styleUrls: ["./login-modal.page.scss"],
})
export class LoginModalPage implements OnInit {
  loginForm: FormGroup;
  emailChanged: boolean = false;
  passwordChanged: boolean = false;
  status: any = {};
  request: any = {};
  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public formBuilder: FormBuilder,
    public cloudService: CloudServiceService
  ) {
    this.loginForm = formBuilder.group({
      email: ["", Validators.required],
      password: ["", Validators.required],
    });

    this.cloudService = cloudService;
    this.request.done = true;
  }

  ngOnInit() {}

  ionViewDidLoad() {
    // console.log('Hello LoginModalPage Page');
  }

  // dismiss() {
  //   console.log("Dismissing modal with data: " + JSON.stringify(this.status));
  //   if (!this.status) {
  //     this.modalCtrl.dismiss("");
  //   } else {
  //     this.modalCtrl.dismiss(this.status);
  //   }
  // }

  onCancel() {
    this.modalCtrl.dismiss(null, "cancel");
  }
  doAction(action: string) {
    let appname = APP_NAME;
    let emailadd = this.loginForm.value.email;
    emailadd = emailadd.toLowerCase();
    console.log(emailadd);
    let data = {
      email: emailadd,
      password: this.loginForm.value.password,
      appname: appname,
    };
    console.log(JSON.stringify(data));
    this.request.done = false;
    this.cloudService.auth(data, action).subscribe(
      (success) => {
        this.request.done = true;
        console.log("Auth: " + JSON.stringify(success));
        let result = success.result;
        this.status = { status: result, user: success.user, action: action };
        // this.dismiss();
        console.log(
          "Dismissing modal with data: " + JSON.stringify(this.status)
        );

        this.modalCtrl.dismiss({
          loginData: {
            status: result,
            user: success.user,
            action: action,
          },
        });
      },
      (error) => {
        console.log(JSON.stringify(error));
        this.request.done = true;
        console.log(
          "Dismissing modal with data: " + JSON.stringify(this.status)
        );

        // this.dismiss();
        this.modalCtrl.dismiss({
          loginData: {
            status: "",
            user: "",
            action: action,
          },
        });
      }
    );
  }
}
