document.addEventListener("DOMContentLoaded", function() {
    var dropdown = document.getElementById("reportOptions"); // Changed ID to match HTML
    var contentDiv = document.getElementById("content");
    var initialContent = contentDiv.innerHTML;
    
    dropdown.addEventListener("click", function(event) { // Changed event to 'click'
        var selectedOption = event.target.getAttribute("data-value"); // Get the data-value attribute of the clicked item
        contentDiv.innerHTML = ''; // Clear the content
        
        switch(selectedOption) {
            case "home":
                contentDiv.innerHTML = initialContent;
                break;
            case "REPORT":
                contentDiv.innerHTML = `
                <form id="reportForm" >
                <label for="incidentDate">Incident Date:</label>
                <input type="date" id="incidentDate" name="incidentDate" required>
                
                <label for="caseDetails">Case Details:</label>
                <input type="text" id="caseDetails" name="caseDetails" placeholder="Enter Case Details" required>
                
                <label for="location">Location:</label>
                <input type="text" id="location" name="location" placeholder="Enter Location" required>
                
                <label for="status">Status:</label>
                <input type="text" id="status" name="status" placeholder="Enter Status" required>
                
                <label for="type">Type:</label>
                <select id="type" name="type" onchange="showOtherTypeInput()" required>
                    <option value="bullying">Bullying</option>
                    <option value="harassment">Harassment</option>
                    <option value="extortion">Extortion</option>
                    <option value="cyber_bullying">Cyber Bullying</option>
                    <option value="other">Other</option>
                </select>
                
                <div id="otherTypeInput" style="display: none;">
                    <label for="otherType">Other Type:</label>
                    <input type="text" id="otherType" name="otherType" placeholder="Enter Other Type" class="wide-input">
                </div>
                
                <label for="personName">Person Name:</label>
                <input type="text" id="personName" name="personName" placeholder="Enter Person Name" required>
                
                <label for="dateOfBirth">Date of Birth:</label>
                <input type="date" id="dateOfBirth" name="dateOfBirth" required>
                
                <label for="address">Address:</label>
                <input type="text" id="address" name="address" placeholder="Enter Address" required>
                
                <label for="relationToIncident">Relation to Incident:</label>
                <input type="text" id="relationToIncident" name="relationToIncident" placeholder="Enter Relation to Incident" required>
                
                <button type="button" id="submitButton">Submit</button>
            </form>`;
                break;
            case "read":
                fetchReports();
                break;
            case "profiles":
                window.location.href = '/create_profile';
                break;
            default:
                console.log("Unknown option selected");
                break;
        }
    });

  
    // Event listener for the submit button
    document.getElementById("content").addEventListener("click", function(event) {
        if (event.target && event.target.id == "submitButton") {
            submitForm();
        } else if (event.target && event.target.classList.contains("responsesButton")) {
            var incidentId = event.target.getAttribute("data-incident-id");
            fetchResponses(incidentId);
        }
    });
});




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
        <h2>Your Reports</h2>
        <input type="text" id="searchInput" placeholder="Search Reports" onkeyup="searchReports()">
        <table id="reportsTable">
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
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>`;
    
    reports.forEach(report => {
        reportsHtml += `<tr id="report_${report.id}">
            <td>${report.incident_date}</td>
            <td>${report.case_details}</td>
            <td>${report.location}</td>
            <td>${report.status}</td>
            <td>${report.type}</td>
            <td>${report.relation_to_incident}</td>
            <td>${report.person_name}</td>
            <td>${report.person_date_of_birth}</td>
            <td>${report.person_address}</td>
            <td><button type="button" class="responsesButton" data-incident-id="${report.incident_id}">Responses</button></td>
        </tr>`;
    });
    
    reportsHtml += `</tbody></table>`;
    contentDiv.innerHTML = reportsHtml;
}

function searchReports() {
    var input, filter, table, tr, td, i, j, txtValue;
    input = document.getElementById("searchInput");
    filter = input.value.toLowerCase();
    table = document.getElementById("reportsTable");
    tr = table.getElementsByTagName("tr");

    var reportFound = false; // Flag to check if any report matches the search criteria

    for (i = 1; i < tr.length; i++) {  // Start from 1 to skip table headers
        tr[i].style.display = "none"; // Initially hide all rows

        td = tr[i].getElementsByTagName("td");
        for (j = 0; j < td.length; j++) {
            if (td[j]) {
                txtValue = td[j].textContent || td[j].innerText;
                if (txtValue.toLowerCase().indexOf(filter) > -1) {
                    tr[i].style.display = ""; // Show the row if match found
                    reportFound = true; // Set flag to true if report is found
                    break;
                }
            }
        }
    }

    // Show message if no report is found
    if (!reportFound) {
        showMessageNotification("No reports found matching the search criteria.");
    }
}



function fetchResponses(incidentId) {
    fetch(`/getResponses/${incidentId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Network response was not ok.');
    })
    .then(data => {
        if (data.responses) {
            if (data.responses.length === 0) {
                // If there are no responses, clear the content
                var contentDiv = document.getElementById("content");
                contentDiv.innerHTML = ''; // Clear the content
                // Create the "Return to Student Page" button
                var returnButton = document.createElement("button");
                returnButton.textContent = "Return to Student Page";
                returnButton.addEventListener("click", goBack); // Call the goBack function when clicked
                contentDiv.appendChild(returnButton);
            } else {
                // If there are responses, display them
                displayResponses(data.responses);
            }
        } else if (data.message) {
            // If there is a message in the response, display it
            var contentDiv = document.getElementById("content");
            contentDiv.innerHTML = `<p>${data.message}</p>`;
            // Create the "Return to Student Page" button
            var returnButton = document.createElement("button");
            returnButton.textContent = "Return to Student Page";
            returnButton.addEventListener("click", goBack); // Call the goBack function when clicked
            contentDiv.appendChild(returnButton);
        }
    })
    .catch(error => {
        console.error('Error fetching responses:', error);
        // Display error message if there's an issue with fetching responses
        var contentDiv = document.getElementById("content");
        contentDiv.innerHTML = '<p>Error fetching responses. Please try again later.</p>';
        // Create the "Return to Student Page" button
        var returnButton = document.createElement("button");
        returnButton.textContent = "Return to Student Page";
        returnButton.addEventListener("click", goBack); // Call the goBack function when clicked
        contentDiv.appendChild(returnButton);
    });
}


// Inside the displayResponses function
function displayResponses(responses) {
    var contentDiv = document.getElementById("content");

    if (!responses || responses.length === 0) {
        // If there are no responses, display the message and create a button
        var message = "No responses from staff or admin yet.";
        contentDiv.innerHTML = `<p>${message}</p>`;
        
        // Create the "Return to Student Page" button
        var returnButton = document.createElement("button");
        returnButton.textContent = "Return to Student Page";
        returnButton.addEventListener("click", goBack); // Call the goBack function when clicked
        contentDiv.appendChild(returnButton);
    } else {
        // If there are responses, display them in a table
        var responsesHtml = `
            <h2>Responses</h2>
            <button type="button" onclick="goBack()">Return to Student Page</button>
            <table>
                <thead>
                    <tr>
                        <th>Responder</th>
                        <th>Response</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>`;

        responses.forEach(response => {
            responsesHtml += `<tr>
                <td>${response.responder}</td>
                <td>${response.response}</td>
                <td>${response.date}</td>
            </tr>`;
        });

        responsesHtml += `</tbody></table>`;
        contentDiv.innerHTML = responsesHtml;
    }
}



function goBack() {
   
  fetchReports(); // Assuming this function displays reports
        
    
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




// Function to show/hide other type input based on selected option
function showOtherTypeInput() {
    var type = document.getElementById("type").value;
    var otherTypeInput = document.getElementById("otherTypeInput");
    if (type === "other") {
        otherTypeInput.style.display = "block";
    } else {
        otherTypeInput.style.display = "none";
    }
}
function submitForm() {
    var formData = {};

    // Populate formData based on the selected option directly
    var selectedOption = "REPORT"; // Assuming "REPORT" is the default option
    
    switch(selectedOption) {
        case "REPORT":
            formData = {
                incidentDate: document.getElementById("incidentDate").value.trim(),
                caseDetails: document.getElementById("caseDetails").value.trim(),
                location: document.getElementById("location").value.trim(),
                status: document.getElementById("status").value.trim(),
                type: document.getElementById("type").value.trim(),
                // Include Other Type value if type is 'other'
                otherType: document.getElementById("type").value.trim() === "other" ? 
                          document.getElementById("otherType").value.trim() : "",
                personName: document.getElementById("personName").value.trim(),
                dateOfBirth: document.getElementById("dateOfBirth").value.trim(),
                address: document.getElementById("address").value.trim(),
                relationToIncident: document.getElementById("relationToIncident").value.trim()
            };

            // Check if any required field is empty
            var requiredFields = ["incidentDate", "caseDetails", "location", "status", "type", "personName", "dateOfBirth", "address", "relationToIncident"];
            for (var i = 0; i < requiredFields.length; i++) {
                var field = requiredFields[i];
                if (formData[field] === "") {
                    showMessageNotification("Please fill in all required fields.");
                    return; // Stop form submission
                }
            }
            break;
        case "home":
        case "read":
            // No additional fields to include
            break;
        default:
            console.log("Unknown option selected");
            return;
    }

    // Send POST request to the server
    fetch('/submitForms', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            collectionName: 'Incidents', // Change collection name as needed
            formData: formData
        })
    })
    .then(response => {
        if (response.ok) {
            showMessageNotification("Form submitted successfully.");
            return response.text();
        }
        throw new Error('Network response was not ok.');
    })
    .then(data => {
        // Handle success
        console.log(data);
    })
    .catch(error => {
        // Handle error
        console.error('Error submitting form:', error);
        showMessageNotification("Report not submitted. Please try again later.");
    });
}
