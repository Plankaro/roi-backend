// public/script.ts

(() => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  
    function init(): void {
      // inject hover-only CSS
      const style = document.createElement('style');
      style.textContent = `
        #shopify-whatsapp-launcher:hover {
          cursor: pointer;
        }
      `;
      document.head.appendChild(style);
  
      // build the floating button
      const btn = document.createElement('button');
      btn.id = 'shopify-whatsapp-launcher';
      Object.assign(btn.style, {
        position: 'fixed',
        bottom:  '20px',
        right:   '20px',
        width:   '60px',
        height:  '60px',
        padding: '0',
        border:  'none',
        borderRadius: '50%',
        boxShadow:     '0 2px 6px rgba(0,0,0,0.3)',
        backgroundColor: '#25D366',
        cursor: 'pointer',
        zIndex: '9999',
      });
  
      const img = document.createElement('img');
      img.src = 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg';
      img.alt = 'WhatsApp chat';
      Object.assign(img.style, {
        width:  '60%',
        height: '60%',
        objectFit: 'contain',
      });
      btn.appendChild(img);
      document.body.appendChild(btn);
  
      btn.addEventListener('click', () => {
        const shop     = window.location.host;
        const endpoint = 'https://2ccd-2401-4900-72c1-a6b1-8cc4-307-a4ac-6ed3.ngrok-free.app/go/whatsapp';
  
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = endpoint;
  
        const input = document.createElement('input');
        input.type  = 'hidden';
        input.name  = 'shop';
        input.value = shop;
        form.appendChild(input);
  
        document.body.appendChild(form);
        form.submit();
      });
    }
  })();
  