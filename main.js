let editingItem = null;
let dragSrcEl = null;
let draggingIndex = null;
// Caching data

let cachedData = JSON.parse(localStorage.getItem('cachedData')) || {
    title: '',
    subtitle: '',
    sections: [{ header: '', content: [] }],
    docId: null
};


// Function to populate the fake phone with data (from Firestore)


// Updated renderDataInFakePhone function to ensure correct index assignment
const renderDataInFakePhone = (data) => {
   
    
    const fakePhoneDisplay = document.getElementById('fakePhoneDisplay');
    fakePhoneDisplay.innerHTML = ''; // Clear the current display
    console.log('Data to render in function:', data); // Log the data passed to render function

    // Check if sections exist
    if (!data.sections || !Array.isArray(data.sections) || data.sections.length === 0) {
        console.error('No sections available to render');
        clearFakePhoneDisplay('No data available.');
        return; // Exit early if there are no sections to render
    }

    // Render sections and add functionality for each item
    data.sections.forEach((section, sectionIndex) => {
        if (!section.content || !Array.isArray(section.content)) {
            console.error(`Section ${sectionIndex} has no content or is not an array`);
            return; // Exit if the section content is invalid
        }

        section.content.forEach((item, contentIndex) => {
            const displayItem = document.createElement('div');
            displayItem.classList.add('display-item');
            displayItem.setAttribute('draggable', true); // Enable dragging

            // Set section and content index on the display item
            displayItem.dataset.sectionIndex = sectionIndex;
            displayItem.dataset.contentIndex = contentIndex;

            // Create content element with the item content
            const content = document.createElement('div');
            content.classList.add('item-content');
            content.textContent = item.type === 5 ? '• ' + item.text : item.text; // Handle bullet

            // Append content to display item
            displayItem.appendChild(content);

            // Add trash icon for deleting
            const trashIcon = document.createElement('div');
            trashIcon.classList.add('trash-icon');
            trashIcon.innerHTML = '🗑️';
            trashIcon.addEventListener('click', function () {
                const sectionIndex = displayItem.dataset.sectionIndex;
                const contentIndex = displayItem.dataset.contentIndex;
            
                if (cachedData.sections[sectionIndex] && cachedData.sections[sectionIndex].content[contentIndex]) {
                    // Remove the item from cached data
                    cachedData.sections[sectionIndex].content.splice(contentIndex, 1);
            
                    // Re-render the phone display
                    renderDataInFakePhone(cachedData); // Re-render phone display after deletion
            
                    // Save the updated cache to localStorage
                    localStorage.setItem('cachedData', JSON.stringify(cachedData));
                    console.log('Updated cachedData.sections after deletion:', cachedData.sections);
                } else {
                    console.error('Invalid indices during deletion');
                }
            
                // Clear the selection and text input
                editingItem = null; // Deselect any editing item
                document.getElementById('inputText').value = ''; // Clear the text input
            });
            
            displayItem.appendChild(trashIcon);

            // Append display item to the fake phone display
            fakePhoneDisplay.appendChild(displayItem);

            // Enable drag and drop
            enableDragAndDrop(displayItem);

            // Enable selection of the item for editing
            displayItem.addEventListener('click', function () {
                handleItemSelection(displayItem);
            });
        });
    });

    console.log("Section Index:", sectionIndex);
    console.log("Content Index:", contentIndex);
    console.log("Cached Data Sections:", cachedData.sections);


    // Update phone display heading and subheading if needed
    updatePhoneHeading();
};

// Function to clear cachedData and fakePhoneDisplay
function clearCachedDataAndDisplay() {
    cachedData = {
        title: '',
        subtitle: '',
        sections: [{ header: '', content: [] }],
        docId: null
    };
    localStorage.removeItem('cachedData'); // Clear localStorage for cachedData
    document.getElementById('fakePhoneDisplay').innerHTML = ''; // Clear fake phone display
}

// Function to clear the display but NOT the cached data
function clearFakePhoneDisplay() {
    document.getElementById('fakePhoneDisplay').innerHTML = ''; // Clear phone display
}


// Add item to the phone display
document.getElementById('addItem').addEventListener('click', function () {
    const inputText = document.getElementById('inputText').value;
    const itemType = document.getElementById('itemType').value;

    if (inputText.trim() === "") return; // Prevent adding empty items

    if (editingItem) {
         // Editing an existing item
         const sectionIndex = editingItem.dataset.sectionIndex;
         const contentIndex = editingItem.dataset.contentIndex;
 
         // Update the cached data
         const updatedItem = {
             type: getTypeValue(itemType),
             text: inputText
         };
         cachedData.sections[sectionIndex].content[contentIndex] = updatedItem;
         
        // Update the existing item instead of adding a new one update ui
        const contentDiv = editingItem.querySelector('.item-content');
        contentDiv.textContent = (itemType === 'bullet') ? '• ' + inputText : inputText;

        // Deselect after updating
        editingItem.classList.remove('active');
        editingItem = null;
    } else {
        // Adding a new item
        const newItem = {
            type: getTypeValue(itemType),
            text: inputText
        };

        // Add to cache and UI
        addItemToCache(newItem);
        addItemToDisplay(inputText, itemType);
    }

    // Clear input field after adding/updating
    document.getElementById('inputText').value = "";
});

// Add new item to the display
function addItemToDisplay(inputText, itemType) {
    const newItem = {
        type: getTypeValue(itemType),
        text: inputText
    };
    const fakePhoneDisplay = document.getElementById('fakePhoneDisplay');

    // Create display item
    const displayItem = document.createElement('div');
    displayItem.classList.add('display-item');
    displayItem.setAttribute('draggable', true);
    
    const content = document.createElement('div');
    content.classList.add('item-content');
    content.textContent = (itemType === 'bullet') ? '• ' + inputText : inputText;

    displayItem.appendChild(content);

    // Append item to fake phone display
    fakePhoneDisplay.appendChild(displayItem);

    // Update cachedData
    addItemToCache(newItem);

    // Enable drag and drop
    enableDragAndDrop(displayItem);

    // Enable selection for editing
    displayItem.addEventListener('click', function () {
        handleItemSelection(displayItem);
    });

    // Re-render the entire phone display to ensure correct indices
    renderDataInFakePhone(cachedData);



}

// Function to add a new item without clearing cachedData
function addItem(type, text) {
    const newItem = { type, text };

    // Check if sections exist, and add to the appropriate section
    if (!cachedData.sections || cachedData.sections.length === 0) {
        cachedData.sections = [{ header: '', content: [newItem] }]; // Initialize sections if empty
    } else {
        cachedData.sections[0].content.push(newItem); // Add to existing content array
    }

    // Update the localStorage cache with the modified cachedData
    localStorage.setItem('cachedData', JSON.stringify(cachedData));

    // Re-render the updated data in the phone display
    renderDataInFakePhone(cachedData);
}


// Function to update cached data when editing an item
function updateCachedData(sectionIndex, contentIndex, newText) {
    if (cachedData.sections[sectionIndex] && cachedData.sections[sectionIndex].content[contentIndex]) {
        cachedData.sections[sectionIndex].content[contentIndex].text = newText;
        localStorage.setItem('cachedData', JSON.stringify(cachedData));  // Save to localStorage
        console.log('Updated cached data:', cachedData);
    } else {
        console.error('Invalid section or content index for update.');
    }
}




// Handle item selection for editing
function handleItemSelection(displayItem) {
    const sectionIndex = displayItem.dataset.sectionIndex;
    const contentIndex = displayItem.dataset.contentIndex;

    // Ensure valid indices
    if (!cachedData.sections[sectionIndex] || !cachedData.sections[sectionIndex].content[contentIndex]) {
        console.error('Content or section index is invalid');
        return;
    }

    // Clear the input field and deselect previous item
    if (editingItem) editingItem.classList.remove('active');

    // Check if the same item is selected for editing
    if (editingItem === displayItem) {
        // Deselect the item if it's clicked again
        displayItem.classList.remove('active');
        document.getElementById('inputText').value = "";
        editingItem = null;
    } else {
        // Select the item for editing
        displayItem.classList.add('active');
        editingItem = displayItem;  // Track the currently editing item

        // Set the input field to the current text
        const currentText = cachedData.sections[sectionIndex].content[contentIndex].text || '';
        document.getElementById('inputText').value = currentText;
        
        // Listen for changes in the input field and update the cached data
        const inputField = document.getElementById('inputText');
        inputField.removeEventListener('input', updateCachedData);  // Ensure no duplicate listeners
        inputField.addEventListener('input', function () {
            updateCachedData(sectionIndex, contentIndex, inputField.value);
        });
    }
}



// Enable drag-and-drop functionality
function enableDragAndDrop(item) {
    item.addEventListener('dragstart', function (e) {
        dragSrcEl = this;
        draggingIndex = Array.from(dragSrcEl.parentNode.children).indexOf(dragSrcEl);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.innerHTML);
        this.classList.add('dragging');
    });

    item.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    });

    item.addEventListener('dragenter', function () {
        this.classList.add('over');
    });

    item.addEventListener('dragleave', function () {
        this.classList.remove('over');
    });

    item.addEventListener('drop', function (e) {
        e.preventDefault();
        e.stopPropagation();

        const dropIndex = Array.from(this.parentNode.children).indexOf(this);
        if (dragSrcEl !== this) {
            // Remove dragging element and insert it at new position
            const parent = this.parentNode;
            if (draggingIndex < dropIndex) {
                parent.insertBefore(dragSrcEl, this.nextSibling);
            } else {
                parent.insertBefore(dragSrcEl, this);
            }
        }
        this.classList.remove('over');
    });

    item.addEventListener('dragend', function () {
        this.classList.remove('dragging');
    });
}

// Update phone display heading and subheading
document.getElementById('heading').addEventListener('change', updatePhoneHeading);
document.getElementById('subheading').addEventListener('change', function () {
    const heading = document.getElementById('heading').value;
    const subheading = this.value;

    // Clear cachedData and localStorage to ensure new data is fetched fresh
    clearCachedDataAndDisplay();


    // Update cachedData subheading
    cachedData.title = subheading;
    
    // Fetch data from Firestore and update the localStorage
    if (heading && subheading) {
        window.fetchSubheadingData(subheading, heading);
    }
});


function updatePhoneHeading() {
    const heading = document.getElementById('heading').value;
    const subheading = document.getElementById('subheading').value;
    const fakePhoneHeading = document.getElementById('fakePhoneHeading');

   

    // Update cached data
    cachedData.title = heading; // Update cached title
    cachedData.subtitle = subheading; // Update cached subtitle
    
    fakePhoneHeading.textContent = `${heading} - ${subheading}`;
}


/// Submit button action
document.getElementById('submitChanges').addEventListener('click', async function () {
    const updatedCachedData = JSON.parse(localStorage.getItem('cachedData'));
    
    const docId = updatedCachedData?.docId; // Check if docId exists
    if (!docId) {
        console.error("Document ID not found. Cannot update.");
        return;
    }

    try {
        await window.updateDiseaseOrDrug(docId, updatedCachedData);
        console.log("Data successfully updated!");
    } catch (error) {
        console.error("Error updating document: ", error);
    }
});






// Update cached data on changes
// Update cached data on change
function addItemToCache(newItem) {
    if (!cachedData.sections || !Array.isArray(cachedData.sections)) {
        cachedData.sections = [];  // Initialize sections if they don't exist
    }

    // Ensure at least one section exists to add content
    if (cachedData.sections.length === 0) {
        cachedData.sections.push({ header: '', content: [] });
    }

    // Add the new item to the last section's content
    cachedData.sections[cachedData.sections.length - 1].content.push(newItem);
    localStorage.setItem('cachedData', JSON.stringify(cachedData));  // Save to localStorage

     // Re-render the display with updated data
     renderDataInFakePhone(cachedData);
}



// Add item button event listener
document.getElementById('addItem').addEventListener('click', function () {
    const inputText = document.getElementById('inputText').value;
    const itemType = document.getElementById('itemType').value;

    if (inputText.trim() === "") return;

    if (editingItem) {
        // Editing an existing item
        const sectionIndex = editingItem.dataset.sectionIndex;
        const contentIndex = editingItem.dataset.contentIndex;

        // Update the cached data
        const updatedItem = {
            type: getTypeValue(itemType),
            text: inputText
        };
        cachedData.sections[sectionIndex].content[contentIndex] = updatedItem;

        // Update UI
        const contentDiv = editingItem.querySelector('.item-content');
        contentDiv.textContent = (itemType === 'bullet') ? '• ' + inputText : inputText;

        // Deselect the item after editing
        editingItem.classList.remove('active');
        editingItem = null;
    } else {
        // Adding a new item
        const newItem = {
            type: getTypeValue(itemType),
            text: inputText
        };

        // Add to cache and UI
        addItemToCache(newItem);
        addItemToDisplay(inputText, itemType);
    }

    // Clear the input field
    document.getElementById('inputText').value = "";
    localStorage.setItem('cachedData', JSON.stringify(cachedData));  // Save to localStorage
    console.log('Updated cachedData.sections:', cachedData.sections);
});

// Helper function to add a new item to the cache
function addItemToCache(newItem) {
    if (!cachedData.sections || !Array.isArray(cachedData.sections)) {
        cachedData.sections = [];  // Initialize sections if they don't exist
    }

    // Ensure at least one section exists to add content
    if (cachedData.sections.length === 0) {
        cachedData.sections.push({ header: '', content: [] });
    }

    // Add the new item to the last section's content
    cachedData.sections[cachedData.sections.length - 1].content.push(newItem);
    localStorage.setItem('cachedData', JSON.stringify(cachedData));  // Save to localStorage
}

// Helper function to add a new item to the cache
// Helper function to add a new item to the cache
// Helper function to add a new item to the cache
// Helper function to add a new item to the cache




// Helper function to map item type to corresponding number
function getTypeValue(itemType) {
    switch (itemType) {
        case 'bullet':
            return 1; 
        case 'text':
            return 2; 
        case 'numberbullet':
            return 3; 
        case 'titleheading':
            return 4; 
        case 'sectionheading':
            return 5; 
        default:
            return 0;
    }
}

// Cache heading and subheading
document.getElementById('heading').addEventListener('change', function () {
    cachedData.subtitle = this.value; // Update cached heading
});

document.getElementById('subheading').addEventListener('change', function () {
    cachedData.title = this.value; // Update cached subheading
});


