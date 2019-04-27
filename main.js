/* START FUNCTION ASSIGNMENTS */

//Functions that call firebase that request or submit data, login, or sign out
const createNewUser = async (email, password) => {
  toggleLoadingSpinner(helperTextBox);
  try {
    await firebase.auth().createUserWithEmailAndPassword(email, password);
    await loginUser(email, password);
  } catch (error) {
    showErrorText(helperTextBox, error);
  } finally {
    toggleLoadingSpinner(helperTextBox);
  }
};

const displayUsersWatchlist = async username => {
  toggleLoadingSpinner(helperTextBox);
  try {
    const querySnapshot = await db.collection(username).get();
    const showsObject = getSortedShowObjectFromQuery(querySnapshot);
    for (let day in showsObject) {
      showsObject[day].forEach(show => {
        appendShowElement(show, username);
      });
    }
  } catch (error) {
    showErrorText(helperTextBox, error);
  } finally {
    toggleLoadingSpinner(helperTextBox);
  }
};

const loginUser = async (email, password) => {
  toggleLoadingSpinner(helperTextBox);
  try {
    await firebase.auth().signInWithEmailAndPassword(email, password);
  } catch (error) {
    showErrorText(helperTextBox, error);
  } finally {
    toggleLoadingSpinner(helperTextBox);
  }
};

const signOutUser = async () => {
  toggleLoadingSpinner(helperTextBox);
  try {
    await firebase.auth().signOut();
  } catch (error) {
    showErrorText(helperTextBox, error);
  } finally {
    toggleLoadingSpinner(helperTextBox);
  }
};

const storeShowInUsersWatchlist = async (showObject, username) => {
  db.collection(username)
    .doc(showObject.Title)
    .set(showObject);
};

const submitNewShow = async () => {
  const newShowObject = createShowObjectFromAddShowInputFields();
  if (newShowObject) {
    try {
      const user = firebase.auth().currentUser;
      if (user) {
        await storeShowInUsersWatchlist(newShowObject, user.email);
        appendShowElement(newShowObject, user.email);
      } else {
        appendShowElement(newShowObject);
      }
    } catch (error) {
      showErrorText(helperTextBox, error);
    }
  } else {
    showErrorText(
      helperTextBox,
      'Name field cannot be empty. Total Episodes must be a number.'
    );
  }
};

//Functions that modify the DOM and return nothing
const addHelpText = () => {
  const helpBox = document.getElementById('helper-text-box');

  const wrapperDiv = document.createElement('div');

  const helpText = document.createElement('h5');
  helpText.textContent =
    'Fill out the "Add Show" show section with a currently airing weekly show and click submit to test out. Sign up with an email, login, and fill out your list afterwards to save.';
  helpText.classList.add('help-text');
  wrapperDiv.appendChild(helpText);

  helpBox.appendChild(wrapperDiv);
};

const addInstallButton = () => {
  if (
    deferredPrompt !== undefined &&
    !window.matchMedia('(display-mode: standalone)').matches
  ) {
    const installButton = document.createElement('button');
    installButton.textContent = 'Install App';
    installButton.classList.add('submit-button');
    installButton.addEventListener('click', promptUserToAddToHomepage);
    installButtonBox.appendChild(installButton);
  }
};

const appendShowElement = (show, username) => {
  switch (show.Weekday) {
    case 'Monday':
      mondayColumn.appendChild(createShowElement(show, username));
      break;
    case 'Tuesday':
      tuesdayColumn.appendChild(createShowElement(show, username));
      break;
    case 'Wednesday':
      wednesdayColumn.appendChild(createShowElement(show, username));
      break;
    case 'Thursday':
      thursdayColumn.appendChild(createShowElement(show, username));
      break;
    case 'Friday':
      fridayColumn.appendChild(createShowElement(show, username));
      break;
    case 'Saturday':
      saturdayColumn.appendChild(createShowElement(show, username));
      break;
    case 'Sunday':
      sundayColumn.appendChild(createShowElement(show, username));
  }
};

const clearElement = element => {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
};

const displayLoginMenu = () => {
  clearElement(menuSection);
  menuSection.appendChild(createLoginMenuElement());
};

const displaySignUpMenu = () => {
  clearElement(menuSection);
  menuSection.appendChild(createSignUpMenuElement());
};

const setNavToLoggedIn = () => {
  const nav = document.getElementById('nav');
  clearElement(nav);

  const header = document.createElement('h2');
  header.textContent = 'Your Weekly Watchlist';
  nav.appendChild(header);

  const signOut = document.createElement('a');
  signOut.textContent = 'Sign Out';
  signOut.addEventListener('click', signOutUser);
  nav.appendChild(signOut);

  const icon = document.createElement('a');
  icon.textContent = '☰';
  icon.addEventListener('click', toggleMobileNavMenu);
  icon.classList.add('icon');
  nav.appendChild(icon);
};

const setNavToLoggedOut = () => {
  const nav = document.getElementById('nav');
  clearElement(nav);

  const header = document.createElement('h2');
  header.textContent = 'Weekly Watchlist';
  nav.appendChild(header);

  const signUp = document.createElement('a');
  signUp.textContent = 'Sign Up';
  signUp.addEventListener('click', displaySignUpMenu);
  nav.appendChild(signUp);

  const login = document.createElement('a');
  login.textContent = 'Login';
  login.addEventListener('click', displayLoginMenu);
  nav.appendChild(login);

  const icon = document.createElement('a');
  icon.textContent = '☰';
  icon.addEventListener('click', toggleMobileNavMenu);
  icon.classList.add('icon');
  nav.appendChild(icon);
};

const showErrorText = (element, errorText) => {
  clearElement(element);
  const div = document.createElement('div');
  div.classList.add('error-text');
  const text = document.createTextNode(`${errorText} `);
  div.appendChild(text);
  const x = document.createElement('button');
  x.textContent = 'x';
  x.addEventListener('click', () => clearElement(element));
  div.appendChild(x);
  element.appendChild(div);
};

const toggleLoadingSpinner = async element => {
  if (!element.classList.contains('spinner')) {
    clearElement(element);
    element.classList.add('spinner');
  } else {
    clearElement(element);
    element.classList.remove('spinner');
  }
};

const toggleMobileNavMenu = () => {
  const nav = document.getElementById('nav');
  const user = firebase.auth().currentUser;
  if (user) {
    if (nav.childElementCount == 3) {
      const signOutButton = document.createElement('h3');
      signOutButton.textContent = 'Sign Out';
      signOutButton.addEventListener('click', signOutUser);
      nav.appendChild(signOutButton);
    } else {
      setNavToLoggedIn();
    }
  } else {
    if (nav.childElementCount == 4) {
      const loginButton = document.createElement('h3');
      loginButton.textContent = 'Login';
      loginButton.addEventListener('click', displayLoginMenu);
      nav.appendChild(loginButton);

      const signUpButton = document.createElement('h3');
      signUpButton.textContent = 'Sign up';
      signUpButton.addEventListener('click', displaySignUpMenu);
      nav.appendChild(signUpButton);
    } else {
      setNavToLoggedOut();
    }
  }
};

//Functions that return DOM elements
const createLoginMenuElement = () => {
  const loginBox = document.createElement('div');
  loginBox.classList.add('sign-up-box');

  const headerWrapper = document.createElement('div');

  const signUpHeader = document.createElement('h3');
  signUpHeader.textContent = 'Login';
  headerWrapper.appendChild(signUpHeader);

  loginBox.appendChild(headerWrapper);

  const inputWrapper = document.createElement('div');

  const emailInput = document.createElement('input');
  emailInput.placeholder = 'Email';
  inputWrapper.appendChild(emailInput);

  const passwordInput = document.createElement('input');
  passwordInput.setAttribute('type', 'password');
  passwordInput.placeholder = 'Password';
  inputWrapper.appendChild(passwordInput);

  loginBox.appendChild(inputWrapper);

  const buttonWrapper = document.createElement('div');

  const submitButton = document.createElement('button');
  submitButton.textContent = 'Submit';
  submitButton.addEventListener('click', () => {
    loginUser(emailInput.value, passwordInput.value);
  });
  buttonWrapper.appendChild(submitButton);

  const xButton = document.createElement('button');
  xButton.textContent = 'x';
  xButton.addEventListener('click', () => {
    clearElement(menuSection);
  });
  buttonWrapper.appendChild(xButton);

  loginBox.appendChild(buttonWrapper);

  return loginBox;
};

const createShowElement = (show, username = false) => {
  const div = document.createElement('div');
  div.classList.add('show-element');

  const titleElement = document.createElement('h5');
  titleElement.textContent = show.Title;
  div.appendChild(titleElement);

  const timeElementWrapper = document.createElement('div');
  const timeElement = document.createElement('h6');
  let hour = parseInt(show.Time.substring(0, 2));
  if (hour === 0) {
    timeElement.textContent = `12${show.Time.substring(2, 5)} AM`;
  } else if (hour < 12) {
    timeElement.textContent = `${hour}${show.Time.substring(2, 5)} AM`;
  } else if (hour == 12) {
    timeElement.textContent = `${hour}${show.Time.substring(2, 5)} PM`;
  } else {
    hour -= 12;
    timeElement.textContent = `${hour}${show.Time.substring(2, 5)} PM`;
  }
  timeElementWrapper.appendChild(timeElement);
  timeElementWrapper.classList.add('time-section');
  div.appendChild(timeElementWrapper);

  const totalEpisodesElement = document.createElement('h6');
  totalEpisodesElement.textContent = `Episodes: ${show.Episodes}`;
  div.appendChild(totalEpisodesElement);

  const availableEpisodesElement = document.createElement('h6');
  const dateString = `${show.Month} ${show.Day}, ${show.Year} ${show.Time}`;
  const episodesOut = getNumberOfEpisodesOut(
    dateString,
    currentDate,
    show.Episodes
  );
  availableEpisodesElement.textContent = `Released: ${episodesOut}`;
  div.appendChild(availableEpisodesElement);

  const watchedEpisodesElement = document.createElement('h6');
  let episodesWatched = show.EpisodesWatched;
  watchedEpisodesElement.textContent = `Watched: ${episodesWatched}`;
  watchedEpisodesElement.classList.add('watched');
  div.appendChild(watchedEpisodesElement);

  const buttonContainer = document.createElement('div');
  buttonContainer.classList.add('button-container');

  const addEpisodeButton = document.createElement('button');
  addEpisodeButton.textContent = '+';
  addEpisodeButton.addEventListener('click', () => {
    if (episodesWatched < episodesOut) {
      episodesWatched++;
      if (firebase.auth().currentUser && username) {
        (async () => {
          await db
            .collection(username)
            .doc(show.Title)
            .update({
              EpisodesWatched: episodesWatched
            });
          watchedEpisodesElement.textContent = `Watched: ${episodesWatched}`;
        })();
      } else {
        watchedEpisodesElement.textContent = `Watched: ${episodesWatched}`;
      }
    }
  });
  buttonContainer.appendChild(addEpisodeButton);

  const subtractEpisodeButton = document.createElement('button');
  subtractEpisodeButton.textContent = '-';
  subtractEpisodeButton.addEventListener('click', () => {
    if (episodesWatched > 0) {
      episodesWatched--;
      if (firebase.auth().currentUser && username) {
        (async () => {
          await db
            .collection(username)
            .doc(show.Title)
            .update({
              EpisodesWatched: episodesWatched
            });
          watchedEpisodesElement.textContent = `Watched: ${episodesWatched}`;
        })();
      } else {
        watchedEpisodesElement.textContent = `Watched: ${episodesWatched}`;
      }
    }
  });
  buttonContainer.appendChild(subtractEpisodeButton);

  div.appendChild(buttonContainer);

  const removeButton = document.createElement('button');
  removeButton.classList.add('remove-button');
  removeButton.textContent = 'Remove';
  removeButton.addEventListener('click', () => {
    if (firebase.auth().currentUser && username) {
      (async () => {
        await db
          .collection(username)
          .doc(show.Title)
          .delete();
        div.parentNode.removeChild(div);
      })();
    } else {
      div.parentNode.removeChild(div);
    }
  });
  div.appendChild(removeButton);

  return div;
};

const createSignUpMenuElement = () => {
  const signUpBox = document.createElement('div');
  signUpBox.classList.add('sign-up-box');

  const headerWrapper = document.createElement('div');

  const signUpHeader = document.createElement('h3');
  signUpHeader.textContent = 'Sign Up';
  headerWrapper.appendChild(signUpHeader);

  signUpBox.appendChild(headerWrapper);

  const inputWrapper = document.createElement('div');

  const emailInput = document.createElement('input');
  emailInput.placeholder = 'Email';
  inputWrapper.appendChild(emailInput);

  const passwordInput = document.createElement('input');
  passwordInput.placeholder = 'Password';
  passwordInput.setAttribute('type', 'password');
  inputWrapper.appendChild(passwordInput);

  signUpBox.appendChild(inputWrapper);

  const buttonWrapper = document.createElement('div');

  const submitButton = document.createElement('button');
  submitButton.textContent = 'Submit';
  submitButton.addEventListener('click', () => {
    createNewUser(emailInput.value, passwordInput.value);
  });
  buttonWrapper.appendChild(submitButton);

  const xButton = document.createElement('button');
  xButton.textContent = 'x';
  xButton.addEventListener('click', () => {
    clearElement(menuSection);
  });
  buttonWrapper.appendChild(xButton);

  signUpBox.appendChild(buttonWrapper);

  return signUpBox;
};

//Functions that return basic Javascript objects
const createShowObjectFromAddShowInputFields = () => {
  const totalEpisodesElement = document.getElementById('total-episodes');
  const totalEpisodes = totalEpisodesElement.value;
  const nameElement = document.getElementById('show-name');
  const name = nameElement.value;
  if (name && parseInt(totalEpisodes) && totalEpisodes > 0) {
    nameElement.value = '';
    totalEpisodesElement.value = '';

    const dateSelectElement = document.getElementById('date-select');
    const timeSelectElement = document.getElementById('time-select');

    const date = new Date(
      `${dateSelectElement.value}T${timeSelectElement.value}`
    );
    dateSelectElement.value = '2018-01-01';
    timeSelectElement.value = '12:00';

    const month = convertNumericMonthToString(date.getMonth());
    const weekday = convertNumericWeekdayToString(date.getDay());
    const day = date.getDate();
    const hours = date.getHours() > 9 ? date.getHours() : `0${date.getHours()}`;
    const minutes =
      date.getMinutes() > 9 ? date.getMinutes() : `0${date.getMinutes()}`;
    const time = `${hours}:${minutes}:00`;
    const year = date.getFullYear().toString();

    return {
      Title: name,
      EpisodesWatched: 0,
      Episodes: totalEpisodes,
      Month: month,
      Weekday: weekday,
      Day: day,
      Time: time,
      Year: year
    };
  }
};

const getSortedShowObjectFromQuery = querySnapshot => {
  const sortedShowObject = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
  };

  querySnapshot.forEach(doc => {
    const show = doc.data();
    switch (show.Weekday) {
      case 'Sunday':
        sortedShowObject.Sunday.push(show);
        break;
      case 'Monday':
        sortedShowObject.Monday.push(show);
        break;
      case 'Tuesday':
        sortedShowObject.Tuesday.push(show);
        break;
      case 'Wednesday':
        sortedShowObject.Wednesday.push(show);
        break;
      case 'Thursday':
        sortedShowObject.Thursday.push(show);
        break;
      case 'Friday':
        sortedShowObject.Friday.push(show);
        break;
      case 'Saturday':
        sortedShowObject.Saturday.push(show);
    }
  });

  for (let day in sortedShowObject) {
    if (sortedShowObject[day].length > 1) {
      sortedShowObject[day].sort((a, b) => {
        return (
          parseInt(a.Time.substring(0, 2)) * 100 +
          parseInt(a.Time.substring(3, 5)) -
          parseInt(b.Time.substring(0, 2)) * 100 +
          parseInt(b.Time.substring(3, 5))
        );
      });
    }
  }
  return sortedShowObject;
};

//Functions that return Javascript primative types
const convertNumericMonthToString = numericMonth => {
  switch (numericMonth) {
    case 0:
      return 'January';
    case 1:
      return 'February';
    case 2:
      return 'March';
    case 3:
      return 'April';
    case 4:
      return 'May';
    case 5:
      return 'June';
    case 6:
      return 'July';
    case 7:
      return 'August';
    case 8:
      return 'September';
    case 9:
      return 'October';
    case 10:
      return 'November';
    case 11:
      return 'December';
  }
};

const convertNumericWeekdayToString = numericWeekday => {
  switch (numericWeekday) {
    case 0:
      return 'Sunday';
    case 1:
      return 'Monday';
    case 2:
      return 'Tuesday';
    case 3:
      return 'Wednesday';
    case 4:
      return 'Thursday';
    case 5:
      return 'Friday';
    case 6:
      return 'Saturday';
  }
};

const getNumberOfEpisodesOut = (airDateString, currentDate, totalEpisodes) => {
  const airDate = new Date(airDateString);
  const episodes =
    Math.floor((currentDate.getTime() - airDate.getTime()) / 604800000) + 1;
  if (episodes < totalEpisodes) {
    return episodes;
  }
  return totalEpisodes;
};

/* END FUNCTION ASSIGNMENTS */

//register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/WeeklyWatchlist/serviceworker.js', {
      scope: '/WeeklyWatchlist/'
    })
    .then(reg => {
      console.log(`Scope is: ${reg.scope}`);
      console.log('Service worker successfully registered!');
    })
    .catch(error => {
      console.log(`Service worker failed\nError is: ${error}`);
    });
}

//Add to homescreen
let deferredPrompt;

window.addEventListener('beforeinstallprompt', e => {
  console.log('add to home page ready');
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
});

// window.addEventListener('beforeinstallprompt', e => {
//   // Prevent Chrome 67 and earlier from automatically showing the prompt
//   e.preventDefault();
//   // Stash the event so it can be triggered later.
//   deferredPrompt = e;
// });
const body = document.querySelector('body');
const promptUserToAddToHomepage = () => {
  // Show the prompt
  if (deferredPrompt) {
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then(choiceResult => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      deferredPrompt = null;
    });
  }
  body.removeEventListener('click', promptUserToAddToHomepage);
};
//body.addEventListener('click', promptUserToAddToHomepage);

const config = {
  apiKey: 'AIzaSyBZ2Se4cy0I0DSlcWBoj2FrB3DCxkmSHYo',
  authDomain: 'animewatchlist-3d4f5.firebaseapp.com',
  databaseURL: 'https://animewatchlist-3d4f5.firebaseio.com',
  projectId: 'animewatchlist-3d4f5',
  storageBucket: 'animewatchlist-3d4f5.appspot.com',
  messagingSenderId: '63655969703'
};

firebase.initializeApp(config);
const db = firebase.firestore();

const currentDate = new Date();

//setting some dom references that are used a lot to global scope variables
const mondayColumn = document.getElementById('Monday');
const tuesdayColumn = document.getElementById('Tuesday');
const wednesdayColumn = document.getElementById('Wednesday');
const thursdayColumn = document.getElementById('Thursday');
const fridayColumn = document.getElementById('Friday');
const saturdayColumn = document.getElementById('Saturday');
const sundayColumn = document.getElementById('Sunday');
const weekdayColumns = [
  mondayColumn,
  tuesdayColumn,
  wednesdayColumn,
  thursdayColumn,
  fridayColumn,
  saturdayColumn,
  sundayColumn
];
const menuSection = document.getElementById('menu-section');
const helperTextBox = document.getElementById('helper-text-box');
const installButtonBox = document.getElementById('install-button-box');

//set listener on login status
firebase.auth().onAuthStateChanged(user => {
  weekdayColumns.forEach(e => clearElement(e));
  clearElement(helperTextBox);
  clearElement(menuSection);
  if (user) {
    const email = user.email;
    setNavToLoggedIn();
    displayUsersWatchlist(email);
    addInstallButton();
  } else {
    clearElement(installButtonBox);
    setNavToLoggedOut();
    addHelpText();
  }
});
