let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let selectedDateKey = null;

const monthsArray = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

function enterApp() {
    document.getElementById("welcomeOverlay").style.display = "none";
    document.getElementById("appContainer").classList.remove("app-blurred");
    loadGlobalHabits();
    renderMonthView(currentYear, currentMonth);
}

function renderMonthView(year, month) {
    currentYear = year;
    currentMonth = month;
    
    document.getElementById("yearView").style.display = "none";
    document.getElementById("monthView").style.display = "block";
    document.getElementById("currentMonthYear").innerText = `${monthsArray[month]} ${year}`;

    const grid = document.getElementById("calendarGrid");
    grid.innerHTML = "";

    const totalDays = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= totalDays; day++) {
        const dayCell = document.createElement("div");
        dayCell.className = "day-cell";
        dayCell.innerText = day;

        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const savedData = localStorage.getItem(dateKey);
        
        if (savedData) {
            const parsed = JSON.parse(savedData);
            if (parsed.rating !== undefined && parsed.rating !== "") {
                dayCell.style.backgroundColor = getColorByRating(Number(parsed.rating));
            }
        }

        dayCell.onclick = () => openDayModal(dateKey);
        grid.appendChild(dayCell);
    }
}

function getColorByRating(rating) {
    if (rating >= 0 && rating <= 2) return "#ff9999";
    if (rating >= 3 && rating <= 4) return "#ffcc99";
    if (rating >= 5 && rating <= 6) return "#ffffb3";
    if (rating >= 7 && rating <= 8) return "#b3d9ff";
    if (rating >= 9 && rating <= 10) return "#b3ffb3";
    return "";
}

function toggleCalendarView() {
    const yearView = document.getElementById("yearView");
    const monthView = document.getElementById("monthView");

    if (yearView.style.display === "none") {
        monthView.style.display = "none";
        yearView.style.display = "grid";
        renderYearView();
    } else {
        yearView.style.display = "none";
        monthView.style.display = "block";
        renderMonthView(currentYear, currentMonth);
    }
}

function renderYearView() {
    const yearGrid = document.getElementById("yearView");
    yearGrid.innerHTML = "";

    monthsArray.forEach((monthName, index) => {
        const monthCard = document.createElement("div");
        monthCard.className = "year-month-card";
        monthCard.innerText = monthName;
        monthCard.onclick = () => renderMonthView(currentYear, index);
        yearGrid.appendChild(monthCard);
    });
}

function openDayModal(dateKey) {
    selectedDateKey = dateKey;
    document.getElementById("modalDayTitle").innerText = `Log Health for ${dateKey}`;
    
    document.getElementById("dayRating").value = 5;
    document.getElementById("ratingValue").innerText = 5;
    document.getElementById("dayNotes").value = "";

    renderModalChecklist();

    const savedData = localStorage.getItem(dateKey);
    if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.rating !== undefined) {
            document.getElementById("dayRating").value = parsed.rating;
            document.getElementById("ratingValue").innerText = parsed.rating;
        }
        if (parsed.notes) {
            document.getElementById("dayNotes").value = parsed.notes;
        }
        if (parsed.habits) {
            const checks = document.querySelectorAll(".modal-habit-check");
            checks.forEach(box => {
                const id = box.getAttribute("data-id");
                if (parsed.habits[id]) {
                    box.checked = true;
                }
            });
        }
    }

    document.getElementById("dayModal").style.display = "flex";
}

function closeDayModal() {
    document.getElementById("dayModal").style.display = "none";
}

function renderModalChecklist() {
    const container = document.getElementById("modalChecklist");
    container.innerHTML = "";

    const globalHabits = JSON.parse(localStorage.getItem("globalHabits") || "[]");
    
    if (globalHabits.length === 0) {
        container.innerHTML = "<p style='font-size:0.9rem; color:#666;'>No daily habits added yet. Use the tool on the dashboard.</p>";
        return;
    }

    globalHabits.forEach(habit => {
        const label = document.createElement("label");
        label.style.display = "block";
        label.style.marginBottom = "5px";

        const box = document.createElement("input");
        box.type = "checkbox";
        box.className = "modal-habit-check";
        box.setAttribute("data-id", habit.id);

        label.appendChild(box);
        label.appendChild(document.createTextNode(` ${habit.text}`));
        container.appendChild(label);
    });
}

function saveDayLog() {
    if (!selectedDateKey) return;

    const rating = document.getElementById("dayRating").value;
    const notes = document.getElementById("dayNotes").value;
    const habits = {};

    const checks = document.querySelectorAll(".modal-habit-check");
    checks.forEach(box => {
        const id = box.getAttribute("data-id");
        habits[id] = box.checked;
    });

    const dataToSave = {
        rating: rating,
        notes: notes,
        habits: habits
    };

    localStorage.setItem(selectedDateKey, JSON.stringify(dataToSave));
    closeDayModal();
    renderMonthView(currentYear, currentMonth);
}

function addGlobalHabit() {
    const input = document.getElementById("newHabitInput");
    const text = input.value.trim();
    if (!text) return;

    const globalHabits = JSON.parse(localStorage.getItem("globalHabits") || "[]");
    const newHabit = {
        id: "habit_" + Date.now(),
        text: text
    };

    globalHabits.push(newHabit);
    localStorage.setItem("globalHabits", JSON.stringify(globalHabits));
    input.value = "";
    
    loadGlobalHabits();
}

function loadGlobalHabits() {
    const list = document.getElementById("globalHabitList");
    list.innerHTML = "";

    const globalHabits = JSON.parse(localStorage.getItem("globalHabits") || "[]");
    globalHabits.forEach(habit => {
        const li = document.createElement("li");
        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.style.marginBottom = "5px";

        const textSpan = document.createElement("span");
        textSpan.innerText = habit.text;

        const delBtn = document.createElement("button");
        delBtn.innerText = "✕";
        delBtn.style.border = "none";
        delBtn.style.background = "none";
        delBtn.style.cursor = "pointer";
        delBtn.onclick = () => removeGlobalHabit(habit.id);

        li.appendChild(textSpan);
        li.appendChild(delBtn);
        list.appendChild(li);
    });
}

function removeGlobalHabit(id) {
    let globalHabits = JSON.parse(localStorage.getItem("globalHabits") || "[]");
    globalHabits = globalHabits.filter(habit => habit.id !== id);
    localStorage.setItem("globalHabits", JSON.stringify(globalHabits));
    loadGlobalHabits();
}
