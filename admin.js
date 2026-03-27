const postList = document.getElementById("postList");
const editorForm = document.getElementById("editorForm");
const statusMsg = document.getElementById("statusMsg");
const deleteBtn = document.getElementById("deleteBtn");
const newPostBtn = document.getElementById("newPostBtn");

const postIdInput = document.getElementById("postId");
const titleInput = document.getElementById("title");
const dateInput = document.getElementById("date");
const locationInput = document.getElementById("location");
const imageInput = document.getElementById("image");
const videoInput = document.getElementById("video");

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
  activeId: ""
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

function loadState() {
  state.posts = window.TripStore.loadPosts();
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

editorForm.addEventListener("submit", event => {
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

  const savedPost = window.TripStore.upsertPost(payload);
  loadState();
  setActivePost(savedPost.id);
  setStatus("Voyage enregistre.");
});

deleteBtn.addEventListener("click", () => {
  const activeId = postIdInput.value.trim();
  if (!activeId) {
    return;
  }

  window.TripStore.deletePost(activeId);
  loadState();
  resetForNewPost();
  setStatus("Voyage supprime.");
});

loadState();
renderPostList();
if (state.posts[0]) {
  setActivePost(state.posts[0].id);
} else {
  resetForNewPost();
}
