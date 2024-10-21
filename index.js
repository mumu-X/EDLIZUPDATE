// Firebase Initialization & Imports
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Firestore,deleteDoc ,getFirestore, setDoc, doc, collection, getDoc,query, where,getDocs, updateDoc } from "firebase/firestore";
import { deleteObject, getStorage, ref, getDownloadURL, uploadBytes } from "firebase/storage";


// Initialize Firebase app
const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore();
        const storage = getStorage();

        window.db = db;


        // Caching data
        let cachedData = JSON.parse(localStorage.getItem('cachedData')) || {
            title: '',
            subtitle: '',
            sections: [{ header: '', content: [] }],
            docId: null
        };
        

window.cachedData=cachedData

let arrayCache = []
window.arrayCache = arrayCache;


window.onload = () => {
    const currentPath = window.location.pathname;

    if (currentPath.includes('Event_up_date.html')) {
    
        // Example usage for multiple images
        $(document).ready(function () {
            // Fetch images and handle missing images
            fetchImage("Events/1/Pics.jpg", "picfirst", $("#picfirst").parent());
            fetchImage("Events/2/pic2.jpg", "picsecond", $("#picsecond").parent());
            fetchImage("Events/3/pic3.jpg", "picthird", $("#picthird").parent());
            fetchImage("Events/4/pic4.jpg", "picfourth", $("#picfourth").parent());
            fetchImage("Events/5/pic5.jpg", "picfifth", $("#picfifth").parent());
            fetchImage("Events/6/pic6.jpg", "picsixth", $("#picsixth").parent());
            fetchImage("Events/7/pic7.jpg", "picseventh", $("#picseventh").parent());
        });;
    } else if (currentPath.includes('create_record.html')) {
        // Run only on page2.html
        fetchTopicsCreate();
      
    }
    else if (currentPath.includes('updateExistingDisease')){
        fetchTopics();
    }
    else if (currentPath.includes('Delete_record.html')) {
        // Run only on page3.html    
        fetchTopicsCreate();
    }
    
    // If you want to check for specific elements that exist only on certain pages
    if (document.getElementById('specificElementForPage3')) {
        functionForPage3();
    }
};




        // Check if a user is authenticated
        onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log("User is logged in");
            } else {
                console.log("Please sign in");
            }
        });

// Function to update Firestore document
const updateDiseaseOrDrug = async (docId, dataToUpdate) => {
    try {
        const docRef = doc(db, 'DIseases_Conditions', docId);
        await updateDoc(docRef, {
           // title: dataToUpdate.title,
           // subtitle: dataToUpdate.subtitle,
            sections: dataToUpdate.sections
        });
        console.log("Document successfully updated in Firestore!");
    } catch (error) {
        console.error("Error updating document: ", error);
    }
};

window.updateDiseaseOrDrug=updateDiseaseOrDrug;
        

// Function to fetch topics and display them
// Function to fetch topics if medicalGuidelineTopics is a document
const fetchTopics = async () => {
    try {
        const docRef = doc(db, 'lists', 'medicalGuidelineTopics');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log(data); // Check the structure of your data
            const topics = data.topics; // Assuming topics is the field holding the list of topics

            populateDropdown(topics);
        } else {
            console.log("No such document!");
        }
    } catch (error) {
        console.error("Error fetching topics: ", error);
    }
};


const fetchSubheadingData = async (subheading, heading) => {
    try {
        const q = query(
            collection(db, 'DIseases_Conditions'),
            where('title', '==', subheading),
            where('subtitle', '==', heading)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                const docData = doc.data();
                console.log('Data fetched:', docData);
                const docId = doc.id;

                // Clear previous cached data in localStorage
                localStorage.removeItem('cachedData');

// Create new cachedData based on fetched data
cachedData = {
    title: docData.title || '',
    subtitle: docData.subtitle || '',
    docId: docId,
    sections: docData.sections || [{ header: '', content: [] }]
};

// Save new cached data to localStorage as a string
localStorage.setItem('cachedData', JSON.stringify(cachedData));

                console.log('Cached Data after fetching:', cachedData);

                // Call the render function in main.js to update the UI
                renderDataInFakePhone(cachedData);
            });
        } else {
            clearFakePhoneDisplay("The above headings could not be located.");
        }
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
};


window.fetchSubheadingData = fetchSubheadingData;
window.cachedData = {}; // Initialize global cachedData








const fetchTopicsCreate = async () => {
    try {
        const docRef = doc(db, 'lists', 'medicalGuidelineTopics');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log('Fetched :' , data); // Check the structure of your data
            const topics = data.topics; // Assuming topics is the field holding the list of topics

            populateDropdownCreate(topics);

            // Loop through the topics and store them in arrayCache
            arrayCache= topics.map(topic => {
                return {
                    maintopic: topic.label, // Use 'label' as the maintopic
                    subtopics: topic.subtopics // Use 'subtopics' array for each maintopic
                };
            });
            // Save topics array to local storage for later editing
            localStorage.setItem('arrayCache', JSON.stringify(arrayCache));

            console.log('Arraycade topics:', arrayCache);

            
        } else {
            console.log("No such document!");
        }
    } catch (error) {
        console.error("Error fetching topics: ", error);
    }
};




// Function to update Firestore topics
const updatetopicsheading = async (updatedtopicsArray, Updatedtopicsheading) => {
    try {
        // Get reference to the Firestore document
        const docRef = doc(db, 'lists', 'medicalGuidelineTopics');

        // Transform the updatedTopicsArray into the structure Firestore expects
        const formattedTopics = updatedtopicsArray.map(topic => ({
            label: topic.maintopic, // assuming 'maintopic' holds the label value
            subtopics: topic.subtopics // subtopics array
        }));

        // Update the document with the new topics array
        await updateDoc(docRef, {
            topics: formattedTopics // Replacing topics array in Firestore with the updated version
        });

        console.log("Document successfully updated in Firestore!");
    } catch (error) {
        console.error("Error updating document: ", error);
    }

// Add a new document in collection "DIseases_Conditions"
    // Add a new document in collection "cities"
    const newDocRef = doc(collection(db, "DIseases_Conditions"))
    await setDoc(newDocRef, {
      title: Updatedtopicsheading.subtitle,
    subtitle: Updatedtopicsheading.title,
    sections: Updatedtopicsheading.sections,
    });
};

window.updatetopicsheading= updatetopicsheading;


// Function to update Firestore topics
const deletetopicsheading = async (updatedtopicsArray) => {
    try {
        // Get reference to the Firestore document
        const docRef = doc(db, 'lists', 'medicalGuidelineTopics');

        // Transform the updatedTopicsArray into the structure Firestore expects
        const formattedTopics = updatedtopicsArray.map(topic => ({
            label: topic.maintopic, // assuming 'maintopic' holds the label value
            subtopics: topic.subtopics // subtopics array
        }));

        console.log('Formatted Topics:', formattedTopics);

        // Update the document with the new topics array
        await updateDoc(docRef, {
            topics: formattedTopics // Replacing topics array in Firestore with the updated version
        });

        console.log("Document successfully updated in Firestore!");
    } catch (error) {
        console.error("Error updating document: ", error);
    }

// Add a new document in collection "DIseases_Conditions"
    // Add a new document in collection "cities"
    const newDocRef = doc(collection(db, "DIseases_Conditions"))
    await deleteDoc(docRef);
      
    };

window.deletetopicsheading= deletetopicsheading;









        // Modify the uploadImage function to accept imgId
function uploadImage(file, imgId) {
    const picref = ref(storage, imgId); // Use the imgId to create the storage reference
    uploadBytes(picref, file)
        .then((snapshot) => {
            console.log("Image uploaded successfully!");
            return getDownloadURL(snapshot.ref);
        })
        .then((url) => {
            // Set the image src for the correct element
            const imageId = imgId.split('/').pop(); // Get the image element ID from the path
            document.getElementById(imageId).src = url;
            const parentDiv = $("#" + imageId).parent(); // Get the parent div to remove ghost class
            parentDiv.removeClass("ghost"); // Remove the ghost class if the image is uploaded successfully
            parentDiv.attr("data-number", ""); // Clear data-number if image exists
        })
        .catch((error) => {
            console.error("Image upload failed: ", error);
        });
}


        // Make the function accessible globally
        window.uploadImage = uploadImage;

                // Function to delete the image, dynamically based on the image path
                function deleteImage(imagePath, parentDiv) {
                    const picref = ref(storage, imagePath);
                    deleteObject(picref)
                        .then(() => {
                            console.log("Image deleted successfully!");
                
                            // Add a background number based on the parent div's id
                            const parentId = parentDiv.attr("id");
                            let backgroundNumber;
                
                            switch (parentId) {
                                case "viewpicfirst":
                                    backgroundNumber = 1;
                                    break;
                                case "viewpicsecond":
                                    backgroundNumber = 2;
                                    break;
                                case "viewpicthird":
                                    backgroundNumber = 3;
                                    break;
                                case "viewpicfourth":
                                    backgroundNumber = 4;
                                    break;
                                case "viewpicfifth":
                                    backgroundNumber = 5;
                                    break;
                                case "viewpicsixth":
                                    backgroundNumber = 6;
                                    break;
                                case "viewpicseventh":
                                    backgroundNumber = 7;
                                    break;
                            }
                
                            // Apply a ghost class and add the background number to the parent div
                            parentDiv.empty();  // Clear the contents of the parent div
                            parentDiv.addClass("ghost").attr("data-number", backgroundNumber);
                            
                            // Add a placeholder "Add Image" button
                            parentDiv.append('<button class="add-btn" data-img-id="' + imagePath + '">Add Image</button><input type="file" accept="image/*" style="display:none;">');
                        })
                        .catch((error) => {
                            console.error("Error deleting image: ", error);
                        });
                }
                


        // Make the function globally accessible
        window.deleteImage = deleteImage;

        // Function to fetch an image from Firebase and update the UI
        // Function to fetch an image from Firebase and update the UI
function fetchImage(imagePath, imageElementId, parentDiv) {
    const picref = ref(storage, imagePath); // Reference to the image in Firebase
    
    getDownloadURL(picref)
        .then((url) => {
            // If the image is found, set the image src
            document.getElementById(imageElementId).setAttribute("src", url);
            parentDiv.removeClass("ghost"); // Remove ghost class if image exists
            parentDiv.attr("data-number", ""); // Clear data-number if image exists
        })
        .catch((error) => {
            console.error(`Error retrieving image: ${error.message}`);
            // If no image is found, show the ghost placeholder
            parentDiv.empty();  // Clear the content of the div
            parentDiv.addClass("ghost");  // Add ghost styling class
            
            // Add a background number based on the parent div's id
            const parentId = parentDiv.attr("id");
            let backgroundNumber;
            if (parentId === "viewpicfirst") {
                backgroundNumber = 1;
            } else if (parentId === "viewpicsecond") {
                backgroundNumber = 2;
            } else if (parentId === "viewpicthird") {
                backgroundNumber = 3;
            } else if (parentId === "viewpicfourth") {
                backgroundNumber = 4;
            } else if (parentId === "viewpicfifth") {
                backgroundNumber = 5;
            } else if (parentId === "viewpicsixth") {
                backgroundNumber = 6;
            } else if (parentId === "viewpicseventh") {
                backgroundNumber = 7;
            }

            // Set the data-number attribute to show the ghost number
            parentDiv.attr("data-number", backgroundNumber);

            // Optionally, add a placeholder "Add Image" button
            parentDiv.append('<button class="add-btn" data-img-id="' + imagePath + '">Add Image</button><input type="file" accept="image/*" style="display:none;">');
        });
}


       