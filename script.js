let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let selectedDateKey = null;

const monthsArray = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const arrowSvgBase64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTguNSA1bDYgNi02IDZaIiBmaWxsPSIjZmY5OTk5IiBzdHJva2U9IiNmZjk5OTkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+";

function enterApp() {
    document.getElementById("welcomeOverlay").style.display = "none";
    document.getElementById("appContainer").classList.remove("app-blurred");
    loadGlobalHabits();
    renderMonthView(currentYear, currentMonth);
}

function renderMonthView(year, month) {
    currentYear = year;
    currentMonth = month;
    
    const viewContainer = document.getElementById("monthView");
    viewContainer.classList.remove("view-fade");
    void viewContainer.offsetWidth;
    viewContainer.classList.add("view-fade");

    document.getElementById("yearView").style.display = "none";
    viewContainer.style.display = "block";
    document.getElementById("currentMonthYear").innerText = `${monthsArray[month]} ${year}`;

    const grid = document.getElementById("calendarGrid");
    grid.innerHTML = "";

    const totalDays = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    for (let day = 1; day <= totalDays; day++) {
        const dayCell = document.createElement("div");
        dayCell.className = "day-cell";

        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        let cellHTML = `<span class="day-number">${day}</span>`;
        if (dateKey === todayKey) {
            cellHTML += `<img class="today-star" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIC41ODdsMy42NjggNy40MzEgOC4yIDEuMTkyLTUuOTM0IDUuNzg1IDEuNCA4LjE2OEwxMiAxOC44OTZsLTcuMzM0IDMuODU3IDEuNC04LjE2OEwuMTMyIDkuNDFsOC4yLTEuMTkyeiIgZmlsbD0iI2ZmYjNiMyIvPjwvc3ZnPg==" alt="Today">`;
        }
        dayCell.innerHTML = cellHTML;

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
        yearView.classList.remove("view-fade");
        void yearView.offsetWidth;
        yearView.classList.add("view-fade");
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
    
    const slider = document.getElementById("dayRating");
    slider.value = 5;
    
    const ratingValueDisplay = document.getElementById("ratingValue");
    if (ratingValueDisplay) {
        ratingValueDisplay.innerText = 5;
    }
    
    slider.oninput = function() {
        const display = document.getElementById('ratingValue');
        if (display) {
            display.innerText = this.value;
        }
    };

    document.getElementById("dayNotes").value = "";
    renderModalChecklist();

    const savedData = localStorage.getItem(dateKey);
    if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.rating !== undefined) {
            slider.value = parsed.rating;
            if (ratingValueDisplay) {
                ratingValueDisplay.innerText = parsed.rating;
            }
        }
        if (parsed.notes) {
            document.getElementById("dayNotes").value = parsed.notes;
        }
        if (parsed.habits) {
            setTimeout(() => {
                const checks = document.querySelectorAll(".modal-habit-check");
                checks.forEach(box => {
                    const id = box.getAttribute("data-id");
                    if (parsed.habits[id]) {
                        box.checked = true;
                    }
                });
            }, 10);
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
        label.className = "modal-habit-label";

        const box = document.createElement("input");
        box.type = "checkbox";
        box.className = "modal-habit-check";
        box.setAttribute("data-id", habit.id);

        const customSpan = document.createElement("span");
        customSpan.className = "custom-checkbox";

        label.appendChild(box);
        label.appendChild(customSpan);
        
        const arrowImg = document.createElement("img");
        arrowImg.className = "checklist-arrow";
        arrowImg.src = arrowSvgBase64;
        
        label.appendChild(arrowImg);
        label.appendChild(document.createTextNode(habit.text));
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
    
    loadGlobalHabits(newHabit.id);
}

function loadGlobalHabits(newlyAddedId = null) {
    const list = document.getElementById("globalHabitList");
    list.innerHTML = "";

    const globalHabits = JSON.parse(localStorage.getItem("globalHabits") || "[]");
    globalHabits.forEach(habit => {
        const li = document.createElement("li");
        li.id = habit.id;

        if (habit.id === newlyAddedId) {
            li.className = "fade-in-item";
        }

        const leftSide = document.createElement("div");
        leftSide.style.display = "flex";
        leftSide.style.alignItems = "center";

        const arrowImg = document.createElement("img");
        arrowImg.className = "checklist-arrow";
        arrowImg.src = arrowSvgBase64;

        const textSpan = document.createElement("span");
        textSpan.innerText = habit.text;

        leftSide.appendChild(arrowImg);
        leftSide.appendChild(textSpan);

        const delBtn = document.createElement("button");
        delBtn.innerText = "✕";
        delBtn.style.border = "none";
        delBtn.style.background = "none";
        delBtn.style.cursor = "pointer";
        delBtn.style.color = "#999";
        delBtn.onclick = () => removeGlobalHabit(habit.id);

        li.appendChild(leftSide);
        li.appendChild(delBtn);
        list.appendChild(li);
    });
}

function removeGlobalHabit(id) {
    const element = document.getElementById(id);
    if (element) {
        element.classList.add("fade-out-item");
        setTimeout(() => {
            executeHabitRemoval(id);
        }, 300);
    } else {
        executeHabitRemoval(id);
    }
}

function executeHabitRemoval(id) {
    let globalHabits = JSON.parse(localStorage.getItem("globalHabits") || "[]");
