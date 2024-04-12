// Import the necessary functions from the Firebase SDK
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getDatabase, ref, set,get, push, child} from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes , getDownloadURL} from "firebase/storage";
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

document.querySelector("body").style.fontSize = "1vh";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firebase Storage
const storage = getStorage();
// Initialize firebase
const auth = getAuth();
const provider = new GoogleAuthProvider();
let email = null;
// Initialize firebase realtime database
const database = getDatabase();
const databaseRef = ref(database);

const goToStudentPageButton = document.getElementById("goToStudentPage");
goToStudentPageButton.addEventListener("click", (e) => {
    window.location.href = 'student.html';
})

// Get references to HTML elements
const clubCategoryInput = document.getElementById("clubCategoryInput");
const newCategoryInput = document.getElementById("newCategoryInput");
const addNewCategoryButton = document.getElementById("addNewCategoryButton");
const trustedEmailInput = document.getElementById("trustedEmailInput");
const addNewTrustedEmailButton = document.getElementById("addNewTrustedEmailButton");

// Call the function to populate club categories when the page loads
document.addEventListener("DOMContentLoaded", async () => {
    loadClubsByCategory("all categories")
});

// Function to reorder clubs alphabetically in the database
async function reorderClubsAlphabetically() {
    try {
        // Get the current list of clubs from the database
        const clubsSnapshot = await get(ref(database, 'db/students/clubs'));
        let clubsList = clubsSnapshot.val() || []; // If no clubs exist, start with an empty array

        // Sort the clubs alphabetically by club name
        clubsList.sort((a, b) => a.clubName.localeCompare(b.clubName));

        // Update the list of clubs in the database
        await set(ref(database, 'db/students/clubs'), clubsList);

        console.log("Clubs reordered alphabetically successfully.");
    } catch (error) {
        console.error("Error reordering clubs alphabetically:", error);
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
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log("Download URL:", downloadURL);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading image:", error);
        return null;
    }
}

// Function to handle adding new category
addNewCategoryButton.addEventListener("click", async () => {
    const newCategory = newCategoryInput.value;

    // Add new category to Firebase Database
    try {
        const categoryRef = child(databaseRef, 'db/general/clubCategories');
        await push(categoryRef, newCategory);
        console.log("New category added successfully.");
        // Clear input field after submission
        newCategoryInput.value = "";
    } catch (error) {
        console.error("Error adding new category:", error);
    }
});

// Function to handle adding new trusted email
addNewTrustedEmailButton.addEventListener("click", async () => {
    const newEmail = trustedEmailInput.value;

    // Add new trusted email to Firebase Database
    try {
        const trustedEmailsRef = child(databaseRef, 'db/general/trustedEmails');
        await push(trustedEmailsRef, newEmail);
        console.log("New trusted email added successfully.");
        // Clear input field after submission
        trustedEmailInput.value = "";
    } catch (error) {
        console.error("Error adding new trusted email:", error);
    }
});

// called whenever somen visits website to make sure club are re ordered
//reorderClubsAlphabetically()

// Function to load clubs with a certain category
async function loadClubsByCategory(category) {
    try {
        const snapshot = await get(ref(database, 'db/admins/newClubs')); // Retrieve data from Firebase database
        const clubs = snapshot.val(); // Extract the JSON object from the snapshot

        const clubsContainerAdmin = document.getElementById("clubsContainerAdmin");
        clubsContainerAdmin.innerHTML = ""; // Clear previous content

        // Iterate through the clubs object using for...in loop
        for (const clubKey in clubs) {
            const club = clubs[clubKey]; // Get the club object using the club key

            if (club.category === category || category === "all categories") {
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
                    contactItem.classList.add('contacts-list');
                    contactItem.textContent = contact;
                    contactsList.appendChild(contactItem);
                });

                // Append the contacts list to clubDetails
                clubDetails.appendChild(contactsList);

                clubContainer.appendChild(clubDetails);

                clubsContainerAdmin.appendChild(clubContainer);
            }
        }

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

    // Retrieve the club details from the database based on the club name
    const clubRef = ref(database, 'db/admins/newClubs');
    get(child(clubRef, clubName))
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
                console.error("Club data not found for club:", clubName);
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

const approveClubButton = document.getElementById("approveClub");
approveClubButton.addEventListener("click", async function() {
    try {
        const clubName = document.getElementById("expandedClubName").textContent;
        const clubRef = ref(database, `db/admins/newClubs/${clubName}`);
        const approvedClubsRef = ref(database, 'db/students/clubs');
        
        // Get the club data
        const clubSnapshot = await get(clubRef);
        const clubData = clubSnapshot.val();
        
        // Get the current list of clubs from the database
        const clubsSnapshot = await get(approvedClubsRef);
        let clubsListApproved = clubsSnapshot.val() || []; // If no clubs exist, start with an empty array
        
        // Push the club data into the approved clubs list
        clubsListApproved.push(clubData);
        
        // Set the approved clubs list in the database
        await set(approvedClubsRef, clubsListApproved);
        
        // Reorder the clubs alphabetically
        await reorderClubsAlphabetically();
        
        console.log("Club approved successfully.");
    } catch (error) {
        console.error("Error approving club:", error);
    }
});
