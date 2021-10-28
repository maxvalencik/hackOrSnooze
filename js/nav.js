"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".nav-center").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

/** Show Create New Story form when click on submit */

function navSubmitClick(evt) {
  console.debug("navSubmitClick", evt);

  hidePageComponents();
  $submitForm.show();
}

$navSubmit.on("click", navSubmitClick);


/** Show list of favorites for currentUser when clicked on 'favorites' */

function navFavoritesClick(evt) {
  console.debug("navFavoritesClick", evt);

  hidePageComponents();
  listFavoriteStories();
}

$body.on("click", "#nav-favorites", navFavoritesClick);

/** Show list of favorites for currentUser when clicked on 'favorites' */

function navMyStoriesClick(evt) {
  console.debug("navMyStoriesClick", evt);

  hidePageComponents();
  listMyStories();
}

$body.on("click", "#nav-my-stories", navMyStoriesClick);


/** Create user profile page and update username */

function userProfile(evt) {
  console.debug("userProfile");

  hidePageComponents();
  $userProfile.show();

  $("#name").val(currentUser.name);
  $("#username").val(currentUser.username);
  $("#date").text(currentUser.createdAt.slice(0, 10));
}

$body.on("click", '#nav-user-profile', userProfile);


async function updateUsername(evt){
  const newName = $("#name").val();
  const newUser = $("#username").val();

  //API update with PATCH request
  await axios({
      url: `${BASE_URL}/users/${currentUser.username}`,
      method: "PATCH",
      data: {token: currentUser.loginToken, user: {name: newName, username: newUser} },
    });

    //update local variables
    currentUser.username = newUser;
    currentUser.name = newName

    saveUserCredentialsInLocalStorage();
    updateUIOnUserLogin();
}

$body.on("click",'#user-button', updateUsername);