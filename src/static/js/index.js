(function() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
  let mouseDown = false;
  let lastCtxCoords = { x: null, y: null };

  canvas.addEventListener('click', e => {
    let { x, y } = getMousePos(e);
    paintPixel(0, 0, 0, 1, x, y);
  });
  canvas.addEventListener('mouseout', e => {
    mouseDown = false;
  });

  canvas.addEventListener('mousedown', e => {
    if (e.which == 1) {
      lastCtxCoords = getMousePos(e);
      mouseDown = true;
      ctx.moveTo(lastCtxCoords.x, lastCtxCoords.y);
    }
  });
  canvas.addEventListener('mouseup', () => {
    mouseDown = false;
  });

  canvas.addEventListener('mousemove', e => {
    if (mouseDown) {
      let { x, y } = getMousePos(e);
      connection.send(
        JSON.stringify({
          x1: lastCtxCoords.x,
          y1: lastCtxCoords.y,
          x2: x,
          y2: y
        })
      );
      lastCtxCoords = { x, y };
    }
  });

  function getMousePos(evt) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }

  function paintPixel(r, g, b, a, x, y) {
    ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
    ctx.fillRect(x, y, 1, 1);
  }

  function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  window.WebSocket = window.WebSocket || window.MozWebSocket;

  const connection = new WebSocket('ws://ozeman.eu:1338');

  connection.onopen = e => {
    console.log(e);
  };

  function parseAndDrawLine(data) {
    let line = JSON.parse(data);
    let { x1, y1, x2, y2 } = line;
    drawLine(x1, y1, x2, y2);
  }

  connection.onerror = error => {};

  connection.onmessage = message => {
    const json = JSON.parse(message.data);
    if (json.type === 'init' && json.id) {
      json.data.forEach(line => {
        parseAndDrawLine(line);
      });
    } else if (json.type === 'line' && json.data) {
      parseAndDrawLine(json.data);
    }
  };
  window.addEventListener('beforeunload', e => {
    websocket.onclose = () => {};
    websocket.close();
  });
})();
