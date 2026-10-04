import React, {
  useEffect,
  useState
} from 'react';

import {
  useLocation,
  useNavigate
} from 'react-router-dom';

import '../styles/style.css';

import {
  fetchInternshipData,
  uploadFileToDrive,
  submitInternshipData,
  updateInternshipData,
  verifyDocument
} from '../services/api';


const emptyForm = {
  'Register Number': '',
  'Name': '',
  'Title': '',
  'Mobile No.': '',
  'Section': '',
  'Obtained Internship or Not': '',
  'Period': '',
  'Start Date': '',
  'End Date': '',
  'Company Name': '',
  'Placement thru college / outside': '',
  'Stipend (In Rs.)': '',
  'Research/Industry': '',
  'Abroad / India': '',
  'Signed Permission Letter, Offer Letter Submitted': '',
  'Completion Certificte Submitted': '',
  'Internship Report Submitted': '',
  'Student Feedback (About Internship) Submitted': '',
  'Employer Feedback (About student) Submitted': '',
  'Offer Letter': ''
};


const normalizeDate = (value) => {

  if (!value) return '';

  const stringValue =
    String(value);

  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      stringValue
    )
  ) {
    return stringValue;
  }

  const date =
    new Date(value);

  if (isNaN(date.getTime())) {
    return '';
  }

  return `${date.getUTCFullYear()}-${String(
    date.getUTCMonth() + 1
  ).padStart(2, '0')}-${String(
    date.getUTCDate()
  ).padStart(2, '0')}`;
};


const toYesNo = (value) => {

  if (
    value === true ||
    String(value)
      .toLowerCase() === 'yes'
  ) {
    return 'Yes';
  }

  if (
    value === false ||
    String(value)
      .toLowerCase() === 'no'
  ) {
    return 'No';
  }

  return value || '';
};


const InternshipForm = () => {

  const navigate =
    useNavigate();

  const location =
    useLocation();


  const [formData, setFormData] =
    useState(emptyForm);

  const [existingInternships, setExistingInternships] =
    useState([]);

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [errors, setErrors] =
    useState({});

  const [statusMessage, setStatusMessage] =
    useState('');

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [loadingExisting, setLoadingExisting] =
    useState(true);

  const [editingRow, setEditingRow] =
    useState(null);


  let user = {};

  try {

    user =
      JSON.parse(
        sessionStorage.getItem(
          'internTrackUser'
        )
      ) || {};

  } catch {

    user = {};
  }

  const normalizeRegisterNumber = (value) =>
  String(value || '').replace(/\s+/g, '').trim();


 const currentRegister = normalizeRegisterNumber(
  user['Register Number']
);



  useEffect(() => {
  const loadExisting = async () => {
    try {
      setLoadingExisting(true);

      const response = await fetchInternshipData();

      const data = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      const userRecords = data.filter(
        (record) =>
          normalizeRegisterNumber(
            record['Register Number']
          ) === currentRegister
      );

      console.log('All internship records:', data);
      console.log('Current register:', currentRegister);
      console.log('User internship records:', userRecords);

      setExistingInternships(userRecords);

    } catch (error) {
      console.error('Failed to load internships:', error);
      setExistingInternships([]);
    } finally {
      setLoadingExisting(false);
    }
  };

  if (currentRegister) {
    loadExisting();
  } else {
    setLoadingExisting(false);
  }
}, [currentRegister]);

  useEffect(() => {

    const loadExisting =
      async () => {

        try {

          setLoadingExisting(true);

          const response = await fetchInternshipData();

          const data = Array.isArray(response)
            ? response
            : Array.isArray(response?.data)
              ? response.data
              : [];

          const userRecords = data.filter(
            (record) =>
              String(
                record['Register Number'] || ''
              ).trim() === currentRegister
          );

          setExistingInternships(
            userRecords
          );

        } catch (error) {

          console.error(error);

        } finally {

          setLoadingExisting(false);
        }
      };


    if (currentRegister) {
      loadExisting();
    } else {
      setLoadingExisting(false);
    }

  }, [currentRegister]);


  useEffect(() => {

    const editRecord =
      location.state?.editRecord;


    if (editRecord) {

      const populated = {
        ...emptyForm
      };


      Object.keys(emptyForm).forEach(
        (key) => {

          populated[key] =
            editRecord[key] ?? '';

        }
      );


      populated[
        'Start Date'
      ] = normalizeDate(
        editRecord['Start Date']
      );


      populated[
        'End Date'
      ] = normalizeDate(
        editRecord['End Date']
      );


      [
        'Obtained Internship or Not',
        'Signed Permission Letter, Offer Letter Submitted',
        'Completion Certificte Submitted',
        'Internship Report Submitted',
        'Student Feedback (About Internship) Submitted',
        'Employer Feedback (About student) Submitted'
      ].forEach(
        (key) => {

          populated[key] =
            toYesNo(
              editRecord[key]
            );

        }
      );


      setFormData(
        populated
      );

      setEditingRow(
        editRecord.__rowNumber
      );

      setSelectedFile(null);

    }


    if (
      location.state?.addNew
    ) {

      setEditingRow(null);

      setSelectedFile(null);

      setFormData({
        ...emptyForm,

        'Register Number':
          currentRegister,

        Name:
          user.Name || ''
      });

    }

  }, [
    location.state,
    currentRegister,
    user.Name
  ]);


  const handleChange = (e) => {

    const {
      name,
      value,
      type,
      checked
    } = e.target;


    setFormData(
      (previous) => ({
        ...previous,

        [name]:
          type === 'checkbox'
            ? checked
              ? 'Yes'
              : 'No'
            : value
      })
    );


    setErrors(
      (previous) => ({
        ...previous,
        [name]: ''
      })
    );
  };


  const handleFileChange = (e) => {

    const file =
      e.target.files?.[0] ||
      null;

    setSelectedFile(file);

    setErrors(
      (previous) => ({
        ...previous,
        file: ''
      })
    );
  };


  const validate = () => {

    const newErrors = {};


    const required = [
      'Register Number',
      'Name',
      'Title',
      'Mobile No.',
      'Period',
      'Start Date',
      'End Date',
      'Company Name',
      'Placement thru college / outside',
      'Stipend (In Rs.)',
      'Research/Industry',
      'Abroad / India'
    ];


    required.forEach(
      (field) => {

        if (
          !String(
            formData[field] || ''
          ).trim()
        ) {

          newErrors[field] =
            'Required';

        }

      }
    );


    if (
      !editingRow &&
      !selectedFile
    ) {

      newErrors.file =
        'Offer letter is required.';

    }


    if (
      formData['Start Date'] &&
      formData['End Date']
    ) {

      if (
        new Date(
          formData['End Date']
        ) <
        new Date(
          formData['Start Date']
        )
      ) {

        newErrors[
          'End Date'
        ] =
          'End date must be after start date.';

      }

    }


    setErrors(
      newErrors
    );

    return (
      Object.keys(
        newErrors
      ).length === 0
    );
  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    setStatusMessage('');

    if (!validate()) {
      return;
    }


    setIsSubmitting(true);


    try {

      let finalData = {
        ...formData
      };


      if (selectedFile) {

        setStatusMessage(
          'Verifying document...'
        );


        const verification =
          await verifyDocument(
            selectedFile,
            {
              registerNumber:
                formData['Register Number'],

              studentName:
                formData['Name'],

              companyName:
                formData['Company Name']
            }
          );

        if (
          verification.result ===
            'error' ||
          verification.success ===
            false
        ) {

          throw new Error(
            verification.error ||
            'Document verification failed.'
          );
        }


        const extension =
          selectedFile.name.includes('.')
            ? selectedFile.name.substring(
                selectedFile.name.lastIndexOf('.')
              )
            : '.pdf';


        const renamedFile =
          new File(
            [
              selectedFile
            ],
            `${formData['Register Number']}-OfferLetter${extension}`,
            {
              type:
                selectedFile.type ||
                'application/pdf'
            }
          );


        setStatusMessage(
          'Uploading document...'
        );


        const uploadResult =
          await uploadFileToDrive(
            renamedFile,
            {
              registerNumber:
                formData[
                  'Register Number'
                ],

              studentName:
                formData[
                  'Name'
                ]
            }
          );


        finalData = {
          ...finalData,

          'Offer Letter':
            uploadResult.fileName ||
            renamedFile.name
        };


        if (
          uploadResult.url
        ) {

          finalData[
            'File URL'
          ] =
            uploadResult.url;

        }

      }


      if (editingRow) {

        setStatusMessage(
          'Updating internship...'
        );


        await updateInternshipData(
          editingRow,
          finalData
        );


        setStatusMessage(
          'Internship updated successfully.'
        );

      } else {

        setStatusMessage(
          'Submitting internship...'
        );


        await submitInternshipData(
          finalData
        );


        setStatusMessage(
          'Internship submitted successfully.'
        );

      }


      setTimeout(
        () => {
          navigate('/home');
        },
        800
      );

    } catch (error) {

      console.error(error);

      setStatusMessage(
        error.message ||
        'Unable to submit internship.'
      );

    } finally {

      setIsSubmitting(false);
    }
  };


  const goBack = () => {

    navigate('/home');
  };


  return (
    <div className="container">

      <form
        onSubmit={handleSubmit}
      >

        <h2>
          {editingRow
            ? 'Edit Internship'
            : 'Internship Form'}
        </h2>


        <label>
          Register Number
        </label>

        <input
          type="text"
          name="Register Number"
          value={
            formData[
              'Register Number'
            ]
          }
          onChange={handleChange}
          readOnly
        />


        <label>
          Name
        </label>

        <input
          type="text"
          name="Name"
          value={
            formData.Name
          }
          onChange={handleChange}
        />


        <label>
          Title
        </label>

        <input
          type="text"
          name="Title"
          value={
            formData.Title
          }
          onChange={handleChange}
        />


        <label>
          Mobile No.
        </label>

        <input
          type="text"
          name="Mobile No."
          value={
            formData[
              'Mobile No.'
            ]
          }
          onChange={handleChange}
        />


        <label>
          Section
        </label>

        <input
          type="text"
          name="Section"
          value={
            formData.Section
          }
          onChange={handleChange}
        />


        <label>
          Obtained Internship or Not
        </label>

        <select
          name="Obtained Internship or Not"
          value={
            formData[
              'Obtained Internship or Not'
            ]
          }
          onChange={handleChange}
        >

          <option value="">
            Select
          </option>

          <option value="Yes">
            Yes
          </option>

          <option value="No">
            No
          </option>

        </select>


        <label>
          Period
        </label>

        <input
          type="text"
          name="Period"
          value={
            formData.Period
          }
          onChange={handleChange}
        />


        <label>
          Start Date
        </label>

        <input
          type="date"
          name="Start Date"
          value={
            formData[
              'Start Date'
            ]
          }
          onChange={handleChange}
        />


        <label>
          End Date
        </label>

        <input
          type="date"
          name="End Date"
          value={
            formData[
              'End Date'
            ]
          }
          onChange={handleChange}
        />


        <label>
          Company Name
        </label>

        <input
          type="text"
          name="Company Name"
          value={
            formData[
              'Company Name'
            ]
          }
          onChange={handleChange}
        />


        <label>
          Placement thru college / outside
        </label>

        <select
          name="Placement thru college / outside"
          value={
            formData[
              'Placement thru college / outside'
            ]
          }
          onChange={handleChange}
        >

          <option value="">
            Select
          </option>

          <option value="College">
            College
          </option>

          <option value="Outside">
            Outside
          </option>

        </select>


        <label>
          Stipend (In Rs.)
        </label>

        <input
          type="number"
          name="Stipend (In Rs.)"
          value={
            formData[
              'Stipend (In Rs.)'
            ]
          }
          onChange={handleChange}
        />


        <label>
          Research/Industry
        </label>

        <select
          name="Research/Industry"
          value={
            formData[
              'Research/Industry'
            ]
          }
          onChange={handleChange}
        >

          <option value="">
            Select
          </option>

          <option value="Research">
            Research
          </option>

          <option value="Industry">
            Industry
          </option>

        </select>


        <label>
          Abroad / India
        </label>

        <select
          name="Abroad / India"
          value={
            formData[
              'Abroad / India'
            ]
          }
          onChange={handleChange}
        >

          <option value="">
            Select
          </option>

          <option value="India">
            India
          </option>

          <option value="Abroad">
            Abroad
          </option>

        </select>


        <label>
          Signed Permission Letter, Offer Letter Submitted
        </label>

        <select
          name="Signed Permission Letter, Offer Letter Submitted"
          value={
            formData[
              'Signed Permission Letter, Offer Letter Submitted'
            ]
          }
          onChange={handleChange}
        >

          <option value="">
            Select
          </option>

          <option value="Yes">
            Yes
          </option>

          <option value="No">
            No
          </option>

        </select>


        <label>
          Completion Certificte Submitted
        </label>

        <select
          name="Completion Certificte Submitted"
          value={
            formData[
              'Completion Certificte Submitted'
            ]
          }
          onChange={handleChange}
        >

          <option value="">
            Select
          </option>

          <option value="Yes">
            Yes
          </option>

          <option value="No">
            No
          </option>

        </select>


        <label>
          Internship Report Submitted
        </label>

        <select
          name="Internship Report Submitted"
          value={
            formData[
              'Internship Report Submitted'
            ]
          }
          onChange={handleChange}
        >

          <option value="">
            Select
          </option>

          <option value="Yes">
            Yes
          </option>

          <option value="No">
            No
          </option>

        </select>


        <label>
          Student Feedback (About Internship) Submitted
        </label>

        <select
          name="Student Feedback (About Internship) Submitted"
          value={
            formData[
              'Student Feedback (About Internship) Submitted'
            ]
          }
          onChange={handleChange}
        >

          <option value="">
            Select
          </option>

          <option value="Yes">
            Yes
          </option>

          <option value="No">
            No
          </option>

        </select>


        <label>
          Employer Feedback (About student) Submitted
        </label>

        <select
          name="Employer Feedback (About student) Submitted"
          value={
            formData[
              'Employer Feedback (About student) Submitted'
            ]
          }
          onChange={handleChange}
        >

          <option value="">
            Select
          </option>

          <option value="Yes">
            Yes
          </option>

          <option value="No">
            No
          </option>

        </select>


        <label>
          Offer Letter
        </label>

        <input
          type="file"
          accept=".pdf"
          onChange={
            handleFileChange
          }
        />


        {formData[
          'Offer Letter'
        ] && (
          <p>
            Existing file:{' '}
            {
              formData[
                'Offer Letter'
              ]
            }
          </p>
        )}


        {errors.file && (
          <p>
            {errors.file}
          </p>
        )}


        {statusMessage && (
          <p>
            {statusMessage}
          </p>
        )}


        <input
          type="submit"
          value={
            isSubmitting
              ? 'Submitting...'
              : editingRow
                ? 'Update'
                : 'Submit'
          }
          id="submit"
          disabled={
            isSubmitting
          }
        />

      </form>


      <div id="buttons">

        <button
          onClick={goBack}
        >
          Back
        </button>

      </div>

    </div>
  );
};


export default InternshipForm;