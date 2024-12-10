class DoodleGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Вычисляем доступную высоту (вычитаем высоту футера)
        const footerHeight = 76; // Высота футера с паддингами
        this.width = window.innerWidth;
        this.height = window.innerHeight - footerHeight; // Вычитаем высоту футера
        
        // Устанавливаем размеры canvas с учетом футера
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Масштабируем размеры объектов относительно ширины экрана
        const scaleFactor = this.width / 400; // 400 - базовая ширина для расчета
        
        // Обновляем размеры и параметры с учетом масштаба
        this.DOODLER_WIDTH = 60 * scaleFactor;
        this.DOODLER_HEIGHT = 60 * scaleFactor;
        this.platformWidth = 85 * scaleFactor;
        this.platformHeight = 25 * scaleFactor;
        this.GRAVITY = 0.6 * scaleFactor;
        this.JUMP_FORCE = -15 * scaleFactor;
        this.MOVE_SPEED = 9 * scaleFactor;
        this.PLATFORM_GAP = 60 * scaleFactor;
        
        // Остальной существующий код конструктора остается без изменений
        this.isGameOver = false;
        this.gameStarted = false;
        this.score = 0;
        this.imagesLoaded = 0;
        this.totalImages = 14; // Всего 14 изображений: дудлик, платформа, лед, пружинка, пружинка активная, самолётик, дудлик на самолётике, монстр, фон, фейковая платформа, разрушенная левая часть фейковой платформы, разрушенная правая часть фейковой платформы, черная дыра
        
        // Базовые параметры
        this.SPRING_CHANCE = 0.1;
        this.SPRING_FORCE = this.JUMP_FORCE * 2;
        
        // Параметры платформ
        this.MIN_PLATFORMS = 16;  // Увеличиваем с 12 до 16
        
        // Параетры для движущихся платформ
        this.MOVING_PLATFORM_CHANCE = 0.4; // 40% шанс что ледяная платформа будет двигаться
        this.PLATFORM_SPEED = 2; // Скорость движения платформ
        this.PLATFORM_RANGE = 100; // Дистанция движения в каждую сторону
        
        // Параметры для самолётика
        this.PLANE_CHANCE = 0.01; // 5% шанс появления самолётика
        this.PLANE_FLIGHT_DURATION = 4000; // 4 секунды полёта
        this.PLANE_SPEED = -20; // Скорость полёта вверх
        
        // Добавим фиксированные размеры для дудлика
        this.DOODLER_WIDTH = 60;
        this.DOODLER_HEIGHT = 60;
        
        // Параметры для разрушающейся платформы
        this.FAKE_PLATFORM_CHANCE = 0.1; // 10% шанс появления
        this.BREAK_ANIMATION_DURATION = 300; // 300мс на анимацию разрушения
        
        // В конструкторе добавим размеры пружинки
        this.SPRING_WIDTH = 30;
        this.SPRING_HEIGHT = 30;
        this.SPRING_OFFSET = 10; // Отступ от края платформы
        
        // В конструкторе добавим размры для самолёика
        this.PLANE_WIDTH = 40;
        this.PLANE_HEIGHT = 40;
        this.PLANE_OFFSET = 10; // Отступ от края платформы
        
        // В конструкторе добавим размеры черной дыры
        this.BLACK_HOLE_CHANCE = 0.001; // 5% шанс появления черной дыры
        this.BLACK_HOLE_WIDTH = 50;
        this.BLACK_HOLE_HEIGHT = 50;
        
        // Добавляем новые параметры для анимации засасывания
        this.BLACK_HOLE_ANIMATION_DURATION = 1000;
        this.isBeingAbsorbed = false;
        this.absorbStartTime = 0;
        this.absorbPosition = { x: 0, y: 0 };
        
        // Добавляем инициализацию объекта keys
        this.keys = {
            left: false,
            right: false
        };
        
        // Загрузка изображений
        this.loadImages();
        
        // Привязываем методы к контексту
        this.gameLoop = this.gameLoop.bind(this);
        this.update = this.update.bind(this);
        this.draw = this.draw.bind(this);
        
        // Добавляем вызов метода установки обраотчиов событий
        this.setupEventListeners();
        
        // Параметры монстра
        this.MONSTER_WIDTH = 50;
        this.MONSTER_HEIGHT = 50;
        this.MONSTER_SPEED = 2;
        this.MONSTER_RANGE = 100; // Дистанция движения
        this.MONSTER_SPAWN_CHANCE = 0.01; // 5% шанс появления монстра
        
        // Уменьшенные шансы появления специальных элементов
        this.ICE_PLATFORM_CHANCE = 0.1;     // Оставляем как есть
        this.SPRING_CHANCE = 0.1;           // Уменьшаем с 0.2 до 0.1
        this.PLANE_CHANCE = 0.01;           // Уменьшаем с 0.08 до 0.05
        this.FAKE_PLATFORM_CHANCE = 0.1;    // Оставляем как есть
        this.MONSTER_SPAWN_CHANCE = 0.01;   // Уменьшаем с 0.08 до 0.05
        this.blackHoleTimeout = null; // Добавляем переменную для храненя таймера
        
        // Сразу инициализируем игру при создании
        this.initializeGame();
        
        this.bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
        document.getElementById('bestScoreStart').textContent = this.bestScore;
        
        // Инициализируем переменные для управления движением
        this.gyroEnabled = false;
        this.gyroSensitivity = 15;
        
        // Инициализируем Telegram WebApp
        this.tg = window.Telegram.WebApp;
        
        // Проверяем поддержку и включаем управление движением
        if (this.tg && this.tg.isVersionAtLeast('6.1')) {
            this.initMotionControls();
        }
    }
    
    initMotionControls() {
        try {
            // Включаем отслеживание движения
            this.tg.enableClosingConfirmation();
            this.tg.expand();
            
            // Запрашиваем доступ к датчикам движения
            this.tg.DeviceMotion.track(true);
            
            // Подписываемся на события движения
            window.addEventListener('devicemotion', (event) => {
                if (!this.gameStarted || this.isGameOver) return;
                
                // Получаем ускорение по оси X
                const acceleration = event.accelerationIncludingGravity.x;
                
                if (acceleration) {
                    // Применяем движение на основе ускорения
                    const moveX = -acceleration * this.gyroSensitivity;
                    this.doodler.x += moveX;
                    
                    // Ограничиваем движение по краям экрана
                    if (this.doodler.x < 0) this.doodler.x = 0;
                    if (this.doodler.x > this.width - this.doodler.width) {
                        this.doodler.x = this.width - this.doodler.width;
                    }
                }
            });

            this.gyroEnabled = true;
            console.log('Управление движением активировано');
        } catch (error) {
            console.error('Ошибка при инициализации управления движением:', error);
            this.gyroEnabled = false;
        }
    }
    
    initializeGame() {
        // Создаем платформы
        this.platforms = [];
        const startY = this.height * 0.7;
        this.platforms.push(this.createPlatform(startY));
        
        for (let i = 1; i < this.MIN_PLATFORMS; i++) {
            this.platforms.push(this.createPlatform(startY - i * (this.height / (this.MIN_PLATFORMS - 2))));
        }
        
        // Инициализируем дудлика
        const startPlatform = this.platforms[0];
        this.doodler = {
            x: startPlatform.x + (this.platformWidth / 2) - (this.DOODLER_WIDTH / 2),
            y: startPlatform.y - this.DOODLER_HEIGHT,
            width: this.DOODLER_WIDTH,
            height: this.DOODLER_HEIGHT,
            speedX: 0,
            speedY: 0,
            gravity: this.GRAVITY,
            jumpForce: this.JUMP_FORCE,
            isFlying: false,
            flyingStartTime: 0
        };
        
        // Сбрасываем дополнительные состояния
        this.isBeingAbsorbed = false;
        this.absorbStartTime = 0;
        this.absorbPosition = { x: 0, y: 0 };
        
        // Запускаем отрисовку, но без обновления физики
        this.gameStarted = false;
        this.isGameOver = false;
        this.draw();
    }
    
    loadImages() {
        const loadImage = (src) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    this.imagesLoaded++;
                    resolve(img);
                };
                img.src = src;
            });
        };

        Promise.all([
            loadImage('duriv.png').then(img => this.doodlerImg = img),
            loadImage('greenplatform.png').then(img => this.platformImg = img),
            loadImage('blueplatform.png').then(img => this.icePlatformImg = img),
            loadImage('pruzhinka_2pruzhinka.png').then(img => this.springImg = img),
            loadImage('pruzhinka_1pruzhinka.png').then(img => this.springActiveImg = img),
            loadImage('samoletik.png').then(img => this.planeImg = img),
            loadImage('DurovSamoletik.png').then(img => this.doodlerPlaneImg = img),
            loadImage('monstr2.png').then(img => this.monsterImg = img),
            loadImage('background.png').then(img => this.backgroundImg = img),
            loadImage('right.png').then(img => this.fakePlatformLeftImg = img),
            loadImage('left.png').then(img => this.fakePlatformRightImg = img),
            loadImage('leftfake.png').then(img => this.brokenPlatformLeftImg = img),
            loadImage('rightfake.png').then(img => this.brokenPlatformRightImg = img),
            loadImage('blackHole.png').then(img => this.blackHoleImg = img)
        ]).then(() => {
            console.log('Все изображения загружены');
            document.getElementById('startBtn').disabled = false;
        }).catch(error => {
            console.error('Ошибка загрузки изображений:', error);
        });
    }
    
    start() {
        if (this.imagesLoaded < this.totalImages) {
            console.log(`Загружено ${this.imagesLoaded} ��з ${this.totalImages} изображений`);
            return;
        }
        
        // Очищаем предыдущие состояния
        if (this.blackHoleTimeout) {
            clearTimeout(this.blackHoleTimeout);
            this.blackHoleTimeout = null;
        }
        
        cancelAnimationFrame(this.animationFrame);
        
        // Скрываем экран окончания игры
        document.getElementById('gameOver').classList.add('hidden');
        
        // Сбрасываем состояние игры
        this.initializeGame();
        
        // Запускам игру
        this.gameStarted = true;
        this.isGameOver = false;
        this.score = 0;
        
        // Даём начальный импульс
        this.doodler.speedY = this.JUMP_FORCE;
        
        // Плавно скрываем стартовый экран
        document.getElementById('startScreen').style.opacity = '0';
        document.getElementById('startScreen').style.pointerEvents = 'none';
        
        // Запускаем игровой цикл
        this.gameLoop();
    }
    
    gameLoop() {
        // Сохраняем ссылку на текущий кадр анимации
        this.animationFrame = requestAnimationFrame(this.gameLoop);
        
        if (this.isGameOver) {
            if (this.doodler.y <= this.height) {
                this.update();
                this.draw();
            } else {
                cancelAnimationFrame(this.animationFrame);
            }
            return;
        }
        
        this.update();
        this.draw();
    }
    
    update() {
        if (this.isGameOver) {
            // Продолжаем падение дудлика даже после gameOver
            this.doodler.y += this.doodler.speedY;
            this.doodler.speedY += this.GRAVITY;
            
            // Проверяем, упал ли дудлик за пределы экрана
            if (this.doodler.y > this.height) {
                // Сохраняем текущий счет перед вызовом handleGameOver
                const finalScore = this.score;
                
                // Вызываем handleGameOver с сохраненным счетом
                this.handleGameOver(finalScore);
                return;
            }
            
            // Продолжаем анимацию падения
            this.draw();
            return;
        }
        
        // Проверяем состояние полёта и засасывания
        if (this.isBeingAbsorbed) {
            // Останавливаем все движения дудлика при з��сасывании
            this.doodler.speedY = 0;
            this.doodler.speedX = 0;
            return; // Прерыаем дальнейшее обновление физики
        }
        
        // Проверяем состояние полёта
        if (this.doodler.isFlying) {
            const flyingTime = Date.now() - this.doodler.flyingStartTime;
            if (flyingTime > this.PLANE_FLIGHT_DURATION) {
                this.doodler.isFlying = false;
            } else {
                this.doodler.speedY = this.PLANE_SPEED;
            }
        }
        
        // Обовление позиции дудлика
        this.doodler.speedY += this.doodler.gravity;
        this.doodler.y += this.doodler.speedY;
        
        // Увеличим скорость горизонтального движения
        if (this.keys.left) this.doodler.x -= this.MOVE_SPEED;
        if (this.keys.right) this.doodler.x += this.MOVE_SPEED;
        
        // Проверка границ
        if (this.doodler.x < 0) this.doodler.x = 0;
        if (this.doodler.x > this.width - this.doodler.width) {
            this.doodler.x = this.width - this.doodler.width;
        }
        
        // Проверка столкновений с платформам
        this.platforms.forEach(platform => {
            const isLanding = this.doodler.speedY > 0 && 
                this.doodler.x + this.doodler.width > platform.x &&
                this.doodler.x < platform.x + this.platformWidth &&
                this.doodler.y + this.doodler.height > platform.y &&
                this.doodler.y + this.doodler.height < platform.y + this.platformHeight;
            
            // Проверяем наступание сверху
            const isSteppingOn = this.doodler.speedY >= 0 && 
                this.doodler.y + this.doodler.height >= platform.y &&
                this.doodler.y + this.doodler.height <= platform.y + this.platformHeight &&
                this.doodler.x + this.doodler.width > platform.x &&
                this.doodler.x < platform.x + this.platformWidth;
            
            // Добавляем проверку столкновения с самолётиком независимо от приземления
            if (platform.plane && !platform.plane.collected) {
                const planeX = platform.plane.side === 'left' ? 
                    platform.x + this.PLANE_OFFSET : 
                    platform.x + this.platformWidth - this.PLANE_WIDTH - this.PLANE_OFFSET;
                    
                // Проверка столкновения с самолётиком (в любой момент)
                const hitPlane = 
                    this.doodler.x + this.doodler.width > planeX &&
                    this.doodler.x < planeX + this.PLANE_WIDTH &&
                    this.doodler.y + this.doodler.height > platform.y - this.PLANE_HEIGHT + 15 &&
                    this.doodler.y < platform.y + this.PLANE_HEIGHT;
                    
                if (hitPlane && !platform.plane.collected) {
                    platform.plane.collected = true;
                    this.doodler.isFlying = true;
                    this.doodler.flyingStartTime = Date.now();
                    this.doodler.speedY = this.PLANE_SPEED;

                    // Увеличиваем счётчик собраннх самолётиков с ограничением в 10
                    const currentCollected = parseInt(localStorage.getItem('planesCollectedProgress') || '0');
                    // Используем Math.min чтобы значение не превышало 10
                    const newCollected = Math.min(currentCollected + 1, 10);
                    localStorage.setItem('planesCollectedProgress', newCollected.toString());
                    
                    // Отправляем событие для обновления прогресса в задаче
                    const event = new Event('planeProgressUpdated');
                    window.dispatchEvent(event);

                    // Можно добавить всплывающее уведомление о сборе самолётика
                    console.log(`Собрано самолётиков: ${newCollected}/10`);
                }
            }
            
            // Проверка для фейковой платформы
            if ((isLanding || isSteppingOn) && platform.isFake && !platform.breaking) {
                platform.breaking = true;
                platform.breakStartTime = Date.now();
                
                // Увеличиваем счётчик сломанных платформ
                const currentBroken = parseInt(localStorage.getItem('platformsBrokenProgress') || '0');
                const newBroken = Math.min(currentBroken + 1, 6); // Ограничиваем максимальное значение
                localStorage.setItem('platformsBrokenProgress', newBroken.toString());
                
                // Отправляем событие для обновления прогресса в задаче
                const event = new Event('platformBrokenUpdated');
                window.dispatchEvent(event);
                
                return;
            }
            
            if (isLanding) {
                if (platform.spring) {
                    const springX = platform.spring.side === 'left' ? 
                        platform.x + this.SPRING_OFFSET : 
                        platform.x + this.platformWidth - this.SPRING_WIDTH - this.SPRING_OFFSET;
                        
                    const hitSpring = 
                        this.doodler.x + this.doodler.width > springX &&
                        this.doodler.x < springX + this.SPRING_WIDTH;
                        
                    if (hitSpring) {
                        platform.spring.active = true;
                        platform.spring.activationTime = Date.now();
                        this.doodler.speedY = this.SPRING_FORCE;

                        // Увеличиваем счётчик использованных пружинок
                        const currentSprings = parseInt(localStorage.getItem('springsUsedProgress') || '0');
                        const newSprings = Math.min(currentSprings + 1, 25); // Ограничиваем максимальное значение
                        localStorage.setItem('springsUsedProgress', newSprings.toString());
                        
                        // Отправляем событие для обновления прогресса в задаче
                        const event = new Event('springProgressUpdated');
                        window.dispatchEvent(event);

                        console.log(`Использовано пружинок: ${newSprings}/25`);
                    }
                } else if (!this.doodler.isFlying && !platform.isFake) {
                    this.doodler.speedY = this.JUMP_FORCE;
                }
            }
        });
        
        // Обновлени состояния пружинок
        this.platforms.forEach(platform => {
            if (platform.spring && platform.spring.active) {
                // Дективируем пружинку через 300мс
                if (Date.now() - platform.spring.activationTime > 300) {
                    platform.spring.active = false;
                }
            }
        });
        
        // Движение платформ вниз
        if (this.doodler.y < this.height / 2) {
            this.doodler.y = this.height / 2;
            this.platforms.forEach(platform => {
                platform.y += Math.abs(this.doodler.speedY);
                this.score++;
            });
        }
        
        // Удаление платформ внизу и создание новых сверху
        this.platforms = this.platforms.filter(platform => platform.y < this.height);
        
        // Обновление движущихся платформ
        this.platforms.forEach(platform => {
            if (platform.moving) {
                // Движение платформы
                platform.x += platform.speed * platform.direction;
                
                // роверка границ движения
                if (platform.x > platform.startX + this.PLATFORM_RANGE) {
                    platform.direction = -1;
                } else if (platform.x < platform.startX - this.PLATFORM_RANGE) {
                    platform.direction = 1;
                }
                
                // Проверка границ экрана
                if (platform.x < 0) {
                    platform.x = 0;
                    platform.direction = 1;
                } else if (platform.x > this.width - this.platformWidth) {
                    platform.x = this.width - this.platformWidth;
                    platform.direction = -1;
                }
            }
        });
        
        // При создании новых платформ
        while (this.platforms.length < this.MIN_PLATFORMS) {
            this.platforms.push(this.createPlatform(Math.min(...this.platforms.map(p => p.y)) - this.PLATFORM_GAP));
        }
        
        // Обновление позици дудлика относительно движущейся платформы
        this.platforms.forEach(platform => {
            if (platform.moving && 
                this.doodler.speedY > 0 && 
                this.doodler.x + this.doodler.width > platform.x &&
                this.doodler.x < platform.x + this.platformWidth &&
                this.doodler.y + this.doodler.height > platform.y &&
                this.doodler.y + this.doodler.height < platform.y + this.platformHeight) {
                // Двигаем удлика вместе с платформой
                this.doodler.x += platform.speed * platform.direction;
            }
        });
        
        // Обновление мостров
        this.platforms.forEach(platform => {
            if (platform.monster) {
                // Движение монстра
                platform.monster.x += this.MONSTER_SPEED * platform.monster.direction;
                
                // Смена направления
                if (platform.monster.x > platform.monster.startX + this.MONSTER_RANGE) {
                    platform.monster.direction = -1;
                } else if (platform.monster.x < platform.monster.startX - this.MONSTER_RANGE) {
                    platform.monster.direction = 1;
                }
                
                // Проверка столкновения с монстром
                if (!this.isGameOver &&
                    this.doodler.x + this.doodler.width > platform.monster.x &&
                    this.doodler.x < platform.monster.x + this.MONSTER_WIDTH &&
                    this.doodler.y + this.doodler.height > platform.y - this.MONSTER_HEIGHT &&
                    this.doodler.y < platform.y) {
                    // При столкновении с онстром
                    this.isGameOver = true;
                    this.doodler.speedY = 5; // Начальная скорость падения
                }
            }
        });
        
        // Обновляем проверку столкновения с черной дырой
        this.platforms.forEach(platform => {
            if (platform.blackHole && !this.isBeingAbsorbed) {
                const hitBlackHole = 
                    this.doodler.x + this.doodler.width > platform.blackHole.x &&
                    this.doodler.x < platform.blackHole.x + this.BLACK_HOLE_WIDTH &&
                    this.doodler.y + this.doodler.height > platform.y - this.BLACK_HOLE_HEIGHT &&
                    this.doodler.y < platform.y;
                    
                if (hitBlackHole && !this.isGameOver) {
                    this.isBeingAbsorbed = true;
                    this.absorbStartTime = Date.now();
                    this.absorbPosition = {
                        x: platform.blackHole.x + this.BLACK_HOLE_WIDTH / 2,
                        y: platform.y - this.BLACK_HOLE_HEIGHT / 2
                    };
                    
                    // Останавливаем движение дудлика
                    this.doodler.speedY = 0;
                    this.doodler.speedX = 0;
                    
                    // Сохраняем таймер для возможности его очистки
                    this.blackHoleTimeout = setTimeout(() => {
                        this.isGameOver = true;
                        document.getElementById('gameOver').classList.remove('hidden');
                    }, this.BLACK_HOLE_ANIMATION_DURATION);
                }
            }
        });
        
        // Проверка на выпадение за нижнюю границу
        if (this.doodler.y > this.height) {
            // Сохраняем текущий счет перед установкой gameOver
            const finalScore = this.score;
            this.isGameOver = true;
            this.handleGameOver(finalScore);
        }
    }

    draw() {
        if (!this.gameStarted) return;
        
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Отрисовка фона
        if (this.backgroundImg && this.backgroundImg.complete) {
            this.ctx.drawImage(this.backgroundImg, 0, 0, this.width, this.height);
        }
        
        // Отрисовка черных дыр (добавим перед отрисовкой дудлика для правильного слоя)
        this.platforms.forEach(platform => {
            if (platform.blackHole && this.blackHoleImg && this.blackHoleImg.complete) {
                // Отрисовка черной дыры над плтформой
                this.ctx.drawImage(
                    this.blackHoleImg,
                    platform.blackHole.x,
                    platform.y - this.BLACK_HOLE_HEIGHT,
                    this.BLACK_HOLE_WIDTH,
                    this.BLACK_HOLE_HEIGHT
                );
            }
        });
        
        // Отрисовка платформ и пружинок
        this.platforms.forEach(platform => {
            try {
                // Не рисуем обычную платформу, если на ней есть черная дыра
                if (!platform.blackHole) {
                    if (platform.isFake) {
                        // Рисуем фейковую платформу
                        const halfWidth = this.platformWidth / 2;
                        
                        if (!platform.breaking) {
                            // Целая фейковая платформа
                            if (this.fakePlatformLeftImg && this.fakePlatformRightImg) {
                                this.ctx.drawImage(this.fakePlatformLeftImg, 
                                    platform.x, platform.y, 
                                    halfWidth, this.platformHeight);
                                this.ctx.drawImage(this.fakePlatformRightImg, 
                                    platform.x + halfWidth, platform.y, 
                                    halfWidth, this.platformHeight);
                            }
                        } else {
                            // Анимация разрушения
                            const timeSinceBreak = Date.now() - platform.breakStartTime;
                            if (timeSinceBreak < this.BREAK_ANIMATION_DURATION) {
                                const offset = (timeSinceBreak / this.BREAK_ANIMATION_DURATION) * 20;
                                
                                if (this.brokenPlatformLeftImg && this.brokenPlatformRightImg) {
                                    // Левая часть падает влево и вниз
                                    this.ctx.drawImage(this.brokenPlatformLeftImg,
                                        platform.x - offset, platform.y + offset,
                                        halfWidth, this.platformHeight);
                                    
                                    // Правая часть падает вправо и вниз
                                    this.ctx.drawImage(this.brokenPlatformRightImg,
                                        platform.x + halfWidth + offset, platform.y + offset,
                                        halfWidth, this.platformHeight);
                                }
                            }
                        }
                    } else {
                        // Рисуем обычную платформу
                        const platformImage = platform.type === 'ice' ? this.icePlatformImg : this.platformImg;
                        if (platformImage.complete) {
                            this.ctx.drawImage(platformImage, platform.x, platform.y, 
                                this.platformWidth, this.platformHeight);
                        }
                    }
                }
                
                // Рисуем пружинку если она есть
                if (platform.spring) {
                    const currentSpringImg = platform.spring.active ? this.springActiveImg : this.springImg;
                    
                    if (currentSpringImg.complete) {
                        // Отрисовываем пружинку с учётом её стороны
                        const springX = platform.spring.side === 'left' ? 
                            platform.x + this.SPRING_OFFSET : 
                            platform.x + this.platformWidth - this.SPRING_WIDTH - this.SPRING_OFFSET;
                            
                        this.ctx.drawImage(currentSpringImg, 
                            springX,
                            platform.y - this.SPRING_HEIGHT + 15, // Поднимаем немного выше платформы
                            this.SPRING_WIDTH,
                            this.SPRING_HEIGHT
                        );
                    }
                }
                
                // Рисуем самолётик если он есть и не собран
                if (platform.plane && !platform.plane.collected && this.planeImg.complete) {
                    const planeX = platform.plane.side === 'left' ? 
                        platform.x + this.PLANE_OFFSET : 
                        platform.x + this.platformWidth - this.PLANE_WIDTH - this.PLANE_OFFSET;
                        
                    this.ctx.drawImage(this.planeImg,
                        planeX,
                        platform.y - this.PLANE_HEIGHT + 15, // Поднимаем немного выше платформы
                        this.PLANE_WIDTH,
                        this.PLANE_HEIGHT
                    );
                }
            } catch (error) {
                console.error('Ошибка при отрисовке:', error);
            }
        });
        
        // Отрисовка монстров
        this.platforms.forEach(platform => {
            if (platform.monster && this.monsterImg.complete) {
                // Сохраняем контекст
                this.ctx.save();
                
                // Оражаем монстра в зависимости от направления
                if (platform.monster.direction < 0) {
                    this.ctx.scale(-1, 1);
                    this.ctx.drawImage(this.monsterImg,
                        -platform.monster.x - this.MONSTER_WIDTH,
                        platform.y - this.MONSTER_HEIGHT,
                        this.MONSTER_WIDTH,
                        this.MONSTER_HEIGHT
                    );
                } else {
                    this.ctx.drawImage(this.monsterImg,
                        platform.monster.x,
                        platform.y - this.MONSTER_HEIGHT,
                        this.MONSTER_WIDTH,
                        this.MONSTER_HEIGHT
                    );
                }
                
                // Восстанавливаем контекст
                this.ctx.restore();
            }
        });
        
        // Отрисовка дудлика
        if (this.isBeingAbsorbed) {
            const currentTime = Date.now();
            const animationProgress = (currentTime - this.absorbStartTime) / this.BLACK_HOLE_ANIMATION_DURATION;
            
            if (animationProgress <= 1) {
                const scale = 1 - animationProgress;
                const newWidth = this.DOODLER_WIDTH * scale;
                const newHeight = this.DOODLER_HEIGHT * scale;
                
                // Плавное движение к центру черной дыры
                const newX = this.doodler.x + (this.absorbPosition.x - (this.doodler.x + this.DOODLER_WIDTH/2)) * animationProgress;
                const newY = this.doodler.y + (this.absorbPosition.y - (this.doodler.y + this.DOODLER_HEIGHT/2)) * animationProgress;
                
                const currentDoodlerImg = this.doodler.isFlying ? this.doodlerPlaneImg : this.doodlerImg;
                if (currentDoodlerImg.complete) {
                    this.ctx.save();
                    this.ctx.translate(newX + newWidth/2, newY + newHeight/2);
                    this.ctx.rotate(animationProgress * Math.PI * 4);
                    this.ctx.drawImage(currentDoodlerImg,
                        -newWidth/2, -newHeight/2,
                        newWidth, newHeight
                    );
                    this.ctx.restore();
                }
            }
        }
        
        // Сохраняем оригинальную отрисовку дудлика
        if (!this.isBeingAbsorbed) {
            const currentDoodlerImg = this.doodler.isFlying ? this.doodlerPlaneImg : this.doodlerImg;
            if (currentDoodlerImg.complete) {
                this.ctx.save();
                if (this.keys.left) {
                    this.ctx.scale(-1, 1);
                    this.ctx.drawImage(currentDoodlerImg,
                        -this.doodler.x - this.DOODLER_WIDTH,
                        this.doodler.y,
                        this.DOODLER_WIDTH,
                        this.DOODLER_HEIGHT
                    );
                } else {
                    this.ctx.drawImage(currentDoodlerImg,
                        this.doodler.x,
                        this.doodler.y,
                        this.DOODLER_WIDTH,
                        this.DOODLER_HEIGHT
                    );
                }
                this.ctx.restore();
            }
        }
        
        // Отрисовка счета
        document.getElementById('score').textContent = this.score;
    }
    
    setupEventListeners() {
        // Обработчики клвиатуры
        document.addEventListener('keydown', (e) => {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                this.keys.left = true;
            }
            if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                this.keys.right = true;
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                this.keys.left = false;
            }
            if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                this.keys.right = false;
            }
        });

        // Обработчик движения мыши
        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.gameStarted || this.isGameOver) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            this.doodler.x = mouseX - this.doodler.width / 2;
            
            // Ограничение движения по краям
            if (this.doodler.x < 0) this.doodler.x = 0;
            if (this.doodler.x > this.width - this.doodler.width) {
                this.doodler.x = this.width - this.doodler.width;
            }
        });

        // Добавляем обработчики для тачскрина
        let touchStartX = 0;
        
        this.canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });

        this.canvas.addEventListener('touchmove', (e) => {
            // Если гироскоп активен и работает, игнорируем тачскрин
            if (this.gyroEnabled) return;
            
            e.preventDefault();
            if (!this.gameStarted || this.isGameOver) return;
            
            const touchX = e.touches[0].clientX;
            const deltaX = touchX - touchStartX;
            touchStartX = touchX;
            
            this.doodler.x += deltaX;
            
            if (this.doodler.x < 0) this.doodler.x = 0;
            if (this.doodler.x > this.width - this.doodler.width) {
                this.doodler.x = this.width - this.doodler.width;
            }
        }, { passive: false });
    }
    
    createPlatform(y) {
        const isIcePlatform = Math.random() < this.ICE_PLATFORM_CHANCE;
        const isMoving = isIcePlatform;
        const hasSpring = !isIcePlatform && Math.random() < this.SPRING_CHANCE;
        const hasPlane = !isIcePlatform && !hasSpring && Math.random() < this.PLANE_CHANCE;
        const hasMonster = !isIcePlatform && !hasSpring && !hasPlane && Math.random() < this.MONSTER_SPAWN_CHANCE;
        const hasBlackHole = !isIcePlatform && !hasSpring && !hasPlane && !hasMonster && Math.random() < this.BLACK_HOLE_CHANCE;
        const newX = Math.random() * (this.width - this.platformWidth);
        const isFakePlatform = !isIcePlatform && !hasSpring && !hasPlane && !hasMonster && Math.random() < this.FAKE_PLATFORM_CHANCE;
        
        return {
            x: newX,
            y: y,
            type: isIcePlatform ? 'ice' : 'normal',
            spring: hasSpring ? {
                active: false,
                activationTime: 0,
                side: Math.random() < 0.5 ? 'left' : 'right'
            } : null,
            plane: hasPlane ? {
                collected: false,
                side: Math.random() < 0.5 ? 'left' : 'right'
            } : null,
            monster: hasMonster ? {
                x: newX + this.platformWidth / 2,
                startX: newX + this.platformWidth / 2,
                direction: 1
            } : null,
            moving: isMoving,
            startX: newX,
            direction: 1,
            speed: this.PLATFORM_SPEED,
            isFake: isFakePlatform,
            breaking: false,
            breakStartTime: 0,
            blackHole: hasBlackHole ? {
                x: newX + (this.platformWidth - this.BLACK_HOLE_WIDTH) / 2,
                y: y - this.BLACK_HOLE_HEIGHT
            } : null
        };
    }

    handleGameOver(finalScore) {
        if (!this.isGameOver) return; // Предотвращаем повторный вызов

        // Используем переданный счет вместо this.score
        document.getElementById('finalScore').textContent = finalScore;
        
        // Обновляем лучший счет
        const currentBest = parseInt(localStorage.getItem('bestScore')) || 0;
        if (finalScore > currentBest) {
            localStorage.setItem('bestScore', finalScore.toString());
            document.getElementById('bestScore').textContent = finalScore;
        } else {
            document.getElementById('bestScore').textContent = currentBest;
        }

        // Добавляем очки в общий баланс
        window.addPoints(finalScore, 'game');
        
        // Обновляем прогресс игр
        const gamesPlayed = parseInt(localStorage.getItem('gamesPlayedProgress') || '0');
        localStorage.setItem('gamesPlayedProgress', Math.min(gamesPlayed + 1, 5).toString());
        
        // Создаем и отправляем событие обновления прогресса
        const event = new Event('gameProgressUpdated');
        window.dispatchEvent(event);

        document.getElementById('gameOver').classList.remove('hidden');
    }
}

// Инициализация игры
document.addEventListener('DOMContentLoaded', () => {
    const game = new DoodleGame();
    
    // Добавляем стили для плавного скрытия
    const startScreen = document.getElementById('startScreen');
    startScreen.style.transition = 'opacity 0.3s ease-out';
    
    document.getElementById('startBtn').addEventListener('click', () => {
        if (game.imagesLoaded === game.totalImages) {
            game.start();
        }
    });
    
    document.getElementById('restartBtn').addEventListener('click', () => {
        if (game.imagesLoaded === game.totalImages) {
            game.start();
        }
    });
});

// В конце файла добавляем слушатель события
window.addEventListener('platformBrokenUpdated', () => {
    const event = new Event('platformProgressUpdated');
    window.dispatchEvent(event);
});

window.addEventListener('springProgressUpdated', () => {
    const event = new Event('platformProgressUpdated');
    window.dispatchEvent(event);
});
