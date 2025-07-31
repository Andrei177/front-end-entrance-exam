export function setupWaveEffect() {

    function createWaveEffect(event, element) {
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const wave = document.createElement('span');
        wave.className = 'wave-effect';

        wave.style.width = `${size}px`;
        wave.style.height = `${size}px`;
        wave.style.position = 'absolute';
        wave.style.left = `${event.clientX - rect.left - size / 2}px`;
        wave.style.top = `${event.clientY - rect.top - size / 2}px`;

        element.appendChild(wave);

        wave.addEventListener('animationend', () => {
            wave.remove();
        });
    }


    function getWaveTarget(element) {
        const waveSelector = '.back-section, .experience__list-item, .tools-block, .education-grid__item, .interests__list-item, .download-resume-btn, .tools-block-title, .welcome-info__photo';
        while (element && element !== document.body) {
            if (element.matches(waveSelector)) {
                return element;
            }
            element = element.parentElement;
        }
        return null;
    }

    document.body.addEventListener('click', (e) => {
        const waveTarget = getWaveTarget(e.target);
        if (waveTarget) {
            createWaveEffect(e, waveTarget);
        }
    });
}
