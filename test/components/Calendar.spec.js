/**
 * @file Calendar单测
 * @author cxtom(cxtom2010@gmail.com)
 */

import React, {Component} from 'react';
import TestUtils from 'react-addons-test-utils';

import then from '../then';

import Calendar from '../../src/Calendar';
import Confirm from 'melon/Confirm';
import CalendarPanel from '../../src/calendar/Panel';

/* eslint-disable max-nested-callbacks */

describe('Calendar', () => {

    let component;
    let calendar;

    describe('basic', () => {

        beforeEach(() => {

            component = TestUtils.renderIntoDocument(
                <Calendar defaultValue="2016-01-13" />
            );

            calendar = TestUtils.findRenderedComponentWithType(component, Calendar);

        });

        afterEach(() => {
            component = calendar = null;
        });

        it('work', done => {

            expect(TestUtils.isCompositeComponent(component)).toBe(true);

            expect(calendar.state.date.getDate()).toBe(13);
            expect(calendar.state.date.getMonth()).toBe(0);
            expect(calendar.state.date.getFullYear()).toBe(2016);
            expect(calendar.state.open).toBe(false);

            TestUtils.Simulate.click(TestUtils.findRenderedDOMComponentWithTag(component, 'label'));

            then(() => {
                expect(calendar.state.open).toBe(true);
                done();
            });

        });

        it('onDateChange', done => {

            const date = new Date(2014, 5, 12);

            const panel = TestUtils.findRenderedComponentWithType(calendar, CalendarPanel);

            expect(TestUtils.isCompositeComponent(panel)).toBe(true);

            panel.onDateChange({date});

            then(() => {
                expect(calendar.state.date.getDate()).toBe(12);
                expect(calendar.state.date.getMonth()).toBe(5);
                expect(calendar.state.date.getFullYear()).toBe(2014);
                done();
            });

        });

        it('onConfirm', done => {

            const date = new Date(2014, 5, 12);

            const panel = TestUtils.findRenderedComponentWithType(calendar, CalendarPanel);
            const confirm = TestUtils.findRenderedComponentWithType(calendar, Confirm);

            TestUtils.Simulate.click(TestUtils.findRenderedDOMComponentWithTag(calendar, 'label'));

            panel.onDateChange({date});

            then(() => {
                confirm.props.onConfirm();
            })
            .then(() => {
                expect(calendar.getValue()).toBe('2014-06-12');
                expect(calendar.state.open).toBe(false);
                done();
            });

        });

        it('onCancel', done => {

            const date = new Date(2014, 5, 12);

            const panel = TestUtils.findRenderedComponentWithType(calendar, CalendarPanel);
            const confirm = TestUtils.findRenderedComponentWithType(calendar, Confirm);
            TestUtils.Simulate.click(TestUtils.findRenderedDOMComponentWithTag(component, 'label'));
            panel.onDateChange({date});

            then(() => {
                confirm.props.onCancel();
            })
            .then(() => {
                expect(calendar.getValue()).toBe('2016-01-13');
                expect(calendar.state.open).toBe(false);
                done();
            });

        });

    });

    it('autoConfirm', done => {

        const spy = jasmine.createSpy();

        component = TestUtils.renderIntoDocument(
            <Calendar
                value="2016-01-13"
                onChange={spy}
                autoConfirm />
        );

        calendar = TestUtils.findRenderedComponentWithType(component, Calendar);

        const date = new Date(2014, 5, 12);

        const panel = TestUtils.findRenderedComponentWithType(component, CalendarPanel);

        panel.onDateChange({date});

        then(() => {
            calendar.setState({value: '2014-06-12'});
        })
        .then(() => {
            expect(spy).toHaveBeenCalled();
            expect(calendar.getValue()).toBe('2014-06-12');
            panel.onDateChange({date});
        })
        .then(() => {
            expect(spy.calls.count()).toBe(1);
            done();
        });

    });

    it('controlled', done => {

        const changeSpy = jasmine.createSpy();

        class TestComponent extends Component {

            constructor(props) {
                super(props);
                this.state = {value: '2014-06-12'};
            }

            render() {
                return (
                    <Calendar
                        value={this.state.value}
                        autoConfirm={true}
                        onChange={e => {
                            this.setState({value: e.value});
                            changeSpy();
                        }} />
                );
            }
        }

        component = TestUtils.renderIntoDocument(
            <TestComponent />
        );

        calendar = TestUtils.findRenderedComponentWithType(component, Calendar);

        expect(calendar.getValue()).toEqual('2014-06-12');

        calendar.onDateChange({value: '2015-05-10'});

        then(() => {
            expect(calendar.getValue()).toEqual('2015-05-10');
            done();
        });

    });

});
