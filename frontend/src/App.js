import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto'; // Import Chart.js library
import './styles.css';

function App() {
  const [resultData, setResultData] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const chartRef = useRef(null); // Create a ref to hold the Chart instance

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8080');
        const data = await response.json();
        setResultData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);  

  useEffect(() => {
    if (resultData && selectedDepartment) {
      // Store data for the selected department
      const data = resultData[selectedDepartment];

      // Store data in variables
      const viewsData = data.views;
      const downloadsData = data.downloads;
      const topCountriesObject = data.topCountriesByViews;
      const countriesData = Object.entries(topCountriesObject);
      const titleData = data.topPerformingArticle;
      const totalViews = data.totalViews;
      const totalDownloads = data.totalDownloads;
      const labels = mapToFormattedArray(data.xlabels);

      function mapToFormattedArray(arr) {
        return arr.map(dateString => {
          const [year, month] = dateString.split('-');
          const monthIndex = parseInt(month, 10) - 1; // Month indices start from 0
          const dateObj = new Date(year, monthIndex);
          // Format the date as 'Mon YYYY'
          const formattedDate = new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short'
          }).format(dateObj);
          return formattedDate;
        });
      }

      function displayData() {
        // Assuming there's only one row in the table body
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = ''; // Clear existing data
        titleData.forEach(entry => {
          const row = document.createElement('tr');
          const titleCell = document.createElement('td');
          const viewsCell = document.createElement('td');
          const titleLink = document.createElement('a');
          titleLink.textContent = entry.title;
          titleLink.href = entry.url;
          titleLink.style.textDecoration = 'none';
          titleLink.style.color = 'black';
          titleCell.appendChild(titleLink);
          viewsCell.textContent = entry.views;
          row.appendChild(titleCell);
          row.appendChild(viewsCell);
          tbody.appendChild(row);
        });
      }

      displayData();

      const tableRows2 = [];
                for (let i = 0; i < 9; i++) {
                    tableRows2.push(`<tr>
                                        <td>${countriesData[i][0]}</td>
                                        <td>${countriesData[i][1]}</td>
                                    </tr>
                                `);
                }
                
                const table2 = `<table>
                                    <tr>
                                        <th>Country</th>
                                        <th>Views</th>
                                    </tr>
                                    ${tableRows2.join('')}
                                </table>`;

      document.getElementById('topCountriesByViews').innerHTML = table2;

                const tableRow3 = [];
                const table3 = `<table>
                                    <tr>
                                        <th>Totals</th>
                                        <th>Value</th>
                                    </tr>
                                    <tr>
                                        <td>Total Views</td>
                                        <td>${totalViews}</td>
                                    </tr>
                                    <tr>
                                        <td>Total Downloads</td>
                                        <td>${totalDownloads}</td>
                                    </tr>
                                </table>`;

      document.getElementById('totals').innerHTML = table3;

      // Destroy existing Chart instance if it exists
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      // Create new Chart instance
      const ctx = document.getElementById('myChart').getContext('2d');
      chartRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.xlabels,
          datasets: [
            {
              label: 'Views',
              data: data.views,
              backgroundColor: 'rgba(0, 154, 68, 0.3)',
              borderColor: 'rgba(0, 154, 68 , 1)',
              borderWidth: 1,
            },
            {
              label: 'Downloads',
              data: data.downloads,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderColor: 'rgba(0, 0, 0, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            x: { stacked: false },
            y: { stacked: false }
          },
        }
      });
    }
  }, [resultData, selectedDepartment]);

  const handleSelectChange = (e) => {
    setSelectedDepartment(e.target.value);
  };

  return (
    <div className="master">
      <div className="dropdown">
        <div id="heading">Select Department:</div>
        <label htmlFor="departments">Select a department : </label>
        <select id="departments" value={selectedDepartment} onChange={handleSelectChange}>
          <option value="">Select an option </option>
          {resultData && Object.keys(resultData).map((departmentName) => (
            <option key={departmentName} value={departmentName}>{departmentName}</option>
          ))}
        </select>
      </div>
      <h2 id="heading">Total views and downloads</h2>
      <div id="totals"></div>
      <h2 id="heading">Past 6 months overview</h2>
      <canvas id="myChart"></canvas>
      <h2 id="heading">Trending Articles</h2>
      <div id="topPerformingArticles">
        <table id="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Views</th>
            </tr>
          </thead>
          <tbody id="tableBody"></tbody>
        </table>
      </div>
      <h2 id="heading">Top Countries by Views</h2>
      <div id="topCountriesByViews"></div>
    </div>
  );
}

export default App;
