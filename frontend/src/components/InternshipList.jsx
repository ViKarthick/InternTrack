import React, {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  useNavigate
} from 'react-router-dom';

import '../styles/intern-list.css';

import {
  fetchInternshipData
} from '../services/api';


/* =========================================
   Helpers
   ========================================= */

const normalizeRegisterNumber = (value) => {
  return String(value || '')
    .replace(/\s+/g, '')
    .trim();
};


const formatDate = (value) => {

  if (!value) return '';

  const date =
    new Date(value);

  if (isNaN(date.getTime())) {
    return value;
  }

  const day =
    String(
      date.getUTCDate()
    ).padStart(2, '0');

  const month =
    String(
      date.getUTCMonth() + 1
    ).padStart(2, '0');

  const year =
    date.getUTCFullYear();

  return `${day}-${month}-${year}`;
};


/* =========================================
   Component
   ========================================= */

const InternshipList = () => {

  const navigate =
    useNavigate();


  const [records, setRecords] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');


  /* =========================================
     Logged-in user
     ========================================= */

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


  const registerNumber =
    normalizeRegisterNumber(
      user['Register Number']
    );


  const role =
    String(
      user.Role || 'student'
    ).toLowerCase();


  /* =========================================
     Fetch internship records
     ========================================= */

  useEffect(() => {

    const loadData =
      async () => {

        try {

          setLoading(true);
          setError('');


          const response =
            await fetchInternshipData();


          /*
           * fetchInternshipData() returns:
           *
           * {
           *   result: "success",
           *   data: [...]
           * }
           *
           * So extract response.data.
           */

          const data =
            Array.isArray(response)
              ? response
              : Array.isArray(response?.data)
                ? response.data
                : [];


          console.log(
            'Internship API response:',
            response
          );

          console.log(
            'Internship records:',
            data
          );


          setRecords(data);

        } catch (err) {

          console.error(
            'Error fetching internship data:',
            err
          );

          setError(
            err.message ||
            'Error fetching internship data.'
          );

        } finally {

          setLoading(false);

        }

      };


    loadData();

  }, []);


  /* =========================================
     Filter records for logged-in student
     ========================================= */

  const filteredRecords =
    useMemo(() => {

      if (!registerNumber) {
        return [];
      }


      return records.filter(
        (record) => {

          const recordRegisterNumber =
            normalizeRegisterNumber(
              record['Register Number']
            );


          return (
            recordRegisterNumber ===
            registerNumber
          );

        }
      );

    }, [
      records,
      registerNumber
    ]);


  /* =========================================
     Table headers
     ========================================= */

  const headers =
    useMemo(() => {

      if (
        filteredRecords.length === 0
      ) {
        return [];
      }


      return Object.keys(
        filteredRecords[0]
      ).filter(
        (header) =>
          header !== '__rowNumber'
      );

    }, [
      filteredRecords
    ]);


  /* =========================================
     UI
     ========================================= */

  return (
    <div className="container">

      <h4>
        Internship Records
      </h4>


      {loading ? (

        <div id="loading">
          Loading Internship Data...
        </div>

      ) : error ? (

        <div id="loading">
          {error}
        </div>

      ) : !registerNumber ? (

        <div id="loading">
          Register number is not available
          for this account.
        </div>

      ) : filteredRecords.length === 0 ? (

        <>

          <div id="loading">
            No Internship Data Available.
          </div>


          <div className="buttons">

            <button
              onClick={() =>
                navigate(
                  '/internship-form',
                  {
                    state: {
                      addNew: true
                    }
                  }
                )
              }
            >
              Add Internship
            </button>


            <button
              onClick={() =>
                navigate('/home')
              }
            >
              Back
            </button>

          </div>

        </>

      ) : (

        <>

          <div className="internship-list">
  {filteredRecords.map((record, index) => (
    <div
      className="internship-card"
      key={record.__rowNumber || index}
    >
      <div className="internship-card-header">
        <div>
          <h3>
            {record['Title'] || 'Internship'}
          </h3>

          <p className="company-name">
            {record['Company Name'] || 'Company not specified'}
          </p>
        </div>

        <button
          className="edit-internship-btn"
          onClick={() =>
            navigate('/internship-form', {
              state: { editRecord: record }
            })
          }
        >
          Edit
        </button>
      </div>

      <div className="internship-details">

        <div className="detail-item">
          <span className="detail-label">Period</span>
          <span className="detail-value">
            {record['Period'] || '-'}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Start Date</span>
          <span className="detail-value">
            {formatDate(record['Start Date']) || '-'}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">End Date</span>
          <span className="detail-value">
            {formatDate(record['End Date']) || '-'}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Stipend</span>
          <span className="detail-value">
            {record['Stipend (In Rs.)']
              ? `₹${record['Stipend (In Rs.)']}`
              : '-'}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Type</span>
          <span className="detail-value">
            {record['Research/Industry'] || '-'}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Location</span>
          <span className="detail-value">
            {record['Abroad / India'] || '-'}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Placement</span>
          <span className="detail-value">
            {record['Placement thru college / outside'] || '-'}
          </span>
        </div>

      </div>
    </div>
  ))}
</div>


          <div className="buttons">

            <button
              onClick={() =>
                navigate(
                  '/internship-form',
                  {
                    state: {
                      addNew: true
                    }
                  }
                )
              }
            >
              Add Another
            </button>


            {role ===
              'coordinator' && (

              <button
                onClick={() =>
                  window.print()
                }
              >
                Print Report
              </button>

            )}


            <button
              onClick={() =>
                navigate(
                  role === 'student'
                    ? '/home'
                    : '/'
                )
              }
            >
              Back
            </button>

          </div>

        </>

      )}

    </div>
  );
};


export default InternshipList;