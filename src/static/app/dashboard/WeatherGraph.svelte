<style>

</style>

<canvas bind:this={canvas} height="200" width={ 24 * canvasDays *  hourlyStep} class="m-2"></canvas>

<script>
    import {dailyWeather, hourlyWeather} from "../stores/weather";

    let canvas;

    // horizontal pixels per hour on the canvas
    const hourlyStep = 5,
        canvasDays = 4,
        HOUR_MS = 60 * 60 * 1000,
        DAY_MS = HOUR_MS * 24,
        shortTime = new Intl.DateTimeFormat('en-US', {timeStyle: 'short'}),
        // it's not useful to show super low probabilities of snow/rain on the graph.
        // consider anything below this threshold to not be high enough chance to matter
        // otherwise we're going to be crying wolf all the time.
        PRECIP_PROBABILITY_THRESHOLD = 30;

    const docStyles = getComputedStyle(document.documentElement),
        getShdxColor = varName => docStyles.getPropertyValue(`--shdx-${varName}`);

    function draw(weather, daily, canvas) {
        if (!weather || !canvas || !daily.length) {
            return;
        }

        const dateFromTimestamp = timestamp => {
            return new Date(timestamp);
        };

        //a buffer area for text describing the vertical axis
        const axisBufferSpace = 30,
            hourly = weather,
            allTemps = [
                ...hourly.map(hour => hour.values.temperature),
            ].flat(),
            maxTemp = Math.max(...allTemps),
            minTemp = Math.min(...allTemps),
            // middle of min and max temperatures, to be the vertical center of the graph
            pivotTemp = (maxTemp + minTemp) / 2,
            context = canvas.getContext('2d'),
            // need to plot on half pixels for crisp lines, round down, then translate the whole graph
            moveTo = (x, y) => {
                context.moveTo(
                    Math.floor(x),
                    Math.floor(y),
                )
            },
            lineTo = (x, y) => {
                context.lineTo(
                    Math.floor(x),
                    Math.floor(y),
                )
            },
            tempToY = temperature => {
                const scale = 1.5;
                return (canvas.height / 2) - scale * (temperature - pivotTemp)
            };
        context.clearRect(0, 0, canvas.width, canvas.height);

        // draw a line at 0°F and 32°F
        const line = (x1, y1, x2, y2, color, {dash, lineWidth}={}) => {
                context.beginPath();
                context.strokeStyle = color;
                context.setLineDash(dash || []);
                context.lineWidth = lineWidth || 1;
                moveTo(x1, y1);
                lineTo(x2, y2);
                context.stroke();
            },
            horizontalLine = (temp, color, options) => {
                const y = tempToY(temp);
                line(axisBufferSpace, y, canvas.width, y, color, options);
            },
            verticalLine = (x, color, options) => {
                line(x, 0, x, canvas.height, color, options);
            };

        const timeToX = date => {
                return axisBufferSpace + ((date.getTime() - Date.now()) / HOUR_MS) * hourlyStep;
            },
            timeColor = '#99a';

        //draw bands of color to indicate daylight
        for (let i = 0; i < 7; i++) {
            const startX = Math.max(axisBufferSpace, timeToX(dateFromTimestamp(daily[i].values.sunriseTime))),
                endX = timeToX(dateFromTimestamp(daily[i].values.sunsetTime));

            if (endX > axisBufferSpace) {
                context.fillStyle = 'rgba(47,48,14,0.53)';
                context.fillRect(
                    startX,
                    0,
                    endX - startX,
                    canvas.height
                );
            }
        }

        // vertical line for the start of each day
        for (let day = 0; day < canvasDays + 1; day++) {
            const date = new Date();
            date.setTime(Date.now() + day * DAY_MS);
            //the beginning of the day 'day' number of days from now
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);
            if (day > 0) {
                verticalLine(timeToX(date), timeColor);
                const dayName = [
                    'Sun',
                    'Mon',
                    'Tue',
                    'Wed',
                    'Thu',
                    'Fri',
                    'Sat'
                ][date.getDay()];
                context.fillStyle = '#fff';
                context.fillText(`${dayName} ${date.getMonth() + 1}/${date.getDate()}`, timeToX(date) + 3, canvas.height - 5);
            }

            //noon the same day
            date.setHours(12);
            const noonX = timeToX(date);
            verticalLine(noonX, timeColor, {dash: [1, 6]});
        }

        const labelTemp = (temp, color, options) => {
            context.fillText(`${temp}°F`, 0, tempToY(temp));
            horizontalLine(temp, color, options);
        };

        context.fillStyle = '#fff';
        labelTemp(100, '#cc006c');
        labelTemp(80, '#fe6601');
        labelTemp(60, '#ffbf00');
        labelTemp(40, '#3fff6e');
        labelTemp(32, '#34cbc9', {dash: [3, 3]});
        labelTemp(20, '#35cbcb');
        labelTemp(0, '#2f34c9', {lineWidth: 3});
        labelTemp(-20, '#9901f6');

        //collect the temperatures for every time we know of, and
        const timeData = [],
            apparentTimeData = [];
        hourly.forEach(hourlyData => {
            timeData.push({
                time: hourlyData.startTime,
                temp: hourlyData.values.temperature,
                precip: hourlyData.values.precipitationProbability > PRECIP_PROBABILITY_THRESHOLD ? hourlyData.values.precipitationType : 'none'
            });
            apparentTimeData.push({
                time: hourlyData.startTime,
                temp: hourlyData.values.temperatureApparent,
                precip: 'apparent'
            });
        });

        const drawTime = (timestamp, color) => {
            const date = dateFromTimestamp(timestamp),
                x = timeToX(date);
            //don't want to show times that are off the graphable area, would look weird overlapping the temperature axis labeling area
            if (x > axisBufferSpace) {
                context.fillStyle = color;
                context.fillText(
                    `${shortTime.format(date)}`,
                    x,
                    10
                )
            }
        };

        daily.forEach((day) => {
            //draw the time the sunset and sunrise happen
            drawTime(day.values.sunriseTime, getShdxColor('yellow-300'));
            drawTime(day.values.sunsetTime, getShdxColor('blue-300'));
        });

        const plotTemps = (temps) => {
            //break drawing into segments, so we can change color of each line individually, but will need to keep the last coordinates around
            let lastCoords = null,
                lastDate = 0;

            // between the hourly and daily temps we'll have some overlap, make sure we skip daily temps that have coverage
            // from an hourly temp already, basically make sure we only consider times that are later than the last time
            // we processed, or the graph will draw a line backwards in time to the left
            temps = temps.reduce((done, temp) => {
                if (temp.time < lastDate) {
                    return done;
                }
                done.push(temp);
                lastDate = temp.time;
                return done;
            }, []);
            lastDate = 0;

            const newBatch = (firstTemp) => ({precip: firstTemp.precip, temps: [firstTemp]});

            const batchedTemps = [];
            let currentBatch = newBatch(temps[0]);

            //seeded currentBatch with the first temp's data, skip it
            temps.slice(1).forEach(tempData => {
                if (tempData.precip === currentBatch.precip) {
                    currentBatch.temps.push(tempData);
                }
                else {
                    batchedTemps.push(currentBatch);
                    currentBatch = newBatch(tempData);
                }
            });
            batchedTemps.push(currentBatch);

            batchedTemps
                .forEach(batch => {
                    context.beginPath();
                    if (lastCoords) {
                        moveTo(...lastCoords);
                    }

                    const precipType = typeof batch.precip === 'number' ? {
                        0: 'none',
                        1: 'rain',
                        2: 'snow',
                        3: 'snow',
                        4: 'snow'
                    }[batch.precip] : batch.precip;

                    context.strokeStyle = {
                        rain: '#2f34c9',
                        snow: '#00a1ff',
                        none: '#fff',
                        unknown: '#53617a',
                        apparent: '#9021ff'
                    }[precipType];
                    context.lineWidth = batch.precip === 'apparent' ? 1 : 3;

                    batch.temps.forEach(data => {
                        const date = dateFromTimestamp(data.time);
                        //don't go back in time if we switch from hourly to daily data and there is some overlap in the numbers
                        lastDate = date;
                        if (date < lastDate) {
                            return;
                        }
                        lastCoords = [timeToX(date), tempToY(data.temp)];
                        lineTo(...lastCoords);
                    });
                    context.stroke();
                });

        };

        plotTemps(apparentTimeData);
        plotTemps(timeData);
    }

    $: draw($hourlyWeather, $dailyWeather, canvas);
</script>