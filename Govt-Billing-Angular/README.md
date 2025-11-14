# Govt-Billing-Angular

An Ionic + Angular project for government billing, supporting web, Android, and iOS platforms (using Capacitor).


## Project Overview

This project is built using:
- **Angular 9**
- **Ionic 5**
- **Capacitor for mobile builds**

> **Important:** This codebase uses older dependencies. Newer Node.js and CLI versions may not work out-of-the-box.

---

## Prerequisites

- **Git**
- **Node.js v14.x** (strictly required)
- **npm v6.x** (comes with Node.js v14)
- **nvm-windows** (for Windows, to manage Node versions)
- **Visual Studio Build Tools** (for Windows, for native module builds)
- **Java JDK 8+** (for Android)
- **Android Studio** (for Android builds/emulator)
- **Ionic CLI v6.20.1**
- **Capacitor CLI**
- **For iOS (Mac only):**
  - **macOS** (required by Apple for all iOS builds)
  - **Xcode** (from Mac App Store)
  - **CocoaPods** (`sudo gem install cocoapods`)
  - **Homebrew** (recommended for tooling)

---

## Setup Instructions

### 1. Clone the Repository

```sh
git clone https://github.com/seetadev/GovtInvoice.git
cd GovtInvoice/Govt-Billing-Angular
```

---

### 2. Node.js & npm Setup (Windows-friendly)

#### a. Install [nvm-windows](https://github.com/coreybutler/nvm-windows/releases)
- Download and run the latest `nvm-setup.exe`.
- Open a new Command Prompt as Administrator.

#### b. Install Node.js 14

```sh
nvm install 14
nvm use 14
node -v    # Should output v14.x.x
npm -v     # Should output v6.x.x
```

*On Mac/Linux, use [nvm](https://github.com/nvm-sh/nvm):*
```sh
nvm install 14
nvm use 14
```

> **Note:** Do NOT use Node.js 18/20+ for this project. It will not work.

---

### 3. Visual Studio Build Tools (Windows Only)

For native module builds (like `sharp`), install:

- [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
- During install, select **"Desktop development with C++"** workload.

---

### 4. Install Project Dependencies

```sh
npm install
```

If you see errors related to `node-gyp` or native modules:
- Ensure Node.js v14 is active (`node -v`)
- Visual Studio Build Tools are installed
- Try deleting `node_modules` and `package-lock.json`, then run `npm install` again.

---

### 5. Install Compatible Angular & Ionic CLI

#### a. Uninstall Current Ionic CLI (if any):

```sh
npm uninstall -g @ionic/cli
```

#### b. Install Ionic CLI v6.20.1 (Last version supporting Node 14):

```sh
npm install -g @ionic/cli@6.20.1
```

#### c. Install Angular CLI v9.1.5:

```sh
npm uninstall -g @angular/cli
npm install -g @angular/cli@9.1.5
```

---

## Running the Project

### Web (Local Development)

```sh
ionic serve
# OR (if you face issues)
ng serve
```
- Open http://localhost:4200

---

### Android (Device/Emulator) via Capacitor

#### 1. Install Capacitor (if not already)

```sh
npm install @capacitor/core @capacitor/cli
```

#### 2. Add Android Platform

```sh
npx cap add android
```

#### 3. Build the App

```sh
ionic build
```

#### 4. Sync and Open in Android Studio

```sh
npx cap copy android
npx cap open android
```
- Build and run from Android Studio (on device or emulator).

---

### iOS (Device/Simulator, Mac only, via Capacitor)

> **Note:** iOS builds require a Mac with Xcode installed.

#### 1. Install CocoaPods (if not already):

```sh
sudo gem install cocoapods
```

#### 2. Add iOS Platform

```sh
npx cap add ios
```

#### 3. Build the App

```sh
ionic build
```

#### 4. Sync and Open in Xcode

```sh
npx cap copy ios
npx cap open ios
```
- This opens the iOS project in Xcode. You can now build and run on a simulator or device.

#### 5. iOS Deployment Notes

- For real device testing, you must register the device and have a valid Apple Developer account.
- All iOS builds and signing must be done on macOS.


