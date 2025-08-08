
## 🚀 How to use

## 1️⃣ Install Node.js
Make sure **Node.js** is installed on your system.  
Download from: [https://nodejs.org/](https://nodejs.org/)

---
## 2️⃣ Install Required CLI Tools
Run the following commands in your terminal:
```sh
npm install -g expo-cli
npm install -g eas-cli
```
## 3️⃣ Create the Expo App
```sh
npx create-expo-app -e with-router
```
## 4️⃣ Build the App for Android (Preview Profile)
```sh
npm install
eas build -p android --profile preview
```
📂 Files to Use from the Repository
app folder → Front-End

moneybook folder → Back-End

babel.config.js → Required configuration



⚙️ Configuration Before Running
Update url.js and any IP references in the following files:

App.js

Cashin.js

Cashout.js

Dashboard.js

Note: Replace the IP address with your system’s local IP address.


## 📝 Notes

- [Expo Router: Docs](https://docs.expo.dev/router/introduction/)
