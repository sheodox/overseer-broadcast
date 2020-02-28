import React from 'react';

// horizontal pixels per hour on the canvas
const hourlyStep = 5,
	msInHour = 60 * 60 * 1000,
	msInDay = msInHour * 24,
	// it's not useful to show super low probabilities of snow/rain on the graph.
	// consider anything below this threshold to not be high enough chance to matter
	// otherwise we're going to be crying wolf all the time.
	PRECIP_PROBABILITY_THRESHOLD = 0.3;

class WeatherGraph extends React.Component {
	constructor(props) {
		super(props);
		this.canvas = React.createRef();
	}
	componentDidMount() {
		// crisp lines, need to do this only once or we end up slowly translating the canvas upwards and to the right
		this.canvas.current.getContext('2d').translate(0.5, -0.5);
		this.renderGraphs();
	}
	componentDidUpdate() {
		this.renderGraphs();
	}

	renderGraphs() {
		if (!this.props.weather.hourly) {
			return;
		}


		const dateFromTimestamp = timestamp => {
			const d = new Date();
			d.setTime(timestamp * 1000);
			return d;
		};

		//a buffer area for text describing the vertical axis
		const axisBufferSpace = 30,
			hourly = this.props.weather.hourly.data,
			daily = this.props.weather.daily.data,
			canvas = this.canvas.current,
			allTemps = [
				...hourly.map(hour => hour.temperature),
				...daily.map(day => [day.temperatureMin, day.temperatureMax])
			].flat(),
			maxTemp = Math.max(...allTemps),
			minTemp = Math.min(...allTemps),
			// middle of min and max temperatures, to be the vertical center of the graph
			pivotTemp = (maxTemp + minTemp) / 2,
			context = this.canvas.current.getContext('2d'),
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
				return axisBufferSpace + ((date.getTime() - Date.now()) / msInHour) * hourlyStep;
			},
			timeColor = '#fff';

		//draw bands of color to indicate daylight
		for (let i = 0; i < 7; i++) {
			context.fillStyle = 'rgba(47,48,14,0.53)';
			const startX = Math.max(axisBufferSpace, timeToX(dateFromTimestamp(daily[i].sunriseTime))),
				endX = timeToX(dateFromTimestamp(daily[i].sunsetTime));
			context.fillRect(
				startX,
				0,
				endX - startX,
				canvas.height
			);
		}

		// vertical line for the start of each day
		for (let day = 0; day < 10; day++) {
			const date = new Date();
			date.setTime(Date.now() + day * msInDay);
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
			verticalLine(timeToX(date), timeColor, {dash: [1, 6]})
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
				time: hourlyData.time,
				temp: hourlyData.temperature,
				precip: hourlyData.precipProbability > PRECIP_PROBABILITY_THRESHOLD ? hourlyData.precipType : 'none'
			});
			apparentTimeData.push({
				time: hourlyData.time,
				temp: hourlyData.apparentTemperature,
				precip: 'apparent'
			});
		});
		daily.forEach((day) => {
			const getData = (minOrMax) => ({
				time: day[`temperature${minOrMax}Time`],
				temp: day[`temperature${minOrMax}`],
				precip: 'unknown'
			}),
			getApparentData = (minOrMax) => ({
				time: day[`apparentTemperature${minOrMax}Time`],
				temp: day[`apparentTemperature${minOrMax}`],
				precip: 'apparent'
			});
			const minData = getData('Min'),
				apparentMinData = getApparentData('Min'),
				maxData = getData('Max'),
				apparentMaxData = getApparentData('Max');

			//figure out if the high or low occurs sooner, so we don't draw a line that goes backwards in time
			if (day.temperatureMinTime < day.temperatureMaxTime) {
				timeData.push(minData);
				timeData.push(maxData);
			} else {
				timeData.push(maxData);
				timeData.push(minData);
			}

			if (day.apparentTemperatureMinTime < day.apparentTemperatureMaxTime) {
				apparentTimeData.push(apparentMinData);
				apparentTimeData.push(apparentMaxData);
			} else {
				apparentTimeData.push(apparentMaxData);
				apparentTimeData.push(apparentMinData);
			}
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

					context.strokeStyle = {
						rain: '#2f34c9',
						snow: '#00a1ff',
						none: '#fff',
						unknown: '#53617a',
						apparent: '#9021ff'
					}[batch.precip];
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

		plotTemps(timeData);
		plotTemps(apparentTimeData);
	}

	render() {
		return <div id="weather-graph-container">
			<canvas id="weather-graph" ref={this.canvas} width={24 * 7 * hourlyStep} height={200} />
		</div>
	}
}

export default WeatherGraph;