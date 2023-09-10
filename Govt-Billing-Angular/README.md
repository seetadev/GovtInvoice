# Govt Billing_v5 using Angular
Ionic v5 for Govt Billing app using Angular framework

### Follow the following steps to run the Invoice Suite Billing App in your system:

- **Install [Node & npm](https://ionicframework.com/docs/intro/environment#node-npm) on your system <br/>**
Almost all tooling for modern JavaScript projects is based in  [Node.js](https://ionicframework.com/docs/reference/glossary#node). The  [download page](https://nodejs.org/en/download/)  has prebuilt installation packages for all platforms. We recommend selecting the LTS version to ensure best compatibility.
Node is bundled with  [npm](https://ionicframework.com/docs/reference/glossary#npm), the package manager for JavaScript.
To verify the installation, open a new terminal window and run:

	```
	$ node --version
	$ npm --version
	```
- **Install [Git](https://ionicframework.com/docs/intro/environment#git)  <br/>**
Although not required, the version control system  [Git](https://ionicframework.com/docs/reference/glossary#git)  is highly recommended.
Git is often accompanied by a Git Host, such as  [GitHub](https://github.com/), in which case additional setup is required. Follow the tutorial from the Git Host's documentation to set up Git:
  - GitHub:  [Set up Git](https://help.github.com/en/articles/set-up-git)
  - GitLab:  [Installing Git](https://docs.gitlab.com/ee/topics/git/how_to_install_git)
  - Bitbucket:  [Install Git](https://www.atlassian.com/git/tutorials/install-git)
 
   Otherwise, follow the  [official installation instructions](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git). The command-line utility can be downloaded from the  [download page](https://git-scm.com/downloads).
To verify the installation, open a new terminal window and run:

	```
	$ git --version
	```

-  **Install the [Ionic CLI](https://ionicframework.com/docs/intro/cli#install-the-ionic-cli)  <br/>**
Before proceeding, make sure your computer has  [Node.js](https://ionicframework.com/docs/reference/glossary#node)  installed. See  [these instructions](https://ionicframework.com/docs/intro/environment)  to set up an environment for Ionic.
Install the Ionic CLI with npm:

	```
	$ npm install -g @ionic/cli
	```
- **Install [Ionic Tooling](https://ionicframework.com/docs/angular/your-first-app#install-ionic-tooling)  <br/>**
Run the following in the command line terminal to install the Ionic CLI (`ionic`),  `native-run`, used to run native binaries on devices and simulators/emulators, and  `cordova-res`, used to generate native app icons and splash screens:
	> To open a terminal in Visual Studio Code, go to Terminal -> New Terminal.

	```
	$ npm install -g @ionic/cli native-run cordova-res
	```
- **Go to the desired folder where you want to work on this app and clone this repository by :  <br/>**
	```
	git clone https URL of the repo
	```
	> Please setup your github account in the terminal to clone this private repository

- **Run the following command to run the application in your browser:  <br/>**
	```
	$ ionic serve
	```
- **To build an Android App:  <br/>**
Open the project folder in Terminal and run the following commands:
	```
	$ ionic build
	``` 
	If an folder named "android" doesn't exist already then run the following command else skip to next:  <br/>
		```
	$	ionic cap add android
		``` <br/>
		android folder at the root of the project is created. It is an entirely standalone native projects that should be considered part of your Ionic app (i.e., check them into source control, edit them using their native tooling, etc.).
Every time you perform a build (e.g.  `ionic build`) that updates your web directory (default:  `www`), you'll need to copy those changes into your native projects:

	```
	$ ionic cap copy
	```
	>Note: After making updates to the native portion of the code (such as adding a new plugin), use the  `sync`  command:
	```
	$ ionic cap sync
	```
-  **[Android Deployment](https://ionicframework.com/docs/angular/your-first-app/6-deploying-mobile#android-deployment)  <br/>**
Capacitor Android apps are configured and managed through Android Studio. Before running this app on an Android device, there's a couple of steps to complete.
First, run the Capacitor  `open`  command, which opens the native Android project in Android Studio:
	
	```
	$ ionic cap open android
	```
	Within Android Studio, click the "Run" button, select the attached Android device, then click OK to build, install, and launch the app on your device.

- **iOS Deployment:  <br/>**
Follow this link : [iOS Deployment for Ionic Apps](https://ionicframework.com/docs/angular/your-first-app/6-deploying-mobile#ios-deployment)

- **Points to be noted:  <br/>**
The socialcalc package used here is pulled from my github repository, not from npm as the module required for the project is customized so I have fetched this module from my github repo

