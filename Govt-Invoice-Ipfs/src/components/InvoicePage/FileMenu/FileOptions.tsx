import React, { useState, useRef, useEffect } from "react";
import {
  IonPopover,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonToast,
} from "@ionic/react";
import {
  addOutline,
  arrowUndo,
  arrowRedo,
  colorPaletteOutline,
  cloudUploadOutline,
} from "ionicons/icons";
import * as AppGeneral from "../socialcalc/index.js";

// import { DATA } from "../../templates.js";
import { useInvoice } from "../../../contexts/InvoiceContext.js";

import { localTemplateService } from "../../../services/local-template-service";


interface FileOptionsProps {
  showActionsPopover: boolean;
  setShowActionsPopover: (show: boolean) => void;
  showColorModal: boolean;
  setShowColorPicker: (show: boolean) => void;
  fileName: string;
  onSaveToIpfs?: () => void;
}

const FileOptions: React.FC<FileOptionsProps> = ({
  showActionsPopover,
  setShowActionsPopover,
  setShowColorPicker,
  onSaveToIpfs,
}) => {

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const actionsPopoverRef = useRef<HTMLIonPopoverElement>(null);

  // Template modal state
  const {
    activeTemplateId, // Get from context
  } = useInvoice();



  const handleUndo = () => {
    AppGeneral.undo();
  };

  const handleRedo = () => {
    AppGeneral.redo();
  };

  const handleNewFileClick = async () => {
    setShowActionsPopover(false);

    try {
      // Check 8-file limit
      const canCreate = await localTemplateService.canCreateInvoice();
      if (!canCreate) {
        setToastMessage(`File limit reached (max ${localTemplateService.maxInvoices}). Please delete some invoices first.`);
        setShowToast(true);
        return;
      }

      let templateId = activeTemplateId;
      if (!templateId) {
        templateId = await localTemplateService.getActiveTemplateId();
      }

      if (templateId) {
        window.location.href = `/app/editor/invoice?template=${templateId}`;
      } else {
        window.location.href = '/app/dashboard/templates';
      }
    } catch (e) {
      window.location.href = '/app/dashboard/templates';
    }
  };



  return (
    <>
      {/* Actions Popover */}
      <IonPopover
        ref={actionsPopoverRef}
        isOpen={showActionsPopover}
        onDidDismiss={() => setShowActionsPopover(false)}
        trigger="actions-trigger"
        side="bottom"
        alignment="end"
        style={{
          '--width': 'auto',
          '--min-width': '180px',
          '--max-width': '250px',
        } as React.CSSProperties}
      >
        <IonContent className="ion-padding-vertical" style={{ '--background': '#ffffff' }}>
          <IonList lines="none" style={{ padding: '0' }}>
            <IonItem button onClick={handleNewFileClick} detail={false}>
              <IonIcon icon={addOutline} slot="start" />
              <IonLabel>New</IonLabel>
            </IonItem>

            {onSaveToIpfs && (
              <IonItem button onClick={() => { setShowActionsPopover(false); onSaveToIpfs(); }} detail={false}>
                <IonIcon icon={cloudUploadOutline} slot="start" style={{ color: '#10b981' }} />
                <IonLabel style={{ color: '#10b981', fontWeight: '500' }}>Save to IPFS</IonLabel>
              </IonItem>
            )}



            <IonItem button onClick={handleUndo} detail={false}>
              <IonIcon icon={arrowUndo} slot="start" />
              <IonLabel>Undo</IonLabel>
            </IonItem>

            <IonItem button onClick={handleRedo} detail={false}>
              <IonIcon icon={arrowRedo} slot="start" />
              <IonLabel>Redo</IonLabel>
            </IonItem>

            <IonItem button onClick={() => setShowColorPicker(true)} detail={false}>
              <IonIcon icon={colorPaletteOutline} slot="start" />
              <IonLabel>Sheet Colors</IonLabel>
            </IonItem>
          </IonList>
        </IonContent>
      </IonPopover>

      {/* Toast for notifications */}
      <IonToast
        isOpen={showToast}
        message={toastMessage}
        duration={3000}
        onDidDismiss={() => setShowToast(false)}
        position="bottom"
      />
    </>
  );
};

export default FileOptions;
