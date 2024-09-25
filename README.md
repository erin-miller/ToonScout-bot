# ToonScout Setup and Installation Guide (Windows)

## Prerequisites

### Node.js

In order for ToonScout to function, **Node.js** needs to be installed. You can download it by running
[this file](https://nodejs.org/dist/v20.17.0/node-v20.17.0-x64.msi).

Windows Defender Firewall might block the app. If so, just hit **Allow Access** as seen below.

During installation, it will present you with the option to install other software. Do **NOT** select the box.

![Windows Defender Firewall Alert](/assets/firewall.png)

## Initial Setup

### Step 1: Create a New Discord Application

1. Head to [Discord Developer Portal](https://discord.com/developers/applications?new_application=true).
2. Enter `ToonScout` or your own custom name, and click **Create**.

### Step 2: Install the Latest Release

1. Visit the [Releases Page](https://github.com/erin-miller/toonScout/releases) and download the latest version.
   - Select **Source code (zip)** under **Assets**.
   - Extract the folder in your download location.

### Step 3: Run the Program

1. Double-click `runScout.exe` to launch the program.
   - You may receive a security pop-up. If so, click **Run anyway** on Windows.

### Step 4: Configure ToonScout

- The ToonScout window will open, showing 4 fields you need to fill out:
  1. **App ID**: This can be found on the General Information section of your Discord app under "Application ID".
  2. **Discord Token**: In the Bot section of your app, click **Reset Token**, and follow the prompts to get your new token.
  3. **Public Key**: This is located under "Application ID" in the General Information section.
  4. **Subdomain**: Enter a unique name for your subdomain. Letters, numbers, and hyphens can be used.
     - Examples: `toon1239812389`, `scout-92834290`

**NOTE**: Your App ID, Discord Token, and Public Key are all sensitive information. The values for these fields are stored locally on your computer and should not be shared anywhere else.

### Step 5: Set the Interactions Endpoint URL

1. Click **Run** in the ToonScout window.
2. Go to your Discord app's general info page, scroll to **Interactions Endpoint URL**, and enter:  
   `https://<YOUR_SUBDOMAIN>.loca.lt/interactions`
   - `YOUR_SUBDOMAIN` is the same value you entered in the previous step.
3. Click **Save Changes**.

---

## Discord-Toontown Rewritten Interactivity

### Step 1: Add ToonScout to Your Discord

1. Visit the **Installation** section in your Discord app and copy the **Install Link**.
2. Paste the link into a new browser tab, click **Try It Now**, and then click **Authorize** to add ToonScout to your Discord account.

### Step 2: Enable Companion App Support in Toontown Rewritten

1. Launch Toontown Rewritten and go to **Options** > **Gameplay** and scroll down to **Miscellaneous**.
2. Enable **Companion App Support**.

### Step 3: Run Commands

- After enabling Companion App Support, you can run any commands in Discord. You will see a pop-up in the upper right of the Toontown Rewritten game screen asking if ToonScout can connect as a Companion App.
- Each time you start a new Toontown session, run `runScout.exe` again and approve it in-game.

---

With this setup, you’re ready to enhance your Toontown experience with ToonScout. Enjoy!
