import c from "electron";
import { createRequire as p } from "node:module";
import { fileURLToPath as d } from "node:url";
import o from "node:path";
const { app: n, BrowserWindow: t } = c;
p(import.meta.url);
const i = o.dirname(d(import.meta.url));
process.env.APP_ROOT = o.join(i, "..");
const s = process.env.VITE_DEV_SERVER_URL, v = o.join(process.env.APP_ROOT, "dist-electron"), r = o.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = s ? o.join(process.env.APP_ROOT, "public") : r;
let e;
function l() {
  e = new t({
    icon: o.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: o.join(i, "preload.mjs"),
      sandbox: !1
    }
  }), e.webContents.on("did-finish-load", () => {
    e == null || e.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), e.maximize(), e.webContents.on("console-message", (m, R, a) => {
    console.log(`[Renderer Console] ${a}`);
  }), s ? e.loadURL(s) : e.loadFile(o.join(r, "index.html"));
}
n.on("window-all-closed", () => {
  process.platform !== "darwin" && (n.quit(), e = null);
});
n.on("activate", () => {
  t.getAllWindows().length === 0 && l();
});
n.whenReady().then(l);
export {
  v as MAIN_DIST,
  r as RENDERER_DIST,
  s as VITE_DEV_SERVER_URL
};
