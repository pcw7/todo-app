const STORAGE_KEY = "todo-app:v1";
const THEME_KEY = "todo-app:theme";

const CATEGORY_LABELS = {
  work: "업무",
  personal: "개인",
  study: "공부",
};

let currentFilter = "all";

// ---- Data layer ----

function loadTodos() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.todos) ? parsed.todos : [];
  } catch {
    return [];
  }
}

function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ todos }));
}

function addTodo(title, category) {
  const todos = loadTodos();
  todos.push({
    id: "t_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
    title,
    category,
    done: false,
    createdAt: new Date().toISOString(),
  });
  saveTodos(todos);
}

function updateTodo(id, changes) {
  const todos = loadTodos();
  const next = todos.map((t) => (t.id === id ? { ...t, ...changes } : t));
  saveTodos(next);
}

function deleteTodo(id) {
  const todos = loadTodos();
  saveTodos(todos.filter((t) => t.id !== id));
}

function restoreTodo(todo, index) {
  const todos = loadTodos();
  const at = Math.min(index, todos.length);
  todos.splice(at, 0, todo);
  saveTodos(todos);
}

function toggleDone(id) {
  const todos = loadTodos();
  const next = todos.map((t) =>
    t.id === id ? { ...t, done: !t.done } : t
  );
  saveTodos(next);
}

function clearAllTodos() {
  saveTodos([]);
}

// ---- Theme ----

function getEffectiveTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function renderThemeToggle() {
  const isDark = getEffectiveTheme() === "dark";
  themeToggle.setAttribute("aria-pressed", String(isDark));
}

// ---- DOM references ----

const addForm = document.getElementById("add-form");
const todoInput = document.getElementById("todo-input");
const categorySelect = document.getElementById("category-select");
const addBtn = document.getElementById("add-btn");
const todoList = document.getElementById("todo-list");
const emptyState = document.getElementById("empty-state");
const filters = document.getElementById("filters");
const filterButtons = filters.querySelector(".filter-buttons");
const resetAllBtn = document.getElementById("reset-all-btn");
const themeToggle = document.getElementById("theme-toggle");
const storyBar = document.getElementById("story-bar");
const progressCount = document.getElementById("progress-count");
const progressPercent = document.getElementById("progress-percent");
const progressBreakdown = document.getElementById("progress-breakdown");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toast-message");
const toastUndoBtn = document.getElementById("toast-undo");

// ---- Undo toast ----

let pendingUndo = null;
let undoTimer = null;

function showUndoToast(todo, index) {
  pendingUndo = { todo, index };
  toastMessage.textContent = `"${todo.title}" 삭제됨`;
  toast.classList.add("is-visible");
  clearTimeout(undoTimer);
  undoTimer = setTimeout(hideUndoToast, 5000);
}

function hideUndoToast() {
  toast.classList.remove("is-visible");
  pendingUndo = null;
}

// ---- Rendering ----

function render() {
  const todos = loadTodos();
  renderProgress(todos);
  renderList(todos);
}

function renderProgress(todos) {
  const total = todos.length;
  const doneCount = todos.filter((t) => t.done).length;
  const percent = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  progressCount.textContent = `${doneCount} / ${total}`;
  progressPercent.textContent = `${percent}%`;

  storyBar.classList.toggle("is-empty", total === 0);
  storyBar.innerHTML = todos
    .map((_, i) => `<div class="story-segment${i < doneCount ? " is-done" : ""}"></div>`)
    .join("");

  const remainingByCategory = { work: 0, personal: 0, study: 0 };
  todos.forEach((t) => {
    if (!t.done) remainingByCategory[t.category]++;
  });

  progressBreakdown.innerHTML = `
    <div class="breakdown-title">남은 항목</div>
    <div class="breakdown-grid">
      <div class="breakdown-col">
        <span class="breakdown-cat cat-work">업무</span>
        <span class="breakdown-value">${remainingByCategory.work}</span>
      </div>
      <div class="breakdown-col">
        <span class="breakdown-cat cat-personal">개인</span>
        <span class="breakdown-value">${remainingByCategory.personal}</span>
      </div>
      <div class="breakdown-col">
        <span class="breakdown-cat cat-study">공부</span>
        <span class="breakdown-value">${remainingByCategory.study}</span>
      </div>
    </div>
  `;
}

function renderList(todos) {
  const filtered =
    currentFilter === "all"
      ? todos
      : todos.filter((t) => t.category === currentFilter);

  const sorted = [...filtered].sort((a, b) => Number(a.done) - Number(b.done));

  todoList.innerHTML = "";
  emptyState.style.display = sorted.length === 0 ? "block" : "none";

  sorted.forEach((todo) => {
    todoList.appendChild(renderTodoItem(todo));
  });
}

function renderTodoItem(todo) {
  const li = document.createElement("li");
  li.className = "todo-item" + (todo.done ? " is-done" : "");
  li.dataset.id = todo.id;

  const checkWrap = document.createElement("label");
  checkWrap.className = "check-wrap";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "todo-checkbox";
  checkbox.checked = todo.done;
  checkbox.setAttribute("aria-label", `"${todo.title}" 완료로 표시`);
  checkbox.addEventListener("change", () => {
    toggleDone(todo.id);
    render();
  });

  const checkRing = document.createElement("span");
  checkRing.className = "check-ring";

  checkWrap.append(checkbox, checkRing);

  const title = document.createElement("span");
  title.className = "todo-title";
  title.textContent = todo.title;
  title.title = "클릭하면 수정할 수 있습니다";
  title.tabIndex = 0;
  title.setAttribute("role", "button");
  title.setAttribute("aria-label", `"${todo.title}" 제목 수정`);
  title.addEventListener("click", () => startEditing(li, todo));
  title.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      startEditing(li, todo);
    }
  });

  const categorySelectInline = document.createElement("select");
  categorySelectInline.className = "category-pill cat-" + todo.category;
  categorySelectInline.style.border = "none";
  categorySelectInline.style.appearance = "none";
  categorySelectInline.setAttribute("aria-label", `"${todo.title}" 카테고리`);
  Object.entries(CATEGORY_LABELS).forEach(([value, label]) => {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = label;
    if (value === todo.category) opt.selected = true;
    categorySelectInline.appendChild(opt);
  });
  categorySelectInline.addEventListener("change", (e) => {
    updateTodo(todo.id, { category: e.target.value });
    render();
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "✕";
  deleteBtn.setAttribute("aria-label", `"${todo.title}" 삭제`);
  deleteBtn.addEventListener("click", () => {
    const index = loadTodos().findIndex((t) => t.id === todo.id);
    deleteTodo(todo.id);
    showUndoToast(todo, index);
    render();
  });

  li.append(checkWrap, title, categorySelectInline, deleteBtn);
  return li;
}

function startEditing(li, todo) {
  const titleEl = li.querySelector(".todo-title");
  const input = document.createElement("input");
  input.type = "text";
  input.className = "todo-title-input";
  input.value = todo.title;

  function commit() {
    const value = input.value.trim();
    if (value) {
      updateTodo(todo.id, { title: value });
    }
    render();
  }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") render();
  });
  input.addEventListener("blur", commit);

  titleEl.replaceWith(input);
  input.focus();
  input.select();
}

// ---- Events ----

todoInput.addEventListener("input", () => {
  addBtn.disabled = todoInput.value.trim().length === 0;
});

addForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = todoInput.value.trim();
  if (!title) return;
  addTodo(title, categorySelect.value);
  todoInput.value = "";
  addBtn.disabled = true;
  todoInput.focus();
  render();
});

resetAllBtn.addEventListener("click", () => {
  if (loadTodos().length === 0) return;
  const confirmed = window.confirm("모든 할 일을 삭제할까요? 되돌릴 수 없습니다.");
  if (!confirmed) return;
  clearAllTodos();
  clearTimeout(undoTimer);
  hideUndoToast();
  render();
});

toastUndoBtn.addEventListener("click", () => {
  if (!pendingUndo) return;
  restoreTodo(pendingUndo.todo, pendingUndo.index);
  clearTimeout(undoTimer);
  hideUndoToast();
  render();
});

filterButtons.addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-btn");
  if (!btn) return;
  currentFilter = btn.dataset.filter;
  [...filterButtons.children].forEach((b) => {
    const isActive = b === btn;
    b.classList.toggle("is-active", isActive);
    b.setAttribute("aria-pressed", String(isActive));
  });
  render();
});

themeToggle.addEventListener("click", () => {
  const next = getEffectiveTheme() === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, next);
  document.documentElement.setAttribute("data-theme", next);
  renderThemeToggle();
});

if (window.matchMedia) {
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (!localStorage.getItem(THEME_KEY)) renderThemeToggle();
  });
}

render();
renderThemeToggle();
