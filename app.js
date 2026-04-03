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
  const safeImage = typeof post.image === "string" ? post.image.trim() : "";
  const excerpt = getExcerpt(post);
  const imageMarkup = safeImage
    ? `<img src="${safeImage}" alt="${post.title}" loading="lazy" />`
    : `<div class="image-placeholder" aria-hidden="true">Pas d image</div>`;
  const videoMarkup = safeVideo
    ? `<div class="video-wrap"><iframe src="${safeVideo}" title="Video ${post.title}" loading="lazy" allowfullscreen></iframe></div>`
    : "";

  card.innerHTML = `
    ${imageMarkup}
    <div class="card-body">
      <p class="meta">${post.date} - ${post.location}</p>
      <h3>${post.title}</h3>
      <p>${excerpt}</p>
      ${videoMarkup}
    </div>
  `;

  return card;
}

function createMessageCard(message) {
  const card = document.createElement("article");
  card.className = "post-card post-card-message";
  card.innerHTML = `
    <div class="card-body">
      <h3>Aucun voyage a afficher</h3>
      <p>${message}</p>
    </div>
  `;

  return card;
}

async function renderPosts() {
  postGrid.innerHTML = "";
  state.posts = await window.TripStore.loadPosts();

  if (state.posts.length === 0) {
    postGrid.appendChild(createMessageCard("La base de donnees ne contient encore aucun recit."));
    return;
  }

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
  try {
    await renderPosts();
  } catch (error) {
    postGrid.innerHTML = "";
    postGrid.appendChild(
      createMessageCard(error.message || "Impossible de charger les voyages depuis la base de donnees.")
    );
  }

  setupRevealOnScroll();
}

init();
