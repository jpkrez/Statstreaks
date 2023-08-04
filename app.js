const express = require('express');
const path = require('path');
const Axios = require('axios');
const Papa = require('papaparse');
const cors = require('cors'); 


const app = express();
const port = 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'docs')));


async function fetchData() {
    try {
        const response = await Axios.get('https://raw.githubusercontent.com/jpkrez/Statstreaks/master/docs/mw2_player_stats2023.csv', { responseType: 'text' });
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
