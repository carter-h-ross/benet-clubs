// Import the necessary functions from the Firebase SDK
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getDatabase, ref, set,get, push, child } from "firebase/database";
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
const clubNameInput = document.getElementById("clubNameInput");
const clubDescriptionInput = document.getElementById("clubDescriptionInput");
const clubLogoInput = document.getElementById("clubLogoInput");
const submitClubButton = document.getElementById("submitClubButton");
const newCategoryInput = document.getElementById("newCategoryInput");
const addNewCategoryButton = document.getElementById("addNewCategoryButton");
const trustedEmailInput = document.getElementById("trustedEmailInput");
const addNewTrustedEmailButton = document.getElementById("addNewTrustedEmailButton");

// Function to populate club category options dropdown
async function populateClubCategories() {
    try {
        const snapshot = await get(ref(database, 'db/general/clubCategories'));
        const clubCategories = snapshot.val();
        if (clubCategories) {
            // Clear previous options
            clubCategoryInput.innerHTML = "";
            // Add each club category as an option
            Object.values(clubCategories).forEach(category => {
                const option = document.createElement("option");
                option.value = category;
                option.textContent = category;
                clubCategoryInput.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Error populating club categories:", error);
    }
}

// Call the function to populate club categories when the page loads
document.addEventListener("DOMContentLoaded", async () => {
    await populateClubCategories();
});

// Function to handle club submission
submitClubButton.addEventListener("click", async () => {
    const category = clubCategoryInput.value;
    const clubName = clubNameInput.value;
    const clubDescription = clubDescriptionInput.value;
    const clubLogoFile = clubLogoInput.files[0];

    // Upload club logo to Firebase Storage
    const logoDownloadURL = await uploadImageFile(clubLogoFile);

    // Create club object
    const club = {
        category,
        clubName,
        clubDescription,
        contacts: email, // Assuming the current user's email is the contact
        logo: logoDownloadURL || "", // Use the download URL if available, otherwise an empty string
    };

    // Push club data to Firebase Database
    try {
        const clubsRef = child(databaseRef, 'db/students/clubs');
        await push(clubsRef, club);
        console.log("Club submitted successfully.");
        // Clear input fields after submission
        clubCategoryInput.value = "";
        clubNameInput.value = "";
        clubDescriptionInput.value = "";
        clubLogoInput.value = "";
    } catch (error) {
        console.error("Error submitting club:", error);
    }
});

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