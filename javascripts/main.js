$(function() {

  // Elements.
  var mapLayer = d3.select("#mapLayer");
  var locator = d3.select("#locator");
  var itemLayer = d3.select("#itemLayer");
  var panel = d3.select("#panel");
  // Inputs.
  var $form = $("#form");
  var $addressInput = $form.find("input[name='address']");
  var $panel = $("#panel");
  // Data.
  var types = [];
  var items = [];
  var map = [];
  var location = { latitude: -34.92862119999999, longitude: 138.5999594 };
  // Helpers.
  var geocoder = new google.maps.Geocoder();
  var projection;

  var distanceBetweenLocations = function(location1, location2) {
    var lat1 = Number(location1.latitude);
    var lat2 = Number(location2.latitude);
    var long1 = Number(location1.longitude);
    var long2 = Number(location2.longitude);
    var R = 6371; // km
    var dLat = (lat2-lat1).toRad();
    var dLon = (long2-long1).toRad();
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d;
  };

  var positionSelection = function(selection) {
    selection.attr("transform", function(d,i) {
      var correctedLocation = projection([ d.longitude, d.latitude ]);
      return "translate("+correctedLocation[0]+","+correctedLocation[1]+")";
    });
  };

  var prepData = function(filtered) {

    var data;
    var allowedTypes = [];

    data = items.filter(function(d) {
      return !!types[d.type];
    });

    if (filtered) {

      $panel.find("input[type='checkbox']:checked").each(function() {
        allowedTypes.push($(this).val());
      });

      data = data.filter(function(d) {
          return allowedTypes.indexOf(d.type) != -1;
        });
    }

    data = data.map(function(d) {
        return $.extend(d, { distance: distanceBetweenLocations(location, d) });
      });

    data = data.filter(function(d) {
        return d.distance < 10000;
      });

    data = d3.nest()
      .key(function(d) {
        return d.type;
      }).entries(data);

    return data;

  };

  var updateProjection = function() {
    projection = d3.geo.mercator()
      // TODO: Make half the width of the SVG or something along those lines.
      .translate([ 480, 380])
      .center([ location.longitude, location.latitude ])
      // .scale(100000);
      .scale(1000000);
  };

  var updateMap = function() {
    mapLayer.select("path")
      .datum(map)
      .attr("fill", "#eee")
      .attr("stroke", "#000")
      .attr("d", d3.geo.path().projection(projection));
  };

  var updateItems = function(data) {

    var groupSelection = itemLayer.selectAll("g").data(data, function(d) {
      return d.key;
    });

    groupSelection.enter().append("g");
    groupSelection.exit().remove();

    var itemSelection = groupSelection.selectAll("g").data(function(d) {
        return d.values;
      }, function(d) {
        return d.id;
      });

    var entered = itemSelection.enter().append("g");

    var exited = itemSelection.exit();

    itemSelection
      .transition()
      .call(positionSelection);

    entered
      .call(positionSelection)
      .append("image")
      .attr("xlink:href", function(d,i) {
        return types[d.type].icon;
      }).attr({
        width: 20,
        height: 20,
        x: -10,
        y: -10
      });

    exited.remove();

  };

  var updatePanel = function(data) {
    panel.select("ul").selectAll("input").data(data)
      .enter()
      .append("li")
      .append("label")
      .text(function(d) {
        return types[d.key].labell;
      })
      .append("input")
      .attr({
        type: "checkbox",
        value: function(d) {
          return d.key;
        },
        checked: true
      }).on("change", function(d,i) {
        update();
      });
  };

  var update = function() {

    // var data = prepData(items);
    // var filteredData = filterData(data);

    updateProjection();

    locator.attr("transform", function() {
      var correctedLocation = projection([ location.longitude, location.latitude ]);
      return "translate("+correctedLocation[0]+","+correctedLocation[1]+")";
    });

    updatePanel(prepData(false));
    updateItems(prepData(true));

  };

  d3.json("data/processed/types.json", function(error, data) {
    types = data;
    update();
  });

  d3.csv("data/processed/gazetter-sa.csv", function(error, data) {
    items = items.concat(data);
    update();
  });
  d3.csv("data/processed/adult-education.csv", function(error, data) {
    items = items.concat(data);
    update();
  });
  d3.csv("data/processed/communities.csv", function(error, data) {
    items = items.concat(data);
    update();
  });
  // d3.csv("data/processed/example.csv", function(error, data) {
  //   items = items.concat(data);
  //   update();
  // });

  d3.json("data/processed/map.json", function(error, data) {
  // d3.json("data/processed/roads.json", function(error, data) {
    map = topojson.feature(data, data.objects.subunits);
    update();
    updateMap();
  });

  $form.find("input[type='submit']").on("click", function(event) {

    geocoder.geocode({ address: $addressInput.val() }, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[0] && results[0].geometry && results[0].geometry.location) {
          location = {
            latitude: results[0].geometry.location.jb,
            longitude: results[0].geometry.location.kb
          };
          update();
          updateMap();
        }
      } else {
        alert("Geocoder failed due to: " + status);
      }
    });

    event.preventDefault();

  });

  updateProjection();

});
