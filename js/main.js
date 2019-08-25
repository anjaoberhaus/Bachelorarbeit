window.onload = (function() {
    /**
    @ App variables
    @*/
    let mapContainer,
        stopBtn,
        startBtn,
        variableSelector,
        selectedVariable,
        campaignSelector,
        selectedCampaign,
        legend,
        slider,
        startTime,
        endTime,
        paintStyle,
        animate,
        activeTime,
        time,
        activeIds;


    /**
    @ setup stuffs
    @*/
    const Setup = (function() {

        const init = function() {
            loadElements();
            attachListeners();
        }

        const loadElements = function() {
            stopBtn = document.querySelector("#stop");
            startBtn = document.querySelector("#start");

            variableSelector = document.querySelector("#variables");
            selectedVariable = variableSelector.value

            campaignSelector = document.querySelector("#campaign")
            selectedCampaign = campaignSelector.value;

            legend = document.querySelector("#legend");

            // set start and end time
            startTime = Date.parse('2019-08-06T17:00:00.000Z');
            endTime = Date.parse('2019-08-06T18:00:00.000Z');


            //  set slider props
            slider = document.getElementById('slider');
            slider.setAttribute("min", startTime)
            slider.setAttribute("max", endTime)
            slider.setAttribute("step", 1000 * 60 * 1);
            slider.setAttribute("value", startTime);

            time = slider.value;

            activeIds = [];

            // update text in the UI
            activeTime = document.querySelector("#active-time")
            activeTime.innerText = new Date(startTime);


            // paint style
            paintStyle = {
                'line-width': 3,
                'line-color': {
                    "property": selectedVariable,
                    "stops": [
                        [-1.4, "#003FD6"],
                        [-1.2, "#0069D7"],
                        [-1.0, "#0095D9"],
                        [-0.8, "#00C2DB"],
                        [-0.6, "#00DDCB"],
                        [-0.4, "#00DFA1"],
                        [-0.2, "#00E176"],
                        [0, "#00E51E"],
                        [0.2, "#3BE800"],
                        [0.4, "#99EC00"],
                        [0.6, "#F0E600"],
                        [0.8, "#F2B800"],
                        [1, "#F48A00"],
                        [1.2, "#F65A00"],
                        [1.4, "#F82A00"],
                        [1.6, "#F90006"]
                    ]
                }
            };

        }

        const attachListeners = function() {
            // start animation
            startBtn.addEventListener('click', function() {
                // only when anim is done, restart
                if (slider.value >= endTime) {
                    slider.value = startTime;
                }
                // apply setInterval function to animate()
                animate = setInterval(function() {
                    slider.stepUp();
                    slider.dispatchEvent(new Event('input', { bubbles: false }));

                    // when time is done, clearInterval()
                    if (slider.value >= endTime) {
                        clearInterval(animate)
                    }
                }, 100)
            });

            // stop animation
            stopBtn.addEventListener('click', function() {
                // cancelAnimationFrame(globalID);
                clearInterval(animate)
            });

            // adjust slider time
            slider.addEventListener('input', function(e) {
                time = parseInt(e.target.value);
                // update text in the UI
                activeTime.innerText = new Date(time);
                // change map colors
                activeIds.forEach(id => {
                    mapContainer.setFilter(id, ['<=', ['number', ['get', 'Time_UTC']], parseInt(time) ]);
                })

            });

            // adjust variables change
            variableSelector.addEventListener("change", (e) => {
                selectedVariable = e.target.value;
                console.log(selectedVariable)
                makeLegend();

                activeIds.forEach(id => {
                    paintStyle['line-color'].property = selectedVariable;
                    mapContainer.setPaintProperty(id, 'line-color', paintStyle['line-color']);
                })
            });
            variableSelector.dispatchEvent(new Event('change', { bubbles: false }));

            // when campaign selector changes
            // reload the main
            campaignSelector.addEventListener("change", (e) => {
                selectedCampaign = e.target.value;
                console.log(selectedCampaign)
                
                if (selectedCampaign === '2019-08-06') {
                    startTime = Date.parse('2019-08-06T17:00:00.000Z');
                    endTime = Date.parse('2019-08-06T18:00:00.000Z');
                }
                //  set slider props
                time = new Date(startTime);
                slider.setAttribute("min", startTime)
                slider.setAttribute("max", endTime)
                slider.setAttribute("step", 1000 * 60 * 1);
                slider.setAttribute("value", startTime);
                activeTime.innerText = new Date(startTime);

                slider.dispatchEvent(new Event("input", {bubbles:false}));

                // remove the existing stuff
                activeIds.forEach(id => {
                    mapContainer.removeLayer(id)
                    mapContainer.removeSource(id)
                })

                MapApp.makeVizualization()
            })

        } // end attachListeners


        /**
        @ make legend
        @*/
        function makeLegend(){
          // change legend
          legend.innerHTML = "";

          paintStyle['line-color'].stops.forEach(stop => {
              let legendItem = document.createElement("div")
              legendItem.classList.add('legendItem')
              legendItem.style.setProperty("background-color", stop[1])

              if (selectedVariable === "Temperature_diff_K") {
                  legendItem.innerHTML = stop[0]
              } else {
                  legendItem.innerHTML = stop[0]
              }

              legend.appendChild(legendItem)
          })
        }

        return {
            init: init
        }

    })();


    /**
    @ map stuffs
    @*/
    const MapApp = (function() {

        /*Map stuff*/
        mapboxgl.accessToken = 'pk.eyJ1Ijoiam9leWtsZWUiLCJhIjoiMlRDV2lCSSJ9.ZmGAJU54Pa-z8KvwoVXVBw';

        const init = function() {
            loadElements();
        }

        const loadElements = function() {
            mapContainer = new mapboxgl.Map({
                container: 'mapContainer', // container element id
                style: 'mapbox://styles/mapbox/light-v9',
                center: [7.625960, 51.962497], // initial map center in [lon, lat]
                zoom: 11.5
            });
        }

        /**
        @ get campaign data
        */
        function getCampaignData() {
            return new Promise((resolve, reject) => {
                if (selectedCampaign !== undefined) {
                    resolve(selectedCampaign)
                } else {
                    reject("no campaign selected")
                }
            })
        }

        /**
        @ load sensor data
        @*/
        let loadSensorData = function(selectedCampaign){
            /*
            @ Parse CSV
            @*/
            function parseCsv(d) {
                return {
                    System_ID: d.System_ID,
                    Time_UTC: Date.parse(d.Time_UTC),
                    Altitude: +d.Altitude,
                    Latitude: +d.Latitude,
                    Longitude: +d.Longitude,
                    Temperature_diff_K: +d.Temperature_diff_K
                };
            }


            return new Promise( (resolve, reject) =>{
                d3.csv(`data/${selectedCampaign}.csv`, parseCsv)
                .then( data => {
                    resolve(data);
                })
            })
        }

        /**
        @ create line segments
        @*/
        function createLineSegments(data) {
            let sensorIds;
            activeIds = [];

            return new Promise((resolve, reject) => {

                // filter data
                data = data.filter((d, idx) => {
                    if (idx % 2 == 0) return d;
                })

                // get the unique sensor ids
                sensorIds = data.map(d => {
                    return d.System_ID;
                }).filter((v, i, a) => a.indexOf(v) === i);

                // create a data object
                sensorIds = sensorIds.map(d => {

                    activeIds.push(d);

                    return {
                        "type": "FeatureCollection",
                        "id": d,
                        "features": []
                    }
                });

                variableSelector.value = selectedVariable;

                // fill the data in to each object
                sensorIds.forEach((geojson, idx1) => {
                    data.forEach((row, idx2) => {

                        if (row.System_ID === geojson.id) {
                            let feat = new createNewFeature();
                            feat.properties = row;
                            // create a linestring feature for each feature using the beginning
                            // and end of each point
                            // and using the data from the first point
                            if ((idx2 < data.length - 1) && (data[idx2].System_ID === data[idx2 + 1].System_ID)) {
                                feat.geometry.coordinates.push([row.Longitude, row.Latitude])
                                feat.geometry.coordinates.push([data[idx2 + 1].Longitude, data[idx2 + 1].Latitude])
                            } else {
                                feat.geometry.coordinates.push([row.Longitude, row.Latitude])
                                feat.geometry.coordinates.push([data[idx2 - 1].Longitude, data[idx2 - 1].Latitude])
                            }

                            geojson.features.push(feat)
                        }
                    })
                })

                // resolve the sensorIds as promise
                if (sensorIds) {
                    resolve(sensorIds)
                } else {
                    reject("error with sensorIds")
                }
            })
        }


        /**
        @ add layers to the map
        @*/
        function addLayersToMap(sensorIds) {
            return new Promise((resolve, reject) => {
                // add layer and apply style
                sensorIds.forEach(geojson => {
                    mapContainer.addLayer({
                        id: geojson.id,
                        type: 'line',
                        source: {
                            type: 'geojson',
                            data: geojson
                        },
                        filter: ['<=', ['number', ['get', 'Time_UTC']], startTime],
                        layout: {
                            'line-cap': 'round'
                        },
                        paint: paintStyle
                    })
                })

                // pass data along
                if (sensorIds) {
                    resolve(sensorIds);
                } else {
                    reject("error in addLayersToMap")
                }
            })
        };

        /**
        @ apply the map styles
        @ NOTE: see selectedVariable to see how changes are applied on change
        @*/
        function applyMapStyles(sensorIds){
            sensorIds.forEach(geojson => {
                paintStyle['line-color'].property = selectedVariable;
                mapContainer.setPaintProperty(geojson.id, 'line-color', paintStyle['line-color']);
            })

            return new Promise( (resolve, reject) => {
              resolve(sensorIds);
            })
        }


        /**
        @ apply filtering based on slider
        @ NOTE: see selectSlider to see how changes are applied on change
        @*/
        function filterMapData(sensorIds){
          // update the map
          sensorIds.forEach(geojson => {
              mapContainer.setFilter(geojson.id, ['<=', ['number', ['get', 'Time_UTC']], parseInt(time) ]);
          })
        }

        /**
        @ helper function
        @ */
        // create a  new geojson linestring
        function createNewFeature() {
            return {
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "LineString",
                    "coordinates": []
                }
            }
        }


        /**
        @ put it all together as a promise chain
        @*/
        let makeVizualization = function(){
            getCampaignData()
                .then(loadSensorData)
                .then(createLineSegments)
                .then(addLayersToMap)
                .then(applyMapStyles)
                .then(filterMapData)
        }


        return {
            init: init,
            makeVizualization: makeVizualization
        }

    })();

    /***********************************************/
    /**
    @ helper function
    @ */
    // scale data to tempDiff values
    function scaleToTempDiff(val, divisor) {
        return Math.floor(val / divisor).toFixed(1)
    }

    // unscale data to tempDiff values
    function unscaleFromTempDiff(val, multiplier) {
        return (val * multiplier).toFixed(1)
    }

    /**
    @ Make the app
    @*/
    Setup.init();
    MapApp.init();
    mapContainer.on('load', function() {
        MapApp.makeVizualization();
    });

})();
