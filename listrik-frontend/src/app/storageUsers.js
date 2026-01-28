const KEY = "lp_users_v1";

export function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function saveUsers(users) {
  localStorage.setItem(KEY, JSON.stringify(users));
}

export function addUser(user) {
  const users = getUsers();
  users.unshift(user);
  saveUsers(users);
}

export function updateUser(id, patch) {
  const users = getUsers().map((u) => (u.id === id ? { ...u, ...patch } : u));
  saveUsers(users);
}

export function deleteUser(id) {
  const users = getUsers().filter((u) => u.id !== id);
  saveUsers(users);
}
