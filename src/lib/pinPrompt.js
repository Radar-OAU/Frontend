const STORAGE_KEYS = {
	hasPin: "radar_has_pin",
	pinSalt: "radar_pin_salt",
	pinHash: "radar_pin_hash",
};

function canUseStorage() {
	return typeof window !== "undefined";
}

function readLocalStorage(key) {
	if (!canUseStorage()) return null;
	try {
		return window.localStorage.getItem(key);
	} catch {
		return null;
	}
}

function writeLocalStorage(key, value) {
	if (!canUseStorage()) return;
	try {
		window.localStorage.setItem(key, value);
	} catch {
		// ignore
	}
}


function toHex(buffer) {
	return Array.from(new Uint8Array(buffer))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

function generateSaltHex() {
	if (!canUseStorage()) return `${Date.now()}`;
	try {
		if (!window.crypto?.getRandomValues) return `${Date.now()}`;
		const bytes = window.crypto.getRandomValues(new Uint8Array(16));
		return toHex(bytes);
	} catch {
		return `${Date.now()}`;
	}
}

export function hasPinSet() {
	const flag = readLocalStorage(STORAGE_KEYS.hasPin) === "true";
	const salt = readLocalStorage(STORAGE_KEYS.pinSalt);
	const hash = readLocalStorage(STORAGE_KEYS.pinHash);
	return flag && !!salt && !!hash;
}

export async function hashPin(pin, salt) {
	if (!canUseStorage()) return "";
	const data = `${salt}:${pin}`;
	const enc = new TextEncoder();
	const digest = await window.crypto.subtle.digest("SHA-256", enc.encode(data));
	return toHex(digest);
}

export function getStoredPinSalt() {
	return readLocalStorage(STORAGE_KEYS.pinSalt);
}

export function getStoredPinHash() {
	return readLocalStorage(STORAGE_KEYS.pinHash);
}

export async function storePinLocally(pin) {
	if (!canUseStorage()) return;
	const salt = generateSaltHex();
	const pinHash = await hashPin(pin, salt);
	writeLocalStorage(STORAGE_KEYS.pinSalt, salt);
	writeLocalStorage(STORAGE_KEYS.pinHash, pinHash);
	writeLocalStorage(STORAGE_KEYS.hasPin, "true");
}

export async function updateLocalPin(pin) {
	// Reuse existing salt if present to avoid changing salt unless needed
	if (!canUseStorage()) return;
	const existingSalt = getStoredPinSalt();
	const salt = existingSalt || generateSaltHex();
	const pinHash = await hashPin(pin, salt);
	writeLocalStorage(STORAGE_KEYS.pinSalt, salt);
	writeLocalStorage(STORAGE_KEYS.pinHash, pinHash);
	writeLocalStorage(STORAGE_KEYS.hasPin, "true");
}

export async function verifyPinLocally(pin) {
	const salt = getStoredPinSalt();
	const storedHash = getStoredPinHash();
	if (!salt || !storedHash) return false;
	const candidate = await hashPin(pin, salt);
	return candidate === storedHash;
}

