// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"; // Import signInWithPopup
import { getDatabase, ref, set, get} from "firebase/database";
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
let indexes = {

}
let indexCount = 0;

const loginButton = document.getElementById("signInButton");
console.log(loginButton);

loginButton.addEventListener('click', (e) => {
    signInWithPopup(auth, provider)
        .then(async (result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;
            email = user.email;
            console.log(email);

            // Check if the user's email is in the trusted emails list
            const trustedEmails = await get(ref(database, 'db/general/trustedEmails'));
            const trustedEmailsList = trustedEmails.val();
            if (trustedEmailsList && trustedEmailsList.includes(email)) {
                // Redirect to admin.html
                window.location.href = 'admin.html';
            } else {
                // Redirect to student.html
                window.location.href = 'student.html';
            }
        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            const credential = GoogleAuthProvider.credentialFromError(error);
            console.error(`error code: ${errorCode} | error message: ${errorMessage} | auth credential type used: ${credential}`);
        });
});

// Set the user's email in local storage outside of the signInWithPopup callback
auth.onAuthStateChanged(user => {
    if (user) {
        email = user.email;
        localStorage.setItem('userEmail', email);
    }
});

async function fillDatabase() {
    try {

        // Define the template structure
        const templateData = {
            db: {
                general: {
                    clubCategories: ["category 1", "category 2"],
                    weeklySchedule: {
                        mon: ["event 1", "event 2"],
                        tue: ["event 1", "event 2"],
                        wed: ["event 1", "event 2"],
                        thu: ["event 1", "event 2"],
                        fri: ["event 1", "event 2"],
                        sat: ["event 1", "event 2"],
                        sun: ["event 1", "event 2"],
                    },
                    trustedEmails: ["carter.h.ross.5176@gmail.com", "4carter.ross@benet.org", "sfrey@benet.org"],
                },
                admins: {
                    nextWeekEventProposals: {
                        mon: ["event 1", "event 2"],
                        tue: ["event 1", "event 2"],
                        wed: ["event 1", "event 2"],
                        thu: ["event 1", "event 2"],
                        fri: ["event 1", "event 2"],
                        sat: ["event 1", "event 2"],
                        sun: ["event 1", "event 2"],
                    },
                    clubProposals: [
                        {
                            category: "category 1",
                            clubName: "club 3",
                            clubDescription: "This is a description of the third club. This club meets on fridays after school",
                            contacts: ["4carter.ross@benet.org"],
                            logo: "gs://benet-clubs.appspot.com/test-1.jpg",
                        },
                        {
                            category: "category 2",
                            clubName: "club 4",
                            clubDescription: "This is a description of the fourth club. This club meets on fridays after school",
                            contacts: ["4carter.ross@benet.org"],
                            logo: "gs://benet-clubs.appspot.com/test-2.jpg",
                        },
                    ]
                },
                students: {
                    clubs: [
                        {
                            category: "category 1",
                            clubName: "club 1",
                            clubDescription: "This is a description of the first club. This club meets on wednesdays after school",
                            contacts: ["4carter.ross@benet.org"],
                            logo: "gs://benet-clubs.appspot.com/test-2.jpg",
                        },
                        {
                            category: "category 2",
                            clubName: "club 2",
                            clubDescription: "This is a description of the second club. This club meets on mondays after school",
                            contacts: ["4carter.ross@benet.org"],
                            logo: "gs://benet-clubs.appspot.com/test-1.jpg",
                        },
                    ],
                }
            }
        };

        await set(databaseRef, templateData);
        console.log("Firebase database filled with template structure successfully.");
    } catch (error) {
        console.error("Error filling Firebase database:", error);
    }
}

// Function to upload image file to Firebase Storage
async function uploadImageFile(imageFile) {
    try {
        // Create a reference to the location where the image will be stored in Firebase Storage
        const storageReference = storageRef(storage, 'images/' + imageFile.name); // 'images/' is the path where the images will be stored
        // Upload the image file to the specified location
        const snapshot = await uploadBytes(storageReference, imageFile);
        console.log("Image uploaded successfully:", snapshot);
        // You can get the download URL of the uploaded image using snapshot.ref.getDownloadURL()
        const downloadURL = await snapshot.ref.getDownloadURL();
        console.log("Download URL:", downloadURL);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading image:", error);
        return null;
    }
}

// loading content to the database when the website is loaded
document.addEventListener("DOMContentLoaded", function() {
    populateEvents();
});

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
            indexes[club.clubName] = indexCount;
            indexCount++;
            console.log(club)
            console.log(indexes);
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
                                         <p class="hidden">${club.clubDescription}</p>
                                         <h3>Contact:</h3>`;

                // Create a list element for contacts
                const contactsList = document.createElement("p");

                // Iterate over each contact and create list items
                club.contacts.forEach(contact => {
                    const contactItem = document.createElement("p");
                    contactItem.classList.add('contacts-list')
                    contactItem.textContent = contact;
                    contactsList.appendChild(contactItem);
                });

                // Append the contacts list to clubDetails
                clubDetails.appendChild(contactsList);

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

    // Get the club name from the clicked container
    const clubName = clubContainer.querySelector("h2").textContent;

    // Retrieve the index of the club
    const clubIndex = indexes[clubName];

    // Get the club details from the database based on the index
    const clubRef = ref(database, `db/students/clubs/${clubIndex}`);
    get(clubRef)
        .then((snapshot) => {
            const clubData = snapshot.val();
            if (clubData) {
                // Update the club name and description in the expanded view
                document.getElementById("expandedClubName").textContent = clubData.clubName;
                document.getElementById("expandedClubDescription").textContent = clubData.clubDescription;

                // Clear existing contacts
                const contactsList = document.getElementById("expandedClubContacts");
                contactsList.innerHTML = "";

                // Populate contacts as a list
                clubData.contacts.forEach(contact => {
                    const contactItem = document.createElement("li");
                    contactItem.textContent = contact;
                    contactsList.appendChild(contactItem);
                });

                // Create and append club logo to the expanded club view
                const clubLogo = document.createElement("img");
                clubLogo.classList.add("club-logo-expanded");
                clubLogo.src = clubData.logo;
                document.getElementById("expandedClubDetails").prepend(clubLogo);

                // Display the expanded club view
                document.getElementById("expandedClubView").style.display = "block";
            } else {
                console.error("Club data not found for index:", clubIndex);
            }
        })
        .catch((error) => {
            console.error("Error retrieving club information:", error);
        });
}

const expandedClubViewBackButton = document.getElementById("backButton")
expandedClubViewBackButton.addEventListener("click", () => {
    // Remove the class from the body when the club view is closed
    document.body.classList.remove("expanded-club-view");
    document.getElementById("expandedClubView").style.display = "none";
});

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

loadClubsByCategory("all")

// Function to reorder clubs alphabetically in the database
async function reorderClubsAlphabetically() {
    try {
        // Get the current list of clubs from the database
        const clubsSnapshot = await get(ref(database, 'db/students/clubs'));
        let clubsList = clubsSnapshot.val() || []; // If no clubs exist, start with an empty array

        // Sort the clubs alphabetically by club name
        clubsList.sort((a, b) => a.clubName.localeCompare(b.clubName));

        // Update the list of clubs in thes database
        await set(ref(database, 'db/students/clubs'), clubsList);

        console.log("Clubs reordered alphabetically successfully.");
    } catch (error) {
        console.error("Error reordering clubs alphabetically:", error);
    }
}

// called whenever somen visits website to make sure club are re ordered
//reorderClubsAlphabetically()

//fillDatabase()sss