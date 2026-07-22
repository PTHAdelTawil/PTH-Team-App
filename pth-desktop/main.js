const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

/* =========================================================
   Auto-Update — prüft beim Start automatisch auf neue Versionen
   (veröffentlicht als GitHub Release) und lädt sie im Hintergrund
   herunter. Fragt erst nach, wenn wirklich eine fertige neue Version
   bereitliegt, statt einfach mittendrin neu zu starten.
   ========================================================= */
function setupAutoUpdater() {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('update-downloaded', (info) => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update bereit',
      message: `PTH Team-Hub ${info.version} wurde heruntergeladen.`,
      detail: 'Beim nächsten Neustart wird die neue Version automatisch installiert.',
      buttons: ['Jetzt neu starten', 'Später'],
      defaultId: 0,
      cancelId: 1,
    }).then(({ response }) => {
      if (response === 0) autoUpdater.quitAndInstall();
    });
  });

  autoUpdater.on('error', (err) => {
    console.error('Auto-Update-Fehler:', err);
    // Bewusst keine Fehlermeldung an den Nutzer — z.B. einfach kein Internet
    // beim Start ist kein Grund, die App mit einem Popup zu stören.
  });

  autoUpdater.checkForUpdates();
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1000,
    minHeight: 640,
    backgroundColor: '#0d0f14', // vermeidet weißes Aufblitzen beim Start (passt zum dunklen Design)
    icon: path.join(__dirname, 'build', 'icon.png'),
    title: 'PTH Team-Hub',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false, // Sicherheit: die Web-App bekommt keinen Zugriff auf Node/Dateisystem
      sandbox: true,
    },
  });

  // Wichtig: die echte, gehostete Adresse laden (nicht eine lokale Kopie) —
  // sonst landet der Discord-Login-Speicher unter einer anderen "Adresse" als
  // die, die beim nächsten Start wieder geladen wird, und geht dadurch verloren.
  win.loadURL('https://pthadeltawil.github.io/PTH-Wiki/');

  // Freundliche Meldung statt leerer weißer Seite, falls kein Internet da ist
  win.webContents.on('did-fail-load', () => {
    win.loadURL('data:text/html,' + encodeURIComponent(`
      <body style="background:#0d0f14; color:#eef0f4; font-family:sans-serif; display:flex; align-items:center; justify-content:center; height:100vh; margin:0;">
        <div style="text-align:center;">
          <h2>Keine Verbindung</h2>
          <p style="color:#8890a0;">PTH Team-Hub braucht eine Internetverbindung. Bitte prüfen und die App neu starten.</p>
        </div>
      </body>
    `));
  });

  // Externe Links (z.B. Discord-Login-Redirect, angehängte Datei-URLs) im echten
  // Browser öffnen statt in einem neuen Electron-Fenster
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Einfaches, aufgeräumtes Menü (kein Standard-Electron-Menü mit ungenutzten Punkten)
  const menu = Menu.buildFromTemplate([
    {
      label: 'PTH Team-Hub',
      submenu: [
        { role: 'reload', label: 'Neu laden' },
        { role: 'forceReload', label: 'Neu laden (Cache leeren)' },
        { type: 'separator' },
        { label: 'Nach Updates suchen', click: () => autoUpdater.checkForUpdates() },
        { type: 'separator' },
        { role: 'toggleDevTools', label: 'Entwickler-Werkzeuge' },
        { type: 'separator' },
        { role: 'quit', label: 'Beenden' },
      ],
    },
    {
      label: 'Ansicht',
      submenu: [
        { role: 'resetZoom', label: 'Zoom zurücksetzen' },
        { role: 'zoomIn', label: 'Vergrößern' },
        { role: 'zoomOut', label: 'Verkleinern' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Vollbild' },
      ],
    },
  ]);
  Menu.setApplicationMenu(menu);

  return win;
}

app.whenReady().then(() => {
  createWindow();
  setupAutoUpdater();

  app.on('activate', () => {
    // macOS: Klick aufs Dock-Icon öffnet ein neues Fenster, falls keines mehr offen ist
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
