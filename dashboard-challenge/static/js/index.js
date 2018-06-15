
function renderDropDown() {

  // Make API request
  d3.json("/names", function (error, response) {

    // Handle errors
    if (error) return console.warn(error);

    var $sampleSelection = document.getElementById("selDataset");
    // Loop through response and create selection items
    for (var i = 0; i < response.length; i++) {
      var sampleEntry = document.createElement("option");
      sampleEntry.value = response[i];
      sampleEntry.innerText = response[i];
      $sampleSelection.appendChild(sampleEntry);
    }
  });
}


function optionChanged(newOption) {

  // load metadata entries and build the list
  d3.json("/metadata/" + newOption, function (error, response) {
    // Handle errors
    if (error) return console.warn(error);

    var $sampleMetadata = document.getElementById("sampleMetadata");

    sampleMetadata.innerHTML = "";
    //extract metadata keys and values
    var meta_keys = d3.keys(response[0]);
    var meta_values = d3.values(response[0]);

    //build metedata list
    for (var i = 0; i < meta_keys.length; i++) {
      var metadataEntry = document.createElement("p");
      metadataEntry.innerText = meta_keys[i] + ": " + meta_values[i];
      $sampleMetadata.appendChild(metadataEntry);
    }
  });


  // load the sample sata and build charts
  d3.json("/samples/" + newOption, function (error, response) {
    // Handle errors
    if (error) return console.warn(error);
    // build the list of OTU names using previoulsy loaded refernce of OTU names
    var otu_text_ordered = [];
    var otu_text_ordered = response[0].otu_ids.map(function (e) {
      return otu_text_unordered[e - 1];
    });


    // derive an aray of marker colors, by spreading 3700 OTUs over the color spectrum
    var marker_colors = response[0].otu_ids.slice(0);
    marker_colors = marker_colors.map(function (e) {
      number = Math.round(e * 16000000 / 3700);
      return "#" + number.toString(16);
    });

    // plot the pie chart
    var data = [{
      values: response[0].sample_values.slice(0, 10),
      labels: response[0].otu_ids.slice(0, 10),
      marker: { colors: marker_colors.slice(0, 10) },
      type: 'pie',
      hoverinfo: 'label+percent+text',
      text: otu_text_ordered.slice(0, 10),
      textinfo: 'value+percent'
    }];



    var layout = {
      autosize: false,
      width: 350,
      height: 350,
      title:'Largest 10 OTUs',
      margin: {
        l: 50,
        r: 50,
        b: 50,
        t: 50
      }
    };

    var $PIE = document.getElementById("pie_chart");
    Plotly.newPlot($PIE, data, layout)

    // derive an array of marker sizes for the scatter plot, logarithm allows to visualize both large and small values
    var marker_sizes = response[0].sample_values.slice(0);
    marker_sizes = marker_sizes.map(function (e) {
      return Math.log(e * 2) * 10
    });




    // plot the scatter plot
    var trace = [{
      x: response[0].otu_ids,
      y: response[0].sample_values,
      mode: 'markers',
      type: 'scatter',
      text: otu_text_ordered.slice(0, 10),
      marker: { size: marker_sizes, color: marker_colors }
    }];


    var $SCATTER = document.getElementById("scatter_chart");
    Plotly.newPlot($SCATTER, trace);
  });
}


// Render the drop down list for the first time on page load
renderDropDown();

//the list of OTU names is loaded to be used later - relevant ones will be pulled by index as out_ids are sequential without gaps
//the list of OTU descriptions  should have been added to the API JSON response "/samples/..." but as it was not mentioned explicitly in the task desciption,it's done here this way  
var otu_text_unordered = [];
d3.json("/otu", function (error, response) {
  // Handle errors
  if (error) return console.warn(error);
  otu_text_unordered = response;
});





