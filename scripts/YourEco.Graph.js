// https://insights.stackoverflow.com/survey/2018/#technology-most-loved-dreaded-and-wanted-languages
YourEco.prototype.renderGraph = function(sample, sample_max, y_text, title_text, type) {

  const svg = d3.select('#svg-'+type);
  const svgContainer = d3.select('#graph-'+type);

  const maxY =  Math.max(sample_max, 10);

  const margin = 80;
  const width = 1000 - 2 * margin;
  const height = 400 - 2 * margin;


  const chart = svg.append('g')
  .attr('transform', `translate(${margin}, ${margin})`);

  const xScale = d3.scaleBand()
  .range([0, width])
  .domain(sample.map((s) => s.day))
  .padding(0.4)

  const yScale = d3.scaleLinear()
  .range([height, 0])
  .domain([0, maxY])

  const makeYLines = () => d3.axisLeft()
  .scale(yScale)

  chart.append('g')
  .attr('transform', `translate(0, ${height})`)
  .call(d3.axisBottom(xScale));

  chart.append('g')
  .call(d3.axisLeft(yScale));

  chart.append('g')
  .attr('class', 'grid')
  .call(makeYLines()
  .tickSize(-width, 0, 0)
  .tickFormat(''))

  const barGroups = chart.selectAll()
  .data(sample)
  .enter()
  .append('g')

  barGroups
  .append('rect')
  .attr('class', 'bar')
  .style('fill', function() {
    if (type == 'L') {return '#f9d644'}
    else if (type == 'G') {return '#64b46a'}
    else if (type == 'S') {return '#51a1d6'}
  ;})
  .attr('x', (g) => xScale(g.day))
  .attr('y', (g) => yScale(g.value))
  .attr('height', (g) => height - yScale(g.value))
  .attr('width', xScale.bandwidth())

  barGroups
  .append('text')
  .attr('class', 'value')
  .attr('x', (a) => xScale(a.day) + xScale.bandwidth() / 2)
  .attr('y', (a) => yScale(a.value) - 30)
  .attr('text-anchor', 'middle')
  .text((a) => `${a.value}`)

  svg
  .append('text')
  .attr('class', 'label')
  .attr('x', -(height / 2) - margin)
  .attr('y', margin / 2.4)
  .attr('transform', 'rotate(-90)')
  .attr('text-anchor', 'middle')
  .text(y_text)

  svg
  .append('text')
  .attr('class', 'title')
  .attr('x', width / 2 + margin)
  .attr('y', 40)
  .attr('text-anchor', 'middle')
  .text(title_text)
}
