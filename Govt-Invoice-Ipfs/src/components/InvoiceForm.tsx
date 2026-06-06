import React, { useState, useEffect } from "react";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonButtons,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonToast,
  IonItemDivider,
  IonTextarea,
  IonFab,
  IonFabButton,
} from "@ionic/react";
import { close, save, add, trash } from "ionicons/icons";
import {
  addInvoiceData,
  clearInvoiceData,
} from "./InvoicePage/socialcalc/modules/invoice.js";
import "./InvoiceForm.css";

interface InvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface InvoiceItem {
  description: string;
  amount: string;
}

interface InvoiceFormData {
  billTo: {
    name: string;
    streetAddress: string;
    cityStateZip: string;
    phone: string;
    email: string;
  };
  from: {
    name: string;
    streetAddress: string;
    cityStateZip: string;
    phone: string;
    email: string;
  };
  invoice: {
    number: string;
    date: string;
  };
  items: InvoiceItem[];
  total: string;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<InvoiceFormData>({
    billTo: {
      name: "",
      streetAddress: "",
      cityStateZip: "",
      phone: "",
      email: "",
    },
    from: {
      name: "",
      streetAddress: "",
      cityStateZip: "",
      phone: "",
      email: "",
    },
    invoice: {
      number: "",
      date: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
    },
    items: [{ description: "", amount: "" }],
    total: "",
  });

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState<
    "success" | "danger" | "warning"
  >("success");

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm(false); // Silent reset when modal opens
    }
  }, [isOpen]);

  // Calculate total whenever items change
  useEffect(() => {
    const total = formData.items.reduce((sum, item) => {
      const amount = parseFloat(item.amount) || 0;
      return sum + amount;
    }, 0);
    setFormData((prev) => ({
      ...prev,
      total: total.toFixed(2),
    }));
  }, [formData.items]);

  const showToastMessage = (
    message: string,
    color: "success" | "danger" | "warning" = "success"
  ) => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const resetForm = (showMessage: boolean = true) => {
    setFormData({
      billTo: {
        name: "",
        streetAddress: "",
        cityStateZip: "",
        phone: "",
        email: "",
      },
      from: {
        name: "",
        streetAddress: "",
        cityStateZip: "",
        phone: "",
        email: "",
      },
      invoice: {
        number: "",
        date: new Date().toISOString().split("T")[0],
      },
      items: [{ description: "", amount: "" }],
      total: "",
    });
    if (showMessage) {
      showToastMessage("Form reset to default values", "success");
    }
  };

  const handleInputChange = (
    section: keyof InvoiceFormData,
    field: string,
    value: string
  ) => {
    if (section === "items") {
      return; // Items are handled separately
    }

    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value,
      },
    }));
  };

  const handleItemChange = (
    index: number,
    field: "description" | "amount",
    value: string
  ) => {
    const updatedItems = formData.items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const addItem = () => {
    if (formData.items.length >= 13) {
      showToastMessage("Maximum 13 items allowed", "warning");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", amount: "" }],
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        items: updatedItems,
      }));
    }
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!formData.billTo.name && !formData.from.name) {
        showToastMessage(
          "Please fill in at least Bill To or From name",
          "warning"
        );
        return;
      }

      await addInvoiceData(formData);
      showToastMessage("Invoice data saved successfully!", "success");

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setToastMessage("Failed to save invoice data. Please try again.");
      setToastColor("danger");
      setShowToast(true);
    }
  };

  const handleClear = async () => {
    try {
      await clearInvoiceData();
      // Reset form to initial state
      setFormData({
        billTo: {
          name: "",
          streetAddress: "",
          cityStateZip: "",
          phone: "",
          email: "",
        },
        from: {
          name: "",
          streetAddress: "",
          cityStateZip: "",
          phone: "",
          email: "",
        },
        invoice: {
          number: "",
          date: new Date().toISOString().split("T")[0],
        },
        items: [{ description: "", amount: "" }],
        total: "",
      });
      showToastMessage("Invoice data cleared successfully!", "success");
    } catch (error) {
      setToastMessage("Failed to clear invoice data");
      setToastColor("danger");
      setShowToast(true);
    }
  };

  return (
    <>
      <IonModal
        isOpen={isOpen}
        onDidDismiss={onClose}
        className="invoice-form-modal"
      >
        <IonHeader>
          <IonToolbar color="primary">
            <IonTitle>Invoice Form</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={onClose}>
                <IonIcon icon={close} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="invoice-form-content">
          <IonGrid>
            {/* Bill To Section */}
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Bill To</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList>
                  <IonItem>
                    <IonLabel position="stacked">Name</IonLabel>
                    <IonInput
                      value={formData.billTo.name}
                      onIonInput={(e) =>
                        handleInputChange("billTo", "name", e.detail.value!)
                      }
                      placeholder="Enter name"
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Street Address</IonLabel>
                    <IonInput
                      value={formData.billTo.streetAddress}
                      onIonInput={(e) =>
                        handleInputChange(
                          "billTo",
                          "streetAddress",
                          e.detail.value!
                        )
                      }
                      placeholder="Enter street address"
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">City, State, ZIP</IonLabel>
                    <IonInput
                      value={formData.billTo.cityStateZip}
                      onIonInput={(e) =>
                        handleInputChange(
                          "billTo",
                          "cityStateZip",
                          e.detail.value!
                        )
                      }
                      placeholder="Enter city, state, ZIP"
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Phone</IonLabel>
                    <IonInput
                      value={formData.billTo.phone}
                      onIonInput={(e) =>
                        handleInputChange("billTo", "phone", e.detail.value!)
                      }
                      placeholder="Enter phone number"
                      type="tel"
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Email</IonLabel>
                    <IonInput
                      value={formData.billTo.email}
                      onIonInput={(e) =>
                        handleInputChange("billTo", "email", e.detail.value!)
                      }
                      placeholder="Enter email address"
                      type="email"
                    />
                  </IonItem>
                </IonList>
              </IonCardContent>
            </IonCard>

            {/* From Section */}
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>From</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList>
                  <IonItem>
                    <IonLabel position="stacked">Name</IonLabel>
                    <IonInput
                      value={formData.from.name}
                      onIonInput={(e) =>
                        handleInputChange("from", "name", e.detail.value!)
                      }
                      placeholder="Enter name"
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Street Address</IonLabel>
                    <IonInput
                      value={formData.from.streetAddress}
                      onIonInput={(e) =>
                        handleInputChange(
                          "from",
                          "streetAddress",
                          e.detail.value!
                        )
                      }
                      placeholder="Enter street address"
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">City, State, ZIP</IonLabel>
                    <IonInput
                      value={formData.from.cityStateZip}
                      onIonInput={(e) =>
                        handleInputChange(
                          "from",
                          "cityStateZip",
                          e.detail.value!
                        )
                      }
                      placeholder="Enter city, state, ZIP"
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Phone</IonLabel>
                    <IonInput
                      value={formData.from.phone}
                      onIonInput={(e) =>
                        handleInputChange("from", "phone", e.detail.value!)
                      }
                      placeholder="Enter phone number"
                      type="tel"
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Email</IonLabel>
                    <IonInput
                      value={formData.from.email}
                      onIonInput={(e) =>
                        handleInputChange("from", "email", e.detail.value!)
                      }
                      placeholder="Enter email address"
                      type="email"
                    />
                  </IonItem>
                </IonList>
              </IonCardContent>
            </IonCard>

            {/* Invoice Information */}
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Invoice Information</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList>
                  <IonItem>
                    <IonLabel position="stacked">Invoice Number</IonLabel>
                    <IonInput
                      value={formData.invoice.number}
                      onIonInput={(e) =>
                        handleInputChange("invoice", "number", e.detail.value!)
                      }
                      placeholder="Enter invoice number"
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Date</IonLabel>
                    <IonInput
                      value={formData.invoice.date}
                      onIonInput={(e) =>
                        handleInputChange("invoice", "date", e.detail.value!)
                      }
                      type="date"
                    />
                  </IonItem>
                </IonList>
              </IonCardContent>
            </IonCard>

            {/* Items Section */}
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Items ({formData.items.length}/13)</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {formData.items.map((item, index) => (
                  <div key={index} className="invoice-item">
                    <IonRow>
                      <IonCol size="7">
                        <IonItem>
                          <IonLabel position="stacked">Description</IonLabel>
                          <IonTextarea
                            value={item.description}
                            onIonInput={(e) =>
                              handleItemChange(
                                index,
                                "description",
                                e.detail.value!
                              )
                            }
                            placeholder="Enter item description"
                            rows={2}
                          />
                        </IonItem>
                      </IonCol>
                      <IonCol size="3">
                        <IonItem>
                          <IonLabel position="stacked">Amount</IonLabel>
                          <IonInput
                            value={item.amount}
                            onIonInput={(e) =>
                              handleItemChange(index, "amount", e.detail.value!)
                            }
                            placeholder="0.00"
                            type="number"
                            step="0.01"
                          />
                        </IonItem>
                      </IonCol>
                      <IonCol size="2" className="ion-align-self-end">
                        <IonButton
                          fill="clear"
                          color="danger"
                          onClick={() => removeItem(index)}
                          disabled={formData.items.length === 1}
                        >
                          <IonIcon icon={trash} />
                        </IonButton>
                      </IonCol>
                    </IonRow>
                  </div>
                ))}

                <IonButton
                  expand="block"
                  fill="outline"
                  onClick={addItem}
                  className="add-item-button"
                  disabled={formData.items.length >= 13}
                >
                  <IonIcon icon={add} slot="start" />
                  Add Item ({formData.items.length}/13)
                </IonButton>

                <IonItemDivider>
                  <IonLabel>
                    <h2>Total: ${formData.total}</h2>
                  </IonLabel>
                </IonItemDivider>
              </IonCardContent>
            </IonCard>

            {/* Action Buttons */}
            <IonRow className="ion-padding">
              <IonCol>
                <IonButton expand="block" color="primary" onClick={handleSave}>
                  <IonIcon icon={save} slot="start" />
                  Save Invoice
                </IonButton>
              </IonCol>
              <IonCol>
                <IonButton
                  expand="block"
                  color="medium"
                  fill="outline"
                  onClick={handleClear}
                >
                  <IonIcon icon={trash} slot="start" />
                  Clear All
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonModal>

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        color={toastColor}
        position="top"
      />
    </>
  );
};

export default InvoiceForm;
