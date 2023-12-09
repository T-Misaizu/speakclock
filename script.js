const datetimeDisplay = document.getElementById('datetime-display');
const alarmForm = document.getElementById('alarm-form');
const alarmsList = document.getElementById('alarms-list');
let alarms = [];


const timeSignalFrequencySelect = document.getElementById('time-signal-frequency');
let timeSignalFrequency = parseInt(timeSignalFrequencySelect.value);

// 時報の頻度をローカルストレージに保存する関数
function saveTimeSignalFrequency() {
    localStorage.setItem('timeSignalFrequency', timeSignalFrequency.toString());
}

// ローカルストレージから時報の頻度を読み込む関数
function loadTimeSignalFrequency() {
    const storedFrequency = localStorage.getItem('timeSignalFrequency');
    if (storedFrequency) {
        timeSignalFrequency = parseInt(storedFrequency);
        timeSignalFrequencySelect.value = storedFrequency;
    }
}

timeSignalFrequencySelect.addEventListener('change', () => {
    timeSignalFrequency = parseInt(timeSignalFrequencySelect.value);
    saveTimeSignalFrequency(); // 時報の頻度を保存
});



function updateDateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0'); // 時を2桁にフォーマット
    const minutes = now.getMinutes().toString().padStart(2, '0'); // 分を2桁にフォーマット
    const seconds = now.getSeconds().toString().padStart(2, '0'); // 秒を2桁にフォーマット

    const dayOfWeek = now.getDay();
    const formattedDate = `${now.getFullYear()}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}（${['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'][dayOfWeek]}）`;
    const formattedTime = `${hours}:${minutes}:${seconds}`;

    datetimeDisplay.textContent = `${formattedDate} ${formattedTime}`;

    // 曜日に応じたスタイルの適用
    datetimeDisplay.className = dayOfWeek === 6 ? 'saturday' : dayOfWeek === 0 ? 'sunday' : 'weekday';

    // 時報のロジックを更新
    if (now.getMinutes() % timeSignalFrequency === 0 && now.getSeconds() === 0) {
        speak(`現在の時刻は${now.getHours()}時${now.getMinutes()}分です。`);
    }

    // アラームのチェックと更新
    alarms.forEach(alarm => {
        if (alarm.on && now.getHours() === alarm.hour && now.getMinutes() === alarm.minute && now.getSeconds() === 0) {
            speak(`${alarm.name}の時間です。`);
        }
    });

    setTimeout(updateDateTime, 1000);
}

let availableVoices = [];
let childVoice = null;

window.speechSynthesis.onvoiceschanged = () => {
    availableVoices = window.speechSynthesis.getVoices();
    // 子どもの声に近い声を検索（言語や声の特性による）
    childVoice = availableVoices.find(voice => voice.name.includes('Child') || voice.lang.includes('ja'));
};

function speak(message) {
    const speech = new SpeechSynthesisUtterance(message);
    speech.voice = childVoice; // 子どもの声を設定
    speech.lang = 'ja-JP';
    window.speechSynthesis.speak(speech);
}



alarmForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const alarmTime = document.getElementById('alarm-time').value.split(':');
    const alarmName = document.getElementById('alarm-name').value;
    addAlarm(alarmTime, alarmName);
});

function addAlarm(time, name) {
    if (alarms.length >= 5) {
        alert('アラームは最大5つまでです。');
        return;
    }
    const newAlarm = { hour: parseInt(time[0]), minute: parseInt(time[1]), name, on: true };
    alarms.push(newAlarm);
    updateAlarmsList();
}


function updateAlarmsList() {
    const alarmsList = document.getElementById('alarms-list');
    alarmsList.innerHTML = '';
    alarms.forEach((alarm, index) => {
        const row = document.createElement('tr');

        // アラーム名
        const nameCell = document.createElement('td');
        nameCell.textContent = alarm.name;
        row.appendChild(nameCell);

        // 時刻
        const timeCell = document.createElement('td');
        timeCell.textContent = `${alarm.hour.toString().padStart(2, '0')}:${alarm.minute.toString().padStart(2, '0')}`;
        row.appendChild(timeCell);

        // ON/OFFスイッチ
        const toggleCell = document.createElement('td');
        const switchLabel = document.createElement('label');
        switchLabel.className = 'toggle-switch';
        const switchInput = document.createElement('input');
        switchInput.type = 'checkbox';
        switchInput.checked = alarm.on;
        switchInput.addEventListener('change', () => toggleAlarm(index));
        const switchSlider = document.createElement('span');
        switchSlider.className = 'slider';
        switchLabel.appendChild(switchInput);
        switchLabel.appendChild(switchSlider);
        toggleCell.appendChild(switchLabel);
        row.appendChild(toggleCell);

        // 操作ボタン
        const actionCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '削除';
        deleteButton.addEventListener('click', () => deleteAlarm(index));
        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);

        alarmsList.appendChild(row);
    });
}



function toggleAlarm(index) {
    alarms[index].on = !alarms[index].on;
    updateAlarmsList();
}

function deleteAlarm(index) {
    alarms.splice(index, 1);
    updateAlarmsList();
}


// アラームをローカルストレージに保存する
function saveAlarms() {
    localStorage.setItem('alarms', JSON.stringify(alarms));
}

// ローカルストレージからアラームを読み込む
function loadAlarms() {
    const storedAlarms = localStorage.getItem('alarms');
    if (storedAlarms) {
        alarms = JSON.parse(storedAlarms);
        updateAlarmsList();
    }
}

// アラームを追加する関数を変更して、追加時に保存する
function addAlarm(time, name) {
    if (alarms.length >= 5) {
        alert('アラームは最大5つまでです。');
        return;
    }
    const newAlarm = { hour: parseInt(time[0]), minute: parseInt(time[1]), name, on: true };
    alarms.push(newAlarm);
    updateAlarmsList();
    saveAlarms(); // アラームを保存
}

// アラームのON/OFFを切り替える関数を変更して、変更時に保存する
function toggleAlarm(index) {
    alarms[index].on = !alarms[index].on;
    updateAlarmsList();
    saveAlarms(); // アラームを保存
}

// アラームを削除する関数を変更して、削除時に保存する
function deleteAlarm(index) {
    alarms.splice(index, 1);
    updateAlarmsList();
    saveAlarms(); // アラームを保存
}

// ページ読み込み時にアラームを読み込む
loadAlarms();
loadTimeSignalFrequency();
updateDateTime();


