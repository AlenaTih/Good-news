import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, update } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings = {
    databaseURL: "https://realtime-database-67683-default-rtdb.europe-west1.firebasedatabase.app/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const goodNewsinDB = ref(database, "goodNews")

const inputNewsEl = document.getElementById("input-news")
const inputFromEl = document.getElementById("input-from")
const inputDateEl = document.getElementById("input-date")

const publishButtonEl = document.getElementById("publish-btn")
const newsFeedEl = document.getElementById("news-feed")

const thankYouEl = document.getElementById("thankyou-message")

inputNewsEl.addEventListener("keypress", function(event) {
    // If the user presses the "Enter" key on the keyboard
    if (event.key === "Enter") {
      // Cancel the default action, if needed
      event.preventDefault()
      // Trigger the button element with a click
      publishButtonEl.click()
    }
  })

inputFromEl.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault()
        publishButtonEl.click()
    }
})

inputDateEl.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault()
        publishButtonEl.click()
    }
})

publishButtonEl.addEventListener("click", function() {
    // Validation check. Check if news input field is not empty
    if (!inputNewsEl.value.trim()) {
        alert("Please type in your news ❤️")
        return
    }

    // The trim() function ensures that even if the user only enters white spaces,
    // it still counts as empty.
    // It trims any white space from the beginning and end of the input value.

    // The "!" is a logical "NOT" operator. It inverts the truthiness of the value
    // that follows it.
    // It checks if the trimmed value is falsy (an empty string here).

    let inputValue = {
        date: inputDateEl.value,
        news: inputNewsEl.value,
        from: inputFromEl.value,
        like: "🖤",
        likesCount: 0
    }

    
    push(goodNewsinDB, inputValue)

    // Clear the input fiedls after the button is clicked
    clearInputFields()

     // Show thank you message
    thankYouEl.style.display = "block"
     setTimeout( function() {
         thankYouEl.style.opacity = "1"
     }, 10);  // Slight delay to ensure the fade-in effect plays
 
     // Hide the thank you message after 3 seconds
     setTimeout( function() {
         thankYouEl.style.opacity = "0"
         setTimeout( function() {
             thankYouEl.style.display = "none"
         }, 1000)  // Hide after the fade-out effect completes
     }, 3000)


})

onValue(goodNewsinDB, function(snapshot) {
    if (snapshot.exists()) {
        
        clearNewsFeedEl()

        let newsObj = snapshot.val()
        for (let key in newsObj) {
            prependNewsToNewsFeedEl(newsObj[key], key)
        }
    } else {
        newsFeedEl.innerHTML += "No items here... yet"
    }
})

function clearNewsFeedEl() {
    newsFeedEl.innerHTML = ""
}

function clearInputFields() {
    inputDateEl.value = ""
    inputNewsEl.value = ""
    inputFromEl.value = ""
}

function prependNewsToNewsFeedEl(item, key) {

    for(let i = 0; i < 1; i++) {
        let newNews = item.news
        let newFrom = item.from
        let newDate = item.date
        let likesSymbol = item.like
        let likesNumber = item.likesCount


        let newEl = document.createElement("li")
        
        newEl.innerHTML =
            `<div class="newsItem"> 
                <div>
                    <h4>${newDate}</h4>
                    <br><br>
                    <p>${newNews}</p>
                    <br><br>
                    <h4>${newFrom}</h4>
                </div>
                <div class="like">
                    <button class="like-button" data-key="${key}">${likesSymbol}</button>
                    <h8 class="like-me">${likesNumber}</h8>
                </div>
            </div>`

        newsFeedEl.prepend(newEl)

        // Check if this item was previously liked by the user
        if (localStorage.getItem(`liked-${key}`)) {
            // Indicate it's already liked
            newEl.querySelector(".like-button").setAttribute("data-liked", "true")
        }

        newEl.querySelector(".like-button").addEventListener("click", function(e) {
           let btn = e.target
           let itemKey = btn.dataset.key
           let countEl = newEl.querySelector(".like-me")
           let number = Number(countEl.textContent)

            // Check if the news item is already liked
            if (btn.getAttribute("data-liked") === "true") {
                //Unlike the news item
                number -= 1 // Decrement like count
                localStorage.removeItem(`liked-${itemKey}`) // Remove from local storage
                btn.removeAttribute("data-liked") // Mark as unliked
            } else {
                // Like the news item
                number +=1 // Increment like count
                localStorage.setItem(`liked-${itemKey}`, true) // Save to local storage
                btn.setAttribute("data-liked", "true") // Mark as liked
            }

           countEl.textContent = number // Update what is rendered (display)

           // Update the database
           let itemRef = ref(database, `goodNews/${itemKey}`)
           update(itemRef, {
            likesCount: number
           })
        })
    }
}
