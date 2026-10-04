import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchInternshipData } from '../services/api';
import '../styles/intern-list.css';

const FacultyView = () => {
  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchInternshipData()
      .then((data) => {
        if (data.result === 'success') setTableData(data.data);
        else setError('No internship data available.');
      })
      .catch((err) => {
        console.error(err);
        setError('Error fetching internship data.');
      })
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    sessionStorage.removeItem('internTrackUser');
    navigate('/');
  };

  return (
    <div className="list-page">
      <div className="list-container">
        <h1>Faculty View</h1>

        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}

        {!loading && !error && tableData.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  {tableData[0].map((header, index) => (
                    <th key={index}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.slice(1).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="buttons">
          <button onClick={logout}>Log Out</button>
        </div>
      </div>
    </div>
  );
};

export default FacultyView;