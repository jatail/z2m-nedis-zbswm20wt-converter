const fz = require('zigbee-herdsman-converters/converters/fromZigbee');
const tz = require('zigbee-herdsman-converters/converters/toZigbee');
const exposes = require('zigbee-herdsman-converters/lib/exposes');
const reporting = require('zigbee-herdsman-converters/lib/reporting');
const extend = require('zigbee-herdsman-converters/lib/extend');
const e = exposes.presets;
const ea = exposes.access;
const tuya = require('zigbee-herdsman-converters/lib/tuya');

const definition = {
    // Since a lot of TuYa devices use the same modelID, but use different datapoints
    // it's necessary to provide a fingerprint instead of a zigbeeModel
    // fingerprint: [
    //     {
    //         // The model ID from: Device with modelID 'TS0601' is not supported
    //         // You may need to add \u0000 at the end of the name in some cases
    //         modelID: 'TS0601',
    //         // The manufacturer name from: Device with modelID 'TS0601' is not supported.
    //         manufacturerName: '_TZE200_s6hzw8g2',
    //     },
    // ],
    fingerprint: tuya.fingerprint('TS0601', ['_TZE200_s6hzw8g2']),
    model: 'ZBSM20WT',
    vendor: 'Nedis',
    description: 'Nedis motion sensor',
    fromZigbee: [tuya.fz.datapoints],
    //fromZigbee: [fz.ias_occupancy_alarm_1, fz.ias_occupancy_alarm_1_report, fz.battery, fz.illuminance, fz.illuminance_lux],
    toZigbee: [tuya.tz.datapoints],
    onEvent: tuya.onEventSetTime, // Add this if you are getting no converter for 'commandMcuSyncTime'
    configure: tuya.configureMagicPacket,
    exposes: [
        // Here you should put all functionality that your device exposes
        e.occupancy(), e.illuminance().withUnit('lx'), e.battery(),
        e.enum('sensitivity', ea.STATE_SET, ['low', 'medium', 'high'])
            .withDescription('PIR sensor sensitivity (refresh and update only while active)'),
        e.enum('keep_time', ea.STATE_SET, ['10', '30', '60', '120'])
            .withDescription('PIR keep time in seconds (refresh and update only while active)'),
        e.numeric('illuminance_interval', ea.STATE_SET).withValueMin(1).withValueMax(720).withValueStep(1).withUnit('minutes')
            .withDescription('Brightness acquisition interval (refresh and update only while active)'),
    ],
    meta: {
        // All datapoints go in here
        tuyaDatapoints: [
            [1, 'occupancy', tuya.valueConverter.trueFalse0],
            [4, 'battery', tuya.valueConverter.raw],
            [9, 'sensitivity', tuya.valueConverterBasic.lookup({'low': tuya.enum(0), 'medium': tuya.enum(1), 'high': tuya.enum(2)})],
            [10, 'keep_time', tuya.valueConverterBasic.lookup(
                {'10': tuya.enum(0), '30': tuya.enum(1), '60': tuya.enum(2), '120': tuya.enum(3)})],
            [101, 'illuminance', tuya.valueConverter.raw],
            [102, 'illuminance_interval', tuya.valueConverter.raw],
        ],
    },
};

module.exports = definition;
