<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Create New Record</title>
    <script type="module" src="../../index.js"></script>
    <link rel="stylesheet" href="../../style.css">
    <style>
        /* Add styles for the new pop-up */
        .popup {
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 20px;
            background-color: #fff;
            border: 2px solid #ccc;
            z-index: 1000;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .popup input {
            width: 100%;
            margin-bottom: 10px;
        }
        .popup-buttons {
            display: flex;
            justify-content: space-between;
        }
        .popup .add-btn, .popup .cancel-btn {
            padding: 5px 10px;
            cursor: pointer;
        }

        /* Styling for the plus icons */
        .add-icon {
            cursor: pointer;
            font-size: 20px;
            margin-left: 10px;
            color: green;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>EDLIZ UPDATE</h1>
            <nav>
                <ul>
                    <li><a href="../index.html">Home</a></li>
                    <li><a href="#">Instructions</a></li>
                    <li><a href="#">About</a></li>
                </ul>
            </nav>
        </header>

        <h2 class="subheading">Add New Disease Record</h2>

        <div class="content">
            <div class="input-section">
                <div id="topicsContainer" class="topics-container">
                    <label for="heading">Heading:</label>
                    <div style="display: flex; align-items: center;">
                        <select id="heading">
                            <option value="">Select a heading or use ➕ to create one</option>
                        </select>
                        <span id="addHeadingIcon" class="add-icon">➕</span>
                    </div>

                    <label for="subheading">Subheading:</label>
                    <div style="display: flex; align-items: center;">
                        <select id="subheading">
                            <option value="">Select a heading or use ➕ to create one</option>
                        </select>
                        <span id="addSubheadingIcon" class="add-icon">➕</span>
                    </div>
                </div>

                <div class="add-item-section">
                    <label for="itemType">Add Item:</label>
                    <select id="itemType">
                        <option value="text">Text</option>
                        <option value="bullet">Bullet</option>
                        <option value="numberbullet">number bullet</option>
                        <option value="Titleheading">Title heading</option>
                        <option value="sectionheading">section heading</option>
                        <option value="paragraph">paragraph</option>
                    </select>
                    <button id="addItem">+</button>
                </div>

                <textarea id="inputText" placeholder="Input text here"></textarea>
            </div>

            <div class="phone">
                <div class="phone-screen">
                    <div id="fakePhoneHeading" class="phone-heading"></div>
                    <div id="fakePhoneDisplay" class="display-section"></div>
                </div>
                <button id="createnewrecord" class="submit-btn">Create New Record</button>
            </div>
        </div>

        <footer>
            <p>Select and add content.</p>
        </footer>

        <!-- Popup for adding a new item -->
        <div id="popup" class="popup">
            <h3>Add New</h3>
            <input type="text" id="newItemInput" placeholder="Enter new item" />
            <div class="popup-buttons">
                <button id="popupAddBtn" class="add-btn">Add</button>
                <button id="popupCancelBtn" class="cancel-btn">Cancel</button>
            </div>
        </div>
    </div>

    <script src="../../main.js"></script>
    <script>


        // Example topics definition (assuming you already have this in cache)
 const topics = [];
        const addHeadingIcon = document.getElementById('addHeadingIcon');
        const addSubheadingIcon = document.getElementById('addSubheadingIcon');
        const headingSelect = document.getElementById('heading');
        const subheadingSelect = document.getElementById('subheading');
        const fakePhoneHeading = document.getElementById('fakePhoneHeading');
        const fakePhoneDisplay = document.getElementById('fakePhoneDisplay');
        const inputText = document.getElementById('inputText');
        const popup = document.getElementById('popup');
        const newItemInput = document.getElementById('newItemInput');
        let currentAddContext = null;

        function updatePhoneHeading() {
    const heading = document.getElementById('heading').value;
    const subheading = document.getElementById('subheading').value;
    const fakePhoneHeading = document.getElementById('fakePhoneHeading');


    fakePhoneHeading.textContent = `${heading} - ${subheading}`;
};

        // Function to show the pop-up
        function openPopup() {
            popup.style.display = 'block';
            newItemInput.value = ''; // Clear input
        }

        // Function to close the pop-up
        function closePopup() {
            popup.style.display = 'none';
        }

       // Handle adding a new heading or subheading from the popup
       document.getElementById('popupAddBtn').addEventListener('click', function () {
    const newItem = document.getElementById('newItemInput').value.trim();
    if (newItem === '') return;

    let topics = JSON.parse(localStorage.getItem('arrayCache')) || [];

    if (currentAddContext === 'heading') {
        // Create new heading
        const newOption = document.createElement('option');
        newOption.value = topics.length;  // Use the current length as the new index
        newOption.textContent = newItem;
        headingSelect.appendChild(newOption);
        headingSelect.value = newItem;  // Automatically select the newly added heading

        // Push new heading to topics array
        const newTopic = { maintopic: newItem, subtopics: [] };
        topics.push(newTopic);
        localStorage.setItem('arrayCache', JSON.stringify(topics));

        // Clear the subheading dropdown since this is a new heading
        clearSubheadingDropdown();


    } else if (currentAddContext === 'subheading') {
        // Add new subheading to the selected heading
        const selectedTopicIndex = headingSelect.value;

        if (selectedTopicIndex === '') return;

        const selectedTopic = topics[selectedTopicIndex];

        if (selectedTopic) {
            // Add subheading to the selected topic
            selectedTopic.subtopics.push(newItem);

            // Update local storage
            localStorage.setItem('arrayCache', JSON.stringify(topics));

            // Add subheading to dropdown
            const subOption = document.createElement('option');
            subOption.value = newItem;
            subOption.textContent = newItem;
            subheadingSelect.appendChild(subOption);
            subheadingSelect.value = newItem;

            // Update cachedData
            updateCachedData(selectedTopic.maintopic, newItem);
        } else {
            console.error('Selected topic is undefined. Cannot add subheading.');
        }

        updatePhoneHeading()
        
    }

    console.log('Added new heading:', arrayCache);

    closePopup();
});

        // Handle cancel button in popup
        document.getElementById('popupCancelBtn').addEventListener('click', function () {
            closePopup();
        });

        // Function to clear subheading dropdown when a new heading is selected
        function clearSubheadingDropdown() {
            subheadingSelect.innerHTML = '<option value="">Select a subheading</option><option value="new">New Subheading</option>';
            const selectedTopic = topics.find(topic => topic.label === headingSelect.value);
            if (selectedTopic) {
                selectedTopic.subtopics.forEach(subtopic => {
                    const option = document.createElement('option');
                    option.value = subtopic;
                    option.textContent = subtopic;
                    subheadingSelect.appendChild(option);
                });
            }
        }

       // Add heading icon click handler
       addHeadingIcon.addEventListener('click', function() {
            currentAddContext = 'heading'; // Set context to heading
            openPopup();
        });

        // Add subheading icon click handler
        addSubheadingIcon.addEventListener('click', function() {
            currentAddContext = 'subheading'; // Set context to subheading
            openPopup();
        });
    
// Populate Dropdown
const populateDropdownCreate = (topics) => {
    const headingSelect = document.getElementById('heading');
    const subheadingSelect = document.getElementById('subheading');

    // Clear dropdowns and set default options
    headingSelect.innerHTML = '<option value="">Select a heading or use ➕ to create one</option>';
    subheadingSelect.innerHTML = '<option value="">Use ➕ to create a subheading</option>';

    // Populate heading dropdown from topics
    topics.forEach((topic, index) => {
        const option = document.createElement('option');
        option.value = index;  // Store index for easy access later
        option.textContent = topic.label;  // Use label from Firestore data
        headingSelect.appendChild(option);
    });

    // When a heading is selected, update the subheading dropdown
    headingSelect.addEventListener('change', function () {
        const selectedIndex = this.value;
        
        // Clear subheading if no valid heading is selected
        if (!selectedIndex || selectedIndex === "new") {
            subheadingSelect.innerHTML = '<option value="">Select a subheading</option>';
            updateCachedData(headingSelect.value, ''); // Clear subheading in cache
            return;
        }

        const selectedTopic = topics[selectedIndex];
        subheadingSelect.innerHTML = '<option value="">Use ➕ to create one</option>';  // Reset subheading

        // Populate subtopics
        selectedTopic.subtopics.forEach(subtopic => {
            const subOption = document.createElement('option');
            subOption.value = subtopic;
            subOption.textContent = subtopic;
            subheadingSelect.appendChild(subOption);
        });

        // Update cache with selected heading
        updateCachedData(selectedTopic.label, ''); // Clear subheading in cache for now
    });
};

// Update localStorage and cached data with heading and subheading
// Update localStorage and cached data with heading and subheading
const updateCachedData = (heading, subheading) => {
    // Clear the local cache by reinitializing cachedData
    let cachedData = {
        title: '',
        subtitle: '',
        sections: [{ header: '', content: [] }],
        docId: null
    };

    // Update cached data with new heading and subheading
    cachedData.title = heading;
    cachedData.subtitle = subheading;

    // Save updated data to localStorage
    localStorage.setItem('cachedData', JSON.stringify(cachedData));

    console.log('Updated cachedData:', cachedData);
};



// Submit button action
document.getElementById('createnewrecord').addEventListener('click', async function () {
    const updatedCachedData = JSON.parse(localStorage.getItem('cachedData'));
    const updatedtopicsArray = JSON.parse(localStorage.getItem('arrayCache'));

    try {
        await window.updatetopicsheading(updatedtopicsArray, updatedCachedData);
        console.log("Data successfully updated!");

        // Display success message on the phone screen
        const phoneDisplay = document.getElementById('fakePhoneDisplay');
        phoneDisplay.innerHTML = ''; // Clear the existing display

        const successMessage = document.createElement('div');
        successMessage.classList.add('success-message');
        successMessage.textContent = 'Document successfully updated!';
        phoneDisplay.appendChild(successMessage);

    } catch (error) {
        console.error("Error updating document: ", error);
    }
});
    </script>
</body>
</html>
