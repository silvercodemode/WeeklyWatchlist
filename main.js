const config = {
    apiKey: 'AIzaSyBZ2Se4cy0I0DSlcWBoj2FrB3DCxkmSHYo',
    authDomain: 'animewatchlist-3d4f5.firebaseapp.com',
    databaseURL: 'https://animewatchlist-3d4f5.firebaseio.com',
    projectId: 'animewatchlist-3d4f5',
    storageBucket: 'animewatchlist-3d4f5.appspot.com',
    messagingSenderId: '63655969703'
}

firebase.initializeApp(config)
const db = firebase.firestore()

const currentDate = new Date()

//setting some dom references that are used a lot to top scope variables
const mondayColumn = document.getElementById('Monday')
const tuesdayColumn = document.getElementById('Tuesday')
const wednesdayColumn = document.getElementById('Wednesday')
const thursdayColumn = document.getElementById('Thursday')
const fridayColumn = document.getElementById('Friday')
const saturdayColumn = document.getElementById('Saturday')
const sundayColumn = document.getElementById('Sunday')
const menuSection = document.getElementById('menu-section')

//set listener on login status
firebase.auth().onAuthStateChanged(user => {
    clearElement(mondayColumn)
    clearElement(tuesdayColumn)
    clearElement(wednesdayColumn)
    clearElement(thursdayColumn)
    clearElement(fridayColumn)
    clearElement(saturdayColumn)
    clearElement(sundayColumn)
    clearElement(menuSection)

    if (user) {
        const email = user.email
        setNavToLoggedIn(email)
        clearElement(document.getElementById('helper-text-box'))
        displayUsersWatchlist(email)
    } else {
        setNavToLoggedOut()
        addHelpText()
    }
})

//functions that call firebase
async function createNewUser(email, password) {
    try {
        await firebase.auth().createUserWithEmailAndPassword(email, password)
    } catch (error) {
        console.log(error.message)
    }
}

async function loginUser(email, password) {
    try {
        await firebase.auth().signInWithEmailAndPassword(email, password)
        console.log('Logged in successfully!')
    } catch (error) {
        console.log(error.message)
    }
}

async function signOutUser() {
    try {
        await firebase.auth().signOut()
        console.log('Signed out.')
    } catch(error) {
        console.log(error)
    }
}

async function storeShowInUsersWatchlist(showObject, username) {
    try {
        await db.collection(username).doc(showObject.Title).set(showObject)
        console.log(`${showObject.Title} successfully saved!`)
    } catch (error) {
        console.error('Error writing document: ', error)
    }
}

async function displayUsersWatchlist(username) {
    try {
        const querySnapshot = await db.collection(username).get()
        /*
        querySnapshot.forEach(doc => {
            appendShowElement(doc.data(), username)
        })
        */
        const showObject = getSortedShowObject(querySnapshot)
        console.log(showObject)
        for (let day in showObject) {
            showObject[day].forEach(show => {
                appendShowElement(show, username)
            })
        }
    } catch (error) {
        console.error('Error accessing collection: ', error)
    }
}

function submitNewShow() {
    const totalEpisodesElement = document.getElementById('total-episodes')
    const totalEpisodes = totalEpisodesElement.value
    const nameElement = document.getElementById('show-name')
    const name = nameElement.value
    if (name && parseInt(totalEpisodes) && totalEpisodes > 0) {
        nameElement.value = ''
        totalEpisodesElement.value = ''

        const dateSelectElement = document.getElementById('date-select')
        const timeSelectElement = document.getElementById('time-select')

        const date = new Date(`${dateSelectElement.value}T${timeSelectElement.value}`)
        dateSelectElement.value = '2018-01-01'
        timeSelectElement.value = '12:00'

        const month = convertNumericMonthToString(date.getMonth())

        const weekday = convertNumericWeekdayToString(date.getDay())

        const day = date.getDate()

        let hours = date.getHours()
        if (hours < 10) {
            hours = `0${hours}`
        }
        let minutes = date.getMinutes()
        if (minutes < 10) {
            minutes = `0${minutes}`
        }
        const time = `${hours}:${minutes}:00`

        const year = date.getFullYear().toString()

        const newShowObject = {
            Title: name,
            EpisodesWatched: 0,
            Episodes: totalEpisodes,
            Month: month,
            Weekday: weekday,
            Day: day,
            Time: time,
            Year: year
        }

        const user = firebase.auth().currentUser
        if (user) {
            storeShowInUsersWatchlist(newShowObject, user.email)
            appendShowElement(newShowObject, user.email)
        } else {
            appendShowElement(newShowObject)
        }
    } else {
        alert('Name field cannot be empty. Total Episodes must be a number.')
    }
}

//dom manipulation functions
function createSignUpBox() {
    clearElement(menuSection)

    const signUpBox = document.createElement('div')
    signUpBox.classList.add('sign-up-box')

    const headerWrapper = document.createElement('div')

    const signUpHeader = document.createElement('h3')
    signUpHeader.textContent = 'Sign Up'
    headerWrapper.appendChild(signUpHeader)

    signUpBox.appendChild(headerWrapper)

    const inputWrapper = document.createElement('div')

    const emailInput = document.createElement('input')
    emailInput.placeholder = 'Email'
    inputWrapper.appendChild(emailInput)

    const passwordInput = document.createElement('input')
    passwordInput.placeholder = 'Password'
    passwordInput.setAttribute('type', 'password')
    inputWrapper.appendChild(passwordInput)

    signUpBox.appendChild(inputWrapper)

    const buttonWrapper = document.createElement('div')

    const submitButton = document.createElement('button')
    submitButton.textContent = 'Submit'
    submitButton.addEventListener('click', function() {
        createNewUser(emailInput.value, passwordInput.value)
    })
    buttonWrapper.appendChild(submitButton)

    const xButton = document.createElement('button')
    xButton.textContent = 'x'
    xButton.addEventListener('click', function() {
        clearElement(menuSection)
    })
    buttonWrapper.appendChild(xButton)

    signUpBox.appendChild(buttonWrapper)

    menuSection.appendChild(signUpBox)
}

function createLoginBox() {
    clearElement(menuSection)

    const signUpBox = document.createElement('div')
    signUpBox.classList.add('sign-up-box')
    
    const headerWrapper = document.createElement('div')

    const signUpHeader = document.createElement('h3')
    signUpHeader.textContent = 'Login'
    headerWrapper.appendChild(signUpHeader)

    signUpBox.appendChild(headerWrapper)

    const inputWrapper = document.createElement('div')

    const emailInput = document.createElement('input')
    emailInput.placeholder = 'Email'
    inputWrapper.appendChild(emailInput)

    const passwordInput = document.createElement('input')
    passwordInput.setAttribute('type', 'password')
    passwordInput.placeholder = 'Password'
    inputWrapper.appendChild(passwordInput)

    signUpBox.appendChild(inputWrapper)

    const buttonWrapper = document.createElement('div')

    const submitButton = document.createElement('button')
    submitButton.textContent = 'Submit'
    submitButton.addEventListener('click', function() {
        loginUser(emailInput.value, passwordInput.value)
    })
    buttonWrapper.appendChild(submitButton)

    const xButton = document.createElement('button')
    xButton.textContent = 'x'
    xButton.addEventListener('click', function() {
        clearElement(menuSection)
    })
    buttonWrapper.appendChild(xButton)

    signUpBox.appendChild(buttonWrapper)

    menuSection.appendChild(signUpBox)
}

function createShowElement(show, username = false) {
    const daySectionElement = document.getElementById(show.Weekday)

    const div = document.createElement('div')
    div.classList.add('show-element')

    const titleElement = document.createElement('h5')
    titleElement.textContent = show.Title
    div.appendChild(titleElement)

    const timeElementWrapper = document.createElement('div')
    const timeElement = document.createElement('h6')
    let hour = parseInt(show.Time.substring(0,2))
    if (hour === 0) {
        timeElement.textContent = `12${show.Time.substring(2,5)} AM`
    } else if (hour < 12) {
        timeElement.textContent = `${hour}${show.Time.substring(2,5)} AM`
    } else if (hour = 12) {
        timeElement.textContent = `${hour}${show.Time.substring(2,5)} PM`
    } else {
        hour -= 12
        timeElement.textContent = `${hour}${show.Time.substring(2,5)} PM`
    }
    timeElementWrapper.appendChild(timeElement)
    timeElementWrapper.classList.add('time-section')
    div.appendChild(timeElementWrapper)

    const totalEpisodesElement = document.createElement('h6')
    totalEpisodesElement.textContent = `Episodes: ${show.Episodes}`
    const totalEpisodes = show.Episodes
    div.appendChild(totalEpisodesElement)

    const availableEpisodesElement = document.createElement('h6')
    const dateString = `${show.Month} ${show.Day}, ${show.Year} ${show.Time}`
    const episodesOut = getNumberOfEpisodesOut(dateString, currentDate, show.Episodes)
    availableEpisodesElement.textContent = `Released: ${episodesOut}`
    div.appendChild(availableEpisodesElement)

    const watchedEpisodesElement = document.createElement('h6')
    let episodesWatched = show.EpisodesWatched
    watchedEpisodesElement.textContent = `Watched: ${episodesWatched}`
    watchedEpisodesElement.classList.add('watched')
    div.appendChild(watchedEpisodesElement)

    const buttonContainer = document.createElement('div')
    buttonContainer.classList.add('button-container')

    const addEpisodeButton = document.createElement('button')
    addEpisodeButton.textContent = '+'
    addEpisodeButton.addEventListener('click', () => {
        if (episodesWatched < episodesOut) {
            if (firebase.auth().currentUser && username) {
                (async () => {
                    try {
                        await db.collection(username).doc(show.Title).update({
                            EpisodesWatched: episodesWatched + 1
                        })
                        episodesWatched++
                        watchedEpisodesElement.textContent = `Watched: ${episodesWatched}`
                    } catch (error) {
                        console.error('Error updating document: ', error)
                    }
                })()
            } else {
                episodesWatched++
                watchedEpisodesElement.textContent = `Watched: ${episodesWatched}`
            }
        }
    })
    buttonContainer.appendChild(addEpisodeButton)

    const subtractEpisodeButton = document.createElement('button')
    subtractEpisodeButton.textContent = '-'
    subtractEpisodeButton.addEventListener('click', () => {
        if (episodesWatched > 0) {
            if (firebase.auth().currentUser && username) {
                (async () => {
                    try {
                        await db.collection(username).doc(show.Title).update({
                            EpisodesWatched: episodesWatched - 1
                        })
                        episodesWatched--
                        watchedEpisodesElement.textContent = `Watched: ${episodesWatched}`
                    } catch (error) {
                        console.error('Error updating document: ', error)
                    }
                })()
            } else {
                episodesWatched--
                watchedEpisodesElement.textContent = `Watched: ${episodesWatched}`
            }
        }
    })
    buttonContainer.appendChild(subtractEpisodeButton)

    div.appendChild(buttonContainer)

    const removeButton = document.createElement('button')
    removeButton.classList.add('remove-button')
    removeButton.textContent = 'Remove'
    removeButton.addEventListener('click', () => {
        if (firebase.auth().currentUser && username) {
            (async () => {
                try {
                    await db.collection(username).doc(show.Title).delete()
                    div.parentNode.removeChild(div)
                } catch (error) {
                    console.log(error)
                }
            })()
        } else {
            div.parentNode.removeChild(div)
        }
    })
    div.appendChild(removeButton)

    return div
}

function appendShowElement(show, username) {
    switch (show.Weekday) {
        case 'Monday':
            mondayColumn.appendChild(createShowElement(show, username))
            break
        case 'Tuesday':
            tuesdayColumn.appendChild(createShowElement(show, username))
            break
        case 'Wednesday':
            wednesdayColumn.appendChild(createShowElement(show, username))
            break
        case 'Thursday':
            thursdayColumn.appendChild(createShowElement(show, username))
            break
        case 'Friday':
            fridayColumn.appendChild(createShowElement(show, username))
            break
        case 'Saturday':
            saturdayColumn.appendChild(createShowElement(show, username))
            break
        case 'Sunday':
            sundayColumn.appendChild(createShowElement(show, username))
    }
}

function addHelpText() {
    const helpBox = document.getElementById('helper-text-box')

    const wrapperDiv = document.createElement('div')

    const helpText = document.createElement('h5')
    helpText.textContent = 'Fill out the "Add Show" section to try out. Sign up with an email and submit to save.'
    helpText.classList.add('help-text')
    wrapperDiv.appendChild(helpText)

    helpBox.appendChild(wrapperDiv)
}

function setNavToLoggedIn(email) {
    const nav = document.getElementById('nav')
    clearElement(nav)

    const header = document.createElement('h2')
    header.textContent = `${email}'s Weekly Watchlist`
    nav.appendChild(header)

    const signOut = document.createElement('a')
    signOut.textContent = 'Sign Out'
    signOut.addEventListener('click', signOutUser)
    nav.appendChild(signOut)

    const icon = document.createElement('a')
    icon.textContent = '\u{1D306}'
    icon.addEventListener('click', toggleMobileNavMenu)
    icon.classList.add('icon')
    nav.appendChild(icon)
}

function setNavToLoggedOut() {
    const nav = document.getElementById('nav')
    clearElement(nav)

    const header = document.createElement('h2')
    header.textContent = 'Weekly Watchlist'
    nav.appendChild(header)

    const signUp = document.createElement('a')
    signUp.textContent = 'Sign Up'
    signUp.addEventListener('click', createSignUpBox)
    nav.appendChild(signUp)

    const login = document.createElement('a')
    login.textContent = 'Login'
    login.addEventListener('click', createLoginBox)
    nav.appendChild(login)

    const icon = document.createElement('a')
    icon.textContent = '\u{1D306}'
    icon.addEventListener('click', toggleMobileNavMenu)
    icon.classList.add('icon')
    nav.appendChild(icon)
}

function toggleMobileNavMenu() {
    const nav = document.getElementById('nav')
    let user = firebase.auth().currentUser
    if (user) {
        if (nav.childElementCount == 3) {
            const singOutButton = document.createElement('h3')
            singOutButton.textContent = 'Sign Out'
            singOutButton.addEventListener('click', signOutUser)
            nav.appendChild(singOutButton)
        } else {
            setNavToLoggedIn(user.email)
        }
    } else {
        if (nav.childElementCount == 4) {
            const loginButton = document.createElement('h3')
            loginButton.textContent = 'Login'
            loginButton.addEventListener('click', createLoginBox)
            nav.appendChild(loginButton)
        
            const signUpButton = document.createElement('h3')
            signUpButton.textContent = 'Sign up'
            signUpButton.addEventListener('click', createSignUpBox)
            nav.appendChild(signUpButton)
        } else {
            setNavToLoggedOut()
        }
    }
}

//utility functions
function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild)
    }
}

function deleteElement(element) {
    element.parentNode.removeChild(element)
}

function getNumberOfEpisodesOut(airDateString, currentDate, totalEpisodes) {
    const airDate = new Date(airDateString)
    const episodes = Math.floor((currentDate.getTime() - airDate.getTime()) / 604800000) + 1
    if (episodes < totalEpisodes) {
        return episodes
    }
    return totalEpisodes
}

function convertNumericMonthToString(numericMonth) {
    switch (numericMonth) {
        case 0: return 'January'
        case 1: return 'February'
        case 2: return 'March'
        case 3: return 'April'
        case 4: return 'May'
        case 5: return 'June'
        case 6: return 'July'
        case 7: return 'August'
        case 8: return 'September'
        case 9: return 'October'
        case 10: return 'November'
        case 11: return 'December'
    }
}

function convertNumericWeekdayToString(numericWeekday) {
    switch (numericWeekday) {
        case 0: return 'Sunday'
        case 1: return 'Monday'
        case 2: return 'Tuesday'
        case 3: return 'Wednesday'
        case 4: return 'Thursday'
        case 5: return 'Friday'
        case 6: return 'Saturday'
    }
}

function getSortedShowObject(querySnapshot) {
    const sortedShowObject = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: []
    }

    querySnapshot.forEach(doc => {
        let show = doc.data()
        switch (show.Weekday) {
            case 'Sunday':
                sortedShowObject.Sunday.push(show)
                break;
            case 'Monday':
                sortedShowObject.Monday.push(show)
                break;
            case 'Tuesday':
                sortedShowObject.Tuesday.push(show)
                break;
            case 'Wednesday':
                sortedShowObject.Wednesday.push(show)
                break;
            case 'Thursday':
                sortedShowObject.Thursday.push(show)
                break;
            case 'Friday':
                sortedShowObject.Friday.push(show)
                break;
            case 'Saturday':
                sortedShowObject.Saturday.push(show)
        }
    })

    for (let day in sortedShowObject) {
        if (sortedShowObject[day].length > 1) {
            sortedShowObject[day].sort((a, b) => {
                return parseInt(a.Time.substring(0,2)) * 100 + parseInt(a.Time.substring(3,5)) - parseInt(b.Time.substring(0,2)) * 100 + parseInt(b.Time.substring(3,5))
            })
        }
    }
    return sortedShowObject
}