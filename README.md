# Budgie

> An ultra-fast, local-first personal budgeting Progressive Web App (PWA) crafted for Android and desktop.

Budgie is built around a single core principle: **making it ridiculously fast to log an expense**. No account creation, no loading spinners, no monthly subscription fees, and no complicated menus. 

Pull out your phone, tap the amount, tap a category, and you are done in 2 seconds.

---

## Features

- **Speed Add UX:** Opens straight to a tactile custom keypad with 1-tap category buttons and quick preset chips (`+5`, `+10`, `+20`, `+50`).
- **Voice-to-Expense:** Hands-free expense logging using speech recognition (e.g., tap the mic and say *"Lunch 14 dollars"* or *"Coffee 4.50"*).
- **Android Haptics:** Subtle tactile vibration on taps for a native app feel.
- **Installable Android PWA:** Add to your Android home screen from Chrome to run full-screen without an address bar. Works 100% offline via Service Worker.
- **Real-time Budgeting & Insights:** Visual donut breakdown, monthly safe daily spending pace, and categorized spending bars.
- **Google Sheets Auto-Sync (Optional):** Local-first offline queue that automatically pushes every expense to your personal Google Sheet in the background.
- **Private & Portable:** Export to CSV (Excel/Sheets) or JSON backup at any time with 1 tap.

---

## Running Locally

You can run Budgie locally on Windows with zero external dependencies using PowerShell:

```powershell
.\serve.ps1
```

Then open your browser to **`http://localhost:8080`**.

---

## Deploying to GitHub Pages (Free Cloud Hosting)

Because Budgie is a zero-build client-side Progressive Web App, you can host it permanently and free on GitHub Pages:

1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: initial release of Budgie budgeting app"
   git push origin main
   ```
2. On GitHub, go to your repository: **Settings > Pages**.
3. Under **Build and deployment > Source**, select **Deploy from a branch**.
4. Set branch to **`main`** and folder to **`/ (root)`**, then click **Save**.
5. Within 1–2 minutes, your app will be live at:
   **`https://novelben.github.io/budgie/`**

---

## Installing on Your Android Phone

1. Open your hosted URL (e.g. `https://novelben.github.io/budgie/`) in **Google Chrome** on your Android phone.
2. Tap the **three dots menu (⋮)** in the top right of Chrome.
3. Tap **"Install app"** or **"Add to Home screen"**.
4. The Budgie icon will appear on your phone's home screen. Tap it to launch full-screen with offline support and native app shortcuts!

---

## Connecting to Google Sheets (Optional Auto-Sync)

Budgie works 100% offline and locally out of the box. If you would like your expenses automatically recorded in your personal Google Sheet:

1. Open [Google Sheets](https://sheets.new) and create a blank sheet called **"Budgie Expenses"**.
2. Click **Extensions > Apps Script**.
3. Replace the placeholder code with the contents of [`google-sheets-script.js`](./google-sheets-script.js) and click Save.
4. Click **Deploy > New deployment**:
   - Type: **Web app**
   - Description: `Budgie Sync`
   - Execute as: `Me`
   - Who has access: `Anyone`
5. Click **Deploy**, authorize permissions, and copy the Web App URL (ends in `/exec`).
6. In Budgie, navigate to **Settings > Google Sheets Auto-Sync**, paste your URL, and tap **Save Webhook**!

Every expense you log will now automatically appear in your spreadsheet in real time. If you log expenses while offline, Budgie queues them up and syncs them automatically once your phone reconnects to internet.

---

## Tech Stack

- **Frontend:** Vanilla HTML5, CSS3, ES6+ JavaScript (Zero framework bloat, sub-50ms launch time)
- **PWA:** Web App Manifest, Cache-first Service Worker, Web Speech API, Navigator Vibration API
- **Design:** Modern dark OLED aesthetic (`#06090e`), neon emerald accents, glassmorphic cards, responsive mobile container
- **Storage:** Local-first IndexedDB/LocalStorage with Google Apps Script Webhook auto-sync

---

## License

MIT (c) NovelBen
