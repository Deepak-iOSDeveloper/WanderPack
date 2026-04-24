import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_PATH = path.join(__dirname, "app-data.json");

const DEFAULT_STORE = {
  users: [],
  trips: [],
  posts: [],
  notifications: [],
  activityLog: [],
  bookings: [],
  wishlist: [],
  supportTickets: [],
};

function ensureStoreFile() {
  if (!fs.existsSync(STORE_PATH)) {
    fs.writeFileSync(STORE_PATH, JSON.stringify(DEFAULT_STORE, null, 2), "utf8");
  }
}

function readStore() {
  ensureStoreFile();
  try {
    const raw = fs.readFileSync(STORE_PATH, "utf8");
    return { ...DEFAULT_STORE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_STORE };
  }
}

function writeStore(store) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function isMongoAvailable() {
  return mongoose.connection.readyState === 1;
}

export function listLocal(collectionName, predicate = () => true) {
  const store = readStore();
  return [...(store[collectionName] || [])].filter(predicate).sort((a, b) => {
    const aTime = new Date(a.createdAt || 0).getTime();
    const bTime = new Date(b.createdAt || 0).getTime();
    return bTime - aTime;
  });
}

export function getLocalById(collectionName, id) {
  const store = readStore();
  return (store[collectionName] || []).find((item) => item._id === id || item.id === id) || null;
}

export function createLocal(collectionName, payload, prefix) {
  const store = readStore();
  const now = new Date().toISOString();
  const item = {
    ...payload,
    _id: payload._id || createId(prefix),
    id: payload.id || payload._id || createId(prefix),
    createdAt: payload.createdAt || now,
    updatedAt: payload.updatedAt || now,
  };
  store[collectionName] = [item, ...(store[collectionName] || [])];
  writeStore(store);
  return item;
}

export function updateLocal(collectionName, id, updates) {
  const store = readStore();
  let updated = null;
  store[collectionName] = (store[collectionName] || []).map((item) => {
    if (item._id !== id && item.id !== id) return item;
    updated = {
      ...item,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return updated;
  });
  writeStore(store);
  return updated;
}

export function deleteLocal(collectionName, id) {
  const store = readStore();
  const existing = (store[collectionName] || []).find((item) => item._id === id || item.id === id) || null;
  store[collectionName] = (store[collectionName] || []).filter((item) => item._id !== id && item.id !== id);
  writeStore(store);
  return existing;
}

export function findLocalOne(collectionName, predicate) {
  return listLocal(collectionName, predicate)[0] || null;
}

export function upsertLocal(collectionName, predicate, payload, prefix) {
  const current = findLocalOne(collectionName, predicate);
  if (!current) {
    return createLocal(collectionName, payload, prefix);
  }
  return updateLocal(collectionName, current._id || current.id, payload);
}
