'use strict';



const STORAGE_KEY = 'pantrybook.recipes';


const seedRecipes = [
  {
    id: 'r1', title: 'Lemon Garlic Butter Chicken', course: 'Main', cuisine: 'American',
    time: 30, servings: 4, difficulty: 'Easy', emoji: '🍳', favorite: true,
    ingredients: ['4 chicken thighs', '3 tbsp butter', '4 cloves garlic, minced', '1 lemon, juiced', '1 tsp thyme', 'Salt and pepper'],
    steps: ['Season chicken with salt and pepper.', 'Sear chicken in butter until golden, about 6 minutes per side.', 'Add garlic and thyme, cook 1 minute.', 'Stir in lemon juice and simmer 3 minutes.', 'Serve warm with the pan sauce spooned over.']
  },
  {
    id: 'r2', title: 'Weeknight Tomato Basil Soup', course: 'Soup', cuisine: 'Italian',
    time: 25, servings: 3, difficulty: 'Easy', emoji: '🍲', favorite: false,
    ingredients: ['2 tbsp olive oil', '1 onion, chopped', '2 cans crushed tomatoes', '2 cups vegetable stock', 'Handful fresh basil', 'Salt to taste'],
    steps: ['Sauté onion in olive oil until soft.', 'Add tomatoes and stock, bring to a simmer.', 'Cook 15 minutes, stirring occasionally.', 'Blend until smooth, stir in torn basil.', 'Season to taste and serve hot.']
  },
  {
    id: 'r3', title: 'Paneer Butter Masala', course: 'Main', cuisine: 'Indian',
    time: 40, servings: 4, difficulty: 'Medium', emoji: '🍛', favorite: true,
    ingredients: ['250g paneer, cubed', '2 tomatoes, pureed', '1 onion, pureed', '2 tbsp butter', '2 tbsp cream', '1 tsp garam masala', '1 tsp Kashmiri chili powder'],
    steps: ['Fry the onion puree in butter until golden.', 'Add tomato puree and spices, cook until oil separates.', 'Stir in cream and 1/2 cup water, simmer 5 minutes.', 'Add paneer cubes and simmer 5 more minutes.', 'Garnish with cream and serve with naan.']
  },
  {
    id: 'r4', title: 'Crunchy Peanut Noodle Salad', course: 'Salad', cuisine: 'Thai',
    time: 20, servings: 2, difficulty: 'Easy', emoji: '🥗', favorite: false,
    ingredients: ['200g rice noodles', '2 tbsp peanut butter', '1 tbsp soy sauce', '1 tbsp lime juice', '1 carrot, julienned', '2 tbsp crushed peanuts'],
    steps: ['Cook noodles per package instructions and drain.', 'Whisk peanut butter, soy sauce and lime juice into a dressing.', 'Toss noodles with dressing and carrot.', 'Top with crushed peanuts and serve.']
  },
  {
    id: 'r5', title: 'Overnight Cinnamon Oats', course: 'Breakfast', cuisine: 'American',
    time: 10, servings: 1, difficulty: 'Easy', emoji: '🥘', favorite: false,
    ingredients: ['1/2 cup rolled oats', '1/2 cup milk', '1/4 tsp cinnamon', '1 tbsp honey', 'Fruit to top'],
    steps: ['Combine oats, milk, cinnamon and honey in a jar.', 'Stir well and refrigerate overnight.', 'Top with fresh fruit before serving.']
  },
  {
    id: 'r6', title: 'Rustic No-Knead Bread', course: 'Baking', cuisine: 'French',
    time: 180, servings: 8, difficulty: 'Hard', emoji: '🍞', favorite: false,
    ingredients: ['3 cups flour', '1/4 tsp instant yeast', '1.5 tsp salt', '1.5 cups warm water'],
    steps: ['Mix flour, yeast and salt, then stir in water until a shaggy dough forms.', 'Cover and let rest at room temperature for 12–18 hours.', 'Shape into a ball and rest 30 minutes.', 'Bake in a covered Dutch oven at 230°C for 30 minutes.', 'Uncover and bake 15 more minutes until deep golden.']
  }
];

/* ---------- State ---------- */
let recipes = loadRecipes();
let editingId = null;

/* ---------- Storage helpers ---------- */
function loadRecipes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Could not read saved recipes, using starter data.', e);
  }
  return seedRecipes.slice();
}

function saveRecipes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}


const recipeGrid = document.getElementById('recipeGrid');
const emptyState = document.getElementById('emptyState');
const resultsCount = document.getElementById('resultsCount');
const searchInput = document.getElementById('searchInput');
const categorySelect = document.getElementById('categorySelect');
const difficultySelect = document.getElementById('difficultySelect');
const favOnly = document.getElementById('favOnly');
const sortSelect = document.getElementById('sortSelect');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');
const emptyClearBtn = document.getElementById('emptyClearBtn');

const addRecipeBtn = document.getElementById('addRecipeBtn');
const formModal = document.getElementById('formModal');
const detailModal = document.getElementById('detailModal');
const recipeForm = document.getElementById('recipeForm');
const formTitle = document.getElementById('formTitle');
const toast = document.getElementById('toast');



function populateCategoryOptions() {
  const courses = Array.from(new Set(recipes.map(r => r.course))).sort();
  categorySelect.innerHTML = '<option value="all">All courses</option>' +
    courses.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
}

function getFilteredRecipes() {
  const q = searchInput.value.trim().toLowerCase();
  const course = categorySelect.value;
  const difficulty = difficultySelect.value;
  const onlyFav = favOnly.checked;

  let list = recipes.filter(r => {
    const matchesQuery = !q ||
      r.title.toLowerCase().includes(q) ||
      r.ingredients.some(i => i.toLowerCase().includes(q));
    const matchesCourse = course === 'all' || r.course === course;
    const matchesDifficulty = difficulty === 'all' || r.difficulty === difficulty;
    const matchesFav = !onlyFav || r.favorite;
    return matchesQuery && matchesCourse && matchesDifficulty && matchesFav;
  });

  const sortBy = sortSelect.value;
  const difficultyRank = { Easy: 0, Medium: 1, Hard: 2 };
  list.sort((a, b) => {
    if (sortBy === 'time') return a.time - b.time;
    if (sortBy === 'difficulty') return difficultyRank[a.difficulty] - difficultyRank[b.difficulty];
    return a.title.localeCompare(b.title);
  });

  return list;
}

function renderGrid() {
  const list = getFilteredRecipes();

  recipeGrid.innerHTML = '';
  if (list.length === 0) {
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;
    list.forEach(recipe => recipeGrid.appendChild(buildRecipeCard(recipe)));
  }

  resultsCount.textContent = list.length === recipes.length
    ? `Showing all ${recipes.length} recipes`
    : `Showing ${list.length} of ${recipes.length} recipes`;

  updateStats();
}

function buildRecipeCard(recipe) {
  const card = document.createElement('article');
  card.className = 'recipe-card';
  card.tabIndex = 0;

  card.innerHTML = `
    <div class="recipe-card-top">
      <span class="recipe-emoji" aria-hidden="true">${recipe.emoji}</span>
      <button class="fav-btn ${recipe.favorite ? 'active' : ''}" data-id="${recipe.id}" aria-label="Toggle favorite">★</button>
    </div>
    <h3>${escapeHtml(recipe.title)}</h3>
    <span class="badge">${escapeHtml(recipe.course)}</span>
    <div class="recipe-meta">
      <span>⏱ ${recipe.time} min</span>
      <span>🍽 ${recipe.servings} servings</span>
      <span>${recipe.difficulty}</span>
    </div>
    <div class="card-actions">
      <button class="edit-btn" data-id="${recipe.id}">Edit</button>
      <button class="delete-btn" data-id="${recipe.id}">Delete</button>
    </div>
  `;

  // Open detail view when the card body (not buttons) is clicked
  card.addEventListener('click', (e) => {
    if (e.target.closest('button')) return;
    openDetail(recipe.id);
  });
  card.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') openDetail(recipe.id);
  });

  card.querySelector('.fav-btn').addEventListener('click', () => toggleFavorite(recipe.id));
  card.querySelector('.edit-btn').addEventListener('click', () => openEditForm(recipe.id));
  card.querySelector('.delete-btn').addEventListener('click', () => deleteRecipe(recipe.id));

  return card;
}

function updateStats() {
  document.getElementById('statTotal').textContent = recipes.length;
  document.getElementById('statCuisines').textContent = new Set(recipes.map(r => r.cuisine)).size;
  document.getElementById('statFavorites').textContent = recipes.filter(r => r.favorite).length;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}


function openDetail(id) {
  const recipe = recipes.find(r => r.id === id);
  if (!recipe) return;

  document.getElementById('detailContent').innerHTML = `
    <div class="detail-head">
      <span class="recipe-emoji" aria-hidden="true">${recipe.emoji}</span>
      <div>
        <h2 id="detailTitle">${escapeHtml(recipe.title)}</h2>
        <span class="badge">${escapeHtml(recipe.course)} · ${escapeHtml(recipe.cuisine)}</span>
      </div>
    </div>
    <div class="detail-meta">
      <span>⏱ ${recipe.time} minutes</span>
      <span>🍽 Serves ${recipe.servings}</span>
      <span>📊 ${recipe.difficulty}</span>
    </div>
    <div class="detail-columns">
      <div>
        <h3>Ingredients</h3>
        <ul>${recipe.ingredients.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul>
      </div>
      <div>
        <h3>Method</h3>
        <ol>${recipe.steps.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ol>
      </div>
    </div>
  `;
  detailModal.hidden = false;
}



function openAddForm() {
  editingId = null;
  formTitle.textContent = 'Add a recipe';
  recipeForm.reset();
  document.getElementById('recipeId').value = '';
  clearFormErrors();
  formModal.hidden = false;
  document.getElementById('titleInput').focus();
}

function openEditForm(id) {
  const recipe = recipes.find(r => r.id === id);
  if (!recipe) return;
  editingId = id;
  formTitle.textContent = 'Edit recipe';
  clearFormErrors();

  document.getElementById('recipeId').value = recipe.id;
  document.getElementById('titleInput').value = recipe.title;
  document.getElementById('courseInput').value = recipe.course;
  document.getElementById('cuisineInput').value = recipe.cuisine;
  document.getElementById('timeInput').value = recipe.time;
  document.getElementById('servingsInput').value = recipe.servings;
  document.getElementById('difficultyInput').value = recipe.difficulty;
  document.getElementById('ingredientsInput').value = recipe.ingredients.join('\n');
  document.getElementById('stepsInput').value = recipe.steps.join('\n');
  document.getElementById('emojiInput').value = recipe.emoji;

  formModal.hidden = false;
  document.getElementById('titleInput').focus();
}

function clearFormErrors() {
  ['titleError', 'timeError', 'ingredientsError', 'stepsError'].forEach(id => {
    document.getElementById(id).textContent = '';
  });
}

function validateForm(data) {
  let valid = true;
  clearFormErrors();

  if (!data.title || data.title.trim().length < 2) {
    document.getElementById('titleError').textContent = 'Please enter a recipe name (2+ characters).';
    valid = false;
  }
  if (!data.time || data.time < 1 || data.time > 600) {
    document.getElementById('timeError').textContent = 'Enter a cook time between 1 and 600 minutes.';
    valid = false;
  }
  if (data.ingredients.length < 2) {
    document.getElementById('ingredientsError').textContent = 'List at least 2 ingredients, one per line.';
    valid = false;
  }
  if (data.steps.length < 1) {
    document.getElementById('stepsError').textContent = 'Add at least 1 method step.';
    valid = false;
  }
  return valid;
}

recipeForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const data = {
    title: document.getElementById('titleInput').value.trim(),
    course: document.getElementById('courseInput').value.trim() || 'Main',
    cuisine: document.getElementById('cuisineInput').value.trim() || 'Other',
    time: parseInt(document.getElementById('timeInput').value, 10),
    servings: parseInt(document.getElementById('servingsInput').value, 10) || 1,
    difficulty: document.getElementById('difficultyInput').value,
    emoji: document.getElementById('emojiInput').value,
    ingredients: document.getElementById('ingredientsInput').value.split('\n').map(s => s.trim()).filter(Boolean),
    steps: document.getElementById('stepsInput').value.split('\n').map(s => s.trim()).filter(Boolean)
  };

  if (!validateForm(data)) return;

  if (editingId) {
    const idx = recipes.findIndex(r => r.id === editingId);
    recipes[idx] = { ...recipes[idx], ...data };
    showToast('Recipe updated.');
  } else {
    recipes.push({ id: 'r' + Date.now(), favorite: false, ...data });
    showToast('Recipe added.');
  }

  saveRecipes();
  populateCategoryOptions();
  renderGrid();
  closeModals();
});



function deleteRecipe(id) {
  const recipe = recipes.find(r => r.id === id);
  if (!recipe) return;
  const confirmed = window.confirm(`Delete "${recipe.title}"? This can't be undone.`);
  if (!confirmed) return;

  recipes = recipes.filter(r => r.id !== id);
  saveRecipes();
  populateCategoryOptions();
  renderGrid();
  showToast('Recipe deleted.');
}

function toggleFavorite(id) {
  const recipe = recipes.find(r => r.id === id);
  if (!recipe) return;
  recipe.favorite = !recipe.favorite;
  saveRecipes();
  renderGrid();
}



function closeModals() {
  formModal.hidden = true;
  detailModal.hidden = true;
}

let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 2400);
}

document.querySelectorAll('[data-close-modal]').forEach(btn => {
  btn.addEventListener('click', closeModals);
});
[formModal, detailModal].forEach(modal => {
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModals(); });
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModals(); });



[searchInput, categorySelect, difficultySelect, favOnly, sortSelect].forEach(el => {
  el.addEventListener('input', renderGrid);
  el.addEventListener('change', renderGrid);
});

clearFiltersBtn.addEventListener('click', resetFilters);
emptyClearBtn.addEventListener('click', resetFilters);

function resetFilters() {
  searchInput.value = '';
  categorySelect.value = 'all';
  difficultySelect.value = 'all';
  favOnly.checked = false;
  sortSelect.value = 'name';
  renderGrid();
}

addRecipeBtn.addEventListener('click', openAddForm);


populateCategoryOptions();
renderGrid();
