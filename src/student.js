// get user email when visiting page
const userEmail = localStorage.getItem('userEmail');
console.log(userEmail);

console.log("student.js file");
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"; // Import signInWithPopup
import { getDatabase, ref, set, get, push } from "firebase/database";
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

// Function to load clubs with a certain category
async function loadClubsByCategory(category) {
    try {
        // Reset the indexes object
        indexes = {};
        indexCount = 0;

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
            if (club.category == category || category == "all categories") {
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

const requestNewEventWindow = document.getElementById("requestNewEventWindow");
const requestNewEventWindowBackButton = document.getElementById("cancelNewEventButton");
const requestNewEventButton = document.getElementById("requestNewEventButton");

// Event listener for opening the request new event window
requestNewEventButton.addEventListener("click", function() {
    requestNewEventWindow.style.display = "block";
    document.body.classList.add("expanded-club-view");
});

// Event listener for closing the request new event window
requestNewEventWindowBackButton.addEventListener("click", function() {
    requestNewEventWindow.style.display = "none";
    document.body.classList.remove("expanded-club-view");
});

// Function to handle submitting the new event request
const submitNewEventButton = document.getElementById("submitNewEventButton");
submitNewEventButton.addEventListener("click", async () => {
    // Retrieve input values
    const eventNameInput = document.getElementById("eventNameInput").value;
    const dateTimeInput = document.getElementById("dateTimeInput").value;

    // Validate input values
    if (!eventNameInput.trim()) {
        alert("Please enter a valid event name.");
        return;
    }

    // Create a new Date object from the dateTimeInput value
    const date = new Date(dateTimeInput);
    const formattedDate = date.toLocaleString(); // Convert date to a readable format

    // Push the new event object to the database
    try {
        const currentTimeStamp = Date.now();
        const dateRef = ref(database, `db/general/events/${currentTimeStamp}/date`);
        set(dateRef, formattedDate); // Use formattedDate instead of date
        const nameRef = ref(database, `db/general/events/${currentTimeStamp}/name`);
        set(nameRef, eventNameInput); // Wait for name to be set before proceeding
        console.log("New event request submitted successfully.");
        // Close the request new event window
        requestNewEventWindow.style.display = "none";
        document.body.classList.remove("expanded-club-view");
    } catch (error) {
        console.error("Error submitting new event request:", error);
        alert("An error occurred while submitting the new event request. Please try again.");
    }
});

// Function to handle canceling the new event request
const cancelNewEventButton = document.getElementById("cancelNewEventButton");
cancelNewEventButton.addEventListener("click", () => {
    // Clear input fields
    document.getElementById("eventNameInput").value = "";
    document.getElementById("dayOfWeekInput").value = "";

    // Close the request new event window
    requestNewEventWindow.style.display = "none";
    document.body.classList.remove("expanded-club-view");
});

const requestClubWindow = document.getElementById("requestClubWindow");
const requestClubWindowButton = document.getElementById("requestClubButton");
const requestBackButton = document.getElementById("requestBackButton");
const requestDiv = document.getElementById("tableTitleDiv");

requestClubWindowButton.addEventListener("click", async () => {
    requestClubWindow.style.display = "block";
    document.body.classList.add("expanded-club-view");

    // Populate the category dropdown menu
    await populateClubCategoriesNewClub();
})
requestBackButton.addEventListener("click",function() {
    requestClubWindow.style.display = "none"
    document.body.classList.remove("expanded-club-view");
})

// Get the "Add Contact" button element
const addContactButtonRequest = document.getElementById('addContactButtonRequest');

// Add event listener to the "Add Contact" button
addContactButtonRequest.addEventListener('click', function() {
    // Get the value of the contact input
    const contactInput = document.getElementById('clubContactsInput').value.trim();
    
    // If the input is not empty
    if (contactInput !== '') {
        // Get the contact list element
        const contactList = document.getElementById('contactList');
        
        // Create a new div element for the contact
        const contactItem = document.createElement('div');
        contactItem.textContent = contactInput;
        
        // Append the contact to the contact list
        contactList.appendChild(contactItem);
        
        // Clear the input after adding contact
        document.getElementById('clubContactsInput').value = '';
    }
});


// loading content to the database when the website is loaded
document.addEventListener("DOMContentLoaded", async () => {
    populateEvents();
    requestClubWindow.style.display = "none";
    requestNewEventWindow.style.display = "none";
    await populateClubCategories();
});

// Function to populate club category options dropdown for main viewing page
async function populateClubCategories() {
    try {
        const snapshot = await get(ref(database, 'db/general/clubCategories'));
        const clubCategories = snapshot.val();
        if (clubCategories) {
            // Clear previous options
            clubCategoryInput.innerHTML = "";
            // Add each club category as an option, including "all categories"
            Object.values(clubCategories).forEach(category => {
                const option = document.createElement("option");
                option.classList.add("select-arrow")
                option.value = category;
                option.textContent = category;
                clubCategoryInput.appendChild(option);
            });
            clubCategoryInput.value = "all categories"
        }
    } catch (error) {
        console.error("Error populating club categories:", error);
    }
}

// Function to populate club category options dropdown for new club request
async function populateClubCategoriesNewClub() {
    try {
        const snapshot = await get(ref(database, 'db/general/clubCategories'));
        const clubCategories = snapshot.val();
        if (clubCategories) {
            // Clear previous options
            clubCategoryInputNewClub.innerHTML = "";
            // Add each club category as an option, excluding "all categories"
            Object.values(clubCategories).forEach(category => {
                if (category !== "all categories") {
                    const option = document.createElement("option");
                    option.classList.add("select-arrow")
                    option.value = category;
                    option.textContent = category;
                    clubCategoryInputNewClub.appendChild(option);
                }
            });
            clubCategoryInputNewClub.value = "all categories"
        }
    } catch (error) {
        console.error("Error populating club categories:", error);
    }
}

function convertDateToTimestamp(dateString) {
    // Parse the date string
    const date = new Date(dateString);

    // Get the timestamp
    const timestamp = date.getTime();

    return timestamp;
}

async function populateEvents() {
    try {
        const snapshot = await get(ref(database, 'db/general/events')); // Retrieve events from Firebase database
        const events = snapshot.val(); // Extract the JSON object from the snapshot
        console.log(events);

        if (!events) {
            console.log("No events found.");
            return; // Exit the function if no events are found
        }

        const eventsContainer = document.getElementById("eventsContainer");
        eventsContainer.innerHTML = ""; // Clear previous content

        // Get the current timestamp
        const currentTimestamp = Date.now();

        // Convert events object to an array of event objects
        const eventsArray = Object.keys(events).map(eventKey => {
            const event = events[eventKey];
            return {
                key: eventKey,
                name: event.name,
                date: convertDateToTimestamp(event.date)
            };
        });
        console.log(eventsArray);

        // Sort events by date, with the closest event first
        eventsArray.sort((a, b) => a.date - b.date);
        console.log("events array after sorting: ")
        console.log(eventsArray);

        // Loop through each event
        eventsArray.forEach(event => {
            // Check if the event date is in the future
            console.log(event.date);
            console.log(currentTimestamp)
            if (event.date > currentTimestamp) {
                // Create a div element for the event
                const eventElement = document.createElement("div");
                eventElement.classList.add("event-container"); // Add event container class

                // Add event details to the event element
                const eventDetails = document.createElement("p");
                const eventDateTime = new Date(event.date).toLocaleString(); // Format the date however you want
                eventDetails.textContent = `${event.name} - ${eventDateTime}`; // Concatenate event name and date with space
                eventDetails.classList.add("event-details"); // Add event details class
                eventElement.appendChild(eventDetails);

                // Append the event element to the events container
                eventsContainer.appendChild(eventElement);
            }
        });

        console.log("Events populated successfully.");
    } catch (error) {
        console.error("Error populating events:", error);
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

// Function to display user email and handle logout
function displayUserInfo() {
    // Add event listener to logout button
    logoutButton.addEventListener("click", () => {
        // Sign out user
        auth.signOut().then(() => {
            // Redirect to index page after logout
            window.location.href = "index.html";
        }).catch((error) => {
            console.error("Error signing out:", error);
        });
    });
}

// Call displayUserInfo function to initialize user info display and logout functionality
displayUserInfo();

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

// Function to check if user's email is in the contacts list or trusted emails list
async function isUserAuthorized(userEmail, contactsList, database) {
    // Retrieve the trusted emails list from the database
    try {
        const trustedEmailsRef = ref(database, 'db/general/trustedEmails');
        const trustedEmailsSnapshot = await get(trustedEmailsRef);
        const trustedEmailsList = trustedEmailsSnapshot.val();

        if (contactsList.includes(userEmail)) {
            console.log("User is authorized because their email is in the contacts list.");
            return true;
        } else if (trustedEmailsList && trustedEmailsList.includes(userEmail)) {
            console.log("User is authorized because their email is in the trusted emails list.");
            return true;
        } else {
            console.log("User is not authorized.");
            alert("You are not authorized to edit the information of this club");
            return false;
        }
    } catch (error) {
        console.error("Error retrieving trusted emails list:", error);
        return false;
    }
}

// Event listener for the edit club button
const editClubButton = document.getElementById("editClubButton");
editClubButton.addEventListener("click", async (event) => {
    // Get the user's email
    const userEmail = localStorage.getItem('userEmail');

    // Retrieve the club name from the expanded view
    const expandedClubName = document.getElementById("expandedClubName").textContent;

    // Retrieve the index of the club
    const clubIndex = indexes[expandedClubName];

    // Get the club details from the database based on the index
    const clubRef = ref(database, `db/students/clubs/${clubIndex}`);
    try {
        const snapshot = await get(clubRef);
        const clubData = snapshot.val();

        if (clubData) {
            // Check if the user's email is authorized to edit the club
            const userAuthorized = await isUserAuthorized(userEmail, clubData.contacts, database);
            
            if (userAuthorized) {
                // Proceed with editing the club
                document.getElementById("expandedClubView").style.display = "none";
                document.getElementById("editClubWindow").style.display = "block";

                // Populate input fields with existing club information
                const clubNameInput = document.getElementById("editClubName");
                const clubDescriptionInput = document.getElementById("editClubDescription");

                clubNameInput.value = clubData.clubName;
                clubDescriptionInput.value = clubData.clubDescription;

                // Clear existing contacts
                const contactsList = document.getElementById("editClubContactsList");
                contactsList.innerHTML = "";

                // Populate contacts as a list
                clubData.contacts.forEach(contact => {
                    const contactItem = document.createElement("li");
                    contactItem.textContent = contact;
                    contactsList.appendChild(contactItem);
                });
            } else {
                // User is not authorized to edit the club
                alert("You are not authorized to edit this club.");
            }
        } else {
            console.error("Club data not found for index:", clubIndex);
        }
    } catch (error) {
        console.error("Error retrieving club information:", error);
    }
});

// Function to save edited club information
const saveEditedClubInfoButton = document.getElementById("saveEditButton");
saveEditedClubInfoButton.addEventListener("click", () => {
    // Get input field values
    const clubNameInput = document.getElementById("editClubName").value;
    const clubDescriptionInput = document.getElementById("editClubDescription").value;

    // Get the list of contacts
    const contactsListItems = document.querySelectorAll("#editClubContactsList li");
    const contacts = Array.from(contactsListItems).map(item => item.textContent);

    // Update the club information in the database
    const clubIndex = indexes[document.getElementById("expandedClubName").textContent];
    const clubRef = ref(database, `db/students/clubs/${clubIndex}`);

    // Retrieve the existing club data
    get(clubRef).then((snapshot) => {
        const existingClubData = snapshot.val();

        // Update only the fields that were edited
        const updatedClubData = {
            clubName: clubNameInput || existingClubData.clubName, // Use existing value if input is empty
            clubDescription: clubDescriptionInput || existingClubData.clubDescription,
            contacts: contacts || existingClubData.contacts,
            logo: existingClubData.logo // Keep the image link the same
        };

        // Set the updated club data in the database
        set(clubRef, updatedClubData).then(() => {
            console.log("Club information updated successfully.");
            // Close the edit club modal
            document.getElementById("editClubWindow").style.display = "none";
        }).catch((error) => {
            console.error("Error updating club information:", error);
        });
    }).catch((error) => {
        console.error("Error retrieving club information:", error);
    });

    backFromEdit();
});

// Function to handle adding a new contact
const addContactButton = document.getElementById("addContactButton");
addContactButton.addEventListener("click", () => {
    const newContactInput = document.getElementById("editClubContactInput").value;
    const contactsList = document.getElementById("editClubContactsList");

    // Create list item for the new contact
    const contactItem = document.createElement("li");
    contactItem.textContent = newContactInput;

    // Append the new contact to the list
    contactsList.appendChild(contactItem);

    // Clear the input field
    document.getElementById("editClubContactInput").value = "";
});

// Function to handle removing a contact
const editClubContactsList = document.getElementById("editClubContactsList");
editClubContactsList.addEventListener("click", (event) => {
    if (event.target.tagName === "LI") {
        // Remove the clicked contact from the list
        event.target.remove();
    }
});

// Function to cancel club edits and close the modal
const cancelEditButton = document.getElementById("cancelEditButton")
cancelEditButton.addEventListener("click", () => {
    backFromEdit();
});

function backFromEdit() {
    // Close the edit club modal
    document.getElementById("editClubWindow").style.display = "none";
    // Display the expanded club view
    document.getElementById("expandedClubView").style.display = "block";
    document.body.classList.add("expanded-club-view");
}

document.getElementById("editClubWindow").style.display = "none";
loadClubsByCategory("all categories")

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

// Event listener for the club category dropdown menu
const clubCategoryInput = document.getElementById("clubCategoryInput");
clubCategoryInput.addEventListener("change", async (event) => {
    const selectedCategory = event.target.value;
    await loadClubsByCategory(selectedCategory);
});

// Function to handle submitting the new club request
const submitNewClubButton = document.getElementById("submitNewClubButton");
// Function to handle club submission
submitNewClubButton.addEventListener("click", async () => {
    const category = document.getElementById("clubCategoryInputNewClub").value;
    const clubName = clubNameInput.value;
    const clubDescription = clubDescriptionInput.value;
    const clubLogoFile = clubLogoInput.files[0];
    const contacts = Array.from(document.querySelectorAll('#contactList div')).map(item => item.textContent.trim()); // Get the list of contacts

    console.log(contacts);

    // Upload club logo to Firebase Storage
    const logoDownloadURL = await uploadImageFile(clubLogoFile);

    // Create club object
    const newClub = {
        category,
        clubName,
        clubDescription,
        contacts,
        logo: logoDownloadURL || "", // Use the download URL if available, otherwise an empty string
    };
    console.log(newClub);

    try {

        // Update the list of clubs in the database
        await set(ref(database, `db/admins/newClubs/${clubName}`), newClub);

        console.log("Club submitted successfully.");
        // Clear input fields after submission
        clubCategoryInput.value = "";
        clubNameInput.value = "";
        clubDescriptionInput.value = "";
        clubLogoInput.value = "";
        document.getElementById('contactList').innerHTML = ''; // Clear contact list
    } catch (error) {
        console.error("Error submitting club:", error);
    }
});