document.addEventListener('DOMContentLoaded', function() {
    const taskCategories = {
        daily: [
            { name: 'Name Daily Task', reward: 150 },
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
            const taskElement = `
                <div class="flex items-center justify-between p-4">
                    <div class="flex items-center gap-4">
                        <div class="w-6 h-6 rounded-full border-2 border-white"></div>
                        <div class="text-white">
                            <div class="text-lg">${task.name}</div>
                            <div class="text-sm">+${task.reward} DPS</div>
                        </div>
                    </div>
                    <img src="start.png" alt="Начать" class="h-8">
                </div>
            `;
            container.innerHTML += taskElement;
        });
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