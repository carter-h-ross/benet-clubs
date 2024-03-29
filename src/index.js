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

const loginButton = document.getElementById("signInButton"); // Remove '#' from getElementById
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
})


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
                            contacts: "4carter.ross@benet.org",
                            logo: "",
                        },
                        {
                            category: "category 2",
                            clubName: "club 4",
                            clubDescription: "This is a description of the fourth club. This club meets on fridays after school",
                            contacts: "4carter.ross@benet.org",
                            logo: "",
                        },
                    ]
                },
                students: {
                    clubs: [
                        {
                            category: "category 1",
                            clubName: "club 1",
                            clubDescription: "This is a description of the first club. This club meets on wednesdays after school",
                            contacts: "4carter.ross@benet.org",
                            logo: "gs://benet-clubs.appspot.com/download (1).jpg",
                        },
                        {
                            category: "category 2",
                            clubName: "club 2",
                            clubDescription: "This is a description of the second club. This club meets on mondays after school",
                            contacts: "4carter.ross@benet.org",
                            logo: "gs://benet-clubs.appspot.com/download.jpg",
                        },
                        {
                            category: "category 1",
                            clubName: "club 2",
                            clubDescription: "This is a description of the third club. This club meets on mondays after school",
                            contacts: "4carter.ross@benet.org",
                            logo: "gs://benet-clubs.appspot.com/download.png",
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