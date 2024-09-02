# Project Migration and Fixes

This project involves the migration of an Ionic v5 app with outdated dependencies to Ionic v7 using Vite as the build tool. The process included transferring code and addressing various issues encountered during the migration.

## Migration Steps

- Create a new Ionic Vite app:

```bash
npx create-ionic-vite@latest
```

- Transfer code from the original Ionic v5 project to the new Vite-based project.

- Fix errors encountered during the migration process by addressing them one by one.

## Integration of SocialCalc

During the integration of SocialCalc, an issue arose when switching from UMD to ES6 imports. Although the code worked on the web, it failed on an Android emulator due to the unavailability of the window object.

To resolve this, the UMD module was re-implemented, and the window object was defined in the SocialCalc file. Additionally, the SocialCalc file's outdated code lacked variable declarations. To make these variables available at the top of the scope, the var keyword was used.

## Android Emulator Compatibility Fix

To make the project compatible with an Android emulator, ensure that variables are declared at the top of the scope in the SocialCalc file. This step is essential for addressing issues related to the unavailability of the window object on the Android platform.

## Running the Project on Web

To build an APK from the codebase, follow these steps:

- Install Node.js if not already installed.

- Clone the repository:

```bash
git clone REPO_URL
```

- Navigate to the project directory:

```bash
cd REPO_NAME
```

- Install project dependencies:

```bash
npm install
```

- Install the Ionic CLI globally:

```bash
npm install -g @ionic/cli
```

- Setup a firebase project and add the firebase configuration in the `.env` file in the format given in the `.env.example`

- Serve the application:

```bash
ionic serve
```

These steps will set up the project and allow you to test it in a development environment.

## Running the Project on Android Device

- Install Android Studio if not already installed.

- Sync android codebase

```bash
ionic cap sync android
```

- Opening the Project in android Studio

```bash
ionic cap open android
```

Now you can run the app on a physical device or a virtual emulator, you can also build the app from the menu bar

## Running the Project on IOS Device

- Install XCode and XCode CLI if not already installed.

- Sync ios codebase

```bash
ionic cap sync ios
```

- Opening the Project in XCode

```bash
ionic cap open ios
```

Now you can run the app on a physical device or a virtual emulator, you can also build the app from the menu bar
