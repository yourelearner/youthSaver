const { MongoClient, ObjectId } = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// MongoDB connection details
const url = 'mongodb://localhost:27017';
const dbName = 'web-app';


const { body, validationResult } = require('express-validator');

// Middleware for validating form data
const validateFormData = [
    body('formData.firstName').notEmpty().trim().escape(),
    body('formData.surname').notEmpty().trim().escape(),
    body('formData.birth_date').notEmpty().isISO8601().toDate(),
    body('formData.gender').notEmpty().trim().escape(),
    body('formData.address').notEmpty().trim().escape(),
    body('formData.gmail').notEmpty().isEmail().normalizeEmail(),
    body('formData.student_number').notEmpty().isInt().toInt(),
];

// Define route to handle admin form submissions
app.post('/submitAdminForms', validateFormData, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const client = new MongoClient(url, { useUnifiedTopology: true });
    try {
        await client.connect();
        const db = client.db(dbName);
        const { formData } = req.body;
        const collection = db.collection('Profiles'); // Adjust collection name as needed
        const result = await collection.insertOne(formData);
        res.send('Admin form submitted successfully!');
    } catch (err) {
        console.error('Error submitting admin form:', err);
        res.status(500).send('Internal Server Error');
    } finally {
        await client.close();
    }
});



// Middleware to parse JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Define route to handle form submissions
app.post('/submitForms', async (req, res) => {
    const client = new MongoClient(url, { useUnifiedTopology: true });
    try {
        await client.connect();
        const db = client.db(dbName);
        const { collectionName, formData } = req.body;
        const collection = db.collection(collectionName);
        const result = await collection.insertOne(formData);
        res.send('Form submitted successfully!');
    } catch (err) {
        console.error('Error submitting form:', err);
        res.status(500).send('Internal Server Error');
    } finally {
        await client.close();
    }
});


// Define route to handle response form submissions
app.post('/submitResponseForm', async (req, res) => {
    const client = new MongoClient(url, { useUnifiedTopology: true });
    try {
        await client.connect();
        const db = client.db(dbName);
        const formData = req.body; // Assuming the request body contains the response form data
        const collection = db.collection('Responses'); // Adjust collection name as needed
        const result = await collection.insertOne(formData);
        res.send('Response form submitted successfully!');
    } catch (err) {
        console.error('Error submitting response form:', err);
        res.status(500).send('Internal Server Error');
    } finally {
        await client.close();
    }
});


// Connect to MongoDB and insert initial data
async function connectAndInsertData() {
    const client = new MongoClient(url, { useUnifiedTopology: true });
    try {
        await client.connect();
        const db = client.db(dbName);
        await insertInitialData(db);
        console.log('Initial data inserted successfully');
        // Start the server after connecting to MongoDB
        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
}

// Insert initial data into collections
async function insertInitialData(db) {
    const collectionsData = [
        { name: 'Incidents', data: incidentsData },
        { name: 'Persons', data: personsData },
        { name: 'Roles', data: rolesData },
        { name: 'Users', data: usersData },
        { name: 'Involvements', data: InvolvementsData},
        { name: 'Profiles', data: profilesData},
        {name: 'Responses', data: responsesData}
    ];

    for (const { name, data } of collectionsData) {
        await insertDataIntoCollection(db, name, data);
    }
}

// Insert data into a collection
async function insertDataIntoCollection(db, collectionName, data) {
    const collection = db.collection(collectionName);
    await collection.insertMany(data);
}

// Sample data for incidents
const incidentsData = [
    {
        _id: new ObjectId(),
        date: new Date('2024-05-10'),
        case_details: 'Theft incident',
        location: 'Main Building',
        status: 'Under investigation',
        type: 'Theft'
    },
    {
        _id: new ObjectId(),
        date: new Date('2024-05-12'),
        case_details: 'Vandalism incident',
        location: 'Gymnasium',
        status: 'Closed',
        type: 'Vandalism'
    },
    
];

// Sample data for persons
const personsData = [
    {
        _id: new ObjectId(),
        name: 'John Doe',
        date_of_birth: new Date('1990-01-01'),
        address: '123 Main St'
    },
    {
        _id: new ObjectId(),
        name: 'Jane Smith',
        date_of_birth: new Date('1985-03-15'),
        address: '456 Elm St'
    },
    
];

// Sample data for roles
const rolesData = [
    { _id: new ObjectId(), name: 'Admin' },
    { _id: new ObjectId(), name: 'Staff' },
    { _id: new ObjectId(), name: 'Student' },
 
];

// Sample data for users
const usersData = [
    {
        _id: new ObjectId(),
        username: 'admin',
        password: 'admin123',
        role_id: new ObjectId(),
        student_number: 202211707
    },
    {
        _id: new ObjectId(),
        username: 'teacher',
        password: 'teacher456',
        role_id: new ObjectId(),
        student_number: 202211791
    },
    {
        _id: new ObjectId(),
        username: 'kurt',
        password: 'kurt',
        role_id: new ObjectId(),
        student_number: 202211806
    },
   
];

// Sample data for involvements
const InvolvementsData = [
  {
    _id: 1,
    incident_id: 1, 
    person_id: 1,   
    role_id: 1,    
    relation_to_incident: 'Witness'
  },

];

// Sample data for profiles
const profilesData = [
    {
        _id: 1,
        first_name: 'Bob',
        middle_initial: 'R',
        surname: 'Smith',
        birth_date: '1988-05-15', // Fixed date format as string
        gender: 'Male',
        address: '101 Pine St',
        gmail: 'bob.smith@gmail.com',
        student_number: 202211807,
        username: 'bob_smith'
    },
];

// Sample data for responses
const responsesData = [
    {
      _id: 1,
      incident_id: 1, // Reference to the incident
      responder: 'admin', // Username of the responder
      response: 'Theft incident under review.',
      date: new Date('2024-05-11')
    }
];

connectAndInsertData();
