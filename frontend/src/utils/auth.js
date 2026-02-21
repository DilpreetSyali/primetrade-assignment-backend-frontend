export function getAuth() {
  const raw = localStorage.getItem("auth");
  return raw ? JSON.parse(raw) : { token: null, user: null };
}

export function setAuth(data) {
  localStorage.setItem("auth", JSON.stringify(data));
}

export function clearAuth() {
  localStorage.removeItem("auth");
}