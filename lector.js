  let validCodes = new Set();
    let usedCodes = new Set(JSON.parse(localStorage.getItem('usedCodes') || '[]'));
    let qrScanner;

    function loadCodes() {
      const lines = document.getElementById('codeInput').value.split('\n').map(l => l.trim()).filter(l => l);
      validCodes = new Set(lines);
      document.getElementById('result').innerText = " Códigos cargados: " + validCodes.size;
      document.getElementById('result').className = 'ok';
    }

    function saveUsedCodes() {
      localStorage.setItem('usedCodes', JSON.stringify([...usedCodes]));
    }

    function clearUsedCodes() {
      if (confirm("¿Seguro que querés borrar los códigos escaneados?")) {
        localStorage.removeItem('usedCodes');
        usedCodes = new Set();
        document.getElementById('result').innerText = " Lista de códigos usados borrada.";
        document.getElementById('result').className = '';
      }
    }

    let lastScanned = null;
let lastScannedTime = 0;

function onScanSuccess(decodedText, decodedResult) {
  const now = Date.now();


  if (decodedText === lastScanned && (now - lastScannedTime) < 1500) {
    return;
  }

  lastScanned = decodedText;
  lastScannedTime = now;

  const resultEl = document.getElementById('result');

  if (validCodes.has(decodedText)) {
    if (usedCodes.has(decodedText)) {
      resultEl.innerText = `⚠ Código ${decodedText} ya fue usado`;
      resultEl.className = 'used';
    } else {
      resultEl.innerText = ` Entrada válida: ${decodedText}`;
      resultEl.className = 'ok';
      document.getElementById("success-sound").play();
      usedCodes.add(decodedText);
      saveUsedCodes();
    }
  } else {
    resultEl.innerText = ` Código inválido: ${decodedText}`;
    resultEl.className = 'invalid';
  }
}


    function startScanner() {
      qrScanner = new Html5Qrcode("reader");
      qrScanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        onScanSuccess,
        (errorMessage) => {
          console.warn("Escaneo fallido: ", errorMessage);
        }
      ).catch(err => {
        document.getElementById('result').innerText = " Error al iniciar la cámara: " + err;
        document.getElementById('result').className = 'invalid';
      });
    }

    function stopScanner() {
      if (qrScanner) {
        qrScanner.stop().then(() => {
          document.getElementById('result').innerText = "Escáner detenido.";
          document.getElementById('result').className = '';
        }).catch(err => {
          console.error("Error al detener el escáner: ", err);
        });
      }
    }