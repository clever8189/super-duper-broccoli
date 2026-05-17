const SUPABASE_URL = "https://zrurwwebknifxzaqtxtx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpydXJ3d2Via25pZnh6YXF0eHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMjUyMzcsImV4cCI6MjA5NDYwMTIzN30.Ygl0oV8-t7EUSGEDCZOyIYpCJfXZrWESvyOmDIXpm5k";

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

async function loadGames() {
  const { data, error } = await db
    .from("games")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error(error); return []; }
  return data;
}

async function saveGame(game) {
  const { error } = await db.from("games").insert([game]);
  if (error) throw error;
}

async function deleteGameById(id) {
  const { error } = await db.from("games").delete().eq("id", id);
  if (error) throw error;
}

if (document.getElementById("list")) {

  let activeFilter = "all";

  window.filter = function(f) {
    activeFilter = f;
    document.querySelectorAll("#filters button").forEach(b => b.classList.remove("active"));
    event.target.classList.add("active");
    render();
  };

  async function render() {
    const list  = document.getElementById("list");
    const empty = document.getElementById("empty");
    list.innerHTML = "<p style='color:#aaa'>Загрузка…</p>";

    const games = await loadGames();
    const filtered = activeFilter === "all" ? games : games.filter(g => g.type === activeFilter);

    empty.hidden = filtered.length > 0;
    list.innerHTML = filtered.map(g => `
      <div class="game-row" onclick='openModal(${JSON.stringify(g).replace(/'/g, "&#39;")})'>
        <div>
          <b>${g.title}</b><br>
          <small>${g.type === "gift" ? "Подарок" : "Аккаунт"}</small>
        </div>
        <div class="game-price">
          ${g.price} ₽
          ${g.steam ? `<s>${g.steam} ₽</s>` : ""}
        </div>
      </div>
    `).join("");
  }

  window.openModal = function(g) {
    document.getElementById("m-title").textContent = g.title;
    document.getElementById("m-type").textContent  = g.type === "gift" ? "Подарок" : "Аккаунт";
    document.getElementById("m-price").textContent = g.price + " ₽";
    document.getElementById("m-steam").textContent = g.steam ? g.steam + " ₽" : "";
    document.getElementById("modal").hidden = false;
  };

  window.closeModal = function() {
    document.getElementById("modal").hidden = true;
  };

  document.getElementById("modal").addEventListener("click", function(e) {
    if (e.target === this) closeModal();
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

  render();
}
