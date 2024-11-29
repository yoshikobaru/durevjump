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

    // Инициализация балансов из localStorage
    const balances = {
        total: parseInt(localStorage.getItem('totalBalance')) || 0,
        tasks: parseInt(localStorage.getItem('tasksBalance')) || 0,
        friends: parseInt(localStorage.getItem('friendsBalance')) || 0,
        game: parseInt(localStorage.getItem('gameBalance')) || 0
    };

    // Функция обновления балансов
    function updateBalances() {
        // Обновляем общий баланс
        const totalBalanceElement = document.querySelector('.text-lg.font-bold');
        if (totalBalanceElement) {
            totalBalanceElement.textContent = `${balances.total} DPS`;
        }
        
        // Обновляем балансы в карточках
        const balanceCards = document.querySelectorAll('.text-black.font-bold.text-base');
        if (balanceCards.length >= 3) {
            balanceCards[0].textContent = `+${balances.tasks} DPS`;
            balanceCards[1].textContent = `+${balances.friends} DPS`;
            balanceCards[2].textContent = `+${balances.game} DPS`;
        }

        // Сохраняем в localStorage
        localStorage.setItem('totalBalance', balances.total);
        localStorage.setItem('tasksBalance', balances.tasks);
        localStorage.setItem('friendsBalance', balances.friends);
        localStorage.setItem('gameBalance', balances.game);
    }

    // Функция для добавления очков
    window.addPoints = function(amount, type) {
        // Получаем текущие значения из localStorage
        balances[type] += amount;  // Добавляем новые очки к существующим
        balances.total = balances.tasks + balances.friends + balances.game;
        
        // Обновляем отображение и сохраняем
        updateBalances();
    };

    // Добавляем функцию для получения текущего баланса
    window.getBalance = function(type) {
        return balances[type];
    };

    // Вызываем обновление балансов при загрузке страницы
    updateBalances();

    // Устанавливаем домашнюю страницу как активную при загрузке
    switchPage('home');

    // Добавляем слушатель события balanceUpdated
    window.addEventListener('balanceUpdated', function(e) {
        const { amount, type } = e.detail;
        
        // Обновляем балансы
        balances[type] += amount;
        balances.total = balances.tasks + balances.friends + balances.game;
        
        // Обновляем отображение
        updateBalances();
    });
});
