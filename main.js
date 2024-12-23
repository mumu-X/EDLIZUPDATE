let editingItem = { isEditing: false, sectionIndex: null, contentIndex: null };
let dragSrcEl = null; // Element being dragged
let draggingIndex = null; // Original index of the item being dragged



// Function to populate the fake phone with data from localStorage
const renderDataInFakePhone = () => {
    // Retrieve and parse data from localStorage
    const storedData = localStorage.getItem('cachedData');
    if (!storedData) {
        console.error('No cached data found in localStorage');
        clearFakePhoneDisplay('No data available.');
        return;
    }

    const data = JSON.parse(storedData);
    const fakePhoneDisplay = document.getElementById('fakePhoneDisplay');
    fakePhoneDisplay.innerHTML = ''; // Clear the current display

    updatePhoneHeading();

    // Check if sections exist
    if (!data.sections || !Array.isArray(data.sections) || data.sections.length === 0) {
        console.error('No sections available to render');
        clearFakePhoneDisplay('No data available.');
        return;
    }

    // Render sections and content items
    data.sections.forEach((section, sectionIndex) => {
        if (!section.content || !Array.isArray(section.content)) {
            console.error(`Invalid section content at section index ${sectionIndex}`);
            return;
        }

        section.content.forEach((item, contentIndex) => {
            const displayItem = document.createElement('div');
            displayItem.classList.add('display-item');

            // Set section and content index on the display item
            displayItem.dataset.sectionIndex = sectionIndex;
            displayItem.dataset.contentIndex = contentIndex;

            // Handle item rendering based on type
            if (item.type === "table") {
                // Create a table element
                const table = document.createElement('table');
                table.classList.add('item-table'); // Custom class for styling

                // Extract table data from the `text` field (array of objects)
                const tableData = item.text;

                if (Array.isArray(tableData) && tableData.length > 0) {
                    // Create table headers based on the first object keys
                    const thead = document.createElement('thead');
                    const headerRow = document.createElement('tr');
                    
                    // Get headers from the keys of the first object in the array
                    const headers = Object.keys(tableData[0]);

                    headers.forEach(headerText => {
                        const th = document.createElement('th');
                        th.textContent = headerText;
                        headerRow.appendChild(th);
                    });
                    thead.appendChild(headerRow);
                    table.appendChild(thead);

                    // Create table body
                    const tbody = document.createElement('tbody');

                    // Populate table rows with data
                    tableData.forEach(rowData => {
                        const row = document.createElement('tr');
                        headers.forEach(headerText => {
                            const td = document.createElement('td');
                            td.textContent = rowData[headerText] || ''; // Fill empty cells with empty string
                            row.appendChild(td);
                        });
                        tbody.appendChild(row);
                    });

                    table.appendChild(tbody);
                } else {
                    // In case the table data is empty
                    const noDataRow = document.createElement('tr');
                    const noDataCell = document.createElement('td');
                    noDataCell.colSpan = 5; // Span across the table width
                    noDataCell.textContent = 'No table data available';
                    noDataRow.appendChild(noDataCell);
                    table.appendChild(noDataRow);
                }

                displayItem.appendChild(table);
            } else {
                // Non-table items: Render as before
                const content = document.createElement('div');
                content.classList.add('item-content');
                content.textContent = item.type === 5 ? '• ' + item.text : item.text;

                displayItem.appendChild(content);
            }

            // Append content to the fake phone display
            fakePhoneDisplay.appendChild(displayItem);

            // Enable selection of the item for editing
            displayItem.addEventListener('click', function () {
                handleItemSelection(displayItem, sectionIndex, contentIndex);
            });

            enableDragAndDrop(displayItem, sectionIndex);
        });
    });

    console.log("Rendered Data:", data);
};

// Add some CSS styles to style the table in the display
const style = document.createElement('style');
style.innerHTML = `
    
`;
document.head.appendChild(style);

// Example delete function
function deleteItemFromSection(sectionIndex, contentIndex) {
    const storedData = localStorage.getItem('cachedData');
    const data = JSON.parse(storedData);
    
    if (data.sections[sectionIndex] && data.sections[sectionIndex].content[contentIndex]) {
        // Remove the item from cached data
        data.sections[sectionIndex].content.splice(contentIndex, 1);

        // Save the updated cache to localStorage
        localStorage.setItem('cachedData', JSON.stringify(data));

        // Re-render the phone display
        renderDataInFakePhone();
        console.log('Item deleted successfully. Updated cachedData:', data);
    } else {
        console.error('Invalid section or content index for deletion');
    }
}

// Function to clear the fake phone display
function clearFakePhoneDisplay(message = '') {
    const fakePhoneDisplay = document.getElementById('fakePhoneDisplay');
    fakePhoneDisplay.innerHTML = message;
}

function updatePhoneHeading() {
    const heading = document.getElementById('heading').value;
    const subheading = document.getElementById('subheading').value;
    const fakePhoneHeading = document.getElementById('fakePhoneHeading');


    fakePhoneHeading.textContent = `${heading} - ${subheading}`;
};

// Handle item selection for editing
// Function to handle selection and deselection of items
function handleItemSelection(displayItem, sectionIndex, contentIndex) {
    const inputText = document.getElementById('inputText');
    
    // Check if the item is already selected
    if (displayItem.classList.contains('selected')) {
        // Deselect: remove highlight and clear the input text
        displayItem.classList.remove('selected');
        inputText.value = ''; // Clear the input box
        //remove draggable attribute
        displayItem.setAttribute('draggable', false); // Enable dragging
        //remove trashcan icon if it exists
        // Remove the trash icon if it exists
        const trashIcon = displayItem.querySelector('.trash-icon');
        if (trashIcon) {
            displayItem.removeChild(trashIcon);

            // Reset editingItem as no item is selected
        editingItem.isEditing = false;
        editingItem.sectionIndex = null;
        editingItem.contentIndex = null;

            
        }
    } else {
        // Select: highlight the item and set its text in the input box
        // First, remove selection from any previously selected item
        const previouslySelected = document.querySelector('.selected');
        if (previouslySelected) {
            previouslySelected.classList.remove('selected');
            previouslySelected.setAttribute('draggable', false); // Disable dragging for the previously selected item

            // Remove the trash icon from the previously selected item if it exists
            const previousTrashIcon = previouslySelected.querySelector('.trash-icon');
            if (previousTrashIcon) {
                previouslySelected.removeChild(previousTrashIcon);
                displayItem.setAttribute('draggable', false); // Enable dragging
            }

            // Reset editingItem as no item is selected
        editingItem.isEditing = false;
        editingItem.sectionIndex = null;
        editingItem.contentIndex = null;
        }

        // Highlight the clicked item
        displayItem.classList.add('selected');

        //enable draggable for selected item
        displayItem.setAttribute('draggable', true); // Enable dragging
        

        // Get the cached data to extract the text for the selected item
        const storedData = localStorage.getItem('cachedData');
        if (storedData) {
            const data = JSON.parse(storedData);
            const selectedItemText = data.sections[sectionIndex].content[contentIndex].text;

            // Set the input text to the selected item's text
            inputText.value = selectedItemText;
        }

        // Add trash icon for deleting
        const trashIcon = document.createElement('div');
        trashIcon.classList.add('trash-icon');
        trashIcon.innerHTML = '🗑️';

        // Add click event listener to the trash icon for deletion
        trashIcon.addEventListener('click', function () {
            console.log(`Deleting item at section index ${sectionIndex} and content index ${contentIndex}`);
            deleteItemFromSection(sectionIndex, contentIndex);
        });

        displayItem.appendChild(trashIcon);

        // Update editingItem to reflect the selected item
        editingItem.isEditing = true;
        editingItem.sectionIndex = sectionIndex;
        editingItem.contentIndex = contentIndex;
    }
    console.log(editingItem)
};

addItem.addEventListener('click', function () {Add_OR_EditDisplayItem(editingItem)

    // Get the input element, not its value, to clear it
    const inputTextElement = document.getElementById('inputText');
    inputTextElement.value = ''; // Clear the input box
});

// function to add or edit a display item depending on editingitem's state
function Add_OR_EditDisplayItem(editingItem) {
    const inputText = document.getElementById('inputText').value;
    const type = document.getElementById('itemType').value;
    const storedData = localStorage.getItem('cachedData');
    const data = JSON.parse(storedData);
    let sectionIndex = editingItem.sectionIndex;
    let contentIndex = editingItem.contentIndex;

    


    // Check if the section exists; if not, initialize it
    if (!data.sections[sectionIndex]) {
        data.sections[sectionIndex] = { header: '', content: [] }; // Initialize section if missing
    }
        // add or edit the item
    if(editingItem.isEditing===true)
    {
        // take the index and replace the text and item type at that index
        data.sections[sectionIndex].content[contentIndex].text = inputText;
        data.sections[sectionIndex].content[contentIndex].type = type;

       // Mark editing as complete
       editingItem.isEditing = false;
       editingItem.sectionIndex = null;
        editingItem.contentIndex = null;

       // Get the display item and remove its highlight (if any)
       const fakePhoneDisplay = document.getElementById('fakePhoneDisplay');
       const displayItem = fakePhoneDisplay.querySelector(`[data-section-index="${sectionIndex}"][data-content-index="${contentIndex}"]`);

       if (displayItem) {
           displayItem.classList.remove('selected'); // Remove highlight
       }
    }
    else{

        if (type === 'table'){

            if (sectionIndex === null || sectionIndex === undefined) {
                sectionIndex = 0; // Default to the first section, or change to dynamically select a section
            }

        

            // Process CSV and convert to JSON
            const csv = inputText;
            const tableData = csvJSON(csv); // Get parsed CSV data as an array of objects

            // Debugging: Check if the tableData is being parsed correctly
            console.log('Parsed tableData:', tableData);  // Add this line for debugging

            const newItem = {
                type: "table",
                text: tableData // Store the parsed table data
            };

            // Initialize content array if it doesn't exist
            if (!data.sections[sectionIndex].content) {
                data.sections[sectionIndex].content = [];}

         // Add the parsed table data as a new item
            contentIndex = data.sections[sectionIndex].content.length; // Set contentIndex to the next available position
            data.sections[sectionIndex].content.push(newItem);

            //Debugging: Check if the newItem is added to the content array
            console.log('Updated content array:', data.sections[sectionIndex].content);

        }

        else{

        // Assign the correct sectionIndex if it's undefined or null
        if (sectionIndex === null || sectionIndex === undefined) {
            sectionIndex = 0; // Default to the first section, or change to dynamically select a section
        }

        // Create a new item
        const newItem = {
            type: type,
            text: inputText
        };

        // Initialize content array if it doesn't exist
        if (!data.sections[sectionIndex].content) {
            data.sections[sectionIndex].content = [];
        }

        // Add the new item to the content array
        contentIndex = data.sections[sectionIndex].content.length; // Set contentIndex to the next available position
        data.sections[sectionIndex].content.push(newItem);
    }}


// Save the updated cache to localStorage
localStorage.setItem('cachedData', JSON.stringify(data));

// Re-render the phone display
renderDataInFakePhone();
console.log('Item edited successfully. Updated cachedData:', data);

};


// Enable drag-and-drop functionality
function enableDragAndDrop(item, sectionIndex) {
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

        const dropIndex = Array.from(this.parentNode.children).indexOf(this); // Target index
        if (dragSrcEl !== this) {
            // Remove dragging element and insert it at new position
            const parent = this.parentNode;
            if (draggingIndex < dropIndex) {
                parent.insertBefore(dragSrcEl, this.nextSibling);
            } else {
                parent.insertBefore(dragSrcEl, this);
            }

            // Update the cache after reordering
            updateCacheAfterReorder(sectionIndex, draggingIndex, dropIndex);
        }
        this.classList.remove('over');
    });

    item.addEventListener('dragend', function () {
        this.classList.remove('dragging');
    });

        // Reset editingItem as no item is selected
        editingItem.isEditing = false;
        editingItem.sectionIndex = null;
        editingItem.contentIndex = null;

       //displayItem.classList.remove('selected');

        const inputTextElement = document.getElementById('inputText');
    inputTextElement.value = ''; // Clear the input box
        
}

// Function to update the cachedData after an item is dragged and dropped
function updateCacheAfterReorder(sectionIndex, fromIndex, toIndex) {
    // Get cached data
    const storedData = localStorage.getItem('cachedData');
    if (storedData) {
        const data = JSON.parse(storedData);

        // Reorder the content array within the section
        const sectionContent = data.sections[sectionIndex].content;
        
        // Splice to move the item within the array
        const [movedItem] = sectionContent.splice(fromIndex, 1); // Remove the item
        sectionContent.splice(toIndex, 0, movedItem); // Insert it at the new index

        // Save the updated data back to localStorage
        localStorage.setItem('cachedData', JSON.stringify(data));

        // Re-render the phone display after reordering
        renderDataInFakePhone();
    }
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



function csvJSON(csv){

    var lines=csv.split("\n");
  
    var result = [];
  
    // NOTE: If your columns contain commas in their values, you'll need
    // to deal with those before doing the next step 
    // (you might convert them to &&& or something, then covert them back later)
    // jsfiddle showing the issue https://jsfiddle.net/
    var headers=lines[0].split(",");
  
    for(var i=1;i<lines.length;i++){
  
        var obj = {};
        var currentline=lines[i].split(",");

        // Skip rows that are completely empty or have no meaningful data
        if (currentline.every(cell => cell.trim() === "")) {
            continue; // Skip this row
        }
  
        for(var j=0;j<headers.length;j++){
            const key = headers[j].trim();  // Remove extra spaces around header names
            const value = currentline[j] ? currentline[j].trim() : ""; // Replace undefined with empty string
        
            if (key !== "") {  // Filter out any empty headers
                obj[key] = value; // Add to the object only if the key is not empty
        }}
         // Filter out empty objects or rows with only empty fields
         if (Object.values(obj).some(value => value.trim() !== "")) {
            result.push(obj); // Only add non-empty rows to the result
        }
  }
  return result; //return the new item
  
};