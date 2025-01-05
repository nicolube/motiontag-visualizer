import * as d3 from 'd3'
import { MotionTagDataParser } from './parser/motionTagDataParser'

const colorRamp = [
	'#D56062',
	'#CB6E67',
	'#C27C6C',
	'#B88B71',
	'#AF9976',
	'#A5A87B',
	'#9CB680',
	'#93C586',
	'#99C88C',
	'#A0CB93',
	'#A7CE9A',
	'#ADD1A1',
	'#B4D4A8',
	'#BBD7AF',
	'#C1DAB6',
	'#C8DDBD',
	'#CFE0C4',
	'#D5E3CB',
	'#DCE6D2',
	'#E3E9D9',
	'#EAECE0',
].reverse()

const gridColor = '#ebedf0'

const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].reverse()
const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
const weeks = Array.from({ length: 53 }, (_, index) => `${index + 1}`)
const width = window.innerWidth - 60
const height = 200

const yScale = d3.scaleBand().range([height, 0]).domain(days)

const xScale = d3
	.scaleBand()
	.range([0, yScale.bandwidth() * weeks.length])
	.domain(weeks)

const xOffset = (width - xScale.bandwidth() * weeks.length) / 2

const svg = d3
	.select('#heat')
	.append('svg')
	.attr('width', width)
	.attr('height', 250)
	.append('g')
	.attr('transform', `translate(${xOffset}, ${30})`)

var tooltip = d3.select('#heat').append('div').style('opacity', '0').attr('class', 'tooltip')

const yAxis = svg.append('g').call(d3.axisLeft(yScale))
yAxis.select('.domain').remove()
yAxis
	.selectAll('.tick line')
	.attr('x2', xScale.bandwidth() * weeks.length)
	.attr('stroke-opacity', 0.5)
	.attr('stroke-width', yScale.bandwidth() - 5)
	.attr('stroke', gridColor)

const xAxis = svg.append('g').call(
	d3.axisTop(xScale).tickFormat((domainValue, index) => {
		const weekNr = parseInt(domainValue)
		if (getMonthFromWeek(weekNr - 1, 2024) != getMonthFromWeek(weekNr, 2024)) {
			return getMonthFromWeek(weekNr, 2024)
		}
		return domainValue
	})
)
xAxis.select('.domain').remove()
xAxis
	.selectAll('.tick line')
	.attr('y2', yScale.bandwidth() * days.length)
	.attr('stroke-opacity', 0.5)
	.attr('stroke-width', xScale.bandwidth() - 5)
	.attr('stroke', gridColor)
xAxis
	.selectAll('.tick text')
	.filter(function () {
		return Number.isNaN(parseInt(d3.select(this).text()))
	})
	.attr('font-weight', 'bolder')

xAxis
	.selectAll('.tick text')
	.filter(function () {
		return !Number.isNaN(parseInt(d3.select(this).text()))
	})
	.attr('fill', '#bdbec0')

export function renderHeatMap(motionTagDataParser: MotionTagDataParser, year: number) {
	const rawData = motionTagDataParser.getDistanceHeatMap()

	const data = Object.values(rawData)
	const inputDomain = [0, d3.max(data, (entry) => entry.total)!]

	var myColor = d3
		.scaleQuantize()
		// @ts-ignore
		.range(colorRamp)
		.domain(inputDomain)

	svg
		.selectAll()
		.data(data)
		.join('rect')
		.attr('x', (entry) => xScale(`${getWeekNumber(entry.date)}`)!)
		.attr('y', (entry) => yScale(['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][entry.date.getDay()])!)
		.attr('width', () => xScale.bandwidth() - 5)
		.attr('height', () => yScale.bandwidth() - 5)
		.attr('transform', `translate(2.5, 2.5)`)
		.attr('value', (entry) => entry.total)
		.attr('fill', (entry) => myColor(entry.total))
		.on('mouseover', function (event, entry) {
			tooltip.style('opacity', '1')
			d3.select(this).attr('stroke', 'black')
		})
		.on('mousemove', function (event, entry) {
			const distance = entry.total > 5000 ? Math.round(entry.total / 100) / 10 + 'km' : entry.total + 'm'
			const date = `${entry.date.getDate()}. ${months[entry.date.getMonth()]} ${entry.date.getFullYear()}`

			tooltip
				.html(`${date}: ${distance}`)
				.style('left', d3.pointer(event)[0] + 70 + xOffset + 'px')
				.style('top', d3.pointer(event)[1] + 'px')
		})
		.on('mouseleave', function () {
			tooltip.style('opacity', '0')
			d3.select(this).attr('stroke', 'none')
		})
		.on('click', () => {
			// TODO: Show date only for that date.
		})
}

function getWeekNumber(date: Date): number {
	const tempDate = new Date(date.valueOf())

	const dayNum = (date.getDay() + 6) % 7

	tempDate.setDate(tempDate.getDate() - dayNum + 3)

	const firstThursday = tempDate.valueOf()

	tempDate.setMonth(0, 1)

	if (tempDate.getDay() !== 4) {
		tempDate.setMonth(0, 1 + ((4 - tempDate.getDay() + 7) % 7))
	}

	return 1 + Math.ceil((firstThursday - tempDate.valueOf()) / 604800000)
}

function getMonthFromWeek(week: number, year: number) {
	let d = new Date(year, 0, 1 + (week - 1) * 7)
	d.getUTCDay() < 5
		? d.setUTCDate(d.getUTCDate() - d.getUTCDay() + 1)
		: d.setUTCDate(d.getUTCDate() + 8 - d.getUTCDay())
	return ('' + d).split(' ')[1]
}
