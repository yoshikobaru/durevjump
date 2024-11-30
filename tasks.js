document.addEventListener('DOMContentLoaded', function() {
    const taskCategories = {
        daily: [
            { 
                id: 'dailytask',
                name: 'Daily Task', 
                reward: 1222,
                cooldown: 10000, // 10 секунд в миллисекундах
                type: 'daily',   // Добавляем тип
                storageKey: 'dailyTaskCompleted'  // Добавляем ключ для хранения состояния
            },
            { 
                id: 'playgames',
                name: 'Сыграть 5 игр', 
                reward: 444,
                required: 5,
                progress: parseInt(localStorage.getItem('gamesPlayedProgress') || '0'),
                type: 'progress'
            },
            { 
                id: 'collectplanes',
                name: 'Собрать самолётики', 
                reward: 390,
                required: 10,
                progress: parseInt(localStorage.getItem('planesCollectedProgress') || '0'),
                type: 'progress'
            },
            { 
                id: 'breakplatforms',
                name: 'Сломать фейк платформы', 
                reward: 377,
                required: 6,
                progress: parseInt(localStorage.getItem('platformsBrokenProgress') || '0'),
                type: 'progress'
            },
            { 
                id: 'usesprings',
                name: 'Прыгнуть на пружинках', 
                reward: 400,
                required: 25,
                progress: parseInt(localStorage.getItem('springsUsedProgress') || '0'),
                type: 'progress'
            }
        ],
        social: [
            { 
                id: 'playmethod',
                name: 'Сыграть в Method', 
                reward: 15000,
                link: 'https://t.me/MethodTon_Bot',
                type: 'social',
                storageKey: 'methodTaskCompleted'
            },
            { 
                id: 'playdino',
                name: 'Сыграть в DINO', 
                reward: 12000,
                link: 'https://t.me/Dinosaur_Gamebot',
                type: 'social',
                storageKey: 'dinoTaskCompleted'
            },
            { 
                id: 'playlitwin',
                name: 'Сыграть в Litwin', 
                reward: 13000,
                link: 'https://t.me/LITWIN_TAP_BOT',
                type: 'social',
                storageKey: 'litwinTaskCompleted'
            }
        ],
        media: [
            { 
                id: 'methodpost',
                name: 'Посмотреть пост в Method', 
                reward: 7500,
                link: 'https://t.me/method_community',
                type: 'social',
                storageKey: 'methodPostCompleted'
            },
            { 
                id: 'dinonews',
                name: 'Посмотреть новости DINO', 
                reward: 7500,
                link: 'https://t.me/DinoRushNews',
                type: 'social',
                storageKey: 'dinoNewsCompleted'
            },
            { 
                id: 'litwinnews',
                name: 'Посмотреть новости Litwin', 
                reward: 7500,
                link: 'https://t.me/litwin_community',
                type: 'social',
                storageKey: 'litwinNewsCompleted'
            }
        ],
        refs: [
            { name: 'Referral Task 1', reward: 400 },
            { name: 'Referral Task 2', reward: 400 }
        ]
    };

    function renderTasks(category = 'daily') {
        const container = document.getElementById('tasks-container');
        if (!container) return;
        
        container.innerHTML = '';

        taskCategories[category].forEach(task => {
            if (task.type === 'social') {
                const isCompleted = localStorage.getItem(task.storageKey) === 'true';
                
                const taskElement = `
                    <div class="flex items-center justify-between p-4">
                        <div class="flex items-center gap-4">
                            <div class="w-6 h-6 rounded-full border-2 border-white 
                                ${isCompleted ? 'bg-green-500' : ''}"></div>
                            <div class="text-white">
                                <div class="text-lg">${task.name}</div>
                                <div class="text-sm">+${task.reward} DPS</div>
                            </div>
                        </div>
                        <button 
                            class="task-start-btn" 
                            data-task-id="${task.id}"
                            data-reward="${task.reward}"
                            data-link="${task.link}"
                            data-storage-key="${task.storageKey}"
                            data-type="social"
                            ${isCompleted ? 'disabled' : ''}
                        >
                            <img src="start.png" alt="Начать" 
                                class="h-8 ${isCompleted ? 'opacity-50' : ''}">
                        </button>
                    </div>
                `;
                container.innerHTML += taskElement;
            } else if (task.type === 'progress') {
                if (task.id === 'collectplanes') {
                    task.progress = parseInt(localStorage.getItem('planesCollectedProgress') || '0');
                }
                
                const taskElement = `
                    <div class="flex items-center justify-between p-4">
                        <div class="flex items-center gap-4">
                            <div class="w-6 h-6 rounded-full border-2 border-white"></div>
                            <div class="text-white">
                                <div class="text-lg">${task.name}</div>
                                <div class="text-sm">
                                    ${task.progress}/${task.required} • +${task.reward} DPS
                                </div>
                            </div>
                        </div>
                        <button 
                            class="task-start-btn" 
                            data-task-id="${task.id}"
                            data-reward="${task.reward}"
                            data-type="progress"
                            ${task.progress < task.required ? 'disabled' : ''}
                        >
                            <img src="start.png" alt="Начать" class="h-8 ${task.progress < task.required ? 'opacity-50' : ''}">
                        </button>
                    </div>
                `;
                container.innerHTML += taskElement;
            } else if (task.type === 'daily') {
                const isCompleted = localStorage.getItem(task.storageKey) === 'true';
                const lastCompletedTime = parseInt(localStorage.getItem(`${task.storageKey}_time`) || '0');
                const currentTime = Date.now();
                const isOnCooldown = currentTime - lastCompletedTime < task.cooldown;
                
                const taskElement = `
                    <div class="flex items-center justify-between p-4">
                        <div class="flex items-center gap-4">
                            <div class="w-6 h-6 rounded-full border-2 border-white 
                                ${isCompleted && isOnCooldown ? 'bg-green-500' : ''}"></div>
                            <div class="text-white">
                                <div class="text-lg">${task.name}</div>
                                <div class="text-sm">+${task.reward} DPS</div>
                            </div>
                        </div>
                        <button 
                            class="task-start-btn" 
                            data-task-id="${task.id}"
                            data-reward="${task.reward}"
                            data-type="daily"
                            data-storage-key="${task.storageKey}"
                            ${isCompleted && isOnCooldown ? 'disabled' : ''}
                        >
                            <img src="start.png" alt="Начать" 
                                class="h-8 ${isCompleted && isOnCooldown ? 'opacity-50' : ''}">
                        </button>
                    </div>
                `;
                container.innerHTML += taskElement;
            }
        });

        const taskButtons = container.querySelectorAll('.task-start-btn:not([disabled])');
        taskButtons.forEach(button => {
            button.addEventListener('click', handleTaskClick);
        });
    }

    function handleTaskClick(event) {
        const button = event.currentTarget;
        const taskId = button.dataset.taskId;
        const taskType = button.dataset.type;

        if (taskType === 'daily') {
            const reward = parseInt(button.dataset.reward);
            const storageKey = button.dataset.storageKey;
            
            // Проверяем кулдаун
            const lastCompletedTime = parseInt(localStorage.getItem(`${storageKey}_time`) || '0');
            const currentTime = Date.now();
            if (currentTime - lastCompletedTime < 10000) return; // 10 секунд кулдаун
            
            // Добавляем очки
            const balanceEvent = new CustomEvent('balanceUpdated', {
                detail: {
                    amount: reward,
                    type: 'tasks'
                }
            });
            window.dispatchEvent(balanceEvent);

            // Сохраняем время выполнения
            localStorage.setItem(storageKey, 'true');
            localStorage.setItem(`${storageKey}_time`, currentTime.toString());

            // Показываем уведомление
            showPopup(`Поздравляем! Вы получили +${reward} DPS`);

            // Обновляем отображение
            renderTasks('daily');

            // Запускаем таймер для сброса состояния
            setTimeout(() => {
                localStorage.setItem(storageKey, 'false');
                renderTasks('daily');
            }, 10000);
        } else if (taskType === 'social') {
            const reward = parseInt(button.dataset.reward);
            const link = button.dataset.link;
            const storageKey = button.dataset.storageKey;
            
            if (localStorage.getItem(storageKey) === 'true') return;
            
            window.open(link, '_blank');

            // Создаем событие для обновления баланса
            const balanceEvent = new CustomEvent('balanceUpdated', {
                detail: {
                    amount: reward,
                    type: 'tasks'
                }
            });
            window.dispatchEvent(balanceEvent);

            // Отмечаем задачу как выполненную
            localStorage.setItem(storageKey, 'true');

            // Показываем уведомление
            showPopup(`Поздравляем! Вы получили +${reward} DPS`);

            // Обновляем отображение задач
            renderTasks(button.closest('.task-container').dataset.category || 'media');
        } else if (taskType === 'progress') {
            const reward = parseInt(button.dataset.reward);
            
            if (taskId === 'playgames') {
                const progress = parseInt(localStorage.getItem('gamesPlayedProgress') || '0');
                if (progress >= 5) {
                    window.addPoints(reward, 'tasks');
                    localStorage.setItem('gamesPlayedProgress', '0');
                    showPopup(`Поздравляем! Вы получили +${reward} DPS`);
                    updateTasksProgress();
                }
            } else if (taskId === 'collectplanes') {
                const progress = parseInt(localStorage.getItem('planesCollectedProgress') || '0');
                if (progress >= 10) {
                    window.addPoints(reward, 'tasks');
                    localStorage.setItem('planesCollectedProgress', '0');
                    showPopup(`Поздравляем! Вы получили +${reward} DPS`);
                    updateTasksProgress();
                }
            } else if (taskId === 'breakplatforms') {
                const progress = parseInt(localStorage.getItem('platformsBrokenProgress') || '0');
                if (progress >= 6) {
                    window.addPoints(reward, 'tasks');
                    localStorage.setItem('platformsBrokenProgress', '0');
                    showPopup(`Поздравляем! Вы получили +${reward} DPS`);
                    updateTasksProgress();
                }
            } else if (taskId === 'usesprings') {
                const progress = parseInt(localStorage.getItem('springsUsedProgress') || '0');
                if (progress >= 25) {
                    window.addPoints(reward, 'tasks');
                    localStorage.setItem('springsUsedProgress', '0');
                    showPopup(`Поздравляем! Вы получили +${reward} DPS`);
                    updateTasksProgress();
                }
            }
        }
    }

    function showPopup(message) {
        const popup = document.createElement('div');
        popup.className = 'modern-popup';
        popup.innerHTML = `
            <div class="popup-content">
                <svg class="popup-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p class="popup-text">${message}</p>
            </div>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .modern-popup {
                position: fixed;
                top: 32px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 9999;
                min-width: 380px;
                padding: 20px 32px;
                background: linear-gradient(135deg, rgba(37, 99, 235, 0.95), rgba(29, 78, 216, 0.95));
                backdrop-filter: blur(10px);
                border-radius: 16px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2),
                            0 0 20px rgba(37, 99, 235, 0.2);
                animation: slideDown 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
            }

            .popup-content {
                display: flex;
                align-items: center;
                gap: 16px;
            }

            .popup-icon {
                width: 28px;
                height: 28px;
                color: #4ade80;
                animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
            }

            .popup-text {
                color: white;
                font-size: 1.25rem;
                font-weight: 500;
                font-family: 'Segoe UI', system-ui, sans-serif;
                letter-spacing: 0.3px;
                margin: 0;
                animation: fadeIn 0.5s ease 0.3s both;
            }

            @keyframes slideDown {
                0% {
                    transform: translate(-50%, -120px) scale(0.9);
                    opacity: 0;
                }
                100% {
                    transform: translate(-50%, 0) scale(1);
                    opacity: 1;
                }
            }

            @keyframes scaleIn {
                0% {
                    transform: scale(0);
                    opacity: 0;
                }
                100% {
                    transform: scale(1);
                    opacity: 1;
                }
            }

            @keyframes fadeIn {
                0% {
                    transform: translateY(10px);
                    opacity: 0;
                }
                100% {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            .modern-popup.hide {
                animation: slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            }

            @keyframes slideUp {
                0% {
                    transform: translate(-50%, 0) scale(1);
                    opacity: 1;
                }
                100% {
                    transform: translate(-50%, -120px) scale(0.9);
                    opacity: 0;
                }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(popup);

        // Удаление попапа через 3 секунды
        setTimeout(() => {
            popup.classList.add('hide');
            setTimeout(() => {
                popup.remove();
                style.remove();
            }, 600);
        }, 3000);
    }

    const categoryButtons = document.querySelectorAll('.task-category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            categoryButtons.forEach(btn => {
                btn.classList.remove('bg-white', 'text-black');
                btn.classList.add('text-gray-400');
            });
            this.classList.add('bg-white', 'text-black');
            this.classList.remove('text-gray-400');
            
            const category = this.textContent.toLowerCase();
            renderTasks(category);
        });
    });

    // Добавляем функцию для обновления прогресса всех тасков
    function updateTasksProgress() {
        // Обновляем прогресс в объекте тасков
        taskCategories.daily.forEach(task => {
            if (task.id === 'playgames') {
                task.progress = parseInt(localStorage.getItem('gamesPlayedProgress') || '0');
            } else if (task.id === 'collectplanes') {
                task.progress = parseInt(localStorage.getItem('planesCollectedProgress') || '0');
            } else if (task.id === 'breakplatforms') {
                task.progress = parseInt(localStorage.getItem('platformsBrokenProgress') || '0');
            } else if (task.id === 'usesprings') {
                task.progress = parseInt(localStorage.getItem('springsUsedProgress') || '0');
            }
        });
        
        // Перерисовываем таски
        renderTasks('daily');
    }

    // Добавляем слушатели событий для обновления прогресса
    window.addEventListener('planeProgressUpdated', updateTasksProgress);
    window.addEventListener('gameProgressUpdated', updateTasksProgress);

    // Добавляем функцию для сброса всех media задач (для тестирования)
    window.resetMediaTasks = function() {
        taskCategories.media.forEach(task => {
            localStorage.setItem(task.storageKey, 'false');
        });
        renderTasks('media');
    };

    renderTasks('daily');
}); 