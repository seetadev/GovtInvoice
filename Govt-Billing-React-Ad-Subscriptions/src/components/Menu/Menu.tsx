import React, { useEffect, useState } from "react";
import * as AppGeneral from "../socialcalc/index.js";
import { File, Local } from "../Storage/LocalStorage";
import { isPlatform, IonToast } from "@ionic/react";
import { EmailComposer } from "capacitor-email-composer";
import { Printer } from "@ionic-native/printer";
import { IonActionSheet, IonAlert } from "@ionic/react";
import { saveOutline, save, mail, print } from "ionicons/icons";
import { APP_NAME } from "../../app-data.js";

import {
  canUserPerformAction,
  updateUserQuota,
  updateUserSubscription,
} from "../../firebase/firestore.js";
import useUser from "../../hooks/useUser.js";

const Menu: React.FC<{
  showM: boolean;
  setM: Function;
  file: string;
  updateSelectedFile: Function;
  store: Local;
  bT: number;
}> = (props) => {
  const [showAlert1, setShowAlert1] = useState(false);
  const [showAlert2, setShowAlert2] = useState(false);
  const [showAlert3, setShowAlert3] = useState(false);
  const [showAlert4, setShowAlert4] = useState(false);
  const [showToast1, setShowToast1] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [canPrint, setCanPrint] = useState(false);
  const [canEmail, setCanEmail] = useState(false);
  const { user, isLoading } = useUser();
  const [showUpgradeAlert, setShowUpgradeAlert] = useState(false);

  const handleUpgradeSubscription = async (tier: string) => {
    if (user) {
      try {
        await updateUserSubscription(user.uid, tier);
        setToastMessage(`Successfully upgraded to ${tier} tier!`);
        setShowToast1(true);
        checkUserPermissions();
      } catch (error) {
        console.error("Error upgrading subscription:", error);
        setToastMessage("Failed to upgrade subscription. Please try again.");
        setShowToast1(true);
      }
    } else {
      setToastMessage("Please log in to upgrade your subscription.");
      setShowToast1(true);
    }
  };
  /* Utility functions */
  const _validateName = async (filename) => {
    filename = filename.trim();
    if (filename === "default" || filename === "Untitled") {
      setToastMessage("Cannot update default file!");
      return false;
    } else if (filename === "" || !filename) {
      setToastMessage("Filename cannot be empty");
      return false;
    } else if (filename.length > 30) {
      setToastMessage("Filename too long");
      return false;
    } else if (/^[a-zA-Z0-9- ]*$/.test(filename) === false) {
      setToastMessage("Special Characters cannot be used");
      return false;
    } else if (await props.store._checkKey(filename)) {
      setToastMessage("Filename already exists");
      return false;
    }
    return true;
  };

  const getCurrentFileName = () => {
    return props.file;
  };

  const _formatString = (filename) => {
    /* Remove whitespaces */
    while (filename.indexOf(" ") !== -1) {
      filename = filename.replace(" ", "");
    }
    return filename;
  };
  useEffect(() => {
    checkUserPermissions();
  }, [isLoading]);

  const checkUserPermissions = async () => {
    if (user) {
      const printPermission = await canUserPerformAction(user.uid, "print");
      const emailPermission = await canUserPerformAction(user.uid, "email");
      setCanPrint(printPermission);
      setCanEmail(emailPermission);
    }
  };

  const doPrint = async () => {
    if (!canPrint) {
      setToastMessage("You've reached your print quota limit.");
      setShowToast1(true);
      return;
    }

    if (user) {
      const updated = await updateUserQuota(user.uid, "print");
      if (!updated) {
        setToastMessage(
          "Failed to update quota. You may have reached your limit."
        );
        setShowToast1(true);
        return;
      }
    }

    if (isPlatform("hybrid")) {
      const printer = Printer;
      printer.print(AppGeneral.getCurrentHTMLContent());
    } else {
      const content = AppGeneral.getCurrentHTMLContent();
      const printWindow = window.open("/printwindow", "Print Invoice");
      printWindow.document.write(content);
      printWindow.print();
    }

    setToastMessage("Print job sent successfully.");
    setShowToast1(true);
    checkUserPermissions(); // Update permissions after printing
  };

  const doSave = () => {
    if (props.file === "default") {
      setShowAlert1(true);
      return;
    }
    const content = encodeURIComponent(AppGeneral.getSpreadsheetContent());
    const data = props.store._getFile(props.file);
    const file = new File(
      (data as any).created,
      new Date().toString(),
      content,
      props.file,
      props.bT
    );
    props.store._saveFile(file);
    props.updateSelectedFile(props.file);
    setShowAlert2(true);
  };

  const doSaveAs = async (filename) => {
    // event.preventDefault();
    if (filename) {
      // console.log(filename, _validateName(filename));
      if (await _validateName(filename)) {
        // filename valid . go on save
        const content = encodeURIComponent(AppGeneral.getSpreadsheetContent());
        // console.log(content);
        const file = new File(
          new Date().toString(),
          new Date().toString(),
          content,
          filename,
          props.bT
        );
        // const data = { created: file.created, modified: file.modified, content: file.content, password: file.password };
        // console.log(JSON.stringify(data));
        props.store._saveFile(file);
        props.updateSelectedFile(filename);
        setShowAlert4(true);
      } else {
        setShowToast1(true);
      }
    }
  };

  const sendEmail = async () => {
    if (!canEmail) {
      setToastMessage("You've reached your email quota limit.");
      setShowToast1(true);
      return;
    }

    if (user) {
      const updated = await updateUserQuota(user.uid, "email");
      if (!updated) {
        setToastMessage(
          "Failed to update quota. You may have reached your limit."
        );
        setShowToast1(true);
        return;
      }
    }

    if (isPlatform("hybrid")) {
      const content = AppGeneral.getCurrentHTMLContent();
      const base64 = btoa(content);

      EmailComposer.open({
        to: ["jackdwell08@gmail.com"],
        cc: [],
        bcc: [],
        body: "PFA",
        attachments: [{ type: "base64", path: base64, name: "Invoice.html" }],
        subject: `${APP_NAME} attached`,
        isHtml: true,
      });

      setToastMessage("Email sent successfully.");
      setShowToast1(true);
    } else {
      setToastMessage("This functionality works on Android/iOS devices only.");
      setShowToast1(true);
    }

    checkUserPermissions();
  };

  return (
    <React.Fragment>
      <IonActionSheet
        animated
        keyboardClose
        isOpen={props.showM}
        onDidDismiss={() => props.setM()}
        buttons={[
          {
            text: "Save",
            icon: saveOutline,
            handler: () => {
              doSave();
              console.log("Save clicked");
            },
          },
          {
            text: "Save As",
            icon: save,
            handler: () => {
              setShowAlert3(true);
              console.log("Save As clicked");
            },
          },
          {
            text: "Print",
            icon: print,
            handler: () => {
              doPrint();
              console.log("Print clicked");
            },
          },
          {
            text: "Email",
            icon: mail,
            handler: () => {
              sendEmail();
              console.log("Email clicked");
            },
          },
          {
            text: "Upgrade Subscription",
            icon: "arrow-up-circle-outline",
            handler: () => {
              setShowUpgradeAlert(true);
              console.log("Upgrade Subscription clicked");
            },
          },
        ]}
      />
      <IonAlert
        animated
        isOpen={showAlert1}
        onDidDismiss={() => setShowAlert1(false)}
        header="Alert Message"
        message={
          "Cannot update <strong>" + getCurrentFileName() + "</strong> file!"
        }
        buttons={["Ok"]}
      />
      <IonAlert
        animated
        isOpen={showAlert2}
        onDidDismiss={() => setShowAlert2(false)}
        header="Save"
        message={
          "File <strong>" +
          getCurrentFileName() +
          "</strong> updated successfully"
        }
        buttons={["Ok"]}
      />
      <IonAlert
        animated
        isOpen={showAlert3}
        onDidDismiss={() => setShowAlert3(false)}
        header="Save As"
        inputs={[
          { name: "filename", type: "text", placeholder: "Enter filename" },
        ]}
        buttons={[
          {
            text: "Ok",
            handler: (alertData) => {
              doSaveAs(alertData.filename);
            },
          },
        ]}
      />
      <IonAlert
        animated
        isOpen={showAlert4}
        onDidDismiss={() => setShowAlert4(false)}
        header="Save As"
        message={
          "File <strong>" +
          getCurrentFileName() +
          "</strong> saved successfully"
        }
        buttons={["Ok"]}
      />
      <IonAlert
        animated
        isOpen={showUpgradeAlert}
        onDidDismiss={() => setShowUpgradeAlert(false)}
        header="Upgrade Subscription"
        message="Choose a subscription tier to upgrade:"
        buttons={[
          {
            text: "Bronze ($150/month)",
            handler: () => handleUpgradeSubscription("bronze"),
          },
          {
            text: "Silver ($200/month)",
            handler: () => handleUpgradeSubscription("silver"),
          },
          {
            text: "Gold ($250/month)",
            handler: () => handleUpgradeSubscription("gold"),
          },
          {
            text: "Cancel",
            role: "cancel",
          },
        ]}
      />
      <IonToast
        animated
        isOpen={showToast1}
        onDidDismiss={() => {
          setShowToast1(false);
          setShowAlert3(true);
        }}
        position="bottom"
        message={toastMessage}
        duration={500}
      />
    </React.Fragment>
  );
};

export default Menu;
