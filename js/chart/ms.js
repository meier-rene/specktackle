import "../util/mol2svg";
import "../util/spinner";
import "chart";

/**
 * Mass spectrometry chart extending the base chart. 
 * 
 * @author Stephan Beisken <beisken@ebi.ac.uk>
 * @method st.chart.ms
 * @returns the mass spectrometry chart
 */
st.chart.ms = function () {
    var ms = chart(); // create and extend base chart
    
    /**
     * Rescales the x domain.
     */
    ms.xscale = function () {
        this.scales.x
            .domain(this.data.raw.gxlim)
            .nice();
    };
    
    /**
     * Rescales the y domain.
     */
    ms.yscale = function () {
        this.scales.y
            .domain(this.data.raw.gylim)
            .nice();
    };
    
    /**
     * Adds utilities for custom behavior.
     */
    ms.behavior = function () { //d3.select(this.target).append('div')
        this.tooltips = this.panel.append('foreignObject')
            .attr('width', $(this.target).width())
            .attr('height', $(this.target).height())
            .style('pointer-events', 'none')
            .append('xhtml:div')
            .attr('class', 'st-tooltips')
            .style('position', 'absolute')
            .style('opacity', 0);

        this.tooltips.append('div')
            .attr('id', 'tooltips-meta')
            .style('height', '50%')
            .style('width', '100%');

        this.tooltips.append('div')
            .attr('id', 'tooltips-mol')
            .style('height', '50%')
            .style('width', '100%');
    };
   
    // add the MDL molfile to SVG renderer   
    ms.mol2svg = st.util.mol2svg(200, 200);
    
    /**
     * Renders the data.
     */
    ms.renderdata = function () {
        var data = this.data.bin(this.width, this.scales.x);
        var chart = this;
        var timeout;
        var format = d3.format('.2f');
        for (var i = 0; i < data.length; i++) {
            var series = data[i];
            var id = this.data.id(i);
            var accs = this.data.accs(i);
            this.canvas.selectAll('.' + id).remove();
            var g = this.canvas.append('g')
                .attr('class', id);
            g.selectAll('.' + id + '.line').data(series)
                .enter()
                .append('svg:line')
                .attr('clip-path', 'url(#clip-' + this.target + ')')
                .attr('x1', function (d) { 
                    return chart.scales.x(d[accs[0]]);
                })
                .attr('y1', function (d) { 
                    return chart.scales.y(d[accs[1]]);
                })
                .attr('x2', function (d) { 
                    return chart.scales.x(d[accs[0]]); 
                })
                .attr('y2', this.height)
                .style('stroke', this.colors.get(id))
                .each(function(d) {
                    if (d.annotation) {
                        g.append('text')
                            .attr('class', id + '.anno')
                            .attr('x', chart.scales.x(d[accs[0]]))
                            .attr('y', chart.scales.y(d[accs[1]]) - 5)
                            .attr('text-anchor', 'middle')
                            .attr('font-size', 'small')
                            .attr('fill', chart.colors.get(id))
                            .text(d.annotation);
                    }
                })
            .on('mouseover', function (d) {
                d3.select(this).style('stroke-width', 2);
                var pointer = d3.mouse(this);
                chart.tooltips
                    .style('display', 'inline');
                chart.tooltips
                    .transition()
                    .duration(300)
                    .style('opacity', 0.9);
                chart.tooltips
                    .style('left', pointer[0] + chart.opts.margins[3] + 10 + 'px')
                    .style('top', pointer[1] + chart.opts.margins[0] - 10 + 'px')
                    .style('opacity', 0.9)
                    .style('border', 'dashed')
                    .style('border-width', '1px')
                    .style('padding', '3px')
                    .style('border-radius', '10px')
                    .style('background-color', 'white');
                var x = format(d[accs[0]]);
                var y = format(d[accs[1]]);
                d3.selectAll('#tooltips-meta').html(
                    chart.opts.xlabel + ': ' + 
                    x + '<br/>' + chart.opts.ylabel + ': ' + y + '<br/>'
                );
                if (d.tooltip || d.tooltipmol) {
                    var tooltip = d3.selectAll('#tooltips-meta').html();
                    for (var key in d.tooltip) {
                        tooltip += key + ': ' + d.tooltip[key] + '<br/>';
                    }
                    d3.selectAll('#tooltips-meta').html(tooltip);
                    for (var molkey in d.tooltipmol) {
                        var spinner = st.util.spinner('#tooltips-mol');
                        timeout = setTimeout(function () {
                            spinner.css('display', 'none');
                            chart.mol2svg.draw(d.tooltipmol[molkey], '#tooltips-mol');
                        }, 500);
                    }
                } else {
                    d3.selectAll('#tooltips-mol').html('');
                }
            })
            .on('mouseout', function () {
                clearTimeout(timeout);
                d3.selectAll('#tooltips-mol').html('');
                d3.select(this).style('stroke-width', '1');
                chart.tooltips
                    .transition()
                    .duration(300)
                    .style('opacity', 0);
                chart.tooltips
                    .style('display', 'none');
            });
        }
    };
    
    return ms;
};