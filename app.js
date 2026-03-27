const postGrid = document.getElementById("postGrid");

const state = {
  posts: []
};

function toPlainText(html) {
  const temp = document.createElement("div");
  temp.innerHTML = html || "";
  return (temp.textContent || "").trim();
}

function getExcerpt(post) {
  const text = toPlainText(post.content || post.summary || "");
  if (text.length <= 160) {
    return text;
  }

  return `${text.slice(0, 160)}...`;
}

function createPostCard(post, index) {
  const card = document.createElement("article");
  card.className = "post-card";
  card.style.animationDelay = `${Math.min(index * 80, 320)}ms`;

  const safeVideo = typeof post.video === "string" ? post.video.trim() : "";
  const excerpt = getExcerpt(post);
  const videoMarkup = safeVideo
    ? `<div class="video-wrap"><iframe src="${safeVideo}" title="Video ${post.title}" loading="lazy" allowfullscreen></iframe></div>`
    : "";

  card.innerHTML = `
    <img src="${post.image}" alt="${post.title}" loading="lazy" />
    <div class="card-body">
      <p class="meta">${post.date} - ${post.location}</p>
      <h3>${post.title}</h3>
      <p>${excerpt}</p>
      ${videoMarkup}
    </div>
  `;

  return card;
}

async function renderPosts() {
  state.posts = await window.TripStore.loadPosts();
  postGrid.innerHTML = "";

  state.posts.forEach((post, index) => {
    postGrid.appendChild(createPostCard(post, index));
  });
}

function setupRevealOnScroll() {
  const revealElements = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
        }
      });
    },
    { threshold: 0.18 }
  );

  revealElements.forEach(element => observer.observe(element));
}

async function init() {
  await renderPosts();
  setupRevealOnScroll();
}

init();
