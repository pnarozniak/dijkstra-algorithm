const resolve = () => {
  const options = hideResultOptions();
  sortGraphList(options);

  const algorythmResult = solveAlgorythm(options);

  createRsTable(algorythmResult);
  showResultTable();
};

const sortGraphList = ({ startHost }) => {
  const sHost = Graph.getHost(startHost);

  Graph.list = Graph.list.filter((host) => host.divId !== startHost);
  Graph.list.unshift(sHost);
};

const createRsTable = (algorythmResult) => {
  const hostsIds = Graph.list.map((host) => host.divId);

  const resultTable = document.getElementById('result-table');
  resultTable.innerHTML = '';

  const thead = resultTable.createTHead();
  const headRow = thead.insertRow(0);

  const lp = headRow.insertCell(0);
  lp.innerHTML = `<span>L.P.</span>`;

  const doAnalizy = headRow.insertCell(1);
  doAnalizy.innerHTML = `<span>Do Analizy</span>`;

  const biezace = headRow.insertCell(2);
  biezace.innerHTML = `<span>Biezace</span>`;

  for (let i = 0; i < hostsIds.length; i++) {
    const cell = headRow.insertCell(i + 3);
    cell.innerHTML = `<span>${hostsIds[i]}</span>`;
  }

  const tbody = resultTable.createTBody();

  for (let i = 0; i < algorythmResult.distance.length; i++) {
    const bodyRow = tbody.insertRow(i);
    const { toAnalize, current, data } = algorythmResult.distance[i];

    const lp = bodyRow.insertCell(0);
    lp.innerHTML = `<span>${i + 1}</span>`;

    const doAnalizy = bodyRow.insertCell(1);
    doAnalizy.innerHTML = `<span>${
      toAnalize.length === 0 ? '-' : toAnalize.map((elem) => elem.id).join(' ')
    }</span>`;

    const biezace = bodyRow.insertCell(2);
    biezace.innerHTML = `<span>${current}</span>`;

    data.forEach((v, index) => {
      const val = bodyRow.insertCell(index + 3);
      val.innerHTML = `<span>${v}</span>`;
    });
  }

  const pathResultTable = document.getElementById('path-result-table');
  pathResultTable.innerHTML = '';

  const pathThead = pathResultTable.createTHead();
  const pathHeadRow = pathThead.insertRow(0);

  const lpPath = pathHeadRow.insertCell(0);
  lpPath.innerHTML = `<span>L.P.</span>`;

  for (let i = 1; i < hostsIds.length; i++) {
    const cell = pathHeadRow.insertCell(i);
    cell.innerHTML = `<span>${hostsIds[i]}</span>`;
  }

  const pathTbody = pathResultTable.createTBody();
  for (let i = 0; i < algorythmResult.path.length; i++) {
    const bodyRow = pathTbody.insertRow(i);
    const { data } = algorythmResult.path[i];

    const lp = bodyRow.insertCell(0);
    lp.innerHTML = `<span>${i + 1}</span>`;

    data.forEach((v, index) => {
      if (index != 0) {
        const val = bodyRow.insertCell(index);
        val.innerHTML = `<span>${v}</span>`;
      }
    });
  }
};

const solveAlgorythm = (options) => {
  const result = {
    distance: [],
    path: [],
  };

  const checkedConnections = {
    list: [],
    contains: function (id1, id2) {
      return this.list.some(
        (obj) =>
          (obj.id1 === id1 && obj.id2 === id2) ||
          (obj.id1 === id2 && obj.id2 === id1)
      );
    },
    add: function (id1, id2) {
      this.list.push({ id1: id1, id2: id2 });
    },
  };

  const toAnalize = [];
  toAnalize.push({ id: Graph.list[0].divId, value: 0 });

  let current = `${[Graph.list[0].divId]}`;
  const data = [];
  const pathData = [];

  Graph.list.forEach((host, index) => {
    if (index === 0) {
      data.push(0);
      pathData.push('');
    } else {
      data.push('∞');
      pathData.push('∞');
    }
  });

  result.distance.push({
    toAnalize: [...toAnalize],
    current: current,
    data: [...data],
  });
  result.path.push({ data: [...pathData] });

  while (toAnalize.length != 0) {
    current = toAnalize.shift().id;
    let currentDistance =
      data[Graph.list.findIndex((host) => host.divId === current)];
    let currentPath =
      pathData[Graph.list.findIndex((host) => host.divId === current)];
    currentPath = currentPath === '∞' ? '' : currentPath;

    const connections = Graph.getConnections(current);
    connections.forEach((conn) => {
      if (!checkedConnections.contains(conn.divId, current)) {
        const index = Graph.list.findIndex((host) => host.divId === conn.divId);

        if (data[index] === '∞') {
          data[index] = conn.value + currentDistance;
          pathData[index] = currentPath + current;
        } else {
          if (data[index] > conn.value + currentDistance) {
            data[index] = conn.value + currentDistance;
            pathData[index] = currentPath + current;

            let analizeIndex = toAnalize.findIndex(
              (elem) => elem.id === conn.divId
            );
            if (analizeIndex != -1) {
              toAnalize[analizeIndex].value = data[index];
            }
          }
          if (data[index] === conn.value + currentDistance) {
            if (options.newPath === 'NOWA') {
              pathData[index] = currentPath + current;
            }
          }
        }

        checkedConnections.add(conn.divId, current);

        if (!toAnalize.some((elem) => elem.id === conn.divId)) {
          toAnalize.push({
            id: conn.divId,
            value: data[index],
          });
        }
      }
    });

    toAnalize.sort((a, b) => {
      if (a.value < b.value) {
        return -1;
      } else if (a.value === b.value) {
        const lexCompare = a.id.toUpperCase().localeCompare(b.id.toUpperCase());
        if (options.analyzeSort === 'AZ') {
          return lexCompare;
        } else if (options.analyzeSort === 'ZA') {
          return lexCompare * -1;
        }
        return 0;
      } else {
        return 1;
      }
    });

    result.distance.push({
      toAnalize: [...toAnalize],
      current: current,
      data: [...data],
    });

    result.path.push({ data: [...pathData] });
  }

  return result;
};
