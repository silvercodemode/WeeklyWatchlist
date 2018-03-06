const currentDate = new Date();

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

const monday = document.getElementById("Monday");
const tuesday = document.getElementById("Tuesday");
const wednesday = document.getElementById("Wednesday");
const thursday = document.getElementById("Thursday");
const friday = document.getElementById("Friday");
const saturday = document.getElementById("Saturday");
const sunday = document.getElementById("Sunday");

//check login cookie

//call code to display users watchlist
displayUsersWatchlist("AnimeGirlsBestGirls");

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

    const weekday = weekdaySelectElement.options[weekdaySelectElement.selectedIndex].value;

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

    const username = "AnimeGirlsBestGirls";
    storeShowInUsersWatchlist(newShowObject, username);
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
        db.collection(username).doc(show.Title).update({
            EpisodesWatched: episodesWatched + 1
        })
        .then(function() {
            clearElement(watchedEpisodesElement);
            episodesWatched++;
            let newText = document.createTextNode("Watched: " + episodesWatched);
            watchedEpisodesElement.appendChild(newText);
        })
        .catch(function(error) {
            console.error("Error updating document: ", error);
        });
    });

    let subtractEpisodeButton = document.createElement("button");
    subtractEpisodeButton.innerHTML = "-";
    subtractEpisodeButton.addEventListener("click", () => {
        db.collection(username).doc(show.Title).update({
            EpisodesWatched: episodesWatched - 1
        })
        .then(function() {
            clearElement(watchedEpisodesElement);
            episodesWatched--;
            let newText = document.createTextNode("Watched: " + episodesWatched);
            watchedEpisodesElement.appendChild(newText);
        })
        .catch(function(error) {
            console.error("Error updating document: ", error);
        });
    });

    buttonContainer.appendChild(addEpisodeButton);
    buttonContainer.appendChild(subtractEpisodeButton);

    let removeButton = document.createElement("button");
    removeButton.classList.add("remove-button");
    removeButton.innerHTML = "Remove";
    removeButton.addEventListener("click", () => {
        db.collection(username).doc(show.Title).delete().then(function() {
            div.parentNode.removeChild(div);
        }).catch(function(error) {
            alert(error);
        });
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