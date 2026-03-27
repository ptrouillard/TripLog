const TRIPLOG_STORAGE_KEY = "triplog.posts.v1";
const TRIPLOG_API_URL = "api/posts.php";
const TRIPLOG_AUTH_URL = "api/auth.php";
const TRIPLOG_UPLOAD_URL = "api/upload.php";

const defaultPosts = [
  {
    id: "essaouira-2026",
    title: "Matin dore a Essaouira",
    date: "Fevrier 2026",
    location: "Maroc - Essaouira",
    image:
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
    video: "https://www.youtube.com/embed/aqz-KE-bpKQ",
    content:
      "<p>Balade dans la medina, odeur de pain chaud et lumiere douce sur les remparts face a l ocean.</p>",
    createdAt: "2026-02-16T09:10:00.000Z",
    updatedAt: "2026-02-16T09:10:00.000Z"
  },
  {
    id: "dolomites-2026",
    title: "Train de nuit vers les Dolomites",
    date: "Janvier 2026",
    location: "Italie - Bolzano",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    video: "",
    content:
      "<p>Le paysage passe des villes aux vallons enneiges. Arrivee au lever du soleil avec une vue montagne.</p>",
    createdAt: "2026-01-18T07:00:00.000Z",
    updatedAt: "2026-01-18T07:00:00.000Z"
  },
  {
    id: "cdmx-2025",
    title: "Rues animees de Mexico",
    date: "Novembre 2025",
    location: "Mexique - CDMX",
    image:
      "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=1200&q=80",
    video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    content:
      "<p>Street food, marches colores et musique partout. Une ville dense et energique, parfaite pour un carnet photo.</p>",
    createdAt: "2025-11-06T10:30:00.000Z",
    updatedAt: "2025-11-06T10:30:00.000Z"
  }
];

function deepCopy(posts) {
  return JSON.parse(JSON.stringify(posts));
}

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

function loadPostsFromLocal() {
  const raw = localStorage.getItem(TRIPLOG_STORAGE_KEY);
  if (!raw) {
    return deepCopy(defaultPosts);
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return deepCopy(defaultPosts);
    }

    return parsed.map(normalizePost);
  } catch {
    return deepCopy(defaultPosts);
  }
}

function savePostsToLocal(posts) {
  localStorage.setItem(TRIPLOG_STORAGE_KEY, JSON.stringify(posts));
}

async function loadPosts() {
  try {
    const remotePosts = await fetchJson(TRIPLOG_API_URL, { method: "GET" });
    const normalized = Array.isArray(remotePosts)
      ? remotePosts.map(normalizePost)
      : deepCopy(defaultPosts);
    savePostsToLocal(normalized);
    return normalized;
  } catch {
    return loadPostsFromLocal();
  }
}

function savePosts(posts) {
  savePostsToLocal(posts.map(normalizePost));
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

  const posts = await loadPosts();
  savePostsToLocal(posts);
  return normalizePost(savedPost);
}

async function deletePost(postId) {
  await fetchJson(`${TRIPLOG_API_URL}?id=${encodeURIComponent(postId)}`, {
    method: "DELETE"
  });
  const posts = await loadPosts();
  savePostsToLocal(posts);
  return posts;
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
  savePosts,
  upsertPost,
  deletePost,
  getPostById,
  login,
  logout,
  getAuthStatus,
  uploadImage
};
