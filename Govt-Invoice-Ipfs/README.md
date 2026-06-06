<div align="center">

# 🍎 Invoice Pro for iOS

<img src="public/app-listing/app-icons/icon-only.png" alt="Invoice Pro Logo" width="150" height="150" style="border-radius: 30px;">

### 📱 Professional Invoice Management App

[![iOS](https://img.shields.io/badge/iOS-000000?style=for-the-badge&logo=apple&logoColor=white)](https://developer.apple.com)
[![Capacitor](https://img.shields.io/badge/Capacitor-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)](https://capacitorjs.com)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Ionic](https://img.shields.io/badge/Ionic-3880FF?style=for-the-badge&logo=ionic&logoColor=white)](https://ionicframework.com)

**Version 2.0.0** • First iOS Release 🚀

*A powerful, offline-first invoice management application built natively for iOS. Create professional invoices, manage inventory, and track your business — all without internet!*

[📥 Download from App Store](#installation) • [📖 Documentation](#features) • [🐛 Report Bug](../../issues)

</div>

---

## 📸 Screenshots

<div align="center">
<table>
  <tr>
    <td align="center"><img src="public/app-listing/mobile-ss/Welcome-screen.png" width="200"/><br/><b>Welcome Screen</b></td>
    <td align="center"><img src="public/app-listing/mobile-ss/Business-info.png" width="200"/><br/><b>Business Setup</b></td>
    <td align="center"><img src="public/app-listing/mobile-ss/files.png" width="200"/><br/><b>Invoice Files</b></td>
  </tr>
  <tr>
    <td align="center"><img src="public/app-listing/mobile-ss/invoice1.png" width="200"/><br/><b>Invoice Editor</b></td>
    <td align="center"><img src="public/app-listing/mobile-ss/edit.png" width="200"/><br/><b>Quick Edit</b></td>
    <td align="center"><img src="public/app-listing/mobile-ss/export.png" width="200"/><br/><b>PDF Export</b></td>
  </tr>
</table>
</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 📴 100% Offline Capable
All data stored locally on your device. No internet required to create, edit, or save invoices.

### 🔒 Privacy First
Your financial data never leaves your device. Zero cloud uploads or third-party tracking.

### 📊 Spreadsheet Editor
Powered by SocialCalc engine for flexible, spreadsheet-like invoice creation.

### 🎨 Professional Templates
Choose from multiple beautiful templates. Customize with your logo and branding.

</td>
<td width="50%">

### 📝 Quick Data Entry
Easy-to-use form sidebar for rapid invoice creation without manual cell editing.

### 📄 PDF Export & Share
Export professional PDFs instantly. Share via email, WhatsApp, or any app.

### 📈 Dashboard Analytics
Visual revenue tracking with charts. Monitor recent invoices at a glance.

### 🌙 Dark Mode Support
Beautiful dark theme for comfortable use in any lighting condition.

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

<div align="center">

| Category | Technology |
|:--------:|:----------:|
| **Framework** | ![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black) ![Ionic](https://img.shields.io/badge/Ionic_8-3880FF?style=flat-square&logo=ionic&logoColor=white) |
| **Language** | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) |
| **Native Bridge** | ![Capacitor](https://img.shields.io/badge/Capacitor_8-119EFF?style=flat-square&logo=capacitor&logoColor=white) |
| **Database** | ![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white) |
| **Build Tool** | ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) |
| **Charts** | ![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat-square&logo=chartdotjs&logoColor=white) |
| **PDF** | ![jsPDF](https://img.shields.io/badge/jsPDF-F40F02?style=flat-square&logo=adobeacrobatreader&logoColor=white) |

</div>

---

## 📲 Installation

### Option 1: Download from App Store (Coming Soon)

🚀 The app will be available on the Apple App Store soon!

### Option 2: Build from Source

#### Prerequisites

- ✅ Node.js v16 or higher
- ✅ npm or yarn
- ✅ Xcode 14 or higher
- ✅ macOS (required for iOS development)
- ✅ Apple Developer account (for device deployment)

#### Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd Invoice-mvp-basic-v2

# 2. Install dependencies
npm install

# 3. Build web assets
npm run build

# 4. Sync with iOS
npx cap sync ios

# 5. Open in Xcode
npx cap open ios
```

Then build IPA from Xcode: **Product → Archive → Distribute App**

---

## 🏗️ Project Structure

```
📦 Invoice-mvp-basic-v2
├── 📂 ios/                  # Native iOS project (Xcode)
├── 📂 src/
│   ├── 📂 components/       # Reusable UI components
│   ├── 📂 contexts/         # React Context providers
│   ├── 📂 data/             # Database & repositories
│   ├── 📂 hooks/            # Custom React hooks
│   ├── 📂 pages/            # App screens/views
│   ├── 📂 services/         # Business logic & exports
│   ├── 📂 theme/            # Styling & CSS variables
│   └── 📂 utils/            # Helper functions
├── 📂 public/
│   ├── 📂 templates/        # Invoice template definitions
│   └── 📂 assets/           # Static assets & icons
├── 📄 capacitor.config.ts   # Capacitor configuration
├── 📄 ionic.config.json     # Ionic CLI config
└── 📄 package.json          # Dependencies & scripts
```

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run test` | Run unit tests |
| `ionic serve` | Serve with Ionic CLI |
| `npx cap sync ios` | Sync web build with iOS |
| `npx cap open ios` | Open in Xcode |

---

## 🏛️ Architecture

The app uses a **hybrid storage architecture**:

```
┌──────────────────────────────────────────────────┐
│               📱 UI LAYER                        │
│  Dashboard │ Invoice Editor │ Settings │ Files  │
└─────────────────────┬────────────────────────────┘
                      │
┌─────────────────────▼────────────────────────────┐
│            🔄 STATE MANAGEMENT                   │
│         React Context + LocalStorage             │
└─────────────────────┬────────────────────────────┘
                      │
┌─────────────────────▼────────────────────────────┐
│              💾 DATA LAYER                       │
│  SQLite (Primary) │ Preferences │ Static Files  │
└──────────────────────────────────────────────────┘
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### Made with ❤️ for iOS

![iOS](https://img.shields.io/badge/Built_for-iOS-000000?style=for-the-badge&logo=apple&logoColor=white)

**⭐ Star this repo if you find it useful!**

</div>
