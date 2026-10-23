import "./styles.css";
import faviconUrl from "./assets/favicon.ico";
import "./app-root";

const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
if (favicon) favicon.href = faviconUrl;
