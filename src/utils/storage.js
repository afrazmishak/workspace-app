export function loadData(key, fallback) {
  const savedData = localStorage.getItem(key);
  return savedData ? JSON.parse(savedData) : fallback;
}

export function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}