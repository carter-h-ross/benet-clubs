console.log("student.js file");
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"; // Import signInWithPopup
import { getDatabase, ref, set, get } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB4LwmH1s7oKi-Io9ifl89y0InCcX6amVM",
    authDomain: "benet-clubs.firebaseapp.com",
    databaseURL: "https://benet-clubs-default-rtdb.firebaseio.com",
    projectId: "benet-clubs",
    storageBucket: "benet-clubs.appspot.com",
    messagingSenderId: "694644139594",
    appId: "1:694644139594:web:9424f32102a144d46c68b3",
    measurementId: "G-BP4ELWR5P3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firebase Storage
const storage = getStorage();
//Initialize firebase
const auth = getAuth();
const provider = new GoogleAuthProvider();
let email = null;
// Initialize firebase realtime database
const database = getDatabase();
const databaseRef = ref(database);

// Function to load clubs with a certain category
async function loadClubsByCategory(category) {
    try {
        const snapshot = await get(databaseRef); // Retrieve data from Firebase database
        const data = snapshot.val(); // Extract the JSON object from the snapshot
        const clubs = data.db.students.clubs; // Get the clubs data
        
        // Sort the clubs alphabetically by club name
        clubs.sort((a, b) => a.clubName.localeCompare(b.clubName));

        const clubsContainer = document.getElementById("clubsContainer");
        clubsContainer.innerHTML = ""; // Clear previous content

        clubs.forEach(club => {
            if (club.category == category || category == "all") {
                const clubContainer = document.createElement("div");
                clubContainer.classList.add("club-container");
                clubContainer.classList.add("pointer");

                // Create and append club logo if available
                if (club.logo) {
                    const clubLogo = document.createElement("img");
                    clubLogo.classList.add("club-logo");
                    clubLogo.src = club.logo;
                    clubContainer.appendChild(clubLogo);
                }

                // Create and append club details
                const clubDetails = document.createElement("div");
                clubDetails.innerHTML = `<h2>${club.clubName}</h2>
                                         <p class = "hidden">${club.clubDescription}</p>
                                         <p>Contact: ${club.contacts}</p>`;
                clubContainer.appendChild(clubDetails);

                clubsContainer.appendChild(clubContainer);
            }
        });

        console.log("Clubs loaded successfully.");
        setupClubContainerListeners();
    } catch (error) {
        console.error("Error loading clubs:", error);
    }
}

// loading content to the database when the website is loaded
document.addEventListener("DOMContentLoaded", function() {
    populateEvents();
});

function setupClubContainerListeners() {
    const clubContainers = document.querySelectorAll(".club-container");
    clubContainers.forEach(clubContainer => {
        clubContainer.addEventListener("click", function() {
            expandClubView(this);
        });
    });
}

function expandClubView(clubContainer) {
    // Remove any existing club logo from the expanded club view
    const existingClubLogo = document.querySelector(".club-logo-expanded");
    if (existingClubLogo) {
        existingClubLogo.remove();
    }

    // Add a class to the body to indicate that the club view is expanded
    document.body.classList.add("expanded-club-view");

    console.log(clubContainer);
    const clubName = clubContainer.querySelector("h2").textContent;
    const paragraphs = clubContainer.querySelectorAll("p");
    const clubDescription = paragraphs[0].textContent;
    const clubContacts = paragraphs[1].textContent;

    console.log(clubName);
    console.log(paragraphs);
    console.log(clubDescription);
    console.log(clubContacts);

    document.getElementById("expandedClubName").textContent = clubName;
    document.getElementById("expandedClubDescription").textContent = clubDescription;
    document.getElementById("expandedClubContacts").textContent = clubContacts;

    // Create and append club logo to the expanded club view
    const clubLogo = document.createElement("img");
    clubLogo.classList.add("club-logo-expanded");
    clubLogo.src = clubContainer.querySelector(".club-logo").src; // Get the source from the clicked club container
    document.getElementById("expandedClubDetails").prepend(clubLogo);

    document.getElementById("expandedClubView").style.display = "block";
}

async function populateEvents() {
    try {
        const snapshot = await get(databaseRef); // Retrieve data from Firebase database
        const data = snapshot.val(); // Extract the JSON object from the snapshot
        const weeklySchedule = data.db.general.weeklySchedule; // Get the weekly schedule data
        
        // Loop through each day of the week and populate events
        Object.keys(weeklySchedule).forEach(day => {
            const events = weeklySchedule[day];
            const dayElement = document.getElementById(day);
            if (dayElement) {
                dayElement.innerHTML = ""; // Clear previous events
                events.forEach((event, index) => {
                    const eventElement = document.createElement("div");
                    eventElement.textContent = event;
                    if (index < events.length - 1) {
                        eventElement.innerHTML += "<hr>"; // Add line break if not the last event
                    }
                    dayElement.appendChild(eventElement);
                });
            }
        });

        console.log("Events populated successfully.");
    } catch (error) {
        console.error("Error populating events:", error);
    }
}

const expandedClubViewBackButton = document.getElementById("backButton")
expandedClubViewBackButton.addEventListener("click", () => {
    // Remove the class from the body when the club view is closed
    document.body.classList.remove("expanded-club-view");
    
    document.getElementById("expandedClubView").style.display = "none";
});

loadClubsByCategory("all")