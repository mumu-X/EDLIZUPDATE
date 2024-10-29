let arrayCache = JSON.parse(localStorage.getItem('arrayCache')) || [];
const deleteButton = document.getElementById('deleteButton');
const confirmModal = document.getElementById('confirmModal');
const confirmDeleteButton = document.getElementById('confirmDelete');
const cancelDeleteButton = document.getElementById('cancelDelete');

const populateDropdownCreate = (topics) => {
    const headingSelect = document.getElementById('heading');
    const subheadingSelect = document.getElementById('subheading');

    headingSelect.innerHTML = '<option value="">Select a heading or use ➕ to create one</option>';
    subheadingSelect.innerHTML = '<option value="">Use ➕ to create a subheading</option>';

    topics.forEach((topic, index) => {
        const option = document.createElement('option');
        option.value = index;  // Still storing index for internal operations
        option.textContent = topic.label;  // Display the actual label in the dropdown
        headingSelect.appendChild(option);
    });

    headingSelect.addEventListener('change', function () {
        const selectedIndex = this.value;
        if (!selectedIndex) {
            subheadingSelect.innerHTML = '<option value="">Select a subheading</option>';
            updateCachedData('', '');  // Pass empty values when no heading is selected
            return;
        }

        const selectedTopic = topics[selectedIndex];
        subheadingSelect.innerHTML = '<option value="">Use ➕ to create one</option>';
        selectedTopic.subtopics.forEach(subtopic => {
            const subOption = document.createElement('option');
            subOption.value = subtopic;
            subOption.textContent = subtopic;
            subheadingSelect.appendChild(subOption);

        });

        // Update cachedData with actual heading label
        updateCachedData(selectedTopic.label, '');  // Set the heading label, not the index
    });

    subheadingSelect.addEventListener('change', function () {
        const subheading = subheadingSelect.value;
        const selectedIndex = headingSelect.value;

        if (subheading) {
            deleteButton.disabled = false;  // Enable delete button
            deleteButton.classList.add('active');  // Change to red
        } else {
            deleteButton.disabled = true;
            deleteButton.classList.remove('active');  // Reset to grey
        }

        // Ensure that we use the label (not index) for heading in cachedData
        const selectedTopic = topics[selectedIndex];
        updateCachedData(selectedTopic.label, subheading);  // Pass both the heading label and subheading
        updateData();

        
    });
};

// Show confirmation modal when delete is clicked
deleteButton.addEventListener('click', () => {
    confirmModal.style.display = 'block';
});

// Handle confirm delete action
confirmDeleteButton.addEventListener('click', () => {
    const selectedHeadingIndex = document.getElementById('heading').value;
    const selectedSubheading = document.getElementById('subheading').value;

    if (selectedHeadingIndex !== '') {
        // Parse arrayCache
        const selectedTopic = arrayCache[selectedHeadingIndex];
        const subtopics = selectedTopic.subtopics;

        // Find and remove the selected subheading
        const subheadingIndex = subtopics.indexOf(selectedSubheading);
        if (subheadingIndex > -1) {
            subtopics.splice(subheadingIndex, 1);
        }

        // If no subtopics left, remove the entire heading
        if (subtopics.length === 0) {
            arrayCache.splice(selectedHeadingIndex, 1);
        }

        cachedData = JSON.parse(localStorage.getItem('cachedData'))

        window.deletetopicsheading(arrayCache, cachedData);

        // Save updated cachedData to localStorage
        localStorage.setItem('cachedData', JSON.stringify(cachedData));

        // Save updated arrayCache back to localStorage
        localStorage.setItem('arrayCache', JSON.stringify(arrayCache));

        //window.deletetopicsheading(arrayCache);

        // Refresh the page after deletion
        //window.location.reload();
    }

    confirmModal.style.display = 'none';
});

// Handle cancel delete action
cancelDeleteButton.addEventListener('click', () => {
    confirmModal.style.display = 'none';
});

const updateCachedData = (heading, subheading) => {
    // Retrieve cachedData from localStorage or initialize a new object
    let cachedData = JSON.parse(localStorage.getItem('cachedData')) || {
        title: '',
        subtitle: '',
        sections: [{ header: '', content: [] }],
        docId: null
    };

    // Update cachedData with both heading (label, not index) and subheading
    cachedData.title = heading;  // Set the actual heading label
    cachedData.subtitle = subheading;

    // Save updated cachedData to localStorage
    localStorage.setItem('cachedData', JSON.stringify(cachedData));

    console.log('Updated cachedData:', cachedData);
};

function updateData() {
    const selectedHeading = document.getElementById('heading').value;
    const selectedSubheading = document.getElementById('subheading').value;

    if (selectedHeading !== '' && selectedSubheading !== '') {
        clearFakePhoneDisplay();
        fetchSubheadingData(selectedSubheading, selectedHeading);
    }
}

function clearFakePhoneDisplay() {
    document.getElementById('fakePhoneHeading').innerHTML = '';
    document.getElementById('fakePhoneDisplay').innerHTML = '';
}

populateDropdownCreate(arrayCache);