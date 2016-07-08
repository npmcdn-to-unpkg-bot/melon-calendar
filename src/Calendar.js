/**
 * @file melon/Calendar
 * @author cxtom<cxtom2010@gmail.com>
 */

import React, {PropTypes} from 'react';

import InputComponent from 'melon-core/InputComponent';
import {create} from 'melon-core/classname/cxBuilder';
import Validity from 'melon-core/Validity';
import {getNextValidity} from 'melon-core/util/syncPropsToState';

import Icon  from 'melon/Icon';
import Confirm from 'melon/Confirm';

import Panel from './calendar/Panel';
import * as DateTime from './util/date';

const cx = create('Calendar');

export default class Calendar extends InputComponent {

    constructor(props, context) {

        super(props, context);

        const value = this.state.value;

        this.onLabelClick = this.onLabelClick.bind(this);
        this.onConfirm = this.onConfirm.bind(this);
        this.onLabelClick = this.onLabelClick.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.onDateChange = this.onDateChange.bind(this);

        this.state = {

            ...this.state,

            // 缓存用户在 confirm 前的选中值
            date: value ? this.parseDate(value) : undefined,

            // 是否打开选择窗
            open: false

        };

    }

    getSyncUpdates(nextProps) {

        const {disabled, readOnly, customValidity, defaultValue} = nextProps;

        let value = nextProps.value ? nextProps.value : defaultValue;

        // 如果有值，那么就试着解析一下；否则设置为 null
        let date = value ? this.parseValue(value) : null;

        // 如果 date 为 null 或者是 invalid date，那么就用上默认值；
        // 否则就用解析出来的这个值
        date = !date || isNaN(date.getTime()) ? new Date() : date;

        const vilidity = getNextValidity(this, {value, disabled, customValidity});

        return {
            date,
            vilidity,
            value: (disabled || readOnly || !value) ? value : this.stringifyValue(date)
        };

    }

    /**
     * 格式化日期对象
     *
     * @param  {string} value 日期字符串
     * @return {Date}         转化后的日期对象
     * @private
     */
    parseValue(value) {
        return this.parseDate(value);
    }

    /**
     * 格式化日期
     *
     * @param {Date} rawValue 源日期对象
     * @param {string=} format 日期格式，默认为当前实例的dateFormat
     * @return {string} 格式化后的日期字符串
     * @private
     */
    stringifyValue(rawValue) {

        if (!DateTime.isDate(rawValue)) {
            return rawValue;
        }

        const dateFormat = this.props.dateFormat;

        return DateTime.format(rawValue, dateFormat);

    }

    parseDate(date) {

        if (typeof date !== 'string') {
            return date;
        }

        let format = this.props.dateFormat;

        return DateTime.parse(date, format);
    }

    getValue() {
        return this.stringifyValue(this.state.value);
    }

    /**
     * 点击textbox时触发
     *
     * @private
     */
    onLabelClick() {

        const {disabled, readOnly} = this.props;

        if (disabled || readOnly) {
            return;
        }

        this.setState({open: true});

    }

    /**
     * rawValue 在Calendar Dialog上点击确定或取消按钮触发
     *
     * @private
     */
    onConfirm() {

        let {value, date} = this.state;

        value = this.parseDate(value);

        if (value && DateTime.isEqualDate(date, this.parseDate(value))) {
            this.setState({open: false});
            return;
        }

        const newDate = date ? date : new Date();

        this.setState({open: false, date: newDate}, () => {

            super.onChange({
                type: 'change',
                target: this,
                value: this.stringifyValue(newDate)
            });

        });

    }

    onCancel() {
        this.setState({open: false});
    }

    onDateChange({value}) {

        this.setState(
            {date: this.parseDate(value)},
            this.props.autoConfirm ? () => this.onConfirm() : null
        );

    }

    render() {

        const {
            state,
            props
        } = this;

        const {
            lang,
            disabled,
            readOnly,
            size,
            name,
            placeholder,
            ...others
        } = props;

        const {value, validity} = state;

        let {begin, end} = props;

        begin = begin ? this.parseDate(begin) : null;
        end = end ? this.parseDate(end) : null;

        const {open, date} = state;
        const className = cx(props)
            .addStates({focus: open})
            .addStates(this.getStyleStates())
            .build();

        return (
            <div {...others} className={className}>
                <input
                    name={name}
                    ref="input"
                    type="hidden"
                    value={value}
                    disabled={disabled}
                    size={size} />
                <label onClick={(disabled || readOnly) ? null : this.onLabelClick}>
                    {value ? value : (
                        <span className={cx().part('label-placeholder').build()}>
                            {placeholder}
                        </span>
                    )}
                    <Icon icon='expand-more' />
                </label>
                <Validity validity={validity} />
                <Confirm
                    open={open}
                    variants={['calendar']}
                    onConfirm={this.onConfirm}
                    onCancel={this.onCancel}
                    size={size}
                    buttonVariants={['secondery', 'calendar']} >
                    <Panel
                        date={date}
                        begin={begin}
                        end={end}
                        lang={lang}
                        onChange={this.onDateChange} />
                </Confirm>
            </div>
        );

    }

}

Calendar.displayName = 'Calendar';

Calendar.LANG = {

    // 对于 '周' 的称呼
    week: '周',

    // 星期对应的顺序表示
    days: '日,一,二,三,四,五,六'

};

Calendar.defaultProps = {
    ...InputComponent.defaultProps,
    defaultValue: '',
    dateFormat: 'YYYY-MM-DD',
    lang: Calendar.LANG,
    placeholder: '请选择'
};

Calendar.propTypes = {

    ...InputComponent.propTypes,

    value: PropTypes.string,

    autoConfirm: PropTypes.bool,

    dateFormat: PropTypes.string,

    end: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.string
    ]),

    begin: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.string
    ]),

    lang: PropTypes.shape({
        week: PropTypes.string,
        days: PropTypes.string
    })

};

Calendar.childContextTypes = InputComponent.childContextTypes;

Calendar.contextTypes = InputComponent.contextTypes;

