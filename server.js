// Base URL for the Apps Script deployment
const API_BASE_URL = 'https://script.google.com/macros/s/AKfycbx555ApewzcbXqkIWYQpydEDLQ7QBGWqXAZ2wlW2NmKnwRi3kmlxC3H3ovJjwPpc1LM/exec'

const parseResponse = (data) => {
  const thisWeek = data.filter(row => row.week == 1 && row.isPast === 'FALSE')
  const nextWeek = data.filter(row => row.week == 2 && row.isPast === 'FALSE')
  const followingWeek = data.filter(row => row.week == 3 && row.isPast === 'FALSE')
  const week4 = data.filter(row => row.week == 4 && row.isPast === 'FALSE')
  const week5 = data.filter(row => row.week == 5 && row.isPast === 'FALSE')
  return { thisWeek, nextWeek, followingWeek, week4, week5 };
}

/**
 * Fetches all attendance data from the backend
 * @returns {Promise<{thisWeek: Array, nextWeek: Array, followingWeek: Array}>}
 */
async function fetchAttendanceData() {
  try {
    const response = await fetch(`${API_BASE_URL}`);
    if (!response.ok) {
      throw new Error('Failed to fetch attendance data');
    }
    const data = await response.json();
    return parseResponse(data)
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    throw error;
  }
}

/**
 * Releases a new spot
 * @param {Object} data - The spot data
 * @param {string} data.name - Name of the person
 * @param {boolean} data.withLunch - Whether lunch is included
 * @param {string} data.date - The date for the spot
 * @returns {Promise<Object>}
 */
async function releaseSpot({ date, kidName, withLunch }) {
  const postData = {
    function: "addNameOut",
    payload: { "dayId": date, kidName, "lunch": withLunch ? "TRUE" : "FALSE" }
  }
  try {
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      throw new Error('Failed to release spot');
    }

    const data = await response.json();
    return parseResponse(data)
  } catch (error) {
    console.error('Error releasing spot:', error);
    throw error;
  }
}

/**
 * Removes a released spot
 * @param {Object} data - The spot data
 * @returns {Promise<Object>}
 */
async function removeSpot({ dayId, kidName }) {
  const postData = {
    function: "removeNameOut",
    payload: { dayId, kidName }
  }
  console.log(postData)
  try {
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      throw new Error('Failed to remove spot');
    }

    const retData = await response.json();
    return parseResponse(retData)
  } catch (error) {
    console.error('Error removing spot:', error);
    throw error;
  }
}

export {
  fetchAttendanceData,
  releaseSpot,
  removeSpot
};
