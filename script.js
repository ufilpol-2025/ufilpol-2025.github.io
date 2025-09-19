// Inicjalizacja biblioteki jsPDF
const { jsPDF } = window.jspdf;

document.addEventListener('DOMContentLoaded', () => {
    // Elementy DOM
    const availableScheduleDisplay = document.getElementById('available-schedule-display');
    const myScheduleDisplay = document.getElementById('my-schedule-display');
    const messageBox = document.getElementById('message-box');
    const conflictModal = document.getElementById('conflict-modal');
    const modalCancelButton = document.getElementById('modal-cancel');
    const modalReplaceButton = document.getElementById('modal-replace');
    const currentConflictTitle = document.getElementById('current-conflict-title');
    const newConflictTitle = document.getElementById('new-conflict-title');
    const generateHtmlButton = document.getElementById('generate-html-button');
    const generatePdfButton = document.getElementById('generate-pdf-button');
    const clearMyPlanButton = document.getElementById('clear-my-plan-button');
    const myScheduleSection = document.getElementById('my-schedule-section');
    const readingListSection = document.getElementById('reading-list-section');
    const planGeneratorSection = document.getElementById('plan-generator-section');
    const showScheduleButton = document.getElementById('show-schedule-button');
    const showReadingListButton = document.getElementById('show-reading-list-button');
    const showGeneratorButton = document.getElementById('show-generator-button');
    const startTimeInput = document.getElementById('start-time-input');
    const endTimeInput = document.getElementById('end-time-input');
    const generateAllPlansButton = document.getElementById('generate-all-plans-button');
    const allPossiblePlansDisplay = document.getElementById('all-possible-plans-display');
    const progressBar = document.getElementById('progress-bar');
    const progressContainer = document.getElementById('progress-container');

    // Zmienne globalne
    let availableSchedules = [];
    let mySchedules = [];
    let pendingConflictSchedule = null;
    const daysOfWeek = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek'];

    // Funkcje pomocnicze
    function showMessage(message, type) {
        messageBox.textContent = message;
        messageBox.className = `message-box show ${type}`;
        setTimeout(() => {
            messageBox.classList.remove('show');
        }, 3000);
    }

    function timeToMinutes(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }

    function checkConflict(newSchedule, targetSchedules) {
        const newStart = timeToMinutes(newSchedule.time);
        const newEnd = timeToMinutes(newSchedule.endTime);
        
        // Sprawdzenie duplikatu przedmiotu
        const isDuplicate = targetSchedules.some(s => 
            s.title.split(' - ')[0] === newSchedule.title.split(' - ')[0]
        );
        if (isDuplicate) {
            showMessage(`Przedmiot "${newSchedule.title.split(' - ')[0]}" już znajduje się w Twoim planie!`, 'error');
            return true;
        }

        // Sprawdzenie limitu ćwiczeń
        if (targetSchedules.filter(s => s.title.includes('Ćwiczenia')).length >= 7) {
            showMessage('Nie możesz dodać więcej niż 7 ćwiczeń w tygodniu!', 'error');
            return true;
        }

        // Sprawdzenie konfliktów czasowych
        for (const existingSchedule of targetSchedules) {
            if (existingSchedule.day === newSchedule.day) {
                const existingStart = timeToMinutes(existingSchedule.time);
                const existingEnd = timeToMinutes(existingSchedule.endTime);
                
                if ((newStart < existingEnd && newEnd > existingStart) ||
                    (existingStart < newEnd && existingEnd > newStart)) {
                    return existingSchedule;
                }
            }
        }
        return null;
    }

    // Zarządzanie danymi w localStorage
    function saveMySchedules() {
        localStorage.setItem('mySchedules', JSON.stringify(mySchedules));
    }

    function loadMySchedules() {
        const stored = localStorage.getItem('mySchedules');
        if (stored) {
            mySchedules = JSON.parse(stored);
        }
    }

    function saveAvailableSchedules() {
        localStorage.setItem('availableSchedules', JSON.stringify(availableSchedules));
    }

    function loadAvailableSchedules() {
        const storedSchedules = localStorage.getItem('availableSchedules');
        if (storedSchedules) {
            availableSchedules = JSON.parse(storedSchedules);
        } else {
            // Inicjalizacja z przykładowymi danymi
            initializeDefaultSchedules();
            saveAvailableSchedules();
        }
    }

    function initializeDefaultSchedules() {
        availableSchedules = [
            { id: '1', title: 'Poetyka z analizą dzieła literackiego - Ćwiczenia', day: 'Piątek', time: '08:00', endTime: '09:30', instructor: 'Ewa Szkudlarek', group: 'Grupa 1', color: '#B0E0E6' },
            { id: '2', title: 'Poetyka z analizą dzieła literackiego - Ćwiczenia', day: 'Wtorek', time: '11:30', endTime: '13:00', instructor: 'Ewa Szkudlarek', group: 'Grupa 2', color: '#B0E0E6' },
            { id: '3', title: 'Warsztat polonisty - pisanie - Ćwiczenia', day: 'Wtorek', time: '13:30', endTime: '15:00', instructor: 'Katarzyna Czarnecka', group: 'Grupa 1', color: '#90EE90' },
            { id: '4', title: 'Język łaciński z elementami kultury antycznej - Ćwiczenia', day: 'Piątek', time: '11:30', endTime: '13:00', instructor: 'Monika Szczot', group: 'Grupa 1', color: '#FFB6C1' },
            { id: '5', title: 'Nauka o współczesnym języku polskim - Ćwiczenia', day: 'Piątek', time: '08:00', endTime: '09:30', instructor: 'Karolina Ruta-Korytowska', group: 'Grupa 1', color: '#D8BFD8' },
        ];
    }

    // Renderowanie harmonogramów
    function renderSchedules(schedules, container) {
        container.innerHTML = '';
        
        daysOfWeek.forEach(day => {
            const dayColumn = document.createElement('div');
            dayColumn.className = 'day-column';
            dayColumn.innerHTML = `<h3 class="text-center text-dark mb-3 fs-5 fw-bold">${day}</h3>`;
            
            const timelineContainer = document.createElement('div');
            timelineContainer.className = 'timeline-container';
            
            const daySchedules = schedules.filter(s => s.day === day)
                .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
            
            daySchedules.forEach(schedule => {
                const scheduleItem = createScheduleItem(schedule, container.id === 'available-schedule-display');
                timelineContainer.appendChild(scheduleItem);
            });
            
            dayColumn.appendChild(timelineContainer);
            container.appendChild(dayColumn);
        });
    }

    function createScheduleItem(schedule, isClickable) {
        const item = document.createElement('div');
        item.className = 'schedule-item';
        item.style.borderLeftColor = schedule.color || '#6c757d';
        
        if (isClickable) {
            item.addEventListener('click', () => handleScheduleClick(schedule));
        }
        
        item.innerHTML = `
            <h4>${schedule.title}</h4>
            <p><strong>Godzina:</strong> ${schedule.time} - ${schedule.endTime}</p>
            <p><strong>Prowadzący:</strong> ${schedule.instructor}</p>
            <p><strong>Grupa:</strong> ${schedule.group}</p>
        `;
        
        return item;
    }

    function handleScheduleClick(schedule) {
        const conflict = checkConflict(schedule, mySchedules);
        
        if (conflict === true) {
            return; // Duplikat lub limit - błąd już wyświetlony
        }
        
        if (conflict) {
            // Konflikt czasowy
            pendingConflictSchedule = schedule;
            currentConflictTitle.textContent = conflict.title;
            newConflictTitle.textContent = schedule.title;
            conflictModal.classList.add('show');
        } else {
            // Brak konfliktu - dodaj od razu
            addToMySchedule(schedule);
        }
    }

    function addToMySchedule(schedule) {
        mySchedules.push({ ...schedule });
        saveMySchedules();
        renderSchedules(mySchedules, myScheduleDisplay);
        showMessage(`Dodano: ${schedule.title}`, '');
    }

    // Event listenery dla modala
    modalCancelButton.addEventListener('click', () => {
        conflictModal.classList.remove('show');
        pendingConflictSchedule = null;
    });

    modalReplaceButton.addEventListener('click', () => {
        if (pendingConflictSchedule) {
            const conflictingSchedule = checkConflict(pendingConflictSchedule, mySchedules);
            mySchedules = mySchedules.filter(s => s !== conflictingSchedule);
            addToMySchedule(pendingConflictSchedule);
            conflictModal.classList.remove('show');
            pendingConflictSchedule = null;
        }
    });

    // Przyciski nawigacji - POPRAWIONE!
    showScheduleButton.addEventListener('click', () => {
        showSection('schedule');
    });

    showReadingListButton.addEventListener('click', () => {
        showSection('reading');
    });

    showGeneratorButton.addEventListener('click', () => {
        showSection('generator');
    });

    function showSection(section) {
        // Ukryj wszystkie sekcje
        myScheduleSection.classList.add('d-none');
        readingListSection.classList.add('d-none');
        planGeneratorSection.classList.add('d-none');
        
        // Pokaż wybraną sekcję
        switch(section) {
            case 'schedule':
                myScheduleSection.classList.remove('d-none');
                break;
            case 'reading':
                readingListSection.classList.remove('d-none');
                break;
            case 'generator':
                planGeneratorSection.classList.remove('d-none');
                break;
        }
        
        // Zaktualizuj przyciski
        updateNavButtons(section);
    }

    function updateNavButtons(activeSection) {
        // Resetuj wszystkie przyciski
        [showScheduleButton, showReadingListButton, showGeneratorButton].forEach(btn => {
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary');
        });
        
        // Ustaw aktywny przycisk
        if (activeSection === 'schedule') {
            showScheduleButton.classList.remove('btn-secondary');
            showScheduleButton.classList.add('btn-primary');
        } else if (activeSection === 'reading') {
            showReadingListButton.classList.remove('btn-secondary');
            showReadingListButton.classList.add('btn-primary');
        } else if (activeSection === 'generator') {
            showGeneratorButton.classList.remove('btn-secondary');
            showGeneratorButton.classList.add('btn-primary');
        }
    }

    // Generowanie plików
    generateHtmlButton.addEventListener('click', generateHtmlPlan);
    generatePdfButton.addEventListener('click', generatePdfPlan);
    clearMyPlanButton.addEventListener('click', clearMyPlan);

    function generateHtmlPlan() {
        if (mySchedules.length === 0) {
            showMessage('Brak zajęć do wyeksportowania!', 'error');
            return;
        }
        
        const htmlContent = createHtmlPlan();
        downloadFile('moj-plan-zajec.html', htmlContent, 'text/html');
        showMessage('HTML został wygenerowany i pobrany!', '');
    }

    function generatePdfPlan() {
        if (mySchedules.length === 0) {
            showMessage('Brak zajęć do wyeksportowania!', 'error');
            return;
        }
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = createHtmlPlan();
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        document.body.appendChild(tempDiv);
        
        html2canvas(tempDiv).then(canvas => {
            const pdf = new jsPDF();
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save('moj-plan-zajec.pdf');
            
            document.body.removeChild(tempDiv);
            showMessage('PDF został wygenerowany i pobrany!', '');
        });
    }

    function createHtmlPlan() {
        // Implementacja generowania HTML
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Mój Plan Zajęć</title>
                <meta charset="utf-8">
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .schedule-item { border: 1px solid #ddd; margin: 10px 0; padding: 10px; }
                    h1 { color: #333; }
                    h3 { color: #666; }
                </style>
            </head>
            <body>
                <h1>Mój Plan Zajęć</h1>
                ${mySchedules.map(s => `
                    <div class="schedule-item">
                        <h3>${s.title}</h3>
                        <p><strong>Dzień:</strong> ${s.day}</p>
                        <p><strong>Godzina:</strong> ${s.time} - ${s.endTime}</p>
                        <p><strong>Prowadzący:</strong> ${s.instructor}</p>
                        <p><strong>Grupa:</strong> ${s.group}</p>
                    </div>
                `).join('')}
            </body>
            </html>
        `;
    }

    function downloadFile(filename, content, type) {
        const blob = new Blob([content], { type });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    function clearMyPlan() {
        if (confirm('Czy na pewno chcesz wyczyścić swój plan zajęć?')) {
            mySchedules = [];
            saveMySchedules();
            renderSchedules(mySchedules, myScheduleDisplay);
            showMessage('Plan został wyczyszczony!', '');
        }
    }

    // Generator planów - placeholder
    if (generateAllPlansButton) {
        generateAllPlansButton.addEventListener('click', () => {
            showMessage('Funkcja generatora planów w trakcie implementacji!', 'error');
        });
    }

    // Inicjalizacja
    loadAvailableSchedules();
    loadMySchedules();
    renderSchedules(availableSchedules, availableScheduleDisplay);
    renderSchedules(mySchedules, myScheduleDisplay);
    showSection('schedule'); // Domyślnie pokaż sekcję harmonogramów
});
