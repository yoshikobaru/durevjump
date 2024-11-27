document.addEventListener('DOMContentLoaded', function() {
    // Получаем все кнопки и страницы
    const buttons = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');

    // Функция для переключения страниц
    function switchPage(pageId) {
        // Скрываем все страницы
        pages.forEach(page => {
            page.classList.add('hidden');
            page.classList.remove('active');
        });

        // Убираем active у всех кнопок
        buttons.forEach(btn => {
            btn.classList.remove('active');
            btn.classList.add('text-gray-600');
        });

        // Показываем нужную страницу
        const activePage = document.getElementById(pageId + '-page');
        if (activePage) {
            activePage.classList.remove('hidden');
            activePage.classList.add('active');
        }

        // Активируем нужную кнопку
        const activeBtn = document.getElementById(pageId + '-btn');
        if (activeBtn) {
            activeBtn.classList.add('active');
            activeBtn.classList.remove('text-gray-600');
            activeBtn.classList.add('text-blue-600');
        }
    }

    // Добавляем обработчики для кнопок
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const pageId = this.id.replace('-btn', '');
            switchPage(pageId);
        });
    });

    // Добавим управление балансами
    const balances = {
        total: 1100,
        tasks: 450,
        friends: 450,
        game: 450
    };

    function updateBalances() {
        const totalBalance = document.querySelector('.total-balance');
        const tasksBalance = document.querySelector('.tasks-balance');
        const friendsBalance = document.querySelector('.friends-balance');
        const gameBalance = document.querySelector('.game-balance');

        if (totalBalance) totalBalance.textContent = `${balances.total} DPS`;
        if (tasksBalance) tasksBalance.textContent = `+${balances.tasks} DPS`;
        if (friendsBalance) friendsBalance.textContent = `+${balances.friends} DPS`;
        if (gameBalance) gameBalance.textContent = `+${balances.game} DPS`;
    }

    // Вызываем обновление балансов при загрузке страницы
    updateBalances();

    // Устанавливаем домашнюю страницу как активную при загрузке
    switchPage('home');
});
