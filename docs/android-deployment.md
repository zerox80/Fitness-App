# Android Deployment Guide

This guide explains how to build and install the FitPulse mobile application on an Android device.

## Prerequisites (Device Setup)

Before you can install the app directly from your computer, you must prepare your Android device:

1.  **Enable Developer Options**: 
    *   Go to **Settings** -> **About Phone**.
    *   Tap **Build Number** 7 times until you see "You are now a developer!".
2.  **Enable USB Debugging**:
    *   Go to **Settings** -> **System** -> **Developer Options**.
    *   Toggle **USB Debugging** to ON.
3.  **Connect Device**:
    *   Connect your phone to your computer via a high-quality USB cable.
    *   Accept the "Allow USB Debugging?" prompt on your phone screen.

---

## Method A: Local Development Build (Fastest)

Use this method if you have Android Studio and the Android SDK installed on your machine.

1.  **Verify Connection**:
    ```bash
    adb devices
    ```
    You should see your device listed as `device`.

2.  **Run the App**:
    ```bash
    npx expo run:android
    ```
    This will compile the native code locally and push the app to your connected device.

---

## Method B: EAS Build (Easiest - Cloud Based)

Use this method if you don't want to manage local Android SDKs. This will build an APK in the cloud.

1.  **Install EAS CLI**:
    ```bash
    npm install -g eas-cli
    ```

2.  **Login to Expo**:
    ```bash
    npx eas login
    ```

3.  **Configure Project (First time only)**:
    ```bash
    npx eas build:configure
    ```

4.  **Build an Installable APK**:
    ```bash
    npx eas build -p android --profile development
    ```
    *Note: The first build might take 10-15 minutes.*

5.  **Install**:
    Once the build is complete, scan the provided **QR Code** with your phone or download the `.apk` file from the Expo dashboard and open it on your device.

---

## Connecting to the Backend

When running the app on a physical device, ensure it can reach your API:

*   **Production**: Ensure `EXPO_PUBLIC_API_URL` in your `.env` points to your public domain (e.g., `https://fit.example.com/api`).
*   **Local Development**: If the backend is running on your computer, use your computer's local IP (e.g., `http://192.168.1.50:4000/api`). **Do not use `localhost`**, as it refers to the phone itself.
