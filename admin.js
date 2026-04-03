const postList = document.getElementById("postList");
const editorForm = document.getElementById("editorForm");
const statusMsg = document.getElementById("statusMsg");
const deleteBtn = document.getElementById("deleteBtn");
const newPostBtn = document.getElementById("newPostBtn");
const logoutBtn = document.getElementById("logoutBtn");

const loginPanel = document.getElementById("loginPanel");
const loginForm = document.getElementById("loginForm");
const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");
const loginStatus = document.getElementById("loginStatus");

const postIdInput = document.getElementById("postId");
const titleInput = document.getElementById("title");
const dateInput = document.getElementById("date");
const locationInput = document.getElementById("location");
const imageInput = document.getElementById("image");
const videoInput = document.getElementById("video");
const imageFileInput = document.getElementById("imageFile");
const uploadBtn = document.getElementById("uploadBtn");

const quill = new Quill("#editor", {
  theme: "snow",
  placeholder: "Raconte le voyage avec du texte riche, titres, listes, citations...",
  modules: {
    toolbar: [
      [{ header: [2, 3, false] }],
      ["bold", "italic", "underline", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"]
    ]
  }
});

const state = {
  posts: [],
  activeId: "",
  authenticated: false
};

function toPlainText(html) {
  const temp = document.createElement("div");
  temp.innerHTML = html || "";
  return (temp.textContent || "").trim();
}

function setStatus(message, isError = false) {
  statusMsg.textContent = message;
  statusMsg.classList.toggle("error", isError);
}

function setLoginStatus(message, isError = false) {
  loginStatus.textContent = message;
  loginStatus.classList.toggle("error", isError);
}

function applyAuthUi() {
  if (state.authenticated) {
    document.body.classList.remove("admin-locked");
    loginPanel.classList.remove("visible");
  } else {
    document.body.classList.add("admin-locked");
    loginPanel.classList.add("visible");
  }
}

async function loadState() {
  state.posts = await window.TripStore.loadPosts();
}

function renderPostList() {
  postList.innerHTML = "";

  if (state.posts.length === 0) {
    const empty = document.createElement("li");
    empty.className = "post-list-empty";
    empty.textContent = "Aucun voyage enregistre.";
    postList.appendChild(empty);
    return;
  }

  state.posts.forEach(post => {
    const item = document.createElement("li");
    item.className = "post-list-item";

    if (post.id === state.activeId) {
      item.classList.add("active");
    }

    const excerpt = toPlainText(post.content).slice(0, 80);
    item.innerHTML = `
      <button type="button" data-id="${post.id}">
        <strong>${post.title}</strong>
        <span>${post.date} - ${post.location}</span>
        <small>${excerpt}${excerpt.length === 80 ? "..." : ""}</small>
      </button>
    `;

    postList.appendChild(item);
  });
}

function fillForm(post) {
  if (!post) {
    postIdInput.value = "";
    titleInput.value = "";
    dateInput.value = "";
    locationInput.value = "";
    imageInput.value = "";
    videoInput.value = "";
    quill.setContents([]);
    deleteBtn.disabled = true;
    return;
  }

  postIdInput.value = post.id;
  titleInput.value = post.title;
  dateInput.value = post.date;
  locationInput.value = post.location;
  imageInput.value = post.image;
  videoInput.value = post.video;
  quill.root.innerHTML = post.content || "";
  deleteBtn.disabled = false;
}

function setActivePost(postId) {
  state.activeId = postId;
  const post = state.posts.find(item => item.id === postId) || null;
  fillForm(post);
  renderPostList();
}

function resetForNewPost() {
  state.activeId = "";
  fillForm(null);
  renderPostList();
  setStatus("Nouveau recit pret.");
}

postList.addEventListener("click", event => {
  const button = event.target.closest("button[data-id]");
  if (!button) {
    return;
  }

  setActivePost(button.dataset.id);
});

newPostBtn.addEventListener("click", () => {
  resetForNewPost();
});

editorForm.addEventListener("submit", async event => {
  event.preventDefault();

  const payload = {
    id: postIdInput.value.trim(),
    title: titleInput.value.trim(),
    date: dateInput.value.trim(),
    location: locationInput.value.trim(),
    image: imageInput.value.trim(),
    video: videoInput.value.trim(),
    content: quill.root.innerHTML.trim()
  };

  const plain = toPlainText(payload.content);
  const requiredFields = [payload.title, payload.date, payload.location, payload.image, plain];
  if (requiredFields.some(field => !field)) {
    setStatus("Complete les champs obligatoires et le contenu du recit.", true);
    return;
  }

  try {
    const savedPost = await window.TripStore.upsertPost(payload);
    await loadState();
    setActivePost(savedPost.id);
    setStatus("Voyage enregistre en base.");
  } catch (error) {
    setStatus(error.message || "Erreur lors de l enregistrement.", true);
  }
});

deleteBtn.addEventListener("click", async () => {
  const activeId = postIdInput.value.trim();
  if (!activeId) {
    return;
  }

  try {
    await window.TripStore.deletePost(activeId);
    await loadState();
    resetForNewPost();
    setStatus("Voyage supprime.");
  } catch (error) {
    setStatus(error.message || "Erreur lors de la suppression.", true);
  }
});

loginForm.addEventListener("submit", async event => {
  event.preventDefault();
  setLoginStatus("Connexion en cours...");

  try {
    await window.TripStore.login(loginUsername.value.trim(), loginPassword.value);
    state.authenticated = true;
    applyAuthUi();
    loginForm.reset();
    setLoginStatus("");
    await loadState();
    renderPostList();

    if (state.posts[0]) {
      setActivePost(state.posts[0].id);
    } else {
      resetForNewPost();
    }
  } catch (error) {
    setLoginStatus(error.message || "Identifiants invalides.", true);
  }
});

logoutBtn.addEventListener("click", async () => {
  try {
    await window.TripStore.logout();
  } catch {
    // The UI is locked even if the session is already gone server-side.
  }

  state.authenticated = false;
  applyAuthUi();
  setStatus("Session fermee.");
});

uploadBtn.addEventListener("click", async () => {
  const file = imageFileInput.files && imageFileInput.files[0];
  if (!file) {
    setStatus("Choisis une image avant l upload.", true);
    return;
  }

  uploadBtn.disabled = true;
  setStatus("Upload en cours...");

  try {
    const url = await window.TripStore.uploadImage(file);
    imageInput.value = url;
    setStatus("Image uploadée et URL renseignee.");
  } catch (error) {
    setStatus(error.message || "Erreur pendant l upload.", true);
  } finally {
    uploadBtn.disabled = false;
  }
});

async function init() {
  try {
    state.authenticated = await window.TripStore.getAuthStatus();
  } catch {
    state.authenticated = false;
  }

  applyAuthUi();

  if (!state.authenticated) {
    setStatus("Connecte-toi pour gerer les voyages.");
    return;
  }

  try {
    await loadState();
    renderPostList();
  } catch (error) {
    setStatus(error.message || "Impossible de charger les voyages depuis la base.", true);
    renderPostList();
    return;
  }

  if (state.posts[0]) {
    setActivePost(state.posts[0].id);
  } else {
    resetForNewPost();
  }
}

init();
