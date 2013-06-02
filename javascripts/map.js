$(function() {

  // Elements.
  var mapLayer = d3.select("#mapLayer");
  var roadLayer = d3.select("#roadLayer");
  var itemLayer = d3.select("#itemLayer");
  var locator = d3.select("#locator");
  var panel = d3.select("#panel");
  var details = d3.select("#details");
  // Inputs.
  var $panel = $("#panel");
  // Data.
  var types = [];
  var items = [];
  var map = [];
  var roads = [];
  var location = { latitude: -34.92862119999999, longitude: 138.5999594 };
  var scale = 1500000;
  // Helpers.
  var geocoder = new google.maps.Geocoder();
  var projection;

  // var distanceBetweenLocations = function(location1, location2) {
  //   var lat1 = Number(location1.latitude);
  //   var lat2 = Number(location2.latitude);
  //   var long1 = Number(location1.longitude);
  //   var long2 = Number(location2.longitude);
  //   var R = 6371; // km
  //   var dLat = (lat2-lat1).toRad();
  //   var dLon = (long2-long1).toRad();
  //   var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
  //           Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
  //           Math.sin(dLon/2) * Math.sin(dLon/2);
  //   var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  //   var d = R * c;
  //   return d;
  // };

  var positionSelection = function(selection) {
    selection.attr("transform", function(d,i) {
      var correctedLocation = projection([ d.longitude, d.latitude ]);
      return "translate("+correctedLocation[0]+","+correctedLocation[1]+")";
    });
  };

  var prepData = function() {

    var data;
    var allowedTypes = [];

    data = items.filter(function(d) {
      return !!types[d.type];
    });

    $panel.find("input[type='checkbox']:checked").each(function() {
      allowedTypes.push($(this).val());
    });

    data = data.filter(function(d) {
        return allowedTypes.indexOf(d.type) != -1;
      });

    return data;

  };

  var updateProjection = function() {
    projection = d3.geo.mercator()
      // TODO: Make half the width of the SVG or something along those lines.
      .translate([ 480, 380])
      .center([ location.longitude, location.latitude ])
      .scale(scale);
  };

  var updateMap = function() {
    mapLayer.select("path")
      .datum(map)
      .attr("d", d3.geo.path().projection(projection));

    roadLayer.select("path")
      .datum(roads)
      .attr("d", d3.geo.path().projection(projection));
  };

  var updateItems = function(data) {

    var itemSelection = itemLayer.selectAll("g").data(data, function(d) {
        return d.id;
      });

    var entered = itemSelection.enter().append("g");

    var exited = itemSelection.exit();

    itemSelection
      .transition()
      .call(positionSelection);

    entered
      .call(positionSelection)
      .attr("id", function(d) {
        return d.id;
      })
      .append("image")
      .attr("xlink:href", function(d,i) {
        return types[d.type].icon;
      }).attr({
        width: 30,
        height: 30,
        x: -15,
        y: -15
      });

    entered.on("click", function(d) {

      details.selectAll("*").remove();

      details.transition().style("background", types[d.type].color);

      details.append("img").attr({
        src: types[d.type].icon
      });
      details.append("p").text("type: "+d.type+" ("+types[d.type].label+")");
      details.append("p").text("title: "+d.title);

      if (d.address) {
        details.append("p").text("address: "+d.address);
      }
      if (d.description) {
        details.append("p").text("description: "+d.description);
      }
      if (d.website) {
        details.append("p").text("website: "+d.website);
      }
      if (d.phone) {
        details.append("p").text("phone: "+d.phone);
      }

      itemLayer.selectAll("g").select("*").attr("transform", null);

      d3.select(this).select("*").attr("transform", function() {
        return "scale(2 2)";
      });

    });

    exited.remove();

  };

  var updatePanel = function(data) {
    var li = panel.select("ul").selectAll("input").data(data)
      .enter()
      .append("li");

    var label = li.append("label");

    label
      .append("input")
      .attr({
        type: "checkbox",
        value: function(d) {
          return d.id;
        },
        checked: true
      }).on("change", function(d,i) {
        updateItems(prepData());
      });

    label
      .append("img")
      .attr({
        src: function(d,i) {
          return d.icon;
        },
        width: 30
      });

    label
      .append("span")
      .text(function(d) {
        return d.label;
      });

  };

  var setLocationToAddress = function(address) {
    geocoder.geocode({ address: address }, function(results, status) {
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
        // alert("Geocoder failed due to: " + status);
      }
    });
  };

  var update = function() {

    updateProjection();

    locator.attr("transform", function() {
      var correctedLocation = projection([ location.longitude, location.latitude ]);
      return "translate("+correctedLocation[0]+","+correctedLocation[1]+")";
    });

    var a = _.map(types, function(v,k) {
      return _.extend(v, { id: k });
    });

    updatePanel(a);
    updateItems(prepData());

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
    map = topojson.feature(data, data.objects.subunits);
    updateProjection();
    updateMap();
  });

  d3.json("data/processed/roads.json", function(error, data) {
    roads = topojson.feature(data, data.objects.subunits);
    updateProjection();
    updateMap();
  });

  setLocationToAddress(getParameterByName("address"));

});
