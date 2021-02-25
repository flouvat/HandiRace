//===============================================
// author : Cedric Caruzzo
// Github : https://github.com/CaruzzoC
// annee : 2020
//===============================================

//==========================================GRAPH UPDATE==================================================

function updateConfigByMutating(chart) {
    chart.options.animation.duration = 0;
    chart.update();
}

function addData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });
    updateConfigByMutating(chart);
}

function removeData(chart) {
    chart.data.labels.pop();
    chart.data.datasets.forEach((dataset) => {
        dataset.data.pop();
    });
    updateConfigByMutating(chart);
}

//===================================================LINE CHART===========================================
var live_data = [10,8,5,9,13,12];
new Chart(document.getElementById("line-chart-Direct"), {
  type: 'line',
  data: {
    labels: ["00:05","00:10","00:15","00:20","00:25","00:30"],
    datasets: [{ 
        data: live_data,
        label: "Performance 1",
        borderColor: "#3e95cd",
      }
    ]
  },
  options: {
    title: {
      display: true,
      text: 'Direct Data'
    }
  }
});

var label = ["00:05","00:10","00:15","00:20","00:25","00:30"]
var perf_1 = [10,8,5,9,13,12];
var perf_2 = [15,12,13,14,7,10];
var perf_3 = [12,13,13,14,11,10];
var perf_4 = [15,14,13,14,11,10];
var data_1 = perf_1;
var data_2 = perf_2;
compare_chart = new Chart(document.getElementById("line-chart-Comparaison"), {
  type: 'line',
  data: {
    labels: label,
    datasets: [{ 
        data: data_1,
        label: "Performance 1",
        borderColor: "#3e95cd",
        fill: false
      }, { 
        data: data_2,
        label: "Performance 2",
        borderColor: "#8e5ea2",
        fill: false
      }
    ]
  },
  options: {
    title: {
      display: true,
      text: 'Comparaison de Performances'
    }
  }
});

//===========================================DOUGHNUT CHART==============================================

new Chart(document.getElementById("doughnut-chart1"), {
    type: 'doughnut',
    data: {
      labels: ["Performance 1","Performance 2"],
      datasets: [
        {
          label: "Distance Maximum",
          backgroundColor: ["#3e95cd", "#8e5ea2"],
          data: [Math.max(...data_1),Math.max(...data_2)]
        }
      ]
    },
    options: {
      title: {
        display: true,
        text: 'Distance Maximum'
      }
    }
});

new Chart(document.getElementById("doughnut-chart2"), {
    type: 'doughnut',
    data: {
      labels: ["Performance 1","Performance 2"],
      datasets: [
        {
          label: "Distance Minimum",
          backgroundColor: ["#3e95cd", "#8e5ea2"],
          data: [Math.min(...data_1),Math.min(...data_2)]
        }
      ]
    },
    options: {
      title: {
        display: true,
        text: 'Distance Minimum'
      }
    }
});

new Chart(document.getElementById("doughnut-chart3"), {
    type: 'doughnut',
    data: {
      labels: ["Performance 1","Performance 2"],
      datasets: [
        {
          label: "Vitesse Maximum",
          backgroundColor: ["#3e95cd", "#8e5ea2"],
          data: [(Math.max(...data_1)*18)/5,(Math.max(...data_2)*18)/5]
        }
      ]
    },
    options: {
      title: {
        display: true,
        text: 'Vitesse Maximum'
      }
    }
});

new Chart(document.getElementById("doughnut-chart4"), {
    type: 'doughnut',
    data: {
      labels: ["Performance 1","Performance 2"],
      datasets: [
        {
          label: "Vitesse Moyenne",
          backgroundColor: ["#3e95cd", "#8e5ea2"],
          data: [(Math.min(...data_1)*18)/5,(Math.min(...data_2)*18)/5]
        }
      ]
    },
    options: {
      title: {
        display: true,
        text: 'Vitesse Moyenne'
      }
    }
});

//===========================================SAVE & LOAD==============================================

function calls_data(){
  d3.csv('my_data.csv')
  .then(makeChart);
}

function makeChart(perf1,perf2) {
  var timesLabel = perf1.map(function(d) {return d.Time});
  var data_1 = perf1.map(function(d) {return d.Distance});
  var data_2 = perf2.map(function(d) {return d.Distance});

  compare_chart = new Chart(document.getElementById("line-chart-Comparaison"), {
  type: 'line',
  data: {
    labels: timesLabel,
    datasets: [{ 
        data: data_1,
        label: "Performance 1",
        borderColor: "#3e95cd",
        fill: false
      }, { 
        data: data_2,
        label: "Performance 2",
        borderColor: "#8e5ea2",
        fill: false
      }
    ]
  },
  options: {
    title: {
      display: true,
      text: 'Comparaison de Performances'
    }
  }
});
}

function save_data(array){
  let csvContent = "data:text/csv;charset=utf-8," 
    + array.map(e => e.join(",")).join("\n");

  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "my_data.csv");
  document.body.appendChild(link);

  link.click();
}

//===========================================DROPDOWN======================================================
var performances = [perf_1,perf_2,perf_3,perf_4]
var x = "";
for (i = 0; i < performances.length; i++){
  x += "Performance " + (i+1);
  if (i < performances.length-1){
    x += ","
  }
}

var options = x.split(",");

var select = document.getElementById('performanceChoice1');
for(var i=0; i<options.length; i++)
  select.options[i+1] = new Option(options[i], i);

var select = document.getElementById('performanceChoice2');
for(var i=0; i<options.length; i++)
  select.options[i+1] = new Option(options[i], i);
