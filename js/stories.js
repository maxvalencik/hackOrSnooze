"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  console.debug("generateStoryMarkup", story);


  let star = '';
  let favStatus = ''; 
  let trashCan = '';
  
  //Check if story is a currentUser favorite to load the stars accordingly
  if (currentUser){
    star = '&star;';
    favStatus = 'notFav';

    for (let s of currentUser.favorites){
      if (s.storyId === story.storyId){
        star = '&starf;';
        favStatus = 'fav';
        break;
      }
    }

    for (let s of currentUser.ownStories){
      if (s.storyId === story.storyId){
        trashCan = '&#128465';
        break;
      }
    }
  }

  const hostName = story.getHostName();

  return $(`
      
      <li id="${story.storyId}"> 
        <span class="star ${favStatus}">${star}</span>
        <span class="trash-can">${trashCan}</span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** Function to submit the new story to the API and show it on the page */

async function submitStory(evt){
  console.debug("submitStory");
  evt.preventDefault();

  //get story details from the form
  const title = $titleInput.val();
  const author = $authorInput.val();
  const url = $urlInput.val();

  const newStory =  await storyList.addStory(currentUser, {author, title, url});

  // Create the markup for the new story and prepend to the html
  $allStoriesList.prepend(generateStoryMarkup(newStory));
  $submitForm.hide();
  $allStoriesList.show();
}

$submitButton.on("click", submitStory);


/** Function that allows a logged in user to star or un-star a story (favorites on/off)*/

async function makeRemoveFavorite(evt) {
  console.debug("makeFavorite");
  const $star = $(evt.target);

  //find the story selected in the list of stories array
  const clickedStory = $star.closest("li").attr("id");
  const story = storyList.stories.find(elt => elt.storyId === clickedStory);

  // check if fav or not and act accordingly
  if ($star.hasClass("fav")) {
    $star.removeClass("fav").addClass("notFav");
    $star.html("&star;");
    await currentUser.removeFav(story);
    
    //update favorite stories html list
    listFavoriteStories();

  } else {
    $star.removeClass("notFav").addClass("fav");
    $star.html("&starf;");
    await currentUser.addFav(story);
  }
}

$allStoriesList.on("click",'.star', makeRemoveFavorite);
$favoriteStories.on("click",'.star', makeRemoveFavorite);


/** Create list of favorite stories for user */

function listFavoriteStories() {
  console.debug("listFavoriteStories");

  $favoriteStories.empty();

  if (currentUser.favorites.length !== 0) {

    for (let story of currentUser.favorites) {
      $favoriteStories.append(generateStoryMarkup(story));
    }
  } else {
    $favoriteStories.append("<h5>No favorites yet...</h5>");
  }

  $favoriteStories.show();
}


/** Create list of stories from user (my stories*/

function listMyStories() {
  console.debug("listMyStories");

  $myStories.empty();

  if (currentUser.ownStories.length !== 0) {

    for (let story of currentUser.ownStories) {
      $myStories.append(generateStoryMarkup(story));
    }
  } else {
    $myStories.append("<h5>No stories yet...</h5>");
  }

  $myStories.show();
}


/** Delete a story by clicking on trash can */

async function deleteStory(evt) {
  console.debug("deleteStory");

  const $trashCan = $(evt.target);
  //find the story selected in the list of stories array
  const clickedStory = $trashCan.closest("li").attr("id");
  
  await storyList.removeStory(clickedStory, currentUser);
  // re-create story list
  await listMyStories(); //id on user page
  $trashCan.closest("li").remove();//if on story list page just remove the li
}

$myStories.on("click", ".trash-can", deleteStory);
$allStoriesList.on("click",'.trash-can', deleteStory);
$favoriteStories.on("click",'.trash-can', deleteStory);

