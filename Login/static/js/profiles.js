document.getElementById("submitButton").addEventListener("click", function() {
    var formData = {
        firstName: document.getElementById("firstName").value,
        surname: document.getElementById("surname").value,
        studentNumber: parseInt(document.getElementById("studentNumber").value) // Parse as integer
    };

    // Send POST request to check profiles
    fetch('/check_profiles', {
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
            // If response is successful, redirect to register.html
            window.location.href = '/register.html';
        } else if (response.status === 404) {
            // If name or student number not found in the database
            return response.text(); // Return the error message
        } else if (response.status === 400) {
            // If name or student number is missing
            return response.text(); // Return the error message
        } else {
            // Handle other responses (e.g., internal server error)
            return response.text();
        }
    })
    .then(data => {
        // Display the error message on the webpage
        document.getElementById("message3_0").innerText = data;
    })
    .catch(error => {
        // Handle any errors that occur during the fetch request
        console.error('Error checking profiles:', error);
    });
});