import html2pdf from 'html2pdf.js';

let exporting = false;

export async function exportResumePDF() {
  if (exporting) return;
  exporting = true;
  
  try {
    const original = document.querySelector('.wrapper');
    if (!original) {
      throw new Error('Wrapper element not found');
    }

    // Клонируем элемент
    const clone = original.cloneNode(true);
    clone.classList.add('force-mobile-view');

    // Удаляем кнопку скачивания в клоне
    const downloadBtn = clone.querySelector('.download-resume-btn');
    if (downloadBtn) {
      downloadBtn.remove();
    }

    // Создаем контейнер для клона и позиционируем его вне экрана
    const container = document.createElement('div');
    container.style.cssText = `
      position: absolute;
      left: -9999px;
      top: 0;
      width: 400px;
    `;
    container.appendChild(clone);
    document.body.appendChild(container);

    // Ждем, чтобы клон был добавлен в DOM
    await new Promise(resolve => setTimeout(resolve, 100));

    // Ждем загрузки изображений
    const images = clone.querySelectorAll('img');
    await Promise.all(Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }));

    // Опции для html2pdf
    const opt = {
      margin: 10,
      filename: 'resume.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 1.9,
        useCORS: true,
        logging: false,
        width: 400,
        windowWidth: 400
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      },
      pagebreak: { 
        mode: ['avoid-all', 'css', 'legacy'] 
      }
    };

    // Генерация PDF
    await html2pdf().set(opt).from(clone).save();

  } catch (error) {
    console.error('Export failed:', error);
    alert('Ошибка при генерации pdf, попробуйте ещё раз');
  } finally {
    // Удаляем контейнер с клоном
    const container = document.querySelector('div[style*="left: -9999px"]');
    if (container) {
      container.remove();
    }
    exporting = false;
  }
}