# InternTrack

A full-stack internship management platform designed to streamline internship record submission, document verification, and internship data management for students, faculty, and coordinators.

## Features

- User login and registration
- Google Sheets-based user login data
- Role-based access for students, faculty, and coordinators
- Student internship record submission
- Internship information management
- Internship document upload and management
- OCR-based document verification using Python Tesseract
- Verification of student registration number, name, and company information
- Automated document naming based on student registration number
- Google Drive integration for document storage
- Google Sheets integration for internship record management
- Internship record retrieval and filtering
- Coordinator report generation and printing
- Profile and internship information views

## Technology Stack

### Frontend
- React
- JavaScript
- HTML5
- CSS3

### Backend
- Node.js
- Express.js
- REST APIs
- Multer
- Axios

### OCR & Document Processing
- Python
- Flask
- Tesseract OCR
- Pytesseract
- Pillow
- pdf2image

### Cloud Services
- Google Drive
- Google Sheets
- Google Apps Script

## Architecture

```text
React Frontend
      │
      ├──────────────► Google Apps Script ─────► Users Sheet
      │                                      └─► Internship Sheet
      │
      ▼
Express Backend
      │
      └──────────────► Python OCR Service
                              │
                              ▼
                         Tesseract OCR

Google Apps Script ─────► Google Drive
```

## Project Structure

```text
InternTrack/
├── public/
│   └── index.html
├── src/
│   ├── assets/
│   │   ├── img.jpg
│   │   └── photo.jpg
│   ├── components/
│   │   ├── CoordinatorView.jsx
│   │   ├── FacultyView.jsx
│   │   ├── Home.jsx
│   │   ├── InternshipForm.jsx
│   │   ├── InternshipList.jsx
│   │   ├── Login.jsx
│   │   ├── ProfileCard.jsx
│   │   └── Register.jsx
│   ├── services/
│   │   └── api.js
│   └── styles/
├── backend/
│   ├── Server.js
│   └── package.json
├── ocr_service/
│   ├── ocr_service.py
│   └── requirements.txt
├── AppScript.js
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Google Sheets Setup

Create one Google Spreadsheet with two sheets:

### Users

Use these headers:

```text
Name | Email | Password | Role
```

Example:

```text
Student One | student@gmail.com | student123 | student
Coordinator One | coordinator@gmail.com | coord123 | coordinator
Faculty One | faculty@gmail.com | faculty123 | faculty
```

### Internships

Create the headers matching the fields used by `InternshipForm.jsx`.

Then update these values in `AppScript.js`:

```javascript
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
const DRIVE_FOLDER_ID = 'YOUR_DRIVE_FOLDER_ID';
```

## Google Apps Script Deployment

1. Open the Google Spreadsheet.
2. Open **Extensions → Apps Script**.
3. Paste the contents of `AppScript.js`.
4. Set `SPREADSHEET_ID`.
5. Set `DRIVE_FOLDER_ID`.
6. Deploy as a **Web app**.
7. Set access appropriately for your application.
8. Copy the Web App URL.

## Frontend Configuration

Create a `.env` file in the project root:

```env
REACT_APP_INTERNSHIP_SCRIPT_URL=YOUR_INTERNSHIP_GOOGLE_APPS_SCRIPT_URL
REACT_APP_AUTH_SCRIPT_URL=YOUR_AUTH_GOOGLE_APPS_SCRIPT_URL
REACT_APP_UPLOAD_URL=http://localhost:5000/upload-file
REACT_APP_VERIFY_URL=http://localhost:5000/api/verify-document
```

For this implementation, the same Apps Script Web App can be used for both authentication and internship data.

## Installation

### Frontend

```bash
npm install
```

### Backend

```bash
cd backend
npm install
```

### OCR Service

Install Python dependencies:

```bash
cd ../ocr_service
pip install -r requirements.txt
```

Tesseract OCR and Poppler/pdf2image dependencies should also be installed on the development machine.

## Running the Application

### Start Backend

From the `backend` directory:

```bash
node Server.js
```

The Express backend runs on:

```text
http://localhost:5000
```

The OCR service runs on:

```text
http://127.0.0.1:5001
```

### Start React Frontend

From the project root:

```bash
npm start
```

## Login Workflow

```text
User enters email + password
            │
            ▼
       Login.jsx
            │
            ▼
   Google Apps Script
            │
            ▼
       Users Sheet
            │
            ▼
     Match credentials
            │
       ┌────┴────┐
       ▼         ▼
     Role      Invalid
       │
       ▼
Student / Faculty / Coordinator
```

## Internship Document Verification

```text
Uploaded Offer Letter
        │
        ▼
Express Backend
        │
        ▼
Python OCR Service
        │
        ▼
Tesseract OCR
        │
        ▼
Extracted Text
        │
        ▼
Registration Number
Student Name
Company Name
        │
        ▼
Document Verified
```

## Author

**Vijay Karthick Vaidyanathan**

Computer Science Engineering

GitHub: https://github.com/ViKarthick
