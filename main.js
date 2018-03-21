let config = {
    apiKey: "AIzaSyBZ2Se4cy0I0DSlcWBoj2FrB3DCxkmSHYo",
    authDomain: "animewatchlist-3d4f5.firebaseapp.com",
    databaseURL: "https://animewatchlist-3d4f5.firebaseio.com",
    projectId: "animewatchlist-3d4f5",
    storageBucket: "animewatchlist-3d4f5.appspot.com",
    messagingSenderId: "63655969703"
};

firebase.initializeApp(config);
let db = firebase.firestore();

const currentDate = new Date();

const monday = document.getElementById("Monday");
const tuesday = document.getElementById("Tuesday");
const wednesday = document.getElementById("Wednesday");
const thursday = document.getElementById("Thursday");
const friday = document.getElementById("Friday");
const saturday = document.getElementById("Saturday");
const sunday = document.getElementById("Sunday");

const menuSection = document.getElementById("menu-section");

const signUp = document.getElementById("sign-up");
const login = document.getElementById("login");

signUp.addEventListener("click", createSignUpBox);
login.addEventListener("click", createLoginBox);

let email;

//check login status
let loggedIn = firebase.auth().currentUser;
if (!loggedIn) {
    addHelpText();
}

//call code to display users watchlist
firebase.auth().onAuthStateChanged(function(user) {
    clearElement(monday);
    clearElement(tuesday);
    clearElement(wednesday);
    clearElement(thursday);
    clearElement(friday);
    clearElement(saturday);
    clearElement(sunday);
    clearElement(document.getElementById("menu-section"));

    if (user) {
        loggedIn = user;
        email = user.email;
        //alert(email);
        setNavToLoggedIn(email);
        clearElement(document.getElementById("helper-text-box"));
        displayUsersWatchlist(email);
    } else {
        loggedIn = false;
        setNavToLoggedOut();
    }
});

function getNumberOfEpisodesOut(airDateString, currentDate, totalEpisodes) {
    const airDate = new Date(airDateString);
    let episodes = Math.floor((currentDate.getTime() - airDate.getTime()) / 604800000) + 1;
    if (episodes < totalEpisodes) {
        return episodes;
    }
    return totalEpisodes;
}

function submitNewShow() {
    const nameElement = document.getElementById("show-name");
    const totalEpisodesElement = document.getElementById("total-episodes");
    const monthSelectElement = document.getElementById("month-select");
    const weekdaySelectElement = document.getElementById("weekday-select");
    const dayElement = document.getElementById("day");
    const timeElement = document.getElementById("time");
    const yearElement = document.getElementById("year");

    const name = nameElement.value;
    nameElement.value = "";

    const totalEpisodes = totalEpisodesElement.value;
    totalEpisodesElement.value = "";

    const month = monthSelectElement.options[monthSelectElement.selectedIndex].value;
    monthSelectElement.options.selectedIndex = 0;

    const weekday = weekdaySelectElement.options[weekdaySelectElement.selectedIndex].value;
    weekdaySelectElement.options.selectedIndex = 0;

    const day = dayElement.value;
    dayElement.value = "";

    const time = timeElement.value + ":00";
    timeElement.value = "";

    const year = yearElement.value;
    yearElement.value = "";
    
    const newShowObject = {
        Title: name,
        EpisodesWatched: 0,
        Episodes: totalEpisodes,
        Month: month,
        Weekday: weekday,
        Day: day,
        Time: time,
        Year: year
    };

    const username = email;
    if (loggedIn) {
        storeShowInUsersWatchlist(newShowObject, username);
    }
    appendShowElement(newShowObject, username);
}

function storeShowInUsersWatchlist(showObject, username) {
    db.collection(username).doc(showObject.Title).set(showObject)
    .then(function() {
        console.log("Document successfully written!");
    })
    .catch(function(error) {
        console.error("Error writing document: ", error);
    });
}

function displayUsersWatchlist(username) {
    db.collection(username).get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            let show = doc.data();
            appendShowElement(show, username);
        });
    });
}

function appendShowElement(show, username) {
    switch (show.Weekday) {
        case "Monday":
            document.getElementById("Monday").appendChild(createShowElement(show, username));
            break;
        case "Tuesday":
            document.getElementById("Tuesday").appendChild(createShowElement(show, username));
            break;
        case "Wednesday":
            document.getElementById("Wednesday").appendChild(createShowElement(show, username));
            break;
        case "Thursday":
            document.getElementById("Thursday").appendChild(createShowElement(show, username));
            break;
        case "Friday":
            document.getElementById("Friday").appendChild(createShowElement(show, username));
            break;
        case "Saturday":
            document.getElementById("Saturday").appendChild(createShowElement(show, username));
            break;
        case "Sunday":
            document.getElementById("Sunday").appendChild(createShowElement(show, username));
    }
}

function createShowElement(show, username) {
    let daySectionElement = document.getElementById(show.Weekday);

    let div = document.createElement("div");
    div.classList.add("show-element");

    let titleElement = document.createElement("h5");
    let title = document.createTextNode(show.Title);
    titleElement.appendChild(title);

    let totalEpisodesElement = document.createElement("h6");
    let episodes = document.createTextNode("Episodes: " + show.Episodes);
    let totalEpisodes = show.Episodes;
    totalEpisodesElement.appendChild(episodes);

    let availableEpisodesElement = document.createElement("h6");
    let dateString = show.Month + " " + show.Day + ", " + show.Year + " " + show.Time;
    let episodesOut = getNumberOfEpisodesOut(dateString, currentDate, show.Episodes);
    let episodesText = document.createTextNode("Released: " + episodesOut);
    availableEpisodesElement.appendChild(episodesText);

    let watchedEpisodesElement = document.createElement("h6");
    watchedEpisodesElement.classList.add("watched");
    let episodesWatched = show.EpisodesWatched;
    let watchedEpisodesText = document.createTextNode("Watched: " + episodesWatched);
    watchedEpisodesElement.appendChild(watchedEpisodesText);

    let buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");

    let addEpisodeButton = document.createElement("button");
    addEpisodeButton.innerHTML = "+";
    addEpisodeButton.addEventListener("click", () => {
        if (episodesWatched >= episodesOut) {
            //episodesWatched = totalEpisodes - 1;
        } else {
            if (loggedIn) {
                db.collection(username).doc(show.Title).update({
                    EpisodesWatched: episodesWatched + 1
                })
                .then(function() {
                    
                })
                .catch(function(error) {
                    console.error("Error updating document: ", error);
                });
                clearElement(watchedEpisodesElement);
                episodesWatched++;
                let newText = document.createTextNode("Watched: " + episodesWatched);
                watchedEpisodesElement.appendChild(newText);
            } else {
                clearElement(watchedEpisodesElement);
                episodesWatched++;
                let newText = document.createTextNode("Watched: " + episodesWatched);
                watchedEpisodesElement.appendChild(newText);
            }
        }
    });

    let subtractEpisodeButton = document.createElement("button");
    subtractEpisodeButton.innerHTML = "-";
    subtractEpisodeButton.addEventListener("click", () => {
        if (episodesWatched <= 0) {
            //episodesWatched = 1;
        } else {
            if (loggedIn) {
                db.collection(username).doc(show.Title).update({
                    EpisodesWatched: episodesWatched - 1
                })
                .then(function() {
                    
                })
                .catch(function(error) {
                    console.error("Error updating document: ", error);
                });
                clearElement(watchedEpisodesElement);
                episodesWatched--;
                let newText = document.createTextNode("Watched: " + episodesWatched);
                watchedEpisodesElement.appendChild(newText);
            } else {
                clearElement(watchedEpisodesElement);
                episodesWatched--;
                let newText = document.createTextNode("Watched: " + episodesWatched);
                watchedEpisodesElement.appendChild(newText);
            }
        }
    });

    buttonContainer.appendChild(addEpisodeButton);
    buttonContainer.appendChild(subtractEpisodeButton);

    let removeButton = document.createElement("button");
    removeButton.classList.add("remove-button");
    removeButton.innerHTML = "Remove";
    removeButton.addEventListener("click", () => {
        if (loggedIn) {
            db.collection(username).doc(show.Title).delete().then(function() {
                div.parentNode.removeChild(div);
            }).catch(function(error) {
                alert(error);
            });
        } else {
            div.parentNode.removeChild(div);
        }
    });

    div.appendChild(titleElement);
    div.appendChild(totalEpisodesElement);
    div.appendChild(availableEpisodesElement);
    div.appendChild(watchedEpisodesElement);
    div.appendChild(buttonContainer);
    div.appendChild(removeButton);

    return div;
}

function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function deleteElement(element) {
    element.parentNode.removeChild(element);
}

function createSignUpBox() {
    clearElement(menuSection);

    const signUpHeader = document.createElement("h3");
    let headerText = document.createTextNode("Sign Up");
    signUpHeader.appendChild(headerText);

    const signUpBox = document.createElement("div");
    const emailInput = document.createElement("input");
    const passwordInput = document.createElement("input");
    passwordInput.setAttribute("type", "password");
    const submitButton = document.createElement("button");
    const xButton = document.createElement("button");

    emailInput.placeholder = "Email";
    passwordInput.placeholder = "Password";

    submitButton.innerHTML = "Submit";
    submitButton.addEventListener("click", function() {
        createNewUser(emailInput.value, passwordInput.value);
    });

    xButton.innerHTML = "x";
    xButton.addEventListener("click", function() {
        clearElement(menuSection);
    })

    signUpBox.appendChild(signUpHeader);
    signUpBox.appendChild(emailInput);
    signUpBox.appendChild(passwordInput);
    signUpBox.appendChild(submitButton);
    signUpBox.appendChild(xButton);

    signUpBox.classList.add("sign-up-box");

    menuSection.appendChild(signUpBox);
}

function createLoginBox() {
    clearElement(menuSection);

    const signUpHeader = document.createElement("h3");
    let headerText = document.createTextNode("Login");
    signUpHeader.appendChild(headerText);

    const signUpBox = document.createElement("div");
    const emailInput = document.createElement("input");
    const passwordInput = document.createElement("input");
    passwordInput.setAttribute("type", "password");
    const submitButton = document.createElement("button");
    const xButton = document.createElement("button");

    emailInput.placeholder = "Email";
    passwordInput.placeholder = "Password";

    submitButton.innerHTML = "Submit";
    submitButton.addEventListener("click", function() {
        loginUser(emailInput.value, passwordInput.value);
    });

    xButton.innerHTML = "x";
    xButton.addEventListener("click", function() {
        clearElement(menuSection);
    })

    signUpBox.appendChild(signUpHeader);
    signUpBox.appendChild(emailInput);
    signUpBox.appendChild(passwordInput);
    signUpBox.appendChild(submitButton);
    signUpBox.appendChild(xButton);

    signUpBox.classList.add("sign-up-box");

    menuSection.appendChild(signUpBox);
}

function addHelpText() {
    const helpBox = document.getElementById("helper-text-box");

    const wrapperDiv = document.createElement("div");

    const helpTextH5 = document.createElement("h5");
    const helpText = document.createTextNode("Fill out the \"Add Show\" section and click Submit to add to a sample watchlist.");
    helpTextH52 = document.createElement("h5");
    const helpText2 = document.createTextNode(" To create a permanant list click \"Sign Up\" to create an account and login then add shows once logged in.");
    helpTextH5.appendChild(helpText);
    helpTextH52.appendChild(helpText2);
    wrapperDiv.appendChild(helpTextH5);
    wrapperDiv.appendChild(helpTextH52);
    helpBox.appendChild(wrapperDiv);
}

function createNewUser(email, password) {
    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
        let errorCode = error.code;
        let errorMessage = error.message;
        alert(errorMessage);
    });
}

function loginUser(email, password) {
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
        let errorCode = error.code;
        let errorMessage = error.message;
        alert(errorMessage);
    });
}

function signOutUser() {
    console.log("sign out user called");
    firebase.auth().signOut().then(function() {
        setNavToLoggedOut();
        alert("Signed out");
    }).catch(function(error) {
        console.log(error);
    });
}

function setNavToLoggedIn(email) {
    const nav = document.getElementById("nav");
    clearElement(nav);

    const header = document.createElement("h2");
    const headerText = document.createTextNode(`${email}'s Weekly Watchlist`);
    header.appendChild(headerText);

    const signOut = document.createElement("a");
    const signOutText = document.createTextNode("Sign Out");
    signOut.appendChild(signOutText);
    signOut.addEventListener("click", signOutUser);

    nav.appendChild(header);
    nav.appendChild(signOut);
}

function setNavToLoggedOut() {
    const nav = document.getElementById("nav");
    clearElement(nav);

    const header = document.createElement("h2");
    const headerText = document.createTextNode("Weekly Watchlist");
    header.appendChild(headerText);

    const signUp = document.createElement("a");
    const signUpText = document.createTextNode("Sign Up");
    signUp.appendChild(signUpText);
    signUp.addEventListener("click", createSignUpBox);

    const login = document.createElement("a");
    const loginText = document.createTextNode("Login");
    login.appendChild(loginText);
    login.addEventListener("click", createLoginBox);

    nav.appendChild(header);
    nav.appendChild(signUp);
    nav.appendChild(login);
}