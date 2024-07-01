document.addEventListener("DOMContentLoaded", () => {
  // Select elements from the DOM
  const searchBox = document.getElementById("searchBox");
  const searchBtn = document.getElementById("search-btn");
  const recipeContainer = document.getElementById("recipe-container");
  const recipePopup = document.getElementById("recipe-popup");
  const recipeCloseBtn = document.getElementById("recipe-close-btn");
  const recipeDetailsContent = document.getElementById(
    "recipe-details-content"
  );
  const favoritesLink = document.getElementById("favorites-link");
  const favoritesContainer = document.getElementById("favorites-container");

  let favorites = []; // Array to store favorite meals IDs

  // Event Listener for Search Button
  searchBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const recipeName = searchBox.value.trim();
    if (recipeName) {
      await recipeList(recipeName);
    } else {
      console.log("Please enter a meal name.");
    }
  });

  // Function to Fetch and Display Recipes
  const recipeList = async (query) => {
    try {
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      displayRecipes(data.meals);
    } catch (error) {
      console.error("Error fetching data:", error);
      displayNoResultMessage();
    }
  };

  // Function to Display Recipes
  const displayRecipes = (meals) => {
    recipeContainer.innerHTML = "";
    if (meals) {
      meals.forEach((meal) => {
        const recipeElement = createRecipeElement(meal);
        recipeContainer.appendChild(recipeElement);
      });
    } else {
      displayNoResultMessage();
    }
  };

  // Function to Display No Result Message
  const displayNoResultMessage = () => {
    recipeContainer.innerHTML = "<p>No recipes found.</p>";
  };

  // Function to Create Recipe Element
  const createRecipeElement = (meal) => {
    const recipeElement = document.createElement("div");
    recipeElement.classList.add("recipe");
    recipeElement.innerHTML = `
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
      <div class="recipe-content">
        <h3>${meal.strMeal}</h3>
        <p><strong>Category:</strong> ${meal.strCategory}</p>
        <div class="recipe-buttons">
          <button class="view-recipe-btn" data-meal-id="${
            meal.idMeal
          }">View Recipe</button>
          <button class="favorite-btn ${
            favorites.includes(meal.idMeal) ? "favorite" : ""
          }" data-meal-id="${meal.idMeal}">
            <i class="${
              favorites.includes(meal.idMeal) ? "fa" : "fa"
            } fa-heart"></i>
          </button>
        </div>
      </div>
    `;

    // Event Listener for View Recipe Button
    const viewRecipeBtn = recipeElement.querySelector(".view-recipe-btn");
    viewRecipeBtn.addEventListener("click", () => {
      openRecipePopup(meal.idMeal);
    });

    // Event Listener for Favorite Button
    const favoriteBtn = recipeElement.querySelector(".favorite-btn");
    favoriteBtn.addEventListener("click", () => {
      toggleFavorite(meal.idMeal);
    });

    return recipeElement;
  };

  // Function to Open Recipe Popup
  const openRecipePopup = async (mealId) => {
    const meal = await getMealById(mealId);
    if (meal) {
      const recipeHTML = `
        <h2>${meal.strMeal}</h2>
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        <p><strong>Category:</strong> ${meal.strCategory}</p>
        <p><strong>Instructions:</strong> ${meal.strInstructions}</p>
        <p><strong>Ingredients:</strong></p>
        <ul>
          ${getIngredients(meal).join("")}
        </ul>
      `;
      recipeDetailsContent.innerHTML = recipeHTML;
      recipePopup.style.display = "block";
    } else {
      recipeDetailsContent.innerHTML = "<p>No meal found.</p>";
      recipePopup.style.display = "block"; // Show popup with no meal found message
    }
  };

  // Function to Get Meal by ID
  const getMealById = async (mealId) => {
    try {
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      return data.meals ? data.meals[0] : null;
    } catch (error) {
      console.error("Error fetching meal by ID:", error);
      return null;
    }
  };

  // Function to Get Ingredients from Meal Object
  const getIngredients = (meal) => {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      if (meal[`strIngredient${i}`]) {
        ingredients.push(`
          <li>${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}</li>
        `);
      } else {
        break;
      }
    }
    return ingredients;
  };

  // Function to Toggle Favorite
  const toggleFavorite = (mealId) => {
    const favoriteBtn = document.querySelector(
      `.favorite-btn[data-meal-id="${mealId}"]`
    );
    const isFavorite = favorites.includes(mealId);
    if (isFavorite) {
      // Remove from favorites
      const index = favorites.indexOf(mealId);
      favorites.splice(index, 1);
      favoriteBtn.classList.remove("favorite");
      favoriteBtn.innerHTML = `<i class="fa fa-heart"></i>`;
    } else {
      // Add to favorites
      favorites.push(mealId);
      favoriteBtn.classList.add("favorite");
      favoriteBtn.innerHTML = `<i class="fa fa-heart"></i>`;
    }
    // Update localStorage with new favorites array
    localStorage.setItem("favorites", JSON.stringify(favorites));
    // Update favorites link UI (this is just for demonstration, actual functionality depends on your implementation)
    updateFavoritesLinkUI();
  };

  // Function to Update Favorites Link UI (for demonstration purposes)
  const updateFavoritesLinkUI = () => {
    favoritesLink.innerHTML = `<i class="fa fa-heart"></i> Favorites (${favorites.length})`;
  };

  // Event Listener for Close Recipe Popup Button
  recipeCloseBtn.addEventListener("click", () => {
    recipePopup.style.display = "none";
  });

  // Event Listener for Favorites Link (Just for UI, actual functionality removed)
  favoritesLink.addEventListener("click", async () => {
    // Show favorites UI or perform other actions
    console.log("Favorites clicked");
    // Clear favorites container first
    favoritesContainer.innerHTML = ``;

    // Populate favoritesContainer with favorite recipes
    for (const mealId of favorites) {
      const meal = await getMealById(mealId);
      if (meal) {
        const favoriteElement = createRecipeElement(meal);
        favoritesContainer.appendChild(favoriteElement);
      }
    }
    // Show favorites container and hide recipe container
    // Check if back button is already appended, if not, append it
    if (!favoritesContainer.contains(backButton)) {
      favoritesContainer.appendChild(backButton);
    }

    favoritesContainer.style.display = "grid";
    recipeContainer.style.display = "none";
  });

  // Initially hide recipe popup
  recipePopup.style.display = "none";

  // Initial UI update for favorites link
  updateFavoritesLinkUI();

  // Load favorites from localStorage if available
  if (localStorage.getItem("favorites")) {
    favorites = JSON.parse(localStorage.getItem("favorites"));
  }

  // Define the back button globally
  const backButton = document.createElement("button");
  backButton.textContent = "Back";
  backButton.classList.add("back-button"); // Add the back-button class
  backButton.addEventListener("click", () => {
    favoritesContainer.style.display = "none"; // Hide favorites container
    recipeContainer.style.display = "grid"; // Display recipe container
  });
});
