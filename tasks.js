document.addEventListener('DOMContentLoaded', function() {
    const taskCategories = {
        daily: [
            { 
                id: 'dailytask',
                name: 'Daily Task', 
                reward: 1222,
                cooldown: 10000 // 10 секунд в миллисекундах
            },
            { name: 'Name Daily Task', reward: 150 },
            { name: 'Name Daily Task', reward: 150 },
            { name: 'Name Daily Task', reward: 150 }
        ],
        social: [
            { name: 'Social Task 1', reward: 200 },
            { name: 'Social Task 2', reward: 200 }
        ],
        media: [
            { name: 'Media Task 1', reward: 300 },
            { name: 'Media Task 2', reward: 300 }
        ],
        refs: [
            { name: 'Referral Task 1', reward: 400 },
            { name: 'Referral Task 2', reward: 400 }
        ]
    };

    function renderTasks(category = 'daily') {
        const container = document.getElementById('tasks-container');
        if (!container) {
            console.error('Tasks container not found!');
            return;
        }
        
        container.innerHTML = '';

        taskCategories[category].forEach(task => {
            const lastClaimTime = localStorage.getItem(`${task.id}_lastClaim`);
            const now = Date.now();
            const isOnCooldown = lastClaimTime && (now - parseInt(lastClaimTime) < task.cooldown);
            
            const taskElement = `
                <div class="flex items-center justify-between p-4">
                    <div class="flex items-center gap-4">
                        <div class="w-6 h-6 rounded-full border-2 border-white"></div>
                        <div class="text-white">
                            <div class="text-lg">${task.name}</div>
                            <div class="text-sm">
                                ${isOnCooldown ? 'Cooldown' : `+${task.reward} DPS`}
                            </div>
                        </div>
                    </div>
                    <button 
                        class="task-start-btn" 
                        data-task-id="${task.id}"
                        data-reward="${task.reward}"
                        data-cooldown="${task.cooldown}"
                        ${isOnCooldown ? 'disabled' : ''}
                    >
                        <img src="start.png" alt="Начать" class="h-8 ${isOnCooldown ? 'opacity-50' : ''}">
                    </button>
                </div>
            `;
            container.innerHTML += taskElement;
        });

        // Добавляем обработчики для кнопок
        const taskButtons = container.querySelectorAll('.task-start-btn');
        taskButtons.forEach(button => {
            button.addEventListener('click', handleTaskClick);
        });
    }

    function handleTaskClick(event) {
        const button = event.currentTarget;
        const taskId = button.dataset.taskId;
        const reward = parseInt(button.dataset.reward);
        const cooldown = parseInt(button.dataset.cooldown);
        
        const lastClaimTime = localStorage.getItem(`${taskId}_lastClaim`);
        const now = Date.now();
        
        if (lastClaimTime) {
            const timePassed = now - parseInt(lastClaimTime);
            if (timePassed < cooldown) {
                const remainingSeconds = Math.ceil((cooldown - timePassed) / 1000);
                showPopup(`Подождите ${remainingSeconds} секунд`);
                return;
            }
        }
        
        // Добавляем очки
        window.addPoints(reward, 'tasks');
        
        // Сохраняем время последнего получения награды
        localStorage.setItem(`${taskId}_lastClaim`, now.toString());
        
        // Показываем поздравление
        showPopup(`Поздравляем! Вы получили +${reward} DPS`);
        
        // Сразу обновляем отображение на Cooldown
        const rewardText = button.parentElement.querySelector('.text-sm');
        if (rewardText) {
            rewardText.textContent = 'Cooldown';
        }
        
        // Обновляем отображение кнопки
        button.disabled = true;
        button.querySelector('img').classList.add('opacity-50');
        
        // Запускаем таймер для обновления состояния
        setTimeout(() => {
            if (rewardText) {
                rewardText.textContent = `+${reward} DPS`;
            }
            button.disabled = false;
            button.querySelector('img').classList.remove('opacity-50');
        }, cooldown);
    }

    function showPopup(message) {
        console.log('Creating popup with message:', message);
        
        // Удаляем существующие попапы
        const existingPopups = document.querySelectorAll('.popup-animation');
        existingPopups.forEach(popup => popup.remove());
        
        // Создаем элемент попапа
        const popup = document.createElement('div');
        popup.className = 'fixed px-6 py-3 rounded shadow-lg z-50 text-center popup-animation';
        popup.innerHTML = `
            <p class="text-lg">${message}</p>
        `;
        
        // Добавляем стили для анимации
        const style = document.createElement('style');
        style.textContent = `
            .popup-animation {
                animation: popup 3s ease-in-out forwards;
                z-index: 9999;
                background-color: #2563eb !important;
                color: white !important;
                top: 32px;
                left: 50%;
                transform: translateX(-50%);
                min-width: 300px;
            }
            
            @keyframes popup {
                0% {
                    transform: translate(-50%, -100%);
                    opacity: 0;
                }
                10% {
                    transform: translate(-50%, 0);
                    opacity: 1;
                }
                90% {
                    transform: translate(-50%, 0);
                    opacity: 1;
                }
                100% {
                    transform: translate(-50%, 0);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Добавляем попап в начало body
        document.body.insertBefore(popup, document.body.firstChild);
        
        // Автоматически удаляем попап через 3 секунды
        setTimeout(() => {
            if (popup.parentElement) {
                popup.remove();
                style.remove();
            }
        }, 3000);
    }

    // Обработка переключения категорий
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

    // Явно вызываем renderTasks при загрузке страницы
    renderTasks('daily');
}); 