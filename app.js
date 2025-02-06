// Import API functions
import { fetchAttendanceData, releaseSpot, removeSpot } from './server.js';

// Initialize the application
let attendanceData = {}
document.addEventListener('DOMContentLoaded', async () => {
  const loadingHeader = document.getElementById('loading')
  try {
    // Fetch initial data
    attendanceData = await fetchAttendanceData();

    loadingHeader.style.display = "none"
    renderMainPage(attendanceData);
  } catch (error) {
    console.error('Failed to initialize app:', error);
    loadingHeader.textContent = "Chyba při načítání dat"
    // You might want to show an error message to the user here
  }
});

function renderMainPage() {
  renderDateSection('thisWeek', attendanceData.thisWeek);
  renderDateSection('nextWeek', attendanceData.nextWeek);
  renderDateSection('followingWeek', attendanceData.followingWeek);
  renderDateSection('week4', attendanceData.week4);
  renderDateSection('week5', attendanceData.week5);
  setupEventListeners();
}

function renderDateSection(sectionId, dates) {
  const title = document.getElementById(`${sectionId}-title`);
  const content = document.getElementById(`${sectionId}-content`);
  title.textContent = dates[0].weekText.toUpperCase();
  content.innerHTML = dates.map(date => `
        <div class="date-row" data-date="${date.date}" data-id="${date.id}" data-day="${date.day}">
            <div class="date-info">
                <div class="day">${date.weekText}</div>
                <div class="date">${date.date}</div>
            </div>
            <div class="availability">
                <div class="spots">Omluv: ${date.spots?.length ?? 0}</div>
                <div class="lunches">s obědy: ${date.spots?.reduce((acc, spot) => acc + Number(spot.lunch === 'TRUE'), 0) ?? 0}</div>
            </div>
        </div>
    `).join('');
}

let selectedDate = null;

function setupEventListeners() {
  // Date row click handlers
  document.querySelectorAll('.date-row').forEach(row => {
    row.addEventListener('click', () => {
      selectedDate = {
        id: row.dataset.id,
        date: row.dataset.date,
        day: row.dataset.day
      };
      showDetailsPage();
    });
  });

  // Back buttons
  document.querySelectorAll('.back-button').forEach(button => {
    button.addEventListener('click', () => {
      showMainPage();
    });
  });

  // Release spot button
  document.getElementById('releaseSpotBtn').addEventListener('click', showReleaseForm);

  // Release form submission
  document.getElementById('releaseForm').addEventListener('submit', handleReleaseFormSubmit);
}

async function showDetailsPage() {
  try {
    const dateData = [...attendanceData.thisWeek, ...attendanceData.nextWeek, ...attendanceData.followingWeek, ...attendanceData.week4, ...attendanceData.week5]
      .find(d => d.id === selectedDate.id);

    document.getElementById('detailsDate').textContent = `${selectedDate.date}`;
    document.getElementById('detailsDetails').textContent = `Omluv: ${dateData.spots?.length ?? 0}, s obědy: ${dateData.spots?.reduce((acc, spot) => acc + Number(spot.lunch === 'TRUE'), 0)} `;
    renderSpotsList(dateData.spots, dateData.id);
    showPage('detailsPage');
  } catch (error) {
    console.error('Error showing details page:', error);
    // Handle error appropriately
  }
}

function renderSpotsList(spots, dayId) {
  const spotsList = document.getElementById('spotsList');
  spotsList.innerHTML = spots.map(spot => `
      <div class="spot-item">
            <span>${spot.name}</span>
           ${spot.lunch === 'TRUE' ? '<span>s obědem</span>' : '<span>bez oběda</span>'}
            <button id="removeButton-${spot.name}-${dayId}" class="remove-button" data-spot-name="${spot.name}" data-spot-id="${dayId}">Vymazat</button>
        </div >
      `).join('');

  // Add click handlers for remove buttons
  spotsList.querySelectorAll('.remove-button').forEach(button => {
    button.addEventListener('click', () => handleRemoveSpot(button.dataset));
  });
}

async function handleRemoveSpot(data) {
  document.getElementById(`removeButton-${data.spotName}-${data.spotId}`).disabled = true;
  document.getElementById(`removeButton-${data.spotName}-${data.spotId}`).textContent = '...';

  try {
    attendanceData = await removeSpot({
      kidName: data.spotName,
      dayId: data.spotId
    });

    // Show success popup
    showSuccessPopup();
    // Refresh the details page to show updated spots
    await showDetailsPage();
  } catch (error) {
    console.error('Error removing spot:', error);
    // Handle error appropriately
  }
}

function showReleaseForm() {
  showPage('releaseFormPage');
}

async function handleReleaseFormSubmit(event) {
  event.preventDefault();
  const form = document.querySelector("#releaseForm")
  const formData = new FormData(form)

  const queryData = {
    kidName: formData.get('kidName'),
    withLunch: formData.get('withLunch'),
    date: selectedDate.id
  };

  try {
    document.getElementById('releaseFormSubmitButton').disabled = true;
    document.getElementById('releaseFormSubmitButton').textContent = '...';
    attendanceData = await releaseSpot(queryData);

    // Show success popup
    showSuccessPopup();

    // Reset form
    event.target.reset();
  } catch (error) {
    console.error('Error releasing spot:', error);
    // Handle error appropriately
  }

  document.getElementById('releaseFormSubmitButton').textContent = 'Omluvit'
  document.getElementById('releaseFormSubmitButton').disabled = false;
}

function showSuccessPopup() {
  const popup = document.getElementById('successPopup');
  popup.classList.add('active');

  // Hide popup after 2 seconds
  setTimeout(() => {
    popup.classList.remove('active');
    showMainPage();
  }, 2000);
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  document.getElementById(pageId).classList.add('active');
}

function showMainPage() {
  showPage('mainPage');
  renderMainPage()
}
