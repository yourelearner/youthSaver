document.addEventListener("DOMContentLoaded", function() {
    var contentDiv = document.getElementById("content");
    var initialContent = contentDiv.innerHTML;

    // Get all list items within the option list
    var optionListItems = document.querySelectorAll("#optionList li");

    // Add click event listener to each list item
    optionListItems.forEach(function(listItem) {
        listItem.addEventListener("click", function() {
            var selectedOption = this.innerText.trim(); // Get the text content of the clicked list item
            contentDiv.innerHTML = ''; // Clear the content div

            switch(selectedOption) {
                case "HOME":
                    contentDiv.innerHTML = initialContent;
                    break;
                case "Add Profile":
                    contentDiv.innerHTML = `
                        <form id="reportForm">
                        <label for="firstName">First Name:</label>
                        <input type="text" id="firstName" name="firstName" required>
                        
                        <label for="middleInitial">Middle Initial:</label>
                        <input type="text" id="middleInitial" name="middleInitial" required>
                        
                        <label for="surname">Last Name:</label>
                        <input type="text" id="surname" name="surname"  required>
                        
                        <label for="birthDate">Birth Date:</label>
                        <input type="text" id="birthDate" name="birthDate" required>
                        
                        <label for="gender">Gender:</label>
                        <input type="text" id="gender" name="gender" required>
                        
                        <label for="address">Address:</label>
                        <input type="text" id="address" name="address" required>
                        
                        <label for="gmail">Gmail:</label>
                        <input type="email" id="gmail" name="gmail"  required>
                            
                        <label for="studentNumber">Student Number:</label>
                        <input type="number" id="studentNumber" name="studentNumber" required>

                        <button type="button" id="submitButton">Submit</button>
                    </form>`;
                    break;
                case "Add Staff":
                    contentDiv.innerHTML = `
                        <form id="addStaffForm">
                            <!-- Add Staff form fields -->
                            <label for="username">Username:</label><br>
                            <input type="text" id="username" name="username" required><br>
                            <label for="password">Password:</label><br>
                            <input type="password" id="password" name="password" required><br>
                            <button type="button" id="registerStaffButton">Register Staff</button>
                        </form>
                        <!-- Container for error and success messages -->
                        <div id="staffMessageContainer"></div>`;
                    // Event listener for registering staff
                    document.getElementById("registerStaffButton").addEventListener("click", function() {
                        registerStaff();
                    });
                    break;
                case "PROFILES":
                    window.location.href = '/update';
                    break;
                case "RESPOND":
                    fetchReports();
                    break;
                default:
                    console.log("Unknown option selected");
                    break;
            }
        });
    });

    // Event listener for the submit button
    contentDiv.addEventListener("click", function(event) {
        if (event.target && event.target.id == "submitButton") {
            submitAdminForms();
        } else if (event.target && event.target.id == "returnButton") {
            showProfilesButton(); // Display the "Show Profiles" button when "Return" is clicked
        }
    });
});


function registerStaff() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    // Check if any required field is empty
    if (!username || !password) {
        showMessageNotification("Please fill in all required fields.");
        return; // Stop form submission if any required field is empty
    }

    var formData = {
        username: username,
        password: password
    };

    // Send POST request to register staff
    fetch('/registerStaff', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Network response was not ok.');
    })
    .then(data => {
        if (data.status === 'success') {
            showMessageNotification("Form submitted successfully!");
            console.log(data);
        } else {
            showMessageNotification("A profile with the same Username already exists.");
        }
    })
    .catch(error => {
        console.error('Error submitting form:', error);
        showMessageNotification("An error occurred. Please try again.");
    });
}



function showMessageNotification(message) {
    var notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;

    document.body.appendChild(notification); // Ensure the notification is added to the body

    setTimeout(function() {
        notification.remove(); // Remove the notification after a certain time
    }, 3000);
}


function submitAdminForms() {
    // Retrieve form data
    var formData = {
        firstName: document.getElementById("firstName").value,
        middleInitial: document.getElementById("middleInitial").value,
        surname: document.getElementById("surname").value,
        birthDate: document.getElementById("birthDate").value,
        gender: document.getElementById("gender").value,
        address: document.getElementById("address").value,
        gmail: document.getElementById("gmail").value,
        studentNumber: parseInt(document.getElementById("studentNumber").value) || 0 // Default to 0 if null or NaN
    };

    // Check if any required field is empty
    for (var key in formData) {
        if (formData.hasOwnProperty(key)) {
            if (!formData[key]) {
                showMessageNotification("Please fill in all required fields.");
                return; // Stop form submission if any required field is empty
            }
        }
    }

    // Send POST request to the server if all required fields are filled
    fetch('/submitAdminForms', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            formData: formData
        })
    })
    .then(response => {
        if (response.ok) {
            return response.text();
        }
        throw new Error('Network response was not ok.');
    })
    .then(data => {
        // Handle success
        showMessageNotification("Form submitted successfully!");
        console.log(data);
    })
    .catch(error => {
        // Handle error
        console.error('Error submitting form:', error);
        showMessageNotification("A profile with the same name, email, or student number already exists.");
    });
}



function fetchReports() {
    fetch('/getUserReports', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => displayReports(data))
    .catch(error => {
        console.error('Error fetching reports:', error);
    });
}

function displayReports(reports) {
    var contentDiv = document.getElementById("content");
    if (reports.length === 0) {
        contentDiv.innerHTML = '<p>No reports found.</p>';
        return;
    }

    var reportsHtml = `
        <div>
            <input type="text" id="reportSearch" placeholder="Search reports...">
        </div>
        <h2>Your Reports</h2>
        <form id="responseForm">
            <table>
                <thead>
                    <tr>
                        <th>Incident Date</th>
                        <th>Case Details</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Type</th>
                        <th>Relation to Incident</th>
                        <th>Person Name</th>
                        <th>Date of Birth</th>
                        <th>Address</th>
                        <th>Username</th>
                        <th>Response</th>
                        <th>Date</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>`;

    reports.forEach(report => {
        reportsHtml += `<tr>
            <td>${report.incident_date}</td>
            <td>${report.case_details}</td>
            <td>${report.location}</td>
            <td>${report.status}</td>
            <td>${report.type}</td>
            <td>${report.relation_to_incident}</td>
            <td>${report.person_name}</td>
            <td>${report.person_date_of_birth}</td>
            <td>${report.person_address}</td>
            <td>${report.username}</td>
            <td><input type="text" name="response_${report.incident_id}" id="response_${report.incident_id}" required></td>
            <td><input type="date" name="date_${report.incident_id}" id="date_${report.incident_id}" required></td>
            <td><button type="button" id="submitResponseButton_${report.incident_id}" data-incident-id="${report.incident_id}">Submit</button></td>
        </tr>`;
    });

    reportsHtml += `
                </tbody>
            </table>
        </form>`;

    contentDiv.innerHTML = reportsHtml;

    // Add event listeners for each submit button
    reports.forEach(report => {
        document.getElementById(`submitResponseButton_${report.incident_id}`).addEventListener("click", function(event) {
            event.preventDefault();
            submitSingleResponse(report.incident_id); // Call the function to submit the response form for this report
        });
    });

    // Add event listener for search box
    document.getElementById("reportSearch").addEventListener("input", function(event) {
        var searchTerm = event.target.value.toLowerCase();
        var rows = document.querySelectorAll("tbody tr");

        rows.forEach(row => {
            var cells = row.querySelectorAll("td");
            var found = false;
            cells.forEach(cell => {
                if (cell.textContent.toLowerCase().includes(searchTerm)) {
                    found = true;
                }
            });
            if (found) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    });
}


function submitSingleResponse(incidentId) {
    var response = document.getElementById(`response_${incidentId}`).value;
    var date = document.getElementById(`date_${incidentId}`).value;

    // Check if response or date is empty
    if (!response || !date) {
        showMessageNotification("Please fill in both response and date fields.");
        return;
    }

    var formData = {
        response: response,
        date: date,
        incident_id: incidentId
    };

    // Send form data to server
    fetch('/submitResponseForm', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ formData: formData })
    })
    .then(response => {
        if (response.ok) {
            showMessageNotification("Response submitted successfully!"); // Display success message
            return response.text();
        }
        throw new Error('Network response was not ok.');
    })
    .then(data => {
        console.log(data); // Handle success response
        // Optionally, redirect to another page or update UI
    })
    .catch(error => {
        console.error('Error submitting form:', error); // Handle error
        showMessageNotification("An error occurred. Please try again."); // Display error message
    });
}

