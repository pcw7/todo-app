const STORAGE_KEY = "todo-app:v1";

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

// ---- DOM references ----

const addForm = document.getElementById("add-form");
const todoInput = document.getElementById("todo-input");
const categorySelect = document.getElementById("category-select");
const todoList = document.getElementById("todo-list");
const emptyState = document.getElementById("empty-state");
const filters = document.getElementById("filters");
const resetAllBtn = document.getElementById("reset-all-btn");
const progressCount = document.getElementById("progress-count");
const progressPercent = document.getElementById("progress-percent");
const progressBarFill = document.getElementById("progress-bar-fill");
const progressBreakdown = document.getElementById("progress-breakdown");

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
  progressBarFill.style.width = `${percent}%`;

  const remainingByCategory = { work: 0, personal: 0, study: 0 };
  todos.forEach((t) => {
    if (!t.done) remainingByCategory[t.category]++;
  });

  progressBreakdown.innerHTML = Object.entries(remainingByCategory)
    .map(
      ([cat, count]) =>
        `<span>${CATEGORY_LABELS[cat]} 남은 항목 ${count}개</span>`
    )
    .join("");
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

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "todo-checkbox";
  checkbox.checked = todo.done;
  checkbox.addEventListener("change", () => {
    toggleDone(todo.id);
    render();
  });

  const title = document.createElement("span");
  title.className = "todo-title";
  title.textContent = todo.title;
  title.title = "클릭하면 수정할 수 있습니다";
  title.addEventListener("click", () => startEditing(li, todo));

  const categorySelectInline = document.createElement("select");
  categorySelectInline.className = "category-pill cat-" + todo.category;
  categorySelectInline.style.border = "none";
  categorySelectInline.style.appearance = "none";
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
  deleteBtn.setAttribute("aria-label", "삭제");
  deleteBtn.addEventListener("click", () => {
    deleteTodo(todo.id);
    render();
  });

  li.append(checkbox, title, categorySelectInline, deleteBtn);
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

addForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = todoInput.value.trim();
  if (!title) return;
  addTodo(title, categorySelect.value);
  todoInput.value = "";
  todoInput.focus();
  render();
});

resetAllBtn.addEventListener("click", () => {
  if (loadTodos().length === 0) return;
  const confirmed = window.confirm("모든 할 일을 삭제할까요? 되돌릴 수 없습니다.");
  if (!confirmed) return;
  clearAllTodos();
  render();
});

filters.addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-btn");
  if (!btn) return;
  currentFilter = btn.dataset.filter;
  [...filters.children].forEach((b) =>
    b.classList.toggle("is-active", b === btn)
  );
  render();
});

render();
