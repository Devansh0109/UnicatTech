const calendarDays = document.getElementById('calendar-days');
const calendarWeekdays = document.getElementById('calendar-weekdays');
const departmentRows = document.getElementById('department-rows');
const weekDateRange = document.getElementById('week-date-range');
const prevWeek = document.getElementById('prev-week');
const nextWeek = document.getElementById('next-week');
const addEventButton = document.getElementById('add-event-btn');
const addDepartmentButton = document.getElementById('add-department-btn');
const addEmployeeButton = document.getElementById('add-employee-btn');
const transferAdminButton = document.getElementById('transfer-admin-btn');
const departmentSelect = document.getElementById('department-select');
const employeeSearchInput = document.getElementById('employee-search');
const controlBar = document.querySelector('.control-bar');

const eventModal = document.getElementById('event-modal');
const closeModalButton = document.getElementById('close-event-modal');
const eventForm = document.getElementById('event-form');
const eventTitleInput = document.getElementById('event-title');
const eventDateInput = document.getElementById('event-date');
const startTimeInput = document.getElementById('start-time');
const endTimeInput = document.getElementById('end-time');
const eventTypeSelect = document.getElementById('event-type');
const eventIdInput = document.getElementById('event-id');
const departmentNameInput = document.getElementById('department-name');
const employeeNameInput = document.getElementById('employee-name');
const modalTitle = document.getElementById('modal-title');

const departmentModal = document.getElementById('department-modal');
const closeDepartmentModalButton = document.getElementById('close-department-modal');
const departmentForm = document.getElementById('department-form');
const newDepartmentNameInput = document.getElementById('new-department-name');

const employeeModal = document.getElementById('employee-modal');
const closeEmployeeModalButton = document.getElementById('close-employee-modal');
const employeeForm = document.getElementById('employee-form');
const employeeDepartmentSelect = document.getElementById('employee-department');
const newEmployeeNameInput = document.getElementById('new-employee-name');
const newEmployeeEmailInput = document.getElementById('employee-email');
const isAdminInput = document.getElementById('is-admin');

const eventListModal = document.getElementById('event-list-modal');
const closeListButton = document.getElementById('close-list-button');
const eventList = document.getElementById('event-list');
const listDate = document.getElementById('list-date');

const transferAdminModal = document.getElementById('transfer-admin-modal');
const closeTransferAdminModalButton = document.getElementById('close-transfer-admin-modal');
const transferAdminForm = document.getElementById('transfer-admin-form');
const selectAdminEmployee = document.getElementById('select-admin-employee');

const loginModal = document.getElementById('login-modal');
const loginForm = document.getElementById('login-form');
const loginEmailInput = document.getElementById('login-email');

const timeSelection = document.getElementById('time-selection');
const dateRangeSelection = document.getElementById('date-range-selection');
const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');

let currentWeekStart = new Date();
let events = [];
let departments = {};
let adminEmail = null;
let isAdmin = false;
let loggedInUserEmail = null; // Track logged-in user's email

// Show login modal on page load
window.onload = () => {
    loginModal.style.display = 'block';
    controlBar.style.display = 'none'; // Hide the control bar initially
};

// Validate login credentials
function validateLogin(e) {
    e.preventDefault();

    const email = loginEmailInput.value.trim();
    loggedInUserEmail = email; // Store the logged-in user's email

    fetch('http://localhost:3000/loadCalendarState')
        .then(response => response.json())
        .then(data => {
            const adminData = data.admin || {};

            if (!adminData.email) {
                adminEmail = email;
                isAdmin = true;
                saveCalendarState();
                alert(`Welcome, ${email}. You have been set as the admin.`);
            } else if (email === adminData.email) {
                isAdmin = true;
                alert('Welcome, Admin.');
            } else {
                let employeeFound = false;
                let userDepartment = null;
                for (const department in data.departments) {
                    const employee = data.departments[department].find(emp => emp.email === email);
                    if (employee) {
                        employeeFound = true;
                        isAdmin = false;
                        userDepartment = department;
                        break;
                    }
                }

                if (!employeeFound) {
                    alert('Invalid email.');
                    return;
                }

                departmentSelect.value = userDepartment;
            }

            loginModal.style.display = 'none';
            calendar.style.display = 'block';
            controlBar.style.display = 'flex'; // Show the control bar after login

            toggleAdminControls();
            loadCalendarState();
            renderWeek(currentWeekStart);
        })
        .catch(error => console.error('Error loading calendar state:', error));
}

loginForm.addEventListener('submit', validateLogin);

function toggleAdminControls() {
    if (isAdmin) {
        addDepartmentButton.style.display = 'inline-block';
        addEmployeeButton.style.display = 'inline-block';
        transferAdminButton.style.display = 'inline-block';
    } else {
        addDepartmentButton.style.display = 'none';
        addEmployeeButton.style.display = 'none';
        transferAdminButton.style.display = 'none';
    }
}

function initializeDepartmentAndEmployeeOptions() {
    updateDepartmentOptions();
    toggleAdminControls();

    departmentNameInput.addEventListener('change', function () {
        updateEmployeeOptions(this.value);
    });

    if (departmentNameInput.value) {
        updateEmployeeOptions(departmentNameInput.value);
    }
}

function updateDepartmentOptions() {
    departmentNameInput.innerHTML = '';
    employeeDepartmentSelect.innerHTML = '';
    departmentSelect.innerHTML = '';

    // Add "All Departments" option
    const allDepartmentsOption = document.createElement('option');
    allDepartmentsOption.value = 'all';
    allDepartmentsOption.text = 'All Departments';
    departmentSelect.add(allDepartmentsOption);

    Object.keys(departments).forEach(department => {
        const departmentOption = document.createElement('option');
        departmentOption.value = department;
        departmentOption.text = department;
        departmentNameInput.add(departmentOption);

        const employeeDepartmentOption = document.createElement('option');
        employeeDepartmentOption.value = department;
        employeeDepartmentOption.text = department;
        employeeDepartmentSelect.add(employeeDepartmentOption);

        const mainDepartmentOption = document.createElement('option');
        mainDepartmentOption.value = department;
        mainDepartmentOption.text = department;
        departmentSelect.add(mainDepartmentOption);
    });

    if (departmentNameInput.options.length > 0) {
        departmentNameInput.selectedIndex = 0;
        updateEmployeeOptions(departmentNameInput.value);
    }

    if (departmentSelect.options.length > 0) {
        departmentSelect.selectedIndex = 0;
    }
}

function updateEmployeeOptions(selectedDepartment) {
    employeeNameInput.innerHTML = '';
    selectAdminEmployee.innerHTML = '';

    let employees = [];
    if (selectedDepartment === 'all') {
        employees = Object.values(departments).flat();
    } else {
        employees = departments[selectedDepartment] || [];
    }

    employees.forEach(employee => {
        const employeeOption = document.createElement('option');
        employeeOption.value = employee.name;
        employeeOption.text = employee.name;
        employeeNameInput.add(employeeOption);

        const adminOption = document.createElement('option');
        adminOption.value = employee.email;
        adminOption.text = employee.name;
        selectAdminEmployee.add(adminOption);
    });

    if (employeeNameInput.options.length > 0) {
        employeeNameInput.selectedIndex = 0;
    }
    if (selectAdminEmployee.options.length > 0) {
        selectAdminEmployee.selectedIndex = 0;
    }
}

function startOfWeek(date) {
    const day = date.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    return new Date(date.setDate(date.getDate() + diff));
}

function renderWeek(weekStart) {
    const selectedDepartment = departmentSelect.value;
    const searchTerm = employeeSearchInput.value.toLowerCase();
    let employees = [];

    if (selectedDepartment === 'all') {
        employees = Object.values(departments).flat();
    } else {
        employees = departments[selectedDepartment] || [];
    }

    // Filter employees based on search input
    if (searchTerm) {
        employees = employees.filter(employee => employee.name.toLowerCase().includes(searchTerm));
    }

    calendarWeekdays.innerHTML = '<div class="weekday-header">Employee</div>';
    departmentRows.innerHTML = '';

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    weekDateRange.innerHTML = `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;

    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    for (let i = 0; i < 7; i++) {
        const currentDay = new Date(weekStart);
        currentDay.setDate(currentDay.getDate() + i);

        const weekdayDiv = document.createElement('div');
        weekdayDiv.innerHTML = `<strong>${daysOfWeek[i]}</strong><br>${currentDay.getDate()}/${currentDay.getMonth() + 1}`;
        calendarWeekdays.appendChild(weekdayDiv);
    }

    employees.forEach(employee => {
        const employeeRow = document.createElement('div');
        employeeRow.className = 'employee-row';

        const employeeNameDiv = document.createElement('div');
        employeeNameDiv.className = 'employee-name';
        employeeNameDiv.innerText = employee.name;

        if (isAdmin) {
            const deleteEmployeeButton = document.createElement('button');
            deleteEmployeeButton.innerHTML = '🗑️';
            deleteEmployeeButton.style.marginLeft = '10px';
            deleteEmployeeButton.onclick = (e) => {
                e.stopPropagation();
                deleteEmployee(selectedDepartment, employee.name);
            };
            employeeNameDiv.appendChild(deleteEmployeeButton);
        }

        employeeRow.appendChild(employeeNameDiv);

        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(weekStart);
            currentDay.setDate(currentDay.getDate() + i);

            const dayDiv = document.createElement('div');
            dayDiv.className = 'employee-day';
            dayDiv.addEventListener('click', () => openEventList(currentDay, employee.name));

            const timeGrid = document.createElement('div');
            timeGrid.className = 'time-grid';

            const timeColumn = document.createElement('div');
            timeColumn.className = 'time-column';
            for (let hour = 8; hour <= 18; hour++) {
                const timeSlot = document.createElement('div');
                timeSlot.className = 'time-slot';
                timeSlot.innerText = `${hour}:00`;
                timeColumn.appendChild(timeSlot);
            }
            dayDiv.appendChild(timeColumn);

            const dayGrid = document.createElement('div');
            dayGrid.className = 'day-grid';
            for (let hour = 8; hour <= 18; hour++) {
                const timeSlot = document.createElement('div');
                timeSlot.className = 'time-slot';
                timeSlot.dataset.time = `${hour}:00`;
                dayGrid.appendChild(timeSlot);
            }

            const sortedEvents = events
                .filter(event => {
                    const eventDate = new Date(event.date);
                    return (
                        event.employee === employee.name &&
                        eventDate.getFullYear() === currentDay.getFullYear() &&
                        eventDate.getMonth() === currentDay.getMonth() &&
                        eventDate.getDate() === currentDay.getDate()
                    );
                })
                .sort((a, b) => {
                    const startA = new Date(`${a.date}T${a.startTime}`);
                    const startB = new Date(`${b.date}T${b.startTime}`);
                    return startA - startB;
                });

            sortedEvents.forEach(event => {
                const eventItem = document.createElement('div');
                eventItem.className = `event-item ${event.type}`;
                eventItem.innerText = `${event.type}${event.startTime ? ` (${event.startTime} - ${event.endTime})` : ''}`;
                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '&times;';
                deleteButton.onclick = (e) => {
                    e.stopPropagation();
                    deleteEvent(event.id);
                };

                eventItem.appendChild(deleteButton);

                if (event.startTime && event.endTime) {
                    const startHour = parseInt(event.startTime.split(':')[0]);
                    const startMinutes = parseInt(event.startTime.split(':')[1]);
                    const endHour = parseInt(event.endTime.split(':')[0]);
                    const endMinutes = parseInt(event.endTime.split(':')[1]);
                    const startTime = startHour + startMinutes / 60;
                    const endTime = endHour + endMinutes / 60;

                    const totalStartMinutes = (startTime - 8) * 30;
                    const totalEndMinutes = (endTime - 8) * 30;
                    eventItem.style.top = `${totalStartMinutes}px`;
                    eventItem.style.height = `${totalEndMinutes - totalStartMinutes}px`;
                } else {
                    // Make leave or sick events cover the entire time grid
                    eventItem.style.top = '0';
                    eventItem.style.height = '100%';
                }

                dayGrid.appendChild(eventItem);
            });

            dayDiv.appendChild(dayGrid);
            employeeRow.appendChild(dayDiv);
        }

        departmentRows.appendChild(employeeRow);
    });
}

function toggleEmployeeRows(department) {
    const employeeRows = document.getElementById(`employees-${department}`);
    if (employeeRows.style.display === 'none' || employeeRows.style.display === '') {
        employeeRows.style.display = 'flex';
    } else {
        employeeRows.style.display = 'none';
    }
}

function openEventModal() {
    if (Object.keys(departments).length === 0) {
        alert('Please add a department and employees before creating an event.');
        return;
    }

    eventModal.style.display = 'block';
    eventIdInput.value = '';
    eventTitleInput.value = '';
    startTimeInput.value = '08:00';
    endTimeInput.value = '09:00';
    eventTypeSelect.value = 'meeting';
    modalTitle.innerText = 'Add Event';

    if (departmentNameInput.value === '' && departmentNameInput.options.length > 0) {
        departmentNameInput.selectedIndex = 0;
    }

    if (isAdmin) {
        // Admin can add events for any employee
        updateEmployeeOptions(departmentNameInput.value);
    } else {
        // Non-admin user can only add events for themselves
        departmentNameInput.innerHTML = ''; // Clear department options
        const userDepartment = Object.keys(departments).find(department => 
            departments[department].some(emp => emp.email === loggedInUserEmail)
        );

        if (userDepartment) {
            const departmentOption = document.createElement('option');
            departmentOption.value = userDepartment;
            departmentOption.text = userDepartment;
            departmentNameInput.add(departmentOption);

            const employeeOption = document.createElement('option');
            const employeeName = departments[userDepartment].find(emp => emp.email === loggedInUserEmail).name;
            employeeOption.value = employeeName;
            employeeOption.text = employeeName;
            employeeNameInput.innerHTML = ''; // Clear existing options
            employeeNameInput.add(employeeOption);

            departmentNameInput.disabled = true; // Prevent changing department
            employeeNameInput.disabled = true;  // Prevent changing employee
        }
    }
}

departmentNameInput.addEventListener('change', () => {
    updateEmployeeOptions(departmentNameInput.value);
});

function openEventList(date, employee) {
    eventList.innerHTML = '';
    listDate.innerText = `${date.toLocaleDateString()} for ${employee}`;

    const sortedEvents = events
        .filter(event => {
            const eventDate = new Date(event.date);
            return (
                event.employee === employee &&
                eventDate.getFullYear() === date.getFullYear() &&
                eventDate.getMonth() === date.getMonth() &&
                eventDate.getDate() === date.getDate()
            );
        })
        .sort((a, b) => {
            const startA = new Date(`${a.date}T${a.startTime}`);
            const startB = new Date(`${b.date}T${b.startTime}`);
            return startA - startB;
        });

    sortedEvents.forEach(event => {
        const listItem = document.createElement('li');
        listItem.className = `${event.type}`;
        listItem.innerText = `${event.title}${event.startTime ? ` (${event.startTime} - ${event.endTime})` : ''}`;

        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '&times;';
        deleteButton.onclick = () => deleteEvent(event.id);

        listItem.appendChild(deleteButton);
        eventList.appendChild(listItem);
    });

    eventListModal.style.display = 'block';
}

function closeEventModal() {
    eventModal.style.display = 'none';
}

function closeEventListModal() {
    eventListModal.style.display = 'none';
}

function openDepartmentModal() {
    departmentModal.style.display = 'block';
    newDepartmentNameInput.value = '';
}

function closeDepartmentModal() {
    departmentModal.style.display = 'none';
}

function openEmployeeModal() {
    if (Object.keys(departments).length === 0) {
        alert('Please add a department before adding an employee.');
        return;
    }
    employeeModal.style.display = 'block';
    newEmployeeNameInput.value = '';
    newEmployeeEmailInput.value = '';
    isAdminInput.checked = false;
}

function closeEmployeeModal() {
    employeeModal.style.display = 'none';
}

function openTransferAdminModal() {
    transferAdminModal.style.display = 'block';
}

function closeTransferAdminModal() {
    transferAdminModal.style.display = 'none';
}

function isOverlap(start1, end1, start2, end2) {
    return start1 < end2 && start2 < end1;
}

eventTypeSelect.addEventListener('change', function () {
    const eventType = this.value;

    if (eventType === 'leave' || eventType === 'sick' || this.value === 'holiday') {
        // Hide time selection and show date range selection
        timeSelection.style.display = 'none';
        dateRangeSelection.style.display = 'block';

        // Remove required attributes from time fields
        startTimeInput.removeAttribute('required');
        endTimeInput.removeAttribute('required');

        // Add required attributes to date range fields
        startDateInput.setAttribute('required', 'required');
        endDateInput.setAttribute('required', 'required');

        // Remove required attribute from event-date if present
        eventDateInput.removeAttribute('required');

    } else {
        // Show time selection and hide date range selection
        timeSelection.style.display = 'block';
        dateRangeSelection.style.display = 'none';

        // Add required attributes to time fields
        startTimeInput.setAttribute('required', 'required');
        endTimeInput.setAttribute('required', 'required');

        // Remove required attributes from date range fields
        startDateInput.removeAttribute('required');
        endDateInput.removeAttribute('required');

        // Add required attribute to event-date
        eventDateInput.setAttribute('required', 'required');
    }
});

function saveEvent(e) {
    e.preventDefault();

    const eventId = eventIdInput.value.trim();
    const eventTitle = eventTitleInput.value.trim();
    const eventType = eventTypeSelect.value;
    const departmentName = departmentNameInput.value;
    const employeeName = employeeNameInput.value;

    if (!eventTitle || !departmentName || !employeeName) {
        alert('Please fill out all required fields.');
        return;
    }

    let eventDates = [];
    if (eventType === 'leave' || eventType === 'sick' || eventType === 'holiday') {
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);

        if (!startDate || !endDate) {
            alert('Please select valid dates.');
            return;
        }
        if (startDate > endDate) {
            alert('Start date cannot be after end date.');
            return;
        }

        endDate.setDate(endDate.getDate() + 1);

        for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
            const dateString = d.toISOString().split('T')[0];

            // Check for any existing events on this date
            const overlappingEvent = events.find(event => {
                return event.employee === employeeName &&
                    event.date === dateString;
            });

            if (overlappingEvent) {
                alert(`The employee already has an event (${overlappingEvent.title}) on ${dateString}. Overlapping events are not allowed.`);
                return;
            }

            eventDates.push({ date: dateString });
        }
    } else {
        const eventDate = eventDateInput.value;
        const startTime = startTimeInput.value;
        const endTime = endTimeInput.value;

        if (!eventDate || !startTime || !endTime) {
            alert('Please select a valid date and time.');
            return;
        }

        if (startTime > endTime) {
            alert('Start time cannot be after end time.');
            return;
        }

        // Check for overlapping events on the same day
        const overlappingEvent = events.find(event => {
            return event.employee === employeeName &&
                event.date === eventDate &&
                (eventType === 'leave' || eventType === 'sick' || eventType === 'holiday' || 
                event.type === 'leave' || event.type === 'sick' || event.type === 'holiday' || 
                isOverlap(event.startTime, event.endTime, startTime, endTime));
        });        

        if (overlappingEvent) {
            alert(`The employee already has an event (${overlappingEvent.title}) during the selected time.`);
            return;
        }

        eventDates.push({
            date: eventDate,
            startTime,
            endTime
        });
    }

    eventDates.forEach(dateObj => {
        const newEvent = {
            id: eventId ? eventId : Date.now().toString(),
            title: eventTitle,
            date: dateObj.date,
            startTime: eventType === 'leave' || eventType === 'sick' || eventType === 'holiday' ? null : dateObj.startTime,
            endTime: eventType === 'leave' || eventType === 'sick'|| eventType === 'holiday' ? null : dateObj.endTime,
            type: eventType,
            employee: employeeName,
            department: departmentName
        };

        if (eventId) {
            const index = events.findIndex(event => event.id === eventId);
            events[index] = newEvent;
        } else {
            events.push(newEvent);
        }
    });

    saveCalendarState();
    renderWeek(currentWeekStart);
    closeEventModal();
}

function saveDepartment(e) {
    e.preventDefault();

    const newDepartmentName = newDepartmentNameInput.value.trim();
    if (newDepartmentName && !departments[newDepartmentName]) {
        departments[newDepartmentName] = [];
        updateDepartmentOptions();
        saveCalendarState();
        renderWeek(currentWeekStart);
        closeDepartmentModal();
    } else {
        alert('Department already exists or name is invalid.');
    }
}

function saveEmployee(e) {
    e.preventDefault();

    const selectedDepartment = employeeDepartmentSelect.value;
    const newEmployeeName = newEmployeeNameInput.value.trim();
    const newEmployeeEmail = newEmployeeEmailInput.value.trim();
    const assignAdmin = isAdminInput.checked;

    if (selectedDepartment && newEmployeeName && newEmployeeEmail && !departments[selectedDepartment].some(emp => emp.name === newEmployeeName)) {
        if (assignAdmin) {
            if (adminEmail) {
                if (confirm('Do you want to transfer admin rights to this employee?')) {
                    adminEmail = newEmployeeEmail;
                } else {
                    return;
                }
            } else {
                adminEmail = newEmployeeEmail;
            }
        }
        departments[selectedDepartment].push({ name: newEmployeeName, email: newEmployeeEmail });
        updateEmployeeOptions(selectedDepartment);
        saveCalendarState();
        renderWeek(currentWeekStart);
        closeEmployeeModal();
    } else {
        alert('Employee already exists or name is invalid.');
    }
}

function transferAdmin(e) {
    e.preventDefault();

    const selectedEmail = selectAdminEmployee.value;

    if (confirm('Are you sure you want to transfer admin rights to this employee?')) {
        adminEmail = selectedEmail;
        saveCalendarState();
        alert('Admin rights transferred successfully.');
        closeTransferAdminModal();
        toggleAdminControls();
    }
}

function deleteDepartment(department) {
    if (confirm(`Are you sure you want to delete the department "${department}"? All associated employees and events will be removed.`)) {
        delete departments[department];
        events = events.filter(event => event.department !== department);
        updateDepartmentOptions();
        saveCalendarState();
        renderWeek(currentWeekStart);
    }
}

function deleteEmployee(department, employeeName) {
    if (confirm(`Are you sure you want to delete the employee "${employeeName}" from "${department}"? All associated events will be removed.`)) {
        const employee = departments[department].find(emp => emp.name === employeeName);
        if (employee && employee.email === adminEmail) {
            if (confirm('This employee is the admin. Are you sure you want to delete them? You must assign a new admin first.')) {
                const newAdminEmail = prompt('Please enter the new admin email:');
                if (newAdminEmail && newAdminEmail !== adminEmail) {
                    adminEmail = newAdminEmail;
                } else {
                    alert('Admin not changed. Deletion canceled.');
                    return;
                }
            } else {
                return;
            }
        }
        departments[department] = departments[department].filter(emp => emp.name !== employeeName);
        events = events.filter(event => event.employee !== employeeName);
        updateEmployeeOptions(department);
        saveCalendarState();
        renderWeek(currentWeekStart);
    }
}

function deleteEvent(eventId) {
    // Find the event to be deleted
    const eventToDelete = events.find(event => event.id === eventId);

    if (!eventToDelete) {
        alert('Event not found.');
        return;
    }

    // Check if the logged-in user is an admin or the owner of the event
    const isEventOwner = departments[eventToDelete.department]
        .some(emp => emp.email === loggedInUserEmail && emp.name === eventToDelete.employee);

    if (isAdmin || isEventOwner) {
        // Show a confirmation dialog
        const confirmDelete = confirm(`Are you sure you want to delete the event "${eventToDelete.title}" scheduled for ${eventToDelete.date}${eventToDelete.startTime ? ` from ${eventToDelete.startTime} to ${eventToDelete.endTime}` : ''}?`);

        if (confirmDelete) {
            // Proceed to delete the event if the user confirms
            events = events.filter(event => event.id !== eventId);
            saveCalendarState();
            renderWeek(currentWeekStart);
            closeEventListModal();
        }
    } else {
        // If the user is not authorized to delete the event, show an alert
        alert('You are not authorized to delete this event.');
    }
}

function loadCalendarState() {
    fetch('http://localhost:3000/loadCalendarState')
        .then(response => response.json())
        .then(data => {
            events = data.events || [];
            departments = data.departments || {};
            adminEmail = data.admin ? data.admin.email : null;
            updateDepartmentOptions();
            renderWeek(currentWeekStart);
        })
        .catch(error => {
            console.error('Error loading calendar state:', error);
            alert('Failed to load calendar data. Please try again.');
        });
}

function saveCalendarState() {
    const calendarState = {
        events,
        departments,
        admin: {
            email: adminEmail
        }
    };

    fetch('http://localhost:3000/saveCalendarState', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calendarState)
    })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
        })
        .catch(error => {
            console.error('Error saving calendar state:', error);
            alert('Failed to save calendar data. Please try again.');
        });
}

prevWeek.addEventListener('click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    renderWeek(currentWeekStart);
});

nextWeek.addEventListener('click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    renderWeek(currentWeekStart);
});

addEventButton.addEventListener('click', openEventModal);
addDepartmentButton.addEventListener('click', openDepartmentModal);
addEmployeeButton.addEventListener('click', openEmployeeModal);
transferAdminButton.addEventListener('click', openTransferAdminModal);
departmentSelect.addEventListener('change', () => renderWeek(currentWeekStart));

// Add event listener for employee search input
employeeSearchInput.addEventListener('input', () => renderWeek(currentWeekStart));

closeModalButton.addEventListener('click', closeEventModal);
closeListButton.addEventListener('click', closeEventListModal);
closeDepartmentModalButton.addEventListener('click', closeDepartmentModal);
closeEmployeeModalButton.addEventListener('click', closeEmployeeModal);
closeTransferAdminModalButton.addEventListener('click', closeTransferAdminModal);

eventForm.addEventListener('submit', saveEvent);
departmentForm.addEventListener('submit', saveDepartment);
employeeForm.addEventListener('submit', saveEmployee);
transferAdminForm.addEventListener('submit', transferAdmin);

currentWeekStart = startOfWeek(new Date());
loadCalendarState();
