import React, { Fragment, Component } from "react";
import PropTypes from "prop-types";
import './slider.css';

// *******************************************************
// SLIDER RAIL (no tooltips)
// *******************************************************

export function SliderRail({ getRailProps }) {
return (
    <Fragment>
    <div className="railOuterStyle" {...getRailProps()} />
    <div className="railInnerStyle" />
    </Fragment>
)
}

SliderRail.propTypes = {
getRailProps: PropTypes.func.isRequired,
}

// *******************************************************
// HANDLE COMPONENT
// *******************************************************

export class Handle extends Component {
state = {
    mouseOver: false,
}

onMouseEnter = () => {
    this.setState({ mouseOver: true })
}

onMouseLeave = () => {
    this.setState({ mouseOver: false })
}

render() {
    const {
    domain: [min, max],
    handle: { id, value, percent },
    disabled,
    getHandleProps,
    } = this.props

    return (
    <Fragment>
        <div
        style={{
            left: `${percent}%`,
            position: 'absolute',
            transform: 'translate(-50%, -50%)',
            WebkitTapHighlightColor: 'rgba(0,0,0,0)',
            width: 26,
            height: 42,
            cursor: 'pointer',
            // border: '1px solid grey',
            backgroundColor: 'none',
            zIndex: 0
        }}
        {...getHandleProps(id, {
            onMouseEnter: this.onMouseEnter,
            onMouseLeave: this.onMouseLeave,
        })}
        />
        <div
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        style={{
            left: `${percent}%`,
            position: 'absolute',
            transform: 'translate(-50%, -50%)',
            WebkitTapHighlightColor: 'rgba(0,0,0,0)',
            width: 2,
            height: 20,
            border: 0,   
            backgroundColor: disabled ? '#666' : '#000',
            zIndex: 0,
            pointerEvents: 'none'

        }}
        />
    </Fragment>
    )
}
}

Handle.propTypes = {
domain: PropTypes.array.isRequired,
handle: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    percent: PropTypes.number.isRequired,
}).isRequired,
getHandleProps: PropTypes.func.isRequired,
isActive: PropTypes.bool.isRequired,
disabled: PropTypes.bool,
}

Handle.defaultProps = {
disabled: false,
}

// *******************************************************
// TRACK COMPONENT
// *******************************************************
export function Track({ source, target, getTrackProps, disabled }) {
return (
    <div
    style={{
        position: 'absolute',
        transform: 'translate(0%, -50%)',
        height: 2,
        backgroundColor: disabled ? '#999' : '#000',
        borderRadius: 2,
        cursor: 'pointer',
        left: `${source.percent}%`,
        width: `${target.percent - source.percent}%`,
    }}
    {...getTrackProps()}
    />
)
}

Track.propTypes = {
source: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    percent: PropTypes.number.isRequired,
}).isRequired,
target: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    percent: PropTypes.number.isRequired,
}).isRequired,
getTrackProps: PropTypes.func.isRequired,
disabled: PropTypes.bool,
}

Track.defaultProps = {
disabled: false,
}

// *******************************************************
// TICK COMPONENT
// *******************************************************
export function Tick({ tick, count, format }) {
return (
    <div>
    <div
        style={{
        position: 'absolute',
        marginTop: 17,
        width: 1,
        height: 5,
        backgroundColor: 'rgb(0,0,0)',
        left: `${tick.percent}%`,
        }}
    />
    <div
        style={{
        position: 'absolute',
        marginTop: 25,
        fontSize: 10,
        textAlign: 'center',
        marginLeft: `${-(100 / count) / 2}%`,
        width: `${100 / count}%`,
        left: `${tick.percent}%`,
        }}
    >
        {format(tick.value)}
    </div>
    </div>
)
}

Tick.propTypes = {
tick: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    percent: PropTypes.number.isRequired,
}).isRequired,
count: PropTypes.number.isRequired,
format: PropTypes.func.isRequired,
}

Tick.defaultProps = {
format: d => d,
}