const TRIPLOG_API_URL = "api/posts.php";
const TRIPLOG_AUTH_URL = "api/auth.php";
const TRIPLOG_UPLOAD_URL = "api/upload.php";

async function fetchJson(url, options) {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...options
  });
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  const payload = await response.json();
  if (!payload.ok) {
    throw new Error(payload.error || "API request returned an error.");
  }

  return payload.data;
}

function buildSlug(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

function normalizePost(input) {
  const now = new Date().toISOString();
  const title = (input.title || "").trim();
  const content = (input.content || input.summary || "").trim();
  const computedId = buildSlug(title) || `voyage-${Date.now()}`;

  return {
    id: (input.id || computedId).trim(),
    title,
    date: (input.date || "").trim(),
    location: (input.location || "").trim(),
    image: (input.image || "").trim(),
    video: (input.video || "").trim(),
    content,
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now
  };
}

async function loadPosts() {
  const remotePosts = await fetchJson(TRIPLOG_API_URL, { method: "GET" });
  return Array.isArray(remotePosts) ? remotePosts.map(normalizePost) : [];
}

async function upsertPost(post) {
  const normalized = normalizePost(post);
  const savedPost = await fetchJson(TRIPLOG_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(normalized)
  });

  return normalizePost(savedPost);
}

async function deletePost(postId) {
  await fetchJson(`${TRIPLOG_API_URL}?id=${encodeURIComponent(postId)}`, {
    method: "DELETE"
  });
}

async function getPostById(postId) {
  const posts = await loadPosts();
  return posts.find(post => post.id === postId) || null;
}

async function login(username, password) {
  await fetchJson(TRIPLOG_AUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      action: "login",
      username,
      password
    })
  });
}

async function logout() {
  await fetchJson(TRIPLOG_AUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ action: "logout" })
  });
}

async function getAuthStatus() {
  const data = await fetchJson(TRIPLOG_AUTH_URL, { method: "GET" });
  return Boolean(data?.authenticated);
}

async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);
  const data = await fetchJson(TRIPLOG_UPLOAD_URL, {
    method: "POST",
    body: formData
  });

  return data.url || "";
}

window.TripStore = {
  loadPosts,
  upsertPost,
  deletePost,
  getPostById,
  login,
  logout,
  getAuthStatus,
  uploadImage
};
