
document.addEventListener('DOMContentLoaded', () => {
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

    let availableSchedules = [];
    let mySchedules = [];
    let pendingConflictSchedule = null;
    const daysOfWeek = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek'];

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
        const isDuplicate = targetSchedules.some(s =>
            s.title.split(' - ')[0] === newSchedule.title.split(' - ')[0]
        );
        if (isDuplicate) {
            showMessage(`Przedmiot "${newSchedule.title.split(' - ')[0]}" już znajduje się w Twoim planie!`, 'error');
            return true;
        }
        if (targetSchedules.filter(s => s.title.includes('Ćwiczenia')).length >= 7) {
            showMessage('Nie możesz dodać więcej niż 7 ćwiczeń w tygodniu!', 'error');
            return true;
        }
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
            initializeDefaultSchedules();
            saveAvailableSchedules();
        }
    }

    function initializeDefaultSchedules() {
        availableSchedules = [
            // FILOLOGIA POLSKA - ĆWICZENIA
            { id: '1', title: 'Poetyka z analizą dzieła literackiego - Ćwiczenia', day: 'Piątek', time: '08:00', endTime: '09:30', instructor: 'Ewa Szkudlarek', group: 'Grupa 1', color: '#B0E0E6', faculty: 'Filologia Polska' },
            { id: '2', title: 'Poetyka z analizą dzieła literackiego - Ćwiczenia', day: 'Wtorek', time: '11:30', endTime: '13:00', instructor: 'Ewa Szkudlarek', group: 'Grupa 2', color: '#B0E0E6', faculty: 'Filologia Polska' },
            { id: '3', title: 'Poetyka z analizą dzieła literackiego - Ćwiczenia', day: 'Piątek', time: '09:45', endTime: '11:15', instructor: 'Agnieszka Rydz', group: 'Grupa 3', color: '#B0E0E6', faculty: 'Filologia Polska' },
            { id: '4', title: 'Poetyka z analizą dzieła literackiego - Ćwiczenia', day: 'Środa', time: '13:15', endTime: '14:45', instructor: 'Joanna Maleszyńska', group: 'Grupa 4', color: '#B0E0E6', faculty: 'Filologia Polska' },
            { id: '5', title: 'Poetyka z analizą dzieła literackiego - Ćwiczenia', day: 'Czwartek', time: '09:45', endTime: '11:15', instructor: 'Jacek Nowakowski', group: 'Grupa 5', color: '#B0E0E6', faculty: 'Filologia Polska' },
            { id: '6', title: 'Poetyka z analizą dzieła literackiego - Ćwiczenia', day: 'Wtorek', time: '13:15', endTime: '14:45', instructor: 'Krzysztof Gajda', group: 'Grupa 6', color: '#B0E0E6', faculty: 'Filologia Polska' },
            { id: '7', title: 'Poetyka z analizą dzieła literackiego - Ćwiczenia', day: 'Czwartek', time: '17:00', endTime: '18:30', instructor: 'Magdalena Bednarek', group: 'Grupa 7', color: '#B0E0E6', faculty: 'Filologia Polska' },
            { id: '8', title: 'Poetyka z analizą dzieła literackiego - Ćwiczenia', day: 'Czwartek', time: '08:00', endTime: '09:30', instructor: 'Ewelina Bulewicz-Rewers', group: 'Grupa 8', color: '#B0E0E6', faculty: 'Filologia Polska' },

            { id: '9', title: 'Warsztat polonisty - pisanie - Ćwiczenia', day: 'Wtorek', time: '13:30', endTime: '15:00', instructor: 'Katarzyna Czarnecka', group: 'Grupa 1', color: '#90EE90', faculty: 'Filologia Polska' },
            { id: '10', title: 'Warsztat polonisty - pisanie - Ćwiczenia', day: 'Środa', time: '15:15', endTime: '16:45', instructor: 'Katarzyna Czarnecka', group: 'Grupa 2', color: '#90EE90', faculty: 'Filologia Polska' },
            { id: '11', title: 'Warsztat polonisty - pisanie - Ćwiczenia', day: 'Wtorek', time: '11:30', endTime: '13:00', instructor: 'Jarosław Liberek', group: 'Grupa 3', color: '#90EE90', faculty: 'Filologia Polska' },
            { id: '12', title: 'Warsztat polonisty - pisanie - Ćwiczenia', day: 'Środa', time: '15:15', endTime: '16:45', instructor: 'Jarosław Liberek', group: 'Grupa 4', color: '#90EE90', faculty: 'Filologia Polska' },
            { id: '13', title: 'Warsztat polonisty - pisanie - Ćwiczenia', day: 'Wtorek', time: '09:45', endTime: '11:15', instructor: 'Monika Błaszczak-Stachowiak', group: 'Grupa 5', color: '#90EE90', faculty: 'Filologia Polska' },
            { id: '14', title: 'Warsztat polonisty - pisanie - Ćwiczenia', day: 'Wtorek', time: '15:15', endTime: '16:45', instructor: 'Dorota Masłej', group: 'Grupa 6', color: '#90EE90', faculty: 'Filologia Polska' },
            { id: '15', title: 'Warsztat polonisty - pisanie - Ćwiczenia', day: 'Wtorek', time: '17:00', endTime: '18:30', instructor: 'Aleksandra Sikorska-Krystek', group: 'Grupa 7', color: '#90EE90', faculty: 'Filologia Polska' },
            { id: '16', title: 'Warsztat polonisty - pisanie - Ćwiczenia', day: 'Wtorek', time: '08:00', endTime: '09:30', instructor: 'Jagoda Kurnikowska', group: 'Grupa 8', color: '#90EE90', faculty: 'Filologia Polska' },

            { id: '17', title: 'Język łaciński z elementami kultury antycznej - Ćwiczenia', day: 'Piątek', time: '11:30', endTime: '13:00', instructor: 'Monika Szczot', group: 'Grupa 1', color: '#FFB6C1', faculty: 'Filologia Polska' },
            { id: '18', title: 'Język łaciński z elementami kultury antycznej - Ćwiczenia', day: 'Piątek', time: '13:30', endTime: '15:00', instructor: 'Monika Szczot', group: 'Grupa 2', color: '#FFB6C1', faculty: 'Filologia Polska' },
            { id: '19', title: 'Język łaciński z elementami kultury antycznej - Ćwiczenia', day: 'Piątek', time: '09:45', endTime: '11:15', instructor: 'Konrad Dominas', group: 'Grupa 3', color: '#FFB6C1', faculty: 'Filologia Polska' },
            { id: '20', title: 'Język łaciński z elementami kultury antycznej - Ćwiczenia', day: 'Czwartek', time: '08:00', endTime: '09:30', instructor: 'Katarzyna Kaniecka-Juszczak', group: 'Grupa 4', color: '#FFB6C1', faculty: 'Filologia Polska' },
            { id: '21', title: 'Język łaciński z elementami kultury antycznej - Ćwiczenia', day: 'Czwartek', time: '09:45', endTime: '11:15', instructor: 'Katarzyna Kaniecka-Juszczak', group: 'Grupa 5', color: '#FFB6C1', faculty: 'Filologia Polska' },
            { id: '22', title: 'Język łaciński z elementami kultury antycznej - Ćwiczenia', day: 'Czwartek', time: '11:30', endTime: '13:00', instructor: 'Katarzyna Kaniecka-Juszczak', group: 'Grupa 6', color: '#FFB6C1', faculty: 'Filologia Polska' },
            { id: '23', title: 'Język łaciński z elementami kultury antycznej - Ćwiczenia', day: 'Czwartek', time: '18:45', endTime: '20:15', instructor: 'Katarzyna Kaniecka-Juszczak', group: 'Grupa 7', color: '#FFB6C1', faculty: 'Filologia Polska' },
            { id: '24', title: 'Język łaciński z elementami kultury antycznej - Ćwiczenia', day: 'Czwartek', time: '15:15', endTime: '16:45', instructor: 'Marlena Puk', group: 'Grupa 8', color: '#FFB6C1', faculty: 'Filologia Polska' },

            { id: '25', title: 'Nauka o współczesnym języku polskim - Ćwiczenia', day: 'Piątek', time: '08:00', endTime: '09:30', instructor: 'Karolina Ruta-Korytowska', group: 'Grupa 1', color: '#D8BFD8', faculty: 'Filologia Polska' },
            { id: '26', title: 'Nauka o współczesnym języku polskim - Ćwiczenia', day: 'Piątek', time: '11:30', endTime: '13:00', instructor: 'Karolina Ruta-Korytowska', group: 'Grupa 2', color: '#D8BFD8', faculty: 'Filologia Polska' },
            { id: '27', title: 'Nauka o współczesnym języku polskim - Ćwiczenia', day: 'Czwartek', time: '11:30', endTime: '13:00', instructor: 'Małgorzata Rybka', group: 'Grupa 3', color: '#D8BFD8', faculty: 'Filologia Polska' },
            { id: '28', title: 'Nauka o współczesnym języku polskim - Ćwiczenia', day: 'Czwartek', time: '13:30', endTime: '15:00', instructor: 'Małgorzata Rybka', group: 'Grupa 4', color: '#D8BFD8', faculty: 'Filologia Polska' },
            { id: '29', title: 'Nauka o współczesnym języku polskim - Ćwiczenia', day: 'Czwartek', time: '09:45', endTime: '11:15', instructor: 'Marta Wrześniewska-Pietrzak', group: 'Grupa 5', color: '#D8BFD8', faculty: 'Filologia Polska' },
            { id: '30', title: 'Nauka o współczesnym języku polskim - Ćwiczenia', day: 'Piątek', time: '09:45', endTime: '11:15', instructor: 'Ewa Kaptur', group: 'Grupa 6', color: '#D8BFD8', faculty: 'Filologia Polska' },
            { id: '31', title: 'Nauka o współczesnym języku polskim - Ćwiczenia', day: 'Czwartek', time: '17:00', endTime: '18:30', instructor: 'Alicja Przybylska', group: 'Grupa 7', color: '#D8BFD8', faculty: 'Filologia Polska' },
            { id: '32', title: 'Nauka o współczesnym języku polskim - Ćwiczenia', day: 'Czwartek', time: '08:00', endTime: '09:30', instructor: 'Magdalena Socha', group: 'Grupa 8', color: '#D8BFD8', faculty: 'Filologia Polska' },

            { id: '33', title: 'Nauki pomocnicze - Ćwiczenia', day: 'Środa', time: '08:00', endTime: '09:30', instructor: 'Olga Ziółkowska', group: 'Grupa 1', color: '#FFFACD', faculty: 'Filologia Polska' },
            { id: '34', title: 'Nauki pomocnicze - Ćwiczenia', day: 'Środa', time: '09:45', endTime: '11:15', instructor: 'Olga Ziółkowska', group: 'Grupa 2', color: '#FFFACD', faculty: 'Filologia Polska' },
            { id: '35', title: 'Nauki pomocnicze - Ćwiczenia', day: 'Środa', time: '11:30', endTime: '13:00', instructor: 'Olga Ziółkowska', group: 'Grupa 3', color: '#FFFACD', faculty: 'Filologia Polska' },
            { id: '36', title: 'Nauki pomocnicze - Ćwiczenia', day: 'Wtorek', time: '13:30', endTime: '15:00', instructor: 'Marek Osiewicz', group: 'Grupa 4', color: '#FFFACD', faculty: 'Filologia Polska' },
            { id: '37', title: 'Nauki pomocnicze - Ćwiczenia', day: 'Wtorek', time: '15:15', endTime: '16:45', instructor: 'Marek Osiewicz', group: 'Grupa 5', color: '#FFFACD', faculty: 'Filologia Polska' },
            { id: '38', title: 'Nauki pomocnicze - Ćwiczenia', day: 'Wtorek', time: '11:30', endTime: '13:00', instructor: 'Katarzyna Krzak-Weiss', group: 'Grupa 6', color: '#FFFACD', faculty: 'Filologia Polska' },
            { id: '39', title: 'Nauki pomocnicze - Ćwiczenia', day: 'Wtorek', time: '08:00', endTime: '09:30', instructor: 'N/A', group: 'Grupa 7', color: '#FFFACD', faculty: 'Filologia Polska' },
            { id: '40', title: 'Nauki pomocnicze - Ćwiczenia', day: 'Wtorek', time: '09:45', endTime: '11:15', instructor: 'N/A', group: 'Grupa 8', color: '#FFFACD', faculty: 'Filologia Polska' },

            { id: '41', title: 'Mówienie - warsztat polonisty - Ćwiczenia', day: 'Wtorek', time: '11:30', endTime: '13:00', instructor: 'Joanna Smół', group: 'Grupa 1', color: '#E6E6FA', faculty: 'Filologia Polska' },
            { id: '42', title: 'Mówienie - warsztat polonisty - Ćwiczenia', day: 'Wtorek', time: '13:30', endTime: '15:00', instructor: 'Joanna Smół', group: 'Grupa 2', color: '#E6E6FA', faculty: 'Filologia Polska' },
            { id: '43', title: 'Mówienie - warsztat polonisty - Ćwiczenia', day: 'Wtorek', time: '15:15', endTime: '16:45', instructor: 'Justyna Kobus', group: 'Grupa 3', color: '#E6E6FA', faculty: 'Filologia Polska' },
            { id: '44', title: 'Mówienie - warsztat polonisty - Ćwiczenia', day: 'Środa', time: '15:15', endTime: '16:45', instructor: 'Justyna Kobus', group: 'Grupa 4', color: '#E6E6FA', faculty: 'Filologia Polska' },
            { id: '45', title: 'Mówienie - warsztat polonisty - Ćwiczenia', day: 'Czwartek', time: '17:00', endTime: '18:30', instructor: 'Błażej Osowski', group: 'Grupa 5', color: '#E6E6FA', faculty: 'Filologia Polska' },
            { id: '46', title: 'Mówienie - warsztat polonisty - Ćwiczenia', day: 'Środa', time: '15:15', endTime: '16:45', instructor: 'Ewa Kaptur', group: 'Grupa 6', color: '#E6E6FA', faculty: 'Filologia Polska' },
            { id: '47', title: 'Mówienie - warsztat polonisty - Ćwiczenia', day: 'Wtorek', time: '09:45', endTime: '11:15', instructor: 'Eliza Grzelak', group: 'Grupa 7', color: '#E6E6FA', faculty: 'Filologia Polska' },
            { id: '48', title: 'Mówienie - warsztat polonisty - Ćwiczenia', day: 'Wtorek', time: '08:00', endTime: '09:30', instructor: 'Przemysław Raczyk', group: 'Grupa 8', color: '#E6E6FA', faculty: 'Filologia Polska' },

            { id: '49', title: 'Historia literatury staropolskiej i oświecenia - Ćwiczenia', day: 'Czwartek', time: '11:30', endTime: '13:00', instructor: 'Grzegorz Raubo', group: 'Grupa 1', color: '#ADD8E6', faculty: 'Filologia Polska' },
            { id: '50', title: 'Historia literatury staropolskiej i oświecenia - Ćwiczenia', day: 'Czwartek', time: '13:30', endTime: '15:00', instructor: 'Grzegorz Raubo', group: 'Grupa 2', color: '#ADD8E6', faculty: 'Filologia Polska' },
            { id: '51', title: 'Historia literatury staropolskiej i oświecenia - Ćwiczenia', day: 'Piątek', time: '09:45', endTime: '11:15', instructor: 'Leszek Teusz', group: 'Grupa 3', color: '#ADD8E6', faculty: 'Filologia Polska' },
            { id: '52', title: 'Historia literatury staropolskiej i oświecenia - Ćwiczenia', day: 'Piątek', time: '11:30', endTime: '13:00', instructor: 'Leszek Teusz', group: 'Grupa 4', color: '#ADD8E6', faculty: 'Filologia Polska' },
            { id: '53', title: 'Historia literatury staropolskiej i oświecenia - Ćwiczenia', day: 'Czwartek', time: '17:00', endTime: '18:30', instructor: 'Maciej Parkitny', group: 'Grupa 5', color: '#ADD8E6', faculty: 'Filologia Polska' },
            { id: '54', title: 'Historia literatury staropolskiej i oświecenia - Ćwiczenia', day: 'Czwartek', time: '18:45', endTime: '20:15', instructor: 'Maciej Parkitny', group: 'Grupa 6', color: '#ADD8E6', faculty: 'Filologia Polska' },
            { id: '55', title: 'Historia literatury staropolskiej i oświecenia - Ćwiczenia', day: 'Czwartek', time: '09:45', endTime: '11:15', instructor: 'Katarzyna Meller', group: 'Grupa 7', color: '#ADD8E6', faculty: 'Filologia Polska' },
            { id: '56', title: 'Historia literatury staropolskiej i oświecenia - Ćwiczenia', day: 'Czwartek', time: '08:00', endTime: '09:30', instructor: 'Patrycja Bąkowska', group: 'Grupa 8', color: '#ADD8E6', faculty: 'Filologia Polska' },

            // ANGLISTYKA - WYKŁADY
            { id: '57', title: 'Zarys historii Niderlandów', day: 'Czwartek', time: '15:00', endTime: '15:45', instructor: 'Przemysław Paluszek', group: 'Wykład', color: '#FFA07A', faculty: 'Anglistyka' },
            { id: '58', title: 'Językoznawstwo ogólne', day: 'Poniedziałek', time: '13:15', endTime: '14:45', instructor: 'Karolina Krawczak-Glynn', group: 'Wykład', color: '#FFA07A', faculty: 'Anglistyka' },
            { id: '59', title: 'Historia Wysp Brytyjskich', day: 'Poniedziałek', time: '16:45', endTime: '18:15', instructor: 'Tomasz Skirecki', group: 'Wykład', color: '#FFA07A', faculty: 'Anglistyka' },
            { id: '60', title: 'Historie teatru I', day: 'Środa', time: '15:00', endTime: '16:45', instructor: 'Jacek Fabiszak', group: 'Wykład', color: '#FFA07A', faculty: 'Anglistyka' },

            // FILOLOGIA POLSKA I KLASYCZNA - WYKŁADY
            { id: '61', title: 'Dzieje literatury staropolskiej i Oświecenia', day: 'Środa', time: '17:00', endTime: '18:30', instructor: 'Grzegorz Raubo', group: 'Wykład', color: '#DDA0DD', faculty: 'Filologia Polska i Klasyczna' },
            { id: '62', title: 'Historia filozofii', day: 'Poniedziałek', time: '15:15', endTime: '16:45', instructor: 'Sylwia Panek', group: 'Wykład', color: '#DDA0DD', faculty: 'Filologia Polska i Klasyczna' },
            { id: '63', title: 'Historia literatury romantyzmu', day: 'Środa', time: '17:00', endTime: '18:30', instructor: 'Jerzy Fiećko', group: 'Wykład', color: '#DDA0DD', faculty: 'Filologia Polska i Klasyczna' },
            { id: '64', title: 'Literatura i życie literackie po roku 1918', day: 'Środa', time: '15:15', endTime: '16:45', instructor: 'Sylwia Panek, Agnieszka Kwiatkowska', group: 'Wykład', color: '#DDA0DD', faculty: 'Filologia Polska i Klasyczna' },
            { id: '65', title: 'Literatura i kultura starożytnej Grecji', day: 'Poniedziałek', time: '09:45', endTime: '11:15', instructor: 'Krystyna Bartol', group: 'Wykład', color: '#DDA0DD', faculty: 'Filologia Polska i Klasyczna' },
            { id: '66', title: 'Nauka o współczesnym języku polskim: fonetyka, fonologia', day: 'Poniedziałek', time: '13:30', endTime: '15:00', instructor: 'Paweł Nowakowski', group: 'Wykład', color: '#DDA0DD', faculty: 'Filologia Polska i Klasyczna' },
            { id: '67', title: 'Nauka o współczesnym języku polskim: składnia', day: 'Czwartek', time: '13:30', endTime: '15:00', instructor: 'Romana Łapa', group: 'Wykład', color: '#DDA0DD', faculty: 'Filologia Polska i Klasyczna' },
            { id: '68', title: 'Słowotwórstwo współczesnego języka polskiego', day: 'Czwartek', time: '18:45', endTime: '20:15', instructor: 'Błażej Osowski', group: 'Wykład', color: '#DDA0DD', faculty: 'Filologia Polska i Klasyczna' },
            { id: '69', title: 'Teoria literatury', day: 'Wtorek', time: '09:45', endTime: '11:15', instructor: 'Michał Januszkiewicz', group: 'Wykład', color: '#DDA0DD', faculty: 'Filologia Polska i Klasyczna' },
            { id: '70', title: 'Wprowadzenie do historii literatury polskiej okresu pozytywizmu', day: 'Środa', time: '15:15', endTime: '16:45', instructor: 'Marek Wedemann', group: 'Wykład', color: '#DDA0DD', faculty: 'Filologia Polska i Klasyczna' },
            { id: '71', title: 'Wstęp do literaturoznawstwa', day: 'Środa', time: '09:45', endTime: '11:15', instructor: 'Beata Przymuszała', group: 'Wykład', color: '#DDA0DD', faculty: 'Filologia Polska i Klasyczna' },
            { id: '72', title: 'Wykłady z historii Polski (966-1795)', day: 'Poniedziałek', time: '17:00', endTime: '18:30', instructor: 'Wojciech Sajkowski', group: 'Wykład', color: '#DDA0DD', faculty: 'Filologia Polska i Klasyczna' },

            // NEOFILOLOGIA - WYKŁADY
            { id: '73', title: 'Cywilizacje Azji. Literatura popularna przedwojennej Japonii', day: 'Czwartek', time: '11:30', endTime: '13:00', instructor: 'Andrzej Świrkowski', group: 'Wykład', color: '#F0E68C', faculty: 'Neofilologia' },
            { id: '74', title: 'Konwersatorium z literatury powszechnej', day: 'Wtorek', time: '08:00', endTime: '09:30', instructor: 'Arkadiusz Żychliński', group: 'Wykład', color: '#F0E68C', faculty: 'Neofilologia' },
            { id: '75', title: 'Historia Skandynawii', day: 'Środa', time: '11:30', endTime: '13:00', instructor: 'Sylwia Izabela Schab, Magdalena Żmuda-Trzebiatowska, Tadeusz Wojciech Lange', group: 'Wykład', color: '#F0E68C', faculty: 'Neofilologia' },
            { id: '76', title: 'Zarys literatur skandynawskich (Dania, Norwegia)', day: 'Wtorek', time: '09:45', endTime: '11:15', instructor: 'Sylwia Izabela Schab, Aleksandra Wilkus', group: 'Wykład', color: '#F0E68C', faculty: 'Neofilologia' },
            { id: '77', title: 'Podstawy tłumaczenia konferencyjnego', day: 'Poniedziałek', time: '15:00', endTime: '16:30', instructor: 'Hanka Błaszkowska', group: 'Wykład', color: '#F0E68C', faculty: 'Neofilologia' },
            { id: '78', title: 'Visual Communication in Eastern European Cinema', day: 'Piątek', time: '15:00', endTime: '16:30', instructor: 'Beata Waligórska-Olejniczak', group: 'Wykład', color: '#F0E68C', faculty: 'Neofilologia' },
            { id: '79', title: 'Wstęp do socjolingwistyki', day: 'Piątek', time: '11:30', endTime: '13:00', instructor: 'Zofia Szwed', group: 'Wykład', color: '#F0E68C', faculty: 'Neofilologia' },
            { id: '80', title: 'Rosja współczesna', day: 'Wtorek', time: '15:00', endTime: '16:30', instructor: 'Antoni Bortnowski', group: 'Wykład', color: '#F0E68C', faculty: 'Neofilologia' },
            { id: '81', title: 'Literatura, sztuka, społeczeństwo francuskie I (średniowiecze)', day: 'Wtorek', time: '16:45', endTime: '18:15', instructor: 'Marta Sukiennicka', group: 'Wykład', color: '#F0E68C', faculty: 'Neofilologia' },
            { id: '82', title: 'Współczesne życie literackie krajów frankofońskich', day: 'Wtorek', time: '09:45', endTime: '11:15', instructor: 'Jędrzej Pawlicki', group: 'Wykład', color: '#F0E68C', faculty: 'Neofilologia' },
            { id: '83', title: 'Historia Francji', day: 'Środa', time: '09:45', endTime: '11:15', instructor: 'Jędrzej Pawlicki', group: 'Wykład', color: '#F0E68C', faculty: 'Neofilologia' },
            { id: '84', title: 'Historia Francji', day: 'Środa', time: '11:30', endTime: '13:00', instructor: 'Jędrzej Pawlicki', group: 'Wykład (grupa 2)', color: '#F0E68C', faculty: 'Neofilologia' },
            { id: '85', title: 'Historia Półwyspu Iberyjskiego', day: 'Piątek', time: '08:00', endTime: '09:30', instructor: 'Alfons Gregori', group: 'Wykład', color: '#F0E68C', faculty: 'Neofilologia' },
            { id: '86', title: 'Włochy współczesne', day: 'Czwartek', time: '08:00', endTime: '09:30', instructor: 'Wawrzyniec Kryza', group: 'Wykład', color: '#F0E68C', faculty: 'Neofilologia' },
            { id: '87', title: 'Współczesna literatura portugalska', day: 'Środa', time: '16:45', endTime: '18:15', instructor: 'Wojciech Charchalis', group: 'Wykład', color: '#F0E68C', faculty: 'Neofilologia' },
            { id: '88', title: 'Kultura Portugalii', day: 'Środa', time: '18:30', endTime: '20:00', instructor: 'Wojciech Charchalis', group: 'Wykład', color: '#F0E68C', faculty: 'Neofilologia' },
            { id: '89', title: 'Język i kultura Basków', day: 'Poniedziałek', time: '13:15', endTime: '15:00', instructor: 'Leire Lazcano Zapatera', group: 'Wykład (część 1)', color: '#F0E68C', faculty: 'Neofilologia' },
            { id: '90', title: 'Język i kultura Basków', day: 'Czwartek', time: '15:00', endTime: '16:30', instructor: 'Leire Lazcano Zapatera', group: 'Wykład (część 2)', color: '#F0E68C', faculty: 'Neofilologia' },
            { id: '91', title: 'Islam I', day: 'Środa', time: '13:30', endTime: '15:00', instructor: 'Łukasz Piątak', group: 'Wykład', color: '#F0E68C', faculty: 'Neofilologia' },
            { id: '92', title: 'Sztuka arabsko-muzułmańska', day: 'Czwartek', time: '09:45', endTime: '11:15', instructor: 'Łukasz Piątak', group: 'Wykład', color: '#F0E68C', faculty: 'Neofilologia' },
            { id: '93', title: 'Wstęp do nowogrecystyki', day: 'Wtorek', time: '09:45', endTime: '11:15', instructor: 'Karolina Gortych-Michalak', group: 'Wykład', color: '#F0E68C', faculty: 'Neofilologia' },
            { id: '94', title: 'Statystyka', day: 'Poniedziałek', time: '13:15', endTime: '16:30', instructor: 'Victoria Kamasa', group: 'Wykład (z przerwą 14:45-15:00)', color: '#F0E68C', faculty: 'Neofilologia' },
        ];
    }

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
            ${schedule.faculty ? `<p><strong>Wydział:</strong> ${schedule.faculty}</p>` : ''}
        `;

        return item;
    }

    function handleScheduleClick(schedule) {
        const conflict = checkConflict(schedule, mySchedules);

        if (conflict === true) {
            return;
        }

        if (conflict) {
            pendingConflictSchedule = schedule;
            currentConflictTitle.textContent = conflict.title;
            newConflictTitle.textContent = schedule.title;
            conflictModal.classList.add('show');
        } else {
            addToMySchedule(schedule);
        }
    }

    function addToMySchedule(schedule) {
        mySchedules.push({ ...schedule });
        saveMySchedules();
        renderSchedules(mySchedules, myScheduleDisplay);
        showMessage(`Dodano: ${schedule.title}`, '');
    }

    // Event listenery
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

    // Funkcja do przełączania sekcji
    function showSection(section) {
        myScheduleSection.classList.add('d-none');
        readingListSection.classList.add('d-none');
        planGeneratorSection.classList.add('d-none');

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

        updateNavButtons(section);
    }

    // Przyciski nawigacji
    showScheduleButton.addEventListener('click', () => {
        showSection('schedule');
    });

    showReadingListButton.addEventListener('click', () => {
        showSection('reading');
    });

    showGeneratorButton.addEventListener('click', () => {
        showSection('generator');
    });

    function updateNavButtons(activeSection) {
        const buttons = [showScheduleButton, showReadingListButton, showGeneratorButton];
        buttons.forEach(btn => {
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary');
        });

        switch(activeSection) {
            case 'schedule':
                showScheduleButton.classList.remove('btn-secondary');
                showScheduleButton.classList.add('btn-primary');
                break;
            case 'reading':
                showReadingListButton.classList.remove('btn-secondary');
                showReadingListButton.classList.add('btn-primary');
                break;
            case 'generator':
                showGeneratorButton.classList.remove('btn-secondary');
                showGeneratorButton.classList.add('btn-primary');
                break;
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

        // Sprawdzenie czy jsPDF jest dostępne
        if (typeof window.jspdf === 'undefined') {
            showMessage('Biblioteka PDF nie została załadowana. Spróbuj odświeżyć stronę.', 'error');
            return;
        }

        try {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = createHtmlPlan();
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.width = '800px';
            tempDiv.style.backgroundColor = 'white';
            tempDiv.style.padding = '20px';
            document.body.appendChild(tempDiv);

            // Sprawdzenie czy html2canvas jest dostępne
            if (typeof html2canvas === 'undefined') {
                showMessage('Biblioteka html2canvas nie została załadowana.', 'error');
                document.body.removeChild(tempDiv);
                return;
            }

            html2canvas(tempDiv, {
                backgroundColor: '#ffffff',
                scale: 2
            }).then(canvas => {
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF();
                const imgData = canvas.toDataURL('image/png');
                const imgWidth = 210;
                const pageHeight = 295;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                pdf.save('moj-plan-zajec.pdf');

                document.body.removeChild(tempDiv);
                showMessage('PDF został wygenerowany i pobrany!', '');
            }).catch(error => {
                console.error('Błąd podczas generowania PDF:', error);
                showMessage('Błąd podczas generowania PDF', 'error');
                document.body.removeChild(tempDiv);
            });
        } catch (error) {
            console.error('Błąd PDF:', error);
            showMessage('Błąd podczas generowania PDF', 'error');
        }
    }

    function createHtmlPlan() {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Mój Plan Zajęć</title>
                <meta charset="utf-8">
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .schedule-item { border: 1px solid #ddd; margin: 10px 0; padding: 10px; border-radius: 5px; }
                    h1 { color: #333; text-align: center; }
                    h3 { color: #666; margin-bottom: 5px; }
                    p { margin: 5px 0; }
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
                        ${s.faculty ? `<p><strong>Wydział:</strong> ${s.faculty}</p>` : ''}
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
    showSection('schedule');
});
