// NewFile.tsx

import React, { useState } from "react";
import * as AppGeneral from "../socialcalc/index.js";
import { File, Local } from "../Storage/LocalStorage";
import { DATA } from "../../app-data.js";
import { IonAlert, IonIcon } from "@ionic/react";
import { add } from "ionicons/icons";

const NewFile: React.FC<{
  file: string;
  updateSelectedFile: Function;
  store: Local;
  billType: number;
}> = (props) => {
  const [showAlertNewFileCreated, setShowAlertNewFileCreated] = useState(false);

  // FIX: async so we can await _getFile and _saveFile before resetting the editor
  const newFile = async () => {
    if (props.file !== "default") {
      const content = encodeURIComponent(AppGeneral.getSpreadsheetContent());

      // FIX: await the async read; previously this was an unresolved Promise
      const existingData = await props.store._getFile(props.file);

      if (existingData === null) {
        // FIX: null-guard — storage entry missing or corrupted; log and skip persist
        console.warn(
          `[NewFile] _getFile returned null for "${props.file}". Skipping persist.`
        );
      } else {
        const file = new File(
          existingData.created,   // preserve original created timestamp
          new Date().toString(),  // refresh modified
          content,
          props.file,
          props.billType
        );

        // FIX: await the write so the current file is fully persisted
        // before the editor is reset below — eliminates the race condition
        await props.store._saveFile(file);
        props.updateSelectedFile(props.file);
      }
    }

    // Reset happens only after the current file has been safely written
    const msc = DATA["home"][AppGeneral.getDeviceType()]["msc"];
    AppGeneral.viewFile("default", JSON.stringify(msc));
    props.updateSelectedFile("default");
    setShowAlertNewFileCreated(true);
  };

  return (
    <React.Fragment>
      <IonIcon
        icon={add}
        slot="end"
        className="ion-padding-end"
        size="large"
        onClick={() => {
          newFile();
        }}
      />
      <IonAlert
        animated
        isOpen={showAlertNewFileCreated}
        onDidDismiss={() => setShowAlertNewFileCreated(false)}
        header="Alert Message"
        message={"New file created!"}
        buttons={["Ok"]}
      />
    </React.Fragment>
  );
};

export default NewFile;