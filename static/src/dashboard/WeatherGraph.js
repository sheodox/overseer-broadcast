import React from 'react';

// horizontal pixels per hour on the canvas
const hourlyStep = 3,
	msInHour = 60 * 60 * 1000,
	msInDay = msInHour * 24;

class WeatherGraph extends React.Component {
	constructor(props) {
		super(props);
		this.canvas = React.createRef();
	}
	componentDidMount() {
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
		// crisp lines
		context.translate(0.5, -0.5);


		// draw a line at 0°F and 32°F
		const line = (x1, y1, x2, y2, color) => {
				context.beginPath();
				context.strokeStyle = color;
				// context.lineWidth = 1;
				moveTo(x1, y1);
				lineTo(x2, y2);
				context.stroke();
			},
			horizontalLine = (temp, color) => {
				const y = tempToY(temp);
				line(axisBufferSpace, y, canvas.width, y, color);
			},
			verticalLine = (x, color) => {
				line(x, 0, x, canvas.height, color);
			};

		//a buffer area for text describing the vertical axis
		const timeToX = date => {
				return axisBufferSpace + ((date.getTime() - Date.now()) / msInHour) * hourlyStep;
			},
			timeColor = '#fff';
		// vertical line for the start of each day
		for (let day = 1; day < 10; day++) {
			const date = new Date();
			date.setTime(Date.now() + day * msInDay);
			//the beginning of the day 'day' number of days from now
			date.setHours(0);
			date.setMinutes(0);
			date.setSeconds(0);
			date.setMilliseconds(0);
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

		const labelTemp = (temp, color) => {
			context.fillText(`${temp}°F`, 0, tempToY(temp));
			horizontalLine(temp, color);
		};

		context.fillStyle = '#fff';
		labelTemp(100, '#cc006c');
		labelTemp(80, '#fe6601');
		labelTemp(60, '#ffbf00');
		labelTemp(40, '#3fff6e');
		labelTemp(32, '#34cbc9');
		labelTemp(20, '#35cbcb');
		labelTemp(0, '#2f34c9');
		labelTemp(-20, '#9901f6');


		//collect the temperatures for every time we know of, and
		const timeData = [],
			apparentTimeData = [];
		hourly.forEach(hourlyData => {
			timeData.push({
				time: hourlyData.time,
				temp: hourlyData.temperature,
				precip: hourlyData.precipType || 'none'
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
			temps.forEach(data => {
				//calculate day offset
				const date = dateFromTimestamp(data.time);
				//don't go back in time if we switch from hourly to daily data and there is some overlap in the numbers
				if (date < lastDate) {
					return;
				}
				lastDate = date;
				context.beginPath();
				context.strokeStyle = {
					rain: '#2f34c9',
					snow: '#00a1ff',
					none: '#fff',
					unknown: '#53617a',
					apparent: '#9021ff'
				}[data.precip];
				if (lastCoords) {
					moveTo(...lastCoords);
				}
				lastCoords = [timeToX(date), tempToY(data.temp)];
				context.lineWidth = data.precip === 'apparent' ? 1 : 3;
				lineTo(...lastCoords);
				context.stroke();
			});

			context.stroke();
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