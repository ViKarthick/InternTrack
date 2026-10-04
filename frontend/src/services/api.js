// ======================================================
// ENVIRONMENT VARIABLES
// ======================================================

const internshipScriptURL =
  process.env.REACT_APP_INTERNSHIP_SCRIPT_URL ||
  'YOUR_INTERNSHIP_GOOGLE_APPS_SCRIPT_URL';

const authScriptURL =
  process.env.REACT_APP_AUTH_SCRIPT_URL ||
  internshipScriptURL;

const localUploadURL =
  process.env.REACT_APP_UPLOAD_URL ||
  'http://localhost:5000/upload-file';

const verifyURL =
  process.env.REACT_APP_VERIFY_URL ||
  'http://localhost:5000/api/verify-document';


// ======================================================
// FETCH USERS
// ======================================================

export const fetchUsers = async () => {
  const response = await fetch(
    `${authScriptURL}?action=users`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch users. HTTP ${response.status}`
    );
  }

  const result = await response.json();

  // Your Apps Script returns:
  // {
  //   result: 'success',
  //   data: users
  // }

  if (result.result === 'success') {
    return result.data || [];
  }

  throw new Error(
    result.error ||
    result.message ||
    'Failed to fetch users.'
  );
};


// ======================================================
// REGISTER USER
// ======================================================

export const registerUser = async ({
  name,
  email,
  password,
  registerNumber
}) => {
  const payload = {
    action: 'register',
    name,
    email,
    password,
    registerNumber
  };

  const response = await fetch(
    authScriptURL,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    }
  );

  if (!response.ok) {
    throw new Error(
      `Registration failed. HTTP ${response.status}`
    );
  }

  const result = await response.json();

  if (result.result !== 'success') {
    throw new Error(
      result.error ||
      result.message ||
      'Registration failed.'
    );
  }

  return result;
};


// ======================================================
// LOCAL FILE UPLOAD
// ======================================================

export const uploadFileLocally = async (file) => {
  const formData = new FormData();

  formData.append('pdfFile', file);

  const response = await fetch(
    localUploadURL,
    {
      method: 'POST',
      body: formData
    }
  );

  if (!response.ok) {
    throw new Error('File upload failed.');
  }

  return response.json();
};


// ======================================================
// DOCUMENT VERIFICATION / OCR
// ======================================================

export const verifyDocument = async (
  file,
  registerNumber,
  studentName,
  companyName
) => {
  const formData = new FormData();

  formData.append('file', file);

  formData.append(
    'registerNumber',
    registerNumber || ''
  );

  formData.append(
    'studentName',
    studentName || ''
  );

  formData.append(
    'companyName',
    companyName || ''
  );

  const response = await fetch(
    verifyURL,
    {
      method: 'POST',
      body: formData
    }
  );

  if (!response.ok) {
    throw new Error(
      `Document verification failed. HTTP ${response.status}`
    );
  }

  return response.json();
};


// ======================================================
// GOOGLE DRIVE FILE UPLOAD
// ======================================================

export const uploadFileToDrive = async (
  file,
  metadata = {}
) => {
  const base64 = await fileToBase64(file);

  const payload = {
    action: 'uploadFile',
    fileName: file.name,
    mimeType: file.type || 'application/pdf',
    base64,
    ...metadata
  };

  const response = await fetch(
    internshipScriptURL,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    }
  );

  if (!response.ok) {
    throw new Error(
      `Google Drive upload failed. HTTP ${response.status}`
    );
  }

  const result = await response.json();

  if (
    result.result === 'error' ||
    result.status === false
  ) {
    throw new Error(
      result.error ||
      result.message ||
      'Google Drive upload failed.'
    );
  }

  return result;
};


// ======================================================
// SUBMIT INTERNSHIP DATA
// ======================================================

export const submitInternshipData = async (
  formData
) => {
  /*
   * Apps Script expects the internship fields
   * directly inside params.
   *
   * Example:
   *
   * {
   *   action: 'submitInternship',
   *   'Register Number': '3122225001156',
   *   'Name': 'Vijay Karthick',
   *   ...
   * }
   */

  const payload = {
    action: 'submitInternship',
    ...formData
  };

  const response = await fetch(
    internshipScriptURL,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    }
  );

  if (!response.ok) {
    throw new Error(
      `Internship submission failed. HTTP ${response.status}`
    );
  }

  const result = await response.json();

  if (result.result !== 'success') {
    throw new Error(
      result.error ||
      result.message ||
      'Internship submission failed.'
    );
  }

  return result;
};


// ======================================================
// FETCH INTERNSHIP DATA
// ======================================================

export const fetchInternshipData = async () => {
  const response = await fetch(
    internshipScriptURL
  );

  if (!response.ok) {
    throw new Error(
      `Unable to fetch internship records. HTTP ${response.status}`
    );
  }

  const result = await response.json();

  if (result.result === 'error') {
    throw new Error(
      result.error ||
      result.message ||
      'Unable to fetch internship records.'
    );
  }

  return result;
};


// ======================================================
// UPDATE INTERNSHIP DATA
// ======================================================

export const updateInternshipData = async (
  rowNumber,
  formData
) => {
  const payload = {
    action: 'updateInternship',
    rowNumber,
    data: JSON.stringify(formData)
  };

  const response = await fetch(
    internshipScriptURL,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    }
  );

  if (!response.ok) {
    throw new Error(
      `Internship update failed. HTTP ${response.status}`
    );
  }

  const result = await response.json();

  if (result.result !== 'success') {
    throw new Error(
      result.error ||
      result.message ||
      'Unable to update internship.'
    );
  }

  return result;
};


// ======================================================
// FILE → BASE64
// ======================================================

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = String(
        reader.result
      );

      /*
       * FileReader normally returns:
       *
       * data:application/pdf;base64,JVBERi0x...
       *
       * We only need the Base64 portion.
       */

      resolve(
        result.includes(',')
          ? result.split(',')[1]
          : result
      );
    };

    reader.onerror = () => {
      reject(
        new Error(
          'Unable to read the file.'
        )
      );
    };

    reader.readAsDataURL(file);
  });