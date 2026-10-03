export const SITE = "https://sudo-rahman.fr";
export const AUTHOR = "Rahman Yilmaz";

export const xmlEscape = (s: string) =>
	s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
