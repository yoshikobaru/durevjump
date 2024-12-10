document.addEventListener('DOMContentLoaded', function() {
    const inviteButton = document.querySelector('img[alt="Пригласить"]');
    const friendsList = document.getElementById('friends-list');
    
    // Функция для получения реферальной ссылки
    async function getReferralLink() {
        try {
            const telegramId = window.Telegram.WebApp.initDataUnsafe.user.id;
            const response = await fetch(`/get-referral-link?telegramId=${telegramId}`);
            const data = await response.json();
            return data.inviteLink;
        } catch (error) {
            console.error('Ошибка при получении реферальной ссылки:', error);
            return null;
        }
    }

    // Функция для шаринга ссылки через Telegram
    async function handleShareLink() {
        const referralLink = await getReferralLink();
        if (referralLink) {
            const message = "Присоединяйся к DurovJump вместе со мной! 🎮";
            const shareUrl = `https://t.me/share/url?text=${encodeURIComponent(message)}&url=${encodeURIComponent(referralLink)}`;
            
            if (window.Telegram && window.Telegram.WebApp) {
                Telegram.WebApp.openTelegramLink(shareUrl);
            } else {
                window.open(shareUrl, "_blank");
            }
        }
    }

    // Функция для получения списка приглашенных друзей
    async function getReferredFriends() {
        try {
            const telegramId = window.Telegram.WebApp.initDataUnsafe.user.id;
            const response = await fetch(`/get-referred-friends?telegramId=${telegramId}`);
            const data = await response.json();
            return data.referredFriends;
        } catch (error) {
            console.error('Ошибка при получении списка друзей:', error);
            return [];
        }
    }

    // Функция для отображения списка друзей
    function displayFriends(friends) {
        friendsList.innerHTML = ''; // Очищаем текущий список

        if (friends.length === 0) {
            friendsList.innerHTML = `
                <div class="bg-white rounded-lg p-4 text-center text-gray-500" 
                     style="font-family: 'Permanent Marker', cursive;">
                    У вас пока нет приглашённых друзей
                </div>`;
            return;
        }

        friends.forEach(friend => {
            const friendElement = document.createElement('div');
            friendElement.className = 'bg-white rounded-lg p-4 flex items-center justify-between';
            friendElement.innerHTML = `
                <div class="flex items-center">
                    <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span class="text-2xl">👤</span>
                    </div>
                    <span class="ml-4 font-medium" style="font-family: 'Permanent Marker', cursive;">
                        ${friend.username || 'Пользователь'}
                    </span>
                </div>
            `;
            friendsList.appendChild(friendElement);
        });
    }

    // Обработчик клика по кнопке приглашения
    if (inviteButton) {
        inviteButton.addEventListener('click', handleShareLink);
    }

    // Обновляем список друзей при загрузке страницы
    async function updateFriendsList() {
        const friends = await getReferredFriends();
        displayFriends(friends);
    }

    // Инициализация при загрузке страницы
    updateFriendsList();
});