const express = require('express');
const path = require('path');
const Axios = require('axios');
const Papa = require('papaparse');
const cors = require('cors'); 


const app = express();
const port = 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));


async function fetchScheduleData() {
  try {
    const response = await Axios.get('https://www.callofdutyleague.com/en-us/schedule');
    print(response)
    if (!response.data) {
      throw new Error('Empty response received');
    }
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch schedule data');
  }
}

app.get('/api/schedule', async (req, res) => {
  try {
    const scheduleData = await fetchScheduleData();
    // Process the scheduleData as needed
    // You might need to use a specific library like Cheerio to parse the HTML and extract the schedule information.
    // For simplicity, let's assume the scheduleData contains the relevant schedule information as an array of objects.

    const dataArray = [
      { date: '2023-08-01', team1: 'Team A', team2: 'Team B', time: '12:00 PM' },
      // Add more schedule information here...
    ];

    res.json(dataArray);
  } catch (error) {
    console.error('Error fetching schedule data:', error);
    res.status(500).json({ error: 'Failed to fetch or process schedule data' });
  }
});




async function fetchData() {
    try {
        const response = await Axios.get('https://github.com/jpkrez/Statstreaks/raw/master/public/mw2_player_stats2023.csv', { responseType: 'text' });
        if (!response.data) {
            throw new Error('Empty response received');
        }
        return response.data;
    } catch (error) {
        throw new Error('Failed to fetch CSV data');
    }
}


app.get('/api/data', async (req, res) => {
    try {
      const csvData = await fetchData();

      // Use PapaParse to parse the CSV data
      Papa.parse(csvData, {
        header: true,
        complete: function (results) {
          const dataArray = results.data;
          // Process the dataArray as needed
  
          // Send the processed data back to the frontend
          res.json(dataArray);
        },
        error: function (error) {
          console.error('Error parsing CSV:', error);
          res.status(500).json({ error: 'Error parsing CSV data' });
        },
      });
    } catch (error) {
      console.error('Error fetching CSV data:', error);
      res.status(500).json({ error: 'Failed to fetch or process data' });
    }
  });


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
