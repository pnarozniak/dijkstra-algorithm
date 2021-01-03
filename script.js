const Graph = {
  list: [],
  add: function (divId) {
    this.list.push({ divId: divId, connections: [] });
  },
  getHost: function (divId) {
    return this.list.find((host) => host.divId === divId);
  },
  addConnectionBetween: function (div1, div2) {
    const host1 = this.getHost(div1.id);
    const host2 = this.getHost(div2.id);

    if (
      host1.connections.some((connectedHost) => {
        return connectedHost.divId === div2.id;
      })
    ) {
      return false;
    }

    if (
      host2.connections.some((connectedHost) => {
        return connectedHost.divId === div1.id;
      })
    ) {
      return false;
    }

    host1.connections.push({
      divId: div2.id,
    });

    host2.connections.push({
      divId: div1.id,
    });
  },
  setConnectionValue: function (line, val) {
    const [div1Id, div2Id] = line.id.split('_');

    const host1 = this.getHost(div1Id);
    const host2 = this.getHost(div2Id);

    host1.connections.forEach((connectedHost) => {
      if (connectedHost.divId === div2Id) {
        connectedHost.value = parseInt(val);
      }
    });

    host2.connections.forEach((connectedHost) => {
      if (connectedHost.divId === div1Id) {
        connectedHost.value = parseInt(val);
      }
    });
  },
  removeConnection: function (line) {
    const [div1Id, div2Id] = line.id.split('_');
    const host1 = this.getHost(div1Id);
    const host2 = this.getHost(div2Id);

    host1.connections = host1.connections.filter((connectedHost) => {
      return connectedHost.divId != div2Id;
    });

    host2.connections = host2.connections.filter((connectedHost) => {
      return connectedHost.divId != div1Id;
    });
  },
  getConnections: function (hostId) {
    //todo
    const host = this.getHost(hostId);
    return host.connections;
  },
};

const editMode = {
  enabled: false,
  path: [],
};
let placing = {};

const floatingContainer = document.getElementById('floating-container');
const floatingContainerLineValue = document.getElementById(
  'floating-container-line-value'
);
const floatingContainerResult = document.getElementById(
  'floating-container-result'
);
const board = document.getElementById('board');
const circleTemplate = document.getElementById('circle-template');

const addHost = () => {
  floatingContainer.style.display = 'flex';
  document.getElementById('host-name').focus();
};

const hideFloatingContainer = () => {
  floatingContainer.style.display = 'none';
  floatingContainerLineValue.style.display = 'none';
  document.getElementById('host-name').value = '';
  document.getElementById('line-value').value = '';
};

const hostSubmit = () => {
  const val = document.getElementById('host-name').value;

  if (Graph.list.some((host) => host.divId === val)) {
    alert(`Host {${val}} juz istnieje`);
    return;
  }

  placing.isPlacing = true;
  placing.value = val;

  circleTemplate.innerText = placing.value;
  hideFloatingContainer();
  board.style.cursor = 'none';
  board.classList.add('board-transparent');
  circleTemplate.style.display = 'flex';
};

board.addEventListener('mousemove', (e) => {
  e.preventDefault();
  const mousePosition = {
    x: e.clientX,
    y: e.clientY,
  };

  circleTemplate.style.left = mousePosition.x - 27 + 'px';
  circleTemplate.style.top = mousePosition.y - 27 + 'px';
});

board.addEventListener('click', (e) => {
  e.preventDefault();

  if (placing.isPlacing) {
    const mousePosition = {
      x: e.clientX,
      y: e.clientY,
    };

    const divHost = document.createElement('div');
    divHost.classList.add('host-div');
    divHost.classList.add('flex-container');
    divHost.style.top = mousePosition.y - 27 + 'px';
    divHost.style.left = mousePosition.x - 27 + 'px';
    divHost.id = `${placing.value}`;

    divHost.innerHTML = `<span>${placing.value}</span>`;

    board.appendChild(divHost);
    placing = {};
    circleTemplate.style.display = 'none';
    board.style.cursor = 'default';
    board.classList.remove('board-transparent');
    Graph.add(divHost.id);

    let pos1 = 0;
    let pos2 = 0;
    let pos3 = 0;
    let pos4 = 0;

    const dragMouseDown = (e) => {
      let target = e.target;

      if (target.tagName.toString() === 'SPAN') {
        target = target.closest('div');
      }

      if (editMode.enabled === true) {
        const index = editMode.path.indexOf(target);
        if (index === -1) {
          if (editMode.path.length == 1) {
            createLineBetweenTwoDivs(editMode.path[0], target);

            editMode.path.forEach((div) => {
              div.classList.remove('host-div-selected');
            });
            editMode.path = [];
          } else {
            target.classList.add('host-div-selected');
            editMode.path.push(target);
          }
        } else {
          if (index === 0) {
            let removedDiv = editMode.path.shift();
            removedDiv.classList.remove('host-div-selected');
          } else if (index === 1) {
            let removedDiv = editMode.path.pop();
            removedDiv.classList.remove('host-div-selected');
          }
        }
      } else {
        if (Graph.getHost(target.id).connections.length > 0) {
          return;
        }

        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;

        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
      }
    };

    const elementDrag = (e) => {
      e = e || window.event;
      e.preventDefault();

      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;

      divHost.style.top = divHost.offsetTop - pos2 + 'px';
      divHost.style.left = divHost.offsetLeft - pos1 + 'px';
    };

    const closeDragElement = () => {
      document.onmouseup = null;
      document.onmousemove = null;
    };

    divHost.onmousedown = dragMouseDown;
  }
});

const editNodes = () => {
  const toggleHostCursor = (task) => {
    Graph.list.forEach((host) => {
      const div = document.getElementById(host.divId);
      if (task === 'add') {
        div.classList.add('host-div-edit-mode');
      } else {
        div.classList.remove('host-div-edit-mode');
      }
    });
  };

  const editNodes = document.getElementById('edit-nodes');
  if (editMode.enabled === false) {
    document.getElementById('add-button').style.display = 'none';
    document.getElementById('resolve').style.display = 'none';

    editNodes.value = 'X';
    editNodes.classList.add('cancel-edit');

    editMode.enabled = true;
    toggleHostCursor('add');
  } else {
    document.getElementById('add-button').style.display = 'block';
    document.getElementById('resolve').style.display = 'block';

    editNodes.value = 'Edytuj węzły';
    editNodes.classList.remove('cancel-edit');

    editMode.enabled = false;

    Graph.list.forEach((host) => {
      const div = document.getElementById(host.divId);
      div.classList.remove('host-div-selected');
      editMode.path = [];
    });

    toggleHostCursor('remove');
  }
};

const createLineBetweenTwoDivs = (div1, div2) => {
  if (Graph.addConnectionBetween(div1, div2) === false) {
    alert(`Wezel pomiedzy hostem ${div1.id}, ${div2.id} juz istnieje`);
    return;
  }

  const center1 = {
    x: parseInt(div1.style.left) + 27,
    y: parseInt(div1.style.top) + 27,
  };

  const center2 = {
    x: parseInt(div2.style.left) + 27,
    y: parseInt(div2.style.top) + 27,
  };

  const lineWidth = Math.round(
    Math.sqrt(
      Math.pow(center2.x - center1.x, 2) + Math.pow(center2.y - center1.y, 2)
    )
  );

  const line = document.createElement('div');
  line.id = `${div1.id}_${div2.id}`;
  line.classList.add('line');

  const leftDiv = center1.x < center2.x ? center1 : center2;
  const rightDiv = center1.x > center2.x ? center1 : center2;

  line.style.top = leftDiv.y + 'px';
  line.style.left = leftDiv.x + 'px';
  line.style.width = lineWidth + 'px';

  const x = Math.abs(center1.x - center2.x);
  const y = Math.abs(center1.y - center2.y);

  let goal = y / x;

  let deg = tanDegrees.indexOf(
    tanDegrees.reduce((prev, curr) =>
      Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev
    )
  );

  if (rightDiv.y < leftDiv.y && rightDiv.x > leftDiv.x) {
    deg *= -1;
  }
  line.style.transform = `rotate(${deg}deg)`;

  const span = document.createElement('span');
  span.onclick = (e) => {
    floatingContainerLineValue.style.display = 'flex';
    editMode.currLine = line;
  };
  span.classList.add('line-value');

  line.appendChild(span);

  board.appendChild(line);

  Graph.addConnectionBetween(div1, div2);
};

const tanDegrees = [];
for (let i = 0; i <= 360; i++) {
  tanDegrees.push(parseFloat(Math.tan(i * (Math.PI / 180)).toFixed(4)));
}

const lineValueSubmit = () => {
  const val = parseInt(document.getElementById('line-value').value);
  const span = editMode.currLine.querySelector('span');
  span.innerText = `${val}`;

  Graph.setConnectionValue(editMode.currLine, val);

  hideFloatingContainer();
};

const deleteLine = () => {
  hideFloatingContainer();
  Graph.removeConnection(editMode.currLine);
  editMode.currLine.parentNode.removeChild(editMode.currLine);
  editMode.currLine = null;
};

const hideResultContainer = () => {
  floatingContainerResult.style.display = 'none';
};

const showResultContainer = () => {
  const select = document.getElementById('start-host');
  select.innerHTML = '';
  Graph.list.forEach((host) => {
    const option = document.createElement('option');
    option.text = host.divId;
    select.add(option);
  });

  floatingContainerResult.style.display = 'flex';
  document.getElementById('result-form').style.display = 'flex';
  document.getElementById('result-table').style.display = 'none';
  document.getElementById('path-result-table').style.display = 'none';
};

const hideResultOptions = () => {
  document.getElementById('result-form').style.display = 'none';
  return (options = {
    startHost: document.getElementById('start-host').value,
    analyzeSort: document
      .getElementById('sort-toAnalyze')
      .value.replace('->', ''),
    newPath: document.getElementById('new-path').value,
  });
};

const showResultTable = () => {
  document.getElementById('result-table').style.display = 'block';
  document.getElementById('path-result-table').style.display = 'block';
};
