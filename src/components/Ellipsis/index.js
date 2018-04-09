import React, { Component } from 'react';
import { Tooltip } from 'antd';
import classNames from 'classnames';
import './index.less';

/* eslint react/no-did-mount-set-state: 0 */
/* eslint no-param-reassign: 0 */

const isSupportLineClamp = document.body.style.webkitLineClamp !== undefined;

export default class Ellipsis extends Component {

    static defaultProps = {
        tooltip: true,
        lines: 1,
        text: '',
    };

    constructor(props) {
        super(props);
        this.suffix = '...';
        this.state = {
            text: props.text,
            origin: props.text,
            showSuffix: false,
        };
    }

    componentDidMount() {
        if (this.root) {
            this.computeLine();
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.lines !== nextProps.lines) {
            this.computeLine();
        }
    }

    computeLine = () => {
        const { text } = this.state;
        const { lines } = this.props;
        if (lines > 0 && !isSupportLineClamp) {
            const lineHeight = +(getComputedStyle(this.root).lineHeight.replace('px', ''));
            this.root.style.maxHeight = lineHeight * (lines + 1) + 'px';
            this.bisection(lineHeight, text.length, text.length);
        }
    };

    bisection = (lineHeight, pos, end) => {
        const { origin, showSuffix } = this.state;
        const { lines } = this.props;

        this.setState({
            text: origin.substring(0, pos),
        }, () => {
            const curHeight = this.root.offsetHeight;
            const curLines = Math.round(curHeight / lineHeight);
            if (curLines > lines) {
                const end = pos;
                pos = parseInt(pos / 2);
                this.bisection(lineHeight, pos, end);
                !showSuffix && this.setState({ showSuffix: true });
            } else {
                const _pos = parseInt((end - pos) / 2) + pos;
                if (_pos !== pos) {
                    this.bisection(lineHeight, _pos, end);
                }
            }
        });
    }

    saveRoot = (n) => n && (this.root = n);

    render() {
        const { text, showSuffix } = this.state;
        const { lines, className, tooltip } = this.props;
        if (lines <= 0) return null;

        const cls = classNames('ellipsis', className, {
            'lineClamp': lines && isSupportLineClamp,
        });

        const id = `antd-pro-ellipsis-${`${new Date().getTime()}${Math.floor(Math.random() * 100)}`}`;

        // support document.body.style.webkitLineClamp
        if (isSupportLineClamp) {
            const style = `#${id}{-webkit-line-clamp:${lines};-webkit-box-orient: vertical;}`;
            return (
                <div
                    id={id}
                    className={cls}
                >
                    <style>{style}</style>
                    {
                        tooltip ? (
                            <Tooltip
                                title={this.props.text}
                                overlayStyle={{ wordBreak: 'break-all' }}
                            >
                                {text}
                            </Tooltip>
                        ) : text
                    }
                </div>
            );
        }

        const textNode = (
            <span
                ref={this.saveRoot}
                style={{ overflow: 'hidden' }}
            >
                {text + (showSuffix ? this.suffix : '')}
            </span>
        );

        if (tooltip) {
            return (
                <Tooltip
                    title={this.props.text}
                    overlayStyle={{ wordBreak: 'break-all' }}
                >
                    {textNode}
                </Tooltip>
            );
        };

        return textNode;
    }
}