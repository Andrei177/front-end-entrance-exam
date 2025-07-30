document.addEventListener('DOMContentLoaded', () => {
    // Конфигурация для обрезки текста
    const ELLIPSIS_CONFIG = {
        'experience-time': 25,
        'most-recent-label': 11,
        'job-position': 23,
        'job-type': 20,
        'job-info__list-item': 150,
        'education-grid__item-period': 11,
        'education-tags__title': 17,
        'education-tags__list': 70,
        'education-form': 25,
        'section-title': 52,
        'contacts-email': 31,
    };

    function generateStorageKey(element) {
        // Собираем уникальный путь к элементу в DOM
        let path = [];
        let current = element;

        while (current && current !== document.body) {
            const selector = current.tagName.toLowerCase();
            const id = current.id ? `#${current.id}` : '';
            const classes = current.className && typeof current.className === 'string'
                ? `.${current.className.replace(/\s+/g, '.')}`
                : '';
            const nth = Array.from(current.parentNode.children).indexOf(current) + 1;

            path.unshift(`${selector}${id}${classes}:nth-child(${nth})`);
            current = current.parentNode;
        }

        return `resume-${path.join('>')}`;
    }

    function saveData(key, value) {
        localStorage.setItem(key, value);
    }

    function loadData(key) {
        return localStorage.getItem(key);
    }

    // Система обрезки текста
    function applyEllipsis(element) {
        const className = Array.from(element.classList)
            .find(cls => ELLIPSIS_CONFIG[cls]);

        if (!className) return;

        const maxLength = ELLIPSIS_CONFIG[className];
        const fullText = element.textContent.trim();

        if (fullText.length > maxLength) {
            element.setAttribute('data-full-text', fullText);
            element.textContent = fullText.substring(0, maxLength) + '...';
            element.classList.add('ellipsis-applied');
        }
    }

    function restoreFullText(element) {
        if (element.classList.contains('ellipsis-applied')) {
            const fullText = element.getAttribute('data-full-text');
            if (fullText) {
                element.textContent = fullText;
                element.classList.remove('ellipsis-applied');
            }
        }
    }

    function initEllipsis() {
        Object.keys(ELLIPSIS_CONFIG).forEach(className => {
            document.querySelectorAll(`.${className}`).forEach(el => {
                // Загружаем сохраненные данные перед применением обрезки
                const key = generateStorageKey(el);
                const savedData = loadData(key);
                if (savedData) {
                    el.textContent = savedData;
                }
                applyEllipsis(el);
            });
        });
    }

    // Система редактирования
    function createInputElement(element) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'editable-input';
        input.value = element.textContent.trim();

        const styles = window.getComputedStyle(element);
        input.style.fontSize = styles.fontSize;
        input.style.fontWeight = styles.fontWeight;
        input.style.color = styles.color;
        input.style.lineHeight = styles.lineHeight;

        return input;
    }

    function finishEditing(input, element, originalContent) {
        let newContent = input.value.trim();

        // Не позволяем сохранить пустое значение
        if (newContent === '') {
            newContent = originalContent;
        }

        input.classList.add('fade-out');

        setTimeout(() => {
            element.textContent = newContent;

            // Сохраняем данные
            const key = generateStorageKey(element);
            saveData(key, newContent);

            // Применяем обрезку текста если нужно
            applyEllipsis(element);
        }, 200);
    }

    function startEditing(element) {
        // Восстанавливаем полный текст перед редактированием
        restoreFullText(element);

        const originalContent = element.textContent.trim();
        const input = createInputElement(element);

        element.innerHTML = '';
        element.appendChild(input);
        input.focus();

        // Обработчики событий
        function handleBlur() {
            finishEditing(input, element, originalContent);
            cleanup();
        }

        function handleKeyDown(e) {
            if (e.key === 'Enter') {
                finishEditing(input, element, originalContent);
            }
        }

        function cleanup() {
            input.removeEventListener('blur', handleBlur);
            input.removeEventListener('keydown', handleKeyDown);
        }

        input.addEventListener('blur', handleBlur);
        input.addEventListener('keydown', handleKeyDown);

        // Защита от двойного клика на инпут
        input.addEventListener('dblclick', (e) => {
            e.stopPropagation();
        });
    }

    function setupEditableElements() {
        document.querySelectorAll('.editable').forEach(element => {
            // Обработчик двойного клика
            element.addEventListener('dblclick', (e) => {
                e.preventDefault();
                startEditing(element);
            });

            // Обработчик долгого нажатия (для тач экранов)
            let longPressTimer;

            element.addEventListener('touchstart', (e) => {
                if (e.touches.length === 1) {
                    longPressTimer = setTimeout(() => {
                        e.preventDefault();
                        startEditing(element);
                    }, 500);
                }
            });

            element.addEventListener('touchend', () => {
                clearTimeout(longPressTimer);
            });

            element.addEventListener('touchmove', () => {
                clearTimeout(longPressTimer);
            });
        });
    }

    // Инициализация
    setupEditableElements();
    initEllipsis();
});