const $ = document;

const selectMenu = $.getElementById("algorithm");
const nameInput = $.getElementById("nameInput");
const timeInput = $.getElementById("timeInput");
const serviceInput = $.getElementById("serviceInput");
const submitButton = $.getElementById("submitButton");
const resetButton = $.getElementById("resetButton");
const formContainer = $.getElementById("form-container");
const dataContainer = $.getElementById("data-container");
const quantumInput = $.getElementById("quantumInput");
const resDiv = $.getElementById("res");
let quantum;
let data = [];

submitButton.addEventListener("click",(e) =>{;
resDiv.style.display = "block";
})
resetButton.addEventListener("click",(e) =>{
  data = [];
  e.preventDefault();
  dataContainer.innerHTML ="";
  data = [];
  resetForm()
  resDiv.style.display = "none";
})

quantumInput.addEventListener("input",() => {
  quantum = +quantumInput.value;
  calculateResult();
})

const updateDom = (tableData, result) => {
  const { awt, aat } = result.reduce(
    (prev, current) => {
      prev.awt += current.waitingTime / result.length;
      prev.aat += current.answerTime / result.length;
      return prev;
    },
    { awt: 0, aat: 0 }
  );

  dataContainer.innerHTML = "";

  const list = document.createElement("div");
  list.classList.add("data-container");
  dataContainer.insertAdjacentHTML(
    "beforeend",
    "<div class='data-title font-fa' style='width: 700px; position: relative;left: -300px;top: -500px;'\><span  style='font-size: 22px; margin-right:20px'>ResponseTime</span><span   style='font-size: 22px; margin-right:10px'>Waiting Time</span><span  style='font-size: 22px; margin-right:10px'>Burst Time</span><span  style='font-size: 22px; margin-right:10px'>Arrival Time</span><span  style='font-size: 22px; margin-right:10px'>Process Name</span></div>"
  );
  result.map(({ name, time, service, waitingTime, answerTime }) => {
    list.insertAdjacentHTML(
      "beforeend",
      `<div class='data-title' style='width: 700px; position: relative;left: -300px;top: -500px'><span  style='font-size: 22px; margin-right:10px'>${name}</span><span  style='font-size: 22px; margin-right:10px'>${time}</span><span  style='font-size: 22px; margin-right:10px'>${service}</span><span  style='font-size: 22px; margin-right:10px'>${waitingTime}</span><span  style='font-size: 22px; margin-right:10px'>${answerTime}</span></div>`
    );
  });

  list.insertAdjacentHTML(
    "beforeend",
    `<div class='data-title average'style='width: 700px; position: relative;left: -300px;top: -500px'><span class="font-fa"  style='font-size: 22px; margin-right:10px'>AVG Waiting Time<span class="font-en"  style='font-size: 22px; margin-right:10px'> ${awt.toFixed(2)}</span></span><span class="font-fa"  style='font-size: 22px; margin-right:10px'>AVG Response Time<span class="font-en"  style='font-size: 22px; margin-right:10px'>${aat.toFixed(2)}</span></span></div>`
  );

  dataContainer.insertAdjacentElement("beforeend", list);
};

const FCFS = () => {
  const clone = [...data];

  const sortedData = clone.sort((a, b) => a.time - b.time);

  const tableData = sortedData.reduce((prev, current) => {
    const prevItem = prev[prev.length - 1];

    const start = prevItem?.end || current.time;
    const end = start + current.service;

    prev.push({ ...current, start, end });
    return prev;
  }, []);

  const result = tableData.reduce((prev, current, index) => {
    const { start, end } = tableData[index];

    const waitingTime = start - current.time;
    const answerTime = end - current.service;

    prev.push({ ...current, waitingTime, answerTime });
    return prev;
  }, []);

  return { tableData, result };
};

const SJF = () => {
  const clone = [...data];

  const sortedData = clone.reduce((prev) => {
    const spendTime = prev.reduce((prev, current) => prev + current.service, 0);

    const filterRepeatedItems = data.filter((item) => !prev.find((resultItem) => resultItem.name === item.name));

    const minimumTime = filterRepeatedItems.sort((a, b) => a.time - b.time)[0].time;

    const filteredBasedMaximumTime = filterRepeatedItems.filter((item) => item.time <= minimumTime || item.time <= spendTime);

    const sorted = filteredBasedMaximumTime.sort((a, b) => a.service - b.service);

    prev.push(sorted[0]);

    return prev;
  }, []);

  const tableData = sortedData.reduce((prev, current) => {
    const prevItem = prev[prev.length - 1];

    const start = prevItem?.end || current.time;
    const end = start + current.service;

    prev.push({ ...current, start, end });
    return prev;
  }, []);

  const result = tableData.reduce((prev, current, index) => {
    const { start, end } = tableData[index];

    const waitingTime = start - current.time;
    const answerTime = end - current.service;

    prev.push({ ...current, waitingTime, answerTime });
    return prev;
  }, []);

  return { tableData, result };
};

const RR = () => {
  const clone = [...data];

  const sortedData = clone.sort((a, b) => a.time - b.time);

  const calculateTableData = (data, lastEndTime) => {
    let clonedData = [...data];

    const tableResult = clonedData.reduce((prev, current) => {
      const prevItem = prev[prev.length - 1];
      quantum = quantum || 0;
      const start = prevItem?.end ?? lastEndTime ?? current.time;

      const quantumService = current.service >= quantum ? quantum : current.service;
      const serviceLeft = current.service - quantumService;

      if (serviceLeft)
        clonedData = clonedData.map((item) => (item.name === current.name ? { ...item, service: serviceLeft } : item));
      else clonedData = clonedData.filter((item) => item.name !== current.name);

      const end = start + quantumService;

      prev.push({ ...current, start, service: quantumService, end });
      return prev;
    }, []);

    return clonedData?.length
      ? [...tableResult, ...calculateTableData(clonedData, tableResult[tableResult.length - 1]?.end)]
      : tableResult;
  };

  const tableData = calculateTableData(sortedData);

  const clonedTable = [...tableData];

  const reversedData = clonedTable.reverse();

  const lastOfEachItem = sortedData.reduce((prev, current) => {
    const lastItem = reversedData.find((item) => item.name === current.name);
    prev.push(lastItem);
    return prev;
  }, []);

  const result = lastOfEachItem.reduce((prev, current) => {
    const currentItem = sortedData.find((item) => item.name === current.name);

    const waitingTime = current.start - currentItem.time;
    const answerTime = current.end - currentItem.service;

    prev.push({ ...current, waitingTime, answerTime });
    return prev;
  }, []);

  return { tableData, result };
};

const SRT = () => {
  let firstClone = [...data];
  let secondClone = [...data];

  const allEnterTimes = firstClone.reduce((prev, current) => [...new Set([...prev, current.time])], []).sort((a, b) => a - b);

  const orderedData = [];

  let spendTime = allEnterTimes[0];
  let secondEnterTime = allEnterTimes[1];

  while (firstClone.length) {
    const task = firstClone.filter((item) => item.time <= spendTime).sort((a, b) => a.service - b.service)[0];

    const start = spendTime;

    let service;

    if (secondEnterTime) {
      if (spendTime + task.service > secondEnterTime) {
        service = secondEnterTime - spendTime;
        secondEnterTime = allEnterTimes[allEnterTimes.indexOf(secondEnterTime) + 1];
      } else service = task.service;
    } else service = task.service;

    const end = start + service;

    spendTime = end;

    if (service === task.service) firstClone = firstClone.filter((item) => item.name !== task.name);
    else firstClone = firstClone.map((item) => (item.name === task.name ? { ...item, service: item.service - service } : item));

    orderedData.push({ ...task, start, service, end });
  }

  const tableData = orderedData.reduce((prev, current) => {
    const lastItem = prev[prev.length - 1];
    if (lastItem && lastItem.name === current.name) {
      prev[prev.length - 1] = { ...lastItem, service: lastItem.service + current.service, end: current.end };
    } else prev.push(current);
    return prev;
  }, []);

  const reversedTableData = [...tableData].reverse();

  const lastOfEachItem = reversedTableData.reduce((prev, current) => {
    const find = prev.find((item) => item.name === current.name);
    !find && prev.push(current);
    return prev;
  }, []);

  const result = secondClone.reduce((prev, current) => {
    const currentItem = lastOfEachItem.find((item) => item.name === current.name);

    const waitingTime = currentItem.end - (current.service + current.time);
    const answerTime = currentItem.end - current.service;

    prev.push({ ...current, waitingTime, answerTime });

    return prev;
  }, []);

  return { tableData, result };
};

const MLFQ = () => {
  let firstCloned = [...data];
  let secondClone = [...data];

  const tableData = [];

  const sortedData = firstCloned.sort((a, b) => a.time - b.time);
  let spendTime = sortedData[0].time;

  let currentQuantum = 0;

  let group = [];

  while (firstCloned.length) {
    const allComingItems = firstCloned.filter((item) => item.time <= spendTime).sort((a, b) => a.time - b.time);

    const current = allComingItems.find((item) => !group.find((groupItem) => groupItem.name === item.name)) || allComingItems[0];

    const start = spendTime;
    const service = Math.min(current.service, Math.pow(2, currentQuantum));
    const end = start + service;
    const newData = { ...current, start, service, end };

    group.push(newData);

    spendTime = end;
    if (service === current.service) firstCloned = firstCloned.filter((item) => item.name !== current.name);
    else
      firstCloned = firstCloned.map((item) => (item.name === current.name ? { ...item, service: item.service - service } : item));

    if (group.length === data.length) {
      currentQuantum++;
      tableData.push(...group);
      group = [];
    } else if(firstCloned.length === 0) {
      currentQuantum++;
      tableData.push(...group);
      group = [];
    }
  }

  const reversedTableData = [...tableData].reverse();

  const lastOfEachItem = reversedTableData.reduce((prev, current) => {
    const find = prev.find((item) => item.name === current.name);
    !find && prev.push(current);
    return prev;
  }, []);

  const result = secondClone.reduce((prev, current) => {
    const currentItem = lastOfEachItem.find((item) => item.name === current.name);

    const waitingTime = currentItem.end - (current.service + current.time);
    const answerTime = currentItem.end - current.service;

    prev.push({ ...current, waitingTime, answerTime });

    return prev;
  }, []);

  return { tableData, result };
};

const calculateResult = () => {
  if (data.length) {
    const algorithm = selectMenu.value;

    const algorithms = { FCFS, SJF, RR, SRT, MLFQ };

    const { tableData, result } = algorithms[algorithm]();

    updateDom(tableData, result);
  } else dataContainer.insertAdjacentHTML("beforeend", "<h3 class='text-center font-en' style='width: 400px; position: relative;left: -300px;top: -400px'>No data is entered !</h3>");
};

selectMenu.addEventListener('input',() =>{
  data = [];
  dataContainer.innerHTML ="";
  data = [];
  resetForm()
  resDiv.style.display = "none";
  if(selectMenu.value == 'RR') {
    quantumInput.style.display = 'block';
  }else{
      quantumInput.style.display = 'none'}
})

const resetForm = () => {
  timeInput.value = "";
  serviceInput.value = "";
  nameInput.value = `p${data.length + 1}`;
  submitButton.disabled = true;
  timeInput.focus();
};

const numberValidator = (e) => {
  const newValue = e.target.value;
  const isAcceptable = /^[0-9]*$/g.test(newValue);
  e.target.value = isAcceptable ? newValue : newValue.slice(0, -1);
  submitButton.disabled = !(serviceInput.value && timeInput.value);
};

const submitHandler = (e) => {
  e.preventDefault();

  const nawItem = { name: `p${data.length + 1}`, time: +timeInput.value, service: +serviceInput.value };

  data.push(nawItem);
  calculateResult();
  resetForm();
};

selectMenu.addEventListener("input", calculateResult);
timeInput.addEventListener("input", numberValidator);
serviceInput.addEventListener("input", numberValidator);
formContainer.addEventListener("submit", submitHandler);
formContainer.addEventListener("reset",resetForm)
document.addEventListener("DOMContentLoaded", () => {
  calculateResult();
  resetForm();
});
