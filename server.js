const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DATA_FILE_PATH = path.join(__dirname, 'calendarState.json');

// Initialize the JSON file if it doesn't exist
if (!fs.existsSync(DATA_FILE_PATH)) {
    const initialData = {
        events: [],
        departments: {},
        adminEmail: null
    };
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(initialData, null, 2));
}

app.use(bodyParser.json());
app.use(cors());

// Helper function to read JSON file
const readJsonFile = (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error('Error reading JSON file');
    }
};

// Helper function to write JSON file
const writeJsonFile = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        throw new Error('Error writing JSON file');
    }
};

// Endpoint to save calendar state
app.post('/saveCalendarState', (req, res) => {
    try {
        writeJsonFile(DATA_FILE_PATH, req.body);
        res.status(200).json({ message: 'Data saved successfully' });
    } catch (error) {
        console.error('Error writing file:', error.message);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

// Endpoint to load calendar state
app.get('/loadCalendarState', (req, res) => {
    try {
        const jsonData = readJsonFile(DATA_FILE_PATH);
        res.status(200).json(jsonData);
    } catch (error) {
        console.error('Error reading file:', error.message);
        res.status(500).json({ error: 'Failed to load data' });
    }
});

// Endpoint to set admin email if not already set
app.post('/setAdminEmail', (req, res) => {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Invalid email' });
    }

    try {
        const jsonData = readJsonFile(DATA_FILE_PATH);

        // Check if adminEmail is already set
        if (jsonData.adminEmail) {
            return res.status(400).json({ error: 'Admin already exists' });
        }

        // Set the first email as adminEmail
        jsonData.adminEmail = email;

        writeJsonFile(DATA_FILE_PATH, jsonData);
        res.status(200).json({ message: 'Admin email set successfully' });
    } catch (error) {
        console.error('Error handling admin email:', error.message);
        res.status(500).json({ error: 'Failed to set admin email' });
    }
});

// Endpoint to transfer admin role
app.post('/transferAdmin', (req, res) => {
    const { newAdminEmail } = req.body;

    if (!newAdminEmail || typeof newAdminEmail !== 'string') {
        return res.status(400).json({ error: 'Invalid email' });
    }

    try {
        const jsonData = readJsonFile(DATA_FILE_PATH);

        // Check if the new admin email exists in the employees
        const emailExists = Object.values(jsonData.departments).some(department =>
            department.some(emp => emp.email === newAdminEmail)
        );

        if (!emailExists) {
            return res.status(400).json({ error: 'New admin email does not exist in the employee list' });
        }

        // Transfer admin role
        jsonData.adminEmail = newAdminEmail;

        writeJsonFile(DATA_FILE_PATH, jsonData);
        res.status(200).json({ message: 'Admin role transferred successfully' });
    } catch (error) {
        console.error('Error transferring admin role:', error.message);
        res.status(500).json({ error: 'Failed to transfer admin role' });
    }
});



// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
